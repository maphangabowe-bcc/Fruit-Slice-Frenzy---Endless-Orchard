/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Sparkles, Trophy, ShoppingBag, BookOpen, Layers, Volume2, VolumeX, Flame, Coins, Heart, Clock } from 'lucide-react';
import { GameMode, PlayerStats } from '../types/game';
import { sound } from '../utils/audio';
import { PWAInstallButton } from './PWAInstallButton';

interface TitleMenuProps {
  stats: PlayerStats;
  onStartGame: (mode: GameMode, level?: number) => void;
  onOpenLevelSelect: () => void;
  onOpenMarket: () => void;
  onOpenCodex: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TitleMenu: React.FC<TitleMenuProps> = ({
  stats,
  onStartGame,
  onOpenLevelSelect,
  onOpenMarket,
  onOpenCodex,
  soundEnabled,
  onToggleSound,
}) => {
  const totalStars = Object.values(stats.levelStars).reduce((acc, curr) => acc + curr, 0);

  return (
    <div
      className="relative w-full min-h-[100dvh] flex flex-col justify-between text-white bg-cover bg-center select-none overflow-x-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(20, 8, 4, 0.75), rgba(20, 8, 4, 0.88)), url('/src/assets/images/game_tropical_orchard_bg_1793179934838.jpg')`,
      }}
    >
      {/* Top Bar Contract (3 zones, responsive for all phone/tablet/desktop viewports) */}
      <header className="w-full flex items-center justify-between gap-2 sm:gap-6 px-3 sm:px-6 py-3 md:py-4 border-b border-white/10 bg-black/50 backdrop-blur-md z-10 sticky top-0 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
        {/* Zone 1: Brand wordmark */}
        <div className="text-base sm:text-xl md:text-2xl font-black font-game text-amber-300 tracking-tight whitespace-nowrap shrink-0 flex items-center gap-1.5 sm:gap-2">
          <span>🍉 Fruit Slice Frenzy</span>
        </div>

        {/* Zone 2: Navigation Links for medium and large screens */}
        <nav className="hidden lg:flex items-center gap-6 text-xs md:text-sm font-semibold text-amber-100/80">
          <button
            onClick={() => {
              sound.playClick();
              onOpenLevelSelect();
            }}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Endless Levels</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onOpenMarket();
            }}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Blade Market</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onOpenCodex();
            }}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Fruit Codex</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Coins Counter */}
          <div
            onClick={() => {
              sound.playClick();
              onOpenMarket();
            }}
            className="flex items-center gap-1 sm:gap-1.5 bg-black/50 hover:bg-black/70 px-2 sm:px-3 py-1.5 rounded-xl border border-amber-500/30 cursor-pointer transition-colors"
            title="Open Market"
          >
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span className="font-mono font-bold text-amber-300 text-xs sm:text-sm tabular-nums">
              {stats.coins.toLocaleString()}
            </span>
          </div>

          {/* Install PWA Button */}
          <PWAInstallButton />

          {/* Sound Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-xl bg-black/50 hover:bg-black/70 border border-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          {/* Quick Play Button */}
          <button
            onClick={() => {
              sound.playClick();
              onStartGame('CAMPAIGN', stats.highestLevel);
            }}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-black bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 rounded-xl shadow-lg transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            Play Lv.{stats.highestLevel}
          </button>
        </div>
      </header>

      {/* Hero & Game Options Section */}
      <div className="flex-1 max-w-5xl mx-auto px-4 py-5 md:py-8 flex flex-col justify-center items-center text-center z-10 w-full">
        {/* Title & Tagline */}
        <div className="mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Endless Levels · High-Performance Slicing</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-game text-white tracking-tight drop-shadow-lg leading-tight">
            Slice. Combo. <span className="text-amber-400">Conquer.</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-amber-100/80 max-w-xl mx-auto mt-2 leading-relaxed">
            Drag your blade through flying fresh fruits, chain supersonic combos, avoid explosive hazards, and advance through infinite handcrafted levels.
          </p>
        </div>

        {/* All-Device Options & Menus Bar (Ensures all players see all menus on every device) */}
        <div className="w-full max-w-2xl mx-auto grid grid-cols-3 gap-2 sm:gap-3 mb-6 md:mb-8">
          {/* Option 1: Endless Levels */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenLevelSelect();
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 p-2.5 sm:p-3 rounded-xl bg-black/55 hover:bg-amber-900/60 border border-amber-500/30 hover:border-amber-400 text-amber-100 transition-all hover:scale-[1.02] shadow-md group cursor-pointer"
          >
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <div className="text-center sm:text-left">
              <div className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 whitespace-nowrap">
                Levels
              </div>
              <div className="text-[10px] text-amber-300/80 whitespace-nowrap">
                ★ {totalStars} Stars
              </div>
            </div>
          </button>

          {/* Option 2: Blade Market */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenMarket();
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 p-2.5 sm:p-3 rounded-xl bg-black/55 hover:bg-amber-900/60 border border-amber-500/30 hover:border-amber-400 text-amber-100 transition-all hover:scale-[1.02] shadow-md group cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <div className="text-center sm:text-left">
              <div className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 whitespace-nowrap">
                Market
              </div>
              <div className="text-[10px] text-amber-300/80 whitespace-nowrap">
                {stats.coins.toLocaleString()} Coins
              </div>
            </div>
          </button>

          {/* Option 3: Fruit Codex */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenCodex();
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 p-2.5 sm:p-3 rounded-xl bg-black/55 hover:bg-amber-900/60 border border-amber-500/30 hover:border-amber-400 text-amber-100 transition-all hover:scale-[1.02] shadow-md group cursor-pointer"
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <div className="text-center sm:text-left">
              <div className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 whitespace-nowrap">
                Codex
              </div>
              <div className="text-[10px] text-amber-300/80 whitespace-nowrap">
                {stats.totalSlices.toLocaleString()} Slices
              </div>
            </div>
          </button>
        </div>

        {/* 3 Game Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full mb-6 md:mb-8">
          {/* Card 1: Campaign */}
          <div
            onClick={() => {
              sound.playClick();
              onStartGame('CAMPAIGN', stats.highestLevel);
            }}
            className="group relative p-5 rounded-2xl bg-black/50 hover:bg-black/65 border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all duration-200 flex flex-col justify-between text-left shadow-xl hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Adventure Quest
                </span>
                <span className="text-xs font-mono font-bold text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded-md">
                  Lv. {stats.highestLevel}
                </span>
              </div>
              <h3 className="text-xl font-bold font-game text-white mb-1 group-hover:text-amber-300 transition-colors">
                Endless Campaign
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Advance through endless procedural levels with specific fruit quotas, time blitzes, and 3-star ratings.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-xs text-amber-200/90 font-medium">
                ★ {totalStars} Total Stars
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow">
                <Play className="w-4 h-4 fill-black ml-0.5" />
              </div>
            </div>
          </div>

          {/* Card 2: Classic Survival */}
          <div
            onClick={() => {
              sound.playClick();
              onStartGame('CLASSIC');
            }}
            className="group relative p-5 rounded-2xl bg-black/50 hover:bg-black/65 border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all duration-200 flex flex-col justify-between text-left shadow-xl hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" /> 3 Lives
                </span>
                <span className="text-xs font-mono font-bold text-red-200 bg-red-500/20 px-2 py-0.5 rounded-md">
                  High: {stats.highScores.classic.toLocaleString()}
                </span>
              </div>
              <h3 className="text-xl font-bold font-game text-white mb-1 group-hover:text-amber-300 transition-colors">
                Classic Survival
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                The arcade purist challenge. Don't drop 3 fruits, avoid spike bombs, and survive intensifying speed.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-xs text-slate-300 font-medium">
                Infinite Escalation
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow">
                <Play className="w-4 h-4 fill-black ml-0.5" />
              </div>
            </div>
          </div>

          {/* Card 3: Zen Arcade */}
          <div
            onClick={() => {
              sound.playClick();
              onStartGame('ZEN');
            }}
            className="group relative p-5 rounded-2xl bg-black/50 hover:bg-black/65 border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all duration-200 flex flex-col justify-between text-left shadow-xl hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 90s Blitz
                </span>
                <span className="text-xs font-mono font-bold text-teal-200 bg-teal-500/20 px-2 py-0.5 rounded-md">
                  High: {stats.highScores.zen.toLocaleString()}
                </span>
              </div>
              <h3 className="text-xl font-bold font-game text-white mb-1 group-hover:text-amber-300 transition-colors">
                Zen Arcade
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Zero bombs, zero dropped-fruit penalties. Pure 90-second slice flow state and combo chaining.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-xs text-slate-300 font-medium">
                Stress-Free Flow
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow">
                <Play className="w-4 h-4 fill-black ml-0.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Lifetime Player Records Strip */}
        <div className="w-full bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="p-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Slices</div>
            <div className="text-xl font-black font-game text-white tabular-nums">
              {stats.totalSlices.toLocaleString()}
            </div>
          </div>
          <div className="p-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Max Combo</div>
            <div className="text-xl font-black font-game text-amber-300 tabular-nums">
              {stats.maxCombo}x Streak
            </div>
          </div>
          <div className="p-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Highest Level</div>
            <div className="text-xl font-black font-game text-emerald-400 tabular-nums">
              Level {stats.highestLevel}
            </div>
          </div>
          <div className="p-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Stars</div>
            <div className="text-xl font-black font-game text-amber-400 tabular-nums">
              ★ {totalStars}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer
        className="w-full py-4 px-6 border-t border-white/10 bg-black/60 backdrop-blur-md text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 z-10 shrink-0"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <div>
          <span>Fruit Slice Frenzy</span>
          <span className="mx-2">·</span>
          <span>Endless Juicy Arcade</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => {
              sound.playClick();
              onOpenLevelSelect();
            }}
            className="hover:text-amber-300 py-1 transition-colors cursor-pointer"
          >
            Level Select
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onOpenMarket();
            }}
            className="hover:text-amber-300 py-1 transition-colors cursor-pointer"
          >
            Blade Market
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onOpenCodex();
            }}
            className="hover:text-amber-300 py-1 transition-colors cursor-pointer"
          >
            Fruit Codex
          </button>
        </div>
      </footer>
    </div>
  );
};
