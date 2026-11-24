import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildChoices,
  buildHint,
  buildProblemPool,
  generateGameSession,
  generateReplacementProblem,
} from './mathEngine';
import {
  QUESTIONS_PER_SQUAD,
  SQUADS,
  SQUAD_ORDER,
  TOTAL_QUESTIONS,
  pickRandomLine,
  shuffleSquadOrder,
} from './squads';

function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

describe('mathEngine & squads', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

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
          if (mode === 'add') expect(p.op).toBe('+');
          if (mode === 'sub') expect(p.op).toBe('-');

          const choices = buildChoices(p.answer, rng);
          expect(choices).toHaveLength(4);
          expect(choices).toContain(p.answer);
          expect(new Set(choices).size).toBe(4);
          expect(choices).toEqual([...choices].sort((x, y) => x - y));
          for (const c of choices) {
            expect(c).toBeGreaterThanOrEqual(0);
            expect(c).toBeLessThanOrEqual(20);
          }
        }
      }
    }
  });

  it('builds 4 sorted unique choices even at boundary answers (0 and 20)', () => {
    const rng = createSeededRng(123);
    for (const boundary of [0, 1, 19, 20]) {
      const choices = buildChoices(boundary, rng);
      expect(choices).toHaveLength(4);
      expect(choices).toContain(boundary);
      expect(new Set(choices).size).toBe(4);
      for (const c of choices) {
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThanOrEqual(20);
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

  it('persists seen history in localStorage and refills pool gracefully when exhausted', () => {
    const rng = createSeededRng(7);
    const pool = buildProblemPool(1, 'add');

    const session1 = generateGameSession(1, 'add', { count: 12, rng });
    const session2 = generateGameSession(1, 'add', { count: 12, rng });

    const keys1 = new Set(session1.map((p) => p.key));
    for (const p of session2) {
      expect(keys1.has(p.key)).toBe(false);
    }

    // Exhaust almost the entire pool to trigger the refill branch
    const almostAllSeen = new Set(pool.slice(0, pool.length - 3).map((p) => p.key));
    const refilled = generateGameSession(1, 'add', {
      count: 12,
      seenKeys: almostAllSeen,
      persistHistory: true,
      rng,
    });
    expect(refilled).toHaveLength(12);
    expect(new Set(refilled.map((p) => p.key)).size).toBe(12);
    // The 3 unseen problems should be prioritized first
    const unseenKeys = new Set(pool.slice(pool.length - 3).map((p) => p.key));
    for (const key of unseenKeys) {
      expect(refilled.some((p) => p.key === key)).toBe(true);
    }
  });

  it('handles corrupted or inaccessible localStorage gracefully', () => {
    const rng = createSeededRng(11);
    window.localStorage.setItem('math-party-seen-v3', '{not-valid-json');
    const session = generateGameSession(1, 'sub', { count: 6, persistHistory: true, rng });
    expect(session).toHaveLength(6);

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    const fallbackSession = generateGameSession(1, 'add', { count: 6, persistHistory: true, rng });
    expect(fallbackSession).toHaveLength(6);
  });

  it('alternates addition and subtraction in mix mode and mixes calculator & choice per squad', () => {
    const rng = createSeededRng(31);
    const session = generateGameSession(2, 'mix', {
      count: TOTAL_QUESTIONS,
      persistHistory: false,
      rng,
    });

    expect(session).toHaveLength(TOTAL_QUESTIONS);
    session.forEach((p, idx) => {
      expect(p.op).toBe(idx % 2 === 0 ? '+' : '-');
    });

    // Each squad of 3 questions has 2 calculator and 1 multiple choice
    for (let s = 0; s < SQUAD_ORDER.length; s++) {
      const slice = session.slice(s * QUESTIONS_PER_SQUAD, (s + 1) * QUESTIONS_PER_SQUAD);
      const calcCount = slice.filter((p) => p.inputMode === 'calculator').length;
      const choiceCount = slice.filter((p) => p.inputMode === 'choice').length;
      expect(calcCount).toBe(2);
      expect(choiceCount).toBe(1);
    }
  });

  it('avoids adjacent commutative mirror additions when alternatives exist', () => {
    const rng = createSeededRng(2026);
    for (let run = 0; run < 15; run++) {
      const session = generateGameSession(1, 'add', {
        count: 12,
        persistHistory: false,
        rng,
      });
      for (let i = 1; i < session.length; i++) {
        const prev = session[i - 1];
        const curr = session[i];
        if (prev.a !== prev.b) {
          expect(prev.a === curr.b && prev.b === curr.a).toBe(false);
        }
      }
    }
  });

  it('generates fresh replacement problems and falls back safely when pool is seen or excluded', () => {
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

    // Persisted history path: mark every problem in pool as seen in localStorage
    const fullPool = buildProblemPool(1, 'add');
    window.localStorage.setItem(
      'math-party-seen-v3',
      JSON.stringify({ '1:add': fullPool.map((p) => p.key) })
    );
    const excludeHalf = new Set(fullPool.slice(0, 10).map((p) => p.key));
    const fromSeenFallback = generateReplacementProblem(1, 'add', excludeHalf, 'choice', {
      persistHistory: true,
      rng,
    });
    expect(excludeHalf.has(fromSeenFallback.key)).toBe(false);
    expect(fromSeenFallback.inputMode).toBe('choice');

    // Full exclusion fallback: even if every key is excluded, still returns a valid problem
    const excludeAll = new Set(fullPool.map((p) => p.key));
    const fromFullFallback = generateReplacementProblem(1, 'add', excludeAll, 'calculator', {
      persistHistory: false,
      rng,
    });
    expect(fullPool.some((p) => p.key === fromFullFallback.key)).toBe(true);
  });

  it('builds simple Counting On (from bigger number) and Counting Back hints', () => {
    const addHint = buildHint(4, 7, '+');
    expect(addHint.mode).toBe('count-on');
    expect(addHint.startNumber).toBe(7);
    expect(addHint.stepCount).toBe(4);
    expect(addHint.stepValues).toEqual([8, 9, 10, 11]);
    expect(addHint.equationSpoken).toBe('What is 4 plus 7?');
    expect(addHint.step1Spoken).toContain('Start at 7');

    const subHint = buildHint(12, 4, '-');
    expect(subHint.mode).toBe('count-back');
    expect(subHint.startNumber).toBe(12);
    expect(subHint.stepCount).toBe(4);
    expect(subHint.stepValues).toEqual([11, 10, 9, 8]);
    expect(subHint.equationSpoken).toBe('What is 12 take away 4?');
    expect(subHint.step1Spoken).toContain('Start at 12');
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

  it('picks deterministic lines from squad dialogue arrays with positive or negative seeds', () => {
    const lines = SQUADS.pandas.correctLines;
    expect(pickRandomLine(lines, 0)).toBe(lines[0]);
    expect(pickRandomLine(lines, 1)).toBe(lines[1]);
    expect(pickRandomLine(lines, lines.length + 2)).toBe(lines[2]);
    expect(pickRandomLine(lines, -3)).toBe(lines[3 % lines.length]);
  });
});
