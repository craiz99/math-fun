import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AnswerState,
  DifficultyLevel,
  MathProblem,
  OperationMode,
  ReactionState,
  SquadId,
  StageGagState,
} from './types';
import {
  QUESTIONS_PER_SQUAD,
  SQUADS,
  SQUAD_ORDER,
  TOTAL_QUESTIONS,
  pickRandomLine,
  shuffleSquadOrder,
} from './squads';
import {
  generateGameSession,
  generateReplacementProblem,
} from './mathEngine';
import {
  SIX_SEVEN_SPEECH_BUBBLE,
  SIX_SEVEN_SPOKEN,
  isSixSevenEasterEgg,
} from './easterEggs';
import { soundEngine } from '../audio/soundEngine';

export type ScreenMode = 'home' | 'play' | 'win';

export function useMathGame() {
  const [screen, setScreen] = useState<ScreenMode>('home');
  const [opMode, setOpMode] = useState<OperationMode>('mix');
  const [level, setLevel] = useState<DifficultyLevel>(2);
  const [musicOn, setMusicOn] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);

  const [squadOrder, setSquadOrder] = useState<SquadId[]>(SQUAD_ORDER);
  const lastFirstSquadRef = useRef<SquadId | undefined>(undefined);

  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [typedValue, setTypedValue] = useState('');
  const typedValueRef = useRef('');
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [reaction, setReaction] = useState<ReactionState>('idle');
  const [speechText, setSpeechText] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(0);
  const [walkthroughTrigger, setWalkthroughTrigger] = useState(0);
  const [eliminatedChoices, setEliminatedChoices] = useState<number[]>([]);
  const [attemptsOnCurrent, setAttemptsOnCurrent] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [squadToast, setSquadToast] = useState<string | null>(null);
  const [gagState, setGagState] = useState<StageGagState>({ kind: 'none' });
  const [sixSevenJoke, setSixSevenJoke] = useState(false);

  const timersRef = useRef<number[]>([]);
  const jokeInputTimerRef = useRef<number | null>(null);
  const jokeEndTimerRef = useRef<number | null>(null);

  const updateTypedValue = useCallback((next: string) => {
    typedValueRef.current = next;
    setTypedValue(next);
  }, []);

  const clearJokeInputTimer = useCallback(() => {
    if (jokeInputTimerRef.current !== null) {
      window.clearTimeout(jokeInputTimerRef.current);
      jokeInputTimerRef.current = null;
    }
  }, []);

  const clearJokeTimers = useCallback(() => {
    clearJokeInputTimer();
    if (jokeEndTimerRef.current !== null) {
      window.clearTimeout(jokeEndTimerRef.current);
      jokeEndTimerRef.current = null;
    }
  }, [clearJokeInputTimer]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    clearJokeTimers();
  }, [clearJokeTimers]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const activeSquadIdx = Math.min(
    squadOrder.length - 1,
    Math.floor(questionIndex / QUESTIONS_PER_SQUAD)
  );
  const activeSquadId = squadOrder[activeSquadIdx] ?? SQUAD_ORDER[0];
  const activeSquad = SQUADS[activeSquadId];
  const currentProblem = problems[questionIndex] ?? null;

  const prepareQuestion = useCallback(
    (nextIdx: number, order: SquadId[]) => {
      clearJokeTimers();
      updateTypedValue('');
      setAnswerState('idle');
      setReaction('idle');
      setHintLevel(0);
      setEliminatedChoices([]);
      setAttemptsOnCurrent(0);
      setGagState({ kind: 'none' });
      setSixSevenJoke(false);

      const nextSquadId =
        order[Math.min(order.length - 1, Math.floor(nextIdx / QUESTIONS_PER_SQUAD))];
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

      // Stage-specific interactive gags appear on Question 2 of each squad!
      if (nextSquadId === 'chickens' && (stepInSquad === 1 || (stepInSquad === 2 && Math.random() < 0.45))) {
        schedule(() => {
          setGagState({ kind: 'raccoon-sneaking' });
          setSpeechText('Bawk! A sneaky raccoon! Tap him or solve the math!');
        }, 900);
      } else if (nextSquadId === 'popstars' && stepInSquad === 1) {
        schedule(() => {
          setGagState({ kind: 'gwima-arrives' });
          setSpeechText('Whoa! Gwi-Ma is here! Tap him or solve to blast him!');
          soundEngine.playGwimaArrival();
        }, 900);
      } else if (nextSquadId === 'pandas' && stepInSquad === 1) {
        schedule(() => {
          setGagState({ kind: 'panda-tower' });
          setSpeechText('Ooh! A giant wobbly bamboo tower!');
        }, 900);
      }
    },
    [clearJokeTimers, schedule, updateTypedValue]
  );

  const triggerSixSevenEasterEgg = useCallback(() => {
    clearJokeTimers();
    setAnswerState('joke');
    setSixSevenJoke(true);
    setReaction('happy');
    setSpeechText(SIX_SEVEN_SPEECH_BUBBLE);
    soundEngine.playSixSevenGiggle();
    soundEngine.speak(SIX_SEVEN_SPOKEN);

    jokeInputTimerRef.current = window.setTimeout(() => {
      jokeInputTimerRef.current = null;
      updateTypedValue('');
      setAnswerState((prev) => (prev === 'joke' ? 'idle' : prev));
    }, 1400);

    jokeEndTimerRef.current = window.setTimeout(() => {
      jokeEndTimerRef.current = null;
      setSixSevenJoke(false);
      setReaction((prev) => (prev === 'happy' ? 'idle' : prev));
      setSpeechText((prev) => (prev === SIX_SEVEN_SPEECH_BUBBLE ? null : prev));
    }, 3200);
  }, [clearJokeTimers, updateTypedValue]);

  const startNewGame = useCallback(
    (selectedLevel: DifficultyLevel = level, selectedOp: OperationMode = opMode) => {
      clearTimers();
      soundEngine.stopSpeech();
      soundEngine.unlock();
      soundEngine.setPartyBoost(false);
      soundEngine.playTap();

      const nextOrder = shuffleSquadOrder(lastFirstSquadRef.current);
      lastFirstSquadRef.current = nextOrder[0];
      setSquadOrder(nextOrder);

      const freshProblems = generateGameSession(selectedLevel, selectedOp, {
        count: TOTAL_QUESTIONS,
      });
      setProblems(freshProblems);
      setQuestionIndex(0);
      setFirstTryCount(0);
      setScreen('play');
      prepareQuestion(0, nextOrder);
    },
    [clearTimers, level, opMode, prepareQuestion]
  );

  const triggerStageGag = useCallback(() => {
    if (gagState.kind === 'raccoon-sneaking') {
      clearJokeTimers();
      setSixSevenJoke(false);
      setGagState({ kind: 'raccoon-chasing' });
      setSpeechText(null);
      soundEngine.playRaccoonChase();
      soundEngine.speak('Bawk! Peck attack! Shoo, raccoon!');
      schedule(() => {
        setGagState({ kind: 'raccoon-victory' });
        setSpeechText('HAHA! Hero Chickens sent that raccoon flying!!');
      }, 3150);
      return;
    }

    if (gagState.kind === 'gwima-arrives') {
      clearJokeTimers();
      setSixSevenJoke(false);
      setGagState({ kind: 'gwima-blasted' });
      setSpeechText(null);
      soundEngine.playGwimaBlast();
      soundEngine.speak('Star power! Pop blast! Bye bye, Gwi-Ma!');
      schedule(() => {
        setGagState({ kind: 'gwima-victory' });
        setSpeechText('WOOHOO!! Pop-Star Trio blasted Gwi-Ma away!!');
      }, 3100);
      return;
    }

    if (gagState.kind === 'panda-tower') {
      clearJokeTimers();
      setSixSevenJoke(false);
      setGagState({ kind: 'panda-rain' });
      setSpeechText(null);
      soundEngine.playBambooRain();
      soundEngine.speak('Rawr! I am big and scary! Whoa, bamboo rain! Nom nom nom!');
      schedule(() => {
        setGagState({ kind: 'none' });
        setSpeechText('Hehe! Delicious bamboo rain!!');
      }, 3100);
    }
  }, [clearJokeTimers, gagState.kind, schedule]);

  const advanceAfterCorrect = useCallback(
    (delayMs: number) => {
      schedule(() => {
        const nextIdx = questionIndex + 1;
        if (nextIdx >= problems.length) {
          setScreen('win');
          soundEngine.setPartyBoost(true);
          soundEngine.playWinFanfare();
          soundEngine.speak('You win!! Every single squad is cheering for you!!');
        } else {
          setQuestionIndex(nextIdx);
          prepareQuestion(nextIdx, squadOrder);
        }
      }, delayMs);
    },
    [prepareQuestion, problems.length, questionIndex, schedule, squadOrder]
  );

  const submitAnswer = useCallback(
    (guess: number) => {
      if (!currentProblem || answerState === 'correct') return;

      if (guess === currentProblem.answer) {
        clearJokeTimers();
        setSixSevenJoke(false);
        const stepInSquad = questionIndex % QUESTIONS_PER_SQUAD;
        setAnswerState('correct');

        if (attemptsOnCurrent === 0) {
          setFirstTryCount((c) => c + 1);
        }

        // JJ & Mikey Prank! On Q2 of JJ & Mikey, Mikey pretends they got it wrong, then JJ corrects him!
        if (activeSquadId === 'jjmikey' && stepInSquad === 1) {
          setGagState({ kind: 'mikey-prank' });
          setReaction('encourage');
          setSpeechText(null);
          soundEngine.playPrankFakeout();
          soundEngine.speak('Wait a second... wrong! Hehehe!');

          schedule(() => {
            setGagState({ kind: 'jj-corrects' });
            setReaction('happy');
            soundEngine.playCorrect();
            soundEngine.speak(
              `Mikey! Stop pranking! You got it right! The answer is ${currentProblem.answer}!`
            );
          }, 1800);

          advanceAfterCorrect(4300);
          return;
        }

        // Standard cheerful celebration (plus launching any active stage gag!)
        setReaction('happy');
        const cheer = pickRandomLine(
          activeSquad.correctLines,
          questionIndex + attemptsOnCurrent
        );
        setSpeechText(cheer);
        soundEngine.playCorrect();
        soundEngine.speak(`${cheer} ${currentProblem.answer}!`);

        const hasWaitingGag =
          gagState.kind === 'raccoon-sneaking' ||
          gagState.kind === 'gwima-arrives' ||
          gagState.kind === 'panda-tower';
        const isGagMidAction =
          gagState.kind === 'raccoon-chasing' ||
          gagState.kind === 'gwima-blasted' ||
          gagState.kind === 'panda-rain';

        if (hasWaitingGag) {
          schedule(() => triggerStageGag(), 450);
          advanceAfterCorrect(3900);
        } else if (isGagMidAction) {
          advanceAfterCorrect(2400);
        } else {
          advanceAfterCorrect(1500);
        }
        return;
      }

      if (isSixSevenEasterEgg(currentProblem, guess)) {
        triggerSixSevenEasterEgg();
        return;
      }

      clearJokeTimers();
      setSixSevenJoke(false);

      // Wrong answer: warm supportive encouragement + voice-guided counting hint
      setAnswerState('wrong');
      setReaction('encourage');
      setAttemptsOnCurrent((a) => a + 1);

      if (currentProblem.inputMode === 'choice') {
        setEliminatedChoices((prev) =>
          prev.includes(guess) ? prev : [...prev, guess]
        );
      }

      const nextHint: 1 | 2 = hintLevel === 0 ? 1 : 2;
      setHintLevel(nextHint);
      if (nextHint === 2) {
        setWalkthroughTrigger((n) => n + 1);
      }

      const encLine = pickRandomLine(
        activeSquad.encourageLines,
        attemptsOnCurrent + questionIndex
      );
      setSpeechText(encLine);
      soundEngine.playWrong();
      if (nextHint === 1) {
        soundEngine.speak(currentProblem.hint.step1Spoken, { rate: 0.9 });
      }

      schedule(() => {
        setAnswerState('idle');
        updateTypedValue('');
      }, 520);
    },
    [
      activeSquad,
      activeSquadId,
      advanceAfterCorrect,
      answerState,
      attemptsOnCurrent,
      clearJokeTimers,
      currentProblem,
      gagState.kind,
      hintLevel,
      questionIndex,
      schedule,
      triggerSixSevenEasterEgg,
      triggerStageGag,
      updateTypedValue,
    ]
  );

  const handleDigit = useCallback(
    (digit: string) => {
      if (answerState === 'correct') return;
      soundEngine.unlock();

      let nextValue: string;
      if (answerState === 'joke') {
        clearJokeInputTimer();
        setAnswerState('idle');
        nextValue = digit;
      } else {
        const current = typedValueRef.current;
        if (current.length >= 2) return;
        nextValue = current === '0' ? digit : current + digit;
      }

      updateTypedValue(nextValue);

      if (isSixSevenEasterEgg(currentProblem, nextValue)) {
        triggerSixSevenEasterEgg();
        return;
      }

      soundEngine.playTap();
    },
    [answerState, clearJokeInputTimer, currentProblem, triggerSixSevenEasterEgg, updateTypedValue]
  );

  const handleBackspace = useCallback(() => {
    if (answerState === 'correct') return;
    if (answerState === 'joke') {
      clearJokeInputTimer();
      setAnswerState('idle');
    }
    soundEngine.playTap();
    updateTypedValue(typedValueRef.current.slice(0, -1));
  }, [answerState, clearJokeInputTimer, updateTypedValue]);

  const handleCalcSubmit = useCallback(() => {
    if (answerState === 'joke') return;
    const current = typedValueRef.current;
    if (current.length === 0) return;
    submitAnswer(Number(current));
  }, [answerState, submitAnswer]);

  const handleSelectChoice = useCallback(
    (choice: number) => {
      soundEngine.unlock();
      soundEngine.playTap();
      updateTypedValue(String(choice));
      submitAnswer(choice);
    },
    [submitAnswer, updateTypedValue]
  );

  const handleRequestHint = useCallback(() => {
    if (!currentProblem) return;
    clearJokeTimers();
    setSixSevenJoke(false);
    if (answerState === 'joke') {
      setAnswerState('idle');
      updateTypedValue('');
    }
    soundEngine.unlock();
    soundEngine.playTap();
    const nextHint: 1 | 2 = hintLevel === 0 ? 1 : 2;
    setHintLevel(nextHint);
    setReaction('encourage');
    setSpeechText('Let’s count together!');
    if (nextHint === 1) {
      soundEngine.speak(currentProblem.hint.step1Spoken, { rate: 0.9 });
    } else {
      setWalkthroughTrigger((n) => n + 1);
    }
  }, [answerState, clearJokeTimers, currentProblem, hintLevel, updateTypedValue]);

  const handleNewProblem = useCallback(() => {
    if (!currentProblem || answerState === 'correct') return;
    clearJokeTimers();
    setSixSevenJoke(false);
    soundEngine.unlock();
    soundEngine.stopSpeech();
    soundEngine.playTap();

    const exclude = new Set(problems.map((p) => p.key));
    const replacement = generateReplacementProblem(
      level,
      opMode,
      exclude,
      currentProblem.inputMode
    );

    setProblems((prev) => prev.map((p, idx) => (idx === questionIndex ? replacement : p)));
    updateTypedValue('');
    setAnswerState('idle');
    setReaction('idle');
    setHintLevel(0);
    setEliminatedChoices([]);
    setAttemptsOnCurrent(0);
    setSpeechText('Fresh problem! You got this!');
    soundEngine.speak(`Here is a fresh one! ${replacement.hint.equationSpoken}`);
  }, [
    answerState,
    clearJokeTimers,
    currentProblem,
    level,
    opMode,
    problems,
    questionIndex,
    updateTypedValue,
  ]);

  const handleReadEquation = useCallback(() => {
    if (!currentProblem) return;
    soundEngine.unlock();
    soundEngine.playTap();
    soundEngine.speak(currentProblem.hint.equationSpoken, { rate: 0.9 });
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
    setSixSevenJoke(false);
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
    squadOrder,
    questionIndex,
    activeSquadId,
    activeSquad,
    currentProblem,
    typedValue,
    answerState,
    reaction,
    speechText,
    hintLevel,
    walkthroughTrigger,
    eliminatedChoices,
    firstTryCount,
    squadToast,
    gagState,
    sixSevenJoke,
    startNewGame,
    triggerStageGag,
    handleDigit,
    handleBackspace,
    handleCalcSubmit,
    handleSelectChoice,
    handleRequestHint,
    handleNewProblem,
    handleReadEquation,
    toggleMusic,
    toggleVoice,
    goHome,
    selectOp,
    selectLevel,
  };
}
