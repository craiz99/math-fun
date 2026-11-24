import { useCallback, useEffect, useRef, useState } from 'react';
import type { MathProblem } from '../../game/types';
import { isSixSevenSequence } from '../../game/easterEggs';
import { soundEngine } from '../../audio/soundEngine';

interface HintVisualProps {
  problem: MathProblem;
  counterEmoji: string;
  hintLevel: 1 | 2;
  walkthroughTrigger: number;
  onSixSevenEasterEgg?: () => void;
}

/**
 * Simple, voice-guided Counting On / Counting Back visual for 5-year-olds.
 * - Step 1: Big glowing start number + big tappable items that speak each count aloud!
 * - Step 2 (or tapping "Hear Again"): Slowly animates & reads each step aloud in sync,
 *   pausing on the final pulsing "?" item so the child discovers the answer proudly.
 */
export function HintVisual({
  problem,
  counterEmoji,
  hintLevel,
  walkthroughTrigger,
  onSixSevenEasterEgg,
}: HintVisualProps) {
  const { hint } = problem;
  const [revealedCount, setRevealedCount] = useState(0);
  const [activePulseIdx, setActivePulseIdx] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const lastTappedValueRef = useRef<number | null>(null);

  const clearWalkTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => clearWalkTimers, [clearWalkTimers]);

  const runGuidedWalkthrough = useCallback(() => {
    clearWalkTimers();
    lastTappedValueRef.current = null;
    soundEngine.stopSpeech();

    const startId = window.setTimeout(() => {
      setRevealedCount(0);
      setActivePulseIdx(-1);
      const isAdd = hint.mode === 'count-on';
      const intro = isAdd
        ? `Start at ${hint.startNumber}!`
        : `Start at ${hint.startNumber}, count back!`;
      soundEngine.speak(intro, { rate: 0.9 });
    }, 20);
    timersRef.current.push(startId);

    // Walk through every step except the very last one, pausing on "?" so the child discovers it!
    const autoSteps = Math.max(0, hint.stepCount - 1);
    for (let i = 0; i < autoSteps; i++) {
      const delay = 1350 + i * 880;
      const tId = window.setTimeout(() => {
        setActivePulseIdx(i);
        setRevealedCount((prev) => Math.max(prev, i + 1));
        soundEngine.playCount(i);
        soundEngine.speak(String(hint.stepValues[i]), { rate: 0.9 });
      }, delay);
      timersRef.current.push(tId);
    }

    // Pulse the final "?" item and invite the child to say or tap it!
    const finalDelay = 1350 + autoSteps * 880 + 200;
    const finalId = window.setTimeout(() => {
      setActivePulseIdx(hint.stepCount - 1);
      soundEngine.speak('Now what number comes next? Tap the last one to check!', {
        rate: 0.9,
      });
    }, finalDelay);
    timersRef.current.push(finalId);
  }, [clearWalkTimers, hint]);

  // Automatically play the guided spoken walkthrough when escalating to Step 2
  useEffect(() => {
    if (hintLevel === 2) {
      runGuidedWalkthrough();
    }
  }, [hintLevel, walkthroughTrigger, runGuidedWalkthrough]);

  const handleTapAnchor = () => {
    clearWalkTimers();
    setActivePulseIdx(-1);
    const val = hint.startNumber;
    const triggeredSixSeven = isSixSevenSequence(lastTappedValueRef.current, val);
    lastTappedValueRef.current = val;

    if (triggeredSixSeven && onSixSevenEasterEgg) {
      onSixSevenEasterEgg();
      return;
    }

    soundEngine.playTap();
    soundEngine.speak(String(val), { rate: 0.92 });
  };

  const handleTapStep = (idx: number) => {
    clearWalkTimers();
    const targetCount = Math.max(revealedCount, idx + 1);
    setRevealedCount(targetCount);
    setActivePulseIdx(idx);
    const val = hint.stepValues[idx];
    const triggeredSixSeven = isSixSevenSequence(lastTappedValueRef.current, val);
    lastTappedValueRef.current = val;

    if (triggeredSixSeven && onSixSevenEasterEgg) {
      onSixSevenEasterEgg();
      return;
    }

    soundEngine.playCount(idx);
    soundEngine.speak(String(val), { rate: 0.92 });
  };

  const handleHearAgain = () => {
    lastTappedValueRef.current = null;
    if (hintLevel === 2) {
      runGuidedWalkthrough();
    } else {
      soundEngine.speak(hint.step1Spoken, { rate: 0.9 });
    }
  };

  const isAdd = hint.mode === 'count-on';
  const nextTapIdx = revealedCount < hint.stepCount ? revealedCount : null;

  return (
    <div className="hint-panel" role="region" aria-label="Voice-guided counting hint">
      <div className="hint-voice-row">
        <span className="hint-simple-cue">
          {isAdd
            ? `Start at ${hint.startNumber}, tap to count ${hint.stepCount} more!`
            : `Start at ${hint.startNumber}, tap to count back ${hint.stepCount}!`}
        </span>
        <button
          id="btn-hear-hint"
          type="button"
          className="jelly-btn jelly-blue hear-again-btn"
          onClick={handleHearAgain}
        >
          🔊 Hear Again
        </button>
      </div>

      <div className="counting-strip">
        {/* Giant Glowing Starting Number Anchor */}
        <button
          type="button"
          className={`count-anchor-badge ${activePulseIdx === -1 ? 'pulsing' : ''}`}
          onClick={handleTapAnchor}
          aria-label={`Start at ${hint.startNumber}`}
        >
          {hint.startNumber}
        </button>

        <span className="count-op-sign" aria-hidden="true">
          {isAdd ? '+' : '−'}
        </span>

        {/* Big Tappable Glowing Counter Items */}
        <div className="count-items-row">
          {hint.stepValues.map((val, idx) => {
            const isRevealed = idx < revealedCount;
            const isNext = idx === nextTapIdx;
            const isPulsing = idx === activePulseIdx;

            return (
              <button
                key={idx}
                type="button"
                className={[
                  'count-item-btn',
                  isAdd ? 'add-item' : 'sub-item',
                  isRevealed ? 'revealed' : '',
                  isNext ? 'next-tap' : '',
                  isPulsing ? 'pulsing' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleTapStep(idx)}
                aria-label={isRevealed ? `Count ${val}` : `Tap to count step ${idx + 1}`}
              >
                {isNext && (
                  <span className="tap-finger-cue" aria-hidden="true">
                    👇
                  </span>
                )}
                <span className="count-item-icon">{counterEmoji}</span>
                <span className="count-item-val">{isRevealed ? val : '?'}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
