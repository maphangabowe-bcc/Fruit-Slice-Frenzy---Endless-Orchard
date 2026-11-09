/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FruitDefinition, FruitId } from '../types/game';

export const FRUIT_DEFINITIONS: Record<FruitId, FruitDefinition> = {
  watermelon: {
    id: 'watermelon',
    name: 'Watermelon',
    points: 10,
    radius: 46,
    primaryColor: '#22c55e',
    juiceColor: '#ef4444',
    seedColor: '#18181b',
    rarityWeight: 18,
    trivia: 'Watermelon is 92% water and technically classified as both a fruit and a vegetable!',
  },
  orange: {
    id: 'orange',
    name: 'Valencia Orange',
    points: 15,
    radius: 36,
    primaryColor: '#f97316',
    juiceColor: '#fb923c',
    seedColor: '#fed7aa',
    rarityWeight: 18,
    trivia: 'Oranges are rich in Vitamin C, and their color is named after the fruit itself!',
  },
  strawberry: {
    id: 'strawberry',
    name: 'Ruby Strawberry',
    points: 20,
    radius: 30,
    primaryColor: '#dc2626',
    juiceColor: '#f43f5e',
    seedColor: '#fef08a',
    rarityWeight: 16,
    trivia: 'Strawberries are the only fruit that bear their seeds on the outside—about 200 of them!',
  },
  pineapple: {
    id: 'pineapple',
    name: 'Golden Pineapple',
    points: 25,
    radius: 44,
    primaryColor: '#eab308',
    juiceColor: '#facc15',
    seedColor: '#78350f',
    rarityWeight: 14,
    trivia: 'A single pineapple takes nearly two years to grow from planting to full ripeness.',
  },
  kiwi: {
    id: 'kiwi',
    name: 'Emerald Kiwi',
    points: 20,
    radius: 32,
    primaryColor: '#854d0e',
    juiceColor: '#84cc16',
    seedColor: '#171717',
    rarityWeight: 15,
    trivia: 'Kiwi contains more Vitamin C per ounce than an orange and is packed with enzymes.',
  },
  banana: {
    id: 'banana',
    name: 'Sun Banana',
    points: 15,
    radius: 34,
    primaryColor: '#eab308',
    juiceColor: '#fef08a',
    rarityWeight: 16,
    trivia: 'Bananas are naturally slightly radioactive due to their potassium-40 content!',
  },
  coconut: {
    id: 'coconut',
    name: 'Island Coconut',
    points: 30,
    radius: 38,
    primaryColor: '#52331b',
    juiceColor: '#f8fafc',
    rarityWeight: 12,
    trivia: 'Coconut water was used as an intravenous hydration fluid during WWII emergencies.',
  },
  grapes: {
    id: 'grapes',
    name: 'Royal Grape Cluster',
    points: 25,
    radius: 34,
    primaryColor: '#7c3aed',
    juiceColor: '#a855f7',
    rarityWeight: 14,
    trivia: 'Humans have been cultivating grapes for wine and food for over 8,000 years.',
  },
  lemon: {
    id: 'lemon',
    name: 'Zesty Lemon',
    points: 20,
    radius: 32,
    primaryColor: '#facc15',
    juiceColor: '#fef08a',
    rarityWeight: 15,
    trivia: 'During the Renaissance, ladies used lemon juice to redden their lips naturally.',
  },
  dragonfruit: {
    id: 'dragonfruit',
    name: 'Golden Dragonfruit',
    points: 100,
    radius: 42,
    primaryColor: '#ec4899',
    juiceColor: '#fb7185',
    seedColor: '#0f172a',
    isSpecial: true,
    rarityWeight: 4,
    trivia: 'Dragonfruit grows on the night-blooming Hylocereus cactus, known as the Queen of the Night.',
  },
  freeze_banana: {
    id: 'freeze_banana',
    name: 'Frost Banana',
    points: 50,
    radius: 35,
    primaryColor: '#38bdf8',
    juiceColor: '#7dd3fc',
    isSpecial: true,
    rarityWeight: 5,
    trivia: 'An icy fruit that freezes orchard time in slow motion for massive combo streaks!',
  },
  bomb: {
    id: 'bomb',
    name: 'Hazard Spike Bomb',
    points: -100,
    radius: 34,
    primaryColor: '#262626',
    juiceColor: '#ea580c',
    isHazard: true,
    rarityWeight: 8,
    trivia: 'Watch out! Slicing this will detonated your lives and break your combo streak!',
  },
};

// Render an intact whole flying fruit
export function renderIntactFruit(
  ctx: CanvasRenderingContext2D,
  fruit: FruitDefinition,
  x: number,
  y: number,
  radius: number,
  rotation: number,
  timeMs: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Soft drop shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 6;

  switch (fruit.id) {
    case 'watermelon':
      renderWholeWatermelon(ctx, radius);
      break;
    case 'orange':
      renderWholeOrange(ctx, radius);
      break;
    case 'strawberry':
      renderWholeStrawberry(ctx, radius);
      break;
    case 'pineapple':
      renderWholePineapple(ctx, radius);
      break;
    case 'kiwi':
      renderWholeKiwi(ctx, radius);
      break;
    case 'banana':
      renderWholeBanana(ctx, radius);
      break;
    case 'coconut':
      renderWholeCoconut(ctx, radius);
      break;
    case 'grapes':
      renderWholeGrapes(ctx, radius);
      break;
    case 'lemon':
      renderWholeLemon(ctx, radius);
      break;
    case 'dragonfruit':
      renderWholeDragonfruit(ctx, radius, timeMs);
      break;
    case 'freeze_banana':
      renderWholeFreezeBanana(ctx, radius, timeMs);
      break;
    case 'bomb':
      renderWholeBomb(ctx, radius, timeMs);
      break;
  }

  ctx.restore();
  ctx.restore();
}

// Render sliced fruit half
export function renderFruitHalf(
  ctx: CanvasRenderingContext2D,
  halfData: {
    fruit: FruitDefinition;
    x: number;
    y: number;
    rotation: number;
    angleCut: number;
    half: 1 | 2;
    alpha: number;
  }
) {
  const { fruit, x, y, rotation, angleCut, half, alpha } = halfData;
  const radius = fruit.radius;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Clip to half circle along cut plane
  ctx.save();
  ctx.beginPath();
  // We draw a semi-circle based on half 1 or 2
  if (half === 1) {
    ctx.arc(0, 0, radius + 4, angleCut, angleCut + Math.PI, false);
  } else {
    ctx.arc(0, 0, radius + 4, angleCut + Math.PI, angleCut + Math.PI * 2, false);
  }
  ctx.closePath();
  ctx.clip();

  // Render the cross-section
  switch (fruit.id) {
    case 'watermelon':
      renderWatermelonCrossSection(ctx, radius);
      break;
    case 'orange':
      renderOrangeCrossSection(ctx, radius);
      break;
    case 'strawberry':
      renderStrawberryCrossSection(ctx, radius);
      break;
    case 'pineapple':
      renderPineappleCrossSection(ctx, radius);
      break;
    case 'kiwi':
      renderKiwiCrossSection(ctx, radius);
      break;
    case 'banana':
    case 'freeze_banana':
      renderBananaCrossSection(ctx, radius, fruit.id === 'freeze_banana');
      break;
    case 'coconut':
      renderCoconutCrossSection(ctx, radius);
      break;
    case 'grapes':
      renderGrapesCrossSection(ctx, radius);
      break;
    case 'lemon':
      renderLemonCrossSection(ctx, radius);
      break;
    case 'dragonfruit':
      renderDragonfruitCrossSection(ctx, radius);
      break;
    case 'bomb':
      renderBombCrossSection(ctx, radius);
      break;
  }

  ctx.restore();

  // Draw flat cut border line
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const dir = angleCut;
  const p1x = Math.cos(dir) * radius;
  const p1y = Math.sin(dir) * radius;
  const p2x = Math.cos(dir + Math.PI) * radius;
  const p2y = Math.sin(dir + Math.PI) * radius;
  ctx.moveTo(p1x, p1y);
  ctx.lineTo(p2x, p2y);
  ctx.stroke();

  ctx.restore();
}

// --- Specific Whole Fruit Renderers ---

function renderWholeWatermelon(ctx: CanvasRenderingContext2D, r: number) {
  // Base green rind
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  grad.addColorStop(0, '#4ade80');
  grad.addColorStop(0.7, '#16a34a');
  grad.addColorStop(1, '#14532d');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Dark green stripes
  ctx.fillStyle = '#052e16';
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    ctx.beginPath();
    ctx.ellipse(Math.cos(angle) * (r * 0.45), Math.sin(angle) * (r * 0.45), r * 0.5, r * 0.12, angle + 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Gloss highlight
  renderGloss(ctx, r);
}

function renderWholeOrange(ctx: CanvasRenderingContext2D, r: number) {
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  grad.addColorStop(0, '#fdba74');
  grad.addColorStop(0.6, '#f97316');
  grad.addColorStop(1, '#c2410c');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Little green stem cap
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(0, -r + 3, 4, 0, Math.PI * 2);
  ctx.fill();

  renderGloss(ctx, r);
}

function renderWholeStrawberry(ctx: CanvasRenderingContext2D, r: number) {
  // Heart/tapered strawberry shape
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(0, r);
  ctx.bezierCurveTo(-r * 1.1, r * 0.4, -r * 1.1, -r * 0.6, 0, -r * 0.8);
  ctx.bezierCurveTo(r * 1.1, -r * 0.6, r * 1.1, r * 0.4, 0, r);
  ctx.fill();

  // Seeds (small yellow dots)
  ctx.fillStyle = '#fef08a';
  const seedCoords = [
    [-0.4, -0.2], [0.4, -0.2], [0, 0.1], [-0.5, 0.2], [0.5, 0.2],
    [-0.2, 0.5], [0.2, 0.5], [0, 0.7], [0, -0.5]
  ];
  seedCoords.forEach(([sx, sy]) => {
    ctx.beginPath();
    ctx.ellipse(sx * r, sy * r, 2, 1, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Green Leaf Cap
  ctx.fillStyle = '#16a34a';
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + (i - 2) * 0.4;
    ctx.beginPath();
    ctx.ellipse(Math.cos(angle) * (r * 0.6), -r * 0.7 + Math.sin(angle) * (r * 0.2), 8, 3, angle, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderWholePineapple(ctx: CanvasRenderingContext2D, r: number) {
  // Oval body
  const grad = ctx.createRadialGradient(-r * 0.2, 0, r * 0.1, 0, 0, r);
  grad.addColorStop(0, '#fef08a');
  grad.addColorStop(0.5, '#eab308');
  grad.addColorStop(1, '#a16207');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, r * 0.15, r * 0.85, r * 0.95, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cross pattern scales
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-r * 0.6, -r * 0.2);
  ctx.lineTo(r * 0.6, r * 0.6);
  ctx.moveTo(r * 0.6, -r * 0.2);
  ctx.lineTo(-r * 0.6, r * 0.6);
  ctx.stroke();

  // Crown spiky leaves
  ctx.fillStyle = '#15803d';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 6, -r * 0.6);
    ctx.lineTo(i * 12, -r * 1.3);
    ctx.lineTo(i * 6 + 6, -r * 0.6);
    ctx.fill();
  }
}

function renderWholeKiwi(ctx: CanvasRenderingContext2D, r: number) {
  // Fuzzy brown oval
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  grad.addColorStop(0, '#a16207');
  grad.addColorStop(0.7, '#713f12');
  grad.addColorStop(1, '#451a03');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.82, 0, 0, Math.PI * 2);
  ctx.fill();

  // Little fuzz specks
  ctx.fillStyle = '#ca8a04';
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    ctx.fillRect(Math.cos(a) * (r * 0.7), Math.sin(a) * (r * 0.6), 2, 2);
  }
}

function renderWholeBanana(ctx: CanvasRenderingContext2D, r: number) {
  // Curved crescent
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(0, 0, r, -0.4, 1.8, false);
  ctx.arc(0, r * 0.35, r * 0.75, 1.8, -0.4, true);
  ctx.closePath();
  ctx.fill();

  // Brown tips
  ctx.fillStyle = '#713f12';
  ctx.beginPath();
  ctx.arc(Math.cos(-0.4) * r, Math.sin(-0.4) * r, 4, 0, Math.PI * 2);
  ctx.fill();
}

function renderWholeCoconut(ctx: CanvasRenderingContext2D, r: number) {
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  grad.addColorStop(0, '#78350f');
  grad.addColorStop(0.8, '#451a03');
  grad.addColorStop(1, '#271003');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // 3 germination eyes
  ctx.fillStyle = '#1c0a00';
  ctx.beginPath();
  ctx.arc(-8, -10, 4, 0, Math.PI * 2);
  ctx.arc(8, -10, 4, 0, Math.PI * 2);
  ctx.arc(0, -2, 4, 0, Math.PI * 2);
  ctx.fill();
}

function renderWholeGrapes(ctx: CanvasRenderingContext2D, r: number) {
  // Cluster of purple circles
  ctx.fillStyle = '#7c3aed';
  const grapeOffsets = [
    [0, -r * 0.5], [-r * 0.35, -r * 0.2], [r * 0.35, -r * 0.2],
    [-r * 0.45, r * 0.15], [0, r * 0.15], [r * 0.45, r * 0.15],
    [-r * 0.2, r * 0.5], [r * 0.2, r * 0.5], [0, r * 0.75]
  ];

  grapeOffsets.forEach(([gx, gy]) => {
    ctx.beginPath();
    ctx.arc(gx, gy, r * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // Specular shine
    ctx.fillStyle = '#c4b5fd';
    ctx.beginPath();
    ctx.arc(gx - 3, gy - 3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7c3aed';
  });

  // Green stem
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.5);
  ctx.lineTo(0, -r * 0.9);
  ctx.stroke();
}

function renderWholeLemon(ctx: CanvasRenderingContext2D, r: number) {
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  grad.addColorStop(0, '#fef08a');
  grad.addColorStop(0.6, '#facc15');
  grad.addColorStop(1, '#ca8a04');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pointed nipple ends
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(-r + 1, 0, 4, 0, Math.PI * 2);
  ctx.arc(r - 1, 0, 4, 0, Math.PI * 2);
  ctx.fill();

  renderGloss(ctx, r);
}

function renderWholeDragonfruit(ctx: CanvasRenderingContext2D, r: number, timeMs: number) {
  // Pulsing radiant glow aura
  const pulse = Math.sin(timeMs / 180) * 0.15 + 0.85;
  ctx.save();
  ctx.shadowColor = '#f43f5e';
  ctx.shadowBlur = 18 * pulse;

  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  grad.addColorStop(0, '#fb7185');
  grad.addColorStop(0.6, '#e11d48');
  grad.addColorStop(1, '#9f1239');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Golden/Green flame scales
  ctx.fillStyle = '#facc15';
  for (let i = 0; i < 7; i++) {
    const angle = (i * Math.PI * 2) / 7;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
    ctx.lineTo(Math.cos(angle + 0.2) * (r * 1.25), Math.sin(angle + 0.2) * (r * 1.25));
    ctx.lineTo(Math.cos(angle + 0.4) * r, Math.sin(angle + 0.4) * r);
    ctx.fill();
  }
}

function renderWholeFreezeBanana(ctx: CanvasRenderingContext2D, r: number, timeMs: number) {
  // Glowing cyan freeze banana
  ctx.save();
  const aura = Math.sin(timeMs / 150) * 0.2 + 0.8;
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 16 * aura;

  ctx.fillStyle = '#bae6fd';
  ctx.beginPath();
  ctx.arc(0, 0, r, -0.4, 1.8, false);
  ctx.arc(0, r * 0.35, r * 0.75, 1.8, -0.4, true);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Ice crystal stars
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-6, -6, 12, 2);
  ctx.fillRect(-1, -11, 2, 12);
}

function renderWholeBomb(ctx: CanvasRenderingContext2D, r: number, timeMs: number) {
  // Heavy cast iron cannonball
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  grad.addColorStop(0, '#52525b');
  grad.addColorStop(0.6, '#27272a');
  grad.addColorStop(1, '#09090b');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Metal neck
  ctx.fillStyle = '#71717a';
  ctx.fillRect(-6, -r - 4, 12, 6);

  // Fuse
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -r - 4);
  ctx.quadraticCurveTo(12, -r - 14, 16, -r - 18);
  ctx.stroke();

  // Burning sparks at fuse tip
  const sparkX = 16;
  const sparkY = -r - 18;
  const sparkR = 5 + Math.random() * 4;
  ctx.fillStyle = Math.random() > 0.5 ? '#f59e0b' : '#ef4444';
  ctx.beginPath();
  ctx.arc(sparkX, sparkY, sparkR, 0, Math.PI * 2);
  ctx.fill();

  // Skull or exclamation mark on bomb body
  ctx.fillStyle = '#f87171';
  ctx.font = 'bold 22px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('!', 0, 2);
}

function renderGloss(ctx: CanvasRenderingContext2D, r: number) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.35, -r * 0.35, r * 0.35, r * 0.18, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
}

// --- Specific Half Cross-Section Renderers ---

function renderWatermelonCrossSection(ctx: CanvasRenderingContext2D, r: number) {
  // Green rind edge
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // White inner rind
  ctx.fillStyle = '#f0fdf4';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
  ctx.fill();

  // Juicy red flesh
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
  ctx.fill();

  // Black seeds
  ctx.fillStyle = '#18181b';
  for (let i = 0; i < 7; i++) {
    const angle = (i * Math.PI) / 3.5;
    const dist = r * 0.55;
    ctx.beginPath();
    ctx.ellipse(Math.cos(angle) * dist, Math.sin(angle) * dist, 3, 1.8, angle, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderOrangeCrossSection(ctx: CanvasRenderingContext2D, r: number) {
  // Orange rind
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // White pith
  ctx.fillStyle = '#fff7ed';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
  ctx.fill();

  // Segments
  ctx.fillStyle = '#f97316';
  const segments = 8;
  for (let i = 0; i < segments; i++) {
    const a1 = (i * 2 * Math.PI) / segments + 0.08;
    const a2 = ((i + 1) * 2 * Math.PI) / segments - 0.08;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r * 0.85, a1, a2);
    ctx.closePath();
    ctx.fill();
  }

  // White center pip
  ctx.fillStyle = '#fff7ed';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
}

function renderStrawberryCrossSection(ctx: CanvasRenderingContext2D, r: number) {
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Lighter pinkish center
  ctx.fillStyle = '#fda4af';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
  ctx.fill();

  // Core rays
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * (r * 0.5), Math.sin(a) * (r * 0.5));
    ctx.stroke();
  }
}

function renderKiwiCrossSection(ctx: CanvasRenderingContext2D, r: number) {
  // Fuzzy brown rim
  ctx.fillStyle = '#713f12';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Bright emerald flesh
  ctx.fillStyle = '#84cc16';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Creamy white core
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.28, r * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ring of tiny black seeds
  ctx.fillStyle = '#171717';
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI * 2) / 16;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * (r * 0.5), Math.sin(a) * (r * 0.44), 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderPineappleCrossSection(ctx: CanvasRenderingContext2D, r: number) {
  ctx.fillStyle = '#ca8a04';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Fibrous radial spokes
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * (r * 0.8), Math.sin(a) * (r * 0.8));
    ctx.stroke();
  }

  // Tough core
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
  ctx.fill();
}

function renderBananaCrossSection(ctx: CanvasRenderingContext2D, r: number, isIce: boolean) {
  ctx.fillStyle = isIce ? '#38bdf8' : '#eab308';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isIce ? '#e0f2fe' : '#fef9c3';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
  ctx.fill();

  // Triad tiny brown pips
  ctx.fillStyle = '#713f12';
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 4, Math.sin(a) * 4, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderCoconutCrossSection(ctx: CanvasRenderingContext2D, r: number) {
  // Dark husk
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // White coconut meat
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.84, 0, Math.PI * 2);
  ctx.fill();

  // Hollow dark center (water cavity)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.58, 0, Math.PI * 2);
  ctx.fill();
}

function renderGrapesCrossSection(ctx: CanvasRenderingContext2D, r: number) {
  ctx.fillStyle = '#581c87';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#a855f7';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.86, 0, Math.PI * 2);
  ctx.fill();

  // Small seed in middle
  ctx.fillStyle = '#3b0764';
  ctx.beginPath();
  ctx.ellipse(0, 0, 4, 2, 0, 0, Math.PI * 2);
  ctx.fill();
}

function renderLemonCrossSection(ctx: CanvasRenderingContext2D, r: number) {
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
  ctx.fill();

  // Lemon pulp spokes
  ctx.fillStyle = '#fde047';
  const spokes = 8;
  for (let i = 0; i < spokes; i++) {
    const a1 = (i * 2 * Math.PI) / spokes + 0.1;
    const a2 = ((i + 1) * 2 * Math.PI) / spokes - 0.1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r * 0.84, a1, a2);
    ctx.closePath();
    ctx.fill();
  }
}

function renderDragonfruitCrossSection(ctx: CanvasRenderingContext2D, r: number) {
  ctx.fillStyle = '#e11d48';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // White pulp with hundreds of tiny seeds
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  for (let i = 0; i < 28; i++) {
    const dist = Math.sqrt(Math.random()) * (r * 0.75);
    const a = Math.random() * Math.PI * 2;
    ctx.fillRect(Math.cos(a) * dist, Math.sin(a) * dist, 1.8, 1.8);
  }
}

function renderBombCrossSection(ctx: CanvasRenderingContext2D, r: number) {
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
  ctx.fill();
}

// Render dynamic juice splatters that land on the cutting board
export function renderSplatter(
  ctx: CanvasRenderingContext2D,
  splatter: {
    x: number;
    y: number;
    radius: number;
    color: string;
    alpha: number;
    shapeOffsets: number[];
  }
) {
  const { x, y, radius, color, alpha, shapeOffsets } = splatter;
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.fillStyle = color;

  ctx.beginPath();
  const points = shapeOffsets.length;
  for (let i = 0; i < points; i++) {
    const angle = (i * 2 * Math.PI) / points;
    const r = radius * (1 + shapeOffsets[i]);
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Small satellite droplets around main puddle
  for (let i = 0; i < 4; i++) {
    const dropAngle = (i * Math.PI) / 2 + shapeOffsets[i];
    const dropDist = radius * 1.6;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(dropAngle) * dropDist,
      y + Math.sin(dropAngle) * dropDist,
      radius * 0.18,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();
}
