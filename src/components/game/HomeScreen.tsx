import type { DifficultyLevel, OperationMode } from '../../game/types';
import { GiantPandaSvg, RedPandaSvg } from '../characters/PandaSquad';
import { GoldenHenSvg, HeroChickenSvg } from '../characters/ChickenCrew';
import { JJSvg, MikeySvg } from '../characters/JJAndMikey';
import { MiraSvg, RumiSvg, ZoeySvg } from '../characters/PopStarTrio';
import { InteractiveCharacter } from '../characters/InteractiveCharacter';
import { RainbowTitle } from './RainbowTitle';

interface HomeScreenProps {
  opMode: OperationMode;
  level: DifficultyLevel;
  musicOn: boolean;
  voiceOn: boolean;
  onSelectOp: (mode: OperationMode) => void;
  onSelectLevel: (level: DifficultyLevel) => void;
  onToggleMusic: () => void;
  onToggleVoice: () => void;
  onStartGame: () => void;
}

export function HomeScreen({
  opMode,
  level,
  musicOn,
  voiceOn,
  onSelectOp,
  onSelectLevel,
  onToggleMusic,
  onToggleVoice,
  onStartGame,
}: HomeScreenProps) {
  return (
    <main className="home-screen">
      <div className="home-header-bar">
        <div className="home-title-spacer" aria-hidden="true" />
        <RainbowTitle text="MATH PARTY!" />
        <div className="home-audio-controls">
          <button
            id="home-music-toggle"
            type="button"
            className={`jelly-btn icon-btn icon-btn-lg ${musicOn ? 'jelly-pink' : 'jelly-slate'}`}
            onClick={onToggleMusic}
            aria-label={musicOn ? 'Turn music off' : 'Turn music on'}
          >
            {musicOn ? '🎵' : '🔇'}
          </button>
          <button
            id="home-voice-toggle"
            type="button"
            className={`jelly-btn icon-btn icon-btn-lg ${voiceOn ? 'jelly-blue' : 'jelly-slate'}`}
            onClick={onToggleVoice}
            aria-label={voiceOn ? 'Turn voice off' : 'Turn voice on'}
          >
            {voiceOn ? '🗣️' : '🤫'}
          </button>
        </div>
      </div>

      {/* HUGE 2-Tier Staggered Cartoon Cast Poster */}
      <div className="cast-poster home-cast-poster" aria-label="Math Party cartoon friends">
        <div className="cast-row-back">
          <InteractiveCharacter
            characterId="giant-panda"
            renderCharacter={(r) => <GiantPandaSvg reaction={r} size={166} />}
          />
          <InteractiveCharacter
            characterId="hero-chicken"
            delayClass="delay-1"
            renderCharacter={(r) => <HeroChickenSvg reaction={r} flexing size={164} />}
          />
          <InteractiveCharacter
            characterId="jj"
            delayClass="delay-2"
            renderCharacter={(r) => <JJSvg reaction={r} size={164} />}
          />
          <InteractiveCharacter
            characterId="zoey"
            renderCharacter={(r) => <ZoeySvg reaction={r} size={156} />}
          />
        </div>
        <div className="cast-row-front">
          <InteractiveCharacter
            characterId="red-panda"
            delayClass="delay-1"
            renderCharacter={(r) => <RedPandaSvg reaction={r} size={160} />}
          />
          <InteractiveCharacter
            characterId="golden-hen"
            delayClass="delay-2"
            renderCharacter={(r) => <GoldenHenSvg reaction={r} size={150} />}
          />
          <InteractiveCharacter
            characterId="mikey"
            renderCharacter={(r) => <MikeySvg reaction={r} size={158} />}
          />
          <InteractiveCharacter
            characterId="rumi"
            delayClass="delay-1"
            renderCharacter={(r) => <RumiSvg reaction={r} size={160} />}
          />
          <InteractiveCharacter
            characterId="mira"
            delayClass="delay-2"
            renderCharacter={(r) => <MiraSvg reaction={r} size={160} />}
          />
        </div>
      </div>

      <section className="home-controls-card" aria-label="Game options">
        <div className="selector-row" role="group" aria-label="Choose math operation">
          <button
            id="mode-add"
            type="button"
            className={`jelly-btn jelly-green mode-btn ${opMode === 'add' ? 'selected' : ''}`}
            onClick={() => onSelectOp('add')}
          >
            ➕ ADD
          </button>
          <button
            id="mode-sub"
            type="button"
            className={`jelly-btn jelly-orange mode-btn ${opMode === 'sub' ? 'selected' : ''}`}
            onClick={() => onSelectOp('sub')}
          >
            ➖ SUBTRACT
          </button>
          <button
            id="mode-mix"
            type="button"
            className={`jelly-btn jelly-rainbow mode-btn ${opMode === 'mix' ? 'selected' : ''}`}
            onClick={() => onSelectOp('mix')}
          >
            ➕➖ MIX!
          </button>
        </div>

        <div className="selector-row" role="group" aria-label="Choose number level and start">
          <button
            id="level-1"
            type="button"
            className={`jelly-btn jelly-blue mode-btn ${level === 1 ? 'selected' : ''}`}
            onClick={() => onSelectLevel(1)}
          >
            ⭐ Up to 10
          </button>
          <button
            id="level-2"
            type="button"
            className={`jelly-btn jelly-purple mode-btn ${level === 2 ? 'selected' : ''}`}
            onClick={() => onSelectLevel(2)}
          >
            🌟 Up to 15
          </button>
          <button
            id="level-3"
            type="button"
            className={`jelly-btn jelly-pink mode-btn ${level === 3 ? 'selected' : ''}`}
            onClick={() => onSelectLevel(3)}
          >
            🚀 Up to 20
          </button>
          <button
            id="btn-start-game"
            type="button"
            className="jelly-btn jelly-green play-cta-btn"
            onClick={onStartGame}
          >
            ▶ PLAY!
          </button>
        </div>
      </section>
    </main>
  );
}
