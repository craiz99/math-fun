import { describe, expect, it } from 'vitest';
import {
  buildChoices,
  buildHint,
  buildProblemPool,
  generateGameSession,
} from './mathEngine';

function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

describe('mathEngine', () => {
  it('generates rich non-empty pools across all levels and operations', () => {
    for (const level of [1, 2, 3] as const) {
      for (const mode of ['add', 'sub', 'mix'] as const) {
        const pool = buildProblemPool(level, mode);
        expect(pool.length).toBeGreaterThanOrEqual(24);
        for (const p of pool) {
          expect(p.answer).toBe(p.op === '+' ? p.a + p.b : p.a - p.b);
          expect(p.answer).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });

  it('never repeats problems within a session or across consecutive sessions', () => {
    const rng = createSeededRng(42);
    const seen = new Set<string>();

    const game1 = generateGameSession(2, 'mix', {
      count: 12,
      seenKeys: seen,
      persistHistory: false,
      rng,
    });
    expect(game1).toHaveLength(12);
    const keys1 = new Set(game1.map((p) => p.key));
    expect(keys1.size).toBe(12);

    keys1.forEach((k) => seen.add(k));
    const game2 = generateGameSession(2, 'mix', {
      count: 12,
      seenKeys: seen,
      persistHistory: false,
      rng,
    });
    for (const p of game2) {
      expect(keys1.has(p.key)).toBe(false);
    }
  });

  it('mixes calculator and multiple-choice inputs in every squad', () => {
    const game = generateGameSession(2, 'mix', {
      count: 12,
      persistHistory: false,
      rng: createSeededRng(7),
    });

    const calcCount = game.filter((p) => p.inputMode === 'calculator').length;
    const choiceCount = game.filter((p) => p.inputMode === 'choice').length;
    expect(calcCount).toBe(8);
    expect(choiceCount).toBe(4);
  });

  it('builds 4 unique sorted choices always containing the true answer', () => {
    const rng = createSeededRng(123);
    for (const ans of [2, 8, 13, 20, 47]) {
      const choices = buildChoices(ans, rng);
      expect(choices).toHaveLength(4);
      expect(new Set(choices).size).toBe(4);
      expect(choices).toContain(ans);
      expect([...choices].sort((a, b) => a - b)).toEqual(choices);
    }
  });

  it('produces accurate Make-a-10 and Bridge-to-10 hints with valid hops', () => {
    const addHint = buildHint(8, 5, '+');
    expect(addHint.strategyTitle).toBe('Make a 10!');
    expect(addHint.numberLine.hops).toEqual([
      { from: 8, to: 10, delta: 2 },
      { from: 10, to: 13, delta: 3 },
    ]);

    const subHint = buildHint(14, 6, '-');
    expect(subHint.strategyTitle).toBe('Bridge Back to 10!');
    expect(subHint.numberLine.hops).toEqual([
      { from: 14, to: 10, delta: -4 },
      { from: 10, to: 8, delta: -2 },
    ]);

    const bigHint = buildHint(28, 6, '+');
    expect(bigHint.visualType).toBe('base10');
    expect(bigHint.numberLine.end).toBe(34);
  });
});
