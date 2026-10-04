import React, { useState } from 'react';
import {
  Thermometer,
  Wind,
  Sparkles,
  Award,
  CheckCircle2,
  Orbit,
  ArrowRight,
  BookOpen,
  Share2,
  ChevronDown,
  Info,
} from 'lucide-react';
import { useUserLearning } from '../context/UserLearningContext';
import { ERAS_CURRICULUM } from '../data/curriculumData';
import { BigBangAccretionSim } from './simulations/BigBangAccretionSim';
import { PrimordialSoupSim } from './simulations/PrimordialSoupSim';
import { DinosaurAsteroidImpactSim } from './simulations/DinosaurAsteroidImpactSim';
import { HomininEvolutionSim } from './simulations/HomininEvolutionSim';
import { InteractiveDiscoveriesDeck } from './discoveries/InteractiveDiscoveriesDeck';
import { soundManager } from '../services/audioSynthesizer';
import { EraAudioNarrator } from './audio/EraAudioNarrator';

export const EraDetailView: React.FC = () => {
  const { state, openModal, markEraRead } = useUserLearning();
  const era = ERAS_CURRICULUM.find((e) => e.id === state.currentEraId) || ERAS_CURRICULUM[0];

  const isCompleted = state.completedEras.includes(era.id);
  const quizScore = state.quizHighScores[era.id] || 0;
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);

  const renderActiveSimulation = () => {
    switch (era.id) {
      case 'big-bang':
        return <BigBangAccretionSim />;
      case 'before-dinosaurs':
        return <PrimordialSoupSim />;
      case 'dinosaurs':
        return <DinosaurAsteroidImpactSim />;
      case 'human-evolution':
        return <HomininEvolutionSim />;
      default:
        return <BigBangAccretionSim />;
    }
  };

  const toggleMilestone = (id: string) => {
    soundManager.playHoverBlip();
    setExpandedMilestoneId(expandedMilestoneId === id ? null : id);
  };

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-14">
      {/* Era Hero Banner & Overview with cinematic depth */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl group">
        <div className="relative h-72 sm:h-96 md:h-[440px] w-full overflow-hidden">
          <img
            src={era.image}
            alt={era.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/60" />

          {/* Overlay Text Content */}
          <div className="absolute bottom-6 left-6 right-6 max-w-3xl space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono-tabular text-amber-400">
              <span className="bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                {era.timeframe}
              </span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-slate-300">Curriculum Chapter</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-slate-100 leading-tight drop-shadow-lg">
              {era.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl drop-shadow">
              {era.heroExcerpt}
            </p>
          </div>
        </div>

        {/* Overview Prose & Atmosphere Matrix */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur">
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-lg font-bold text-slate-100 font-display">Geological Summary</h3>

            {/* Interactive Audio Narration Player */}
            <EraAudioNarrator
              eraTitle={era.title}
              timeframe={era.timeframe}
              overviewText={era.overview}
              heroExcerpt={era.heroExcerpt}
            />

            <p className="text-sm text-slate-300 leading-relaxed">{era.overview}</p>

            <div className="pt-4 space-y-2.5">
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
                Key Evolutionary Innovations
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
                {era.keyInnovations.map((inv, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 bg-slate-900/70 hover:bg-slate-900 p-3 rounded-xl border border-slate-800/80 transition-colors"
                  >
                    <span className="text-amber-400 font-bold shrink-0 mt-0.5">✔</span>
                    <span className="leading-snug">{inv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Atmosphere & Climate Card */}
          <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
              <Wind className="w-4 h-4 text-sky-400" /> Atmospheric Matrix
            </div>

            <div className="space-y-3">
              {era.atmosphericComposition.map((gas) => (
                <div key={gas.gas} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300 font-mono-tabular">
                    <span>{gas.gas}</span>
                    <span className="text-amber-400 font-semibold">{gas.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, gas.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800/80 text-xs flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Est. Surface Temp:
              </span>
              <span className="font-semibold text-slate-100 font-mono-tabular">{era.temperatureEstimate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Sandbox Section */}
      <section id="simulation-sandbox" className="space-y-4 pt-4">
        <div>
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
            Interactive Physics & Biological Simulation
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-100 mt-0.5">
            {era.simulationTitle}
          </h3>
          <p className="text-xs text-slate-400 max-w-xl mt-0.5">
            {era.simulationDescription}
          </p>
        </div>

        {/* Dynamic Simulation */}
        {renderActiveSimulation()}
      </section>

      {/* Interactive Discoveries & Cataclysms Deck */}
      <section id="discoveries-deck" className="pt-2">
        <InteractiveDiscoveriesDeck />
      </section>

      {/* Chronological Milestones Timeline with interactive reveals */}
      <section className="space-y-6 pt-4">
        <div>
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
            Epoch Milestones & Thresholds
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-100 mt-0.5">
            Key Evolutionary Thresholds in {era.title}
          </h3>
        </div>

        <div className="relative border-l border-slate-800 ml-4 sm:ml-6 space-y-6 pl-6">
          {era.milestones.map((m) => {
            const isExpanded = expandedMilestoneId === m.id;
            return (
              <div key={m.id} className="relative group">
                {/* Timeline Bullet Node */}
                <div className="absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-amber-400 group-hover:scale-125 transition-transform shadow-md shadow-amber-500/50" />

                <div
                  onClick={() => toggleMilestone(m.id)}
                  className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all duration-200 cursor-pointer space-y-2 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold font-mono-tabular text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                      {m.timeAgo}
                    </span>
                    <span className="text-[11px] text-slate-400 uppercase font-mono">
                      {m.category}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-100 font-display flex items-center justify-between">
                    <span>{m.title}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-amber-400' : ''
                      }`}
                    />
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{m.summary}</p>

                  <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-start gap-1.5">
                    <span className="text-amber-400 font-semibold shrink-0">Key Fact:</span>
                    <span className="text-slate-300 italic">{m.keyFact}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section Examination CTA Banner */}
      <section className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1.5 max-w-xl">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Award className="w-4 h-4" /> Section Knowledge Examination
          </div>
          <h4 className="text-xl font-bold text-slate-100 font-display">
            Test Your Mastery of &quot;{era.title}&quot;
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Answer 5 questions covering astrophysics, paleontology, and biochemistry. Earn XP, level up, and unlock milestone badges on the competitive leaderboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {!isCompleted && (
            <button
              onClick={() => markEraRead(era.id)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Mark Era as Read (+150 XP)
            </button>
          )}

          <button
            onClick={() => {
              soundManager.playHoverBlip();
              openModal('quiz');
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-950/50 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <span>{quizScore > 0 ? `Retake Exam (${quizScore}%)` : 'Start Section Examination'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </article>
  );
};
