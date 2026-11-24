import type { ReactionState, SquadId, StageGagState } from '../../game/types';
import { BambooTowerSvg, GiantPandaSvg, RedPandaSvg } from './PandaSquad';
import { GoldenHenSvg, HeroChickenSvg, RaccoonSvg } from './ChickenCrew';
import { JJSvg, MikeySvg } from './JJAndMikey';
import { GwiMaSvg, MiraSvg, RumiSvg, ZoeySvg } from './PopStarTrio';
import { InteractiveCharacter } from './InteractiveCharacter';

interface SquadStageProps {
  squadId: SquadId;
  reaction: ReactionState;
  speechText: string | null;
  gagState: StageGagState;
  onTriggerGag: () => void;
}

export function SquadStage({
  squadId,
  reaction,
  speechText,
  gagState,
  onTriggerGag,
}: SquadStageProps) {
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
          <InteractiveCharacter
            characterId="rumi"
            reaction="happy"
            renderCharacter={(r) => <RumiSvg reaction={r} size={184} />}
          />
          <InteractiveCharacter
            characterId="zoey"
            reaction="happy"
            delayClass="delay-1"
            renderCharacter={(r) => <ZoeySvg reaction={r} size={176} />}
          />
          <InteractiveCharacter
            characterId="mira"
            reaction="happy"
            delayClass="delay-2"
            renderCharacter={(r) => <MiraSvg reaction={r} size={184} />}
          />
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
          <InteractiveCharacter
            characterId="giant-panda"
            reaction="happy"
            renderCharacter={(r) => <GiantPandaSvg reaction={r} size={236} />}
          />
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
          <InteractiveCharacter
            characterId="red-panda"
            reaction="celebrate"
            className="red-panda-tall"
            renderCharacter={(r) => <RedPandaSvg reaction={r} size={232} />}
          />
        </div>
      </div>
    );
  }

  // 4) JJ & MIKEY PRANK STAGE (MIKEY SAYS WRONG, JJ STEPS IN!)
  if (squadId === 'jjmikey' && (gagState.kind === 'mikey-prank' || gagState.kind === 'jj-corrects')) {
    const jjSteppedIn = gagState.kind === 'jj-corrects';
    return (
      <div className="squad-stage" aria-live="polite">
        <div style={{ position: 'relative' }}>
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
          <InteractiveCharacter
            characterId="jj"
            reaction={jjSteppedIn ? 'happy' : 'encourage'}
            className={jjSteppedIn ? 'jj-step-in' : ''}
            renderCharacter={(r) => <JJSvg reaction={r} size={244} />}
          />
        </div>

        <div style={{ position: 'relative' }}>
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
          <InteractiveCharacter
            characterId="mikey"
            reaction={jjSteppedIn ? 'celebrate' : 'happy'}
            className={jjSteppedIn ? '' : 'mikey-prank-hop'}
            renderCharacter={(r) => <MikeySvg reaction={r} size={236} />}
          />
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
          <InteractiveCharacter
            characterId="giant-panda"
            reaction={reaction}
            renderCharacter={(r) => <GiantPandaSvg reaction={r} size={246} />}
          />

          {gagState.kind === 'panda-tower' && (
            <div
              className="gag-clickable-prop"
              onClick={(e) => {
                e.stopPropagation();
                onTriggerGag();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onTriggerGag();
                }
              }}
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

          <InteractiveCharacter
            characterId="red-panda"
            reaction={reaction}
            delayClass="delay-1"
            renderCharacter={(r) => <RedPandaSvg reaction={r} size={234} />}
          />
        </>
      )}

      {squadId === 'chickens' && (
        <>
          <InteractiveCharacter
            characterId="hero-chicken"
            reaction={reaction}
            renderCharacter={(r, poked) => (
              <HeroChickenSvg
                reaction={r}
                battleMode={gagState.kind === 'raccoon-sneaking'}
                flexing={gagState.kind === 'raccoon-victory' || r === 'happy' || poked}
                size={242}
              />
            )}
          />
          <InteractiveCharacter
            characterId="golden-hen"
            reaction={reaction}
            delayClass="delay-1"
            renderCharacter={(r) => (
              <GoldenHenSvg
                reaction={r}
                battleMode={gagState.kind === 'raccoon-sneaking'}
                size={224}
              />
            )}
          />

          {gagState.kind === 'raccoon-sneaking' && (
            <div
              className="raccoon-sneaker"
              onClick={(e) => {
                e.stopPropagation();
                onTriggerGag();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onTriggerGag();
                }
              }}
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
          <InteractiveCharacter
            characterId="jj"
            reaction={reaction}
            renderCharacter={(r) => <JJSvg reaction={r} size={248} />}
          />
          <InteractiveCharacter
            characterId="mikey"
            reaction={reaction}
            delayClass="delay-1"
            renderCharacter={(r) => <MikeySvg reaction={r} size={236} />}
          />
        </>
      )}

      {squadId === 'popstars' && (
        <>
          <InteractiveCharacter
            characterId="rumi"
            reaction={reaction}
            renderCharacter={(r) => (
              <RumiSvg reaction={r} size={gagState.kind === 'gwima-arrives' ? 182 : 214} />
            )}
          />
          <InteractiveCharacter
            characterId="zoey"
            reaction={reaction}
            delayClass="delay-1"
            renderCharacter={(r) => (
              <ZoeySvg reaction={r} size={gagState.kind === 'gwima-arrives' ? 174 : 204} />
            )}
          />
          <InteractiveCharacter
            characterId="mira"
            reaction={reaction}
            delayClass="delay-2"
            renderCharacter={(r) => (
              <MiraSvg reaction={r} size={gagState.kind === 'gwima-arrives' ? 182 : 214} />
            )}
          />

          {gagState.kind === 'gwima-arrives' && (
            <div
              className="gwima-sneaker"
              onClick={(e) => {
                e.stopPropagation();
                onTriggerGag();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onTriggerGag();
                }
              }}
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
