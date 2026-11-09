/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, BookOpen, Sparkles } from 'lucide-react';
import { FRUIT_DEFINITIONS } from '../utils/fruitRenderer';
import { sound } from '../utils/audio';

interface FruitEncyclopediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  fruitsSlicedCount: Record<string, number>;
}

export const FruitEncyclopediaModal: React.FC<FruitEncyclopediaModalProps> = ({
  isOpen,
  onClose,
  fruitsSlicedCount,
}) => {
  if (!isOpen) return null;

  const fruits = Object.values(FRUIT_DEFINITIONS);

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
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 sm:pb-4 mb-3 sm:mb-4 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-game text-amber-200">Orchard Codex</h2>
              <p className="text-[11px] sm:text-xs text-amber-100/70">
                Discover botanical trivia and lifetime slice records for every fruit.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-black/40 hover:bg-black/60 active:scale-95 text-slate-300 hover:text-white transition-all cursor-pointer"
            aria-label="Close Codex"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fruit Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 flex-1 py-1">
          {fruits.map((f) => {
            const count = fruitsSlicedCount[f.id] || 0;

            return (
              <div
                key={f.id}
                className="p-3.5 rounded-xl bg-black/35 border border-white/10 flex flex-col justify-between hover:border-amber-500/30 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: f.primaryColor }}
                      />
                      <span className="font-bold text-sm text-amber-200">{f.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">
                      +{f.points} pts
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 italic leading-relaxed mb-3">
                    "{f.trivia || 'A staple of the endless fruit orchard.'}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
                  <span>Lifetime Sliced:</span>
                  <span className="font-mono font-bold text-slate-200 tabular-nums">
                    {count.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
