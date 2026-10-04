import React, { useState } from 'react';
import {
  X,
  Award,
  Sparkles,
  FlaskConical,
  Flame,
  Footprints,
  Globe,
  Orbit,
  Dna,
  Zap,
  Brain,
  CalendarCheck,
  WifiOff,
  Share2,
  Lock,
} from 'lucide-react';
import { useUserLearning } from '../../context/UserLearningContext';
import { Badge } from '../../types/curriculum';

export const BadgesGalleryModal: React.FC = () => {
  const { badges, closeModal, openModal } = useUserLearning();
  const [filter, setFilter] = useState<'all' | 'progress' | 'mastery' | 'simulation'>('all');

  const filtered = badges.filter((b) => (filter === 'all' ? true : b.category === filter));

  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'FlaskConical':
        return <FlaskConical className="w-5 h-5 text-emerald-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-rose-500" />;
      case 'Footprints':
        return <Footprints className="w-5 h-5 text-sky-400" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-indigo-400" />;
      case 'Orbit':
        return <Orbit className="w-5 h-5 text-amber-400" />;
      case 'Dna':
        return <Dna className="w-5 h-5 text-teal-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-purple-400" />;
      case 'CalendarCheck':
        return <CalendarCheck className="w-5 h-5 text-orange-400" />;
      case 'WifiOff':
        return <WifiOff className="w-5 h-5 text-blue-400" />;
      default:
        return <Award className="w-5 h-5 text-amber-400" />;
    }
  };

  const unlockedCount = badges.filter((b) => b.unlockedAt).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Milestone Badges & Honors</h3>
              <p className="text-xs text-slate-400">
                Unlocked {unlockedCount} of {badges.length} geological honors
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

        {/* Filter Categories */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Badges
          </button>
          <button
            onClick={() => setFilter('progress')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === 'progress'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Curriculum Progress
          </button>
          <button
            onClick={() => setFilter('simulation')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === 'simulation'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lab Simulations
          </button>
          <button
            onClick={() => setFilter('mastery')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === 'mastery'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Academic Mastery
          </button>
        </div>

        {/* Badges Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 flex-1">
          {filtered.map((b) => {
            const isUnlocked = Boolean(b.unlockedAt);

            return (
              <div
                key={b.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isUnlocked
                    ? 'bg-slate-950/80 border-slate-800 hover:border-amber-500/40 shadow-sm'
                    : 'bg-slate-950/30 border-slate-900 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                        isUnlocked
                          ? 'bg-slate-900 border-slate-700 shadow-md'
                          : 'bg-slate-900/50 border-slate-800 text-slate-600'
                      }`}
                    >
                      {isUnlocked ? renderBadgeIcon(b.iconName) : <Lock className="w-4 h-4 text-slate-600" />}
                    </div>

                    {isUnlocked && (
                      <button
                        onClick={() => openModal('share', b)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 text-xs flex items-center gap-1 transition-colors"
                        title="Share Badge"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-100">{b.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{b.description}</p>
                </div>

                {/* Progress bar or Unlocked Tag */}
                <div className="mt-4 pt-2 border-t border-slate-800/60">
                  {isUnlocked ? (
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      ● Unlocked & Verified
                    </span>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono-tabular">
                        <span>Milestone Progress</span>
                        <span>{b.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-slate-600 h-full rounded-full transition-all"
                          style={{ width: `${b.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400 flex items-center justify-between">
          <span>Click the share button on any unlocked badge to generate a personalized social card.</span>
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
