import type { SquadConfig, SquadId } from './types';

export const QUESTIONS_PER_SQUAD = 3;

export const SQUAD_ORDER: SquadId[] = ['pandas', 'chickens', 'jjmikey', 'popstars'];

export const TOTAL_QUESTIONS = SQUAD_ORDER.length * QUESTIONS_PER_SQUAD;

export const SQUADS: Record<SquadId, SquadConfig> = {
  pandas: {
    id: 'pandas',
    name: 'Panda Pals',
    badgeEmoji: '🐼',
    themeColor: '#38b764',
    counterEmoji: '🎋',
    counterLabel: 'bamboo shoots',
    introLine: 'Giant Panda and Red Panda are ready to count!',
    correctLines: [
      'BAMBOO-TASTIC!!',
      'PAW-SOME JOB!!',
      'SUPER SMART!!',
      'YAY!! YOU GOT IT!!',
    ],
    encourageLines: [
      'Ooh, super close! Check the hint!',
      'You got this! Let’s try together!',
      'Almost! Use the bamboo blocks!',
    ],
  },
  chickens: {
    id: 'chickens',
    name: 'Hero Chickens',
    badgeEmoji: '🐔',
    themeColor: '#f59e0b',
    counterEmoji: '🥚',
    counterLabel: 'golden eggs',
    introLine: 'The Hero Chickens are guarding the golden eggs!',
    correctLines: [
      'BAWK YEAH!!',
      'EGG-CELLENT!!',
      'CLUCK POWER!!',
      'SUPER CHICKEN WIN!!',
    ],
    encourageLines: [
      'Bawk! Almost! Peek at the eggs!',
      'Nice try! Let’s count the eggs left!',
      'You’re so close — try again!',
    ],
  },
  jjmikey: {
    id: 'jjmikey',
    name: 'JJ & Mikey',
    badgeEmoji: '🐢',
    themeColor: '#22c55e',
    counterEmoji: '⭐',
    counterLabel: 'power stars',
    introLine: 'JJ and Mikey are off on a math adventure!',
    correctLines: [
      'EPIC WIN!!',
      'TURTLE POWER!!',
      'BOOM!! NAILED IT!!',
      'MATH GENIUS!!',
    ],
    encourageLines: [
      'Whoa, almost! Check out the hint!',
      'Nice try, buddy! You can do it!',
      'Let’s solve this adventure together!',
    ],
  },
  popstars: {
    id: 'popstars',
    name: 'Pop-Star Trio',
    badgeEmoji: '🎤',
    themeColor: '#ec4899',
    counterEmoji: '🍓',
    counterLabel: 'star berries',
    introLine: 'Rumi, Zoey, and Mira are lighting up the stage!',
    correctLines: [
      'MEGA STAR!!',
      'ENCORE!! AMAZING!!',
      'SPARKLE GENIUS!!',
      'POP-STAR PERFECTION!!',
    ],
    encourageLines: [
      'Shine on! Look at the hint!',
      'So close, superstar! Try once more!',
      'Let’s break it down together!',
    ],
  },
};

export function pickRandomLine(lines: string[], seed: number): string {
  return lines[Math.abs(seed) % lines.length];
}
