import { TOTAL_QUESTIONS } from '../../game/squads';
import { GiantPandaSvg, RedPandaSvg } from '../characters/PandaSquad';
import { GoldenHenSvg, HeroChickenSvg } from '../characters/ChickenCrew';
import { JJSvg, MikeySvg } from '../characters/JJAndMikey';
import { MiraSvg, RumiSvg, ZoeySvg } from '../characters/PopStarTrio';
import { RainbowTitle } from './RainbowTitle';

interface WinCelebrationProps {
  firstTryCount: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

const CONFETTI_COLORS = ['#fb7185', '#facc15', '#4ade80', '#38bdf8', '#c084fc', '#fb923c'];

const CONFETTI_PIECES = Array.from({ length: 28 }).map((_, i) => ({
  id: i,
  left: `${(i * 37) % 98}%`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  duration: `${2.2 + (i % 5) * 0.45}s`,
  delay: `${(i % 7) * 0.25}s`,
}));

export function WinCelebration({
  firstTryCount,
  onPlayAgain,
  onGoHome,
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
        <div className="win-trophy" aria-hidden="true">
          🏆
        </div>
        <RainbowTitle text="YOU WIN!!" />
        <div className="win-stars-row" aria-label={`${TOTAL_QUESTIONS} golden stars earned`}>
          {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
            <span key={i}>⭐</span>
          ))}
        </div>
        <div className="win-stats-pill">
          🎉 All {TOTAL_QUESTIONS} Problems Solved! ({firstTryCount} on the First Try!)
        </div>
      </div>

      {/* ALL 9 Hero Characters Celebrating & Dancing Together! */}
      <div className="win-cast-stage" aria-label="All cartoon characters celebrating">
        <div className="char-actor state-celebrate">
          <RumiSvg reaction="celebrate" size={108} />
        </div>
        <div className="char-actor state-celebrate delay-1">
          <JJSvg reaction="celebrate" size={112} />
        </div>
        <div className="char-actor state-celebrate delay-2">
          <HeroChickenSvg reaction="celebrate" flexing size={114} />
        </div>
        <div className="char-actor state-celebrate">
          <GiantPandaSvg reaction="celebrate" size={116} />
        </div>
        <div className="char-actor state-celebrate delay-1">
          <RedPandaSvg reaction="celebrate" size={112} />
        </div>
        <div className="char-actor state-celebrate delay-2">
          <GoldenHenSvg reaction="celebrate" size={106} />
        </div>
        <div className="char-actor state-celebrate">
          <MikeySvg reaction="celebrate" size={110} />
        </div>
        <div className="char-actor state-celebrate delay-1">
          <ZoeySvg reaction="celebrate" size={104} />
        </div>
        <div className="char-actor state-celebrate delay-2">
          <MiraSvg reaction="celebrate" size={108} />
        </div>
      </div>

      <div className="selector-row">
        <button
          id="btn-play-again"
          type="button"
          className="jelly-btn jelly-green play-cta-btn"
          onClick={onPlayAgain}
        >
          🎉 PLAY AGAIN!
        </button>
        <button
          id="btn-win-home"
          type="button"
          className="jelly-btn jelly-blue mode-btn selected"
          onClick={onGoHome}
        >
          🏠 HOME
        </button>
      </div>
    </main>
  );
}
