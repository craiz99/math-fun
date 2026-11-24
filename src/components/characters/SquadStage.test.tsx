import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { soundEngine } from '../../audio/soundEngine';
import { SquadStage } from './SquadStage';
import { WorldBackdrop, type BackdropTheme } from './WorldBackdrop';

describe('SquadStage & WorldBackdrop', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(soundEngine, 'playTap').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playChickenBawk').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('pokes characters across all 4 squads, plays bawk for chickens, and clears poked class', () => {
    const onTriggerGag = vi.fn();
    const { rerender } = render(
      <SquadStage
        squadId="pandas"
        reaction="encourage"
        speechText="Let's count!"
        gagState={{ kind: 'none' }}
        onTriggerGag={onTriggerGag}
      />
    );

    expect(screen.getByText("Let's count!")).toHaveClass('encourage');
    const giantPanda = screen.getByRole('button', { name: 'Tap Giant Panda' });
    fireEvent.click(giantPanda);
    expect(giantPanda).toHaveClass('poked');
    expect(soundEngine.playTap).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Tap Red Panda' }));
    act(() => vi.advanceTimersByTime(480));
    expect(screen.getByRole('button', { name: 'Tap Red Panda' })).not.toHaveClass('poked');

    // Chickens use playChickenBawk
    rerender(
      <SquadStage
        squadId="chickens"
        reaction="happy"
        speechText="BAWK YEAH!!"
        gagState={{ kind: 'raccoon-victory' }}
        onTriggerGag={onTriggerGag}
      />
    );
    expect(screen.getByText('BAWK YEAH!!')).toHaveClass('happy');
    fireEvent.click(screen.getByRole('button', { name: 'Tap Hero White Chicken' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tap Golden Hen' }));
    expect(soundEngine.playChickenBawk).toHaveBeenCalledTimes(2);

    // JJ & Mikey
    rerender(
      <SquadStage
        squadId="jjmikey"
        reaction="idle"
        speechText="Six seven ha ha ha...good one! 😂"
        gagState={{ kind: 'none' }}
        sixSevenJoke={true}
        onTriggerGag={onTriggerGag}
      />
    );
    expect(screen.getByText('Six seven ha ha ha...good one! 😂')).toHaveClass('joke');
    expect(screen.getByText('6 🤲')).toBeInTheDocument();
    expect(screen.getByText('🤲 7')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tap JJ' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tap Mikey' }));

    // Popstars
    rerender(
      <SquadStage
        squadId="popstars"
        reaction="celebrate"
        speechText={null}
        gagState={{ kind: 'none' }}
        onTriggerGag={onTriggerGag}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tap Rumi' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tap Zoey' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tap Mira' }));
    expect(soundEngine.playTap).toHaveBeenCalledTimes(7);
  });

  it('renders and triggers all interactive stage gags', () => {
    const onTriggerGag = vi.fn();

    // 1) Panda tower -> click -> Panda rain
    const { rerender } = render(
      <SquadStage
        squadId="pandas"
        reaction="idle"
        speechText={null}
        gagState={{ kind: 'panda-tower' }}
        onTriggerGag={onTriggerGag}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tap wobbly bamboo tower' }));
    expect(onTriggerGag).toHaveBeenCalledTimes(1);

    rerender(
      <SquadStage
        squadId="pandas"
        reaction="happy"
        speechText={null}
        gagState={{ kind: 'panda-rain' }}
        onTriggerGag={onTriggerGag}
      />
    );
    expect(screen.getByText('NOM NOM NOM!!')).toBeInTheDocument();

    // 2) Raccoon sneaking -> click -> Raccoon chasing
    rerender(
      <SquadStage
        squadId="chickens"
        reaction="idle"
        speechText={null}
        gagState={{ kind: 'raccoon-sneaking' }}
        onTriggerGag={onTriggerGag}
      />
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Tap sneaky raccoon/i })
    );
    expect(onTriggerGag).toHaveBeenCalledTimes(2);

    rerender(
      <SquadStage
        squadId="chickens"
        reaction="happy"
        speechText={null}
        gagState={{ kind: 'raccoon-chasing' }}
        onTriggerGag={onTriggerGag}
      />
    );
    expect(screen.getByText('PECK ATTACK!')).toBeInTheDocument();

    // 3) Gwi-Ma arrives -> click -> Gwi-Ma blasted
    rerender(
      <SquadStage
        squadId="popstars"
        reaction="idle"
        speechText={null}
        gagState={{ kind: 'gwima-arrives' }}
        onTriggerGag={onTriggerGag}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Tap Gwi-Ma/i }));
    expect(onTriggerGag).toHaveBeenCalledTimes(3);

    rerender(
      <SquadStage
        squadId="popstars"
        reaction="happy"
        speechText={null}
        gagState={{ kind: 'gwima-blasted' }}
        onTriggerGag={onTriggerGag}
      />
    );
    expect(screen.getByText('STAR POWER!!')).toBeInTheDocument();

    // 4) JJ & Mikey prank -> JJ corrects
    rerender(
      <SquadStage
        squadId="jjmikey"
        reaction="encourage"
        speechText={null}
        gagState={{ kind: 'mikey-prank' }}
        onTriggerGag={onTriggerGag}
      />
    );
    expect(screen.getByText('WRONG!! HEHEHE!!')).toBeInTheDocument();

    rerender(
      <SquadStage
        squadId="jjmikey"
        reaction="happy"
        speechText={null}
        gagState={{ kind: 'jj-corrects' }}
        onTriggerGag={onTriggerGag}
      />
    );
    expect(screen.getByText("MIKEY!! That's RIGHT!!")).toBeInTheDocument();
    expect(screen.getByText('HEHE! JUST KIDDING!!')).toBeInTheDocument();
  });

  it('renders WorldBackdrop SVG scenes for every theme', () => {
    const themes: BackdropTheme[] = [
      'home',
      'win',
      'pandas',
      'chickens',
      'jjmikey',
      'popstars',
    ];
    for (const theme of themes) {
      const { container, unmount } = render(<WorldBackdrop theme={theme} />);
      expect(container.querySelector('.world-backdrop svg')).not.toBeNull();
      unmount();
    }
  });
});
