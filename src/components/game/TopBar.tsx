import type { DifficultyLevel } from '../../game/types';
import { QUESTIONS_PER_SQUAD, SQUADS, SQUAD_ORDER } from '../../game/squads';

interface TopBarProps {
  questionIndex: number;
  level: DifficultyLevel;
  musicOn: boolean;
  voiceOn: boolean;
  onToggleMusic: () => void;
  onToggleVoice: () => void;
  onGoHome: () => void;
}

const LEVEL_LABELS: Record<DifficultyLevel, string> = {
  1: 'Up to 15',
  2: 'Up to 20',
  3: 'Up to 50',
};

export function TopBar({
  questionIndex,
  level,
  musicOn,
  voiceOn,
  onToggleMusic,
  onToggleVoice,
  onGoHome,
}: TopBarProps) {
  const activeSquadIdx = Math.min(
    SQUAD_ORDER.length - 1,
    Math.floor(questionIndex / QUESTIONS_PER_SQUAD)
  );
  const starsInSquad = questionIndex % QUESTIONS_PER_SQUAD;

  return (
    <header className="top-bar">
      {/* Upper-left 4-Squad Progress Bar */}
      <div
        className="squad-progress-bar"
        aria-label={`Progress: question ${questionIndex + 1} of ${SQUAD_ORDER.length * QUESTIONS_PER_SQUAD}`}
      >
        {SQUAD_ORDER.map((id, idx) => {
          const squad = SQUADS[id];
          const isDone = idx < activeSquadIdx;
          const isActive = idx === activeSquadIdx;
          const railPct = isDone
            ? 100
            : isActive
              ? Math.round((starsInSquad / QUESTIONS_PER_SQUAD) * 100)
              : 0;

          return (
            <div key={id} className="squad-node-wrap">
              <div
                className={`squad-node ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
                title={squad.name}
              >
                {isActive && (
                  <div className="squad-mini-stars" aria-hidden="true">
                    {Array.from({ length: QUESTIONS_PER_SQUAD }).map((_, s) => (
                      <span key={s}>{s < starsInSquad ? '⭐' : '☆'}</span>
                    ))}
                  </div>
                )}
                <span>{isDone ? '⭐' : squad.badgeEmoji}</span>
              </div>

              {idx < SQUAD_ORDER.length - 1 && (
                <div className="squad-rail">
                  <div className="squad-rail-fill" style={{ width: `${railPct}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Level Badge */}
      <div className="top-center-pill">{LEVEL_LABELS[level]}</div>

      {/* Music, Voice & Home Controls */}
      <div className="top-controls">
        <button
          id="btn-music-toggle"
          type="button"
          className={`jelly-btn icon-btn ${musicOn ? 'jelly-pink' : 'jelly-slate'}`}
          onClick={onToggleMusic}
          aria-label={musicOn ? 'Turn music off' : 'Turn music on'}
          title={musicOn ? 'Music On' : 'Music Off'}
        >
          {musicOn ? '🎵' : '🔇'}
        </button>
        <button
          id="btn-voice-toggle"
          type="button"
          className={`jelly-btn icon-btn ${voiceOn ? 'jelly-blue' : 'jelly-slate'}`}
          onClick={onToggleVoice}
          aria-label={voiceOn ? 'Turn voice hints off' : 'Turn voice hints on'}
          title={voiceOn ? 'Voice On' : 'Voice Off'}
        >
          {voiceOn ? '🗣️' : '🤫'}
        </button>
        <button
          id="btn-home"
          type="button"
          className="jelly-btn icon-btn jelly-green"
          onClick={onGoHome}
          aria-label="Back to Home"
          title="Home"
        >
          🏠
        </button>
      </div>
    </header>
  );
}
