import type { MathProblem, SquadConfig } from '../../game/types';
import { HintVisual } from './HintVisual';

interface MathCardProps {
  problem: MathProblem;
  squad: SquadConfig;
  typedValue: string;
  answerState: 'idle' | 'correct' | 'wrong';
  hintLevel: 0 | 1 | 2;
  onRequestHint: () => void;
}

export function MathCard({
  problem,
  squad,
  typedValue,
  answerState,
  hintLevel,
  onRequestHint,
}: MathCardProps) {
  const displayOp = problem.op === '-' ? '−' : '+';
  const displayAnswer =
    answerState === 'correct'
      ? String(problem.answer)
      : typedValue.length > 0
        ? typedValue
        : '?';

  const slotClass = [
    'answer-slot',
    typedValue.length > 0 && answerState === 'idle' ? 'filled' : '',
    answerState === 'correct' ? 'correct' : '',
    answerState === 'wrong' ? 'wrong' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className="math-card" aria-label="Math problem">
      <div className="math-card-top-row">
        <span className="squad-tag" style={{ background: squad.themeColor }}>
          {squad.badgeEmoji} {squad.name}
        </span>

        <button
          id="btn-hint"
          type="button"
          className="jelly-btn jelly-yellow hint-trigger-btn"
          onClick={onRequestHint}
        >
          💡 {hintLevel === 0 ? 'Hint' : hintLevel === 1 ? 'More Hint' : 'Hint On!'}
        </button>
      </div>

      <div className="equation-row" aria-live="polite">
        <span>{problem.a}</span>
        <span>{displayOp}</span>
        <span>{problem.b}</span>
        <span>=</span>
        <span className={slotClass}>{displayAnswer}</span>
      </div>

      {hintLevel !== 0 && (
        <HintVisual
          key={problem.id}
          problem={problem}
          counterEmoji={squad.counterEmoji}
          hintLevel={hintLevel}
        />
      )}
    </section>
  );
}
