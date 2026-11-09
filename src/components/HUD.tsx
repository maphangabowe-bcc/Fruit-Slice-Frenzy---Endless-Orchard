/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameMode, LevelObjective } from '../types/game';
import { Pause, Volume2, VolumeX, Zap, Heart, Trophy, Clock } from 'lucide-react';
import { sound } from '../utils/audio';

interface HUDProps {
  mode: GameMode;
  levelNumber?: number;
  levelTitle?: string;
  chapterTitle?: string;
  score: number;
  highScore: number;
  lives: number;
  maxLives: number;
  timeRemaining?: number;
  frenzyJuice: number; // 0 to 100
  isFrenzyActive: boolean;
  objectives?: LevelObjective[];
  onPause: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  mode,
  levelNumber,
  levelTitle,
  chapterTitle,
  score,
  highScore,
  lives,
  maxLives,
  timeRemaining,
  frenzyJuice,
  isFrenzyActive,
  objectives = [],
  onPause,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 pointer-events-none p-3 md:p-5 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] flex flex-col gap-2 z-20">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 w-full">
        {/* Left Zone: Mode & Level / Objectives Summary */}
        <div className="flex items-center gap-2 sm:gap-3 bg-black/60 backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-white/10 text-white shadow-lg pointer-events-auto shrink-1 min-w-0">
          {mode === 'CAMPAIGN' && levelNumber ? (
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] font-medium text-amber-300 uppercase tracking-wider truncate max-w-[90px] sm:max-w-[140px]">
                {chapterTitle?.split(':')[1]?.trim() || chapterTitle || 'Orchard'}
              </div>
              <div className="text-xs sm:text-base font-bold text-white flex items-center gap-1 sm:gap-2 truncate">
                <span className="shrink-0">Lv. {levelNumber}</span>
                <span className="text-white/40 font-normal hidden sm:inline">|</span>
                <span className="truncate max-w-[80px] sm:max-w-[180px] text-white/90 font-medium hidden sm:inline">
                  {levelTitle?.split(': ')[1] || 'Endless Quest'}
                </span>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-[10px] sm:text-[11px] font-medium text-amber-300 uppercase tracking-wider">
                {mode === 'CLASSIC' ? 'Classic' : 'Zen'}
              </div>
              <div className="text-xs sm:text-sm font-bold text-white">
                Best: <span className="tabular-nums font-mono text-amber-200">{highScore.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Center Zone: Score & Frenzy Meter */}
        <div className="flex flex-col items-center shrink-0">
          <div className="bg-black/65 backdrop-blur-md px-3 sm:px-5 py-1 sm:py-1.5 rounded-2xl border border-white/15 text-center shadow-xl">
            <div className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-slate-300 uppercase">
              Score
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black font-game text-amber-300 tabular-nums tracking-tight">
              {score.toLocaleString()}
            </div>
          </div>

          {/* Frenzy Juice Bar */}
          <div className="w-24 sm:w-36 md:w-44 mt-1 bg-black/60 rounded-full h-2 sm:h-2.5 p-0.5 border border-white/20 overflow-hidden shadow-inner flex items-center">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                isFrenzyActive
                  ? 'bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-400 animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-orange-400'
              }`}
              style={{ width: `${Math.min(100, frenzyJuice)}%` }}
            />
          </div>
          {isFrenzyActive && (
            <span className="text-[9px] sm:text-[10px] font-extrabold text-amber-300 uppercase tracking-wider animate-bounce mt-0.5 drop-shadow">
              🔥 2X FRENZY!
            </span>
          )}
        </div>

        {/* Right Zone: Status & Control Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
          {/* Timer if applicable */}
          {timeRemaining !== undefined && (
            <div
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border backdrop-blur-md shadow-lg ${
                timeRemaining <= 10
                  ? 'bg-red-950/80 border-red-500/50 text-red-200 animate-pulse'
                  : 'bg-black/60 border-white/10 text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
              <span className="text-xs sm:text-sm font-bold font-mono tabular-nums">{timeRemaining}s</span>
            </div>
          )}

          {/* Lives (Hearts) in Classic or Campaign */}
          {mode !== 'ZEN' && maxLives > 0 && (
            <div className="flex items-center gap-0.5 sm:gap-1 bg-black/60 backdrop-blur-md px-1.5 sm:px-2.5 py-1.5 sm:py-2 rounded-xl border border-white/10 shadow-lg">
              {Array.from({ length: maxLives }).map((_, idx) => (
                <Heart
                  key={idx}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-transform ${
                    idx < lives
                      ? 'fill-red-500 text-red-500 scale-100'
                      : 'fill-transparent text-white/25 scale-90'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            aria-label="Toggle Sound"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-black/60 hover:bg-black/80 active:scale-95 text-white/80 hover:text-white border border-white/10 backdrop-blur-md transition-all"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={() => {
              sound.playClick();
              onPause();
            }}
            aria-label="Pause Game"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-black/60 hover:bg-black/80 active:scale-95 text-white/80 hover:text-white border border-white/10 backdrop-blur-md transition-all"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Campaign Objectives Strip (Unboxed metadata style per Frontend Design Skill) */}
      {mode === 'CAMPAIGN' && objectives.length > 0 && (
        <div className="self-center flex flex-wrap items-center justify-center gap-3 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-xs text-white/90 shadow-md">
          {objectives.map((obj, i) => {
            const isCompleted = obj.current >= obj.target;
            return (
              <div key={i} className="flex items-center gap-1.5">
                <span className={isCompleted ? 'text-emerald-400 line-through' : 'text-slate-200'}>
                  {obj.description}:
                </span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    isCompleted ? 'text-emerald-400' : 'text-amber-300'
                  }`}
                >
                  {obj.current} / {obj.target}
                </span>
                {isCompleted && <span className="text-emerald-400">✓</span>}
                {i < objectives.length - 1 && <span className="text-white/30 ml-2">·</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
