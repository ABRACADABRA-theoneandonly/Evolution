import React, { useState } from 'react';
import { X, Trophy, Flame, Target, Award, Swords, Sparkles } from 'lucide-react';
import { useUserLearning } from '../../context/UserLearningContext';

export const LeaderboardModal: React.FC = () => {
  const { leaderboard, closeModal, openModal } = useUserLearning();
  const [filter, setFilter] = useState<'all' | 'weekly' | 'streak'>('all');

  const filteredLeaderboard = [...leaderboard].sort((a, b) => {
    if (filter === 'weekly') return b.xp - a.xp;
    if (filter === 'streak') return b.streakDays - a.streakDays;
    return b.xp - a.xp;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Cosmic Academic Leaderboard</h3>
              <p className="text-xs text-slate-400">Competitive global cohort ranking by XP and knowledge mastery</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overall Global
            </button>
            <button
              onClick={() => setFilter('weekly')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'weekly'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Weekly League
            </button>
            <button
              onClick={() => setFilter('streak')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'streak'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Streak Leaders
            </button>
          </div>

          <button
            onClick={() => openModal('badges')}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
          >
            <Award className="w-3.5 h-3.5" />
            View Badges
          </button>
        </div>

        {/* Leaderboard List */}
        <div className="p-6 overflow-y-auto space-y-2.5 flex-1">
          {filteredLeaderboard.map((user, index) => {
            const isTop3 = index < 3;
            const rankBadgeColor =
              index === 0
                ? 'text-amber-400 font-bold'
                : index === 1
                ? 'text-slate-300 font-bold'
                : index === 2
                ? 'text-amber-600 font-bold'
                : 'text-slate-500';

            return (
              <div
                key={user.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                  user.isCurrentUser
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-950/20'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Left: Rank & Avatar */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-6 text-center text-sm font-mono-tabular ${rankBadgeColor}`}>
                    #{index + 1}
                  </div>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-100 truncate">
                        {user.name}
                      </span>
                      {user.isCurrentUser && (
                        <span className="text-[10px] text-amber-400 font-mono">YOU</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{user.tier}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-0.5 text-amber-400/90 font-mono-tabular">
                        <Flame className="w-3 h-3 text-orange-400" /> {user.streakDays}d streak
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: XP & Metrics */}
                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div>
                    <div className="text-sm font-bold text-amber-400 font-mono-tabular">
                      {user.xp.toLocaleString()} XP
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono-tabular">
                      {user.accuracy}% Accuracy · Lvl {user.level}
                    </div>
                  </div>

                  {!user.isCurrentUser ? (
                    <button
                      onClick={() => openModal('quiz')}
                      className="hidden sm:flex p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-colors"
                      title="Challenge Student in Quiz"
                    >
                      <Swords className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="hidden sm:flex px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-[11px] font-semibold">
                      Rank #{index + 1}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Rankings update dynamically with every quiz completed and simulation tested.</span>
          <button
            onClick={() => openModal('quiz')}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-colors shrink-0"
          >
            Earn XP in Section Quiz
          </button>
        </div>
      </div>
    </div>
  );
};
