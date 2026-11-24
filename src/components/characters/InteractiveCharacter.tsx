import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import type { ReactionState } from '../../game/types';
import { soundEngine } from '../../audio/soundEngine';
import {
  CHARACTER_INTERACTIONS,
  getCharacterPokeEffect,
  type CharacterId,
  type PokeAnimationKind,
} from './characterInteractions';

interface InteractiveCharacterProps {
  characterId: CharacterId;
  reaction?: ReactionState;
  delayClass?: string;
  className?: string;
  renderCharacter: (effectiveReaction: ReactionState, isPoked: boolean) => ReactNode;
}

interface ActivePoke {
  id: number;
  phrase: string;
  animation: PokeAnimationKind;
  particles: string[];
  badgeBg: string;
  badgeColor: string;
}

const PARTICLE_VECTORS: ReadonlyArray<{ dx: string; dy: string; rot: string }> = [
  { dx: '-56px', dy: '-76px', rot: '-26deg' },
  { dx: '-24px', dy: '-96px', rot: '-12deg' },
  { dx: '26px', dy: '-94px', rot: '14deg' },
  { dx: '58px', dy: '-74px', rot: '28deg' },
  { dx: '0px', dy: '-108px', rot: '6deg' },
];

export function InteractiveCharacter({
  characterId,
  reaction = 'idle',
  delayClass = '',
  className = '',
  renderCharacter,
}: InteractiveCharacterProps) {
  const [poke, setPoke] = useState<ActivePoke | null>(null);
  const [animating, setAnimating] = useState(false);
  const tapCountRef = useRef(0);
  const burstIdRef = useRef(0);
  const animTimerRef = useRef<number | null>(null);
  const badgeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (animTimerRef.current !== null) window.clearTimeout(animTimerRef.current);
      if (badgeTimerRef.current !== null) window.clearTimeout(badgeTimerRef.current);
    };
  }, []);

  const triggerPoke = useCallback(() => {
    const cfg = CHARACTER_INTERACTIONS[characterId];
    soundEngine.unlock();
    cfg.playSound();

    const effect = getCharacterPokeEffect(characterId, tapCountRef.current);
    tapCountRef.current += 1;
    burstIdRef.current += 1;
    const nextId = burstIdRef.current;

    if (animTimerRef.current !== null) window.clearTimeout(animTimerRef.current);
    if (badgeTimerRef.current !== null) window.clearTimeout(badgeTimerRef.current);

    setPoke({ id: nextId, ...effect });
    setAnimating(false);
    // Re-trigger CSS keyframe cleanly on rapid taps
    window.requestAnimationFrame(() => {
      setAnimating(true);
    });

    animTimerRef.current = window.setTimeout(() => {
      setAnimating(false);
      animTimerRef.current = null;
    }, 560);

    badgeTimerRef.current = window.setTimeout(() => {
      setPoke((curr) => (curr?.id === nextId ? null : curr));
      badgeTimerRef.current = null;
    }, 950);
  }, [characterId]);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    triggerPoke();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      triggerPoke();
    }
  };

  const cfg = CHARACTER_INTERACTIONS[characterId];
  const isPoked = poke !== null;
  const effectiveReaction: ReactionState =
    isPoked && reaction !== 'celebrate' ? 'happy' : reaction;
  const pokeClass = animating && poke ? `poked ${poke.animation}` : '';

  return (
    <div
      className={`char-actor state-${reaction} ${delayClass} ${pokeClass} ${className}`.trim()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Tap ${cfg.label}`}
    >
      {poke && (
        <div key={poke.id} className="char-poke-fx" aria-hidden="true">
          <span
            className="char-poke-badge"
            style={{ background: poke.badgeBg, color: poke.badgeColor }}
          >
            {poke.phrase}
          </span>
          {PARTICLE_VECTORS.map((vec, idx) => (
            <span
              key={idx}
              className="char-poke-particle"
              style={
                {
                  '--dx': vec.dx,
                  '--dy': vec.dy,
                  '--rot': vec.rot,
                  animationDelay: `${idx * 0.03}s`,
                } as CSSProperties
              }
            >
              {poke.particles[idx % poke.particles.length]}
            </span>
          ))}
        </div>
      )}
      {renderCharacter(effectiveReaction, isPoked)}
    </div>
  );
}
