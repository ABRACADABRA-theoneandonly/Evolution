import React, { useState } from 'react';
import { X, Share2, Copy, Check, Twitter, MessageCircle, Globe, Award, Sparkles } from 'lucide-react';
import { useUserLearning } from '../../context/UserLearningContext';

export const ShareAchievementModal: React.FC = () => {
  const { state, selectedShareBadge, closeModal } = useUserLearning();
  const [copied, setCopied] = useState<boolean>(false);

  const title = selectedShareBadge
    ? `Unlocked "${selectedShareBadge.name}" Badge on ChronosEarth!`
    : `Studying Earth's 13.8B Year History on ChronosEarth!`;

  const shareText = selectedShareBadge
    ? `I just unlocked the "${selectedShareBadge.name}" milestone badge exploring Earth's evolutionary history on ChronosEarth! Level ${state.level} · ${state.xp} XP.`
    : `I'm exploring the 13.8-billion-year story of Earth from the Big Bang to human evolution on ChronosEarth! Completed ${state.completedEras.length}/4 eras with ${state.xp} XP.`;

  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://chronosearth.app';

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText}\n${appUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: appUrl,
        });
      } catch (err) {
        // Ignored or cancelled
      }
    } else {
      handleCopy();
    }
  };

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(appUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">Share Academic Milestone</h3>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Card Preview */}
        <div className="p-6 space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 border border-amber-500/30 shadow-xl relative overflow-hidden text-center space-y-3">
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-amber-500/20 border border-amber-500/50">
              <Award className="w-6 h-6 text-amber-400" />
            </div>

            <div>
              <div className="text-[10px] font-bold tracking-widest text-amber-400 uppercase font-mono">
                ChronosEarth Milestone
              </div>
              <h4 className="text-base font-bold text-slate-100 mt-0.5">
                {selectedShareBadge ? selectedShareBadge.name : `${state.displayName}`}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {selectedShareBadge
                  ? selectedShareBadge.description
                  : `Level ${state.level} Academic · ${state.xp.toLocaleString()} XP`}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-4 text-xs font-mono-tabular text-slate-300">
              <span>{state.completedEras.length}/4 Eras Finished</span>
              <span aria-hidden="true">·</span>
              <span>{state.streakDays} Day Streak</span>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-2">
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Share2 className="w-4 h-4" />
                Share via Device Apps (WhatsApp, Messages, etc.)
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Twitter className="w-4 h-4 text-sky-400" />
                Share on X
              </a>

              <button
                onClick={handleCopy}
                className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                {copied ? 'Copied Link!' : 'Copy Summary'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-center text-[11px] text-slate-500">
          Inspire your peers to explore the planetary timeline!
        </div>
      </div>
    </div>
  );
};
