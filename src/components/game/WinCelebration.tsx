import { TOTAL_QUESTIONS } from '../../game/squads';
import { GiantPandaSvg, RedPandaSvg } from '../characters/PandaSquad';
import { GoldenHenSvg, HeroChickenSvg } from '../characters/ChickenCrew';
import { JJSvg, MikeySvg } from '../characters/JJAndMikey';
import { MiraSvg, RumiSvg, ZoeySvg } from '../characters/PopStarTrio';
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
          <div className="char-actor state-celebrate">
            <GiantPandaSvg reaction="celebrate" size={172} />
          </div>
          <div className="char-actor state-celebrate delay-1">
            <HeroChickenSvg reaction="celebrate" flexing size={170} />
          </div>
          <div className="char-actor state-celebrate delay-2">
            <JJSvg reaction="celebrate" size={168} />
          </div>
          <div className="char-actor state-celebrate">
            <ZoeySvg reaction="celebrate" size={160} />
          </div>
        </div>
        <div className="cast-row-front">
          <div className="char-actor state-celebrate delay-1">
            <RumiSvg reaction="celebrate" size={166} />
          </div>
          <div className="char-actor state-celebrate delay-2">
            <RedPandaSvg reaction="celebrate" size={166} />
          </div>
          <div className="char-actor state-celebrate">
            <GoldenHenSvg reaction="celebrate" size={156} />
          </div>
          <div className="char-actor state-celebrate delay-1">
            <MikeySvg reaction="celebrate" size={162} />
          </div>
          <div className="char-actor state-celebrate delay-2">
            <MiraSvg reaction="celebrate" size={166} />
          </div>
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
