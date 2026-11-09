/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onExit,
  soundEnabled,
  onToggleSound,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={() => {
        sound.playClick();
        onResume();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xs bg-amber-950 border border-amber-500/40 rounded-3xl p-5 sm:p-6 text-white shadow-2xl flex flex-col items-center text-center max-h-[min(94dvh,540px)] overflow-y-auto overscroll-contain"
      >
        <h2 className="text-2xl font-black font-game text-amber-200 mb-1">Game Paused</h2>
        <p className="text-xs text-amber-100/70 mb-6">Take a breather, juicy ninja!</p>

        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume Slicing</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 font-semibold text-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Level</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 font-semibold text-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audio: Enabled</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
                <span>Audio: Muted</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onExit();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 font-semibold text-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Quit to Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
