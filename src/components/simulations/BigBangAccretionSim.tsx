import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Globe,
  Sparkles,
  HelpCircle,
  Gauge,
  PlusCircle,
  Crosshair,
  Flame,
  Award,
  Layers,
  Radio,
  Compass,
  Magnet,
  Clock,
  Droplets,
} from 'lucide-react';
import { useUserLearning } from '../../context/UserLearningContext';
import { soundManager } from '../../services/audioSynthesizer';

type PlanetesimalType = 'silicate' | 'iron' | 'comet';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  type: PlanetesimalType;
  mass: number;
  tail: { x: number; y: number }[];
}

interface Crater {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  color: string;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  width: number;
}

interface MagmaPlume {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface RingDebris {
  angle: number;
  dist: number;
  speed: number;
  radius: number;
  color: string;
  verticalOffset: number;
}

export const BigBangAccretionSim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { recordSimulationInteraction, addXP, triggerConfetti } = useUserLearning();

  const [mode, setMode] = useState<'planetary-accretion' | 'big-bang'>('planetary-accretion');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [gravityStrength, setGravityStrength] = useState<number>(1.3);
  const [debrisDensity, setDebrisDensity] = useState<number>(120);
  const [selectedAmmo, setSelectedAmmo] = useState<PlanetesimalType>('silicate');
  const [showSpacetimeGrid, setShowSpacetimeGrid] = useState<boolean>(true);
  const [cursorGravityActive, setCursorGravityActive] = useState<boolean>(false);

  // Time-travel cooling timeline: 4.54 Ga (Molten Magma) down to 3.8 Ga (Oceans & Crust)
  const [geologicalTimeGa, setGeologicalTimeGa] = useState<number>(4.54);

  const [theiaTriggered, setTheiaTriggered] = useState<boolean>(false);
  const [theiaImpactComplete, setTheiaImpactComplete] = useState<boolean>(false);

  // Gamified readouts
  const [surfaceTemp, setSurfaceTemp] = useState<number>(1520);
  const [planetaryMass, setPlanetaryMass] = useState<number>(0.84);
  const [accretionScore, setAccretionScore] = useState<number>(0);
  const [moonFormed, setMoonFormed] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<number>(0);
  const [slingshotActive, setSlingshotActive] = useState<boolean>(false);
  const [slingshotStart, setSlingshotStart] = useState<{ x: number; y: number } | null>(null);
  const [slingshotCurrent, setSlingshotCurrent] = useState<{ x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const magmaPlumesRef = useRef<MagmaPlume[]>([]);
  const ringDebrisRef = useRef<RingDebris[]>([]);
  const cratersRef = useRef<Crater[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const theiaRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    trail: { x: number; y: number }[];
  } | null>(null);

  const earthRef = useRef<{
    x: number;
    y: number;
    radius: number;
    mass: number;
    angle: number;
    cloudAngle: number;
  }>({
    x: 440,
    y: 220,
    radius: 38,
    mass: 1200,
    angle: 0,
    cloudAngle: 0,
  });

  const moonRef = useRef<{
    angle: number;
    dist: number;
    radius: number;
    speed: number;
    formed: boolean;
  }>({
    angle: 0,
    dist: 185,
    radius: 11,
    speed: 0.016,
    formed: false,
  });

  // Calculate cooling state
  const coolingProgress = Math.max(0, Math.min(1, (4.54 - geologicalTimeGa) / 0.74)); // 0 = 4.54 Ga, 1 = 3.8 Ga
  const effectiveTemp = Math.round(surfaceTemp * (1 - coolingProgress * 0.75));

  // Initialize Planetary Accretion simulation
  const initPlanetarySimulation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    earthRef.current = { x: cx, y: cy, radius: 38, mass: 1200, angle: 0, cloudAngle: 0 };
    theiaRef.current = null;
    shockwavesRef.current = [];
    magmaPlumesRef.current = [];
    ringDebrisRef.current = [];
    cratersRef.current = [];
    moonRef.current = { angle: 0, dist: 185, radius: 11, speed: 0.015, formed: false };

    setTheiaTriggered(false);
    setTheiaImpactComplete(false);
    setMoonFormed(false);
    setPlanetaryMass(0.84);
    setSurfaceTemp(1520);
    setAccretionScore(0);
    setScreenShake(0);
    setGeologicalTimeGa(4.54);

    const newParticles: Particle[] = [];
    for (let i = 0; i < debrisDensity; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 85 + Math.random() * 220;
      const speed = Math.sqrt((gravityStrength * 1150) / dist) * (0.88 + Math.random() * 0.25);
      const vx = -Math.sin(angle) * speed;
      const vy = Math.cos(angle) * speed;

      const pType: PlanetesimalType = Math.random() > 0.7 ? 'iron' : Math.random() > 0.4 ? 'silicate' : 'comet';
      const color = pType === 'iron' ? '#94a3b8' : pType === 'comet' ? '#67e8f9' : '#f59e0b';

      newParticles.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx,
        vy,
        radius: pType === 'iron' ? 2.2 : pType === 'comet' ? 3.5 : 2.6,
        color,
        type: pType,
        mass: pType === 'iron' ? 4 : 2,
        tail: [],
      });
    }
    particlesRef.current = newParticles;
  }, [debrisDensity, gravityStrength]);

  // Initialize Big Bang simulation
  const initBigBangSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    shockwavesRef.current = [
      { x: cx, y: cy, radius: 5, maxRadius: 440, alpha: 1, color: '#38bdf8', width: 4 },
      { x: cx, y: cy, radius: 15, maxRadius: 380, alpha: 1, color: '#f59e0b', width: 3 },
      { x: cx, y: cy, radius: 2, maxRadius: 500, alpha: 1, color: '#ec4899', width: 2 },
    ];
    magmaPlumesRef.current = [];
    ringDebrisRef.current = [];
    cratersRef.current = [];

    const newParticles: Particle[] = [];
    const colors = ['#67e8f9', '#a78bfa', '#fde047', '#f472b6', '#ffffff', '#38bdf8'];

    for (let i = 0; i < 300; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 9;
      newParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.2 + Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'silicate',
        mass: 1,
        tail: [],
      });
    }
    particlesRef.current = newParticles;
    setSurfaceTemp(10000);
  }, []);

  useEffect(() => {
    if (mode === 'planetary-accretion') {
      initPlanetarySimulation();
    } else {
      initBigBangSimulation();
    }
  }, [mode, initPlanetarySimulation, initBigBangSimulation]);

  // Trigger Theia Giant Impact
  const triggerTheiaImpact = () => {
    if (theiaTriggered) return;
    setTheiaTriggered(true);
    soundManager.playMeteorWhoosh();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    theiaRef.current = {
      x: -60,
      y: cy - 180,
      vx: 5.4,
      vy: 2.9,
      radius: 19,
      trail: [],
    };

    recordSimulationInteraction('big-bang', 'theia-collision');
    addXP(85, 'Simulated Theia Giant Collision & Lunar Accretion Ring');
  };

  // Click on planet to directly bombard with meteor
  const handleDirectBombardment = (clickX: number, clickY: number) => {
    soundManager.playSupernova();
    setScreenShake(3);

    shockwavesRef.current.push({
      x: clickX,
      y: clickY,
      radius: 5,
      maxRadius: 70,
      alpha: 1,
      color: '#fef08a',
      width: 4,
    });

    cratersRef.current.push({
      x: clickX,
      y: clickY,
      radius: 6 + Math.random() * 8,
      alpha: 1,
      color: '#450a0a',
    });

    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      magmaPlumesRef.current.push({
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 30,
        size: 2.5,
        color: '#facc15',
      });
    }

    setAccretionScore((prev) => prev + 50);
    addXP(15, 'Meteorite Crater Formed');
  };

  // Mouse interaction: Slingshot vs Direct Bombardment
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'planetary-accretion') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const earth = earthRef.current;
    const distToEarth = Math.hypot(earth.x - x, earth.y - y);

    // If clicked on Earth: direct meteorite strike!
    if (distToEarth <= earth.radius) {
      handleDirectBombardment(x, y);
      return;
    }

    setSlingshotStart({ x, y });
    setSlingshotCurrent({ x, y });
    setSlingshotActive(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (slingshotActive) {
      setSlingshotCurrent({ x, y });
    }
  };

  const handleCanvasMouseUp = () => {
    if (slingshotActive && slingshotStart && slingshotCurrent) {
      const dx = slingshotStart.x - slingshotCurrent.x;
      const dy = slingshotStart.y - slingshotCurrent.y;
      const power = 0.085;

      const color =
        selectedAmmo === 'iron' ? '#94a3b8' : selectedAmmo === 'comet' ? '#67e8f9' : '#f59e0b';

      particlesRef.current.push({
        x: slingshotStart.x,
        y: slingshotStart.y,
        vx: dx * power,
        vy: dy * power,
        radius: selectedAmmo === 'comet' ? 4 : 3,
        color,
        type: selectedAmmo,
        mass: selectedAmmo === 'iron' ? 8 : 4,
        tail: [],
      });

      soundManager.playCursorSpark();
    }
    setSlingshotActive(false);
    setSlingshotStart(null);
    setSlingshotCurrent(null);
  };

  // Main Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localTemp = surfaceTemp;
    let localMass = planetaryMass;
    let localScore = accretionScore;

    const render = () => {
      const cw = canvas.width;
      const ch = canvas.height;
      const cx = cw / 2;
      const cy = ch / 2;

      // 1. Cosmic Deep Space Backdrop with subtle motion trails
      ctx.fillStyle = 'rgba(2, 6, 23, 0.32)';
      ctx.fillRect(0, 0, cw, ch);

      // Distant stars twinkle
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 20; i++) {
        const sx = ((i * 137.5) % cw);
        const sy = ((i * 243.1) % ch);
        const alpha = 0.3 + 0.7 * Math.sin(Date.now() * 0.002 + i);
        ctx.globalAlpha = alpha;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;

      // Screen shake
      if (screenShake > 0) {
        ctx.save();
        const ox = (Math.random() - 0.5) * screenShake * 10;
        const oy = (Math.random() - 0.5) * screenShake * 10;
        ctx.translate(ox, oy);
      }

      // 2. Curvature Spacetime Gravity Grid (General Relativity Visualizer)
      if (showSpacetimeGrid && mode === 'planetary-accretion') {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.lineWidth = 1;
        const earth = earthRef.current;

        const gridSize = 32;
        for (let x = 0; x <= cw; x += gridSize) {
          ctx.beginPath();
          for (let y = 0; y <= ch; y += 10) {
            const dx = x - earth.x;
            const dy = y - earth.y;
            const dist = Math.hypot(dx, dy);
            const warp = Math.max(0, 1600 / (dist + 30));
            const warpedX = x - (dx / dist) * warp * 0.3;
            if (y === 0) ctx.moveTo(warpedX, y);
            else ctx.lineTo(warpedX, y);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      // 3. Render Shockwaves
      for (let s = shockwavesRef.current.length - 1; s >= 0; s--) {
        const sw = shockwavesRef.current[s];
        sw.radius += 6 * simSpeed;
        sw.alpha -= 0.018 * simSpeed;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwavesRef.current.splice(s, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = Math.max(0, sw.alpha);
        ctx.lineWidth = sw.width;
        ctx.shadowBlur = 18;
        ctx.shadowColor = sw.color;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 4. Mode Logic: Big Bang vs Planetary Accretion
      if (mode === 'big-bang') {
        particlesRef.current.forEach((p) => {
          if (isPlaying) {
            p.x += p.vx * simSpeed;
            p.y += p.vy * simSpeed;
            p.vx *= 0.997;
            p.vy *= 0.997;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        const singGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 180);
        singGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        singGrad.addColorStop(0.2, 'rgba(56, 189, 248, 0.35)');
        singGrad.addColorStop(0.6, 'rgba(244, 63, 94, 0.15)');
        singGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = singGrad;
        ctx.fillRect(0, 0, cw, ch);
      } else {
        // Planetary Accretion & Earth Evolution Mode
        const earth = earthRef.current;
        earth.angle += 0.01 * simSpeed;
        earth.cloudAngle += 0.015 * simSpeed;

        // 3D Perspective Roche Debris Ring
        if (ringDebrisRef.current.length > 0) {
          ctx.save();
          ringDebrisRef.current.forEach((r) => {
            if (isPlaying) r.angle += r.speed * simSpeed;

            const rx = earth.x + Math.cos(r.angle) * r.dist;
            const ry = earth.y + Math.sin(r.angle) * (r.dist * 0.38) + r.verticalOffset;

            ctx.beginPath();
            ctx.arc(rx, ry, r.radius, 0, Math.PI * 2);
            ctx.fillStyle = r.color;
            ctx.shadowBlur = 6;
            ctx.shadowColor = r.color;
            ctx.fill();
          });
          ctx.restore();
        }

        // Earth Atmospheric & Magmatic Corona glow
        const coronaRadius = earth.radius * 2.5;
        const earthCorona = ctx.createRadialGradient(
          earth.x - 10,
          earth.y - 10,
          6,
          earth.x,
          earth.y,
          coronaRadius
        );

        if (coolingProgress > 0.6) {
          // Blue Atmosphere of Cooling Ocean Earth (3.8 Ga)
          earthCorona.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
          earthCorona.addColorStop(0.4, 'rgba(14, 116, 144, 0.4)');
          earthCorona.addColorStop(0.8, 'rgba(2, 44, 74, 0.15)');
          earthCorona.addColorStop(1, 'transparent');
        } else {
          // Incandescent Magma Corona (4.54 Ga)
          earthCorona.addColorStop(0, '#fef08a');
          earthCorona.addColorStop(0.35, theiaImpactComplete ? '#f97316' : '#ea580c');
          earthCorona.addColorStop(0.75, theiaImpactComplete ? '#ef4444' : '#991b1b');
          earthCorona.addColorStop(1, 'transparent');
        }

        ctx.save();
        ctx.fillStyle = earthCorona;
        ctx.beginPath();
        ctx.arc(earth.x, earth.y, coronaRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 3D Shaded Planet Sphere
        ctx.save();
        const sphereGrad = ctx.createRadialGradient(
          earth.x - earth.radius * 0.35,
          earth.y - earth.radius * 0.35,
          earth.radius * 0.1,
          earth.x,
          earth.y,
          earth.radius
        );

        if (coolingProgress > 0.6) {
          // Ocean Water World with Granitic Cratons (3.8 Ga)
          sphereGrad.addColorStop(0, '#7dd3fc');
          sphereGrad.addColorStop(0.3, '#0284c7');
          sphereGrad.addColorStop(0.7, '#0369a1');
          sphereGrad.addColorStop(1, '#082f49');
        } else {
          // Molten Magma Ocean (4.54 Ga)
          sphereGrad.addColorStop(0, '#fef08a');
          sphereGrad.addColorStop(0.25, theiaImpactComplete ? '#ea580c' : '#c2410c');
          sphereGrad.addColorStop(0.7, theiaImpactComplete ? '#991b1b' : '#7c2d12');
          sphereGrad.addColorStop(1, '#1c1917');
        }

        ctx.beginPath();
        ctx.arc(earth.x, earth.y, earth.radius, 0, Math.PI * 2);
        ctx.fillStyle = sphereGrad;
        ctx.shadowBlur = theiaImpactComplete ? 40 : 25;
        ctx.shadowColor = coolingProgress > 0.6 ? '#38bdf8' : '#f59e0b';
        ctx.fill();

        // If Cooled: Draw early continental cratons & swirling cloud vortex
        if (coolingProgress > 0.6) {
          ctx.fillStyle = '#065f46';
          // Proto-Continent 1 (Vaalbara / Ur)
          const ca = earth.angle;
          ctx.beginPath();
          ctx.arc(earth.x + Math.cos(ca) * 12, earth.y + Math.sin(ca) * 8, 11, 0, Math.PI * 2);
          ctx.fill();

          // Swirling Cloud Bands
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(earth.x, earth.y, earth.radius * 0.72, earth.cloudAngle, earth.cloudAngle + 1.2);
          ctx.stroke();
        } else {
          // Convective Swirling Magma Currents
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 2;
          for (let i = 0; i < 4; i++) {
            const a = earth.angle + (i * Math.PI) / 2;
            ctx.beginPath();
            ctx.arc(earth.x, earth.y, earth.radius * 0.68, a, a + 0.6);
            ctx.stroke();
          }
        }

        // Render Impact Craters on Surface
        cratersRef.current.forEach((cr) => {
          ctx.fillStyle = cr.color;
          ctx.beginPath();
          ctx.arc(cr.x, cr.y, cr.radius, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();

        // Theia Protoplanet
        if (theiaRef.current && !theiaImpactComplete) {
          const theia = theiaRef.current;
          if (isPlaying) {
            theia.x += theia.vx * simSpeed;
            theia.y += theia.vy * simSpeed;
            theia.trail.unshift({ x: theia.x, y: theia.y });
            if (theia.trail.length > 25) theia.trail.pop();

            const dx = earth.x - theia.x;
            const dy = earth.y - theia.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 260) {
              const grav = (gravityStrength * 1300) / (dist * dist);
              theia.vx += (dx / dist) * grav * 0.08 * simSpeed;
              theia.vy += (dy / dist) * grav * 0.08 * simSpeed;
            }

            if (dist <= earth.radius + theia.radius) {
              setTheiaImpactComplete(true);
              setScreenShake(5);
              soundManager.playSupernova();
              triggerConfetti();

              shockwavesRef.current.push(
                { x: earth.x, y: earth.y, radius: 10, maxRadius: 360, alpha: 1, color: '#fef08a', width: 9 },
                { x: earth.x, y: earth.y, radius: 25, maxRadius: 440, alpha: 0.9, color: '#f97316', width: 6 },
                { x: earth.x, y: earth.y, radius: 40, maxRadius: 520, alpha: 0.8, color: '#ef4444', width: 4 }
              );

              const debris: RingDebris[] = [];
              for (let i = 0; i < 180; i++) {
                debris.push({
                  angle: Math.random() * Math.PI * 2,
                  dist: 70 + Math.random() * 110,
                  speed: 0.012 + Math.random() * 0.018,
                  radius: 1.2 + Math.random() * 2.8,
                  color: Math.random() > 0.4 ? '#fbbf24' : '#ef4444',
                  verticalOffset: (Math.random() - 0.5) * 8,
                });
              }
              ringDebrisRef.current = debris;

              for (let i = 0; i < 70; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2.5 + Math.random() * 8;
                magmaPlumesRef.current.push({
                  x: earth.x,
                  y: earth.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  life: 0,
                  maxLife: 60 + Math.random() * 40,
                  size: 2 + Math.random() * 4.5,
                  color: Math.random() > 0.3 ? '#facc15' : '#ef4444',
                });
              }

              localTemp = 3900;
              localMass = 1.0;
              setSurfaceTemp(3900);
              setPlanetaryMass(1.0);
              setMoonFormed(true);
              moonRef.current.formed = true;
            }
          }

          ctx.beginPath();
          theia.trail.forEach((t, idx) => {
            const alpha = 1 - idx / theia.trail.length;
            ctx.fillStyle = `rgba(249, 115, 22, ${alpha * 0.7})`;
            ctx.fillRect(t.x - 3, t.y - 3, 6, 6);
          });

          ctx.beginPath();
          ctx.arc(theia.x, theia.y, theia.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#f97316';
          ctx.shadowBlur = 25;
          ctx.shadowColor = '#fb923c';
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Accreted Moon in Orbit
        if (moonRef.current.formed) {
          const m = moonRef.current;
          if (isPlaying) m.angle += m.speed * simSpeed;

          const mx = earth.x + Math.cos(m.angle) * m.dist;
          const my = earth.y + Math.sin(m.angle) * (m.dist * 0.42);

          ctx.strokeStyle = 'rgba(251, 191, 36, 0.25)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(earth.x, earth.y, m.dist, m.dist * 0.42, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(mx, my, m.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#cbd5e1';
          ctx.shadowBlur = 16;
          ctx.shadowColor = '#f8fafc';
          ctx.fill();

          ctx.fillStyle = '#fde68a';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('Proto-Moon', mx + 16, my + 3);
        }

        // Render Planetesimals with Dynamic Tails & Cursor Gravity Lens
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];

          if (isPlaying) {
            const dx = earth.x - p.x;
            const dy = earth.y - p.y;
            const dist = Math.hypot(dx, dy);

            // Gravitational attraction from Earth
            const force = (gravityStrength * earth.mass) / Math.max(dist * dist, 500);
            p.vx += (dx / dist) * force * 0.04 * simSpeed;
            p.vy += (dy / dist) * force * 0.04 * simSpeed;

            // Optional Cursor Gravity Well (Interactive Magnetism)
            if (cursorGravityActive && mousePos) {
              const mdx = mousePos.x - p.x;
              const mdy = mousePos.y - p.y;
              const mdist = Math.hypot(mdx, mdy);
              if (mdist < 180 && mdist > 10) {
                p.vx += (mdx / mdist) * 0.4 * simSpeed;
                p.vy += (mdy / mdist) * 0.4 * simSpeed;
              }
            }

            p.x += p.vx * simSpeed;
            p.y += p.vy * simSpeed;

            p.tail.unshift({ x: p.x, y: p.y });
            if (p.tail.length > 7) p.tail.pop();

            // Collision with Earth
            if (dist <= earth.radius + p.radius) {
              localScore += p.type === 'iron' ? 25 : p.type === 'comet' ? 20 : 10;
              localMass = Math.min(1.2, localMass + 0.001);

              setAccretionScore(localScore);
              setPlanetaryMass(parseFloat(localMass.toFixed(3)));

              magmaPlumesRef.current.push({
                x: p.x,
                y: p.y,
                vx: (p.vx + (Math.random() - 0.5) * 3) * 0.6,
                vy: (p.vy + (Math.random() - 0.5) * 3) * 0.6,
                life: 0,
                maxLife: 25,
                size: 3,
                color: p.color,
              });

              particlesRef.current.splice(i, 1);
              continue;
            }
          }

          if (p.tail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            p.tail.forEach((t) => ctx.lineTo(t.x, t.y));
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = p.type === 'comet' ? 0.7 : 0.4;
            ctx.lineWidth = p.type === 'comet' ? p.radius * 1.5 : p.radius * 0.8;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }

        // Draw Interactive Slingshot Aiming Reticle
        if (slingshotActive && slingshotStart && slingshotCurrent) {
          ctx.save();
          const ldx = slingshotStart.x - slingshotCurrent.x;
          const ldy = slingshotStart.y - slingshotCurrent.y;

          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(slingshotStart.x, slingshotStart.y);
          ctx.lineTo(slingshotCurrent.x, slingshotCurrent.y);
          ctx.stroke();

          ctx.strokeStyle = '#f59e0b';
          ctx.setLineDash([]);
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(slingshotStart.x, slingshotStart.y);
          ctx.lineTo(slingshotStart.x + ldx * 1.6, slingshotStart.y + ldy * 1.6);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(slingshotStart.x, slingshotStart.y, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b';
          ctx.fill();
          ctx.restore();
        }
      }

      // Render Magma Plumes
      for (let m = magmaPlumesRef.current.length - 1; m >= 0; m--) {
        const p = magmaPlumesRef.current[m];
        p.life++;
        p.x += p.vx * simSpeed;
        p.y += p.vy * simSpeed;
        p.vx *= 0.985;
        p.vy *= 0.985;

        const progress = p.life / p.maxLife;
        if (progress >= 1) {
          magmaPlumesRef.current.splice(m, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.size * (1 - progress * 0.7)), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 1 - progress;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }

      if (screenShake > 0) {
        ctx.restore();
        setScreenShake((prev) => Math.max(0, prev - 0.15));
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    mode,
    isPlaying,
    simSpeed,
    gravityStrength,
    theiaImpactComplete,
    screenShake,
    slingshotActive,
    slingshotStart,
    slingshotCurrent,
    showSpacetimeGrid,
    cursorGravityActive,
    mousePos,
    coolingProgress,
    surfaceTemp,
    planetaryMass,
    accretionScore,
    triggerConfetti,
  ]);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 md:p-6 shadow-2xl space-y-6">
      {/* Simulation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Zap className="w-4 h-4" />
            </span>
            <h3 className="text-xl font-bold font-display text-slate-100">
              Cosmic Inception, Planetary Accretion & Cooling Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Click Earth to bomb with meteorites, slingshot comets, collide protoplanet Theia, or scrub geological time to watch oceans condense.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setMode('planetary-accretion')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              mode === 'planetary-accretion'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Planetary Accretion & Moon
          </button>
          <button
            onClick={() => setMode('big-bang')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              mode === 'big-bang'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cosmic Singularity (13.8 Ga)
          </button>
        </div>
      </div>

      {/* Main Canvas Stage */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner group">
        <canvas
          ref={canvasRef}
          width={880}
          height={440}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className="w-full h-72 sm:h-96 md:h-[440px] object-cover block cursor-crosshair"
        />

        {/* Top Controls: Planetesimal Ammo + Interactive Tools */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1 bg-slate-950/85 p-1 rounded-xl border border-slate-800 backdrop-blur-md text-xs">
            <span className="text-[10px] text-slate-400 px-2 font-mono uppercase">Ammo:</span>
            {[
              { id: 'silicate', label: 'Silicate Rock', color: 'text-amber-400' },
              { id: 'iron', label: 'Iron Core', color: 'text-slate-300' },
              { id: 'comet', label: 'Ice Comet', color: 'text-sky-400' },
            ].map((ammo) => (
              <button
                key={ammo.id}
                onClick={() => {
                  setSelectedAmmo(ammo.id as PlanetesimalType);
                  soundManager.playHoverBlip();
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  selectedAmmo === ammo.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : `${ammo.color} hover:bg-slate-800`
                }`}
              >
                {ammo.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setCursorGravityActive(!cursorGravityActive);
              soundManager.playHoverBlip();
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-mono transition-all backdrop-blur-md cursor-pointer ${
              cursorGravityActive
                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400'
            }`}
          >
            <Magnet className="w-3.5 h-3.5" />
            <span>Gravity Well: {cursorGravityActive ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Live Accretion HUD Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md text-xs font-mono font-bold text-amber-400 shadow-lg">
            <span>Accretion XP: +{accretionScore}</span>
          </div>
          {moonFormed && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/50 backdrop-blur-md text-[11px] font-mono text-emerald-300 animate-fade-in shadow-lg">
              <Award className="w-3 h-3 text-emerald-400" />
              <span>Roche Debris Ring & Moon Formed</span>
            </div>
          )}
        </div>

        {/* Action Controls Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={() => {
                if (mode === 'planetary-accretion') initPlanetarySimulation();
                else initBigBangSimulation();
                soundManager.playHoverBlip();
              }}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Reset Sandbox"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Sim Speed Toggle */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 backdrop-blur-md">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSimSpeed(s)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    simSpeed === s
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Theia Cataclysm Button */}
          {mode === 'planetary-accretion' && (
            <button
              onClick={triggerTheiaImpact}
              disabled={theiaTriggered}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-xl backdrop-blur-md transition-all pointer-events-auto cursor-pointer ${
                theiaTriggered
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-slate-950 hover:scale-105 active:scale-95'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>{theiaImpactComplete ? 'Theia Accretion Complete' : 'Collide Protoplanet Theia'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Geological Cooling Timeline Scrubber */}
      {mode === 'planetary-accretion' && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 font-bold text-slate-200">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Geological Time & Planetary Cooling Scrubber:</span>
            </span>
            <span className="font-mono font-bold text-amber-400">
              {geologicalTimeGa.toFixed(2)} Billion Years Ago (Ga)
            </span>
          </div>

          <input
            type="range"
            min="3.8"
            max="4.54"
            step="0.02"
            value={geologicalTimeGa}
            onChange={(e) => {
              setGeologicalTimeGa(parseFloat(e.target.value));
              soundManager.playHoverBlip();
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>3.8 Ga (Oceans Condensed & Proto-Continents)</span>
            <span>4.1 Ga (Late Heavy Bombardment)</span>
            <span>4.54 Ga (Molten Magma Ocean)</span>
          </div>
        </div>
      )}

      {/* Planetary Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Effective Surface Temp</span>
            <span className="text-amber-400 font-bold">{effectiveTemp}°C</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 transition-all duration-300"
              style={{ width: `${Math.min(100, (effectiveTemp / 4000) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {effectiveTemp > 1000
              ? 'Incandescent magma ocean & rock vapor atmosphere'
              : 'Liquid hydrosphere & crustal differentiation'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Planetary Mass Target</span>
            <span className="text-emerald-400 font-bold">{planetaryMass} M⊕</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (planetaryMass / 1.0) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {planetaryMass >= 1.0 ? 'Earth mass fully assembled' : 'Accreting planetesimals from disk'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Gravitational Constant (G)</span>
            <span className="font-mono text-amber-400 font-bold">{gravityStrength.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={gravityStrength}
            onChange={(e) => setGravityStrength(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>
    </div>
  );
};
