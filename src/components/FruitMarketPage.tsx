/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Check, Coins, ShoppingBag, Sparkles, Layers, BookOpen } from 'lucide-react';
import { AVAILABLE_ARENAS, AVAILABLE_BLADES } from '../utils/levelGenerator';
import { sound } from '../utils/audio';

interface FruitMarketPageProps {
  coins: number;
  unlockedBlades: string[];
  unlockedArenas: string[];
  selectedBlade: string;
  selectedArena: string;
  onSelectBlade: (id: string) => void;
  onSelectArena: (id: string) => void;
  onBuyBlade: (id: string, price: number) => void;
  onBuyArena: (id: string, price: number) => void;
  onBackToHome: () => void;
  onOpenLevelSelect?: () => void;
  onOpenCodex?: () => void;
}

export const FruitMarketPage: React.FC<FruitMarketPageProps> = ({
  coins,
  unlockedBlades,
  unlockedArenas,
  selectedBlade,
  selectedArena,
  onSelectBlade,
  onSelectArena,
  onBuyBlade,
  onBuyArena,
  onBackToHome,
  onOpenLevelSelect,
  onOpenCodex,
}) => {
  const [activeTab, setActiveTab] = useState<'BLADES' | 'ARENAS'>('BLADES');

  return (
    <div
      className="relative w-full min-h-[100dvh] flex flex-col justify-between text-white bg-cover bg-center select-none overflow-x-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(20, 8, 4, 0.88), rgba(20, 8, 4, 0.94)), url('/src/assets/images/game_fruit_market_stall_1793179935456.jpg')`,
      }}
    >
      {/* Top Navigation Bar */}
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
          <ShoppingBag className="w-5 h-5 text-amber-400" />
          <h1 className="text-lg sm:text-2xl font-black font-game text-amber-200">
            Fruit Market & Armory
          </h1>
        </div>

        {/* Coins Counter */}
        <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-xl border border-amber-500/40 shadow-inner shrink-0">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="font-mono font-bold text-amber-300 text-sm sm:text-base tabular-nums">
            {coins.toLocaleString()}
          </span>
        </div>
      </header>

      {/* Main Market Body */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 md:py-8 w-full flex flex-col items-center">
        {/* Banner */}
        <div className="w-full mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Custom Forged Blades & Organic Boards</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-100/80 max-w-lg mx-auto">
            Spend earned juicy coins to unlock laser blades with custom glow trails and rustic orchard cutting boards.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="w-full max-w-md flex items-center gap-2 p-1 bg-black/60 rounded-xl border border-amber-500/30 mb-6 shrink-0 shadow-lg">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('BLADES');
            }}
            className={`min-h-[42px] flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'BLADES'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md'
                : 'text-amber-100/70 hover:text-white'
            }`}
          >
            Blade Armory ({AVAILABLE_BLADES.length})
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('ARENAS');
            }}
            className={`min-h-[42px] flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'ARENAS'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md'
                : 'text-amber-100/70 hover:text-white'
            }`}
          >
            Orchard Arenas ({AVAILABLE_ARENAS.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="w-full">
          {activeTab === 'BLADES' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {AVAILABLE_BLADES.map((blade) => {
                const isUnlocked = unlockedBlades.includes(blade.id);
                const isEquipped = selectedBlade === blade.id;
                const canAfford = coins >= blade.price;

                return (
                  <div
                    key={blade.id}
                    className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                      isEquipped
                        ? 'bg-amber-900/60 border-amber-400 shadow-xl ring-2 ring-amber-400'
                        : isUnlocked
                        ? 'bg-black/50 border-amber-500/30 hover:border-amber-400'
                        : 'bg-black/40 border-white/10 opacity-85'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg text-amber-200 font-game">{blade.name}</h3>
                        {/* Blade preview glow line */}
                        <div
                          className="w-14 h-3 rounded-full shadow-md"
                          style={{
                            background: `linear-gradient(90deg, ${blade.coreColor}, ${blade.glowColor})`,
                            boxShadow: `0 0 12px ${blade.glowColor}`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-6">
                        {blade.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      {isUnlocked ? (
                        isEquipped ? (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                            <Check className="w-4 h-4" /> Active Blade
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              sound.playClick();
                              onSelectBlade(blade.id);
                            }}
                            className="w-full py-2 px-4 rounded-xl bg-amber-700 hover:bg-amber-600 text-xs font-bold text-white transition-colors cursor-pointer shadow-md"
                          >
                            Equip Blade
                          </button>
                        )
                      ) : (
                        <button
                          disabled={!canAfford}
                          onClick={() => {
                            if (canAfford) {
                              sound.playCoin();
                              onBuyBlade(blade.id, blade.price);
                            }
                          }}
                          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            canAfford
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                              : 'bg-white/10 text-white/40 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-4 h-4" />
                          <span>Unlock for {blade.price} Coins</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {AVAILABLE_ARENAS.map((arena) => {
                const isUnlocked = unlockedArenas.includes(arena.id);
                const isEquipped = selectedArena === arena.id;
                const canAfford = coins >= arena.price;

                return (
                  <div
                    key={arena.id}
                    className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                      isEquipped
                        ? 'bg-amber-900/60 border-amber-400 shadow-xl ring-2 ring-amber-400'
                        : isUnlocked
                        ? 'bg-black/50 border-amber-500/30 hover:border-amber-400'
                        : 'bg-black/40 border-white/10 opacity-85'
                    }`}
                  >
                    <div>
                      {/* Arena image preview thumbnail */}
                      <div className="w-full h-32 rounded-xl overflow-hidden mb-3 border border-white/10 relative shadow-inner">
                        <img
                          src={arena.bgImage}
                          alt={arena.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        {isEquipped && (
                          <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md">
                            Active Board
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-amber-200 mb-1 font-game">{arena.name}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed mb-6">
                        {arena.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      {isUnlocked ? (
                        isEquipped ? (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                            <Check className="w-4 h-4" /> Active Arena
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              sound.playClick();
                              onSelectArena(arena.id);
                            }}
                            className="w-full py-2 px-4 rounded-xl bg-amber-700 hover:bg-amber-600 text-xs font-bold text-white transition-colors cursor-pointer shadow-md"
                          >
                            Set Active Board
                          </button>
                        )
                      ) : (
                        <button
                          disabled={!canAfford}
                          onClick={() => {
                            if (canAfford) {
                              sound.playCoin();
                              onBuyArena(arena.id, arena.price);
                            }
                          }}
                          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            canAfford
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                              : 'bg-white/10 text-white/40 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-4 h-4" />
                          <span>Unlock for {arena.price} Coins</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer
        className="w-full py-4 px-6 border-t border-white/10 bg-black/60 backdrop-blur-md text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 z-10 shrink-0"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <div>
          <span>Fruit Market & Armory</span>
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
