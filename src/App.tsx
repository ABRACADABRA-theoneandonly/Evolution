/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserLearningProvider, useUserLearning } from './context/UserLearningContext';
import { OfflineIndicatorBanner } from './components/offline/OfflineIndicatorBanner';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { EraSelector } from './components/EraSelector';
import { EraDetailView } from './components/EraDetailView';
import { Footer } from './components/Footer';
import { EraQuizModal } from './components/quizzes/EraQuizModal';
import { LeaderboardModal } from './components/gamification/LeaderboardModal';
import { BadgesGalleryModal } from './components/gamification/BadgesGalleryModal';
import { DailyProgressReportModal } from './components/analytics/DailyProgressReportModal';
import { ShareAchievementModal } from './components/social/ShareAchievementModal';
import { AmbientCosmicParticles } from './components/effects/AmbientCosmicParticles';
import { CosmicMouseFollower } from './components/effects/CosmicMouseFollower';
import { ChronosAIChatbot } from './components/chat/ChronosAIChatbot';
import { AmbientMusicPlayer } from './components/audio/AmbientMusicPlayer';

const AppContent: React.FC = () => {
  const { activeModal } = useUserLearning();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200 relative overflow-x-hidden">
      {/* Background ambient cosmic particles and stardust */}
      <AmbientCosmicParticles />

      {/* Interactive Celestial Mouse Follower with trailing stardust */}
      <CosmicMouseFollower />

      {/* Ambient Generative Music Console */}
      <AmbientMusicPlayer />

      {/* Offline Status & Mode Simulation Banner */}
      <OfflineIndicatorBanner />

      {/* Main Top Bar Contract Navigation */}
      <Navbar />

      {/* Hero Visual Section */}
      <main className="flex-1 relative z-10">
        <HeroSection />

        {/* Historical Eras Toggle & Scrubber */}
        <EraSelector />

        {/* Selected Era Deep Dive & Embedded Interactive Simulation */}
        <EraDetailView />
      </main>

      {/* Editorial Footer */}
      <Footer />

      {/* AI Chatbot Assistant: Chronos Earth Guide */}
      <ChronosAIChatbot />

      {/* Interactive Modals */}
      {activeModal === 'quiz' && <EraQuizModal />}
      {activeModal === 'leaderboard' && <LeaderboardModal />}
      {activeModal === 'badges' && <BadgesGalleryModal />}
      {activeModal === 'dailyReport' && <DailyProgressReportModal />}
      {activeModal === 'share' && <ShareAchievementModal />}
    </div>
  );
};

export default function App() {
  return (
    <UserLearningProvider>
      <AppContent />
    </UserLearningProvider>
  );
}
