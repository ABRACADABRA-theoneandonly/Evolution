import React, { useState, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Disc3,
  Waves,
  Heart,
} from 'lucide-react';
import { soundManager, MusicTrack } from '../../services/audioSynthesizer';

export const AmbientMusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>('calming-zen');
  const [volume, setVolume] = useState<number>(0.35);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const unsub = soundManager.subscribeMusicChange((playing, track) => {
      setIsPlaying(playing);
      setCurrentTrack(track);
    });
    return unsub;
  }, []);

  // Try auto-starting calming music upon the user's first organic interaction with the page
  useEffect(() => {
    const handleFirstGesture = () => {
      if (!soundManager.isMusicActive()) {
        soundManager.startMusic('calming-zen');
      }
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, []);

  const handleTogglePlay = () => {
    soundManager.playHoverBlip();
    const active = soundManager.toggleMusic();
    setIsPlaying(active);
  };

  const handleSelectTrack = (track: MusicTrack) => {
    soundManager.playHoverBlip();
    setCurrentTrack(track);
    soundManager.switchTrack(track);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundManager.setMusicVolume(newVol);
  };

  const handleToggleMute = () => {
    soundManager.playHoverBlip();
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const tracks: { id: MusicTrack; name: string; era: string; mood: string }[] = [
    {
      id: 'home-chronicle',
      name: 'The Grand Chronicle (Home Theme)',
      era: 'Home Screen · Symphony',
      mood: 'Majestic Eb Major 9th space chords, celestial arpeggios & warm solar breath',
    },
    {
      id: 'calming-zen',
      name: 'Calming Zen & Ocean Breath',
      era: 'Peaceful · 432 Hz',
      mood: 'Pythagorean pentatonic chimes, warm soothing pads & gentle 8s ocean breathing waves',
    },
    {
      id: 'cosmic-odyssey',
      name: 'Cosmic Odyssey',
      era: '13.8 Ga · Big Bang',
      mood: 'Deep spatial minor 9th pads & polyrhythmic stardust chimes',
    },
    {
      id: 'primordial-deep',
      name: 'Primordial Deep',
      era: '3.8 Ga · Archaea',
      mood: 'Hydrothermal abyss drone & submerged resonance',
    },
    {
      id: 'mesozoic-dawn',
      name: 'Mesozoic Dawn',
      era: '252 Ma · Dinosaurs',
      mood: 'Warm sub-bass harmonic fifths & organic dawn breeze',
    },
  ];

  const activeMeta = tracks.find((t) => t.id === currentTrack) || tracks[0];

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      <div
        className={`rounded-2xl border transition-all duration-500 shadow-2xl backdrop-blur-xl ${
          isPlaying
            ? 'bg-slate-950/90 border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.25)]'
            : 'bg-slate-950/85 border-slate-800'
        }`}
      >
        {/* Compact Mini Bar */}
        <div className="flex items-center gap-3 px-3.5 py-2.5">
          {/* Animated Play/Pause Icon */}
          <button
            onClick={handleTogglePlay}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
              isPlaying
                ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 animate-pulse'
                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-amber-500/40'
            }`}
            title={isPlaying ? 'Pause Calming Music' : 'Play Calming Music'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Track Info & Equalizer */}
          <div className="text-left cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-100 font-display flex items-center gap-1.5">
                <span>{activeMeta.name}</span>
                {isPlaying && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </span>
            </div>

            {/* Live Animated Equalizer Bars */}
            <div className="flex items-center gap-0.5 h-2.5 mt-0.5">
              {[50, 85, 35, 95, 70, 40, 75].map((h, i) => (
                <div
                  key={i}
                  className={`w-0.5 rounded-full transition-all duration-150 ${
                    isPlaying
                      ? 'bg-gradient-to-t from-amber-500 to-amber-300'
                      : 'bg-slate-700'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(20, (h * Math.sin(Date.now() * 0.004 + i)) % 100)}%` : '20%',
                  }}
                />
              ))}
              <span className="text-[10px] text-amber-300/90 font-mono ml-1.5">{activeMeta.era}</span>
            </div>
          </div>

          {/* Mute Button */}
          <button
            onClick={handleToggleMute}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Expand / Minimize Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Expanded Track Selection & Volume Panel */}
        {isExpanded && (
          <div className="p-4 border-t border-slate-800/80 space-y-3.5 animate-fade-in max-w-xs">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between">
              <span className="flex items-center gap-1 text-amber-400">
                <Waves className="w-3.5 h-3.5" />
                <span>Calming Soundscapes</span>
              </span>
              <span className="text-slate-400">432 Hz Healing</span>
            </div>

            {/* Track List */}
            <div className="space-y-1.5">
              {tracks.map((track) => {
                const active = currentTrack === track.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => handleSelectTrack(track.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      active
                        ? 'bg-amber-500/15 border-amber-500/60 text-slate-100 shadow-sm'
                        : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <Disc3
                          className={`w-3.5 h-3.5 ${
                            active && isPlaying ? 'text-amber-400 animate-spin' : 'text-slate-500'
                          }`}
                          style={{ animationDuration: '4s' }}
                        />
                        <span>{track.name}</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400">
                        {track.era.split('·')[0]}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{track.mood}</div>
                  </button>
                );
              })}
            </div>

            {/* Volume Slider */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>Calming Music Volume</span>
                <span className="text-amber-400 font-bold">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
