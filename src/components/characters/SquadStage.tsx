import { useState } from 'react';
import type { ReactionState, SquadId } from '../../game/types';
import { soundEngine } from '../../audio/soundEngine';
import { GiantPandaSvg, RedPandaSvg } from './PandaSquad';
import { GoldenHenSvg, HeroChickenSvg, RaccoonSvg } from './ChickenCrew';
import { JJSvg, MikeySvg } from './JJAndMikey';
import { MiraSvg, RumiSvg, ZoeySvg } from './PopStarTrio';

export type RaccoonEventPhase = 'none' | 'sneaking' | 'chasing' | 'victory';

interface SquadStageProps {
  squadId: SquadId;
  reaction: ReactionState;
  speechText: string | null;
  raccoonPhase: RaccoonEventPhase;
  onTriggerRaccoonChase: () => void;
}

export function SquadStage({
  squadId,
  reaction,
  speechText,
  raccoonPhase,
  onTriggerRaccoonChase,
}: SquadStageProps) {
  const [pokedId, setPokedId] = useState<string | null>(null);

  const handlePoke = (charKey: string, isChicken = false) => {
    setPokedId(charKey);
    if (isChicken) {
      soundEngine.playChickenBawk();
    } else {
      soundEngine.playTap();
    }
    window.setTimeout(() => {
      setPokedId((curr) => (curr === charKey ? null : curr));
    }, 480);
  };

  const actorClass = (key: string, delayClass = '') =>
    `char-actor state-${reaction} ${delayClass} ${pokedId === key ? 'poked' : ''}`;

  // Fierce Hero Chickens aggressively chasing the panicked Raccoon across the stage!
  if (squadId === 'chickens' && raccoonPhase === 'chasing') {
    return (
      <div className="raccoon-chase-arena" aria-live="polite">
        <div className="chase-runner-track">
          <div className="chase-group">
            <span className="dust-puff" style={{ left: '-34px' }}>💨</span>
            <span className="dust-puff" style={{ left: '68px', animationDelay: '0.15s' }}>🪶</span>
            <div className="chase-chicken-angry" style={{ position: 'relative' }}>
              <span className="comic-burst" style={{ top: '-22px', left: '-10px' }}>
                BAWK!!
              </span>
              <HeroChickenSvg battleMode size={228} />
            </div>
            <div className="chase-chicken-angry" style={{ position: 'relative', animationDelay: '0.1s' }}>
              <span
                className="comic-burst"
                style={{ top: '-28px', left: '8px', background: '#f59e0b', color: '#281a38' }}
              >
                PECK ATTACK!
              </span>
              <GoldenHenSvg battleMode size={210} />
            </div>
            <div className="chase-raccoon-panic" style={{ position: 'relative', marginLeft: '6px' }}>
              <span className="comic-burst" style={{ top: '-18px', right: '-8px', background: '#ef4444' }}>
                SHOO!!
              </span>
              <RaccoonSvg panicked size={196} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="squad-stage">
      {speechText && (
        <div
          className={`speech-bubble ${
            reaction === 'happy' || reaction === 'celebrate'
              ? 'happy'
              : reaction === 'encourage'
                ? 'encourage'
                : ''
          }`}
        >
          {speechText}
        </div>
      )}

      {squadId === 'pandas' && (
        <>
          <div
            className={actorClass('giant-panda')}
            onClick={() => handlePoke('giant-panda')}
            role="button"
            aria-label="Tap Giant Panda"
          >
            <GiantPandaSvg reaction={reaction} size={254} />
          </div>
          <div
            className={actorClass('red-panda', 'delay-1')}
            onClick={() => handlePoke('red-panda')}
            role="button"
            aria-label="Tap Red Panda"
          >
            <RedPandaSvg reaction={reaction} size={242} />
          </div>
        </>
      )}

      {squadId === 'chickens' && (
        <>
          <div
            className={actorClass('hero-chicken')}
            onClick={() => handlePoke('hero-chicken', true)}
            role="button"
            aria-label="Tap Hero White Chicken"
          >
            <HeroChickenSvg
              reaction={reaction}
              battleMode={raccoonPhase === 'sneaking'}
              flexing={raccoonPhase === 'victory' || reaction === 'happy'}
              size={246}
            />
          </div>
          <div
            className={actorClass('golden-hen', 'delay-1')}
            onClick={() => handlePoke('golden-hen', true)}
            role="button"
            aria-label="Tap Golden Hen"
          >
            <GoldenHenSvg
              reaction={reaction}
              battleMode={raccoonPhase === 'sneaking'}
              size={228}
            />
          </div>

          {raccoonPhase === 'sneaking' && (
            <div
              className="raccoon-sneaker"
              onClick={onTriggerRaccoonChase}
              role="button"
              aria-label="Tap sneaky raccoon to make the chickens chase him!"
              title="Tap to chase away the sneaky raccoon!"
            >
              <span
                className="comic-burst"
                style={{
                  top: '-22px',
                  left: '-18px',
                  fontSize: '18px',
                  background: '#fde047',
                  color: '#281a38',
                }}
              >
                TAP TO CHASE! 🦝
              </span>
              <RaccoonSvg size={186} />
            </div>
          )}
        </>
      )}

      {squadId === 'jjmikey' && (
        <>
          <div
            className={actorClass('jj')}
            onClick={() => handlePoke('jj')}
            role="button"
            aria-label="Tap JJ"
          >
            <JJSvg reaction={reaction} size={252} />
          </div>
          <div
            className={actorClass('mikey', 'delay-1')}
            onClick={() => handlePoke('mikey')}
            role="button"
            aria-label="Tap Mikey"
          >
            <MikeySvg reaction={reaction} size={238} />
          </div>
        </>
      )}

      {squadId === 'popstars' && (
        <>
          <div
            className={actorClass('rumi')}
            onClick={() => handlePoke('rumi')}
            role="button"
            aria-label="Tap Rumi"
          >
            <RumiSvg reaction={reaction} size={216} />
          </div>
          <div
            className={actorClass('zoey', 'delay-1')}
            onClick={() => handlePoke('zoey')}
            role="button"
            aria-label="Tap Zoey"
          >
            <ZoeySvg reaction={reaction} size={206} />
          </div>
          <div
            className={actorClass('mira', 'delay-2')}
            onClick={() => handlePoke('mira')}
            role="button"
            aria-label="Tap Mira"
          >
            <MiraSvg reaction={reaction} size={216} />
          </div>
        </>
      )}
    </div>
  );
}
