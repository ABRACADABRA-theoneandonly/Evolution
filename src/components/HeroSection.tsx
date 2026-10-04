import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Orbit,
  Compass,
  Flame,
  Zap,
  Globe,
  Radio,
  Layers,
  Shield,
  Activity,
  ChevronDown,
  Volume2,
  VolumeX,
  Sun,
  Clock,
  Music,
  Play,
  Pause,
  Waves,
  Disc3,
} from 'lucide-react';
import { useUserLearning } from '../context/UserLearningContext';
import { soundManager, MusicTrack } from '../services/audioSynthesizer';
import { EraId } from '../types/curriculum';

type GlobeLayer = 'biosphere' | 'tectonics' | 'magnetosphere' | 'molten';

interface MeteorStreak {
  id: number;
  startX: number;
  startY: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
}

export const HeroSection: React.FC = () => {
  const { state, setCurrentEraId } = useUserLearning();
  const [scrollY, setScrollY] = useState<number>(0);
  const [activeLayer, setActiveLayer] = useState<GlobeLayer>('biosphere');
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [supernovaActive, setSupernovaActive] = useState<boolean>(false);
  const [solarStormActive, setSolarStormActive] = useState<boolean>(false);
  const [meteorStormActive, setMeteorStormActive] = useState<boolean>(false);
  const [meteors, setMeteors] = useState<MeteorStreak[]>([]);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>('home-chronicle');

  const heroRef = useRef<HTMLElement | null>(null);

  // Parallax scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for ambient music state changes
  useEffect(() => {
    const unsub = soundManager.subscribeMusicChange((playing, track) => {
      setIsAudioActive(playing);
      setCurrentTrack(track);
    });
    return unsub;
  }, []);

  // 3D Tilt calculation from mouse within Hero
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  // Trigger Supernova Shockwave
  const triggerSupernova = () => {
    soundManager.playSupernova();
    setSupernovaActive(true);
    setTimeout(() => {
      setSupernovaActive(false);
    }, 1400);
  };

  // Trigger Solar Flare Magnetic Storm
  const triggerSolarStorm = () => {
    soundManager.playCosmicBlast();
    setSolarStormActive(true);
    setTimeout(() => {
      setSolarStormActive(false);
    }, 1800);
  };

  // Trigger Meteor Storm
  const triggerMeteorStorm = () => {
    soundManager.playMeteorWhoosh();
    setMeteorStormActive(true);
    const newMeteors: MeteorStreak[] = Array.from({ length: 9 }).map((_, i) => ({
      id: Date.now() + i,
      startX: Math.random() * 80 + 10,
      startY: Math.random() * 30 - 20,
      length: 120 + Math.random() * 160,
      speed: 1.2 + Math.random() * 0.8,
      angle: 42 + Math.random() * 8,
      opacity: 0.8 + Math.random() * 0.2,
    }));
    setMeteors(newMeteors);

    setTimeout(() => {
      setMeteorStormActive(false);
      setMeteors([]);
    }, 2000);
  };

  const toggleSoundtrack = () => {
    const active = soundManager.toggleMusic();
    setIsAudioActive(active);
  };

  const switchHomeScreenTrack = (track: MusicTrack) => {
    soundManager.playHoverBlip();
    setCurrentTrack(track);
    soundManager.switchTrack(track);
    if (!isAudioActive) {
      soundManager.startMusic(track);
    }
  };

  const handleWarpEra = (eraId: EraId) => {
    soundManager.playTimeWarp();
    setCurrentEraId(eraId);
    const el = document.getElementById('eras-selector');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const layerMeta: Record<GlobeLayer, { name: string; icon: React.ReactNode; desc: string; glow: string; border: string }> = {
    biosphere: {
      name: 'Biosphere & Oceans',
      icon: <Globe className="w-3.5 h-3.5" />,
      desc: '71% Liquid Ocean, 8.7M species, Nitrogen-Oxygen chemical equilibrium',
      glow: 'rgba(56, 189, 248, 0.45)',
      border: 'border-sky-500/40',
    },
    tectonics: {
      name: 'Tectonic Plates',
      icon: <Layers className="w-3.5 h-3.5" />,
      desc: 'Lithospheric plates drifting 2.5 cm/yr over convective asthenosphere',
      glow: 'rgba(249, 115, 22, 0.45)',
      border: 'border-orange-500/40',
    },
    magnetosphere: {
      name: 'Magnetosphere Shield',
      icon: <Shield className="w-3.5 h-3.5" />,
      desc: 'Liquid iron core geodynamo shielding life from lethal solar radiation',
      glow: 'rgba(168, 85, 247, 0.55)',
      border: 'border-purple-500/40',
    },
    molten: {
      name: 'Primordial Magma (Hadean)',
      icon: <Flame className="w-3.5 h-3.5" />,
      desc: '4.5 Ga molten surface during Late Heavy Bombardment epoch',
      glow: 'rgba(239, 68, 68, 0.55)',
      border: 'border-rose-500/40',
    },
  };

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden border-b border-slate-800 bg-slate-950 min-h-[92vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6"
    >
      {/* Supernova Shockwave Animation Overlay */}
      {supernovaActive && (
        <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-hidden">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-amber-300 via-rose-500 to-indigo-600 animate-ping opacity-90 filter blur-sm scale-[25]" />
          <div className="absolute inset-0 bg-amber-400/25 backdrop-blur-[2px] animate-pulse" />
        </div>
      )}

      {/* Solar Flare Storm Magnetic Waves */}
      {solarStormActive && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-r from-amber-500/20 via-orange-500/30 to-purple-600/20 mix-blend-screen animate-pulse" />
          <div className="w-[600px] h-[600px] rounded-full border-4 border-amber-400/60 animate-ping opacity-60 filter blur-md" />
        </div>
      )}

      {/* Meteor Storm Streaks */}
      {meteorStormActive && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {meteors.map((m) => (
            <div
              key={m.id}
              className="absolute h-0.5 bg-gradient-to-r from-transparent via-amber-200 to-white shadow-[0_0_10px_#f59e0b] rounded-full animate-fade-in"
              style={{
                left: `${m.startX}%`,
                top: `${m.startY}%`,
                width: `${m.length}px`,
                transform: `rotate(${m.angle}deg)`,
                opacity: m.opacity,
                transition: `all ${m.speed}s cubic-bezier(0.2, 0.8, 0.2, 1)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Photorealistic 8K Cosmic Deep-Time Nebula Parallax Backdrop */}
      <div
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{
          transform: `translateY(${scrollY * 0.22}px) scale(1.08)`,
        }}
      >
        <img
          src="/src/assets/images/deep_time_nebula_1791065420097.jpg"
          alt="Photorealistic 8K Cosmic Deep Time Nebula Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-35 filter contrast-125 saturate-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.18),transparent_70%)]" />
      </div>

      <div className="relative max-w-7xl w-full mx-auto flex flex-col items-center text-center z-10">
        {/* Top Control Bar on Hero: Audio & Cataclysms */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6 animate-fade-in">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md text-xs text-slate-300 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-medium text-slate-300">EPOCH T-PLUS 13.800 Ga</span>
          </div>

          {/* Calming Ambient Music Toggle */}
          <button
            onClick={toggleSoundtrack}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95 ${
              isAudioActive
                ? 'bg-amber-500/25 border-amber-500/70 text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.35)]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAudioActive ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{isAudioActive ? 'Home Music: PLAYING 🎵' : 'Play Home Music (Calming Symphony)'}</span>
          </button>

          {/* Supernova Blast Button */}
          <button
            onClick={triggerSupernova}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-amber-500/40 text-xs text-amber-300 font-medium backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-amber-950/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Supernova Blast</span>
          </button>

          {/* Solar Storm Button */}
          <button
            onClick={triggerSolarStorm}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-yellow-500/40 text-xs text-yellow-300 font-medium backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-yellow-950/30"
          >
            <Sun className="w-3.5 h-3.5 text-yellow-400" />
            <span>Solar Flare Storm</span>
          </button>

          {/* Meteor Storm Button */}
          <button
            onClick={triggerMeteorStorm}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-rose-500/40 text-xs text-rose-300 font-medium backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-rose-950/30"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Meteor Storm</span>
          </button>
        </div>

        {/* Display Headline with glowing typography */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight text-slate-100 max-w-4xl text-balance drop-shadow-2xl">
          The Grand Chronicle of{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 inline-block hover:scale-[1.02] transition-transform">
            Earth & Life
          </span>
        </h1>

        <p className="mt-4 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed text-balance">
          Traverse 13.8 billion years of cosmic physics and biological evolution. Experiment with 4 interactive sandboxes, trigger planetary cataclysms, consult the Chronos AI time guide, and inspect the living Earth.
        </p>

        {/* Dedicated Home Screen Music Console */}
        <div className="mt-6 w-full max-w-xl rounded-2xl border border-amber-500/30 bg-slate-950/85 p-3 sm:p-3.5 backdrop-blur-xl shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              onClick={toggleSoundtrack}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                isAudioActive
                  ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 animate-pulse'
                  : 'bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-amber-500/50'
              }`}
              title={isAudioActive ? 'Pause Home Soundtrack' : 'Play Home Soundtrack'}
            >
              {isAudioActive ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Track Info & Visualizer */}
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100 font-display flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {currentTrack === 'home-chronicle'
                      ? 'The Grand Chronicle (Home Theme)'
                      : currentTrack === 'calming-zen'
                      ? 'Calming Zen (432 Hz)'
                      : currentTrack === 'cosmic-odyssey'
                      ? 'Cosmic Odyssey'
                      : 'Mesozoic Atmosphere'}
                  </span>
                </span>
                {isAudioActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>

              {/* Live Equalizer Bars */}
              <div className="flex items-center gap-0.5 h-2.5 mt-1">
                {[45, 80, 30, 90, 65, 35, 75, 55, 85].map((h, i) => (
                  <div
                    key={i}
                    className={`w-0.5 rounded-full transition-all duration-150 ${
                      isAudioActive
                        ? 'bg-gradient-to-t from-amber-500 to-amber-300'
                        : 'bg-slate-700'
                    }`}
                    style={{
                      height: isAudioActive
                        ? `${Math.max(20, (h * Math.sin(Date.now() * 0.005 + i)) % 100)}%`
                        : '20%',
                    }}
                  />
                ))}
                <span className="text-[10px] text-amber-400/90 font-mono ml-2">
                  {isAudioActive ? 'Playing Ambient Soundtrack' : 'Tap to start music'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Soundscape Switchers */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'home-chronicle', label: '🏛️ Home Theme' },
              { id: 'calming-zen', label: '🧘 432 Hz Zen' },
              { id: 'cosmic-odyssey', label: '🌌 Cosmic' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => switchHomeScreenTrack(t.id as MusicTrack)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  currentTrack === t.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive 3D Holographic Celestial Showcase */}
        <div
          className="mt-8 relative w-full max-w-2xl perspective-1000 will-change-transform"
          style={{
            transform: `perspective(1000px) rotateX(${mouseOffset.y * -16}deg) rotateY(${mouseOffset.x * 20}deg)`,
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* Hologram Stage Container */}
          <div className="relative rounded-3xl p-6 bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl overflow-hidden group">
            {/* Ambient Background Aura */}
            <div
              className="absolute inset-0 pointer-events-none transition-colors duration-500 opacity-20"
              style={{ backgroundColor: layerMeta[activeLayer].glow }}
            />

            {/* Rotating Orbital Concentric Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-80 h-80 rounded-full border border-dashed border-amber-400/20 animate-spin"
                style={{ animationDuration: '40s' }}
              />
              <div
                className="w-96 h-96 rounded-full border border-sky-400/15 animate-spin"
                style={{ animationDuration: '60s', animationDirection: 'reverse' }}
              />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              {/* Central Glowing Planet Orb Visual */}
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex-shrink-0 flex items-center justify-center">
                {/* Glowing Outer Atmospheric Corona */}
                <div
                  className="absolute inset-0 rounded-full filter blur-xl opacity-65 animate-pulse-glow"
                  style={{ backgroundColor: layerMeta[activeLayer].glow }}
                />

                {/* Rotating Planet Core Image */}
                <div
                  className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shadow-[0_0_35px_rgba(56,189,248,0.5)] border-2 border-slate-700/50"
                  style={{
                    boxShadow: `0 0 45px ${layerMeta[activeLayer].glow}, inset 0 0 20px rgba(0,0,0,0.8)`,
                  }}
                >
                  <img
                    src={
                      activeLayer === 'molten'
                        ? '/src/assets/images/era_primordial_earth_1790515790825.jpg'
                        : '/src/assets/images/celestial_mini_earth_1791063285243.jpg'
                    }
                    alt="Celestial Earth Hologram"
                    className="w-full h-full object-cover filter contrast-125 saturate-125 animate-spin"
                    style={{ animationDuration: '45s' }}
                  />

                  {/* Surface specular lighting lens */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/60 via-transparent to-white/40 pointer-events-none" />

                  {/* Tectonic / Magnetosphere FX overlay */}
                  {activeLayer === 'tectonics' && (
                    <div className="absolute inset-0 bg-orange-500/20 mix-blend-color-dodge pointer-events-none animate-pulse" />
                  )}
                  {activeLayer === 'magnetosphere' && (
                    <div className="absolute inset-0 border-4 border-purple-400/70 rounded-full mix-blend-screen pointer-events-none animate-ping opacity-35" />
                  )}
                </div>

                {/* Orbital Satellite Node */}
                <div
                  className="absolute inset-0 animate-spin pointer-events-none"
                  style={{ animationDuration: '8s' }}
                >
                  <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] border border-white absolute -top-1.5 left-1/2 -translate-x-1/2" />
                </div>
              </div>

              {/* Holographic Layer Controls & Telemetry */}
              <div className="flex-1 text-left w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span className="text-[11px] font-mono tracking-wider uppercase text-amber-400 font-bold">
                      Hologram Telemetry
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                    3D Reactive View
                  </span>
                </div>

                <h3 className="text-xl font-bold font-display text-slate-100 flex items-center gap-2">
                  <span>Earth System Architecture</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {layerMeta[activeLayer].desc}
                </p>

                {/* Layer Selector Chips */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {(['biosphere', 'tectonics', 'magnetosphere', 'molten'] as GlobeLayer[]).map((layer) => {
                    const meta = layerMeta[layer];
                    const isSelected = activeLayer === layer;
                    return (
                      <button
                        key={layer}
                        onClick={() => {
                          setActiveLayer(layer);
                          soundManager.playMusicalNote(Math.floor(Math.random() * 6));
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 border-amber-400/80 text-amber-300 shadow-md'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                      >
                        <span className={isSelected ? 'text-amber-400' : 'text-slate-400'}>
                          {meta.icon}
                        </span>
                        <span className="truncate">{meta.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Epoch Time-Warp Portal Bar */}
        <div className="mt-8 w-full max-w-3xl">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-mono font-semibold mb-3 flex items-center justify-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Epoch Time-Warp Portals</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'big-bang', name: 'Cosmic Dawn', time: '13.8 Ga', color: 'from-amber-500/20 to-orange-500/10' },
              { id: 'before-dinosaurs', name: 'Prebiotic Earth', time: '3.8 Ga', color: 'from-emerald-500/20 to-teal-500/10' },
              { id: 'dinosaurs', name: 'Age of Reptiles', time: '252 Ma', color: 'from-rose-500/20 to-amber-500/10' },
              { id: 'human-evolution', name: 'Anthropocene', time: '7.0 Ma', color: 'from-sky-500/20 to-indigo-500/10' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handleWarpEra(p.id as EraId)}
                className={`p-3 rounded-2xl border border-slate-800/80 bg-gradient-to-b ${p.color} hover:border-amber-400/60 transition-all hover:scale-105 active:scale-95 cursor-pointer text-left backdrop-blur-md group shadow-lg`}
              >
                <div className="text-[10px] font-mono text-amber-400 font-bold group-hover:text-amber-300">
                  {p.time}
                </div>
                <div className="text-xs font-bold text-slate-200 mt-0.5 group-hover:text-white">
                  {p.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
