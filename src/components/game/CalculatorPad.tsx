interface CalculatorPadProps {
  disabled: boolean;
  canSubmit: boolean;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
}

/**
 * Exact standard calculator key arrangement (7-8-9 on top row, 4-5-6 middle,
 * 1-2-3 bottom, Backspace / 0 / Checkmark GO below) sized for iPad touch play.
 */
const CALC_ROWS: { digit: string; colorClass: string }[] = [
  { digit: '7', colorClass: 'jelly-blue' },
  { digit: '8', colorClass: 'jelly-blue' },
  { digit: '9', colorClass: 'jelly-blue' },
  { digit: '4', colorClass: 'jelly-purple' },
  { digit: '5', colorClass: 'jelly-purple' },
  { digit: '6', colorClass: 'jelly-purple' },
  { digit: '1', colorClass: 'jelly-red' },
  { digit: '2', colorClass: 'jelly-red' },
  { digit: '3', colorClass: 'jelly-red' },
];

export function CalculatorPad({
  disabled,
  canSubmit,
  onDigit,
  onBackspace,
  onSubmit,
}: CalculatorPadProps) {
  return (
    <div className="calc-pad-panel" role="group" aria-label="Calculator number pad">
      {CALC_ROWS.map(({ digit, colorClass }) => (
        <button
          key={digit}
          id={`calc-key-${digit}`}
          type="button"
          disabled={disabled}
          className={`jelly-btn calc-key ${colorClass}`}
          onClick={() => onDigit(digit)}
        >
          {digit}
        </button>
      ))}

      <button
        id="calc-key-backspace"
        type="button"
        disabled={disabled}
        className="jelly-btn calc-key jelly-orange"
        onClick={onBackspace}
        aria-label="Backspace"
      >
        ⌫
      </button>

      <button
        id="calc-key-0"
        type="button"
        disabled={disabled}
        className="jelly-btn calc-key jelly-slate"
        onClick={() => onDigit('0')}
      >
        0
      </button>

      <button
        id="calc-key-submit"
        type="button"
        disabled={disabled || !canSubmit}
        className="jelly-btn calc-key jelly-green"
        onClick={onSubmit}
        aria-label="Check answer"
      >
        ✓
      </button>
    </div>
  );
}
