/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';
import { sound } from '../utils/audio';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Hide if already running in native standalone PWA mode
  if (isInstalled) {
    return null;
  }

  // Android / Chromium 1-tap install flow
  if (isInstallable) {
    return (
      <button
        onClick={() => {
          sound.playClick();
          install();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap shrink-0"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => {
            sound.playClick();
            setShowIOSGuide(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/80 hover:bg-amber-600 border border-amber-400/40 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap shrink-0"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install for iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in text-white">
            <div className="w-full max-w-sm rounded-2xl bg-amber-950 border border-amber-500/40 p-6 shadow-2xl relative text-left">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1 rounded-lg bg-black/40 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-6 h-6 text-amber-400" />
                <h3 className="text-lg font-bold font-game text-amber-200">
                  Install on iPhone / iPad
                </h3>
              </div>

              <p className="text-xs text-amber-100/80 mb-4 leading-relaxed">
                Enjoy full-screen slicing with zero browser address bars and faster touch response:
              </p>

              <div className="space-y-3 bg-black/40 p-3.5 rounded-xl border border-white/10 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    Tap the <strong className="text-amber-300">Share</strong> button{' '}
                    <Share className="inline w-3.5 h-3.5 text-blue-400 -mt-0.5" /> in your Safari toolbar.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    Scroll down and tap{' '}
                    <strong className="text-amber-300">Add to Home Screen</strong>{' '}
                    <PlusSquare className="inline w-3.5 h-3.5 text-slate-200 -mt-0.5" />.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    Tap <strong className="text-emerald-400">Add</strong> in the top right to start playing directly from your home screen!
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for general mobile / desktop browsers
  return (
    <button
      onClick={() => {
        sound.playClick();
        if (isAndroid) {
          alert('To install on Android: Tap the three dots (⋮) in Chrome and select "Install App" or "Add to Home screen".');
        } else {
          setShowIOSGuide(true);
        }
      }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-white/90 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
    >
      <Download className="w-3.5 h-3.5 text-amber-400" />
      <span>Install</span>
    </button>
  );
};
