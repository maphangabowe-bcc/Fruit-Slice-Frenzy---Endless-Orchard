/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Star, Lock, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateLevel } from '../utils/levelGenerator';
import { sound } from '../utils/audio';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  highestUnlockedLevel: number;
  levelStars: Record<number, number>;
  onSelectLevel: (lvl: number) => void;
}

const LEVELS_PER_PAGE = 12;

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  highestUnlockedLevel,
  levelStars,
  onSelectLevel,
}) => {
  if (!isOpen) return null;

  // Pagination for endless levels
  const initialPage = Math.floor((highestUnlockedLevel - 1) / LEVELS_PER_PAGE);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  const startLevel = currentPage * LEVELS_PER_PAGE + 1;
  const levels = Array.from({ length: LEVELS_PER_PAGE }, (_, i) => startLevel + i);

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
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-game text-amber-200">
              Endless Orchard Levels
            </h2>
            <p className="text-[11px] sm:text-xs text-amber-100/70">
              Select any unlocked level to challenge objectives and earn stars.
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-black/40 hover:bg-black/60 active:scale-95 text-slate-300 hover:text-white transition-all cursor-pointer"
            aria-label="Close Level Select"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto pr-1 flex-1 py-2">
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
                className={`relative p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  isUnlocked
                    ? 'bg-amber-900/40 hover:bg-amber-800/60 border-amber-500/40 cursor-pointer hover:scale-[1.02] shadow-md'
                    : 'bg-black/40 border-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black font-game text-amber-200">
                    #{lvl}
                  </span>
                  {isUnlocked ? (
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= stars
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600 fill-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>

                <div className="mt-2 text-xs font-medium text-slate-300 truncate">
                  {levelInfo.title.replace(`Level ${lvl}: `, '')}
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-amber-300/80">
                  <span>Score: {levelInfo.objectives[0]?.target.toLocaleString()}</span>
                  {isUnlocked && <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-amber-500/20 mt-3 sm:mt-4 shrink-0">
          <button
            disabled={currentPage === 0}
            onClick={() => {
              sound.playClick();
              setCurrentPage((p) => Math.max(0, p - 1));
            }}
            className="min-h-[40px] flex items-center gap-1 px-3 sm:px-4 py-2 rounded-xl bg-black/40 hover:bg-black/60 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold text-amber-200 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <span className="text-xs text-amber-100/80 font-mono">
            Levels {startLevel} - {startLevel + LEVELS_PER_PAGE - 1}
          </span>

          <button
            onClick={() => {
              sound.playClick();
              setCurrentPage((p) => p + 1);
            }}
            className="min-h-[40px] flex items-center gap-1 px-3 sm:px-4 py-2 rounded-xl bg-black/40 hover:bg-black/60 text-xs font-semibold text-amber-200 transition-colors cursor-pointer"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
