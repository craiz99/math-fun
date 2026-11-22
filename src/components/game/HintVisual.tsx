import { useState } from 'react';
import type { MathProblem } from '../../game/types';
import { soundEngine } from '../../audio/soundEngine';

interface HintVisualProps {
  problem: MathProblem;
  counterEmoji: string;
  hintLevel: 1 | 2;
}

export function HintVisual({ problem, counterEmoji, hintLevel }: HintVisualProps) {
  const [countedIndices, setCountedIndices] = useState<number[]>([]);
  const { a, b, op, answer, hint } = problem;

  const handleTapItem = (idx: number) => {
    setCountedIndices((prev) => {
      if (prev.includes(idx)) return prev;
      const next = [...prev, idx];
      soundEngine.playCount(next.length - 1);
      return next;
    });
  };

  const renderTenFrames = () => {
    const totalSlots = op === '+' ? a + b : a;
    const frameCount = totalSlots > 10 ? 2 : 1;

    return (
      <div className="tenframe-wrap">
        {Array.from({ length: frameCount }).map((_, frameIdx) => (
          <div key={frameIdx} className="tenframe-grid" aria-label={`Ten frame ${frameIdx + 1}`}>
            {Array.from({ length: 10 }).map((__, slotIdx) => {
              const globalIdx = frameIdx * 10 + slotIdx;
              const isFilled = globalIdx < totalSlots;
              const isRemoved = op === '-' && globalIdx >= answer && globalIdx < a;
              const isGroupB = op === '+' && globalIdx >= a && globalIdx < totalSlots;
              const isGroupA = isFilled && !isRemoved && !isGroupB;
              const isCountable = isFilled && !isRemoved;
              const countedOrder = countedIndices.indexOf(globalIdx);

              return (
                <button
                  key={slotIdx}
                  type="button"
                  disabled={!isCountable}
                  onClick={() => isCountable && handleTapItem(globalIdx)}
                  className={[
                    'tf-cell',
                    isCountable ? 'tappable' : '',
                    isGroupA ? 'group-a' : '',
                    isGroupB ? 'group-b' : '',
                    isRemoved ? 'removed' : '',
                    countedOrder >= 0 ? 'counted' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label={isCountable ? `Count item ${globalIdx + 1}` : undefined}
                >
                  {isFilled ? counterEmoji : ''}
                  {countedOrder >= 0 && <span className="tf-num">{countedOrder + 1}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderBase10 = () => {
    const tensA = Math.floor(a / 10);
    const onesA = a % 10;
    const tensB = Math.floor(b / 10);
    const onesB = b % 10;

    if (op === '+') {
      return (
        <div className="base10-wrap">
          <div className="base10-group" aria-label={`${a} in base ten blocks`}>
            {Array.from({ length: tensA }).map((_, i) => (
              <div key={`ta-${i}`} className="ten-rod" />
            ))}
            {onesA > 0 && (
              <div className="ones-stack">
                {Array.from({ length: onesA }).map((_, i) => (
                  <div key={`oa-${i}`} className="one-cube" />
                ))}
              </div>
            )}
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>
            +
          </span>
          <div className="base10-group" aria-label={`${b} in base ten blocks`}>
            {Array.from({ length: tensB }).map((_, i) => (
              <div key={`tb-${i}`} className="ten-rod" />
            ))}
            {onesB > 0 && (
              <div className="ones-stack">
                {Array.from({ length: onesB }).map((_, i) => (
                  <div key={`ob-${i}`} className="one-cube group-b" />
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Subtraction base-10 visual: show remaining tens/ones bright and removed dimmed
    const remTens = Math.floor(answer / 10);
    const remOnes = answer % 10;
    return (
      <div className="base10-wrap">
        <div className="base10-group" aria-label={`${a} minus ${b} base ten visual`}>
          {Array.from({ length: remTens }).map((_, i) => (
            <div key={`rt-${i}`} className="ten-rod" />
          ))}
          {remOnes > 0 && (
            <div className="ones-stack">
              {Array.from({ length: remOnes }).map((_, i) => (
                <div key={`ro-${i}`} className="one-cube" />
              ))}
            </div>
          )}
          {Array.from({ length: tensB }).map((_, i) => (
            <div key={`xt-${i}`} className="ten-rod removed" />
          ))}
          {onesB > 0 && (
            <div className="ones-stack">
              {Array.from({ length: onesB }).map((_, i) => (
                <div key={`xo-${i}`} className="one-cube removed" />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="hint-panel" role="region" aria-label="Math strategy hint">
      <div className="hint-header">
        <span className="hint-badge">{hint.strategyTitle}</span>
        <span>{hint.step1Text}</span>
      </div>

      {hint.visualType === 'tenframe' ? renderTenFrames() : renderBase10()}

      {hintLevel >= 2 && (
        <div className="number-line-box" aria-label="Step by step jump hint">
          <span className="nl-pill">{hint.numberLine.start}</span>
          {hint.numberLine.hops.map((hop, idx) => {
            const isLast = idx === hint.numberLine.hops.length - 1;
            const hopText = hop.delta > 0 ? `+${hop.delta}` : `${hop.delta}`;
            return (
              <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className="nl-hop">── {hopText} ──▶</span>
                <span className={`nl-pill ${isLast ? 'mystery' : 'highlight'}`}>
                  {isLast ? '?' : hop.to}
                </span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
