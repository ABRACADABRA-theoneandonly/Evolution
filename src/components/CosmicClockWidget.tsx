import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Compass,
  ArrowRight,
  Zap,
  Globe,
} from 'lucide-react';
import { useUserLearning } from '../context/UserLearningContext';
import { soundManager } from '../services/audioSynthesizer';
import { EraId } from '../types/curriculum';

interface CosmicTimePoint {
  timeStr: string; // e.g. "00:00:00"
  actualYearsAgo: string;
  title: string;
  eraId: EraId;
  desc: string;
  color: string;
}

const COSMIC_SCHEDULE: CosmicTimePoint[] = [
  {
    timeStr: '00:00:00',
    actualYearsAgo: '13.8 Billion Years Ago',
    title: 'The Big Bang Singularity',
    eraId: 'big-bang',
    desc: 'Spacetime, matter, and cosmic physics explode into existence.',
    color: '#38bdf8',
  },
  {
    timeStr: '16:08:00',
    actualYearsAgo: '4.54 Billion Years Ago',
    title: 'Solar Accretion & Proto-Earth',
    eraId: 'big-bang',
    desc: 'Dust and planetesimals coalesce; Theia impact forms the Moon.',
    color: '#f59e0b',
  },
  {
    timeStr: '18:12:00',
    actualYearsAgo: '3.7 Billion Years Ago',
    title: 'First Photosynthetic Life',
    eraId: 'before-dinosaurs',
    desc: 'Microscopic cyanobacteria build vast stromatolite reefs in boiling oceans.',
    color: '#10b981',
  },
  {
    timeStr: '21:05:00',
    actualYearsAgo: '2.4 Billion Years Ago',
    title: 'The Great Oxidation Event',
    eraId: 'before-dinosaurs',
    desc: 'O2 floods the atmosphere, precipitating ocean iron and causing Snowball Earth.',
    color: '#06b6d4',
  },
  {
    timeStr: '23:02:00',
    actualYearsAgo: '541 Million Years Ago',
    title: 'The Cambrian Explosion',
    eraId: 'before-dinosaurs',
    desc: 'Complex animal body plans, eyes, and shells radiate in shallow seas.',
    color: '#8b5cf6',
  },
  {
    timeStr: '23:38:00',
    actualYearsAgo: '66 Million Years Ago',
    title: 'Chicxulub Asteroid Impact',
    eraId: 'dinosaurs',
    desc: 'A 10 km bolide terminates non-avian dinosaurs; mammals survive in burrows.',
    color: '#ef4444',
  },
  {
    timeStr: '23:59:58',
    actualYearsAgo: '300,000 Years Ago – Present',
    title: 'Dawn of Homo sapiens',
    eraId: 'human-evolution',
    desc: 'In the final 2 seconds of the 24-hour cosmic day, all human history unfolds!',
    color: '#f97316',
  },
];

export const CosmicClockWidget: React.FC = () => {
  const { setCurrentEraId, state, addXP } = useUserLearning();
  const [selectedIndex, setSelectedIndex] = useState<number>(6); // Default to Homo sapiens last 2 seconds
  const currentPoint = COSMIC_SCHEDULE[selectedIndex];

  const handleSelectTime = (idx: number) => {
    soundManager.playHoverBlip();
    setSelectedIndex(idx);
    setCurrentEraId(COSMIC_SCHEDULE[idx].eraId);
    addXP(15, 'Cosmic Clock Point Inspected');
  };

  const jumpToEra = () => {
    soundManager.playDiscoveryUnlock();
    setCurrentEraId(currentPoint.eraId);
    const el = document.getElementById('eras-selector');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 my-10">
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden group">
        {/* Ambient background glow orb */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: currentPoint.color }}
        />

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Sagan&apos;s 24-Hour Cosmic Calendar
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-100 mt-1">
              If Earth&apos;s 13.8 Billion Years Were Compressed into a Single Day
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Recorded human civilization only occupies the final <strong>two seconds</strong> before midnight! Click any cosmic time marker to travel across existence.
            </p>
          </div>

          {/* Big Digital Clock Display */}
          <div className="flex items-center gap-3 bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800 shrink-0 shadow-inner">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-mono">Cosmic Time of Day</div>
              <div
                className="text-2xl sm:text-3xl font-extrabold font-mono-tabular tracking-wider"
                style={{ color: currentPoint.color }}
              >
                {currentPoint.timeStr}
              </div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: currentPoint.color }} />
          </div>
        </div>

        {/* 24-Hour Timeline Track Bar */}
        <div className="py-6 space-y-3">
          <div className="relative">
            <div className="w-full h-3 bg-slate-950 rounded-full border border-slate-800 overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-sky-500 via-amber-500 to-rose-500"
                style={{ width: `${((selectedIndex + 1) / COSMIC_SCHEDULE.length) * 100}%` }}
              />
            </div>

            {/* Timepoint Markers */}
            <div className="flex justify-between items-center mt-3">
              {COSMIC_SCHEDULE.map((pt, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectTime(idx)}
                    className="flex flex-col items-center group cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                        isSelected
                          ? 'scale-130 shadow-lg'
                          : 'bg-slate-950 border-slate-700 hover:border-amber-400'
                      }`}
                      style={{
                        backgroundColor: isSelected ? pt.color : '#030712',
                        borderColor: pt.color,
                        boxShadow: isSelected ? `0 0 12px ${pt.color}` : 'none',
                      }}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                    <span
                      className={`text-[10px] font-mono-tabular mt-1.5 hidden sm:inline transition-colors ${
                        isSelected ? 'font-bold text-slate-100' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    >
                      {pt.timeStr.slice(0, 5)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Cosmic Moment Dossier Card */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold font-mono px-2 py-0.5 rounded-md text-slate-950"
                style={{ backgroundColor: currentPoint.color }}
              >
                {currentPoint.actualYearsAgo}
              </span>
              <span className="text-xs text-slate-400 font-mono-tabular">
                Clock: {currentPoint.timeStr}
              </span>
            </div>
            <h4 className="text-lg font-bold text-slate-100 font-display">
              {currentPoint.title}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentPoint.desc}
            </p>
          </div>

          <button
            onClick={jumpToEra}
            className="px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg text-slate-950 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            style={{
              backgroundColor: currentPoint.color,
              boxShadow: `0 8px 24px ${currentPoint.color}33`,
            }}
          >
            <span>Jump to Epoch Curriculum</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
