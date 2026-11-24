import { describe, expect, it } from 'vitest';
import {
  CHARACTER_INTERACTIONS,
  WORLD_AMBIENT_TAPS,
  getCharacterPokeEffect,
  type CharacterId,
  type WorldBackdropTheme,
} from './characterInteractions';
import { soundEngine } from '../../audio/soundEngine';

const ALL_CHARACTERS: CharacterId[] = [
  'giant-panda',
  'red-panda',
  'hero-chicken',
  'golden-hen',
  'jj',
  'mikey',
  'rumi',
  'zoey',
  'mira',
];

const ALL_THEMES: WorldBackdropTheme[] = [
  'pandas',
  'chickens',
  'jjmikey',
  'popstars',
  'home',
  'win',
];

describe('character & world interactions', () => {
  it('defines cute phrases, particles, animations, and sounds for all 9 characters', () => {
    for (const id of ALL_CHARACTERS) {
      const cfg = CHARACTER_INTERACTIONS[id];
      expect(cfg.id).toBe(id);
      expect(cfg.label.length).toBeGreaterThan(0);
      expect(cfg.phrases.length).toBeGreaterThanOrEqual(3);
      expect(cfg.particles.length).toBeGreaterThanOrEqual(3);
      expect(cfg.animations.length).toBeGreaterThanOrEqual(2);
      expect(() => cfg.playSound()).not.toThrow();
    }
  });

  it('cycles through phrases and animations across consecutive taps', () => {
    const first = getCharacterPokeEffect('mikey', 0);
    const second = getCharacterPokeEffect('mikey', 1);
    const third = getCharacterPokeEffect('mikey', 2);
    const wrapped = getCharacterPokeEffect('mikey', 3);

    expect(first.phrase).not.toBe(second.phrase);
    expect(second.phrase).not.toBe(third.phrase);
    expect(wrapped.phrase).toBe(first.phrase);
    expect(first.animation).not.toBe(second.animation);
  });

  it('defines ambient tap bursts for every world backdrop theme', () => {
    for (const theme of ALL_THEMES) {
      const ambient = WORLD_AMBIENT_TAPS[theme];
      expect(ambient.particles.length).toBeGreaterThanOrEqual(3);
      expect(ambient.label.length).toBeGreaterThan(0);
    }
  });

  it('safely invokes all new interactive soundEngine SFX without Web Audio in Node', () => {
    expect(() => soundEngine.playPandaMunch()).not.toThrow();
    expect(() => soundEngine.playRedPandaSqueak()).not.toThrow();
    expect(() => soundEngine.playGoldenCluck()).not.toThrow();
    expect(() => soundEngine.playHeroBoing()).not.toThrow();
    expect(() => soundEngine.playTurtleBoing()).not.toThrow();
    expect(() => soundEngine.playPopSparkle(0)).not.toThrow();
    expect(() => soundEngine.playPopSparkle(1)).not.toThrow();
    expect(() => soundEngine.playPopSparkle(2)).not.toThrow();
    expect(() => soundEngine.playWaterSplash()).not.toThrow();
    expect(() => soundEngine.playWoodMarimba(2)).not.toThrow();
    expect(() => soundEngine.playFlutterChime()).not.toThrow();
    expect(() => soundEngine.playCloudPuff()).not.toThrow();
    expect(() => soundEngine.playSunChime()).not.toThrow();
    expect(() => soundEngine.playWindWhoosh()).not.toThrow();
    expect(() => soundEngine.playApplePop()).not.toThrow();
    expect(() => soundEngine.playBeeBuzz()).not.toThrow();
    expect(() => soundEngine.playFlowerPluck(3)).not.toThrow();
    expect(() => soundEngine.playPlaneZoom()).not.toThrow();
    expect(() => soundEngine.playBalloonBoing()).not.toThrow();
    expect(() => soundEngine.playRainbowGliss()).not.toThrow();
    expect(() => soundEngine.playStarCoin()).not.toThrow();
    expect(() => soundEngine.playEqualizerNote(5)).not.toThrow();
    expect(() => soundEngine.playBubblePop()).not.toThrow();
    expect(() => soundEngine.playSparklePop(0.5)).not.toThrow();
  });
});
