/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Star, Lock, Play, ChevronLeft, ChevronRight, Layers, ShoppingBag, BookOpen } from 'lucide-react';
import { generateLevel } from '../utils/levelGenerator';
import { sound } from '../utils/audio';

interface LevelSelectPageProps {
  highestUnlockedLevel: number;
  levelStars: Record<number, number>;
  onSelectLevel: (lvl: number) => void;
  onBackToHome: () => void;
  onOpenMarket?: () => void;
  onOpenCodex?: () => void;
}

const LEVELS_PER_PAGE = 12;

export const LevelSelectPage: React.FC<LevelSelectPageProps> = ({
  highestUnlockedLevel,
  levelStars,
  onSelectLevel,
  onBackToHome,
  onOpenMarket,
  onOpenCodex,
}) => {
  const initialPage = Math.floor((highestUnlockedLevel - 1) / LEVELS_PER_PAGE);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  const startLevel = currentPage * LEVELS_PER_PAGE + 1;
  const levels = Array.from({ length: LEVELS_PER_PAGE }, (_, i) => startLevel + i);

  const totalStars = Object.values(levelStars).reduce((acc, curr) => acc + curr, 0);

  return (
    <div
      className="relative w-full min-h-[100dvh] flex flex-col justify-between text-white bg-cover bg-center select-none overflow-x-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(20, 8, 4, 0.88), rgba(20, 8, 4, 0.94)), url('/src/assets/images/game_wood_cutting_board_1793179934367.jpg')`,
      }}
    >
      {/* Top Bar */}
      <header className="w-full flex items-center justify-between gap-4 px-4 sm:px-8 py-3.5 md:py-4 border-b border-amber-500/20 bg-black/60 backdrop-blur-md sticky top-0 z-20 pt-[max(0.875rem,env(safe-area-inset-top,0px))]">
        <button
          onClick={() => {
            sound.playClick();
            onBackToHome();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-bold transition-all hover:-translate-x-0.5 cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          <h1 className="text-lg sm:text-2xl font-black font-game text-amber-200">
            Endless Level Select
          </h1>
        </div>

        {/* Stars Counter */}
        <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-xl border border-amber-500/40 shadow-inner shrink-0 text-amber-300 font-bold text-xs sm:text-sm">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>★ {totalStars}</span>
        </div>
      </header>

      {/* Main Levels Grid */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 md:py-8 w-full flex flex-col items-center">
        <div className="w-full text-center mb-6">
          <p className="text-xs sm:text-sm text-amber-100/80 max-w-md mx-auto">
            Select any unlocked level to challenge score quotas, fruit slice goals, and earn up to 3 stars per level!
          </p>
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4 w-full mb-8">
          {levels.map((lvl) => {
            const isUnlocked = lvl <= highestUnlockedLevel;
            const stars = levelStars[lvl] || 0;
            const levelInfo = generateLevel(lvl);

            return (
              <div
                key={lvl}
                onClick={() => {
                  if (isUnlocked) {
                    sound.playClick();
                    onSelectLevel(lvl);
                  }
                }}
                className={`relative p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                  isUnlocked
                    ? 'bg-black/50 hover:bg-amber-900/60 border-amber-500/40 hover:border-amber-400 cursor-pointer hover:scale-[1.02] shadow-lg group'
                    : 'bg-black/40 border-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-black font-game text-amber-200">
                      #{lvl}
                    </span>
                    {isUnlocked ? (
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= stars
                                ? 'text-amber-400 fill-amber-400 drop-shadow'
                                : 'text-slate-600 fill-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  <div className="text-xs font-bold text-slate-200 truncate mb-1">
                    {levelInfo.title.replace(`Level ${lvl}: `, '')}
                  </div>
                  <div className="text-[11px] text-amber-300/80 font-mono truncate">
                    {levelInfo.chapter}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-amber-200 font-semibold">
                  <span>Goal: {levelInfo.objectives[0]?.target.toLocaleString()}</span>
                  {isUnlocked && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-3 h-3 fill-black ml-0.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between w-full max-w-md bg-black/60 px-4 py-2.5 rounded-2xl border border-amber-500/30 shadow-lg">
          <button
            disabled={currentPage === 0}
            onClick={() => {
              sound.playClick();
              setCurrentPage((p) => Math.max(0, p - 1));
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-amber-200 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <span className="text-xs text-amber-100/90 font-mono font-bold">
            Page {currentPage + 1} ({startLevel} - {startLevel + LEVELS_PER_PAGE - 1})
          </span>

          <button
            onClick={() => {
              sound.playClick();
              setCurrentPage((p) => p + 1);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-xs font-bold text-amber-200 transition-colors cursor-pointer"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="w-full py-4 px-6 border-t border-white/10 bg-black/60 backdrop-blur-md text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 z-10 shrink-0"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <div>
          <span>Endless Orchard Level Select</span>
          <span className="mx-2">·</span>
          <span>Fruit Slice Frenzy</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          {onOpenMarket && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenMarket();
              }}
              className="hover:text-amber-300 py-1 transition-colors cursor-pointer flex items-center gap-1"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>Blade Market</span>
            </button>
          )}
          {onOpenCodex && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenCodex();
              }}
              className="hover:text-amber-300 py-1 transition-colors cursor-pointer flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Fruit Codex</span>
            </button>
          )}
          <button
            onClick={() => {
              sound.playClick();
              onBackToHome();
            }}
            className="hover:text-amber-300 py-1 transition-colors cursor-pointer text-amber-200 font-bold"
          >
            ← Home Menu
          </button>
        </div>
      </footer>
    </div>
  );
};
