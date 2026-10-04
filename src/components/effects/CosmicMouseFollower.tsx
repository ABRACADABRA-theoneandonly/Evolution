import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, Globe, Flame, Orbit, Eye, EyeOff, Sliders } from 'lucide-react';
import { soundManager } from '../../services/audioSynthesizer';

type CompanionType = 'earth' | 'meteor' | 'orb';

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  maxLife: number;
  life: number;
}

export const CosmicMouseFollower: React.FC = () => {
  const [companion, setCompanion] = useState<CompanionType>('earth');
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [trailDensity, setTrailDensity] = useState<'high' | 'medium' | 'low'>('high');
  const [isHoveringClickable, setIsHoveringClickable] = useState<boolean>(false);
  const [isClicking, setIsClicking] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Canvas for trailing stardust particles
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<TrailParticle[]>([]);

  // Smooth position tracking
  const mousePos = useRef<{ x: number; y: number }>({ x: -200, y: -200 });
  const currentPos = useRef<{ x: number; y: number }>({ x: -200, y: -200 });
  const velocity = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const followerElRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const companionImages: Record<CompanionType, { src: string; name: string; icon: string; glowColor: string }> = {
    earth: {
      src: '/src/assets/images/celestial_mini_earth_1791063285243.jpg',
      name: 'Terra Gaia',
      icon: '🌍',
      glowColor: 'rgba(56, 189, 248, 0.6)',
    },
    meteor: {
      src: '/src/assets/images/cosmic_fire_meteor_1791063296359.jpg',
      name: 'Chicxulub Comet',
      icon: '☄️',
      glowColor: 'rgba(249, 115, 22, 0.7)',
    },
    orb: {
      src: '/src/assets/images/celestial_earth_orb_1791063235196.jpg',
      name: 'Cosmic Singularity',
      icon: '🪐',
      glowColor: 'rgba(168, 85, 247, 0.65)',
    },
  };

  // Spawn trail particle
  const spawnParticle = useCallback((x: number, y: number, vx: number, vy: number) => {
    if (trailDensity === 'low' && Math.random() > 0.4) return;
    if (trailDensity === 'medium' && Math.random() > 0.7) return;

    let colors = ['#38bdf8', '#818cf8', '#34d399', '#ffffff'];
    if (companion === 'meteor') {
      colors = ['#f97316', '#fbbf24', '#ef4444', '#ffffff'];
    } else if (companion === 'orb') {
      colors = ['#c084fc', '#e879f9', '#60a5fa', '#ffffff'];
    }

    const color = colors[Math.floor(Math.random() * colors.length)];
    const speed = Math.sqrt(vx * vx + vy * vy);
    const angle = Math.atan2(vy, vx) + Math.PI + (Math.random() - 0.5) * 0.8;
    const particleSpeed = 0.5 + Math.random() * (speed * 0.2 + 1);

    particlesRef.current.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: Math.cos(angle) * particleSpeed,
      vy: Math.sin(angle) * particleSpeed,
      size: 1.5 + Math.random() * 3,
      alpha: 0.8 + Math.random() * 0.2,
      color,
      maxLife: 25 + Math.random() * 20,
      life: 0,
    });

    if (particlesRef.current.length > 120) {
      particlesRef.current.shift();
    }
  }, [companion, trailDensity]);

  // Handle click shockwave
  const triggerClickShockwave = useCallback((x: number, y: number) => {
    soundManager.playCursorSpark();
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 200);

    const burstCount = 18;
    for (let i = 0; i < burstCount; i++) {
      const angle = (Math.PI * 2 * i) / burstCount + (Math.random() - 0.5) * 0.2;
      const speed = 2.5 + Math.random() * 3.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3.5,
        alpha: 1,
        color: companion === 'meteor' ? '#fbbf24' : companion === 'orb' ? '#f472b6' : '#67e8f9',
        maxLife: 35 + Math.random() * 15,
        life: 0,
      });
    }
  }, [companion]);

  // Main animation loop
  useEffect(() => {
    if (!isEnabled) return;

    let canvas = canvasRef.current;
    if (!canvas) return;
    let ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      // Lerp follower position
      const lerp = 0.2;
      const dx = mousePos.current.x - currentPos.current.x;
      const dy = mousePos.current.y - currentPos.current.y;

      currentPos.current.x += dx * lerp;
      currentPos.current.y += dy * lerp;
      velocity.current.vx = dx * lerp;
      velocity.current.vy = dy * lerp;

      // Update DOM follower position
      if (followerElRef.current) {
        const speed = Math.sqrt(dx * dx + dy * dy);
        const tiltX = Math.min(Math.max(dx * 0.25, -28), 28);
        const tiltY = Math.min(Math.max(dy * 0.25, -28), 28);
        const scale = isClicking ? 0.85 : isHoveringClickable ? 1.35 : 1.0;

        followerElRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0) translate(-50%, -50%) rotate(${tiltX * 0.8}deg) scale(${scale})`;
      }

      // Draw particle trails on canvas
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Spawn trail when moving
        const speed = Math.sqrt(velocity.current.vx * velocity.current.vx + velocity.current.vy * velocity.current.vy);
        if (speed > 1.2 && isVisible) {
          spawnParticle(
            currentPos.current.x,
            currentPos.current.y,
            velocity.current.vx,
            velocity.current.vy
          );
        }

        // Render & update particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.life++;
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.96;
          p.vy *= 0.96;

          const progress = p.life / p.maxLife;
          const currentAlpha = p.alpha * (1 - progress);

          if (progress >= 1 || currentAlpha <= 0.01) {
            particlesRef.current.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.2, p.size * (1 - progress * 0.6)), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = currentAlpha;
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.restore();
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isEnabled, isClicking, isHoveringClickable, isVisible, spawnParticle]);

  // Window mouse event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      if (!isVisible) setIsVisible(true);

      setCoords({ x: Math.round(e.clientX), y: Math.round(e.clientY) });

      // Check if hovering clickable element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = !!(
          target.closest('button') ||
          target.closest('a') ||
          target.closest('[role="button"]') ||
          target.closest('input') ||
          target.closest('select') ||
          target.closest('.interactive-target') ||
          window.getComputedStyle(target).cursor === 'pointer'
        );
        setIsHoveringClickable(isClickable);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        triggerClickShockwave(e.clientX, e.clientY);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, triggerClickShockwave]);

  if (!isEnabled) {
    return (
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => {
            setIsEnabled(true);
            soundManager.playHoverBlip();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-xs text-slate-400 hover:text-amber-400 backdrop-blur-md transition-all shadow-lg hover:scale-105 cursor-pointer"
          title="Enable Celestial Mouse Follower"
        >
          <Orbit className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Enable Celestial Follower</span>
        </button>
      </div>
    );
  }

  const currentCompanionMeta = companionImages[companion];

  return (
    <>
      {/* Background Trail Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-30"
        style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.3s ease' }}
      />

      {/* Floating Animated Celestial Image Mouse Follower */}
      <div
        ref={followerElRef}
        className={`fixed top-0 left-0 pointer-events-none z-40 transition-opacity duration-300 will-change-transform ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: '52px',
          height: '52px',
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Gravitational Orbital Ring */}
          <div
            className={`absolute inset-0 rounded-full border border-dashed transition-all duration-300 animate-spin ${
              isHoveringClickable
                ? 'border-amber-400 scale-125 opacity-90'
                : 'border-sky-400/40 opacity-60'
            }`}
            style={{
              animationDuration: isHoveringClickable ? '2.5s' : '9s',
              boxShadow: `0 0 16px ${currentCompanionMeta.glowColor}`,
            }}
          />

          {/* Secondary Counter-rotating Reticle Ring */}
          <div
            className="absolute -inset-1.5 rounded-full border border-emerald-400/25 animate-spin"
            style={{
              animationDuration: '14s',
              animationDirection: 'reverse',
            }}
          />

          {/* The Follower Image (Planet / Meteor / Singularity) */}
          <div
            className="relative w-10 h-10 rounded-full overflow-hidden shadow-2xl transition-transform duration-200"
            style={{
              boxShadow: `0 0 20px ${currentCompanionMeta.glowColor}, inset 0 0 8px rgba(255,255,255,0.4)`,
            }}
          >
            <img
              src={currentCompanionMeta.src}
              alt={currentCompanionMeta.name}
              className="w-full h-full object-cover rounded-full filter contrast-125 saturate-125 animate-spin"
              style={{
                animationDuration: companion === 'meteor' ? '4s' : '22s',
              }}
            />

            {/* Glowing Atmosphere Rim overlay */}
            <div
              className="absolute inset-0 rounded-full mix-blend-screen pointer-events-none"
              style={{
                background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5) 0%, transparent 60%)`,
              }}
            />
          </div>

          {/* Shockwave ping on click */}
          {isClicking && (
            <div
              className="absolute inset-0 rounded-full animate-ping pointer-events-none"
              style={{
                backgroundColor: currentCompanionMeta.glowColor,
                opacity: 0.8,
              }}
            />
          )}

          {/* Hover Target Lock HUD Tag */}
          {isHoveringClickable && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[9px] font-mono-tabular font-bold tracking-wider uppercase bg-amber-950/80 border border-amber-500/70 text-amber-300 backdrop-blur-md shadow-md">
              GRAV-LOCK
            </div>
          )}
        </div>
      </div>

      {/* Floating HUD Control Pill at bottom-left */}
      <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2">
        <div className="flex items-center gap-1.5 p-1.5 pl-3 rounded-full bg-slate-950/85 hover:bg-slate-900 border border-slate-800/90 text-slate-300 text-xs shadow-2xl backdrop-blur-md transition-all">
          <div className="flex items-center gap-1.5 pr-2 border-r border-slate-800">
            <span className="text-sm">{currentCompanionMeta.icon}</span>
            <span className="font-mono-tabular text-[11px] text-amber-300 hidden sm:inline font-medium">
              {currentCompanionMeta.name}
            </span>
          </div>

          {/* Quick cycle companion button */}
          <button
            onClick={() => {
              const types: CompanionType[] = ['earth', 'meteor', 'orb'];
              const nextIdx = (types.indexOf(companion) + 1) % types.length;
              setCompanion(types[nextIdx]);
              soundManager.playCursorSpark();
            }}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
            title="Switch Companion: Earth / Meteor / Orb"
          >
            <Orbit className="w-3.5 h-3.5" />
          </button>

          {/* Toggle config menu */}
          <button
            onClick={() => {
              setShowConfig(!showConfig);
              soundManager.playHoverBlip();
            }}
            className={`p-1 rounded-full transition-colors cursor-pointer ${
              showConfig ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Follower Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Disable button */}
          <button
            onClick={() => {
              setIsEnabled(false);
              soundManager.playHoverBlip();
            }}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="Disable Follower"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>

          {/* Coordinates readout on wide screens */}
          <span className="font-mono-tabular text-[10px] text-slate-500 pl-2 hidden md:inline border-l border-slate-800">
            {coords.x},{coords.y}px
          </span>
        </div>

        {/* Expanded Popover Configuration Tray */}
        {showConfig && (
          <div className="absolute bottom-12 left-0 w-72 rounded-2xl bg-slate-900/95 border border-slate-700/80 p-3.5 shadow-2xl backdrop-blur-xl animate-fade-in text-xs text-slate-200 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Celestial Follower Settings</span>
              </div>
              <button
                onClick={() => setShowConfig(false)}
                className="text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Companion Selection */}
            <div>
              <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Celestial Companion Avatar:</div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['earth', 'meteor', 'orb'] as CompanionType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setCompanion(t);
                      soundManager.playCursorSpark();
                    }}
                    className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      companion === t
                        ? 'border-amber-500/80 bg-amber-500/15 text-amber-200'
                        : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-base mb-1">{companionImages[t].icon}</span>
                    <span className="text-[10px] font-medium truncate w-full">{companionImages[t].name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trail Intensity */}
            <div>
              <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Stardust Trail Density:</div>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(['high', 'medium', 'low'] as const).map((density) => (
                  <button
                    key={density}
                    onClick={() => {
                      setTrailDensity(density);
                      soundManager.playHoverBlip();
                    }}
                    className={`py-1 rounded text-[10px] font-medium capitalize transition-all cursor-pointer ${
                      trailDensity === density
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {density}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-800">
              💡 Tip: Click anywhere to release cosmic shockwave starbursts!
            </div>
          </div>
        )}
      </div>
    </>
  );
};
