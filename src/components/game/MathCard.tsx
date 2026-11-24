import type { AnswerState, MathProblem, SquadConfig } from '../../game/types';
import { HintVisual } from './HintVisual';

interface MathCardProps {
  problem: MathProblem;
  squad: SquadConfig;
  typedValue: string;
  answerState: AnswerState;
  hintLevel: 0 | 1 | 2;
  walkthroughTrigger: number;
  onRequestHint: () => void;
  onNewProblem: () => void;
  onReadEquation: () => void;
}

export function MathCard({
  problem,
  squad,
  typedValue,
  answerState,
  hintLevel,
  walkthroughTrigger,
  onRequestHint,
  onNewProblem,
  onReadEquation,
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
    answerState === 'joke' ? 'joke' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className="math-card" aria-label="Math problem">
      <div className="math-card-top-row">
        <span className="squad-tag" style={{ background: squad.themeColor }}>
          {squad.badgeEmoji} {squad.name}
        </span>

        <div className="math-card-actions">
          <button
            id="btn-new-problem"
            type="button"
            disabled={answerState === 'correct'}
            className="jelly-btn jelly-blue card-action-btn"
            onClick={onNewProblem}
            title="Get a different problem"
          >
            🔄 New
          </button>

          <button
            id="btn-hint"
            type="button"
            className="jelly-btn jelly-yellow card-action-btn"
            onClick={onRequestHint}
          >
            💡 {hintLevel === 0 ? 'Hint' : 'Count With Me'}
          </button>
        </div>
      </div>

      <div className="equation-row" aria-live="polite">
        <button
          id="btn-read-equation"
          type="button"
          className="equation-speak-btn"
          onClick={onReadEquation}
          aria-label="Read math problem aloud"
          title="Read aloud"
        >
          🔊
        </button>
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
          walkthroughTrigger={walkthroughTrigger}
        />
      )}
    </section>
  );
}
