interface MultipleChoicePadProps {
  choices: number[];
  disabled: boolean;
  eliminated: number[];
  onSelect: (choice: number) => void;
}

const CHOICE_COLORS = ['jelly-purple', 'jelly-yellow', 'jelly-green', 'jelly-pink'];

export function MultipleChoicePad({
  choices,
  disabled,
  eliminated,
  onSelect,
}: MultipleChoicePadProps) {
  return (
    <div className="choice-pad-panel" role="group" aria-label="Answer choices">
      <div className="choice-label">Tap the Answer!</div>
      {choices.map((choice, idx) => {
        const isEliminated = eliminated.includes(choice);
        return (
          <button
            key={choice}
            id={`choice-btn-${choice}`}
            type="button"
            disabled={disabled || isEliminated}
            className={`jelly-btn choice-key ${CHOICE_COLORS[idx % CHOICE_COLORS.length]}`}
            onClick={() => onSelect(choice)}
          >
            {choice}
          </button>
        );
      })}
    </div>
  );
}
