/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameMode = 'CAMPAIGN' | 'CLASSIC' | 'ZEN';

export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'LEVEL_CLEAR' | 'GAME_OVER';

export type FruitId = 
  | 'watermelon'
  | 'orange'
  | 'strawberry'
  | 'pineapple'
  | 'kiwi'
  | 'banana'
  | 'coconut'
  | 'grapes'
  | 'lemon'
  | 'dragonfruit'
  | 'freeze_banana'
  | 'bomb';

export interface FruitDefinition {
  id: FruitId;
  name: string;
  points: number;
  radius: number;
  primaryColor: string;
  juiceColor: string;
  seedColor?: string;
  isSpecial?: boolean;
  isHazard?: boolean;
  rarityWeight: number; // For spawning probability
  trivia?: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface BladePoint extends Point {
  time: number;
}

export interface SlicedHalf {
  fruit: FruitDefinition;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  angleCut: number; // Angle along which it was sliced
  half: 1 | 2; // Left or Right half
  alpha: number;
}

export interface ActiveFruit {
  id: string;
  fruit: FruitDefinition;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  scale: number;
  wobblePhase: number;
  isSliced: boolean;
}

export interface JuiceParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
}

export interface JuiceSplatter {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  shapeOffsets: number[]; // random radial offsets for organic splash
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  scale: number;
  alpha: number;
  vy: number;
}

export interface BladeTheme {
  id: string;
  name: string;
  price: number;
  glowColor: string;
  coreColor: string;
  particleType: 'sparks' | 'fire' | 'stars' | 'ice' | 'leaves' | 'rainbow';
  description: string;
  unlocked: boolean;
}

export interface ArenaTheme {
  id: string;
  name: string;
  price: number;
  bgImage: string;
  description: string;
  unlocked: boolean;
}

export interface LevelObjective {
  type: 'SCORE' | 'SLICE_FRUIT' | 'COMBO_COUNT' | 'SURVIVE_TIME' | 'ACCURACY';
  target: number;
  current: number;
  fruitId?: FruitId;
  description: string;
}

export interface EndlessLevelConfig {
  levelNumber: number;
  title: string;
  chapter: string;
  objectives: LevelObjective[];
  allowedFruits: FruitId[];
  spawnInterval: number; // ms
  fruitsPerWave: number;
  bombChance: number; // 0 to 1
  specialFruitChance: number; // 0 to 1
  gravity: number;
  timeLimit?: number; // seconds, if timed
  coinReward: number;
  starsRequired: { one: number; two: number; three: number };
}

export interface PlayerStats {
  coins: number;
  highestLevel: number;
  levelStars: Record<number, number>; // levelNumber -> stars (1-3)
  highScores: {
    campaign: number;
    classic: number;
    zen: number;
  };
  fruitsSlicedCount: Record<string, number>;
  totalSlices: number;
  maxCombo: number;
  selectedBlade: string;
  selectedArena: string;
  unlockedBlades: string[];
  unlockedArenas: string[];
}
