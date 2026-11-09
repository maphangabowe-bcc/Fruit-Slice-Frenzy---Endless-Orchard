/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, BookOpen, Layers, ShoppingBag, Sparkles } from 'lucide-react';
import { FRUIT_DEFINITIONS } from '../utils/fruitRenderer';
import { sound } from '../utils/audio';

interface FruitCodexPageProps {
  fruitsSlicedCount: Record<string, number>;
  onBackToHome: () => void;
  onOpenLevelSelect?: () => void;
  onOpenMarket?: () => void;
}

export const FruitCodexPage: React.FC<FruitCodexPageProps> = ({
  fruitsSlicedCount,
  onBackToHome,
  onOpenLevelSelect,
  onOpenMarket,
}) => {
  const fruits = Object.values(FRUIT_DEFINITIONS);
  const totalLifetimeSlices = Object.values(fruitsSlicedCount).reduce((a, b) => a + b, 0);

  return (
    <div
      className="relative w-full min-h-[100dvh] flex flex-col justify-between text-white bg-cover bg-center select-none overflow-x-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(20, 8, 4, 0.88), rgba(20, 8, 4, 0.94)), url('/src/assets/images/game_tropical_orchard_bg_1793179934838.jpg')`,
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
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h1 className="text-lg sm:text-2xl font-black font-game text-amber-200">
            Orchard Fruit Codex
          </h1>
        </div>

        {/* Total Slices Counter */}
        <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-xl border border-amber-500/40 shadow-inner shrink-0 text-amber-300 font-mono font-bold text-xs sm:text-sm tabular-nums">
          <span>{totalLifetimeSlices.toLocaleString()} Slices</span>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 md:py-8 w-full flex flex-col items-center">
        <div className="w-full text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Botanical Encyclopedia & Lifetime Slicing Stats</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-100/80 max-w-lg mx-auto">
            Discover real-world botanical facts, slice point values, and your personal lifetime slicing records for every fruit in the orchard.
          </p>
        </div>

        {/* Fruit Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full mb-8">
          {fruits.map((f) => {
            const count = fruitsSlicedCount[f.id] || 0;

            return (
              <div
                key={f.id}
                className="p-5 rounded-2xl bg-black/50 border border-amber-500/30 hover:border-amber-400 flex flex-col justify-between transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-5 h-5 rounded-full border border-white/30 shadow-md"
                        style={{ backgroundColor: f.primaryColor }}
                      />
                      <h3 className="font-bold text-base sm:text-lg text-amber-200 font-game">
                        {f.name}
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 tabular-nums">
                      +{f.points} pts
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 italic leading-relaxed mb-6">
                    "{f.trivia || 'A staple of the endless fruit orchard.'}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-slate-300 font-semibold">
                  <span>Lifetime Sliced:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm tabular-nums">
                    {count.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer
        className="w-full py-4 px-6 border-t border-white/10 bg-black/60 backdrop-blur-md text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 z-10 shrink-0"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <div>
          <span>Orchard Fruit Codex</span>
          <span className="mx-2">·</span>
          <span>Fruit Slice Frenzy</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          {onOpenLevelSelect && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenLevelSelect();
              }}
              className="hover:text-amber-300 py-1 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Level Select</span>
            </button>
          )}
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
