/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ActiveFruit,
  BladePoint,
  FloatingText,
  FruitDefinition,
  FruitId,
  JuiceParticle,
  JuiceSplatter,
  SlicedHalf,
} from '../types/game';
import {
  FRUIT_DEFINITIONS,
  renderFruitHalf,
  renderIntactFruit,
  renderSplatter,
} from '../utils/fruitRenderer';
import { sound } from '../utils/audio';
import { AVAILABLE_BLADES } from '../utils/levelGenerator';

interface FruitCanvasProps {
  isPlaying: boolean;
  isPaused: boolean;
  allowedFruits: FruitId[];
  spawnInterval: number;
  fruitsPerWave: number;
  bombChance: number;
  specialFruitChance: number;
  bgImageUrl?: string;
  selectedBladeId: string;
  onFruitSliced: (fruit: FruitDefinition, combo: number) => void;
  onBombSliced: () => void;
  onFruitDropped: (fruit: FruitDefinition) => void;
  isFrenzyActive?: boolean;
}

// Distance from point to line segment
function distToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

export const FruitCanvas: React.FC<FruitCanvasProps> = ({
  isPlaying,
  isPaused,
  allowedFruits,
  spawnInterval,
  fruitsPerWave,
  bombChance,
  specialFruitChance,
  bgImageUrl,
  selectedBladeId,
  onFruitSliced,
  onBombSliced,
  onFruitDropped,
  isFrenzyActive = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Background Image Cache
  const bgImgRef = useRef<HTMLImageElement | null>(null);

  // Game Loop Entities
  const fruitsRef = useRef<ActiveFruit[]>([]);
  const halvesRef = useRef<SlicedHalf[]>([]);
  const splattersRef = useRef<JuiceSplatter[]>([]);
  const particlesRef = useRef<JuiceParticle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const bladePointsRef = useRef<BladePoint[]>([]);
  const isPointerDownRef = useRef<boolean>(false);

  // Time / Freeze mechanic
  const slowMoTimerRef = useRef<number>(0);
  const screenShakeRef = useRef<number>(0);

  // Current swipe combo tracking
  const currentSwipeFruitsRef = useRef<FruitDefinition[]>([]);
  const lastSliceTimeRef = useRef<number>(0);

  // Spawn timer
  const lastSpawnTimeRef = useRef<number>(0);

  // Blade theme config
  const bladeTheme = AVAILABLE_BLADES.find((b) => b.id === selectedBladeId) || AVAILABLE_BLADES[0];

  // Load and cache background image
  useEffect(() => {
    if (bgImageUrl) {
      const img = new Image();
      img.src = bgImageUrl;
      img.onload = () => {
        bgImgRef.current = img;
      };
    }
  }, [bgImageUrl]);

  // Handle Resize
  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    }
  }, []);

  useEffect(() => {
    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);
    window.addEventListener('orientationchange', updateCanvasDimensions);

    let ro: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        updateCanvasDimensions();
      });
      ro.observe(containerRef.current);
    }

    const canvas = canvasRef.current;
    const preventTouchDefault = (e: TouchEvent) => {
      e.preventDefault();
    };
    if (canvas) {
      canvas.addEventListener('touchstart', preventTouchDefault, { passive: false });
      canvas.addEventListener('touchmove', preventTouchDefault, { passive: false });
    }

    return () => {
      window.removeEventListener('resize', updateCanvasDimensions);
      window.removeEventListener('orientationchange', updateCanvasDimensions);
      if (ro) {
        ro.disconnect();
      }
      if (canvas) {
        canvas.removeEventListener('touchstart', preventTouchDefault);
        canvas.removeEventListener('touchmove', preventTouchDefault);
      }
    };
  }, [updateCanvasDimensions]);

  // Spawns a new wave of fruits from bottom
  const spawnFruitWave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Determine how many fruits to spawn
    const count = Math.max(1, Math.min(4, fruitsPerWave + (isFrenzyActive ? 2 : 0)));

    for (let i = 0; i < count; i++) {
      // Pick fruit type
      let fruitDef: FruitDefinition;
      const roll = Math.random();

      if (roll < bombChance && !isFrenzyActive) {
        fruitDef = FRUIT_DEFINITIONS.bomb;
      } else if (roll < bombChance + specialFruitChance) {
        fruitDef = Math.random() > 0.5 ? FRUIT_DEFINITIONS.freeze_banana : FRUIT_DEFINITIONS.dragonfruit;
      } else {
        const pool = allowedFruits.length > 0 ? allowedFruits : (['watermelon', 'orange', 'strawberry'] as FruitId[]);
        const chosenId = pool[Math.floor(Math.random() * pool.length)] as FruitId;
        fruitDef = FRUIT_DEFINITIONS[chosenId] || FRUIT_DEFINITIONS.watermelon;
      }

      // Starting position spread along bottom edge
      const margin = 70;
      const x = margin + Math.random() * (width - margin * 2);
      const y = height + 40;

      // Trajectory towards upper center area
      const targetX = width * 0.25 + Math.random() * (width * 0.5);
      const targetY = height * 0.15 + Math.random() * (height * 0.25);

      // Launch physics
      const gravity = 0.24;
      const timeToPeak = 45 + Math.random() * 15;
      const vy = -gravity * timeToPeak;
      const vx = (targetX - x) / timeToPeak;

      fruitsRef.current.push({
        id: `fruit_${Date.now()}_${Math.random()}`,
        fruit: fruitDef,
        x,
        y,
        vx,
        vy,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08,
        scale: 1,
        wobblePhase: Math.random() * Math.PI,
        isSliced: false,
      });
    }
  }, [allowedFruits, bombChance, fruitsPerWave, isFrenzyActive, specialFruitChance]);

  // Create juicy splash particles & puddle decal
  const createJuiceEffects = (fruit: FruitDefinition, x: number, y: number, angleCut: number) => {
    // 1. Decal Splatter on cutting board
    if (splattersRef.current.length > 20) {
      splattersRef.current.shift(); // keep memory lean
    }
    const shapeOffsets = Array.from({ length: 10 }, () => (Math.random() - 0.5) * 0.4);
    splattersRef.current.push({
      id: `splat_${Date.now()}`,
      x,
      y,
      radius: fruit.radius * 0.95,
      color: fruit.juiceColor,
      alpha: 0.65,
      shapeOffsets,
    });

    // 2. High-speed spray particles
    const particleCount = fruit.id === 'dragonfruit' ? 36 : 18;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        radius: 2 + Math.random() * 3.5,
        color: Math.random() > 0.3 ? fruit.juiceColor : fruit.primaryColor,
        alpha: 1,
        maxLife: 30 + Math.random() * 20,
        life: 0,
      });
    }

    // 3. Fruit halves flying in opposite directions perpendicular to cut
    const perpAngle = angleCut + Math.PI / 2;
    const splitSpeed = 3.5;

    // Half 1
    halvesRef.current.push({
      fruit,
      x: x - Math.cos(perpAngle) * 6,
      y: y - Math.sin(perpAngle) * 6,
      vx: -Math.cos(perpAngle) * splitSpeed + (Math.random() - 0.5) * 2,
      vy: -Math.sin(perpAngle) * splitSpeed - 2,
      rotation: 0,
      vRot: -0.06 - Math.random() * 0.05,
      angleCut,
      half: 1,
      alpha: 1,
    });

    // Half 2
    halvesRef.current.push({
      fruit,
      x: x + Math.cos(perpAngle) * 6,
      y: y + Math.sin(perpAngle) * 6,
      vx: Math.cos(perpAngle) * splitSpeed + (Math.random() - 0.5) * 2,
      vy: Math.sin(perpAngle) * splitSpeed - 2,
      rotation: 0,
      vRot: 0.06 + Math.random() * 0.05,
      angleCut,
      half: 2,
      alpha: 1,
    });
  };

  // Slice Fruit Handler
  const sliceFruit = (fruitEntity: ActiveFruit, cutAngle: number) => {
    const { fruit, x, y } = fruitEntity;
    fruitEntity.isSliced = true;

    // Check if hazard bomb
    if (fruit.isHazard) {
      sound.playExplosion();
      screenShakeRef.current = 18; // violent shake
      onBombSliced();

      // Bomb smoke burst
      for (let i = 0; i < 30; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 3 + Math.random() * 8;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          radius: 4 + Math.random() * 6,
          color: Math.random() > 0.5 ? '#f97316' : '#27272a',
          alpha: 1,
          maxLife: 40,
          life: 0,
        });
      }

      floatingTextsRef.current.push({
        id: `txt_${Date.now()}`,
        text: 'BOMB! -1 LIFE',
        x,
        y: y - 20,
        color: '#ef4444',
        scale: 1.4,
        alpha: 1,
        vy: -2,
      });
      return;
    }

    // Normal or special fruit
    sound.playFruitSlice(fruit.id);
    createJuiceEffects(fruit, x, y, cutAngle);

    // Track for combo streak
    currentSwipeFruitsRef.current.push(fruit);
    lastSliceTimeRef.current = performance.now();

    // Special fruit behaviors
    if (fruit.id === 'freeze_banana') {
      sound.playFreeze();
      slowMoTimerRef.current = 300; // ~5 seconds at 60fps
      floatingTextsRef.current.push({
        id: `txt_${Date.now()}`,
        text: '❄️ ICE FREEZE!',
        x,
        y: y - 30,
        color: '#38bdf8',
        scale: 1.3,
        alpha: 1,
        vy: -2,
      });
    } else if (fruit.id === 'dragonfruit') {
      screenShakeRef.current = 6;
      floatingTextsRef.current.push({
        id: `txt_${Date.now()}`,
        text: '🌟 DRAGON BONUS +100',
        x,
        y: y - 30,
        color: '#facc15',
        scale: 1.5,
        alpha: 1,
        vy: -2.5,
      });
    } else {
      // Floating score popup
      const pts = isFrenzyActive ? fruit.points * 2 : fruit.points;
      floatingTextsRef.current.push({
        id: `txt_${Date.now()}_${Math.random()}`,
        text: `+${pts}`,
        x,
        y: y - 10,
        color: '#ffffff',
        scale: 1.1,
        alpha: 1,
        vy: -1.8,
      });
    }

    onFruitSliced(fruit, currentSwipeFruitsRef.current.length);
  };

  // Evaluate blade collision against airborne fruits
  const checkBladeCollisions = (p1: BladePoint, p2: BladePoint) => {
    const cutAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

    fruitsRef.current.forEach((item) => {
      if (item.isSliced) return;
      const dist = distToSegment(item.x, item.y, p1.x, p1.y, p2.x, p2.y);
      if (dist <= item.fruit.radius + 6) {
        sliceFruit(item, cutAngle);
      }
    });
  };

  // Pointer event handlers for cross-platform slicing
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPlaying || isPaused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isPointerDownRef.current = true;
    bladePointsRef.current = [{ x, y, time: performance.now() }];
    currentSwipeFruitsRef.current = [];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPlaying || isPaused || !isPointerDownRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = performance.now();

    const pts = bladePointsRef.current;
    const lastPt = pts[pts.length - 1];

    if (lastPt) {
      const dist = Math.hypot(x - lastPt.x, y - lastPt.y);
      if (dist > 4) {
        const newPt: BladePoint = { x, y, time: now };
        pts.push(newPt);

        // Sound effect on fast whoosh
        if (dist > 35 && pts.length % 4 === 0) {
          sound.playWhoosh();
        }

        // Check fruit cut
        checkBladeCollisions(lastPt, newPt);
      }
    } else {
      pts.push({ x, y, time: now });
    }
  };

  const handlePointerUp = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (e) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }
    isPointerDownRef.current = false;

    // Check if multi-fruit combo was achieved in this swipe
    const comboCount = currentSwipeFruitsRef.current.length;
    if (comboCount >= 3) {
      sound.playCombo(comboCount);
      const lastFruit = currentSwipeFruitsRef.current[comboCount - 1];
      const pts = comboCount * 25;
      const cvs = canvasRef.current;
      const posX = cvs ? cvs.clientWidth * 0.5 : window.innerWidth * 0.5;
      const posY = cvs ? cvs.clientHeight * 0.35 : window.innerHeight * 0.35;
      floatingTextsRef.current.push({
        id: `combo_${Date.now()}`,
        text: `⚡ ${comboCount}x COMBO! +${pts}`,
        x: posX,
        y: posY,
        color: '#facc15',
        scale: 1.6,
        alpha: 1,
        vy: -2,
      });
    }

    currentSwipeFruitsRef.current = [];
  };

  // Main 60fps RequestAnimationFrame Loop
  useEffect(() => {
    let animId: number;

    const gameLoop = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(gameLoop);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(gameLoop);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Time dilation for slow-motion freeze banana
      let timeStep = 1.0;
      if (slowMoTimerRef.current > 0) {
        slowMoTimerRef.current -= 1;
        timeStep = 0.35;
      }

      // Screen shake logic
      let shakeOffsetX = 0;
      let shakeOffsetY = 0;
      if (screenShakeRef.current > 0) {
        screenShakeRef.current *= 0.9;
        if (screenShakeRef.current < 0.2) screenShakeRef.current = 0;
        shakeOffsetX = (Math.random() - 0.5) * screenShakeRef.current;
        shakeOffsetY = (Math.random() - 0.5) * screenShakeRef.current;
      }

      ctx.save();
      ctx.translate(shakeOffsetX, shakeOffsetY);

      // 1. Draw Background
      if (bgImgRef.current && bgImgRef.current.complete) {
        ctx.drawImage(bgImgRef.current, 0, 0, width, height);
      } else {
        // Fallback wooden cutting board gradient
        const woodGrad = ctx.createLinearGradient(0, 0, width, height);
        woodGrad.addColorStop(0, '#78350f');
        woodGrad.addColorStop(0.5, '#451a03');
        woodGrad.addColorStop(1, '#271003');
        ctx.fillStyle = woodGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Subtle vignette shadow
      const vigGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.4,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.75
      );
      vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Render Juice Splatters (Cutting Board Decals)
      splattersRef.current.forEach((splat) => {
        renderSplatter(ctx, splat);
        // Slowly dry out
        splat.alpha = Math.max(0.1, splat.alpha - 0.0001);
      });

      // 3. Spawn Logic (when playing and not paused)
      if (isPlaying && !isPaused) {
        const interval = isFrenzyActive ? spawnInterval * 0.5 : spawnInterval;
        if (timestamp - lastSpawnTimeRef.current >= interval) {
          lastSpawnTimeRef.current = timestamp;
          spawnFruitWave();
        }
      }

      // 4. Update & Render Flying Fruits
      const currentFruits = fruitsRef.current;
      for (let i = currentFruits.length - 1; i >= 0; i--) {
        const f = currentFruits[i];

        if (isPlaying && !isPaused) {
          // Physics update
          f.x += f.vx * timeStep;
          f.y += f.vy * timeStep;
          f.vy += 0.24 * timeStep; // gravity
          f.rotation += f.vRot * timeStep;

          // Check if fruit fell off bottom unsliced
          if (f.y > height + 60 && f.vy > 0) {
            if (!f.isSliced && !f.fruit.isHazard) {
              onFruitDropped(f.fruit);
            }
            currentFruits.splice(i, 1);
            continue;
          }

          // Remove sliced fruits once processed
          if (f.isSliced) {
            currentFruits.splice(i, 1);
            continue;
          }
        }

        renderIntactFruit(ctx, f.fruit, f.x, f.y, f.fruit.radius, f.rotation, timestamp);
      }

      // 5. Update & Render Sliced Halves
      const halves = halvesRef.current;
      for (let i = halves.length - 1; i >= 0; i--) {
        const h = halves[i];
        if (isPlaying && !isPaused) {
          h.x += h.vx * timeStep;
          h.y += h.vy * timeStep;
          h.vy += 0.3 * timeStep; // gravity
          h.rotation += h.vRot * timeStep;
          h.alpha -= 0.008;

          if (h.y > height + 80 || h.alpha <= 0) {
            halves.splice(i, 1);
            continue;
          }
        }
        renderFruitHalf(ctx, h);
      }

      // 6. Update & Render Juice Burst Particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (isPlaying && !isPaused) {
          p.x += p.vx * timeStep;
          p.y += p.vy * timeStep;
          p.vy += 0.22 * timeStep; // particle gravity
          p.life += 1;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);

          if (p.life >= p.maxLife) {
            particles.splice(i, 1);
            continue;
          }
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 7. Render Blade Glowing Trail
      const now = performance.now();
      const bladeLife = 180; // ms
      bladePointsRef.current = bladePointsRef.current.filter((pt) => now - pt.time < bladeLife);
      const pts = bladePointsRef.current;

      if (pts.length > 1) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Outer Glow
        ctx.shadowColor = bladeTheme.glowColor;
        ctx.shadowBlur = 14;

        for (let i = 1; i < pts.length; i++) {
          const pPrev = pts[i - 1];
          const pCurr = pts[i];
          const ageRatio = (now - pCurr.time) / bladeLife; // 0 (new) to 1 (old)
          const widthVal = Math.max(1, (1 - ageRatio) * 10);
          const alphaVal = Math.max(0, 1 - ageRatio);

          ctx.strokeStyle = bladeTheme.glowColor;
          ctx.globalAlpha = alphaVal * 0.7;
          ctx.lineWidth = widthVal + 4;
          ctx.beginPath();
          ctx.moveTo(pPrev.x, pPrev.y);
          ctx.lineTo(pCurr.x, pCurr.y);
          ctx.stroke();

          // Core bright razor center
          ctx.strokeStyle = bladeTheme.coreColor;
          ctx.globalAlpha = alphaVal;
          ctx.lineWidth = widthVal;
          ctx.beginPath();
          ctx.moveTo(pPrev.x, pPrev.y);
          ctx.lineTo(pCurr.x, pCurr.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 8. Update & Render Floating Score / Combo Texts
      const fTexts = floatingTextsRef.current;
      for (let i = fTexts.length - 1; i >= 0; i--) {
        const ft = fTexts[i];
        if (isPlaying && !isPaused) {
          ft.y += ft.vy;
          ft.alpha -= 0.02;
          if (ft.alpha <= 0) {
            fTexts.splice(i, 1);
            continue;
          }
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = `bold ${Math.round(24 * ft.scale)}px Outfit, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 8;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // 9. Slow-Motion Frost Edge Vignette
      if (slowMoTimerRef.current > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 14;
        ctx.strokeRect(0, 0, width, height);

        ctx.fillStyle = 'rgba(186, 230, 253, 0.06)';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // 10. Frenzy Rainbow Border
      if (isFrenzyActive) {
        ctx.save();
        const hue = (timestamp / 8) % 360;
        ctx.strokeStyle = `hsla(${hue}, 90%, 60%, 0.6)`;
        ctx.lineWidth = 8;
        ctx.strokeRect(0, 0, width, height);
        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [
    bladeTheme,
    isFrenzyActive,
    isPaused,
    isPlaying,
    onFruitDropped,
    spawnFruitWave,
    spawnInterval,
  ]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none canvas-container blade-cursor"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full block touch-none"
      />
    </div>
  );
};
