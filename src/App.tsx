/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameMode, GameState, PlayerStats, FruitDefinition, EndlessLevelConfig } from './types/game';
import { generateLevel, AVAILABLE_ARENAS } from './utils/levelGenerator';
import { FruitCanvas } from './components/FruitCanvas';
import { HUD } from './components/HUD';
import { TitleMenu } from './components/TitleMenu';
import { FruitMarketPage } from './components/FruitMarketPage';
import { LevelSelectPage } from './components/LevelSelectPage';
import { FruitCodexPage } from './components/FruitCodexPage';
import { LevelSummaryModal } from './components/LevelSummaryModal';
import { PauseModal } from './components/PauseModal';
import { sound } from './utils/audio';
import { playables } from './utils/playables';

const STORAGE_KEY = 'fruit_slice_frenzy_save_v1';

export type AppView = 'TITLE' | 'MARKET' | 'LEVEL_SELECT' | 'CODEX' | 'GAME';

const DEFAULT_STATS: PlayerStats = {
  coins: 150,
  highestLevel: 1,
  levelStars: {},
  highScores: {
    campaign: 0,
    classic: 0,
    zen: 0,
  },
  fruitsSlicedCount: {},
  totalSlices: 0,
  maxCombo: 0,
  selectedBlade: 'ninja_steel',
  selectedArena: 'hinoki_wood',
  unlockedBlades: ['ninja_steel'],
  unlockedArenas: ['hinoki_wood'],
};

export default function App() {
  // Persistent Player Stats
  const [stats, setStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULT_STATS, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return DEFAULT_STATS;
  });

  const hasLoadedCloudRef = useRef<boolean>(false);
  const statsRef = useRef<PlayerStats>(stats);
  statsRef.current = stats;

  // Audio mute state (synchronized with YouTube Playables system audio)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => playables.isAudioEnabled());
  const soundEnabledRef = useRef<boolean>(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  // Dedicated Active View State (Market, Level Select, Codex are standalone full pages)
  const [activeView, setActiveView] = useState<AppView>('TITLE');

  // Game Coordinator State
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const gameStateRef = useRef<GameState>(gameState);
  gameStateRef.current = gameState;

  // 1. YouTube Playables SDK Lifecycle & System Listeners
  useEffect(() => {
    // LOADING: firstFrameReady() notifies YouTube that rendering has started
    playables.firstFrameReady();

    // AUDIO: Query platform audio state
    const initialAudio = playables.isAudioEnabled();
    setSoundEnabled(initialAudio);
    sound.setEnabled(initialAudio);

    // AUDIO: Listen to platform audio change events
    const unsubscribeAudio = playables.onAudioEnabledChange((isAudioEnabled: boolean) => {
      console.log('[Playables] Host audio enabled changed:', isAudioEnabled);
      setSoundEnabled(isAudioEnabled);
      sound.setEnabled(isAudioEnabled);
    });

    // PAUSE: ytgame.system.onPause() -> pause game loop, mute audio, and save data
    const unsubscribePause = playables.onPause(() => {
      console.log('[Playables] System onPause triggered');
      sound.pause();
      if (gameStateRef.current === 'PLAYING') {
        setGameState('PAUSED');
      }
      // Save data immediately upon pause as required by YouTube Playables certification
      playables.saveData(JSON.stringify(statsRef.current));
    });

    // RESUME: ytgame.system.onResume() -> restore audio context if enabled
    const unsubscribeResume = playables.onResume(() => {
      console.log('[Playables] System onResume triggered');
      if (soundEnabledRef.current) {
        sound.resume();
      }
    });

    // CLOUD SAVE: ytgame.game.loadData()
    const initCloudData = async () => {
      try {
        const cloudDataStr = await playables.loadData();
        if (cloudDataStr) {
          const parsed = JSON.parse(cloudDataStr);
          setStats((prev) => ({
            ...DEFAULT_STATS,
            ...prev,
            ...parsed,
            coins: Math.max(prev.coins, parsed.coins ?? DEFAULT_STATS.coins),
            highestLevel: Math.max(prev.highestLevel, parsed.highestLevel ?? 1),
            totalSlices: Math.max(prev.totalSlices, parsed.totalSlices ?? 0),
            maxCombo: Math.max(prev.maxCombo, parsed.maxCombo ?? 0),
            highScores: {
              campaign: Math.max(prev.highScores.campaign, parsed.highScores?.campaign ?? 0),
              classic: Math.max(prev.highScores.classic, parsed.highScores?.classic ?? 0),
              zen: Math.max(prev.highScores.zen, parsed.highScores?.zen ?? 0),
            },
            unlockedBlades: Array.from(
              new Set([...prev.unlockedBlades, ...(parsed.unlockedBlades || ['ninja_steel'])])
            ),
            unlockedArenas: Array.from(
              new Set([...prev.unlockedArenas, ...(parsed.unlockedArenas || ['hinoki_wood'])])
            ),
            levelStars: { ...prev.levelStars, ...(parsed.levelStars || {}) },
            fruitsSlicedCount: { ...prev.fruitsSlicedCount, ...(parsed.fruitsSlicedCount || {}) },
          }));
        }
      } catch (err) {
        console.warn('[Playables] Cloud loadData parsing error:', err);
      } finally {
        hasLoadedCloudRef.current = true;
        // LOADING: gameReady() notifies YouTube that loading is complete and game is interactive
        playables.gameReady();
      }
    };

    initCloudData();

    return () => {
      unsubscribeAudio();
      unsubscribePause();
      unsubscribeResume();
    };
  }, []);

  // Save on state change (Local Storage + YouTube Playables Cloud Save)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }

    // Only save to cloud after loadData() has completed to prevent wiping user data
    if (hasLoadedCloudRef.current) {
      playables.saveData(JSON.stringify(stats));
    }
  }, [stats]);

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      sound.setEnabled(next);
      return next;
    });
  };

  const [mode, setMode] = useState<GameMode>('CAMPAIGN');
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(1);
  const [currentLevelConfig, setCurrentLevelConfig] = useState<EndlessLevelConfig>(() =>
    generateLevel(1)
  );

  // Runtime Match State
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [maxLives, setMaxLives] = useState<number>(3);
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>(undefined);
  const [frenzyJuice, setFrenzyJuice] = useState<number>(0);
  const [isFrenzyActive, setIsFrenzyActive] = useState<boolean>(false);
  const [currentMatchMaxCombo, setCurrentMatchMaxCombo] = useState<number>(0);
  const [activeObjectives, setActiveObjectives] = useState(currentLevelConfig.objectives);
  const [starsEarned, setStarsEarned] = useState<number>(0);
  const [coinsEarned, setCoinsEarned] = useState<number>(0);

  // Active Arena Background Image
  const activeArena =
    AVAILABLE_ARENAS.find((a) => a.id === stats.selectedArena) || AVAILABLE_ARENAS[0];

  // Start or Restart a Game
  const startNewGame = useCallback((targetMode: GameMode, levelNum: number = 1) => {
    setMode(targetMode);
    setScore(0);
    setCurrentMatchMaxCombo(0);
    setFrenzyJuice(0);
    setIsFrenzyActive(false);

    if (targetMode === 'CAMPAIGN') {
      const config = generateLevel(levelNum);
      setCurrentLevelNumber(levelNum);
      setCurrentLevelConfig(config);
      setActiveObjectives(config.objectives.map((o) => ({ ...o, current: 0 })));
      setLives(3);
      setMaxLives(3);
      setTimeRemaining(config.timeLimit);
    } else if (targetMode === 'CLASSIC') {
      setCurrentLevelNumber(1);
      const config = generateLevel(1);
      setCurrentLevelConfig(config);
      setLives(3);
      setMaxLives(3);
      setTimeRemaining(undefined);
    } else if (targetMode === 'ZEN') {
      setCurrentLevelNumber(1);
      const config = generateLevel(1);
      setCurrentLevelConfig(config);
      setLives(0);
      setMaxLives(0);
      setTimeRemaining(90); // 90 seconds rush
    }

    setGameState('PLAYING');
    setActiveView('GAME');
  }, []);

  // Time Countdown Timer
  useEffect(() => {
    if (gameState !== 'PLAYING' || activeView !== 'GAME') return;
    if (timeRemaining === undefined) return;

    if (timeRemaining <= 0) {
      // Time Expired
      if (mode === 'ZEN') {
        const coins = Math.max(10, Math.floor(score / 50));
        setCoinsEarned(coins);
        setStats((prev) => ({
          ...prev,
          coins: prev.coins + coins,
          highScores: {
            ...prev.highScores,
            zen: Math.max(prev.highScores.zen, score),
          },
        }));
        setGameState('GAME_OVER');
      } else if (mode === 'CAMPAIGN') {
        // Evaluate if objectives met
        const allCompleted = activeObjectives.every((obj) => obj.current >= obj.target);
        if (allCompleted) {
          handleVictory();
        } else {
          setGameState('GAME_OVER');
        }
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((t) => (t !== undefined ? t - 1 : undefined));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, activeView, timeRemaining, mode, activeObjectives, score]);

  // Frenzy Mode Countdown
  useEffect(() => {
    if (!isFrenzyActive) return;
    const timer = setTimeout(() => {
      setIsFrenzyActive(false);
      setFrenzyJuice(0);
    }, 8000); // 8s frenzy duration
    return () => clearTimeout(timer);
  }, [isFrenzyActive]);

  // Handle Level Victory
  const handleVictory = useCallback(() => {
    let stars = 1;
    if (score >= currentLevelConfig.starsRequired.three) stars = 3;
    else if (score >= currentLevelConfig.starsRequired.two) stars = 2;
    setStarsEarned(stars);

    const levelCoins = currentLevelConfig.coinReward + stars * 10;
    setCoinsEarned(levelCoins);

    setStats((prev) => {
      const nextLevel = Math.max(prev.highestLevel, currentLevelNumber + 1);
      const prevStars = prev.levelStars[currentLevelNumber] || 0;
      return {
        ...prev,
        coins: prev.coins + levelCoins,
        highestLevel: nextLevel,
        levelStars: {
          ...prev.levelStars,
          [currentLevelNumber]: Math.max(prevStars, stars),
        },
        highScores: {
          ...prev.highScores,
          campaign: Math.max(prev.highScores.campaign, score),
        },
      };
    });

    setGameState('LEVEL_CLEAR');
    playables.sendScore(score);
  }, [currentLevelConfig, currentLevelNumber, score]);

  // Slice Fruit Handler
  const handleFruitSliced = useCallback(
    (fruit: FruitDefinition, combo: number) => {
      const points = isFrenzyActive ? fruit.points * 2 : fruit.points;
      const newScore = score + points;
      setScore(newScore);
      playables.sendScore(newScore);

      if (combo > currentMatchMaxCombo) {
        setCurrentMatchMaxCombo(combo);
      }

      // Charge Frenzy Blender
      if (!isFrenzyActive) {
        setFrenzyJuice((curr) => {
          const next = curr + (fruit.isSpecial ? 15 : 6);
          if (next >= 100) {
            setIsFrenzyActive(true);
            return 100;
          }
          return next;
        });
      }

      // Record Player Lifetime Stats
      setStats((prev) => ({
        ...prev,
        totalSlices: prev.totalSlices + 1,
        maxCombo: Math.max(prev.maxCombo, combo),
        fruitsSlicedCount: {
          ...prev.fruitsSlicedCount,
          [fruit.id]: (prev.fruitsSlicedCount[fruit.id] || 0) + 1,
        },
      }));

      // Campaign Objectives Tracker
      if (mode === 'CAMPAIGN' && gameState === 'PLAYING') {
        setActiveObjectives((prev) => {
          let updated = false;
          const next = prev.map((obj) => {
            if (obj.type === 'SCORE') {
              updated = true;
              return { ...obj, current: newScore };
            }
            if (obj.type === 'SLICE_FRUIT' && obj.fruitId === fruit.id) {
              updated = true;
              return { ...obj, current: obj.current + 1 };
            }
            if (obj.type === 'COMBO_COUNT' && combo >= 3) {
              updated = true;
              return { ...obj, current: obj.current + 1 };
            }
            return obj;
          });

          // Check if all objectives reached
          const allCompleted = next.every((o) => o.current >= o.target);
          if (allCompleted && gameState === 'PLAYING') {
            // Trigger victory
            setTimeout(() => {
              handleVictory();
            }, 300);
          }

          return updated ? next : prev;
        });
      }
    },
    [currentMatchMaxCombo, gameState, handleVictory, isFrenzyActive, mode, score]
  );

  // Bomb Sliced Handler
  const handleBombSliced = useCallback(() => {
    if (mode === 'ZEN') {
      setScore((s) => Math.max(0, s - 100));
      return;
    }

    setLives((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        // Record high score if applicable
        if (mode === 'CLASSIC') {
          const coinsEarned = Math.max(10, Math.floor(score / 40));
          setCoinsEarned(coinsEarned);
          setStats((st) => ({
            ...st,
            coins: st.coins + coinsEarned,
            highScores: {
              ...st.highScores,
              classic: Math.max(st.highScores.classic, score),
            },
          }));
        }
        setGameState('GAME_OVER');
        return 0;
      }
      return next;
    });
  }, [mode, score]);

  // Fruit Dropped Unsliced Handler
  const handleFruitDropped = useCallback(
    (fruit: FruitDefinition) => {
      if (mode === 'CLASSIC') {
        setLives((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            const coinsEarned = Math.max(10, Math.floor(score / 40));
            setCoinsEarned(coinsEarned);
            setStats((st) => ({
              ...st,
              coins: st.coins + coinsEarned,
              highScores: {
                ...st.highScores,
                classic: Math.max(st.highScores.classic, score),
              },
            }));
            setGameState('GAME_OVER');
            return 0;
          }
          return next;
        });
      }
    },
    [mode, score]
  );

  // Market purchases
  const handleBuyBlade = (id: string, price: number) => {
    setStats((prev) => ({
      ...prev,
      coins: prev.coins - price,
      unlockedBlades: [...prev.unlockedBlades, id],
      selectedBlade: id,
    }));
  };

  const handleBuyArena = (id: string, price: number) => {
    setStats((prev) => ({
      ...prev,
      coins: prev.coins - price,
      unlockedArenas: [...prev.unlockedArenas, id],
      selectedArena: id,
    }));
  };

  const returnToTitle = () => {
    setGameState('TITLE');
    setActiveView('TITLE');
  };

  return (
    <div className="relative w-full h-full h-[100dvh] bg-amber-950 font-sans overflow-hidden">
      {/* 1. Title Menu Home Page */}
      {activeView === 'TITLE' && (
        <TitleMenu
          stats={stats}
          onStartGame={startNewGame}
          onOpenLevelSelect={() => setActiveView('LEVEL_SELECT')}
          onOpenMarket={() => setActiveView('MARKET')}
          onOpenCodex={() => setActiveView('CODEX')}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* 2. Standalone Dedicated Fruit Market Page */}
      {activeView === 'MARKET' && (
        <FruitMarketPage
          coins={stats.coins}
          unlockedBlades={stats.unlockedBlades}
          unlockedArenas={stats.unlockedArenas}
          selectedBlade={stats.selectedBlade}
          selectedArena={stats.selectedArena}
          onSelectBlade={(id) => setStats((s) => ({ ...s, selectedBlade: id }))}
          onSelectArena={(id) => setStats((s) => ({ ...s, selectedArena: id }))}
          onBuyBlade={handleBuyBlade}
          onBuyArena={handleBuyArena}
          onBackToHome={returnToTitle}
          onOpenLevelSelect={() => setActiveView('LEVEL_SELECT')}
          onOpenCodex={() => setActiveView('CODEX')}
        />
      )}

      {/* 3. Standalone Dedicated Endless Level Select Page */}
      {activeView === 'LEVEL_SELECT' && (
        <LevelSelectPage
          highestUnlockedLevel={stats.highestLevel}
          levelStars={stats.levelStars}
          onSelectLevel={(lvl) => startNewGame('CAMPAIGN', lvl)}
          onBackToHome={returnToTitle}
          onOpenMarket={() => setActiveView('MARKET')}
          onOpenCodex={() => setActiveView('CODEX')}
        />
      )}

      {/* 4. Standalone Dedicated Fruit Codex Page */}
      {activeView === 'CODEX' && (
        <FruitCodexPage
          fruitsSlicedCount={stats.fruitsSlicedCount}
          onBackToHome={returnToTitle}
          onOpenLevelSelect={() => setActiveView('LEVEL_SELECT')}
          onOpenMarket={() => setActiveView('MARKET')}
        />
      )}

      {/* 5. Active Gameplay View */}
      {activeView === 'GAME' && (
        <>
          <HUD
            mode={mode}
            levelNumber={currentLevelNumber}
            levelTitle={currentLevelConfig.title}
            chapterTitle={currentLevelConfig.chapter}
            score={score}
            highScore={stats.highScores[mode === 'CAMPAIGN' ? 'campaign' : mode === 'CLASSIC' ? 'classic' : 'zen']}
            lives={lives}
            maxLives={maxLives}
            timeRemaining={timeRemaining}
            frenzyJuice={frenzyJuice}
            isFrenzyActive={isFrenzyActive}
            objectives={activeObjectives}
            onPause={() => setGameState('PAUSED')}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
          />

          <FruitCanvas
            isPlaying={gameState === 'PLAYING'}
            isPaused={gameState === 'PAUSED'}
            allowedFruits={currentLevelConfig.allowedFruits}
            spawnInterval={currentLevelConfig.spawnInterval}
            fruitsPerWave={currentLevelConfig.fruitsPerWave}
            bombChance={currentLevelConfig.bombChance}
            specialFruitChance={currentLevelConfig.specialFruitChance}
            bgImageUrl={activeArena.bgImage}
            selectedBladeId={stats.selectedBlade}
            onFruitSliced={handleFruitSliced}
            onBombSliced={handleBombSliced}
            onFruitDropped={handleFruitDropped}
            isFrenzyActive={isFrenzyActive}
          />

          {/* Pause Modal */}
          <PauseModal
            isOpen={gameState === 'PAUSED'}
            onResume={() => setGameState('PLAYING')}
            onRestart={() => startNewGame(mode, currentLevelNumber)}
            onExit={returnToTitle}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
          />

          {/* Level Summary / Victory / Game Over Modal */}
          <LevelSummaryModal
            isOpen={gameState === 'LEVEL_CLEAR' || gameState === 'GAME_OVER'}
            isVictory={gameState === 'LEVEL_CLEAR'}
            mode={mode}
            levelNumber={currentLevelNumber}
            levelTitle={currentLevelConfig.title}
            score={score}
            highScore={stats.highScores[mode === 'CAMPAIGN' ? 'campaign' : mode === 'CLASSIC' ? 'classic' : 'zen']}
            starsEarned={starsEarned}
            coinsEarned={coinsEarned}
            maxCombo={currentMatchMaxCombo}
            onNextLevel={() => startNewGame('CAMPAIGN', currentLevelNumber + 1)}
            onReplay={() => startNewGame(mode, currentLevelNumber)}
            onReturnTitle={returnToTitle}
          />
        </>
      )}
    </div>
  );
}
