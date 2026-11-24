import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { MathProblem } from '../../game/types';
import { buildHint } from '../../game/mathEngine';
import { SQUADS, SQUAD_ORDER, TOTAL_QUESTIONS } from '../../game/squads';
import { CalculatorPad } from './CalculatorPad';
import { MultipleChoicePad } from './MultipleChoicePad';
import { MathCard } from './MathCard';
import { TopBar } from './TopBar';
import { HomeScreen } from './HomeScreen';
import { WinCelebration } from './WinCelebration';
import { RainbowTitle } from './RainbowTitle';

const sampleSubProblem: MathProblem = {
  id: '12-5-1',
  key: '12-5',
  a: 12,
  b: 5,
  op: '-',
  answer: 7,
  inputMode: 'calculator',
  choices: [5, 6, 7, 8],
  hint: buildHint(12, 5, '-'),
};

describe('Game UI components', () => {
  describe('RainbowTitle', () => {
    it('renders letters with rainbow colors and preserves spaces', () => {
      const { container } = render(<RainbowTitle text="HI MOM" />);
      const heading = screen.getByRole('heading', { name: 'HI MOM' });
      expect(heading).toBeInTheDocument();
      const letters = container.querySelectorAll('.title-rainbow-letter');
      expect(letters).toHaveLength(6);
      expect(letters[2].textContent).toBe('\u00A0');
    });
  });

  describe('CalculatorPad', () => {
    it('fires digit, backspace, and submit callbacks and respects disabled/canSubmit', () => {
      const onDigit = vi.fn();
      const onBackspace = vi.fn();
      const onSubmit = vi.fn();

      const { rerender } = render(
        <CalculatorPad
          disabled={false}
          canSubmit={false}
          onDigit={onDigit}
          onBackspace={onBackspace}
          onSubmit={onSubmit}
        />
      );

      for (const digit of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) {
        fireEvent.click(screen.getByRole('button', { name: digit }));
      }
      expect(onDigit).toHaveBeenCalledTimes(10);
      expect(onDigit).toHaveBeenCalledWith('0');
      expect(onDigit).toHaveBeenCalledWith('9');

      fireEvent.click(screen.getByRole('button', { name: 'Backspace' }));
      expect(onBackspace).toHaveBeenCalledTimes(1);

      const submitBtn = screen.getByRole('button', { name: 'Check answer' });
      expect(submitBtn).toBeDisabled();

      rerender(
        <CalculatorPad
          disabled={false}
          canSubmit={true}
          onDigit={onDigit}
          onBackspace={onBackspace}
          onSubmit={onSubmit}
        />
      );
      expect(submitBtn).not.toBeDisabled();
      fireEvent.click(submitBtn);
      expect(onSubmit).toHaveBeenCalledTimes(1);

      rerender(
        <CalculatorPad
          disabled={true}
          canSubmit={true}
          onDigit={onDigit}
          onBackspace={onBackspace}
          onSubmit={onSubmit}
        />
      );
      expect(screen.getByRole('button', { name: '7' })).toBeDisabled();
      expect(submitBtn).toBeDisabled();
    });
  });

  describe('MultipleChoicePad', () => {
    it('renders choices, disables eliminated options, and reports selection', () => {
      const onSelect = vi.fn();
      render(
        <MultipleChoicePad
          choices={[5, 6, 7, 8]}
          disabled={false}
          eliminated={[6]}
          onSelect={onSelect}
        />
      );

      expect(screen.getByText('Tap the Answer!')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '6' })).toBeDisabled();

      fireEvent.click(screen.getByRole('button', { name: '7' }));
      expect(onSelect).toHaveBeenCalledWith(7);
    });
  });

  describe('MathCard', () => {
    it('renders equation, answer states, action buttons, and mounts HintVisual when requested', () => {
      const onRequestHint = vi.fn();
      const onNewProblem = vi.fn();
      const onReadEquation = vi.fn();
      const onSixSevenEasterEgg = vi.fn();

      const { container, rerender } = render(
        <MathCard
          problem={sampleSubProblem}
          squad={SQUADS.pandas}
          typedValue=""
          answerState="idle"
          hintLevel={0}
          walkthroughTrigger={0}
          onRequestHint={onRequestHint}
          onNewProblem={onNewProblem}
          onReadEquation={onReadEquation}
          onSixSevenEasterEgg={onSixSevenEasterEgg}
        />
      );

      expect(screen.getByText('−')).toBeInTheDocument();
      expect(container.querySelector('.answer-slot')?.textContent).toBe('?');
      expect(screen.queryByRole('region', { name: 'Voice-guided counting hint' })).toBeNull();

      fireEvent.click(screen.getByRole('button', { name: 'Read math problem aloud' }));
      fireEvent.click(screen.getByRole('button', { name: /New/i }));
      fireEvent.click(screen.getByRole('button', { name: /Hint/i }));
      expect(onReadEquation).toHaveBeenCalledTimes(1);
      expect(onNewProblem).toHaveBeenCalledTimes(1);
      expect(onRequestHint).toHaveBeenCalledTimes(1);

      // Filled + joke + hintLevel 1
      rerender(
        <MathCard
          problem={sampleSubProblem}
          squad={SQUADS.pandas}
          typedValue="67"
          answerState="joke"
          hintLevel={1}
          walkthroughTrigger={0}
          onRequestHint={onRequestHint}
          onNewProblem={onNewProblem}
          onReadEquation={onReadEquation}
          onSixSevenEasterEgg={onSixSevenEasterEgg}
        />
      );
      expect(container.querySelector('.answer-slot')).toHaveClass('joke');
      expect(container.querySelector('.answer-slot')?.textContent).toBe('67');
      expect(screen.getByRole('button', { name: /Count With Me/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Voice-guided counting hint' })).toBeInTheDocument();

      // Wrong state
      rerender(
        <MathCard
          problem={sampleSubProblem}
          squad={SQUADS.pandas}
          typedValue="5"
          answerState="wrong"
          hintLevel={1}
          walkthroughTrigger={0}
          onRequestHint={onRequestHint}
          onNewProblem={onNewProblem}
          onReadEquation={onReadEquation}
          onSixSevenEasterEgg={onSixSevenEasterEgg}
        />
      );
      expect(container.querySelector('.answer-slot')).toHaveClass('wrong');

      // Correct state disables New button and shows problem answer
      rerender(
        <MathCard
          problem={sampleSubProblem}
          squad={SQUADS.pandas}
          typedValue=""
          answerState="correct"
          hintLevel={0}
          walkthroughTrigger={0}
          onRequestHint={onRequestHint}
          onNewProblem={onNewProblem}
          onReadEquation={onReadEquation}
          onSixSevenEasterEgg={onSixSevenEasterEgg}
        />
      );
      expect(container.querySelector('.answer-slot')).toHaveClass('correct');
      expect(container.querySelector('.answer-slot')?.textContent).toBe('7');
      expect(screen.getByRole('button', { name: /New/i })).toBeDisabled();
    });
  });

  describe('TopBar', () => {
    it('shows progress across squads, level label, and audio/home buttons', () => {
      const onToggleMusic = vi.fn();
      const onToggleVoice = vi.fn();
      const onGoHome = vi.fn();

      const { rerender } = render(
        <TopBar
          squadOrder={SQUAD_ORDER}
          questionIndex={4}
          level={2}
          musicOn={true}
          voiceOn={true}
          onToggleMusic={onToggleMusic}
          onToggleVoice={onToggleVoice}
          onGoHome={onGoHome}
        />
      );

      expect(screen.getByLabelText('Progress: question 5 of 12')).toBeInTheDocument();
      expect(screen.getByText('Up to 15')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Turn music off' }));
      fireEvent.click(screen.getByRole('button', { name: 'Turn voice hints off' }));
      fireEvent.click(screen.getByRole('button', { name: 'Back to Home' }));
      expect(onToggleMusic).toHaveBeenCalledTimes(1);
      expect(onToggleVoice).toHaveBeenCalledTimes(1);
      expect(onGoHome).toHaveBeenCalledTimes(1);

      rerender(
        <TopBar
          squadOrder={SQUAD_ORDER}
          questionIndex={11}
          level={3}
          musicOn={false}
          voiceOn={false}
          onToggleMusic={onToggleMusic}
          onToggleVoice={onToggleVoice}
          onGoHome={onGoHome}
        />
      );
      expect(screen.getByText('Up to 20')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Turn music on' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Turn voice hints on' })).toBeInTheDocument();
    });
  });

  describe('HomeScreen', () => {
    it('renders operation/level selectors, audio toggles, and PLAY button', () => {
      const onSelectOp = vi.fn();
      const onSelectLevel = vi.fn();
      const onToggleMusic = vi.fn();
      const onToggleVoice = vi.fn();
      const onStartGame = vi.fn();

      render(
        <HomeScreen
          opMode="mix"
          level={2}
          musicOn={false}
          voiceOn={false}
          onSelectOp={onSelectOp}
          onSelectLevel={onSelectLevel}
          onToggleMusic={onToggleMusic}
          onToggleVoice={onToggleVoice}
          onStartGame={onStartGame}
        />
      );

      expect(screen.getByRole('heading', { name: 'MATH PARTY!' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /ADD/i }));
      fireEvent.click(screen.getByRole('button', { name: /SUBTRACT/i }));
      fireEvent.click(screen.getByRole('button', { name: /MIX/i }));
      expect(onSelectOp).toHaveBeenNthCalledWith(1, 'add');
      expect(onSelectOp).toHaveBeenNthCalledWith(2, 'sub');
      expect(onSelectOp).toHaveBeenNthCalledWith(3, 'mix');

      fireEvent.click(screen.getByRole('button', { name: /Up to 10/i }));
      fireEvent.click(screen.getByRole('button', { name: /Up to 15/i }));
      fireEvent.click(screen.getByRole('button', { name: /Up to 20/i }));
      expect(onSelectLevel).toHaveBeenNthCalledWith(1, 1);
      expect(onSelectLevel).toHaveBeenNthCalledWith(2, 2);
      expect(onSelectLevel).toHaveBeenNthCalledWith(3, 3);

      fireEvent.click(screen.getByRole('button', { name: 'Turn music on' }));
      fireEvent.click(screen.getByRole('button', { name: 'Turn voice on' }));
      fireEvent.click(screen.getByRole('button', { name: /PLAY!/i }));
      expect(onToggleMusic).toHaveBeenCalledTimes(1);
      expect(onToggleVoice).toHaveBeenCalledTimes(1);
      expect(onStartGame).toHaveBeenCalledTimes(1);
    });
  });

  describe('WinCelebration', () => {
    it('shows solved stats, stars, and triggers onPlayAgain', () => {
      const onPlayAgain = vi.fn();
      render(<WinCelebration firstTryCount={10} onPlayAgain={onPlayAgain} />);

      expect(screen.getByRole('heading', { name: 'YOU WIN!!' })).toBeInTheDocument();
      expect(
        screen.getByText(`🎉 All ${TOTAL_QUESTIONS} Solved! (10 on the First Try!)`)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(`${TOTAL_QUESTIONS} golden stars earned`)
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /PLAY AGAIN!/i }));
      expect(onPlayAgain).toHaveBeenCalledTimes(1);
    });
  });
});
