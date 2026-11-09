/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, RotateCcw, ArrowRight, Home, Coins, Trophy, AlertTriangle } from 'lucide-react';
import { sound } from '../utils/audio';

interface LevelSummaryModalProps {
  isOpen: boolean;
  isVictory: boolean;
  mode: 'CAMPAIGN' | 'CLASSIC' | 'ZEN';
  levelNumber?: number;
  levelTitle?: string;
  score: number;
  highScore: number;
  starsEarned: number;
  coinsEarned: number;
  maxCombo: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onReturnTitle: () => void;
}

export const LevelSummaryModal: React.FC<LevelSummaryModalProps> = ({
  isOpen,
  isVictory,
  mode,
  levelNumber,
  levelTitle,
  score,
  highScore,
  starsEarned,
  coinsEarned,
  maxCombo,
  onNextLevel,
  onReplay,
  onReturnTitle,
}) => {
  useEffect(() => {
    if (isOpen && isVictory) {
      sound.playLevelClear();
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#f97316', '#facc15', '#22c55e', '#38bdf8', '#a855f7'],
      });
    }
  }, [isOpen, isVictory]);

  if (!isOpen) return null;

  const isNewHighScore = score > highScore && score > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-amber-950 border border-amber-500/40 rounded-3xl p-5 sm:p-6 md:p-8 text-white shadow-2xl flex flex-col items-center text-center max-h-[min(94dvh,640px)] overflow-y-auto overscroll-contain"
      >
        {/* Banner Status */}
        {isVictory ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-3 shadow-inner">
              <Trophy className="w-9 h-9 text-amber-300" />
            </div>
            <h2 className="text-3xl font-extrabold font-game text-amber-200">
              Level Complete!
            </h2>
            <p className="text-xs text-amber-100/70 mt-1">
              {levelTitle || 'Outstanding Slicing Mastery!'}
            </p>

            {/* Stars Row */}
            {mode === 'CAMPAIGN' && (
              <div className="flex items-center gap-3 my-5">
                {[1, 2, 3].map((starIdx) => (
                  <Star
                    key={starIdx}
                    className={`w-9 h-9 transition-all duration-300 ${
                      starIdx <= starsEarned
                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.7)] scale-110'
                        : 'text-slate-700 fill-slate-800'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-center mb-3">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-3xl font-extrabold font-game text-red-400">
              {mode === 'ZEN' ? 'Time Is Up!' : 'Orchard Over!'}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {mode === 'CAMPAIGN'
                ? 'Objective not reached. Give it another try!'
                : 'Great attempt! Keep your blade sharp.'}
            </p>
          </>
        )}

        {/* Stats Grid */}
        <div className="w-full bg-black/40 rounded-2xl border border-white/10 p-4 my-4 grid grid-cols-2 gap-3 text-left">
          <div className="p-2.5 bg-white/5 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Final Score</div>
            <div className="text-xl font-black font-game text-amber-200 tabular-nums">
              {score.toLocaleString()}
            </div>
            {isNewHighScore && (
              <div className="text-[10px] font-bold text-emerald-400 mt-0.5">NEW RECORD!</div>
            )}
          </div>

          <div className="p-2.5 bg-white/5 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Juicy Coins</div>
            <div className="text-xl font-black font-game text-amber-400 flex items-center gap-1.5 tabular-nums">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>+{coinsEarned}</span>
            </div>
          </div>

          <div className="p-2.5 bg-white/5 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Max Combo</div>
            <div className="text-xl font-black font-game text-slate-200 tabular-nums">
              {maxCombo}x Streak
            </div>
          </div>

          <div className="p-2.5 bg-white/5 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">
              {mode === 'CAMPAIGN' ? `Level #${levelNumber}` : 'High Score'}
            </div>
            <div className="text-xl font-black font-game text-slate-200 tabular-nums">
              {mode === 'CAMPAIGN' ? `Stars: ${starsEarned}/3` : highScore.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2.5 mt-2">
          {isVictory && mode === 'CAMPAIGN' ? (
            <button
              onClick={() => {
                sound.playClick();
                onNextLevel();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-base shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>Next Level</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onReplay();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          )}

          <div className="flex items-center gap-2 w-full">
            {isVictory && mode === 'CAMPAIGN' && (
              <button
                onClick={() => {
                  sound.playClick();
                  onReplay();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-200 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Level</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playClick();
                onReturnTitle();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-200 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
