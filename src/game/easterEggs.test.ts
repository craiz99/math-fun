import { describe, expect, it } from 'vitest';
import {
  SIX_SEVEN_SPEECH_BUBBLE,
  SIX_SEVEN_SPOKEN,
  isSixSevenEasterEgg,
  isSixSevenSequence,
} from './easterEggs';

describe('6 7 meme easter egg', () => {
  it('triggers in calculator mode when the player enters 67 and the answer is not 67', () => {
    const problem = { inputMode: 'calculator' as const, answer: 12 };
    expect(isSixSevenEasterEgg(problem, '67')).toBe(true);
    expect(isSixSevenEasterEgg(problem, 67)).toBe(true);
    expect(SIX_SEVEN_SPOKEN).toBe('six seven ha ha ha...good one');
    expect(SIX_SEVEN_SPEECH_BUBBLE.toLowerCase()).toContain('six seven ha ha ha...good one');
  });

  it('does not trigger when the actual answer is 67', () => {
    const problem = { inputMode: 'calculator' as const, answer: 67 };
    expect(isSixSevenEasterEgg(problem, '67')).toBe(false);
    expect(isSixSevenEasterEgg(problem, 67)).toBe(false);
  });

  it('does not trigger in multiple-choice mode where players cannot type numbers', () => {
    const problem = { inputMode: 'choice' as const, answer: 12 };
    expect(isSixSevenEasterEgg(problem, '67')).toBe(false);
    expect(isSixSevenEasterEgg(problem, 67)).toBe(false);
  });

  it('does not trigger for missing problems or other numbers', () => {
    const problem = { inputMode: 'calculator' as const, answer: 10 };
    expect(isSixSevenEasterEgg(null, '67')).toBe(false);
    expect(isSixSevenEasterEgg(problem, '')).toBe(false);
    expect(isSixSevenEasterEgg(problem, '6')).toBe(false);
    expect(isSixSevenEasterEgg(problem, '7')).toBe(false);
    expect(isSixSevenEasterEgg(problem, '76')).toBe(false);
    expect(isSixSevenEasterEgg(problem, 10)).toBe(false);
  });

  it('triggers in the counting helper only when clicking 6 then 7 in sequence', () => {
    expect(isSixSevenSequence(6, 7)).toBe(true);
    expect(isSixSevenSequence(7, 6)).toBe(false);
    expect(isSixSevenSequence(null, 7)).toBe(false);
    expect(isSixSevenSequence(5, 7)).toBe(false);
    expect(isSixSevenSequence(6, 6)).toBe(false);
    expect(isSixSevenSequence(6, 8)).toBe(false);
  });
});
