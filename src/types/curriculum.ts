export type EraId = 'big-bang' | 'before-dinosaurs' | 'dinosaurs' | 'human-evolution';

export interface TimelineMilestone {
  id: string;
  timeAgo: string;
  title: string;
  summary: string;
  keyFact: string;
  category: 'astrophysics' | 'geology' | 'biochemistry' | 'paleontology' | 'anthropology';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  taxonomy: 'Astronomy' | 'Prebiotic Chemistry' | 'Paleontology' | 'Evolutionary Biology' | 'Anthropology';
}

export interface EraCurriculum {
  id: EraId;
  title: string;
  subTitle: string;
  timeframe: string;
  image: string;
  heroExcerpt: string;
  overview: string;
  atmosphericComposition: {
    gas: string;
    percentage: number;
  }[];
  temperatureEstimate: string;
  keyInnovations: string[];
  milestones: TimelineMilestone[];
  simulationTitle: string;
  simulationDescription: string;
  quizQuestions: QuizQuestion[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category: 'progress' | 'mastery' | 'simulation' | 'streak';
  unlockedAt?: string;
  progress: number; // 0 to 100
  target: number;
  current: number;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  tier: 'Stargazer' | 'Primordial Pioneer' | 'Dino Tracker' | 'Cosmic Sage';
  accuracy: number;
  quizzesCompleted: number;
  streakDays: number;
  badgeCount: number;
  isCurrentUser?: boolean;
}

export interface StudyActivityLog {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  eraId: EraId;
  durationSeconds: number;
  quizScore?: number;
  quizTotal?: number;
  simulationUsed?: boolean;
}

export interface UserProgressState {
  userId: string;
  displayName: string;
  avatar: string;
  xp: number;
  level: number;
  completedEras: EraId[];
  currentEraId: EraId;
  quizHighScores: Record<EraId, number>; // eraId -> percentage
  unlockedBadges: string[];
  streakDays: number;
  lastActiveDate: string;
  activityLogs: StudyActivityLog[];
  simulationInteractionsCount: Record<string, number>;
  isOfflineModeSimulated: boolean;
}
