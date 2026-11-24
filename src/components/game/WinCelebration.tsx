import { TOTAL_QUESTIONS } from '../../game/squads';
import { GiantPandaSvg, RedPandaSvg } from '../characters/PandaSquad';
import { GoldenHenSvg, HeroChickenSvg } from '../characters/ChickenCrew';
import { JJSvg, MikeySvg } from '../characters/JJAndMikey';
import { MiraSvg, RumiSvg, ZoeySvg } from '../characters/PopStarTrio';
import { InteractiveCharacter } from '../characters/InteractiveCharacter';
import { RainbowTitle } from './RainbowTitle';

interface WinCelebrationProps {
  firstTryCount: number;
  onPlayAgain: () => void;
}

const CONFETTI_COLORS = ['#fb7185', '#facc15', '#4ade80', '#38bdf8', '#c084fc', '#fb923c'];

const CONFETTI_PIECES = Array.from({ length: 34 }).map((_, i) => ({
  id: i,
  left: `${(i * 29) % 98}%`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  duration: `${2.1 + (i % 5) * 0.42}s`,
  delay: `${(i % 7) * 0.22}s`,
}));

export function WinCelebration({
  firstTryCount,
  onPlayAgain,
}: WinCelebrationProps) {
  return (
    <main className="win-screen" aria-label="You Win Celebration">
      {/* Continuous Rainbow Confetti Shower */}
      <div className="confetti-layer" aria-hidden="true">
        {CONFETTI_PIECES.map((c) => (
          <div
            key={c.id}
            className="confetti-piece"
            style={{
              left: c.left,
              background: c.color,
              animationDuration: c.duration,
              animationDelay: c.delay,
            }}
          />
        ))}
      </div>

      <div className="win-header">
        <div className="win-title-row">
          <span className="win-trophy" aria-hidden="true">🏆</span>
          <RainbowTitle text="YOU WIN!!" />
          <span className="win-trophy" aria-hidden="true">🏆</span>
        </div>
        <div className="win-stars-row" aria-label={`${TOTAL_QUESTIONS} golden stars earned`}>
          {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
            <span key={i}>⭐</span>
          ))}
        </div>
        <div className="win-stats-pill">
          🎉 All {TOTAL_QUESTIONS} Solved! ({firstTryCount} on the First Try!)
        </div>
      </div>

      {/* HUGE 2-Tier Staggered All-Characters Victory Concert Stage! */}
      <div className="cast-poster win-cast-poster" aria-label="All cartoon characters celebrating">
        <div className="cast-row-back">
          <InteractiveCharacter
            characterId="giant-panda"
            reaction="celebrate"
            renderCharacter={(r) => <GiantPandaSvg reaction={r} size={172} />}
          />
          <InteractiveCharacter
            characterId="hero-chicken"
            reaction="celebrate"
            delayClass="delay-1"
            renderCharacter={(r) => <HeroChickenSvg reaction={r} flexing size={170} />}
          />
          <InteractiveCharacter
            characterId="jj"
            reaction="celebrate"
            delayClass="delay-2"
            renderCharacter={(r) => <JJSvg reaction={r} size={168} />}
          />
          <InteractiveCharacter
            characterId="zoey"
            reaction="celebrate"
            renderCharacter={(r) => <ZoeySvg reaction={r} size={160} />}
          />
        </div>
        <div className="cast-row-front">
          <InteractiveCharacter
            characterId="rumi"
            reaction="celebrate"
            delayClass="delay-1"
            renderCharacter={(r) => <RumiSvg reaction={r} size={166} />}
          />
          <InteractiveCharacter
            characterId="red-panda"
            reaction="celebrate"
            delayClass="delay-2"
            renderCharacter={(r) => <RedPandaSvg reaction={r} size={166} />}
          />
          <InteractiveCharacter
            characterId="golden-hen"
            reaction="celebrate"
            renderCharacter={(r) => <GoldenHenSvg reaction={r} size={156} />}
          />
          <InteractiveCharacter
            characterId="mikey"
            reaction="celebrate"
            delayClass="delay-1"
            renderCharacter={(r) => <MikeySvg reaction={r} size={162} />}
          />
          <InteractiveCharacter
            characterId="mira"
            reaction="celebrate"
            delayClass="delay-2"
            renderCharacter={(r) => <MiraSvg reaction={r} size={166} />}
          />
        </div>
      </div>

      <button
        id="btn-play-again"
        type="button"
        className="jelly-btn jelly-green play-cta-btn"
        onClick={onPlayAgain}
      >
        🎉 PLAY AGAIN!
      </button>
    </main>
  );
}
