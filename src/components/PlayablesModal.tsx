/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, CheckCircle, Volume2, VolumeX, Pause, Play, Cloud, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { playables } from '../utils/playables';
import { PlayerStats } from '../types/game';

interface PlayablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  stats: PlayerStats;
  onStatsLoaded: (newStats: PlayerStats) => void;
}

export const PlayablesModal: React.FC<PlayablesModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  stats,
  onStatsLoaded,
}) => {
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  if (!isOpen) return null;

  const isInEnv = playables.isInPlayablesEnv;

  const handleSimulatePause = () => {
    setLastAction('Triggered ytgame.system.onPause()');
    playables.simulatePause();
  };

  const handleSimulateResume = () => {
    setLastAction('Triggered ytgame.system.onResume()');
    playables.simulateResume();
  };

  const handleSimulateAudio = (enabled: boolean) => {
    setLastAction(`Triggered ytgame.system.onAudioEnabledChange(${enabled})`);
    playables.simulateAudioChange(enabled);
  };

  const handleTestSave = async () => {
    setSaveStatus('Saving to Cloud...');
    try {
      await playables.saveData(JSON.stringify(stats));
      setSaveStatus('Cloud Save Successful!');
      setLastAction('ytgame.game.saveData() verified');
    } catch {
      setSaveStatus('Cloud Save Failed');
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleTestLoad = async () => {
    setSaveStatus('Loading from Cloud...');
    try {
      const dataStr = await playables.loadData();
      if (dataStr) {
        const loaded = JSON.parse(dataStr);
        onStatsLoaded(loaded);
        setSaveStatus('Loaded from Cloud!');
        setLastAction('ytgame.game.loadData() verified');
      } else {
        setSaveStatus('No cloud save found');
      }
    } catch {
      setSaveStatus('Cloud Load Error');
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-amber-950 via-zinc-900 to-black border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-white overflow-y-auto max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-xl font-black font-game text-amber-300">YouTube Playables SDK</h2>
              <p className="text-xs text-amber-100/70">Integration Status & Lifecycle Diagnostics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Environment Status Badge */}
        <div className="mb-5 p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-amber-300 font-bold mb-0.5">
              Environment
            </div>
            <div className="text-sm font-semibold flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isInEnv ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isInEnv ? 'Official YouTube Playables Frame' : 'Integrated (Playables Ready / Sandbox Mode)'}
            </div>
            <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
              ytgame.IN_PLAYABLES_ENV: {String(isInEnv)}
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              SDK v1
            </span>
          </div>
        </div>

        {/* Lifecycle Checklist */}
        <div className="space-y-3 mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-200">
            API Endpoints & Contracts
          </div>

          {/* 1. Loading */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Loading & Presentation</span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                ytgame.game.firstFrameReady() · ytgame.game.gameReady()
              </p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-950 text-emerald-300 rounded border border-emerald-500/30">
              Triggered
            </span>
          </div>

          {/* 2. Audio */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Audio Synchronization</span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                isAudioEnabled() · onAudioEnabledChange()
              </p>
            </div>
            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${soundEnabled ? 'bg-amber-950 text-amber-300 border-amber-500/30' : 'bg-red-950 text-red-300 border-red-500/30'}`}>
              {soundEnabled ? 'Audio ON' : 'Audio MUTED'}
            </span>
          </div>

          {/* 3. Pause & Resume */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pause & Resume Handlers</span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                ytgame.system.onPause() · ytgame.system.onResume()
              </p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-950 text-emerald-300 rounded border border-emerald-500/30">
              Active Listeners
            </span>
          </div>

          {/* 4. Cloud Save */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cloud Save / Cross-Device Storage</span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                ytgame.game.loadData() · ytgame.game.saveData(data)
              </p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-950 text-blue-300 rounded border border-blue-500/30">
              Auto-Sync
            </span>
          </div>
        </div>

        {/* Interactive Playables Test Simulator */}
        <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Simulator & Test Actions</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleSimulatePause}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Pause className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate onPause</span>
            </button>

            <button
              onClick={handleSimulateResume}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulate onResume</span>
            </button>

            <button
              onClick={() => handleSimulateAudio(!soundEnabled)}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold cursor-pointer transition-colors"
            >
              {soundEnabled ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
              <span>Simulate Mute Toggle</span>
            </button>

            <button
              onClick={handleTestSave}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Cloud className="w-3.5 h-3.5 text-blue-400" />
              <span>Test saveData()</span>
            </button>
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={handleTestLoad}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold cursor-pointer transition-colors text-amber-200"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Test loadData() Refresh</span>
            </button>
          </div>

          {lastAction && (
            <div className="mt-3 text-[11px] text-amber-300/90 font-mono bg-black/40 p-2 rounded-lg">
              Last Action: {lastAction}
            </div>
          )}

          {saveStatus && (
            <div className="mt-2 text-[11px] text-emerald-300 font-mono bg-emerald-950/60 p-2 rounded-lg border border-emerald-500/30">
              {saveStatus}
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-bold text-sm shadow-lg transition-transform active:scale-[0.98] cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
