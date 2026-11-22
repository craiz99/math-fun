import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  DifficultyLevel,
  MathProblem,
  OperationMode,
  ReactionState,
} from './types';
import {
  QUESTIONS_PER_SQUAD,
  SQUADS,
  SQUAD_ORDER,
  TOTAL_QUESTIONS,
  pickRandomLine,
} from './squads';
import { generateGameSession } from './mathEngine';
import { soundEngine } from '../audio/soundEngine';
import type { RaccoonEventPhase } from '../components/characters/SquadStage';

export type ScreenMode = 'home' | 'play' | 'win';

export function useMathGame() {
  const [screen, setScreen] = useState<ScreenMode>('home');
  const [opMode, setOpMode] = useState<OperationMode>('mix');
  const [level, setLevel] = useState<DifficultyLevel>(2);
  const [musicOn, setMusicOn] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);

  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [typedValue, setTypedValue] = useState('');
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [reaction, setReaction] = useState<ReactionState>('idle');
  const [speechText, setSpeechText] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(0);
  const [eliminatedChoices, setEliminatedChoices] = useState<number[]>([]);
  const [attemptsOnCurrent, setAttemptsOnCurrent] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [squadToast, setSquadToast] = useState<string | null>(null);
  const [raccoonPhase, setRaccoonPhase] = useState<RaccoonEventPhase>('none');

  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const activeSquadIdx = Math.min(
    SQUAD_ORDER.length - 1,
    Math.floor(questionIndex / QUESTIONS_PER_SQUAD)
  );
  const activeSquadId = SQUAD_ORDER[activeSquadIdx];
  const activeSquad = SQUADS[activeSquadId];
  const currentProblem = problems[questionIndex] ?? null;

  const prepareQuestion = useCallback(
    (nextIdx: number) => {
      setTypedValue('');
      setAnswerState('idle');
      setReaction('idle');
      setHintLevel(0);
      setEliminatedChoices([]);
      setAttemptsOnCurrent(0);

      const nextSquadId =
        SQUAD_ORDER[
          Math.min(SQUAD_ORDER.length - 1, Math.floor(nextIdx / QUESTIONS_PER_SQUAD))
        ];
      const stepInSquad = nextIdx % QUESTIONS_PER_SQUAD;

      if (stepInSquad === 0) {
        const squad = SQUADS[nextSquadId];
        setSquadToast(`${squad.badgeEmoji} ${squad.name} Time!`);
        setSpeechText(squad.introLine);
        soundEngine.speak(squad.introLine);
        schedule(() => setSquadToast(null), 2000);
      } else {
        setSpeechText(null);
      }

      // Guaranteed raccoon sneak on Chicken Q2, plus 50% surprise chance on Q3!
      const shouldSneak =
        nextSquadId === 'chickens' &&
        (stepInSquad === 1 || (stepInSquad === 2 && Math.random() < 0.5));

      setRaccoonPhase('none');
      if (shouldSneak) {
        schedule(() => {
          setRaccoonPhase('sneaking');
          setSpeechText('Bawk! A sneaky raccoon! Tap him or solve the math!');
        }, 900);
      }
    },
    [schedule]
  );

  const startNewGame = useCallback(
    (selectedLevel: DifficultyLevel = level, selectedOp: OperationMode = opMode) => {
      clearTimers();
      soundEngine.stopSpeech();
      soundEngine.unlock();
      soundEngine.setPartyBoost(false);
      soundEngine.playTap();

      const freshProblems = generateGameSession(selectedLevel, selectedOp, {
        count: TOTAL_QUESTIONS,
      });
      setProblems(freshProblems);
      setQuestionIndex(0);
      setFirstTryCount(0);
      setScreen('play');
      prepareQuestion(0);
    },
    [clearTimers, level, opMode, prepareQuestion]
  );

  const triggerRaccoonChase = useCallback(() => {
    setRaccoonPhase('chasing');
    setSpeechText(null);
    soundEngine.playRaccoonChase();
    soundEngine.speak('Bawk! Peck attack! Shoo, raccoon!');

    schedule(() => {
      setRaccoonPhase('victory');
      setSpeechText('HAHA! Hero Chickens sent that raccoon flying!!');
    }, 3150);
  }, [schedule]);

  const submitAnswer = useCallback(
    (guess: number) => {
      if (!currentProblem || answerState === 'correct') return;

      if (guess === currentProblem.answer) {
        setAnswerState('correct');
        setReaction('happy');
        const cheer = pickRandomLine(
          activeSquad.correctLines,
          questionIndex + attemptsOnCurrent
        );
        setSpeechText(cheer);
        soundEngine.playCorrect();
        soundEngine.speak(`${cheer} ${currentProblem.answer}!`);

        if (attemptsOnCurrent === 0) {
          setFirstTryCount((c) => c + 1);
        }

        const shouldLaunchChase =
          activeSquadId === 'chickens' && raccoonPhase === 'sneaking';
        if (shouldLaunchChase) {
          schedule(() => triggerRaccoonChase(), 420);
        }

        const advanceDelay = shouldLaunchChase
          ? 3850
          : raccoonPhase === 'chasing'
            ? 2400
            : 1450;

        schedule(() => {
          const nextIdx = questionIndex + 1;
          if (nextIdx >= problems.length) {
            setScreen('win');
            soundEngine.setPartyBoost(true);
            soundEngine.playWinFanfare();
            soundEngine.speak('You win!! Every single squad is cheering for you!!');
          } else {
            setQuestionIndex(nextIdx);
            prepareQuestion(nextIdx);
          }
        }, advanceDelay);
        return;
      }

      // Wrong answer: warm supportive encouragement + progressive visual hint
      setAnswerState('wrong');
      setReaction('encourage');
      setAttemptsOnCurrent((a) => a + 1);

      if (currentProblem.inputMode === 'choice') {
        setEliminatedChoices((prev) =>
          prev.includes(guess) ? prev : [...prev, guess]
        );
      }

      setHintLevel((prev) => (prev === 0 ? 1 : 2));
      const encLine = pickRandomLine(
        activeSquad.encourageLines,
        attemptsOnCurrent + questionIndex
      );
      setSpeechText(encLine);
      soundEngine.playWrong();
      soundEngine.speak(`${encLine} ${currentProblem.hint.step1Text}`);

      schedule(() => {
        setAnswerState('idle');
        setTypedValue('');
      }, 520);
    },
    [
      activeSquad,
      activeSquadId,
      answerState,
      attemptsOnCurrent,
      currentProblem,
      prepareQuestion,
      problems.length,
      questionIndex,
      raccoonPhase,
      schedule,
      triggerRaccoonChase,
    ]
  );

  const handleDigit = useCallback(
    (digit: string) => {
      if (answerState === 'correct') return;
      soundEngine.unlock();
      soundEngine.playTap();
      setTypedValue((prev) => {
        if (prev.length >= 2) return prev;
        return prev === '0' ? digit : prev + digit;
      });
    },
    [answerState]
  );

  const handleBackspace = useCallback(() => {
    if (answerState === 'correct') return;
    soundEngine.playTap();
    setTypedValue((prev) => prev.slice(0, -1));
  }, [answerState]);

  const handleCalcSubmit = useCallback(() => {
    if (typedValue.length === 0) return;
    submitAnswer(Number(typedValue));
  }, [submitAnswer, typedValue]);

  const handleSelectChoice = useCallback(
    (choice: number) => {
      soundEngine.unlock();
      soundEngine.playTap();
      setTypedValue(String(choice));
      submitAnswer(choice);
    },
    [submitAnswer]
  );

  const handleRequestHint = useCallback(() => {
    if (!currentProblem) return;
    soundEngine.playTap();
    setHintLevel((prev) => (prev === 0 ? 1 : 2));
    setReaction('encourage');
    setSpeechText(currentProblem.hint.strategyTitle);
    soundEngine.speak(currentProblem.hint.step1Text);
  }, [currentProblem]);

  // Desktop keyboard convenience alongside iPad touch keypad
  useEffect(() => {
    if (screen !== 'play' || !currentProblem || currentProblem.inputMode !== 'calculator') {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
      else if (e.key === 'Backspace') handleBackspace();
      else if (e.key === 'Enter') handleCalcSubmit();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, currentProblem, handleDigit, handleBackspace, handleCalcSubmit]);

  const toggleMusic = useCallback(() => {
    setMusicOn((prev) => {
      const next = !prev;
      soundEngine.setMusicEnabled(next);
      return next;
    });
  }, []);

  const toggleVoice = useCallback(() => {
    setVoiceOn((prev) => {
      const next = !prev;
      soundEngine.setVoiceEnabled(next);
      return next;
    });
  }, []);

  const goHome = useCallback(() => {
    clearTimers();
    soundEngine.stopSpeech();
    soundEngine.setPartyBoost(false);
    soundEngine.playTap();
    setScreen('home');
  }, [clearTimers]);

  const selectOp = useCallback((mode: OperationMode) => {
    soundEngine.unlock();
    soundEngine.playTap();
    setOpMode(mode);
  }, []);

  const selectLevel = useCallback((lvl: DifficultyLevel) => {
    soundEngine.unlock();
    soundEngine.playTap();
    setLevel(lvl);
  }, []);

  return {
    screen,
    opMode,
    level,
    musicOn,
    voiceOn,
    questionIndex,
    activeSquadId,
    activeSquad,
    currentProblem,
    typedValue,
    answerState,
    reaction,
    speechText,
    hintLevel,
    eliminatedChoices,
    firstTryCount,
    squadToast,
    raccoonPhase,
    startNewGame,
    triggerRaccoonChase,
    handleDigit,
    handleBackspace,
    handleCalcSubmit,
    handleSelectChoice,
    handleRequestHint,
    toggleMusic,
    toggleVoice,
    goHome,
    selectOp,
    selectLevel,
  };
}
