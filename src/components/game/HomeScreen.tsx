import type { DifficultyLevel, OperationMode } from '../../game/types';
import { GiantPandaSvg, RedPandaSvg } from '../characters/PandaSquad';
import { GoldenHenSvg, HeroChickenSvg } from '../characters/ChickenCrew';
import { JJSvg, MikeySvg } from '../characters/JJAndMikey';
import { MiraSvg, RumiSvg, ZoeySvg } from '../characters/PopStarTrio';
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
      <div className="home-top-bar">
        <button
          id="home-music-toggle"
          type="button"
          className={`jelly-btn icon-btn ${musicOn ? 'jelly-pink' : 'jelly-slate'}`}
          onClick={onToggleMusic}
          aria-label={musicOn ? 'Turn music off' : 'Turn music on'}
        >
          {musicOn ? '🎵' : '🔇'}
        </button>
        <button
          id="home-voice-toggle"
          type="button"
          className={`jelly-btn icon-btn ${voiceOn ? 'jelly-blue' : 'jelly-slate'}`}
          onClick={onToggleVoice}
          aria-label={voiceOn ? 'Turn voice off' : 'Turn voice on'}
        >
          {voiceOn ? '🗣️' : '🤫'}
        </button>
      </div>

      <RainbowTitle text="MATH PARTY!" />

      {/* Full Cartoon Cast Waving Together */}
      <div className="home-cast-row" aria-label="Math Party cartoon friends">
        <div className="char-actor state-idle">
          <JJSvg size={102} />
        </div>
        <div className="char-actor state-idle delay-1">
          <MikeySvg size={98} />
        </div>
        <div className="char-actor state-idle delay-2">
          <RedPandaSvg size={100} />
        </div>
        <div className="char-actor state-idle">
          <GiantPandaSvg size={104} />
        </div>
        <div className="char-actor state-idle delay-1">
          <HeroChickenSvg flexing size={102} />
        </div>
        <div className="char-actor state-idle delay-2">
          <GoldenHenSvg size={94} />
        </div>
        <div className="char-actor state-idle">
          <RumiSvg size={98} />
        </div>
        <div className="char-actor state-idle delay-1">
          <ZoeySvg size={94} />
        </div>
        <div className="char-actor state-idle delay-2">
          <MiraSvg size={98} />
        </div>
      </div>

      <section className="home-controls-card" aria-label="Game options">
        {/* Operation Selector */}
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

        {/* Difficulty Tier Selector */}
        <div className="selector-row" role="group" aria-label="Choose number level">
          <button
            id="level-1"
            type="button"
            className={`jelly-btn jelly-blue mode-btn ${level === 1 ? 'selected' : ''}`}
            onClick={() => onSelectLevel(1)}
          >
            ⭐ Up to 15
          </button>
          <button
            id="level-2"
            type="button"
            className={`jelly-btn jelly-purple mode-btn ${level === 2 ? 'selected' : ''}`}
            onClick={() => onSelectLevel(2)}
          >
            🌟 Up to 20
          </button>
          <button
            id="level-3"
            type="button"
            className={`jelly-btn jelly-pink mode-btn ${level === 3 ? 'selected' : ''}`}
            onClick={() => onSelectLevel(3)}
          >
            🚀 Up to 50
          </button>
        </div>

        <button
          id="btn-start-game"
          type="button"
          className="jelly-btn jelly-green play-cta-btn"
          onClick={onStartGame}
        >
          ▶ PLAY!
        </button>
      </section>
    </main>
  );
}
