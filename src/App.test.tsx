import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MathProblem } from './game/types';
import { buildHint } from './game/mathEngine';
import * as mathEngine from './game/mathEngine';
import * as squads from './game/squads';
import { soundEngine } from './audio/soundEngine';
import { SIX_SEVEN_SPEECH_BUBBLE } from './game/easterEggs';
import App from './App';

function makeProblem(
  idx: number,
  a: number,
  b: number,
  op: '+' | '-',
  inputMode: 'calculator' | 'choice'
): MathProblem {
  const answer = op === '+' ? a + b : a - b;
  const key = `${a}${op}${b}`;
  return {
    id: `${key}-${idx}`,
    key,
    a,
    b,
    op,
    answer,
    inputMode,
    choices: [answer - 1, answer, answer + 1, answer + 2],
    hint: buildHint(a, b, op),
  };
}

describe('App end-to-end flow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(soundEngine, 'unlock').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'stopSpeech').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'setPartyBoost').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'setMusicEnabled').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'setVoiceEnabled').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playTap').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playCount').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playCorrect').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playWrong').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playSixSevenGiggle').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playWinFanfare').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'speak').mockImplementation(() => {});
    vi.spyOn(squads, 'shuffleSquadOrder').mockReturnValue([
      'pandas',
      'chickens',
      'jjmikey',
      'popstars',
    ]);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('plays from Home through calculator & choice questions (including 6-7 joke and hints) to Win and back Home', () => {
    vi.spyOn(mathEngine, 'generateGameSession').mockReturnValue([
      makeProblem(0, 2, 6, '+', 'calculator'), // ans 8
      makeProblem(1, 7, 3, '-', 'choice'),     // ans 4
    ]);

    render(<App />);

    // Home screen
    expect(screen.getByRole('heading', { name: 'MATH PARTY!' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /ADD/i }));
    fireEvent.click(screen.getByRole('button', { name: /Up to 10/i }));
    fireEvent.click(screen.getByRole('button', { name: /PLAY!/i }));

    // Question 1: calculator mode (2 + 6 = 8)
    expect(screen.getByRole('group', { name: 'Calculator number pad' })).toBeInTheDocument();

    // Trigger 6-7 meme easter egg via calculator pad
    fireEvent.click(screen.getByRole('button', { name: '6' }));
    fireEvent.click(screen.getByRole('button', { name: '7' }));
    expect(screen.getByText(SIX_SEVEN_SPEECH_BUBBLE)).toBeInTheDocument();

    // Open hint and trigger 6 -> 7 in counting helper
    fireEvent.click(screen.getByRole('button', { name: '💡 Hint' }));
    expect(screen.getByRole('region', { name: 'Voice-guided counting hint' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Start at 6' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tap to count step 1' }));
    expect(screen.getByText(SIX_SEVEN_SPEECH_BUBBLE)).toBeInTheDocument();

    // Solve Q1 with 8
    fireEvent.click(screen.getByRole('button', { name: '8' }));
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));
    act(() => vi.advanceTimersByTime(1500));

    // Question 2: multiple-choice mode (7 - 3 = 4)
    expect(screen.getByRole('group', { name: 'Answer choices' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '4' }));
    act(() => vi.advanceTimersByTime(1500));

    // Win screen
    expect(screen.getByRole('heading', { name: 'YOU WIN!!' })).toBeInTheDocument();
    expect(screen.getByText(/2 on the First Try/i)).toBeInTheDocument();

    // Play Again returns to Home
    fireEvent.click(screen.getByRole('button', { name: /PLAY AGAIN!/i }));
    expect(screen.getByRole('heading', { name: 'MATH PARTY!' })).toBeInTheDocument();
  });
});
