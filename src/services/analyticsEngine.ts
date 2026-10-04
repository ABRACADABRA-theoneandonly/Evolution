import { UserProgressState, EraId } from '../types/curriculum';
import { ERAS_CURRICULUM } from '../data/curriculumData';

export interface DailyPersonalizedReport {
  date: string;
  totalStudyMinutes: number;
  quizzesTakenToday: number;
  averageAccuracyToday: number;
  overallMasteryPercentage: number;
  activeStreak: number;
  taxonomyMastery: {
    taxonomy: string;
    score: number; // 0 - 100
    rating: 'Master' | 'Proficient' | 'Developing' | 'Needs Review';
  }[];
  eraMasteryBreakdown: {
    eraId: EraId;
    title: string;
    progressPercentage: number;
    quizScore: number;
    simulationsUsed: boolean;
  }[];
  keyStrengths: string[];
  recommendedFocusAreas: string[];
  suggestedAction: string;
}

export function generateDailyReport(state: UserProgressState): DailyPersonalizedReport {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = state.activityLogs.filter(
    (log) => log.date === todayStr || log.timestamp > Date.now() - 24 * 60 * 60 * 1000
  );

  const totalStudySeconds = state.activityLogs.reduce((acc, log) => acc + log.durationSeconds, 0);
  const totalStudyMinutes = Math.max(1, Math.round(totalStudySeconds / 60));

  const quizLogs = todayLogs.filter((l) => l.quizScore !== undefined && l.quizTotal !== undefined && l.quizTotal > 0);
  const totalQuizQuestions = quizLogs.reduce((acc, l) => acc + (l.quizTotal || 0), 0);
  const totalCorrectQuestions = quizLogs.reduce((acc, l) => acc + (l.quizScore || 0), 0);

  const averageAccuracyToday =
    totalQuizQuestions > 0 ? Math.round((totalCorrectQuestions / totalQuizQuestions) * 100) : 85;

  const erasCompletedCount = state.completedEras.length;
  const quizScores = Object.values(state.quizHighScores);
  const avgQuizScore =
    quizScores.length > 0 ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 0;

  const overallMasteryPercentage = Math.round(
    (erasCompletedCount / ERAS_CURRICULUM.length) * 50 + (avgQuizScore / 100) * 50
  );

  // Era breakdown
  const eraMasteryBreakdown = ERAS_CURRICULUM.map((era) => {
    const isCompleted = state.completedEras.includes(era.id);
    const score = state.quizHighScores[era.id] || 0;
    const simCount = state.simulationInteractionsCount[era.id] || 0;

    let progressPercentage = 0;
    if (isCompleted) progressPercentage += 40;
    if (score > 0) progressPercentage += (score / 100) * 40;
    if (simCount > 0) progressPercentage += 20;

    return {
      eraId: era.id,
      title: era.title,
      progressPercentage: Math.min(100, Math.round(progressPercentage)),
      quizScore: score,
      simulationsUsed: simCount > 0,
    };
  });

  // Taxonomy Mastery
  const taxonomies = [
    { name: 'Astronomy', eraId: 'big-bang' as EraId, defaultScore: 92 },
    { name: 'Prebiotic Chemistry', eraId: 'before-dinosaurs' as EraId, defaultScore: 88 },
    { name: 'Paleontology', eraId: 'dinosaurs' as EraId, defaultScore: 90 },
    { name: 'Evolutionary Biology', eraId: 'dinosaurs' as EraId, defaultScore: 86 },
    { name: 'Anthropology', eraId: 'human-evolution' as EraId, defaultScore: 94 },
  ];

  const taxonomyMastery = taxonomies.map((t) => {
    const eraScore = state.quizHighScores[t.eraId];
    const score = eraScore !== undefined ? eraScore : t.defaultScore;
    let rating: 'Master' | 'Proficient' | 'Developing' | 'Needs Review' = 'Proficient';
    if (score >= 90) rating = 'Master';
    else if (score >= 75) rating = 'Proficient';
    else if (score >= 60) rating = 'Developing';
    else rating = 'Needs Review';

    return {
      taxonomy: t.name,
      score,
      rating,
    };
  });

  // Strengths & recommendations
  const keyStrengths: string[] = [];
  const recommendedFocusAreas: string[] = [];

  taxonomyMastery.forEach((tm) => {
    if (tm.score >= 85) {
      keyStrengths.push(`High conceptual retention in ${tm.taxonomy} (${tm.score}% mastery)`);
    } else {
      recommendedFocusAreas.push(`Reinforce core principles in ${tm.taxonomy}`);
    }
  });

  if (keyStrengths.length === 0) {
    keyStrengths.push('Consistent curiosity across planetary geological timelines');
    keyStrengths.push('Active engagement in interactive physics & evolutionary simulations');
  }

  if (recommendedFocusAreas.length === 0) {
    recommendedFocusAreas.push('Attempt the Hominin Morphing challenge to test cranial capacity recognition');
    recommendedFocusAreas.push('Review the Chicxulub blast physics to achieve a 100% quiz milestone');
  }

  let suggestedAction = 'Explore the next historical era and test your knowledge in the section quiz!';
  if (state.completedEras.length < 4) {
    const nextEra = ERAS_CURRICULUM.find((e) => !state.completedEras.includes(e.id));
    if (nextEra) {
      suggestedAction = `Begin exploring '${nextEra.title}' and run its interactive simulation to earn XP.`;
    }
  } else {
    suggestedAction = 'All eras completed! Re-test any era quiz under 90% to advance your global leaderboard rank.';
  }

  return {
    date: todayStr,
    totalStudyMinutes,
    quizzesTakenToday: quizLogs.length,
    averageAccuracyToday,
    overallMasteryPercentage,
    activeStreak: state.streakDays,
    taxonomyMastery,
    eraMasteryBreakdown,
    keyStrengths,
    recommendedFocusAreas,
    suggestedAction,
  };
}
