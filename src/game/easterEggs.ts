import type { MathProblem } from './types';

export const SIX_SEVEN_NUMBER = 67;
export const SIX_SEVEN_TEXT = '67';
export const SIX_SEVEN_SPOKEN = 'six seven ha ha ha...good one';
export const SIX_SEVEN_SPEECH_BUBBLE = 'Six seven ha ha ha...good one! 😂';

/**
 * Checks whether a calculator input triggers the "6 7" meme easter egg:
 * only when the player can type numbers (calculator mode), types 67,
 * and the actual answer is not 67.
 */
export function isSixSevenEasterEgg(
  problem: Pick<MathProblem, 'inputMode' | 'answer'> | null,
  input: string | number
): boolean {
  if (!problem || problem.inputMode !== 'calculator') return false;
  if (problem.answer === SIX_SEVEN_NUMBER) return false;
  if (typeof input === 'number') {
    return input === SIX_SEVEN_NUMBER;
  }
  return input.trim() === SIX_SEVEN_TEXT;
}
