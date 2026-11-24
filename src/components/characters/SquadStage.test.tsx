import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { soundEngine } from '../../audio/soundEngine';
import { SquadStage } from './SquadStage';
import { WorldBackdrop, type BackdropTheme } from './WorldBackdrop';

describe('SquadStage, InteractiveCharacter & WorldBackdrop', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(soundEngine, 'unlock').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playTap').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playPandaMunch').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playRedPandaSqueak').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playChickenBawk').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playGoldenCluck').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playHeroBoing').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playTurtleBoing').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playPopSparkle').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playWaterSplash').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playWoodMarimba').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playFlutterChime').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playCloudPuff').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playSunChime').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playWindWhoosh').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playApplePop').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playBeeBuzz').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playFlowerPluck').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playPlaneZoom').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playBalloonBoing').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playRainbowGliss').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playStarCoin').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playEqualizerNote').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playBubblePop').mockImplementation(() => {});
    vi.spyOn(soundEngine, 'playSparklePop').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('pokes characters across all 4 squads with unique SFX, phrase badges, keyboard support, and timer cleanup', () => {
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
    act(() => vi.advanceTimersByTime(20)); // flush requestAnimationFrame
    expect(giantPanda).toHaveClass('poked');
    expect(screen.getByText('Munch! 🎋')).toBeInTheDocument();
    expect(soundEngine.playPandaMunch).toHaveBeenCalledTimes(1);

    // Rapid second tap via keyboard cycles phrase and resets timers cleanly
    fireEvent.keyDown(giantPanda, { key: 'Enter' });
    act(() => vi.advanceTimersByTime(20));
    expect(screen.getByText('Boop! 🐼')).toBeInTheDocument();
    expect(soundEngine.playPandaMunch).toHaveBeenCalledTimes(2);

    // Non-activation key does nothing
    fireEvent.keyDown(giantPanda, { key: 'Escape' });
    expect(soundEngine.playPandaMunch).toHaveBeenCalledTimes(2);

    // Space key activates Red Panda
    const redPanda = screen.getByRole('button', { name: 'Tap Red Panda' });
    fireEvent.keyDown(redPanda, { key: ' ' });
    act(() => vi.advanceTimersByTime(20));
    expect(redPanda).toHaveClass('poked');
    expect(soundEngine.playRedPandaSqueak).toHaveBeenCalledTimes(1);

    // Animation clears after 560ms, badge clears after 950ms
    act(() => vi.advanceTimersByTime(560));
    expect(redPanda).not.toHaveClass('poked');
    act(() => vi.advanceTimersByTime(450));
    expect(screen.queryByText('Boop! 🐼')).toBeNull();

    // Chickens
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
    expect(soundEngine.playChickenBawk).toHaveBeenCalledTimes(1);
    expect(soundEngine.playGoldenCluck).toHaveBeenCalledTimes(1);

    // JJ & Mikey + 6-7 meme joke badges
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
    expect(soundEngine.playHeroBoing).toHaveBeenCalledTimes(1);
    expect(soundEngine.playTurtleBoing).toHaveBeenCalledTimes(1);

    // Popstars (3 distinct sparkle variants)
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
    expect(soundEngine.playPopSparkle).toHaveBeenNthCalledWith(1, 0);
    expect(soundEngine.playPopSparkle).toHaveBeenNthCalledWith(2, 1);
    expect(soundEngine.playPopSparkle).toHaveBeenNthCalledWith(3, 2);
  });

  it('renders and triggers all interactive stage gags via click and keyboard', () => {
    const onTriggerGag = vi.fn();

    // 1) Panda tower -> click + Enter -> Panda rain
    const { rerender } = render(
      <SquadStage
        squadId="pandas"
        reaction="idle"
        speechText={null}
        gagState={{ kind: 'panda-tower' }}
        onTriggerGag={onTriggerGag}
      />
    );
    const tower = screen.getByRole('button', { name: 'Tap wobbly bamboo tower' });
    fireEvent.click(tower);
    fireEvent.keyDown(tower, { key: 'Enter' });
    expect(onTriggerGag).toHaveBeenCalledTimes(2);

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

    // 2) Raccoon sneaking -> click + Space -> Raccoon chasing
    rerender(
      <SquadStage
        squadId="chickens"
        reaction="idle"
        speechText={null}
        gagState={{ kind: 'raccoon-sneaking' }}
        onTriggerGag={onTriggerGag}
      />
    );
    const raccoon = screen.getByRole('button', { name: /Tap sneaky raccoon/i });
    fireEvent.click(raccoon);
    fireEvent.keyDown(raccoon, { key: ' ' });
    expect(onTriggerGag).toHaveBeenCalledTimes(4);

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

    // 3) Gwi-Ma arrives -> click + Enter -> Gwi-Ma blasted
    rerender(
      <SquadStage
        squadId="popstars"
        reaction="idle"
        speechText={null}
        gagState={{ kind: 'gwima-arrives' }}
        onTriggerGag={onTriggerGag}
      />
    );
    const gwima = screen.getByRole('button', { name: /Tap Gwi-Ma/i });
    fireEvent.click(gwima);
    fireEvent.keyDown(gwima, { key: 'Enter' });
    expect(onTriggerGag).toHaveBeenCalledTimes(6);

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

  it('handles ambient clicks, floating notes, and every clickable SVG prop across all 6 WorldBackdrop themes', () => {
    const themes: BackdropTheme[] = [
      'pandas',
      'chickens',
      'jjmikey',
      'popstars',
      'home',
      'win',
    ];

    for (const theme of themes) {
      const { container, unmount } = render(<WorldBackdrop theme={theme} />);
      const backdrop = screen.getByLabelText('Interactive animated world background');
      vi.spyOn(backdrop, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 1000,
        height: 600,
        right: 1000,
        bottom: 600,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      expect(container.querySelector('.world-backdrop svg')).not.toBeNull();

      // Ambient open-sky click spawns burst and plays pitch-varied sparkle pop
      fireEvent.click(backdrop, { clientX: 250, clientY: 150 });
      expect(soundEngine.playSparklePop).toHaveBeenCalledWith(0.25);
      expect(container.querySelectorAll('.bg-burst-origin').length).toBeGreaterThanOrEqual(1);

      // Click floating musical notes
      const notes = container.querySelectorAll('.music-note-float.interactive');
      expect(notes).toHaveLength(3);
      fireEvent.click(notes[0], { clientX: 160, clientY: 60 });
      act(() => vi.advanceTimersByTime(20));
      expect(notes[0]).toHaveClass('bg-react-boing');

      // Click every interactive SVG prop in this theme (plus rapid double-tap on the first prop)
      const clickables = container.querySelectorAll('.bg-clickable');
      expect(clickables.length).toBeGreaterThan(0);
      clickables.forEach((el, idx) => {
        fireEvent.click(el, { clientX: 100 + idx * 10, clientY: 120 });
      });
      // Rapid second click on first clickable exercises existingTimer replacement
      fireEvent.click(clickables[0], { clientX: 100, clientY: 120 });

      act(() => vi.advanceTimersByTime(20));
      expect(container.querySelectorAll('.bg-burst-origin').length).toBeGreaterThan(0);

      // Bursts and active prop timers clean up cleanly
      act(() => vi.advanceTimersByTime(1500));
      expect(container.querySelectorAll('.bg-burst-origin')).toHaveLength(0);
      unmount();
    }

    // Verify all major theme SFX categories fired across the 6 worlds
    expect(soundEngine.playWaterSplash).toHaveBeenCalled();
    expect(soundEngine.playWoodMarimba).toHaveBeenCalled();
    expect(soundEngine.playFlutterChime).toHaveBeenCalled();
    expect(soundEngine.playCloudPuff).toHaveBeenCalled();
    expect(soundEngine.playSunChime).toHaveBeenCalled();
    expect(soundEngine.playWindWhoosh).toHaveBeenCalled();
    expect(soundEngine.playApplePop).toHaveBeenCalled();
    expect(soundEngine.playBeeBuzz).toHaveBeenCalled();
    expect(soundEngine.playFlowerPluck).toHaveBeenCalled();
    expect(soundEngine.playPlaneZoom).toHaveBeenCalled();
    expect(soundEngine.playBalloonBoing).toHaveBeenCalled();
    expect(soundEngine.playRainbowGliss).toHaveBeenCalled();
    expect(soundEngine.playStarCoin).toHaveBeenCalled();
    expect(soundEngine.playEqualizerNote).toHaveBeenCalled();
    expect(soundEngine.playBubblePop).toHaveBeenCalled();
  });
});
