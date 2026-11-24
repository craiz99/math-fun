import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MathProblem, SquadId } from './types';
import { buildHint } from './mathEngine';
import * as mathEngine from './mathEngine';
import * as squads from './squads';
import { soundEngine } from '../audio/soundEngine';
import { SIX_SEVEN_SPEECH_BUBBLE, SIX_SEVEN_SPOKEN } from './easterEggs';
import { useMathGame } from './useMathGame';

function makeProblem(
  idx: number,
  a: number,
  b: number,
  op: '+' | '-',
  inputMode: 'calculator' | 'choice' = 'calculator'
): MathProblem {
  const answer = op === '+' ? a + b : a - b;
  const key = `${a}${op}${b}`;
  return {
    id: `${key}-${idx}`,
    key,
    a,
    b,
    op,
    answer,
    inputMode,
    choices: [Math.max(0, answer - 2), Math.max(0, answer - 1), answer, answer + 1],
    hint: buildHint(a, b, op),
  };
}

function create12Problems(): MathProblem[] {
  return [
    // Squad 0 (0..2)
    makeProblem(0, 4, 3, '+', 'calculator'), // ans 7
    makeProblem(1, 9, 4, '-', 'calculator'), // ans 5
    makeProblem(2, 5, 6, '+', 'choice'),     // ans 11
    // Squad 1 (3..5)
    makeProblem(3, 8, 2, '-', 'calculator'), // ans 6
    makeProblem(4, 3, 5, '+', 'calculator'), // ans 8
    makeProblem(5, 10, 3, '-', 'choice'),    // ans 7
    // Squad 2 (6..8)
    makeProblem(6, 6, 3, '+', 'calculator'), // ans 9
    makeProblem(7, 11, 5, '-', 'calculator'), // ans 6
    makeProblem(8, 4, 4, '+', 'choice'),     // ans 8
    // Squad 3 (9..11)
    makeProblem(9, 12, 4, '-', 'calculator'), // ans 8
    makeProblem(10, 7, 5, '+', 'calculator'), // ans 12
    makeProblem(11, 9, 2, '-', 'choice'),     // ans 7
  ];
}

describe('useMathGame', () => {
  const FIXED_ORDER: SquadId[] = ['pandas', 'chickens', 'jjmikey', 'popstars'];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(soundEngine, 'unlock').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'stopSpeech').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'setPartyBoost').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'setMusicEnabled').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'setVoiceEnabled').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playTap').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playCorrect').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playWrong').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playSixSevenGiggle').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playRaccoonChase').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playGwimaArrival').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playGwimaBlast').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playBambooRain').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playPrankFakeout').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playWinFanfare').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'speak').mockImplementation(() => {});
    vi.spyOn(squads, 'shuffleSquadOrder').mockReturnValue([...FIXED_ORDER]);
    vi.spyOn(mathEngine, 'generateGameSession').mockReturnValue(create12Problems());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts on home screen, updates options and audio toggles, and starts a game', () => {
    const { result } = renderHook(() => useMathGame());

    expect(result.current.screen).toBe('home');
    expect(result.current.opMode).toBe('mix');
    expect(result.current.level).toBe(2);
    expect(result.current.musicOn).toBe(true);
    expect(result.current.voiceOn).toBe(true);

    act(() => {
      result.current.selectOp('add');
      result.current.selectLevel(1);
      result.current.toggleMusic();
      result.current.toggleVoice();
    });

    expect(result.current.opMode).toBe('add');
    expect(result.current.level).toBe(1);
    expect(result.current.musicOn).toBe(false);
    expect(result.current.voiceOn).toBe(false);
    expect(soundEngine.setMusicEnabled).toHaveBeenCalledWith(false);
    expect(soundEngine.setVoiceEnabled).toHaveBeenCalledWith(false);

    act(() => {
      result.current.startNewGame(1, 'add');
    });

    expect(result.current.screen).toBe('play');
    expect(result.current.activeSquadId).toBe('pandas');
    expect(result.current.squadToast).toContain('Panda Pals');
    expect(result.current.currentProblem?.key).toBe('4+3');

    // Toast clears after 2000ms
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.squadToast).toBeNull();

    // goHome resets back to home screen and stops speech
    act(() => {
      result.current.goHome();
    });
    expect(result.current.screen).toBe('home');
    expect(soundEngine.stopSpeech).toHaveBeenCalled();
  });

  it('handles calculator digits, leading zero, backspace, wrong attempts, hint escalation, and keyboard shortcuts', () => {
    const { result } = renderHook(() => useMathGame());
    act(() => result.current.startNewGame());

    // Leading zero replaced by next digit, max 2 digits
    act(() => result.current.handleDigit('0'));
    expect(result.current.typedValue).toBe('0');
    act(() => result.current.handleDigit('5'));
    expect(result.current.typedValue).toBe('5');
    act(() => result.current.handleDigit('2'));
    expect(result.current.typedValue).toBe('52');
    act(() => result.current.handleDigit('9'));
    expect(result.current.typedValue).toBe('52');

    act(() => result.current.handleBackspace());
    expect(result.current.typedValue).toBe('5');

    // Submitting wrong answer escalates hint to 1, plays wrong SFX, and clears after 520ms
    act(() => result.current.handleCalcSubmit());
    expect(result.current.answerState).toBe('wrong');
    expect(result.current.reaction).toBe('encourage');
    expect(result.current.hintLevel).toBe(1);
    expect(soundEngine.playWrong).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(520));
    expect(result.current.answerState).toBe('idle');
    expect(result.current.typedValue).toBe('');

    // Empty submit is ignored
    act(() => result.current.handleCalcSubmit());
    expect(soundEngine.playWrong).toHaveBeenCalledTimes(1);

    // Second wrong attempt escalates hint to 2 and increments walkthroughTrigger
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '9' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '8' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });
    expect(result.current.hintLevel).toBe(2);
    expect(result.current.walkthroughTrigger).toBe(1);

    act(() => vi.advanceTimersByTime(520));

    // Correct answer via keyboard advances after 1500ms, without incrementing firstTryCount (had prior wrong attempts)
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '7' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });
    expect(result.current.answerState).toBe('correct');
    expect(result.current.firstTryCount).toBe(0);

    // Duplicate digits / backspace while correct are ignored
    act(() => {
      result.current.handleDigit('1');
      result.current.handleBackspace();
    });
    expect(result.current.typedValue).toBe('7');

    act(() => vi.advanceTimersByTime(1500));
    expect(result.current.questionIndex).toBe(1);
  });

  it('triggers the 6-7 meme easter egg when typing 67 and via the counting helper', () => {
    const { result } = renderHook(() => useMathGame());
    act(() => result.current.startNewGame());

    act(() => {
      result.current.handleDigit('6');
      result.current.handleDigit('7');
    });

    expect(result.current.answerState).toBe('joke');
    expect(result.current.sixSevenJoke).toBe(true);
    expect(result.current.speechText).toBe(SIX_SEVEN_SPEECH_BUBBLE);
    expect(soundEngine.playSixSevenGiggle).toHaveBeenCalledTimes(1);
    expect(soundEngine.speak).toHaveBeenCalledWith(SIX_SEVEN_SPOKEN);

    // Submitting during joke state is ignored
    act(() => result.current.handleCalcSubmit());
    expect(soundEngine.playWrong).not.toHaveBeenCalled();

    // Slot clears at 1400ms, joke clears at 3200ms
    act(() => vi.advanceTimersByTime(1400));
    expect(result.current.typedValue).toBe('');
    expect(result.current.answerState).toBe('idle');
    expect(result.current.sixSevenJoke).toBe(true);

    act(() => vi.advanceTimersByTime(1800));
    expect(result.current.sixSevenJoke).toBe(false);
    expect(result.current.speechText).toBeNull();

    // Typing a digit or backspace during joke interrupts the slot timer cleanly
    act(() => {
      result.current.handleDigit('6');
      result.current.handleDigit('7');
    });
    expect(result.current.answerState).toBe('joke');
    act(() => result.current.handleDigit('3'));
    expect(result.current.answerState).toBe('idle');
    expect(result.current.typedValue).toBe('3');

    act(() => {
      result.current.handleBackspace();
      result.current.handleDigit('6');
      result.current.handleDigit('7');
    });
    expect(result.current.answerState).toBe('joke');
    act(() => result.current.handleBackspace());
    expect(result.current.answerState).toBe('idle');
    expect(result.current.typedValue).toBe('6');

    // Hint counting helper 6->7 triggers joke without changing answerState to 'joke'
    act(() => result.current.handleHintSixSevenEasterEgg());
    expect(result.current.sixSevenJoke).toBe(true);
    expect(result.current.answerState).toBe('idle');
  });

  it('handles hint requests, read equation, and New problem replacement', () => {
    const replacement = makeProblem(99, 2, 6, '+', 'calculator');
    vi.spyOn(mathEngine, 'generateReplacementProblem').mockReturnValue(replacement);

    const { result } = renderHook(() => useMathGame());
    act(() => result.current.startNewGame());

    act(() => result.current.handleReadEquation());
    expect(soundEngine.speak).toHaveBeenCalledWith('What is 4 plus 3?', { rate: 0.9 });

    // Request hint once -> level 1; again -> level 2 + walkthroughTrigger
    act(() => result.current.handleRequestHint());
    expect(result.current.hintLevel).toBe(1);
    act(() => result.current.handleRequestHint());
    expect(result.current.hintLevel).toBe(2);
    expect(result.current.walkthroughTrigger).toBe(1);

    // Replace problem via New button
    act(() => result.current.handleNewProblem());
    expect(result.current.currentProblem?.key).toBe('2+6');
    expect(result.current.hintLevel).toBe(0);
    expect(result.current.typedValue).toBe('');
    expect(result.current.speechText).toBe('Fresh problem! You got this!');
  });

  it('eliminates wrong choices in multiple-choice mode and prevents duplicate eliminations', () => {
    const { result } = renderHook(() => useMathGame());
    act(() => result.current.startNewGame());

    // Advance to Q3 (index 2, which is choice mode: 5 + 6 = 11)
    act(() => {
      result.current.handleDigit('7');
      result.current.handleCalcSubmit();
    });
    act(() => vi.advanceTimersByTime(1500));

    // Q2 is panda-tower; solve without waiting for gag to advance cleanly
    act(() => {
      result.current.handleDigit('5');
      result.current.handleCalcSubmit();
    });
    act(() => vi.advanceTimersByTime(1500));

    expect(result.current.questionIndex).toBe(2);
    expect(result.current.currentProblem?.inputMode).toBe('choice');

    // Select wrong choice 9 twice
    act(() => result.current.handleSelectChoice(9));
    expect(result.current.eliminatedChoices).toEqual([9]);
    act(() => vi.advanceTimersByTime(520));
    act(() => result.current.handleSelectChoice(9));
    expect(result.current.eliminatedChoices).toEqual([9]);
  });

  it('triggers all 4 squad gags (Panda tower, Raccoon chase, Mikey prank, Gwi-Ma blast) and reaches win screen', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9); // Avoid random raccoon on Q3 of chickens
    const { result } = renderHook(() => useMathGame());
    act(() => result.current.startNewGame());

    const solveCurrent = () => {
      const p = result.current.currentProblem!;
      if (p.inputMode === 'calculator') {
        for (const ch of String(p.answer)) {
          result.current.handleDigit(ch);
        }
        result.current.handleCalcSubmit();
      } else {
        result.current.handleSelectChoice(p.answer);
      }
    };

    // --- SQUAD 0: PANDAS ---
    // Q0: standard solve (first try)
    act(solveCurrent);
    expect(result.current.firstTryCount).toBe(1);
    act(() => vi.advanceTimersByTime(1500));

    // Q1 (step 1): Panda tower appears at 900ms -> tap bamboo tower -> panda-rain -> none
    expect(result.current.questionIndex).toBe(1);
    act(() => vi.advanceTimersByTime(900));
    expect(result.current.gagState).toEqual({ kind: 'panda-tower' });

    act(() => result.current.triggerStageGag());
    expect(result.current.gagState).toEqual({ kind: 'panda-rain' });
    expect(soundEngine.playBambooRain).toHaveBeenCalledTimes(1);

    // Solve while gag is mid-action (advances in 2400ms)
    act(solveCurrent);
    act(() => vi.advanceTimersByTime(2400));

    // Q2: solve choice
    expect(result.current.questionIndex).toBe(2);
    act(solveCurrent);
    act(() => vi.advanceTimersByTime(1500));

    // --- SQUAD 1: CHICKENS ---
    // Q3 (step 0)
    expect(result.current.activeSquadId).toBe('chickens');
    act(solveCurrent);
    act(() => vi.advanceTimersByTime(1500));

    // Q4 (step 1): Raccoon sneaks in at 900ms; solving while waiting auto-launches gag at 450ms and advances at 3900ms
    act(() => vi.advanceTimersByTime(900));
    expect(result.current.gagState).toEqual({ kind: 'raccoon-sneaking' });
    act(solveCurrent);
    act(() => vi.advanceTimersByTime(450));
    expect(result.current.gagState).toEqual({ kind: 'raccoon-chasing' });
    expect(soundEngine.playRaccoonChase).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(3150));
    expect(result.current.gagState).toEqual({ kind: 'raccoon-victory' });
    act(() => vi.advanceTimersByTime(400));

    // Q5 (step 2)
    expect(result.current.questionIndex).toBe(5);
    act(solveCurrent);
    act(() => vi.advanceTimersByTime(1500));

    // --- SQUAD 2: JJ & MIKEY ---
    // Q6 (step 0)
    expect(result.current.activeSquadId).toBe('jjmikey');
    act(solveCurrent);
    act(() => vi.advanceTimersByTime(1500));

    // Q7 (step 1): Mikey prank fakeout -> JJ corrects at 1800ms -> advances at 4300ms
    act(solveCurrent);
    expect(result.current.gagState).toEqual({ kind: 'mikey-prank' });
    expect(soundEngine.playPrankFakeout).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(1800));
    expect(result.current.gagState).toEqual({ kind: 'jj-corrects' });
    act(() => vi.advanceTimersByTime(2500));

    // Q8 (step 2)
    expect(result.current.questionIndex).toBe(8);
    act(solveCurrent);
    act(() => vi.advanceTimersByTime(1500));

    // --- SQUAD 3: POPSTARS ---
    // Q9 (step 0)
    expect(result.current.activeSquadId).toBe('popstars');
    act(solveCurrent);
    act(() => vi.advanceTimersByTime(1500));

    // Q10 (step 1): Gwi-Ma arrives at 900ms -> tap to blast -> victory at 3100ms
    act(() => vi.advanceTimersByTime(900));
    expect(result.current.gagState).toEqual({ kind: 'gwima-arrives' });
    expect(soundEngine.playGwimaArrival).toHaveBeenCalledTimes(1);
    act(() => result.current.triggerStageGag());
    expect(result.current.gagState).toEqual({ kind: 'gwima-blasted' });
    expect(soundEngine.playGwimaBlast).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(3100));
    expect(result.current.gagState).toEqual({ kind: 'gwima-victory' });
    act(solveCurrent);
    act(() => vi.advanceTimersByTime(1500));

    // Q11 (final question!) -> transitions to win screen
    expect(result.current.questionIndex).toBe(11);
    act(solveCurrent);
    act(() => vi.advanceTimersByTime(1500));

    expect(result.current.screen).toBe('win');
    expect(result.current.firstTryCount).toBe(12);
    expect(soundEngine.setPartyBoost).toHaveBeenCalledWith(true);
    expect(soundEngine.playWinFanfare).toHaveBeenCalledTimes(1);
  });
});
