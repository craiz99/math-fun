import { useMathGame } from './game/useMathGame';
import { WorldBackdrop } from './components/characters/WorldBackdrop';
import { SquadStage } from './components/characters/SquadStage';
import { TopBar } from './components/game/TopBar';
import { MathCard } from './components/game/MathCard';
import { CalculatorPad } from './components/game/CalculatorPad';
import { MultipleChoicePad } from './components/game/MultipleChoicePad';
import { HomeScreen } from './components/game/HomeScreen';
import { WinCelebration } from './components/game/WinCelebration';

export function App() {
  const game = useMathGame();
  const backdropTheme =
    game.screen === 'home'
      ? 'home'
      : game.screen === 'win'
        ? 'win'
        : game.activeSquadId;

  return (
    <div className="app-shell">
      <WorldBackdrop theme={backdropTheme} />

      {game.screen === 'home' && (
        <HomeScreen
          opMode={game.opMode}
          level={game.level}
          musicOn={game.musicOn}
          voiceOn={game.voiceOn}
          onSelectOp={game.selectOp}
          onSelectLevel={game.selectLevel}
          onToggleMusic={game.toggleMusic}
          onToggleVoice={game.toggleVoice}
          onStartGame={() => game.startNewGame(game.level, game.opMode)}
        />
      )}

      {game.screen === 'play' && game.currentProblem && (
        <div className="game-layer">
          <TopBar
            squadOrder={game.squadOrder}
            questionIndex={game.questionIndex}
            level={game.level}
            musicOn={game.musicOn}
            voiceOn={game.voiceOn}
            onToggleMusic={game.toggleMusic}
            onToggleVoice={game.toggleVoice}
            onGoHome={game.goHome}
          />

          {game.squadToast && <div className="squad-toast">{game.squadToast}</div>}

          <main className="play-grid">
            <div className="play-left">
              <MathCard
                problem={game.currentProblem}
                squad={game.activeSquad}
                typedValue={game.typedValue}
                answerState={game.answerState}
                hintLevel={game.hintLevel}
                walkthroughTrigger={game.walkthroughTrigger}
                onRequestHint={game.handleRequestHint}
                onNewProblem={game.handleNewProblem}
                onReadEquation={game.handleReadEquation}
              />

              <SquadStage
                squadId={game.activeSquadId}
                reaction={game.reaction}
                speechText={game.speechText}
                gagState={game.gagState}
                onTriggerGag={game.triggerStageGag}
              />
            </div>

            <aside className="play-right" aria-label="Answer input">
              {game.currentProblem.inputMode === 'calculator' ? (
                <CalculatorPad
                  disabled={game.answerState === 'correct'}
                  canSubmit={game.typedValue.length > 0}
                  onDigit={game.handleDigit}
                  onBackspace={game.handleBackspace}
                  onSubmit={game.handleCalcSubmit}
                />
              ) : (
                <MultipleChoicePad
                  choices={game.currentProblem.choices}
                  disabled={game.answerState === 'correct'}
                  eliminated={game.eliminatedChoices}
                  onSelect={game.handleSelectChoice}
                />
              )}
            </aside>
          </main>
        </div>
      )}

      {game.screen === 'win' && (
        <WinCelebration
          firstTryCount={game.firstTryCount}
          onPlayAgain={game.goHome}
        />
      )}
    </div>
  );
}

export default App;
