/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EndlessLevelConfig, FruitId, LevelObjective } from '../types/game';

// Deterministic 32-bit PRNG (Mulberry32) strictly returning positive floats in [0, 1)
function createSeededRandom(seed: number) {
  let a = (Math.abs(seed) ^ 0x6d2b79f5) >>> 0;
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CHAPTER_NAMES = [
  'Sunrise Grove',
  'Citrus Orchard',
  'Tropical Canopy',
  'Berry Highlands',
  'Melon Oasis',
  'Dragon Roost',
  'Frost Valley',
  'Celestial Harvest',
  'Golden Valley',
  'Starlight Orchard',
  'Paradise Jungle',
  'Zen Sanctum',
];

const ALL_STANDARD_FRUITS: FruitId[] = [
  'watermelon',
  'orange',
  'strawberry',
  'pineapple',
  'kiwi',
  'banana',
  'coconut',
  'grapes',
  'lemon',
];

export function generateLevel(levelNumber: number): EndlessLevelConfig {
  const rng = createSeededRandom(levelNumber * 1337);

  // Chapter calculation (every 10 levels is a new chapter)
  const chapterIdx = Math.floor((levelNumber - 1) / 10);
  const chapterName = CHAPTER_NAMES[chapterIdx % CHAPTER_NAMES.length];
  const chapterTitle = `Chapter ${chapterIdx + 1}: ${chapterName}`;

  // Difficulty scaling factor
  const difficulty = Math.min(levelNumber / 25, 4.0);

  // Progressive fruit unlock pool based on level
  const fruitPool: FruitId[] = ['watermelon', 'orange', 'lemon'];
  if (levelNumber >= 2) fruitPool.push('strawberry');
  if (levelNumber >= 4) fruitPool.push('banana', 'kiwi');
  if (levelNumber >= 7) fruitPool.push('pineapple');
  if (levelNumber >= 10) fruitPool.push('grapes');
  if (levelNumber >= 14) fruitPool.push('coconut');

  // Objectives generation
  const objectives: LevelObjective[] = [];

  // Objective 1: Target Score
  const baseTargetScore = 600 + Math.floor(levelNumber * 220 * (1 + rng() * 0.25));
  objectives.push({
    type: 'SCORE',
    target: baseTargetScore,
    current: 0,
    description: `Score ${baseTargetScore.toLocaleString()} points`,
  });

  // Objective 2: Fruit Slice Quota OR Combo Goal
  const objTypeSeed = rng();
  if (objTypeSeed < 0.6) {
    // Slice specific fruit quota
    const fruitIdx = Math.min(fruitPool.length - 1, Math.max(0, Math.floor(rng() * fruitPool.length)));
    const targetFruit: FruitId = fruitPool[fruitIdx] || 'watermelon';
    const fruitTargetCount = Math.max(6, Math.floor(8 + levelNumber * 1.5));
    const fruitName = targetFruit.charAt(0).toUpperCase() + targetFruit.slice(1);
    objectives.push({
      type: 'SLICE_FRUIT',
      target: fruitTargetCount,
      current: 0,
      fruitId: targetFruit,
      description: `Slice ${fruitTargetCount} ${fruitName}s`,
    });
  } else {
    // Combo count goal
    const comboTarget = Math.max(2, Math.floor(2 + levelNumber * 0.4));
    objectives.push({
      type: 'COMBO_COUNT',
      target: comboTarget,
      current: 0,
      description: `Perform ${comboTarget} Combos (3x+)`,
    });
  }

  // Level title generation
  const adjectives = [
    'Crisp', 'Juicy', 'Sunny', 'Wild', 'Golden', 'Breezy', 'Fierce', 'Swift', 'Rushing',
    'Sweet', 'Vibrant', 'Zen', 'Bountiful', 'Electric', 'Lush', 'Radiant'
  ];
  const nouns = [
    'Harvest', 'Grove', 'Frenzy', 'Meadow', 'Surge', 'Bliss', 'Clash', 'Bounty', 'Trail',
    'Garden', 'Cascade', 'Rush', 'Canopy', 'Valley', 'Plaza', 'Orchard'
  ];
  const adjIdx = Math.min(adjectives.length - 1, Math.max(0, Math.floor(rng() * adjectives.length)));
  const nounIdx = Math.min(nouns.length - 1, Math.max(0, Math.floor(rng() * nouns.length)));
  const adj = adjectives[adjIdx] || 'Juicy';
  const noun = nouns[nounIdx] || 'Harvest';
  const title = `Level ${levelNumber}: ${adj} ${noun}`;

  // Time limit (Levels after 3 have timer, adding excitement)
  const hasTimeLimit = levelNumber >= 2;
  const timeLimit = hasTimeLimit ? Math.max(30, Math.floor(55 - difficulty * 3)) : undefined;

  // Bomb chance (starts at 0, goes up to max 0.22)
  const bombChance = levelNumber < 3 ? 0 : Math.min(0.06 + (levelNumber - 3) * 0.015, 0.22);

  // Special power fruit chance
  const specialFruitChance = 0.08 + Math.min(levelNumber * 0.005, 0.15);

  // Spawn rates
  const spawnInterval = Math.max(900, Math.floor(1800 - difficulty * 160));
  const fruitsPerWave = rng() > 0.4 ? (levelNumber > 8 ? 3 : 2) : 1;

  // Rewards
  const coinReward = 30 + levelNumber * 15;

  return {
    levelNumber,
    title,
    chapter: chapterTitle,
    objectives,
    allowedFruits: fruitPool,
    spawnInterval,
    fruitsPerWave,
    bombChance,
    specialFruitChance,
    gravity: 0.24,
    timeLimit,
    coinReward,
    starsRequired: {
      one: Math.floor(baseTargetScore * 0.7),
      two: baseTargetScore,
      three: Math.floor(baseTargetScore * 1.35),
    },
  };
}

// Preset themes and blades available in the shop
export const AVAILABLE_BLADES = [
  {
    id: 'ninja_steel',
    name: 'Ninja Katana',
    price: 0,
    glowColor: '#e2e8f0',
    coreColor: '#ffffff',
    particleType: 'sparks' as const,
    description: 'Classic forged steel blade with crisp razor sparks.',
    unlocked: true,
  },
  {
    id: 'ruby_flame',
    name: 'Dragon Flame',
    price: 250,
    glowColor: '#ef4444',
    coreColor: '#fef08a',
    particleType: 'fire' as const,
    description: 'Blazing embers that leave a fiery trail of scorched citrus.',
    unlocked: false,
  },
  {
    id: 'frost_edge',
    name: 'Frostbite Shard',
    price: 500,
    glowColor: '#38bdf8',
    coreColor: '#e0f2fe',
    particleType: 'ice' as const,
    description: 'Sub-zero crystal edge that leaves crisp snowflake trails.',
    unlocked: false,
  },
  {
    id: 'golden_scythe',
    name: 'Midas Golden Edge',
    price: 1000,
    glowColor: '#eab308',
    coreColor: '#fef9c3',
    particleType: 'stars' as const,
    description: 'Pure radiant gold that bursts with sparkling starlight.',
    unlocked: false,
  },
  {
    id: 'rainbow_comet',
    name: 'Prism Rainbow Blade',
    price: 1800,
    glowColor: '#ec4899',
    coreColor: '#a855f7',
    particleType: 'rainbow' as const,
    description: 'Cosmic chromatic spectrum trail of shifting vibrant colors.',
    unlocked: false,
  },
  {
    id: 'emerald_wind',
    name: 'Breeze Gale Edge',
    price: 2600,
    glowColor: '#22c55e',
    coreColor: '#bbf7d0',
    particleType: 'leaves' as const,
    description: 'Swirling orchard wind leaves that drift in your slicing path.',
    unlocked: false,
  },
];

export const AVAILABLE_ARENAS = [
  {
    id: 'hinoki_wood',
    name: 'Hinoki Bamboo Board',
    price: 0,
    bgImage: '/src/assets/images/game_wood_cutting_board_1793179934367.jpg',
    description: 'Traditional rustic bamboo board with organic golden grain.',
    unlocked: true,
  },
  {
    id: 'tropical_orchard',
    name: 'Sunlit Tropical Grove',
    price: 400,
    bgImage: '/src/assets/images/game_tropical_orchard_bg_1793179934838.jpg',
    description: 'Lush morning orchard with orange trees and warm garden paths.',
    unlocked: false,
  },
  {
    id: 'market_stall',
    name: 'Sunny Fruit Market',
    price: 900,
    bgImage: '/src/assets/images/game_fruit_market_stall_1793179935456.jpg',
    description: 'Cozy countryside farm stand stacked with fresh crates.',
    unlocked: false,
  },
];
