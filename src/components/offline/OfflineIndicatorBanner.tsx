import React from 'react';
import { Wifi, WifiOff, Download, CheckCircle2, Smartphone } from 'lucide-react';
import { useUserLearning } from '../../context/UserLearningContext';
import { exportOfflineStudyGuide } from '../../services/offlineStorage';

export const OfflineIndicatorBanner: React.FC = () => {
  const { isOnline, state, toggleSimulatedOffline } = useUserLearning();

  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Status Indicator */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Wifi className="w-3.5 h-3.5" />
              Online (Local Cache Synced)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <WifiOff className="w-3.5 h-3.5" />
              Offline Mode Active (Commute & Travel Ready)
            </span>
          )}
          <span className="hidden md:inline text-slate-500">·</span>
          <span className="hidden md:inline text-slate-400">
            All 4 simulations, quizzes, and curriculum data are stored locally in your browser.
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={toggleSimulatedOffline}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border ${
              state.isOfflineModeSimulated
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Toggle simulated offline state for travel without disconnecting network"
          >
            {state.isOfflineModeSimulated ? 'Exit Offline Simulation' : 'Simulate Offline Mode'}
          </button>

          <button
            onClick={exportOfflineStudyGuide}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors"
          >
            <Download className="w-3 h-3 text-amber-400" />
            Download Offline Packet
          </button>
        </div>
      </div>
    </div>
  );
};
