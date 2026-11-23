export type OperationMode = 'add' | 'sub' | 'mix';

export type DifficultyLevel = 1 | 2 | 3;

export type InputMode = 'calculator' | 'choice';

export type SquadId = 'pandas' | 'chickens' | 'jjmikey' | 'popstars';

export type ReactionState = 'idle' | 'happy' | 'encourage' | 'celebrate';

export type MathOperator = '+' | '-';

export interface NumberLineHop {
  from: number;
  to: number;
  delta: number;
}

export interface HintData {
  strategyTitle: string;
  step1Text: string;
  visualType: 'tenframe' | 'base10';
  numberLine: {
    start: number;
    end: number;
    hops: NumberLineHop[];
  };
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
  hint: HintData;
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
