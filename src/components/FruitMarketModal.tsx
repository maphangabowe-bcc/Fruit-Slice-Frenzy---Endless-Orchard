/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Sparkles, Check, Lock, Coins, ShieldCheck, Flame } from 'lucide-react';
import { AVAILABLE_ARENAS, AVAILABLE_BLADES } from '../utils/levelGenerator';
import { sound } from '../utils/audio';

interface FruitMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  unlockedBlades: string[];
  unlockedArenas: string[];
  selectedBlade: string;
  selectedArena: string;
  onSelectBlade: (id: string) => void;
  onSelectArena: (id: string) => void;
  onBuyBlade: (id: string, price: number) => void;
  onBuyArena: (id: string, price: number) => void;
}

export const FruitMarketModal: React.FC<FruitMarketModalProps> = ({
  isOpen,
  onClose,
  coins,
  unlockedBlades,
  unlockedArenas,
  selectedBlade,
  selectedArena,
  onSelectBlade,
  onSelectArena,
  onBuyBlade,
  onBuyArena,
}) => {
  const [activeTab, setActiveTab] = useState<'BLADES' | 'ARENAS'>('BLADES');

  if (!isOpen) return null;

  return (
    <div
      onClick={() => {
        sound.playClick();
        onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-amber-950 border border-amber-500/40 rounded-2xl p-4 sm:p-6 text-white shadow-2xl flex flex-col max-h-[min(92dvh,720px)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 sm:pb-4 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="text-xl sm:text-2xl font-bold font-game text-amber-200">Fruit Market</h2>
            {/* Coins Balance */}
            <div className="flex items-center gap-1 sm:gap-1.5 bg-black/40 px-2.5 sm:px-3 py-1 rounded-full border border-amber-500/30">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span className="font-mono font-bold text-amber-300 text-xs sm:text-sm tabular-nums">
                {coins.toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-black/40 hover:bg-black/60 active:scale-95 text-slate-300 hover:text-white transition-all cursor-pointer"
            aria-label="Close Market"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls (Functional segmented control) */}
        <div className="flex items-center gap-2 my-3 sm:my-4 p-1 bg-black/40 rounded-xl border border-white/5 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('BLADES');
            }}
            className={`min-h-[40px] flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'BLADES'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-amber-100/70 hover:text-white'
            }`}
          >
            Blade Armory
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('ARENAS');
            }}
            className={`min-h-[40px] flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'ARENAS'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-amber-100/70 hover:text-white'
            }`}
          >
            Orchard Arenas
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3">
          {activeTab === 'BLADES' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_BLADES.map((blade) => {
                const isUnlocked = unlockedBlades.includes(blade.id);
                const isEquipped = selectedBlade === blade.id;
                const canAfford = coins >= blade.price;

                return (
                  <div
                    key={blade.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      isEquipped
                        ? 'bg-amber-900/60 border-amber-400 shadow-md ring-1 ring-amber-400'
                        : isUnlocked
                        ? 'bg-black/40 border-amber-500/20 hover:border-amber-500/40'
                        : 'bg-black/30 border-white/5 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-base text-amber-200">{blade.name}</span>
                        {/* Blade preview bar */}
                        <div
                          className="w-12 h-2.5 rounded-full shadow-inner"
                          style={{
                            background: `linear-gradient(90deg, ${blade.coreColor}, ${blade.glowColor})`,
                            boxShadow: `0 0 10px ${blade.glowColor}`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">
                        {blade.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      {isUnlocked ? (
                        isEquipped ? (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Equipped
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              sound.playClick();
                              onSelectBlade(blade.id);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-600 text-xs font-bold text-white transition-colors"
                          >
                            Equip
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
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            canAfford
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                              : 'bg-white/10 text-white/40 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>{blade.price} Coins</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_ARENAS.map((arena) => {
                const isUnlocked = unlockedArenas.includes(arena.id);
                const isEquipped = selectedArena === arena.id;
                const canAfford = coins >= arena.price;

                return (
                  <div
                    key={arena.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      isEquipped
                        ? 'bg-amber-900/60 border-amber-400 shadow-md ring-1 ring-amber-400'
                        : isUnlocked
                        ? 'bg-black/40 border-amber-500/20 hover:border-amber-500/40'
                        : 'bg-black/30 border-white/5 opacity-80'
                    }`}
                  >
                    <div>
                      {/* Arena image preview thumbnail */}
                      <div className="w-full h-24 rounded-lg overflow-hidden mb-3 border border-white/10 relative">
                        <img
                          src={arena.bgImage}
                          alt={arena.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        {isEquipped && (
                          <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                            Active
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-base text-amber-200 mb-1">{arena.name}</div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">
                        {arena.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      {isUnlocked ? (
                        isEquipped ? (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Active Board
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              sound.playClick();
                              onSelectArena(arena.id);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-600 text-xs font-bold text-white transition-colors"
                          >
                            Set Arena
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
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            canAfford
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                              : 'bg-white/10 text-white/40 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>{arena.price} Coins</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
