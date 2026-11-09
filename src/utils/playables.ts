/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * YouTube Playables SDK Integration
 * Provides type definitions and safe wrappers for:
 * 1. LOADING: firstFrameReady(), gameReady(), IN_PLAYABLES_ENV
 * 2. AUDIO: isAudioEnabled(), onAudioEnabledChange()
 * 3. PAUSE & RESUME: onPause(), onResume()
 * 4. CLOUD SAVE: loadData(), saveData(data)
 */

export interface YTGameSDK {
  IN_PLAYABLES_ENV: boolean;
  game: {
    firstFrameReady: () => void;
    gameReady: () => void;
    loadData: () => Promise<string>;
    saveData: (data: string) => Promise<void> | void;
  };
  system: {
    isAudioEnabled: () => boolean;
    onAudioEnabledChange: (callback: (isAudioEnabled: boolean) => void) => void;
    onPause: (callback: () => void) => void;
    onResume: (callback: () => void) => void;
  };
  engagement?: {
    sendScore: (scoreData: { value: number }) => Promise<void>;
  };
}

declare global {
  interface Window {
    ytgame?: YTGameSDK;
  }
}

type AudioCallback = (isAudioEnabled: boolean) => void;
type LifecycleCallback = () => void;

class PlayablesManager {
  private hasFirstFrameFired = false;
  private hasGameReadyFired = false;
  private hasCloudDataLoaded = false;
  private audioCallbacks: Set<AudioCallback> = new Set();
  private pauseCallbacks: Set<LifecycleCallback> = new Set();
  private resumeCallbacks: Set<LifecycleCallback> = new Set();
  private currentAudioState: boolean = true;
  private mockPlayablesEnv: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initListeners();
    }
  }

  /**
   * Check if running in YouTube Playables environment
   */
  public get isInPlayablesEnv(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(window.ytgame?.IN_PLAYABLES_ENV || this.mockPlayablesEnv);
  }

  /**
   * Set mock Playables mode for local development testing
   */
  public setMockEnv(enabled: boolean) {
    this.mockPlayablesEnv = enabled;
  }

  /**
   * Set up event bindings with window.ytgame if present
   */
  private initListeners() {
    if (typeof window === 'undefined') return;

    const sdk = window.ytgame;
    if (sdk?.system) {
      try {
        // Query initial system audio state
        if (typeof sdk.system.isAudioEnabled === 'function') {
          this.currentAudioState = sdk.system.isAudioEnabled();
        }

        // Register audio change listener
        if (typeof sdk.system.onAudioEnabledChange === 'function') {
          sdk.system.onAudioEnabledChange((isAudioEnabled: boolean) => {
            console.log('[Playables SDK] onAudioEnabledChange:', isAudioEnabled);
            this.currentAudioState = isAudioEnabled;
            this.audioCallbacks.forEach((cb) => {
              try {
                cb(isAudioEnabled);
              } catch (err) {
                console.error('[Playables SDK] Error in audio callback:', err);
              }
            });
          });
        }

        // Register system pause listener
        if (typeof sdk.system.onPause === 'function') {
          sdk.system.onPause(() => {
            console.log('[Playables SDK] onPause received');
            this.pauseCallbacks.forEach((cb) => {
              try {
                cb();
              } catch (err) {
                console.error('[Playables SDK] Error in pause callback:', err);
              }
            });
          });
        }

        // Register system resume listener
        if (typeof sdk.system.onResume === 'function') {
          sdk.system.onResume(() => {
            console.log('[Playables SDK] onResume received');
            this.resumeCallbacks.forEach((cb) => {
              try {
                cb();
              } catch (err) {
                console.error('[Playables SDK] Error in resume callback:', err);
              }
            });
          });
        }
      } catch (err) {
        console.warn('[Playables SDK] Error initializing SDK system listeners:', err);
      }
    }
  }

  // ==========================================
  // 1. LOADING APIS
  // ==========================================

  /**
   * Signal that the first visual frame is ready to render.
   * Must be called before gameReady().
   */
  public firstFrameReady(): void {
    if (this.hasFirstFrameFired) return;
    this.hasFirstFrameFired = true;

    console.log('[Playables SDK] firstFrameReady() invoked');
    if (window.ytgame?.game?.firstFrameReady) {
      try {
        window.ytgame.game.firstFrameReady();
      } catch (err) {
        console.error('[Playables SDK] Failed to call ytgame.game.firstFrameReady():', err);
      }
    }
  }

  /**
   * Signal that game assets and save data are loaded and the player can now interact.
   * Dismisses YouTube's loading spinner.
   */
  public gameReady(): void {
    if (this.hasGameReadyFired) return;
    
    // Ensure firstFrameReady is called first
    if (!this.hasFirstFrameFired) {
      this.firstFrameReady();
    }

    this.hasGameReadyFired = true;
    console.log('[Playables SDK] gameReady() invoked');

    if (window.ytgame?.game?.gameReady) {
      try {
        window.ytgame.game.gameReady();
      } catch (err) {
        console.error('[Playables SDK] Failed to call ytgame.game.gameReady():', err);
      }
    }
  }

  // ==========================================
  // 2. AUDIO APIS
  // ==========================================

  /**
   * Returns whether audio is enabled by the YouTube platform
   */
  public isAudioEnabled(): boolean {
    if (window.ytgame?.system?.isAudioEnabled) {
      try {
        return window.ytgame.system.isAudioEnabled();
      } catch {
        // fallback
      }
    }
    return this.currentAudioState;
  }

  /**
   * Subscribe to audio enabled changes from YouTube host
   */
  public onAudioEnabledChange(callback: AudioCallback): () => void {
    this.audioCallbacks.add(callback);
    // Immediately invoke with current state
    try {
      callback(this.isAudioEnabled());
    } catch (e) {
      console.warn(e);
    }
    return () => {
      this.audioCallbacks.delete(callback);
    };
  }

  // ==========================================
  // 3. PAUSE AND RESUME APIS
  // ==========================================

  /**
   * Subscribe to system pause events (e.g., user minimizes YouTube or ad overlay appears)
   */
  public onPause(callback: LifecycleCallback): () => void {
    this.pauseCallbacks.add(callback);
    return () => {
      this.pauseCallbacks.delete(callback);
    };
  }

  /**
   * Subscribe to system resume events
   */
  public onResume(callback: LifecycleCallback): () => void {
    this.resumeCallbacks.add(callback);
    return () => {
      this.resumeCallbacks.delete(callback);
    };
  }

  /**
   * Manually trigger pause event (useful for test harness or local simulation)
   */
  public simulatePause(): void {
    console.log('[Playables SDK] Simulating onPause');
    this.pauseCallbacks.forEach((cb) => cb());
  }

  /**
   * Manually trigger resume event (useful for test harness or local simulation)
   */
  public simulateResume(): void {
    console.log('[Playables SDK] Simulating onResume');
    this.resumeCallbacks.forEach((cb) => cb());
  }

  /**
   * Manually trigger audio change (useful for test harness or local simulation)
   */
  public simulateAudioChange(enabled: boolean): void {
    console.log('[Playables SDK] Simulating audio change:', enabled);
    this.currentAudioState = enabled;
    this.audioCallbacks.forEach((cb) => cb(enabled));
  }

  // ==========================================
  // 4. CLOUD SAVE APIS
  // ==========================================

  /**
   * Load serialized save data from YouTube Playables Cloud Storage
   */
  public async loadData(): Promise<string | null> {
    console.log('[Playables SDK] loadData() called');
    if (window.ytgame?.game?.loadData) {
      try {
        const data = await window.ytgame.game.loadData();
        console.log('[Playables SDK] Cloud data loaded successfully');
        this.hasCloudDataLoaded = true;
        return data || null;
      } catch (err) {
        console.warn('[Playables SDK] loadData failed or empty:', err);
      }
    }

    this.hasCloudDataLoaded = true;
    return null;
  }

  /**
   * Save serialized save data to YouTube Playables Cloud Storage.
   * Requirement: must only be called after loadData() completes.
   * Requirement: data must be less than 3 MiB.
   */
  public async saveData(data: string): Promise<void> {
    if (!this.hasCloudDataLoaded) {
      console.warn('[Playables SDK] saveData skipped: loadData() has not completed yet.');
      return;
    }

    // Limit check: 3 MiB is 3,145,728 bytes. We use 2.5 MiB as a safe buffer.
    const MAX_SIZE = 2.5 * 1024 * 1024;
    const dataSize = data.length; // Approximate size in bytes for typical JSON strings
    
    if (dataSize > MAX_SIZE) {
      console.error(`[Playables SDK] saveData aborted: Payload too large (${(dataSize / 1024).toFixed(2)} KB)`);
      return;
    }

    if (window.ytgame?.game?.saveData) {
      try {
        await window.ytgame.game.saveData(data);
        console.log(`[Playables SDK] Cloud saveData succeeded. Size: ${(dataSize / 1024).toFixed(2)} KB`);
      } catch (err) {
        console.error('[Playables SDK] Cloud saveData failed:', err);
      }
    }
  }

  /**
   * Send player score to YouTube Playables engagement leaderboard API.
   * Requirement: score must be an integer.
   */
  public async sendScore(score: number): Promise<void> {
    const intScore = Math.round(Number(score) || 0);
    console.log('[Playables SDK] sendScore() called with integer:', intScore);

    if (window.ytgame?.engagement?.sendScore) {
      try {
        await window.ytgame.engagement.sendScore({ value: intScore });
        console.log('[Playables SDK] engagement.sendScore succeeded');
      } catch (err) {
        console.error('[Playables SDK] engagement.sendScore failed:', err);
      }
    }
  }
}

export const playables = new PlayablesManager();
