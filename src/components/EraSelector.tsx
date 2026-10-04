import React from 'react';
import { Sparkles, CheckCircle2, Clock, PlayCircle, Compass } from 'lucide-react';
import { useUserLearning } from '../context/UserLearningContext';
import { ERAS_CURRICULUM } from '../data/curriculumData';
import { soundManager } from '../services/audioSynthesizer';

export const EraSelector: React.FC = () => {
  const { state, setCurrentEraId } = useUserLearning();

  const handleSelectEra = (id: typeof state.currentEraId) => {
    soundManager.playHoverBlip();
    setCurrentEraId(id);
  };

  return (
    <section id="eras-selector" className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" /> Chronological Timeline Navigation
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-100 mt-1">
            Explore Geological Eras
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Select an epoch to examine key milestones, atmospheric states, run the era&apos;s interactive simulation, and complete the curriculum exam.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono-tabular shrink-0 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
          Progress: <strong className="text-amber-400">{state.completedEras.length} of 4</strong> Eras Mastered
        </div>
      </div>

      {/* Connected Geological Timeline Ribbon */}
      <div className="relative mb-6 hidden md:block">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 rounded-full" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 -translate-y-1/2 rounded-full transition-all duration-500"
          style={{
            width: `${((ERAS_CURRICULUM.findIndex((e) => e.id === state.currentEraId) + 1) / ERAS_CURRICULUM.length) * 100}%`,
          }}
        />
        <div className="relative flex justify-between">
          {ERAS_CURRICULUM.map((era, idx) => {
            const isSelected = state.currentEraId === era.id;
            const isCompleted = state.completedEras.includes(era.id);
            return (
              <button
                key={era.id}
                onClick={() => handleSelectEra(era.id)}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isSelected
                      ? 'bg-amber-500 border-amber-300 scale-125 shadow-lg shadow-amber-500/50'
                      : isCompleted
                      ? 'bg-emerald-500 border-emerald-400'
                      : 'bg-slate-900 border-slate-700 group-hover:border-amber-400'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-950">
                    {idx + 1}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-mono-tabular mt-2 transition-colors ${
                    isSelected ? 'text-amber-300 font-bold' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {era.timeframe.split('–')[0].trim()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Eras Grid / Scrubber Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ERAS_CURRICULUM.map((era, index) => {
          const isSelected = state.currentEraId === era.id;
          const isCompleted = state.completedEras.includes(era.id);
          const quizScore = state.quizHighScores[era.id] || 0;

          return (
            <button
              key={era.id}
              onClick={() => handleSelectEra(era.id)}
              className={`text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer hover:-translate-y-1 ${
                isSelected
                  ? 'bg-slate-900 border-amber-500 shadow-xl shadow-amber-950/40 ring-1 ring-amber-500/50'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              {/* Top Meta info */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono-tabular text-slate-400">Era 0{index + 1}</span>
                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  ) : isSelected ? (
                    <span className="text-amber-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      Active Epoch
                    </span>
                  ) : (
                    <span className="text-slate-500">Uncompleted</span>
                  )}
                </div>

                {/* Thumbnail Image */}
                <div className="w-full h-28 rounded-xl overflow-hidden relative mb-3 bg-slate-900 border border-slate-800/80">
                  <img
                    src={era.image}
                    alt={era.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                  <div className="absolute bottom-2 left-2.5 right-2.5 text-[10px] font-mono-tabular text-amber-300 font-semibold truncate drop-shadow-md">
                    {era.timeframe}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-amber-300 transition-colors font-display">
                  {era.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {era.subTitle}
                </p>
              </div>

              {/* Bottom footer status */}
              <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono-tabular">
                  {quizScore > 0 ? `Quiz: ${quizScore}%` : 'Quiz: Not taken'}
                </span>
                <span
                  className={`font-semibold flex items-center gap-1 ${
                    isSelected ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                >
                  {isSelected ? 'Viewing' : 'Select'} →
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
