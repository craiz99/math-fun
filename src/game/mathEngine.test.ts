import { describe, expect, it } from 'vitest';
import {
  buildChoices,
  buildHint,
  buildProblemPool,
  generateGameSession,
  generateReplacementProblem,
} from './mathEngine';
import { SQUAD_ORDER, shuffleSquadOrder } from './squads';

function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

describe('mathEngine & squads', () => {
  it('keeps all operands, answers, and choices strictly <= 20 across every level', () => {
    const levelCaps = { 1: 10, 2: 15, 3: 20 } as const;
    const rng = createSeededRng(99);

    for (const level of [1, 2, 3] as const) {
      for (const mode of ['add', 'sub', 'mix'] as const) {
        const pool = buildProblemPool(level, mode);
        expect(pool.length).toBeGreaterThanOrEqual(20);
        for (const p of pool) {
          expect(p.a).toBeLessThanOrEqual(levelCaps[level]);
          expect(p.b).toBeLessThanOrEqual(9);
          expect(p.answer).toBe(p.op === '+' ? p.a + p.b : p.a - p.b);
          expect(p.answer).toBeGreaterThanOrEqual(1);
          expect(p.answer).toBeLessThanOrEqual(levelCaps[level]);

          const choices = buildChoices(p.answer, rng);
          expect(choices).toHaveLength(4);
          expect(choices).toContain(p.answer);
          for (const c of choices) {
            expect(c).toBeGreaterThanOrEqual(0);
            expect(c).toBeLessThanOrEqual(20);
          }
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

  it('generates fresh replacement problems that do not duplicate excluded keys', () => {
    const rng = createSeededRng(17);
    const session = generateGameSession(2, 'mix', {
      count: 12,
      persistHistory: false,
      rng,
    });
    const exclude = new Set(session.map((p) => p.key));
    const replacement = generateReplacementProblem(2, 'mix', exclude, 'calculator', {
      persistHistory: false,
      rng,
    });
    expect(exclude.has(replacement.key)).toBe(false);
    expect(replacement.inputMode).toBe('calculator');
    expect(replacement.answer).toBeLessThanOrEqual(15);
  });

  it('builds simple Counting On (from bigger number) and Counting Back hints', () => {
    const addHint = buildHint(4, 7, '+');
    expect(addHint.mode).toBe('count-on');
    expect(addHint.startNumber).toBe(7);
    expect(addHint.stepCount).toBe(4);
    expect(addHint.stepValues).toEqual([8, 9, 10, 11]);

    const subHint = buildHint(12, 4, '-');
    expect(subHint.mode).toBe('count-back');
    expect(subHint.startNumber).toBe(12);
    expect(subHint.stepCount).toBe(4);
    expect(subHint.stepValues).toEqual([11, 10, 9, 8]);
  });

  it('shuffles squad order with all 4 squads and rotates the opening squad on replay', () => {
    const rng = createSeededRng(55);
    const firstOrder = shuffleSquadOrder(undefined, rng);
    expect(new Set(firstOrder)).toEqual(new Set(SQUAD_ORDER));

    for (let i = 0; i < 10; i++) {
      const nextOrder = shuffleSquadOrder(firstOrder[0], rng);
      expect(new Set(nextOrder)).toEqual(new Set(SQUAD_ORDER));
      expect(nextOrder[0]).not.toBe(firstOrder[0]);
    }
  });
});
