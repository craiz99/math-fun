import { useState } from 'react';
import type { ReactionState, SquadId, StageGagState } from '../../game/types';
import { soundEngine } from '../../audio/soundEngine';
import { BambooTowerSvg, GiantPandaSvg, RedPandaSvg } from './PandaSquad';
import { GoldenHenSvg, HeroChickenSvg, RaccoonSvg } from './ChickenCrew';
import { JJSvg, MikeySvg } from './JJAndMikey';
import { GwiMaSvg, MiraSvg, RumiSvg, ZoeySvg } from './PopStarTrio';

interface SquadStageProps {
  squadId: SquadId;
  reaction: ReactionState;
  speechText: string | null;
  gagState: StageGagState;
  sixSevenJoke?: boolean;
  onTriggerGag: () => void;
}

export function SquadStage({
  squadId,
  reaction,
  speechText,
  gagState,
  sixSevenJoke = false,
  onTriggerGag,
}: SquadStageProps) {
  const [pokedId, setPokedId] = useState<string | null>(null);

  const handlePoke = (charKey: string, isChicken = false) => {
    setPokedId(charKey);
    if (isChicken) soundEngine.playChickenBawk();
    else soundEngine.playTap();
    window.setTimeout(() => {
      setPokedId((curr) => (curr === charKey ? null : curr));
    }, 480);
  };

  const actorClass = (key: string, delayClass = '', overrideState?: ReactionState) =>
    `char-actor state-${overrideState ?? reaction} ${delayClass} ${pokedId === key ? 'poked' : ''}`;

  // 1) HERO CHICKENS VS. RACCOON CHASE!
  if (squadId === 'chickens' && gagState.kind === 'raccoon-chasing') {
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
              <HeroChickenSvg battleMode size={224} />
            </div>
            <div className="chase-chicken-angry" style={{ position: 'relative', animationDelay: '0.1s' }}>
              <span
                className="comic-burst"
                style={{ top: '-28px', left: '8px', background: '#f59e0b', color: '#281a38' }}
              >
                PECK ATTACK!
              </span>
              <GoldenHenSvg battleMode size={206} />
            </div>
            <div className="chase-raccoon-panic" style={{ position: 'relative', marginLeft: '6px' }}>
              <span className="comic-burst" style={{ top: '-18px', right: '-8px', background: '#ef4444' }}>
                SHOO!!
              </span>
              <RaccoonSvg panicked size={192} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2) K-POP DEMON HUNTERS BLASTING GWI-MA!
  if (squadId === 'popstars' && gagState.kind === 'gwima-blasted') {
    return (
      <div className="gwima-battle-arena" aria-live="polite">
        <span className="comic-burst" style={{ top: '4px', left: '12px', background: '#c084fc', color: '#ffffff' }}>
          STAR POWER!!
        </span>
        <span className="comic-burst" style={{ top: '12px', right: '14px', background: '#fde047', color: '#281a38' }}>
          NOOO! TOO SPARKLY!!
        </span>

        {/* Dazzling Rainbow Star Laser Beams shooting at Gwi-Ma! */}
        <div className="rainbow-laser-beam" aria-hidden="true" />
        <div className="rainbow-laser-beam beam-2" aria-hidden="true" />

        <div className="gwima-heroes-cluster">
          <div className="char-actor state-happy">
            <RumiSvg reaction="happy" size={184} />
          </div>
          <div className="char-actor state-happy delay-1">
            <ZoeySvg reaction="happy" size={176} />
          </div>
          <div className="char-actor state-happy delay-2">
            <MiraSvg reaction="happy" size={184} />
          </div>
        </div>

        <div className="gwima-boss-blasted">
          <GwiMaSvg blasted size={196} />
        </div>
      </div>
    );
  }

  // 3) PANDA PALS — RED PANDA "I'M BIG & SCARY!" + BAMBOO RAIN!
  if (squadId === 'pandas' && gagState.kind === 'panda-rain') {
    return (
      <div className="squad-stage panda-rain-stage" aria-live="polite">
        {/* Falling bamboo shoots & leaves shower */}
        <div className="bamboo-rain-layer" aria-hidden="true">
          {['🎋', '🍃', '🎋', '🌿', '🎋', '🍃', '🎋'].map((icon, i) => (
            <span
              key={i}
              className="bamboo-rain-drop"
              style={{ left: `${10 + i * 13}%`, animationDelay: `${(i % 4) * 0.18}s` }}
            >
              {icon}
            </span>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <span
            className="comic-burst"
            style={{
              top: '-48px',
              left: '0px',
              fontSize: '20px',
              zIndex: 15,
              background: '#4ade80',
              color: '#14532d',
            }}
          >
            NOM NOM NOM!!
          </span>
          <div className="char-actor state-happy">
            <GiantPandaSvg reaction="happy" size={236} />
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <span
            className="comic-burst"
            style={{
              top: '-48px',
              right: '-4px',
              fontSize: '19px',
              zIndex: 15,
              background: '#f59e0b',
              color: '#281a38',
            }}
          >
            BIG &amp; SCARY! RAWR!!
          </span>
          <div className="char-actor state-celebrate red-panda-tall">
            <RedPandaSvg reaction="happy" size={232} />
          </div>
        </div>
      </div>
    );
  }

  // 4) JJ & MIKEY PRANK STAGE (MIKEY SAYS WRONG, JJ STEPS IN!)
  if (squadId === 'jjmikey' && (gagState.kind === 'mikey-prank' || gagState.kind === 'jj-corrects')) {
    const jjSteppedIn = gagState.kind === 'jj-corrects';
    return (
      <div className="squad-stage" aria-live="polite">
        <div
          className={`char-actor ${jjSteppedIn ? 'state-happy jj-step-in' : 'state-encourage'}`}
          style={{ position: 'relative' }}
        >
          {jjSteppedIn && (
            <span
              className="comic-burst"
              style={{
                top: '-58px',
                left: '-8px',
                fontSize: '21px',
                zIndex: 16,
                background: '#4ade80',
                color: '#14532d',
              }}
            >
              MIKEY!! That&apos;s RIGHT!!
            </span>
          )}
          <JJSvg reaction={jjSteppedIn ? 'happy' : 'encourage'} size={244} />
        </div>

        <div
          className={`char-actor ${jjSteppedIn ? 'state-celebrate' : 'state-happy mikey-prank-hop'}`}
          style={{ position: 'relative' }}
        >
          <span
            className="comic-burst"
            style={{
              top: jjSteppedIn ? '-18px' : '-44px',
              right: '-10px',
              fontSize: '19px',
              zIndex: 15,
              background: jjSteppedIn ? '#fde047' : '#c084fc',
              color: jjSteppedIn ? '#281a38' : '#ffffff',
            }}
          >
            {jjSteppedIn ? 'HEHE! JUST KIDDING!!' : 'WRONG!! HEHEHE!!'}
          </span>
          <MikeySvg reaction="happy" size={236} />
        </div>
      </div>
    );
  }

  return (
    <div className="squad-stage">
      {speechText && (
        <div
          className={`speech-bubble ${
            sixSevenJoke
              ? 'joke'
              : reaction === 'happy' || reaction === 'celebrate'
                ? 'happy'
                : reaction === 'encourage'
                  ? 'encourage'
                  : ''
          }`}
        >
          {speechText}
        </div>
      )}

      {sixSevenJoke && (
        <div className="six-seven-meme-layer" aria-hidden="true">
          <span className="comic-burst six-seven-badge six-badge">6 🤲</span>
          <span className="comic-burst six-seven-badge seven-badge">🤲 7</span>
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
            <GiantPandaSvg reaction={reaction} size={246} />
          </div>

          {gagState.kind === 'panda-tower' && (
            <div
              className="gag-clickable-prop"
              onClick={onTriggerGag}
              role="button"
              aria-label="Tap wobbly bamboo tower"
              title="Tap the bamboo tower!"
            >
              <span
                className="comic-burst"
                style={{ top: '-24px', left: '-14px', fontSize: '16px', background: '#fde047', color: '#281a38' }}
              >
                TAP BAMBOO! 🎋
              </span>
              <BambooTowerSvg size={136} />
            </div>
          )}

          <div
            className={actorClass('red-panda', 'delay-1')}
            onClick={() => handlePoke('red-panda')}
            role="button"
            aria-label="Tap Red Panda"
          >
            <RedPandaSvg reaction={reaction} size={234} />
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
              battleMode={gagState.kind === 'raccoon-sneaking'}
              flexing={gagState.kind === 'raccoon-victory' || reaction === 'happy'}
              size={242}
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
              battleMode={gagState.kind === 'raccoon-sneaking'}
              size={224}
            />
          </div>

          {gagState.kind === 'raccoon-sneaking' && (
            <div
              className="raccoon-sneaker"
              onClick={onTriggerGag}
              role="button"
              aria-label="Tap sneaky raccoon to make the chickens chase him!"
              title="Tap to chase away the sneaky raccoon!"
            >
              <span
                className="comic-burst"
                style={{
                  top: '-22px',
                  left: '-18px',
                  fontSize: '17px',
                  background: '#fde047',
                  color: '#281a38',
                }}
              >
                TAP TO CHASE! 🦝
              </span>
              <RaccoonSvg size={182} />
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
            <JJSvg reaction={reaction} size={248} />
          </div>
          <div
            className={actorClass('mikey', 'delay-1')}
            onClick={() => handlePoke('mikey')}
            role="button"
            aria-label="Tap Mikey"
          >
            <MikeySvg reaction={reaction} size={236} />
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
            <RumiSvg reaction={reaction} size={gagState.kind === 'gwima-arrives' ? 182 : 214} />
          </div>
          <div
            className={actorClass('zoey', 'delay-1')}
            onClick={() => handlePoke('zoey')}
            role="button"
            aria-label="Tap Zoey"
          >
            <ZoeySvg reaction={reaction} size={gagState.kind === 'gwima-arrives' ? 174 : 204} />
          </div>
          <div
            className={actorClass('mira', 'delay-2')}
            onClick={() => handlePoke('mira')}
            role="button"
            aria-label="Tap Mira"
          >
            <MiraSvg reaction={reaction} size={gagState.kind === 'gwima-arrives' ? 182 : 214} />
          </div>

          {gagState.kind === 'gwima-arrives' && (
            <div
              className="gwima-sneaker"
              onClick={onTriggerGag}
              role="button"
              aria-label="Tap Gwi-Ma to blast him with Star Power!"
              title="Tap to blast Gwi-Ma!"
            >
              <span
                className="comic-burst"
                style={{
                  top: '-22px',
                  left: '-14px',
                  fontSize: '17px',
                  background: '#f43f5e',
                  color: '#fef08a',
                }}
              >
                TAP TO BLAST! ⚡
              </span>
              <GwiMaSvg size={172} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
