import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MathProblem } from '../../game/types';
import { buildHint } from '../../game/mathEngine';
import { soundEngine } from '../../audio/soundEngine';
import { HintVisual } from './HintVisual';

function makeProblem(a: number, b: number, op: '+' | '-'): MathProblem {
  const answer = op === '+' ? a + b : a - b;
  return {
    id: `${a}${op}${b}-1`,
    key: `${a}${op}${b}`,
    a,
    b,
    op,
    answer,
    inputMode: 'calculator',
    choices: [answer - 1, answer, answer + 1, answer + 2],
    hint: buildHint(a, b, op),
  };
}

describe('HintVisual', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(soundEngine, 'playTap').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playCount').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'speak').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'stopSpeech').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders count-on hint, reveals numbers on tap, and speaks aloud', () => {
    const problem = makeProblem(3, 6, '+'); // start 6, steps [7, 8, 9]
    render(
      <HintVisual
        problem={problem}
        counterEmoji="🎋"
        hintLevel={1}
        walkthroughTrigger={0}
      />
    );

    expect(screen.getByText('Start at 6, tap to count 3 more!')).toBeInTheDocument();
    const anchor = screen.getByRole('button', { name: 'Start at 6' });
    fireEvent.click(anchor);
    expect(soundEngine.playTap).toHaveBeenCalledTimes(1);
    expect(soundEngine.speak).toHaveBeenCalledWith('6', { rate: 0.92 });

    const step1 = screen.getByRole('button', { name: 'Tap to count step 1' });
    fireEvent.click(step1);
    expect(screen.getByRole('button', { name: 'Count 7' })).toBeInTheDocument();
    expect(soundEngine.playCount).toHaveBeenCalledWith(0);
    expect(soundEngine.speak).toHaveBeenCalledWith('7', { rate: 0.92 });

    // Hear Again in Step 1 speaks step1Spoken
    fireEvent.click(screen.getByRole('button', { name: /Hear Again/i }));
    expect(soundEngine.speak).toHaveBeenCalledWith(problem.hint.step1Spoken, { rate: 0.9 });
  });

  it('triggers onSixSevenEasterEgg when tapping 6 then 7 from anchor or between steps', () => {
    const onSixSeven = vi.fn();
    // Anchor 6 -> step 7
    const addProblem = makeProblem(2, 6, '+'); // start 6, steps [7, 8]
    const { unmount } = render(
      <HintVisual
        problem={addProblem}
        counterEmoji="⭐"
        hintLevel={1}
        walkthroughTrigger={0}
        onSixSevenEasterEgg={onSixSeven}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start at 6' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tap to count step 1' }));
    expect(onSixSeven).toHaveBeenCalledTimes(1);
    expect(soundEngine.playCount).not.toHaveBeenCalled();

    unmount();

    // Count-back where anchor is 7 and step 1 is 6 -> tapping step 6 then anchor 7 triggers easter egg
    const subProblem = makeProblem(7, 2, '-'); // start 7, steps [6, 5]
    render(
      <HintVisual
        problem={subProblem}
        counterEmoji="🥚"
        hintLevel={1}
        walkthroughTrigger={0}
        onSixSevenEasterEgg={onSixSeven}
      />
    );

    expect(screen.getByText('Start at 7, tap to count back 2!')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tap to count step 1' })); // 6
    fireEvent.click(screen.getByRole('button', { name: 'Start at 7' })); // 7
    expect(onSixSeven).toHaveBeenCalledTimes(2);
  });

  it('auto-plays guided spoken walkthrough at hintLevel 2 and replays on Hear Again', () => {
    const subProblem = makeProblem(10, 3, '-'); // start 10, steps [9, 8, 7]
    render(
      <HintVisual
        problem={subProblem}
        counterEmoji="🍓"
        hintLevel={2}
        walkthroughTrigger={1}
      />
    );

    // 20ms: speaks intro and pulses anchor
    act(() => vi.advanceTimersByTime(20));
    expect(soundEngine.speak).toHaveBeenCalledWith('Start at 10, count back!', { rate: 0.9 });
    expect(screen.getByRole('button', { name: 'Start at 10' })).toHaveClass('pulsing');

    // 1350ms: reveals step 0 (9)
    act(() => vi.advanceTimersByTime(1330));
    expect(screen.getByRole('button', { name: 'Count 9' })).toBeInTheDocument();
    expect(soundEngine.speak).toHaveBeenCalledWith('9', { rate: 0.9 });

    // +880ms: reveals step 1 (8)
    act(() => vi.advanceTimersByTime(880));
    expect(screen.getByRole('button', { name: 'Count 8' })).toBeInTheDocument();

    // +1080ms (1350 + 2*880 + 200 = 3310ms): pauses on final '?' item and prompts child
    act(() => vi.advanceTimersByTime(1080));
    expect(soundEngine.speak).toHaveBeenCalledWith(
      'Now what number comes next? Tap the last one to check!',
      { rate: 0.9 }
    );
    expect(screen.getByRole('button', { name: 'Tap to count step 3' })).toHaveClass('pulsing');

    // Hear Again replays guided walkthrough
    vi.mocked(soundEngine.stopSpeech).mockClear();
    fireEvent.click(screen.getByRole('button', { name: /Hear Again/i }));
    expect(soundEngine.stopSpeech).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(20));
    expect(screen.getByRole('button', { name: 'Tap to count step 1' })).toBeInTheDocument();
  });
});
