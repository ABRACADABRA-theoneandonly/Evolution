import React, { useState } from 'react';
import { Volume2, VolumeX, TrendingUp, Trophy, Award, Menu, X, Globe, Sparkles } from 'lucide-react';
import { useUserLearning } from '../context/UserLearningContext';
import { soundManager } from '../services/audioSynthesizer';

export const Navbar: React.FC = () => {
  const { state, openModal } = useUserLearning();
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(soundManager.isAmbientActive());
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleAmbient = () => {
    const playing = soundManager.toggleAmbientSoundtrack();
    setIsAmbientPlaying(playing);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2 group font-display whitespace-nowrap"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Globe className="w-4 h-4 text-slate-950" />
          </div>
          <span>ChronosEarth</span>
        </a>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => scrollToSection('eras-selector')}
            className="hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            Chronology
          </button>
          <button
            onClick={() => scrollToSection('simulation-sandbox')}
            className="hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            Simulations
          </button>
          <button
            onClick={() => openModal('quiz')}
            className="hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            Examination
          </button>
          <button
            onClick={() => openModal('leaderboard')}
            className="hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            Leaderboard
          </button>
          <button
            onClick={() => openModal('badges')}
            className="hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            Badges
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          {/* Cosmic Drone Soundtrack Toggle */}
          <button
            onClick={handleToggleAmbient}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              isAmbientPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-950'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Ambient Cosmic Audio Drone"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{isAmbientPlaying ? 'Audio Drone On' : 'Cosmic Ambience'}</span>
          </button>

          {/* Mute SFX */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Daily Progress Dossier Button */}
          <button
            onClick={() => openModal('dailyReport')}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-amber-950/40 whitespace-nowrap"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Daily Dossier</span>
            <span className="font-mono-tabular bg-slate-950/20 px-1 rounded text-[11px]">
              {state.xp} XP
            </span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 md:hidden"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-3 animate-fade-in">
          <button
            onClick={() => scrollToSection('eras-selector')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-900 hover:text-amber-400"
          >
            Chronology
          </button>
          <button
            onClick={() => scrollToSection('simulation-sandbox')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-900 hover:text-amber-400"
          >
            Simulations
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openModal('quiz');
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-900 hover:text-amber-400"
          >
            Section Examination
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openModal('leaderboard');
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-900 hover:text-amber-400"
          >
            Competitive Leaderboard
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openModal('badges');
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-900 hover:text-amber-400"
          >
            Milestone Badges ({state.unlockedBadges.length} unlocked)
          </button>
        </div>
      )}
    </header>
  );
};
