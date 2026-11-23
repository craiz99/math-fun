import type {
  DifficultyLevel,
  HintData,
  InputMode,
  MathOperator,
  MathProblem,
  NumberLineHop,
  OperationMode,
} from './types';
import { QUESTIONS_PER_SQUAD, SQUAD_ORDER } from './squads';

interface RawProblem {
  a: number;
  b: number;
  op: MathOperator;
  answer: number;
  key: string;
}

const HISTORY_STORAGE_KEY = 'math-party-seen-v1';

function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function buildProblemPool(
  level: DifficultyLevel,
  opMode: OperationMode
): RawProblem[] {
  const pool: RawProblem[] = [];
  const allowAdd = opMode === 'add' || opMode === 'mix';
  const allowSub = opMode === 'sub' || opMode === 'mix';

  if (level === 1) {
    if (allowAdd) {
      for (let a = 2; a <= 10; a++) {
        for (let b = 2; b <= 9; b++) {
          const sum = a + b;
          if (sum >= 5 && sum <= 15) {
            pool.push({ a, b, op: '+', answer: sum, key: `${a}+${b}` });
          }
        }
      }
    }
    if (allowSub) {
      for (let a = 6; a <= 15; a++) {
        for (let b = 2; b <= 9; b++) {
          const diff = a - b;
          if (diff >= 1 && diff <= 12) {
            pool.push({ a, b, op: '-', answer: diff, key: `${a}-${b}` });
          }
        }
      }
    }
  } else if (level === 2) {
    if (allowAdd) {
      for (let a = 4; a <= 13; a++) {
        for (let b = 3; b <= 10; b++) {
          const sum = a + b;
          if (sum >= 10 && sum <= 20) {
            pool.push({ a, b, op: '+', answer: sum, key: `${a}+${b}` });
          }
        }
      }
    }
    if (allowSub) {
      for (let a = 11; a <= 20; a++) {
        for (let b = 3; b <= 9; b++) {
          const diff = a - b;
          if (diff >= 2 && diff <= 15) {
            pool.push({ a, b, op: '-', answer: diff, key: `${a}-${b}` });
          }
        }
      }
    }
  } else {
    // Level 3: Super Challenge (up to 50)
    if (allowAdd) {
      for (let a = 15; a <= 42; a++) {
        for (let b = 3; b <= 9; b++) {
          const sum = a + b;
          if (sum <= 50) {
            pool.push({ a, b, op: '+', answer: sum, key: `${a}+${b}` });
          }
        }
      }
      for (let a = 12; a <= 39; a += 3) {
        pool.push({ a, b: 10, op: '+', answer: a + 10, key: `${a}+10` });
      }
    }
    if (allowSub) {
      for (let a = 21; a <= 49; a++) {
        for (let b = 3; b <= 9; b++) {
          const diff = a - b;
          if (diff >= 12) {
            pool.push({ a, b, op: '-', answer: diff, key: `${a}-${b}` });
          }
        }
      }
      for (let a = 22; a <= 49; a += 3) {
        pool.push({ a, b: 10, op: '-', answer: a - 10, key: `${a}-10` });
      }
    }
  }

  return pool;
}

export function buildChoices(
  answer: number,
  rng: () => number = Math.random
): number[] {
  const candidates = new Set<number>([answer]);
  const offsets = shuffle([-3, -2, -1, 1, 2, 3, -4, 4, 10, -10], rng);

  for (const offset of offsets) {
    if (candidates.size >= 4) break;
    const candidate = answer + offset;
    if (candidate >= 0 && candidate <= 60) {
      candidates.add(candidate);
    }
  }

  let fallback = answer + 1;
  while (candidates.size < 4) {
    if (fallback >= 0) candidates.add(fallback);
    fallback++;
  }

  return Array.from(candidates).sort((x, y) => x - y);
}

export function buildHint(a: number, b: number, op: MathOperator): HintData {
  const answer = op === '+' ? a + b : a - b;
  const maxVal = Math.max(a, answer);
  const visualType: 'tenframe' | 'base10' = maxVal <= 20 ? 'tenframe' : 'base10';

  if (op === '+') {
    const nextTen = Math.ceil((a + 1) / 10) * 10;
    const toTen = nextTen - a;

    if (b === 10) {
      return {
        strategyTitle: 'Jump by 10!',
        step1Text: `Start at ${a} and add 1 whole ten! Only the tens digit goes up by 1.`,
        visualType,
        numberLine: {
          start: a,
          end: answer,
          hops: [{ from: a, to: answer, delta: 10 }],
        },
      };
    }

    if (a === b) {
      return {
        strategyTitle: 'Doubles Power!',
        step1Text: `Two equal groups of ${a}! Count the blocks together to double ${a}.`,
        visualType,
        numberLine: {
          start: a,
          end: answer,
          hops: [{ from: a, to: answer, delta: b }],
        },
      };
    }

    if (a < nextTen && a + b > nextTen && toTen > 0 && b - toTen > 0) {
      const rem = b - toTen;
      const hops: NumberLineHop[] = [
        { from: a, to: nextTen, delta: toTen },
        { from: nextTen, to: answer, delta: rem },
      ];
      return {
        strategyTitle: nextTen === 10 ? 'Make a 10!' : `Make ${nextTen}!`,
        step1Text: `${a} + ${toTen} makes ${nextTen}, then add ${rem} more!`,
        visualType,
        numberLine: { start: a, end: answer, hops },
      };
    }

    if (Math.abs(a - b) === 1 && a <= 10 && b <= 10) {
      const small = Math.min(a, b);
      return {
        strategyTitle: 'Near-Double Trick!',
        step1Text: `${small} + ${small} is ${small * 2}, then just add 1 more!`,
        visualType,
        numberLine: {
          start: a,
          end: answer,
          hops: [{ from: a, to: answer, delta: b }],
        },
      };
    }

    return {
      strategyTitle: 'Count On!',
      step1Text: `Start at ${a} and count up ${b} more using the blocks!`,
      visualType,
      numberLine: {
        start: a,
        end: answer,
        hops: [{ from: a, to: answer, delta: b }],
      },
    };
  }

  // Subtraction hints
  if (b === 10) {
    return {
      strategyTitle: 'Jump Back 10!',
      step1Text: `Start at ${a} and take away 1 whole ten! Only the tens digit goes down by 1.`,
      visualType,
      numberLine: {
        start: a,
        end: answer,
        hops: [{ from: a, to: answer, delta: -10 }],
      },
    };
  }

  const lowerTen = Math.floor((a - 1) / 10) * 10;
  const toLowerTen = a - lowerTen;
  if (lowerTen >= 10 && a > lowerTen && answer < lowerTen && b - toLowerTen > 0) {
    const rem = b - toLowerTen;
    const hops: NumberLineHop[] = [
      { from: a, to: lowerTen, delta: -toLowerTen },
      { from: lowerTen, to: answer, delta: -rem },
    ];
    return {
      strategyTitle: lowerTen === 10 ? 'Bridge Back to 10!' : `Bridge to ${lowerTen}!`,
      step1Text: `${a} take away ${toLowerTen} makes ${lowerTen}, then take away ${rem} more!`,
      visualType,
      numberLine: { start: a, end: answer, hops },
    };
  }

  return {
    strategyTitle: 'Take Away & Count Left!',
    step1Text: `Start with ${a}, cross out ${b}, and see how many are still glowing!`,
    visualType,
    numberLine: {
      start: a,
      end: answer,
      hops: [{ from: a, to: answer, delta: -b }],
    },
  };
}

function loadSeenKeys(bucketKey: string): Set<string> {
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return new Set(parsed[bucketKey] ?? []);
  } catch {
    return new Set();
  }
}

function saveSeenKeys(bucketKey: string, seen: Set<string>): void {
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    const parsed: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    parsed[bucketKey] = Array.from(seen);
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore storage errors in private browsing or test environments.
  }
}

function isCommutativeMirror(prev: RawProblem | undefined, next: RawProblem): boolean {
  if (!prev || prev.op !== '+' || next.op !== '+') return false;
  return prev.a === next.b && prev.b === next.a;
}

export function generateGameSession(
  level: DifficultyLevel,
  opMode: OperationMode,
  options?: {
    count?: number;
    seenKeys?: Set<string>;
    persistHistory?: boolean;
    rng?: () => number;
  }
): MathProblem[] {
  const count = options?.count ?? SQUAD_ORDER.length * QUESTIONS_PER_SQUAD;
  const rng = options?.rng ?? Math.random;
  const persist = options?.persistHistory ?? true;
  const bucketKey = `${level}:${opMode}`;

  const fullPool = buildProblemPool(level, opMode);
  const seen = options?.seenKeys
    ? new Set(options.seenKeys)
    : persist
      ? loadSeenKeys(bucketKey)
      : new Set<string>();

  let available = shuffle(
    fullPool.filter((p) => !seen.has(p.key)),
    rng
  );

  // If fewer unseen problems remain than needed, top up from a fresh shuffled pool
  // without duplicating anything already selected for this game.
  if (available.length < count) {
    const alreadyInAvailable = new Set(available.map((p) => p.key));
    const refill = shuffle(
      fullPool.filter((p) => !alreadyInAvailable.has(p.key)),
      rng
    );
    seen.clear();
    available = [...available, ...refill];
  }

  // Balance '+' and '-' in mix mode while avoiding back-to-back commutative mirrors.
  const selected: RawProblem[] = [];
  const usedKeys = new Set<string>();

  for (let i = 0; i < count; i++) {
    const desiredOp: MathOperator | null =
      opMode === 'mix' ? (i % 2 === 0 ? '+' : '-') : null;

    let pickIndex = available.findIndex(
      (p) =>
        !usedKeys.has(p.key) &&
        (!desiredOp || p.op === desiredOp) &&
        !isCommutativeMirror(selected[selected.length - 1], p)
    );

    if (pickIndex === -1) {
      pickIndex = available.findIndex(
        (p) =>
          !usedKeys.has(p.key) &&
          !isCommutativeMirror(selected[selected.length - 1], p)
      );
    }
    if (pickIndex === -1) {
      pickIndex = available.findIndex((p) => !usedKeys.has(p.key));
    }

    const chosen = available[pickIndex];
    selected.push(chosen);
    usedKeys.add(chosen.key);
    seen.add(chosen.key);
  }

  if (persist) {
    saveSeenKeys(bucketKey, seen);
  }

  // Mix calculator free-input (2 per 3-question squad) and multiple-choice (1 per squad).
  const inputModes: InputMode[] = [];
  const squadCount = Math.ceil(count / QUESTIONS_PER_SQUAD);
  for (let s = 0; s < squadCount; s++) {
    inputModes.push(...shuffle<InputMode>(['calculator', 'calculator', 'choice'], rng));
  }

  return selected.map((raw, idx) => ({
    id: `${raw.key}-${idx}-${Math.floor(rng() * 100000)}`,
    key: raw.key,
    a: raw.a,
    b: raw.b,
    op: raw.op,
    answer: raw.answer,
    inputMode: inputModes[idx] ?? 'calculator',
    choices: buildChoices(raw.answer, rng),
    hint: buildHint(raw.a, raw.b, raw.op),
  }));
}
