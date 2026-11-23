export type OperationMode = 'add' | 'sub' | 'mix';

export type DifficultyLevel = 1 | 2 | 3;

export type InputMode = 'calculator' | 'choice';

export type SquadId = 'pandas' | 'chickens' | 'jjmikey' | 'popstars';

export type ReactionState = 'idle' | 'happy' | 'encourage' | 'celebrate';

export type MathOperator = '+' | '-';

export interface CountingHintData {
  mode: 'count-on' | 'count-back';
  startNumber: number;
  stepCount: number;
  stepValues: number[];
  equationSpoken: string;
  step1Spoken: string;
}

export interface MathProblem {
  id: string;
  key: string;
  a: number;
  b: number;
  op: MathOperator;
  answer: number;
  inputMode: InputMode;
  choices: number[];
  hint: CountingHintData;
}

export interface SquadConfig {
  id: SquadId;
  name: string;
  badgeEmoji: string;
  themeColor: string;
  counterEmoji: string;
  counterLabel: string;
  correctLines: string[];
  encourageLines: string[];
  introLine: string;
}

export type StageGagState =
  | { kind: 'none' }
  | { kind: 'raccoon-sneaking' }
  | { kind: 'raccoon-chasing' }
  | { kind: 'raccoon-victory' }
  | { kind: 'mikey-prank' }
  | { kind: 'jj-corrects' }
  | { kind: 'gwima-arrives' }
  | { kind: 'gwima-blasted' }
  | { kind: 'gwima-victory' }
  | { kind: 'panda-tower' }
  | { kind: 'panda-rain' };
