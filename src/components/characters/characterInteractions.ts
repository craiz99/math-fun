import { soundEngine } from '../../audio/soundEngine';
import type { SquadId } from '../../game/types';

export type CharacterId =
  | 'giant-panda'
  | 'red-panda'
  | 'hero-chicken'
  | 'golden-hen'
  | 'jj'
  | 'mikey'
  | 'rumi'
  | 'zoey'
  | 'mira';

export type PokeAnimationKind =
  | 'poke-jelly'
  | 'poke-hop'
  | 'poke-spin'
  | 'poke-twirl';

export interface CharacterInteractionConfig {
  id: CharacterId;
  label: string;
  phrases: string[];
  particles: string[];
  badgeBg: string;
  badgeColor: string;
  animations: PokeAnimationKind[];
  playSound: () => void;
}

export const CHARACTER_INTERACTIONS: Record<CharacterId, CharacterInteractionConfig> = {
  'giant-panda': {
    id: 'giant-panda',
    label: 'Giant Panda',
    phrases: ['Munch! 🎋', 'Boop! 🐼', 'Big hugs! 💚'],
    particles: ['🎋', '🍃', '💚', '✨'],
    badgeBg: '#4ade80',
    badgeColor: '#14532d',
    animations: ['poke-jelly', 'poke-hop'],
    playSound: () => soundEngine.playPandaMunch(),
  },
  'red-panda': {
    id: 'red-panda',
    label: 'Red Panda',
    phrases: ['RAWR! 🐾', 'Hehe! 🧡', 'So fluffy! ✨'],
    particles: ['🧡', '🐾', '🍂', '✨'],
    badgeBg: '#fb923c',
    badgeColor: '#281a38',
    animations: ['poke-hop', 'poke-spin'],
    playSound: () => soundEngine.playRedPandaSqueak(),
  },
  'hero-chicken': {
    id: 'hero-chicken',
    label: 'Hero White Chicken',
    phrases: ['BAWK!! 🥋', 'HI-YA! ⚡', 'Super cluck! 🪶'],
    particles: ['🪶', '⚡', '💥', '⭐'],
    badgeBg: '#ef4444',
    badgeColor: '#fef08a',
    animations: ['poke-hop', 'poke-spin'],
    playSound: () => soundEngine.playChickenBawk(),
  },
  'golden-hen': {
    id: 'golden-hen',
    label: 'Golden Hen',
    phrases: ['Bawk-bawk! 🥚', 'Shiny! ✨', 'Cluck! 💛'],
    particles: ['🥚', '💛', '✨', '🪶'],
    badgeBg: '#fde047',
    badgeColor: '#281a38',
    animations: ['poke-jelly', 'poke-hop'],
    playSound: () => soundEngine.playGoldenCluck(),
  },
  jj: {
    id: 'jj',
    label: 'JJ',
    phrases: ['Woohoo! 🚀', 'High five! 🙌', 'Let’s go! ⭐'],
    particles: ['⭐', '🚀', '💙', '✨'],
    badgeBg: '#38bdf8',
    badgeColor: '#ffffff',
    animations: ['poke-hop', 'poke-twirl'],
    playSound: () => soundEngine.playHeroBoing(),
  },
  mikey: {
    id: 'mikey',
    label: 'Mikey',
    phrases: ['Hehehe! 🐢', 'Boing! 💚', 'Turtle spin! 🌟'],
    particles: ['🐢', '💫', '💚', '⭐'],
    badgeBg: '#4ade80',
    badgeColor: '#14532d',
    animations: ['poke-spin', 'poke-jelly'],
    playSound: () => soundEngine.playTurtleBoing(),
  },
  rumi: {
    id: 'rumi',
    label: 'Rumi',
    phrases: ['Sparkle! 💜', 'Shine bright! ⭐', 'Pop magic! ✨'],
    particles: ['💜', '⭐', '✨', '🎵'],
    badgeBg: '#c084fc',
    badgeColor: '#ffffff',
    animations: ['poke-twirl', 'poke-hop'],
    playSound: () => soundEngine.playPopSparkle(0),
  },
  zoey: {
    id: 'zoey',
    label: 'Zoey',
    phrases: ['La la la! 🎵', 'Groovy! 💙', 'Encore! 🌟'],
    particles: ['🎵', '💙', '✨', '🎶'],
    badgeBg: '#38bdf8',
    badgeColor: '#ffffff',
    animations: ['poke-jelly', 'poke-twirl'],
    playSound: () => soundEngine.playPopSparkle(1),
  },
  mira: {
    id: 'mira',
    label: 'Mira',
    phrases: ['Love it! 💖', 'Superstar! ✨', 'Yeah! 🎶'],
    particles: ['💖', '🎶', '✨', '⭐'],
    badgeBg: '#f472b6',
    badgeColor: '#ffffff',
    animations: ['poke-twirl', 'poke-jelly'],
    playSound: () => soundEngine.playPopSparkle(2),
  },
};

export type WorldBackdropTheme = SquadId | 'home' | 'win';

export interface AmbientTapConfig {
  particles: string[];
  label: string;
}

export const WORLD_AMBIENT_TAPS: Record<WorldBackdropTheme, AmbientTapConfig> = {
  pandas: {
    particles: ['🌸', '🍃', '🎋', '✨'],
    label: 'Swish!',
  },
  chickens: {
    particles: ['🌼', '🍀', '☀️', '✨'],
    label: 'Pop!',
  },
  jjmikey: {
    particles: ['⭐', '🌈', '☁️', '✨'],
    label: 'Boing!',
  },
  popstars: {
    particles: ['🎵', '💖', '⭐', '✨'],
    label: 'Sparkle!',
  },
  home: {
    particles: ['✨', '🌈', '🌸', '⭐'],
    label: 'Yay!',
  },
  win: {
    particles: ['🎉', '⭐', '🎊', '💖'],
    label: 'Woohoo!',
  },
};

/** Pick the next cute phrase and animation for a character tap count. */
export function getCharacterPokeEffect(characterId: CharacterId, tapCount: number): {
  phrase: string;
  animation: PokeAnimationKind;
  particles: string[];
  badgeBg: string;
  badgeColor: string;
} {
  const cfg = CHARACTER_INTERACTIONS[characterId];
  const idx = Math.max(0, tapCount);
  return {
    phrase: cfg.phrases[idx % cfg.phrases.length],
    animation: cfg.animations[idx % cfg.animations.length],
    particles: cfg.particles,
    badgeBg: cfg.badgeBg,
    badgeColor: cfg.badgeColor,
  };
}
