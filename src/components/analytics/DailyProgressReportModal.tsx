import React from 'react';
import {
  X,
  TrendingUp,
  Award,
  Clock,
  Target,
  Flame,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
  Calendar,
} from 'lucide-react';
import { useUserLearning } from '../../context/UserLearningContext';
import { generateDailyReport } from '../../services/analyticsEngine';
import { exportOfflineStudyGuide } from '../../services/offlineStorage';

export const DailyProgressReportModal: React.FC = () => {
  const { state, closeModal, openModal } = useUserLearning();
  const report = generateDailyReport(state);

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'Master':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Proficient':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'Developing':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Personalized Daily Learning Dossier</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5" /> Date: {report.date} · Learner: {state.displayName}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
              <div className="text-slate-400 text-xs flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" /> Study Time
              </div>
              <div className="text-xl font-bold text-slate-100 font-mono-tabular mt-1">
                {report.totalStudyMinutes} min
              </div>
              <div className="text-[10px] text-slate-500">Continuous engagement</div>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
              <div className="text-slate-400 text-xs flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" /> Quiz Accuracy
              </div>
              <div className="text-xl font-bold text-emerald-400 font-mono-tabular mt-1">
                {report.averageAccuracyToday}%
              </div>
              <div className="text-[10px] text-slate-500">Across active eras</div>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
              <div className="text-slate-400 text-xs flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Active Streak
              </div>
              <div className="text-xl font-bold text-amber-400 font-mono-tabular mt-1">
                {report.activeStreak} Days
              </div>
              <div className="text-[10px] text-slate-500">Daily habit retention</div>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
              <div className="text-slate-400 text-xs flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" /> Total XP
              </div>
              <div className="text-xl font-bold text-amber-400 font-mono-tabular mt-1">
                {state.xp.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">Level {state.level} Academic</div>
            </div>
          </div>

          {/* Granular Taxonomy Mastery */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Disciplinary Taxonomy Retention
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.taxonomyMastery.map((tm) => (
                <div
                  key={tm.taxonomy}
                  className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-200">{tm.taxonomy}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRatingBadge(
                        tm.rating
                      )}`}
                    >
                      {tm.rating}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono-tabular">
                      <span>Knowledge Score</span>
                      <span className="text-slate-200 font-bold">{tm.score}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${tm.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pedagogical Insights: Strengths & Recommendations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Key Strengths */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <h5 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Demonstrated Strengths
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {report.keyStrengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">·</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <h5 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Targeted Review Recommendations
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {report.recommendedFocusAreas.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">·</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Step Banner */}
          <div className="p-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-sky-950/40 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide">
                Today&apos;s Recommended Curriculum Action:
              </div>
              <p className="text-xs text-slate-200 mt-0.5">{report.suggestedAction}</p>
            </div>
            <button
              onClick={() => {
                closeModal();
                openModal('quiz');
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shrink-0 transition-colors"
            >
              Start Session
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={exportOfflineStudyGuide}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download Study Report (Markdown)
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal('share')}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Report
            </button>
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
