import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { EraId, UserProgressState, LeaderboardUser, Badge } from '../types/curriculum';
import { INITIAL_BADGES, INITIAL_LEADERBOARD } from '../data/gamificationData';
import { loadStoredUserState, saveUserStateToStorage } from '../services/offlineStorage';
import { soundManager } from '../services/audioSynthesizer';

interface UserLearningContextType {
  state: UserProgressState;
  badges: Badge[];
  leaderboard: LeaderboardUser[];
  activeModal: 'quiz' | 'leaderboard' | 'badges' | 'dailyReport' | 'share' | null;
  selectedShareBadge: Badge | null;
  isOnline: boolean;
  openModal: (modal: 'quiz' | 'leaderboard' | 'badges' | 'dailyReport' | 'share', badgeToShare?: Badge) => void;
  closeModal: () => void;
  setCurrentEraId: (eraId: EraId) => void;
  addXP: (amount: number, reason: string) => void;
  recordQuizResult: (eraId: EraId, score: number, total: number) => void;
  recordSimulationInteraction: (eraId: EraId, simKey: string) => void;
  markEraRead: (eraId: EraId) => void;
  toggleSimulatedOffline: () => void;
  triggerConfetti: () => void;
}

const defaultState: UserProgressState = {
  userId: 'usr-student-local',
  displayName: 'Cosmic Explorer',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
  xp: 450,
  level: 2,
  completedEras: [],
  currentEraId: 'big-bang',
  quizHighScores: {
    'big-bang': 0,
    'before-dinosaurs': 0,
    'dinosaurs': 0,
    'human-evolution': 0,
  },
  unlockedBadges: [],
  streakDays: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  activityLogs: [
    {
      id: 'log-seed-1',
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now() - 3600000,
      eraId: 'big-bang',
      durationSeconds: 420,
      quizScore: 4,
      quizTotal: 5,
      simulationUsed: true,
    },
  ],
  simulationInteractionsCount: {
    'big-bang': 1,
    'before-dinosaurs': 0,
    'dinosaurs': 0,
    'human-evolution': 0,
  },
  isOfflineModeSimulated: false,
};

const UserLearningContext = createContext<UserLearningContextType | undefined>(undefined);

export const UserLearningProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UserProgressState>(() => {
    const saved = loadStoredUserState();
    return { ...defaultState, ...(saved || {}) };
  });

  const [activeModal, setActiveModal] = useState<'quiz' | 'leaderboard' | 'badges' | 'dailyReport' | 'share' | null>(null);
  const [selectedShareBadge, setSelectedShareBadge] = useState<Badge | null>(null);
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Sync to local storage
  useEffect(() => {
    saveUserStateToStorage(state);
  }, [state]);

  // Online / offline detector
  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const effectiveIsOnline = isBrowserOnline && !state.isOfflineModeSimulated;

  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'],
      });
    } catch {
      // fallback
    }
  }, []);

  const checkBadgeUnlocks = useCallback(
    (nextState: UserProgressState) => {
      const newlyUnlocked: string[] = [];
      const currentBadges = [...nextState.unlockedBadges];

      // Check Big Bang
      if (nextState.completedEras.includes('big-bang') && !currentBadges.includes('cosmic-ignition')) {
        newlyUnlocked.push('cosmic-ignition');
      }
      // Check Before Dinosaurs
      if (nextState.completedEras.includes('before-dinosaurs') && !currentBadges.includes('primordial-chemist')) {
        newlyUnlocked.push('primordial-chemist');
      }
      // Check Dinosaurs
      if (nextState.completedEras.includes('dinosaurs') && !currentBadges.includes('apex-paleontologist')) {
        newlyUnlocked.push('apex-paleontologist');
      }
      // Check Human Evolution
      if (nextState.completedEras.includes('human-evolution') && !currentBadges.includes('dawn-of-wisdom')) {
        newlyUnlocked.push('dawn-of-wisdom');
      }
      // Chronos Polymath
      if (nextState.completedEras.length >= 4 && !currentBadges.includes('chronos-polymath')) {
        newlyUnlocked.push('chronos-polymath');
      }
      // Perfect Scholar
      const hasPerfect = Object.values(nextState.quizHighScores).some((score) => score === 100);
      if (hasPerfect && !currentBadges.includes('perfect-scholar')) {
        newlyUnlocked.push('perfect-scholar');
      }
      // Simulations
      if ((nextState.simulationInteractionsCount['big-bang'] || 0) >= 1 && !currentBadges.includes('theia-smasher')) {
        newlyUnlocked.push('theia-smasher');
      }
      if ((nextState.simulationInteractionsCount['before-dinosaurs'] || 0) >= 1 && !currentBadges.includes('oxygen-architect')) {
        newlyUnlocked.push('oxygen-architect');
      }
      if ((nextState.simulationInteractionsCount['dinosaurs'] || 0) >= 1 && !currentBadges.includes('extinction-physicist')) {
        newlyUnlocked.push('extinction-physicist');
      }
      if ((nextState.simulationInteractionsCount['human-evolution'] || 0) >= 1 && !currentBadges.includes('skull-whisperer')) {
        newlyUnlocked.push('skull-whisperer');
      }
      // Offline Voyager
      if (nextState.isOfflineModeSimulated && !currentBadges.includes('offline-explorer')) {
        newlyUnlocked.push('offline-explorer');
      }

      if (newlyUnlocked.length > 0) {
        soundManager.playBadgeUnlock();
        triggerConfetti();
        return [...currentBadges, ...newlyUnlocked];
      }
      return currentBadges;
    },
    [triggerConfetti]
  );

  const addXP = useCallback(
    (amount: number) => {
      setState((prev) => {
        const newXP = prev.xp + amount;
        const newLevel = Math.floor(newXP / 300) + 1;
        const updated = {
          ...prev,
          xp: newXP,
          level: newLevel,
        };
        const badgesWithNew = checkBadgeUnlocks(updated);
        return {
          ...updated,
          unlockedBadges: badgesWithNew,
        };
      });
    },
    [checkBadgeUnlocks]
  );

  const setCurrentEraId = useCallback((eraId: EraId) => {
    setState((prev) => ({
      ...prev,
      currentEraId: eraId,
    }));
  }, []);

  const markEraRead = useCallback(
    (eraId: EraId) => {
      setState((prev) => {
        if (prev.completedEras.includes(eraId)) return prev;
        const completed = [...prev.completedEras, eraId];
        const next = {
          ...prev,
          completedEras: completed,
          xp: prev.xp + 150,
          level: Math.floor((prev.xp + 150) / 300) + 1,
        };
        const badgesWithNew = checkBadgeUnlocks(next);
        return {
          ...next,
          unlockedBadges: badgesWithNew,
        };
      });
    },
    [checkBadgeUnlocks]
  );

  const recordQuizResult = useCallback(
    (eraId: EraId, score: number, total: number) => {
      const percentage = Math.round((score / total) * 100);
      const earnedXP = score * 50 + (percentage === 100 ? 100 : 0);

      setState((prev) => {
        const oldHigh = prev.quizHighScores[eraId] || 0;
        const updatedHighScores = {
          ...prev.quizHighScores,
          [eraId]: Math.max(oldHigh, percentage),
        };
        const newLog = {
          id: `log-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          timestamp: Date.now(),
          eraId,
          durationSeconds: 180,
          quizScore: score,
          quizTotal: total,
        };
        const updatedEras = prev.completedEras.includes(eraId) ? prev.completedEras : [...prev.completedEras, eraId];
        const next = {
          ...prev,
          xp: prev.xp + earnedXP,
          level: Math.floor((prev.xp + earnedXP) / 300) + 1,
          quizHighScores: updatedHighScores,
          completedEras: updatedEras,
          activityLogs: [newLog, ...prev.activityLogs],
        };
        const badgesWithNew = checkBadgeUnlocks(next);
        return {
          ...next,
          unlockedBadges: badgesWithNew,
        };
      });
    },
    [checkBadgeUnlocks]
  );

  const recordSimulationInteraction = useCallback(
    (eraId: EraId) => {
      setState((prev) => {
        const currentCount = prev.simulationInteractionsCount[eraId] || 0;
        const updatedCounts = {
          ...prev.simulationInteractionsCount,
          [eraId]: currentCount + 1,
        };
        const next = {
          ...prev,
          xp: prev.xp + 35,
          simulationInteractionsCount: updatedCounts,
        };
        const badgesWithNew = checkBadgeUnlocks(next);
        return {
          ...next,
          unlockedBadges: badgesWithNew,
        };
      });
    },
    [checkBadgeUnlocks]
  );

  const toggleSimulatedOffline = useCallback(() => {
    setState((prev) => {
      const nextMode = !prev.isOfflineModeSimulated;
      const next = {
        ...prev,
        isOfflineModeSimulated: nextMode,
      };
      const badgesWithNew = checkBadgeUnlocks(next);
      return {
        ...next,
        unlockedBadges: badgesWithNew,
      };
    });
  }, [checkBadgeUnlocks]);

  const openModal = useCallback((modal: 'quiz' | 'leaderboard' | 'badges' | 'dailyReport' | 'share', badgeToShare?: Badge) => {
    if (badgeToShare) {
      setSelectedShareBadge(badgeToShare);
    }
    setActiveModal(modal);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setSelectedShareBadge(null);
  }, []);

  // Compute live badge progress
  const badges: Badge[] = INITIAL_BADGES.map((b) => {
    const isUnlocked = state.unlockedBadges.includes(b.id);
    let progress = b.progress;
    let current = b.current;

    if (b.id === 'cosmic-ignition') {
      current = state.completedEras.includes('big-bang') ? 1 : 0;
      progress = current * 100;
    } else if (b.id === 'primordial-chemist') {
      current = state.completedEras.includes('before-dinosaurs') ? 1 : 0;
      progress = current * 100;
    } else if (b.id === 'apex-paleontologist') {
      current = state.completedEras.includes('dinosaurs') ? 1 : 0;
      progress = current * 100;
    } else if (b.id === 'dawn-of-wisdom') {
      current = state.completedEras.includes('human-evolution') ? 1 : 0;
      progress = current * 100;
    } else if (b.id === 'chronos-polymath') {
      current = state.completedEras.length;
      progress = Math.min(100, (current / 4) * 100);
    } else if (b.id === 'perfect-scholar') {
      const best = Math.max(0, ...Object.values(state.quizHighScores));
      current = best;
      progress = best;
    } else if (b.id === 'theia-smasher') {
      current = (state.simulationInteractionsCount['big-bang'] || 0) >= 1 ? 1 : 0;
      progress = current * 100;
    } else if (b.id === 'oxygen-architect') {
      current = (state.simulationInteractionsCount['before-dinosaurs'] || 0) >= 1 ? 1 : 0;
      progress = current * 100;
    } else if (b.id === 'extinction-physicist') {
      current = (state.simulationInteractionsCount['dinosaurs'] || 0) >= 1 ? 1 : 0;
      progress = current * 100;
    } else if (b.id === 'skull-whisperer') {
      current = (state.simulationInteractionsCount['human-evolution'] || 0) >= 1 ? 7 : 0;
      progress = Math.min(100, (current / 7) * 100);
    } else if (b.id === 'offline-explorer') {
      current = state.isOfflineModeSimulated ? 1 : 0;
      progress = current * 100;
    }

    return {
      ...b,
      current,
      progress: isUnlocked ? 100 : progress,
      unlockedAt: isUnlocked ? 'Unlocked' : undefined,
    };
  });

  // Calculate dynamic leaderboard with user embedded
  const userAccuracy =
    Object.values(state.quizHighScores).filter((s) => s > 0).length > 0
      ? Math.round(
          Object.values(state.quizHighScores)
            .filter((s) => s > 0)
            .reduce((a, b) => a + b, 0) /
            Object.values(state.quizHighScores).filter((s) => s > 0).length
        )
      : 80;

  let userTier: 'Stargazer' | 'Primordial Pioneer' | 'Dino Tracker' | 'Cosmic Sage' = 'Stargazer';
  if (state.level >= 10) userTier = 'Cosmic Sage';
  else if (state.level >= 7) userTier = 'Dino Tracker';
  else if (state.level >= 4) userTier = 'Primordial Pioneer';

  const currentUserLeaderboardEntry: LeaderboardUser = {
    id: state.userId,
    name: `${state.displayName} (You)`,
    avatar: state.avatar,
    xp: state.xp,
    level: state.level,
    tier: userTier,
    accuracy: userAccuracy,
    quizzesCompleted: Object.values(state.quizHighScores).filter((s) => s > 0).length,
    streakDays: state.streakDays,
    badgeCount: state.unlockedBadges.length,
    isCurrentUser: true,
  };

  const fullLeaderboard: LeaderboardUser[] = [...INITIAL_LEADERBOARD, currentUserLeaderboardEntry].sort(
    (a, b) => b.xp - a.xp
  );

  return (
    <UserLearningContext.Provider
      value={{
        state,
        badges,
        leaderboard: fullLeaderboard,
        activeModal,
        selectedShareBadge,
        isOnline: effectiveIsOnline,
        openModal,
        closeModal,
        setCurrentEraId,
        addXP,
        recordQuizResult,
        recordSimulationInteraction,
        markEraRead,
        toggleSimulatedOffline,
        triggerConfetti,
      }}
    >
      {children}
    </UserLearningContext.Provider>
  );
};

export const useUserLearning = () => {
  const context = useContext(UserLearningContext);
  if (!context) {
    throw new Error('useUserLearning must be used within UserLearningProvider');
  }
  return context;
};
