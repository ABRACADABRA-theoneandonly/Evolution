import React from 'react';
import { Globe, Award, Download, TrendingUp, Sparkles } from 'lucide-react';
import { useUserLearning } from '../context/UserLearningContext';
import { exportOfflineStudyGuide } from '../services/offlineStorage';

export const Footer: React.FC = () => {
  const { openModal } = useUserLearning();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 mt-16 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Wordmark & Mission */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-slate-100 font-bold font-display text-base">
              <Globe className="w-5 h-5 text-amber-400" />
              <span>ChronosEarth</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              An interactive, animated voyage across 13.8 billion years of Earth&apos;s history from the Big Bang to human evolution. Grounded in peer-reviewed astrophysics, geobiology, paleontology, and physical anthropology.
            </p>
            <div className="text-[11px] text-slate-500">
              Offline-ready interactive curriculum designed for continuous learning anywhere.
            </div>
          </div>

          {/* Col 2: Academic Features */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              Curriculum Modules
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>01. The Big Bang & Solar Accretion</li>
              <li>02. Prebiotic Soup & Great Oxidation</li>
              <li>03. Mesozoic Dinosaurs & Asteroid Cataclysm</li>
              <li>04. Hominin Bipedalism & Civilization</li>
            </ul>
          </div>

          {/* Col 3: Quick Portals */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              Academic Tools
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => openModal('dailyReport')}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  Personalized Daily Dossier
                </button>
              </li>
              <li>
                <button
                  onClick={() => openModal('leaderboard')}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Global Cohort Leaderboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => openModal('badges')}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Milestone Badges Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={exportOfflineStudyGuide}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  Export Offline Study Guide (.md)
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} ChronosEarth Academic Consortium. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Astronomy</span>
            <span>·</span>
            <span>Paleontology</span>
            <span>·</span>
            <span>Anthropology</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
