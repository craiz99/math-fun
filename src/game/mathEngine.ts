import type {
  CountingHintData,
  DifficultyLevel,
  InputMode,
  MathOperator,
  MathProblem,
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

const HISTORY_STORAGE_KEY = 'math-party-seen-v3';
const MAX_NUMBER = 20;

function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Strictly <= 20 across all 3 levels, tuned to smaller, kid-friendly numbers:
 * - Level 1: Up to 10
 * - Level 2 (Default): Up to 15
 * - Level 3: Up to 20
 */
export function buildProblemPool(
  level: DifficultyLevel,
  opMode: OperationMode
): RawProblem[] {
  const pool: RawProblem[] = [];
  const allowAdd = opMode === 'add' || opMode === 'mix';
  const allowSub = opMode === 'sub' || opMode === 'mix';

  if (level === 1) {
    if (allowAdd) {
      for (let a = 1; a <= 7; a++) {
        for (let b = 1; b <= 6; b++) {
          const sum = a + b;
          if (sum >= 3 && sum <= 10) {
            pool.push({ a, b, op: '+', answer: sum, key: `${a}+${b}` });
          }
        }
      }
    }
    if (allowSub) {
      for (let a = 3; a <= 10; a++) {
        for (let b = 1; b <= 6; b++) {
          const diff = a - b;
          if (diff >= 1 && diff <= 9) {
            pool.push({ a, b, op: '-', answer: diff, key: `${a}-${b}` });
          }
        }
      }
    }
  } else if (level === 2) {
    if (allowAdd) {
      for (let a = 2; a <= 9; a++) {
        for (let b = 2; b <= 7; b++) {
          const sum = a + b;
          if (sum >= 5 && sum <= 15) {
            pool.push({ a, b, op: '+', answer: sum, key: `${a}+${b}` });
          }
        }
      }
    }
    if (allowSub) {
      for (let a = 6; a <= 15; a++) {
        for (let b = 2; b <= 7; b++) {
          const diff = a - b;
          if (diff >= 1 && diff <= 12) {
            pool.push({ a, b, op: '-', answer: diff, key: `${a}-${b}` });
          }
        }
      }
    }
  } else {
    // Level 3: Up to 20 (strictly <= 20)
    if (allowAdd) {
      for (let a = 4; a <= 12; a++) {
        for (let b = 2; b <= 9; b++) {
          const sum = a + b;
          if (sum >= 10 && sum <= MAX_NUMBER) {
            pool.push({ a, b, op: '+', answer: sum, key: `${a}+${b}` });
          }
        }
      }
    }
    if (allowSub) {
      for (let a = 10; a <= MAX_NUMBER; a++) {
        for (let b = 2; b <= 9; b++) {
          const diff = a - b;
          if (diff >= 2 && diff <= 15) {
            pool.push({ a, b, op: '-', answer: diff, key: `${a}-${b}` });
          }
        }
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
  const offsets = shuffle([-3, -2, -1, 1, 2, 3, -4, 4], rng);

  for (const offset of offsets) {
    if (candidates.size >= 4) break;
    const candidate = answer + offset;
    if (candidate >= 0 && candidate <= MAX_NUMBER) {
      candidates.add(candidate);
    }
  }

  for (let fallback = 1; candidates.size < 4 && fallback <= MAX_NUMBER; fallback++) {
    candidates.add(fallback);
  }

  return Array.from(candidates).sort((x, y) => x - y);
}

/**
 * Simple, voice-first Counting On / Counting Back hint tailored for 5-year-olds.
 * - Addition always starts from the bigger number and counts forward.
 * - Subtraction starts from the first number and counts backward.
 */
export function buildHint(a: number, b: number, op: MathOperator): CountingHintData {
  if (op === '+') {
    const startNumber = Math.max(a, b);
    const stepCount = Math.min(a, b);
    const stepValues = Array.from({ length: stepCount }, (_, i) => startNumber + i + 1);
    return {
      mode: 'count-on',
      startNumber,
      stepCount,
      stepValues,
      equationSpoken: `What is ${a} plus ${b}?`,
      step1Spoken: `Let's count on together! Start at ${startNumber}, and tap each one to count ${stepCount} more!`,
    };
  }

  const startNumber = a;
  const stepCount = b;
  const stepValues = Array.from({ length: stepCount }, (_, i) => startNumber - i - 1);
  return {
    mode: 'count-back',
    startNumber,
    stepCount,
    stepValues,
    equationSpoken: `What is ${a} take away ${b}?`,
    step1Spoken: `Let's count back together! Start at ${startNumber}, and tap each one to count back ${stepCount}!`,
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

function toMathProblem(
  raw: RawProblem,
  inputMode: InputMode,
  idx: number,
  rng: () => number
): MathProblem {
  return {
    id: `${raw.key}-${idx}-${Math.floor(rng() * 100000)}`,
    key: raw.key,
    a: raw.a,
    b: raw.b,
    op: raw.op,
    answer: raw.answer,
    inputMode,
    choices: buildChoices(raw.answer, rng),
    hint: buildHint(raw.a, raw.b, raw.op),
  };
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

  if (available.length < count) {
    const alreadyInAvailable = new Set(available.map((p) => p.key));
    const refill = shuffle(
      fullPool.filter((p) => !alreadyInAvailable.has(p.key)),
      rng
    );
    seen.clear();
    available = [...available, ...refill];
  }

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

  const inputModes: InputMode[] = [];
  const squadCount = Math.ceil(count / QUESTIONS_PER_SQUAD);
  for (let s = 0; s < squadCount; s++) {
    inputModes.push(...shuffle<InputMode>(['calculator', 'calculator', 'choice'], rng));
  }

  return selected.map((raw, idx) =>
    toMathProblem(raw, inputModes[idx] ?? 'calculator', idx, rng)
  );
}

/** Generate a fresh replacement problem when the child taps the "New" button. */
export function generateReplacementProblem(
  level: DifficultyLevel,
  opMode: OperationMode,
  excludeKeys: Set<string>,
  inputMode: InputMode,
  options?: { persistHistory?: boolean; rng?: () => number }
): MathProblem {
  const rng = options?.rng ?? Math.random;
  const persist = options?.persistHistory ?? true;
  const bucketKey = `${level}:${opMode}`;
  const fullPool = buildProblemPool(level, opMode);
  const seen = persist ? loadSeenKeys(bucketKey) : new Set<string>();

  let candidates = shuffle(
    fullPool.filter((p) => !excludeKeys.has(p.key) && !seen.has(p.key)),
    rng
  );
  if (candidates.length === 0) {
    candidates = shuffle(
      fullPool.filter((p) => !excludeKeys.has(p.key)),
      rng
    );
  }
  if (candidates.length === 0) {
    candidates = shuffle(fullPool, rng);
  }

  const chosen = candidates[0];
  if (persist) {
    seen.add(chosen.key);
    saveSeenKeys(bucketKey, seen);
  }
  return toMathProblem(chosen, inputMode, Date.now() % 10000, rng);
}
