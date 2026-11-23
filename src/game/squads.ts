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
      'Ooh, super close! Let’s count together!',
      'You got this! Tap each one to count!',
      'Almost! Listen and count with us!',
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
      'Bawk! Almost! Tap the eggs to count!',
      'Nice try! Let’s count together!',
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
      'Whoa, almost! Tap the stars to count!',
      'Nice try, buddy! Let’s count together!',
      'You can do it! Tap each star!',
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
      'Shine on! Tap each berry to count!',
      'So close, superstar! Count with us!',
      'You’ve got this! Tap and count!',
    ],
  },
};

export function pickRandomLine(lines: string[], seed: number): string {
  return lines[Math.abs(seed) % lines.length];
}

/** Shuffle the 4 stage squads cleanly and ensure the opener changes on replay. */
export function shuffleSquadOrder(
  previousFirst?: SquadId,
  rng: () => number = Math.random
): SquadId[] {
  const arr: SquadId[] = [...SQUAD_ORDER];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (previousFirst && arr[0] === previousFirst) {
    const swapIdx = 1 + Math.floor(rng() * (arr.length - 1));
    [arr[0], arr[swapIdx]] = [arr[swapIdx], arr[0]];
  }
  return arr;
}
