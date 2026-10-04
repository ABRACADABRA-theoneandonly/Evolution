import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  RotateCcw,
  Flame,
  ShieldAlert,
  Skull,
  Zap,
  HelpCircle,
  Sparkles,
  Layers,
  Thermometer,
  ShieldCheck,
  Pickaxe,
  Nut,
  DoorClosed,
  Award,
  Activity,
  Compass,
  Volume2,
  Eye,
  Wind,
  Sun,
  Moon,
} from 'lucide-react';
import { useUserLearning } from '../../context/UserLearningContext';
import { soundManager } from '../../services/audioSynthesizer';

type DinosaurSpecies = 'trex' | 'sauropod' | 'triceratops' | 'pterosaur';

interface DebrisParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
}

interface Cloud {
  x: number;
  y: number;
  speed: number;
  scale: number;
  alpha: number;
}

export const DinosaurAsteroidImpactSim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { recordSimulationInteraction, addXP, triggerConfetti } = useUserLearning();

  // Active dinosaur in the living Mesozoic ecosystem
  const [selectedDino, setSelectedDino] = useState<DinosaurSpecies>('trex');
  const [dinoAction, setDinoAction] = useState<'walk' | 'run' | 'roar' | 'graze'>('walk');
  const [isRoaring, setIsRoaring] = useState<boolean>(false);
  const [weatherTime, setWeatherTime] = useState<'day' | 'sunset' | 'night'>('sunset');

  // Asteroid & Extinction Physics
  const [diameterKm, setDiameterKm] = useState<number>(12);
  const [velocityKms, setVelocityKms] = useState<number>(20);
  const [impactAngle, setImpactAngle] = useState<number>(60);
  const [burrowDepthMeters, setBurrowDepthMeters] = useState<number>(1.8);
  const [seedsStored, setSeedsStored] = useState<number>(4);
  const [burrowSealed, setBurrowSealed] = useState<boolean>(false);

  const [isImpacting, setIsImpacting] = useState<boolean>(false);
  const [impactCompleted, setImpactCompleted] = useState<boolean>(false);
  const [impactPhase, setImpactPhase] = useState<'calm' | 'atmospheric-entry' | 'fireball-blast' | 'nuclear-winter'>('calm');
  const [screenShake, setScreenShake] = useState<number>(0);

  // Computed physics
  const radiusMeters = (diameterKm * 1000) / 2;
  const volumeM3 = (4 / 3) * Math.PI * Math.pow(radiusMeters, 3);
  const massKg = volumeM3 * 2650;
  const velocityMs = velocityKms * 1000;
  const energyJoules = 0.5 * massKg * Math.pow(velocityMs, 2);
  const craterDiameterKm = Math.round(1.17 * Math.pow(energyJoules / 1e12, 0.29));

  // Thermal physics
  const surfaceTempC = impactCompleted ? 1280 : weatherTime === 'day' ? 32 : 24;
  const thermalDamping = Math.exp(-burrowDepthMeters * 2.85);
  const subterraneanTempC = impactCompleted
    ? Math.round(22 + (surfaceTempC - 22) * thermalDamping * (burrowSealed ? 0.42 : 1))
    : 22;

  // Mammal survival calculus
  const tempSurvival = Math.max(0, 100 - Math.max(0, subterraneanTempC - 35) * 4);
  const foodSurvival = Math.min(100, seedsStored * 18);
  const airQuality = burrowSealed ? 90 : impactCompleted ? 15 : 98;
  const mammalSurvivalRate = Math.round(
    tempSurvival * 0.45 + foodSurvival * 0.35 + (burrowSealed ? 20 : 5)
  );

  // Particle systems & animation references
  const debrisRef = useRef<DebrisParticle[]>([]);
  const dustRef = useRef<DustParticle[]>([]);
  const cloudsRef = useRef<Cloud[]>([
    { x: 50, y: 40, speed: 0.2, scale: 1.2, alpha: 0.4 },
    { x: 320, y: 70, speed: 0.15, scale: 0.9, alpha: 0.35 },
    { x: 620, y: 35, speed: 0.25, scale: 1.4, alpha: 0.45 },
  ]);
  const bolidePosRef = useRef<{ x: number; y: number; trail: { x: number; y: number }[] }>({
    x: -80,
    y: -80,
    trail: [],
  });
  const walkCycleRef = useRef<number>(0);
  const dinoXRef = useRef<number>(240);
  const animFrameRef = useRef<number | null>(null);

  // Trigger Tyrannosaurus Roar
  const handleTriggerRoar = () => {
    soundManager.playDinosaurRoar();
    setIsRoaring(true);
    setDinoAction('roar');
    setScreenShake(6);
    addXP(30, 'Tyrannosaurus Alpha Territorial Roar');

    setTimeout(() => {
      setIsRoaring(false);
      setDinoAction('walk');
    }, 1400);
  };

  // Trigger Asteroid Bolide Cataclysm
  const triggerImpact = useCallback(() => {
    setIsImpacting(true);
    setImpactCompleted(false);
    setImpactPhase('atmospheric-entry');
    setScreenShake(5);
    debrisRef.current = [];
    bolidePosRef.current = { x: 780, y: -40, trail: [] };
    soundManager.playMeteorWhoosh();
    recordSimulationInteraction('dinosaurs', 'chicxulub-impact');
    addXP(85, 'Chicxulub Bolide Impact Simulated');

    setTimeout(() => {
      setImpactPhase('fireball-blast');
      soundManager.playSupernova();
      setScreenShake(14);
      triggerConfetti();
    }, 1300);

    setTimeout(() => {
      setIsImpacting(false);
      setImpactCompleted(true);
      setImpactPhase('nuclear-winter');
      setScreenShake(0);
    }, 3000);
  }, [recordSimulationInteraction, addXP, triggerConfetti]);

  const resetSim = () => {
    setIsImpacting(false);
    setImpactCompleted(false);
    setImpactPhase('calm');
    setScreenShake(0);
    debrisRef.current = [];
    dustRef.current = [];
    bolidePosRef.current = { x: -80, y: -80, trail: [] };
  };

  const handleDigDeeper = () => {
    soundManager.playCursorSpark();
    setBurrowDepthMeters((prev) => Math.min(3.5, parseFloat((prev + 0.3).toFixed(1))));
    addXP(15, 'Excavated Subterranean Mammal Burrow');
  };

  const handleHoardSeeds = () => {
    soundManager.playHoverBlip();
    setSeedsStored((prev) => Math.min(6, prev + 1));
    addXP(10, 'Hoarded Mesozoic Seeds & Tubers');
  };

  const handleToggleSeal = () => {
    soundManager.playHoverBlip();
    setBurrowSealed(!burrowSealed);
  };

  // Main Canvas Rendering Loop with Procedural Dinosaurs & Environment (NO CREATURE PHOTO)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const cw = (canvas.width = 880);
      const ch = (canvas.height = 420);
      const groundY = ch * 0.72; // Horizon line for Mesozoic ground

      // Clear & Screen Shake
      ctx.clearRect(0, 0, cw, ch);
      ctx.save();
      if (screenShake > 0) {
        ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
        setScreenShake((prev) => Math.max(0, prev - 0.25));
      }

      // ==========================================
      // 1. PROCEDURAL MESOZOIC ENVIRONMENT BACKGROUND
      // (Pure generative landscape - NO creature pictures)
      // ==========================================

      // A. Sky Gradient based on Time & Impact Phase
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      if (impactPhase === 'fireball-blast') {
        skyGrad.addColorStop(0, '#fef08a');
        skyGrad.addColorStop(0.3, '#f97316');
        skyGrad.addColorStop(0.7, '#ef4444');
        skyGrad.addColorStop(1, '#7f1d1d');
      } else if (impactPhase === 'nuclear-winter') {
        skyGrad.addColorStop(0, '#0f172a');
        skyGrad.addColorStop(0.4, '#1e293b');
        skyGrad.addColorStop(0.8, '#334155');
        skyGrad.addColorStop(1, '#1c1917');
      } else if (weatherTime === 'sunset') {
        skyGrad.addColorStop(0, '#312e81');
        skyGrad.addColorStop(0.35, '#7c2d12');
        skyGrad.addColorStop(0.7, '#ea580c');
        skyGrad.addColorStop(1, '#fde047');
      } else if (weatherTime === 'night') {
        skyGrad.addColorStop(0, '#030712');
        skyGrad.addColorStop(0.6, '#0f172a');
        skyGrad.addColorStop(1, '#1e1b4b');
      } else {
        skyGrad.addColorStop(0, '#0284c7');
        skyGrad.addColorStop(0.5, '#38bdf8');
        skyGrad.addColorStop(0.85, '#bae6fd');
        skyGrad.addColorStop(1, '#fed7aa');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, cw, groundY);

      // Distant Celestial Sun / Moon
      if (impactPhase === 'calm') {
        if (weatherTime === 'day' || weatherTime === 'sunset') {
          const sunX = weatherTime === 'sunset' ? cw * 0.8 : cw * 0.3;
          const sunY = weatherTime === 'sunset' ? groundY - 45 : 70;
          const sunGrad = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 65);
          sunGrad.addColorStop(0, weatherTime === 'sunset' ? '#fef08a' : '#ffffff');
          sunGrad.addColorStop(0.3, weatherTime === 'sunset' ? 'rgba(251,146,60,0.6)' : 'rgba(253,224,71,0.4)');
          sunGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = sunGrad;
          ctx.beginPath();
          ctx.arc(sunX, sunY, 65, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Night stars
          ctx.fillStyle = '#ffffff';
          for (let i = 0; i < 24; i++) {
            const sx = (i * 97) % cw;
            const sy = (i * 47) % (groundY - 50);
            ctx.globalAlpha = 0.4 + 0.5 * Math.sin(Date.now() * 0.003 + i);
            ctx.fillRect(sx, sy, 1.5, 1.5);
          }
          ctx.globalAlpha = 1;
        }
      }

      // Moving atmospheric clouds
      cloudsRef.current.forEach((c) => {
        c.x += c.speed;
        if (c.x > cw + 100) c.x = -120;
        ctx.fillStyle = `rgba(255, 255, 255, ${impactPhase === 'nuclear-winter' ? 0.15 : c.alpha})`;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 25 * c.scale, 0, Math.PI * 2);
        ctx.arc(c.x + 20 * c.scale, c.y - 8 * c.scale, 30 * c.scale, 0, Math.PI * 2);
        ctx.arc(c.x + 45 * c.scale, c.y, 22 * c.scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // B. Distant Mesozoic Volcanoes with Plumes
      ctx.fillStyle = impactPhase === 'nuclear-winter' ? '#1c1917' : weatherTime === 'night' ? '#0f172a' : '#451a03';
      // Volcano 1
      ctx.beginPath();
      ctx.moveTo(cw * 0.62, groundY);
      ctx.lineTo(cw * 0.72, groundY - 110);
      ctx.lineTo(cw * 0.75, groundY - 110);
      ctx.lineTo(cw * 0.85, groundY);
      ctx.closePath();
      ctx.fill();

      // Glowing Crater Caldron
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.ellipse(cw * 0.735, groundY - 110, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rising Volcanic Smoke Plume
      const time = Date.now() * 0.001;
      ctx.fillStyle = 'rgba(78, 60, 52, 0.4)';
      for (let p = 0; p < 4; p++) {
        const py = groundY - 120 - p * 22;
        const px = cw * 0.735 + Math.sin(time + p) * 12 + p * 8;
        ctx.beginPath();
        ctx.arc(px, py, 14 + p * 7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Distant mountain ridge 2
      ctx.fillStyle = impactPhase === 'nuclear-winter' ? '#292524' : weatherTime === 'night' ? '#1e293b' : '#57301c';
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(cw * 0.18, groundY - 75);
      ctx.lineTo(cw * 0.35, groundY - 45);
      ctx.lineTo(cw * 0.52, groundY - 80);
      ctx.lineTo(cw * 0.65, groundY);
      ctx.closePath();
      ctx.fill();

      // C. Prehistoric Flora (Conifers, Cycads & Giant Ferns)
      const drawFern = (x: number, y: number, height: number, sway: number) => {
        ctx.strokeStyle = impactPhase === 'nuclear-winter' ? '#44403c' : '#15803d';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + sway, y - height * 0.6, x + sway * 1.5, y - height);
        ctx.stroke();

        // Fern fronds
        for (let i = 1; i <= 5; i++) {
          const fy = y - (height * i) / 6;
          const fx = x + (sway * i) / 6;
          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.lineTo(fx - 14, fy - 6);
          ctx.moveTo(fx, fy);
          ctx.lineTo(fx + 14, fy - 6);
          ctx.stroke();
        }
      };

      // Swaying ferns in the breeze
      const windSway = Math.sin(time * 3) * 6;
      drawFern(cw * 0.08, groundY, 45, windSway);
      drawFern(cw * 0.14, groundY, 55, windSway * 1.2);
      drawFern(cw * 0.88, groundY, 50, -windSway);
      drawFern(cw * 0.94, groundY, 65, -windSway * 1.1);

      // Prehistoric Conifer Tree
      const drawConifer = (tx: number, ty: number, th: number) => {
        ctx.fillStyle = '#451a03';
        ctx.fillRect(tx - 3, ty - th * 0.35, 6, th * 0.35); // Trunk
        ctx.fillStyle = impactPhase === 'nuclear-winter' ? '#292524' : '#14532d';
        for (let tier = 0; tier < 3; tier++) {
          const tierY = ty - th * 0.3 - tier * (th * 0.22);
          const w = 32 - tier * 8;
          ctx.beginPath();
          ctx.moveTo(tx, tierY - 20);
          ctx.lineTo(tx - w, tierY);
          ctx.lineTo(tx + w, tierY);
          ctx.closePath();
          ctx.fill();
        }
      };
      drawConifer(cw * 0.22, groundY, 85);
      drawConifer(cw * 0.78, groundY, 105);

      // D. Ground Plain (Cretaceous Floodplain Sediment)
      const groundGrad = ctx.createLinearGradient(0, groundY, 0, ch);
      if (impactPhase === 'fireball-blast') {
        groundGrad.addColorStop(0, '#ea580c');
        groundGrad.addColorStop(1, '#7c2d12');
      } else if (impactPhase === 'nuclear-winter') {
        groundGrad.addColorStop(0, '#292524');
        groundGrad.addColorStop(1, '#0c0a09');
      } else {
        groundGrad.addColorStop(0, '#166534');
        groundGrad.addColorStop(0.12, '#3f6212');
        groundGrad.addColorStop(0.3, '#78350f');
        groundGrad.addColorStop(1, '#451a03');
      }
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundY, cw, ch - groundY);

      // ==========================================
      // 2. DETAILED ANIMATED LIVING DINOSAURS
      // (Procedural Kinematics - NO PICTURE OF CREATURE)
      // ==========================================

      // Advance walk cycle
      const animSpeed = dinoAction === 'run' ? 0.14 : isRoaring ? 0.03 : 0.06;
      walkCycleRef.current += animSpeed;
      const cycle = walkCycleRef.current;

      // Move dinosaur slightly back and forth
      if (dinoAction === 'run') {
        dinoXRef.current = 180 + Math.sin(cycle * 0.5) * 120;
      } else if (dinoAction === 'walk') {
        dinoXRef.current = 240 + Math.sin(cycle * 0.3) * 60;
      }
      const dx = dinoXRef.current;
      const dy = groundY - 8;

      // Footstep dust emissions
      if (Math.sin(cycle) > 0.92) {
        dustRef.current.push({
          x: dx - 20 + (Math.random() - 0.5) * 10,
          y: groundY - 2,
          vx: -1 - Math.random() * 2,
          vy: -0.5 - Math.random(),
          radius: 2 + Math.random() * 3,
          alpha: 0.6,
          life: 0,
        });
      }

      // Render dust
      for (let i = dustRef.current.length - 1; i >= 0; i--) {
        const d = dustRef.current[i];
        d.x += d.vx;
        d.y += d.vy;
        d.alpha -= 0.03;
        if (d.alpha <= 0) {
          dustRef.current.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `rgba(180, 140, 100, ${d.alpha})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // A. TYRANNOSAURUS REX (Procedural articulated theropod)
      if (selectedDino === 'trex') {
        const legPhaseL = Math.sin(cycle);
        const legPhaseR = Math.sin(cycle + Math.PI);
        const hipBob = Math.abs(Math.sin(cycle)) * 5;
        const roarAngle = isRoaring ? -0.35 : 0;
        const tailWag = Math.sin(cycle * 0.8) * 8;

        ctx.save();
        ctx.translate(dx, dy - hipBob);

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, hipBob + 8, 55, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // 1. Left Hind Leg (Back layer)
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-10, -35); // Hip
        ctx.lineTo(-10 + legPhaseL * 18, -12); // Knee
        ctx.lineTo(-8 + legPhaseL * 24, 6); // Claw
        ctx.stroke();

        // 2. Muscular Segmented Tail
        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(-25, -42);
        ctx.quadraticCurveTo(-65 + tailWag, -50 + tailWag * 0.5, -115, -45 - tailWag);
        ctx.stroke();

        // Tail tip
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-115, -45 - tailWag);
        ctx.lineTo(-145, -48 - tailWag * 1.4);
        ctx.stroke();

        // 3. Torso / Ribcage
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(-10, -48, 42, 24, -0.15, 0, Math.PI * 2);
        ctx.fill();

        // Dorsal ridges / scutes pattern
        ctx.fillStyle = '#14532d';
        for (let s = 0; s < 6; s++) {
          ctx.beginPath();
          ctx.arc(-35 + s * 10, -66 + s * 1.5, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // 4. Right Hind Leg (Front layer)
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 11;
        ctx.beginPath();
        ctx.moveTo(-5, -35); // Hip
        ctx.lineTo(-5 + legPhaseR * 18, -12); // Knee
        ctx.lineTo(-3 + legPhaseR * 24, 6); // Claw
        ctx.stroke();

        // Three sharp claws
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-3 + legPhaseR * 24 + 4, 7, 3, 0, Math.PI * 2);
        ctx.fill();

        // 5. Vestigial 2-Clawed Forearms
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(14, -40);
        ctx.lineTo(24, -30);
        ctx.lineTo(28, -26);
        ctx.stroke();

        // 6. Muscular Neck & Massive Cranium
        ctx.save();
        ctx.translate(22, -54);
        ctx.rotate(roarAngle);

        // Neck
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.ellipse(8, -12, 16, 12, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Cranium Upper Jaw
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(10, -18);
        ctx.lineTo(44, -14);
        ctx.lineTo(48, -4);
        ctx.lineTo(24, -2);
        ctx.lineTo(12, -8);
        ctx.closePath();
        ctx.fill();

        // Eye Orbit & Blinking Eye
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(22, -12, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(22, -12, 1.8, 0, Math.PI * 2); // Slit pupil
        ctx.fill();

        // Sharp Serrated Ziphodont Teeth
        ctx.fillStyle = '#ffffff';
        for (let t = 0; t < 5; t++) {
          ctx.beginPath();
          ctx.moveTo(25 + t * 4.5, -2);
          ctx.lineTo(27 + t * 4.5, 4);
          ctx.lineTo(29 + t * 4.5, -2);
          ctx.fill();
        }

        // Articulated Lower Jaw (Opens during roar!)
        const jawOpen = isRoaring ? 0.45 : 0.08;
        ctx.save();
        ctx.translate(14, -2);
        ctx.rotate(jawOpen);
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(32, 2);
        ctx.lineTo(30, 7);
        ctx.lineTo(0, 4);
        ctx.closePath();
        ctx.fill();

        // Lower teeth
        ctx.fillStyle = '#ffffff';
        for (let t = 0; t < 4; t++) {
          ctx.beginPath();
          ctx.moveTo(8 + t * 5, 0);
          ctx.lineTo(10 + t * 5, -4);
          ctx.lineTo(12 + t * 5, 0);
          ctx.fill();
        }
        ctx.restore();

        // Roar acoustic shockwave rings
        if (isRoaring) {
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2.5;
          for (let r = 1; r <= 3; r++) {
            ctx.beginPath();
            ctx.arc(42, -4, r * 14, -0.5, 0.5);
            ctx.stroke();
          }
        }

        ctx.restore();
        ctx.restore();
      }

      // B. BRACHIOSAURUS (Procedural giant sauropod)
      else if (selectedDino === 'sauropod') {
        const legPhaseL = Math.sin(cycle);
        const legPhaseR = Math.sin(cycle + Math.PI);
        const grazeSway = dinoAction === 'graze' ? 0.35 : 0;

        ctx.save();
        ctx.translate(dx, dy);

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 4, 85, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Massive Columnar Legs (Back Pair)
        ctx.fillStyle = '#475569';
        ctx.fillRect(-45, -35, 14, 38);
        ctx.fillRect(25, -45, 15, 48);

        // Long Whiplash Tail
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(-50, -45);
        ctx.quadraticCurveTo(-110, -40, -170, -15);
        ctx.stroke();

        // Heavy Barrel Body
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.ellipse(-10, -55, 58, 32, -0.15, 0, Math.PI * 2);
        ctx.fill();

        // Columnar Legs (Front Pair)
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-35 + legPhaseL * 8, -35, 15, 38);
        ctx.fillRect(35 + legPhaseR * 8, -45, 16, 48);

        // Ultra-Long Sweeping Neck & Head
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 16;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(35, -60);
        ctx.bezierCurveTo(70, -110 - grazeSway * 50, 75, -160 + grazeSway * 80, 85, -190 + grazeSway * 110);
        ctx.stroke();

        // Small Crested Head
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.ellipse(88, -192 + grazeSway * 110, 14, 9, -0.2 + grazeSway, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(92, -194 + grazeSway * 110, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // C. TRICERATOPS (Procedural horned ceratopsian)
      else if (selectedDino === 'triceratops') {
        const legPhase = Math.sin(cycle) * 8;

        ctx.save();
        ctx.translate(dx, dy);

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 4, 65, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sturdy Legs
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-35 + legPhase, -28, 12, 30);
        ctx.fillRect(20 - legPhase, -28, 12, 30);

        // Tail
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 11;
        ctx.beginPath();
        ctx.moveTo(-45, -35);
        ctx.quadraticCurveTo(-75, -30, -95, -15);
        ctx.stroke();

        // Barrel Body with Scutes
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(-10, -38, 48, 25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Large Flared Neck Frill Shield
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.ellipse(28, -50, 24, 30, 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Frill Epoccipital Spikes
        ctx.fillStyle = '#fef3c7';
        for (let i = 0; i < 5; i++) {
          const fa = -0.6 + i * 0.3;
          ctx.beginPath();
          ctx.arc(28 + Math.cos(fa) * 22, -50 + Math.sin(fa) * 26, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Head with Beak
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(42, -36, 18, 14, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Three Long Sharp Horns
        ctx.strokeStyle = '#fef3c7';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(34, -46); // Brow Horn 1
        ctx.lineTo(58, -62);
        ctx.moveTo(40, -42); // Brow Horn 2
        ctx.lineTo(64, -58);
        ctx.moveTo(56, -34); // Nasal Horn
        ctx.lineTo(68, -40);
        ctx.stroke();

        // Beak
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(54, -30);
        ctx.lineTo(62, -26);
        ctx.lineTo(52, -22);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // D. PTEROSAUR (Soaring Cretaceous flying reptile)
      else if (selectedDino === 'pterosaur') {
        const wingFlap = Math.sin(cycle * 1.5) * 28;
        const flightX = 220 + Math.sin(cycle * 0.4) * 160;
        const flightY = 90 + Math.sin(cycle * 0.8) * 25;

        ctx.save();
        ctx.translate(flightX, flightY);

        // Body & Head with Long Cranial Crest
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Backward Swept Cranial Crest
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(-6, -2);
        ctx.lineTo(-32, -14);
        ctx.lineTo(-8, 2);
        ctx.closePath();
        ctx.fill();

        // Sharp Toothless Beak
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(12, -2);
        ctx.lineTo(38, 0);
        ctx.lineTo(12, 3);
        ctx.closePath();
        ctx.fill();

        // Articulated Flying Wings (Membrane & Wing Finger)
        ctx.strokeStyle = '#c2410c';
        ctx.fillStyle = 'rgba(251, 146, 60, 0.7)';
        ctx.lineWidth = 3;

        // Left Wing
        ctx.beginPath();
        ctx.moveTo(-4, -2);
        ctx.quadraticCurveTo(25, -35 - wingFlap, 65, -20 - wingFlap * 1.3);
        ctx.lineTo(10, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right Wing
        ctx.beginPath();
        ctx.moveTo(-4, 2);
        ctx.quadraticCurveTo(25, 35 + wingFlap, 65, 20 + wingFlap * 1.3);
        ctx.lineTo(10, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }

      // ==========================================
      // 3. CHICXULUB BOLIDE & SHOCKWAVE SYSTEM
      // ==========================================
      if (isImpacting || impactPhase === 'atmospheric-entry' || impactPhase === 'fireball-blast') {
        const bolide = bolidePosRef.current;
        bolide.x -= 7;
        bolide.y += 4;
        bolide.trail.unshift({ x: bolide.x, y: bolide.y });
        if (bolide.trail.length > 25) bolide.trail.pop();

        // Hypersonic Fireball Plasma Trail
        ctx.save();
        ctx.beginPath();
        bolide.trail.forEach((t, idx) => {
          const alpha = 1 - idx / bolide.trail.length;
          ctx.fillStyle = `rgba(249, 115, 22, ${alpha * 0.8})`;
          ctx.fillRect(t.x, t.y, (1 - idx / 25) * 16, (1 - idx / 25) * 16);
        });

        // Blazing 10km Bolide Sphere
        const bolideGrad = ctx.createRadialGradient(bolide.x, bolide.y, 2, bolide.x, bolide.y, 28);
        bolideGrad.addColorStop(0, '#ffffff');
        bolideGrad.addColorStop(0.3, '#fef08a');
        bolideGrad.addColorStop(0.7, '#f97316');
        bolideGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = bolideGrad;
        ctx.beginPath();
        ctx.arc(bolide.x, bolide.y, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Supersonic Fireball Blast Flash Overlay
      if (impactPhase === 'fireball-blast') {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
        ctx.fillRect(0, 0, cw, groundY);
      }

      // Post-Impact Nuclear Winter Ash Fog
      if (impactPhase === 'nuclear-winter') {
        ctx.fillStyle = 'rgba(12, 10, 9, 0.65)';
        ctx.fillRect(0, 0, cw, groundY);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [selectedDino, dinoAction, isRoaring, weatherTime, impactPhase, screenShake]);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 md:p-6 shadow-2xl space-y-6">
      {/* Simulation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Skull className="w-4 h-4" />
            </span>
            <h3 className="text-xl font-bold font-display text-slate-100">
              Living Mesozoic Ecosystem & Chicxulub Asteroid Simulation
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Interact with living procedural dinosaurs in their native Cretaceous habitat, trigger territorial roars and hunts, and witness the catastrophic 10km bolide extinction impact.
          </p>
        </div>

        {/* Survival Grade Score */}
        <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Mammalian Survival</div>
            <div
              className={`text-lg font-bold font-mono ${
                mammalSurvivalRate > 70
                  ? 'text-emerald-400'
                  : mammalSurvivalRate > 40
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {mammalSurvivalRate}% ({mammalSurvivalRate > 70 ? 'High' : mammalSurvivalRate > 40 ? 'Marginal' : 'Extinction'})
            </div>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Dinosaur Species Selector & Ecosystem Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
        {/* Choose Dinosaur */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-400 uppercase mr-1">Active Dinosaur:</span>
          {[
            { id: 'trex', label: '🦖 T-Rex (Theropod)' },
            { id: 'sauropod', label: '🦕 Brachiosaurus' },
            { id: 'triceratops', label: '🦏 Triceratops' },
            { id: 'pterosaur', label: '🦅 Pteranodon' },
          ].map((dino) => (
            <button
              key={dino.id}
              onClick={() => {
                setSelectedDino(dino.id as DinosaurSpecies);
                soundManager.playHoverBlip();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedDino === dino.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {dino.label}
            </button>
          ))}
        </div>

        {/* Dinosaur Behaviors */}
        <div className="flex items-center gap-2">
          {selectedDino === 'trex' && (
            <button
              onClick={handleTriggerRoar}
              disabled={isRoaring}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isRoaring ? 'Roaring...' : 'Territorial Roar'}</span>
            </button>
          )}

          <button
            onClick={() => {
              setDinoAction(dinoAction === 'run' ? 'walk' : 'run');
              soundManager.playHoverBlip();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              dinoAction === 'run'
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {dinoAction === 'run' ? 'Running / Hunting' : 'Pacing Gait'}
          </button>

          {/* Time of Day */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['day', 'sunset', 'night'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setWeatherTime(t);
                  soundManager.playHoverBlip();
                }}
                className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  weatherTime === t ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title={`Switch to ${t}`}
              >
                {t === 'day' ? <Sun className="w-3.5 h-3.5" /> : t === 'sunset' ? <Flame className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Procedural Animation Stage (NO CREATURE PHOTO) */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={880}
          height={420}
          className="w-full h-72 sm:h-96 md:h-[420px] object-cover block cursor-pointer"
          onClick={() => {
            if (selectedDino === 'trex') handleTriggerRoar();
            else soundManager.playMusicalNote(3);
          }}
        />

        {/* Telemetry HUD */}
        <div className="absolute top-4 left-4 bg-slate-950/85 border border-slate-800 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-mono text-slate-300 pointer-events-none shadow-lg">
          <span className="text-emerald-400 font-bold uppercase">HABITAT:</span> Late Cretaceous Hell Creek (66 Ma) · Active Flora: Conifers & Giant Ferns
        </div>

        {/* Thermal HUD */}
        <div className="absolute top-4 right-4 bg-slate-950/85 border border-slate-800 backdrop-blur-md p-3 rounded-2xl shadow-xl max-w-xs pointer-events-none">
          <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-rose-400" />
            <span>Thermal Pulse Readout</span>
          </div>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Surface Temp:</span>
              <span className="text-rose-400 font-bold">{surfaceTempC}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Excavated Crater:</span>
              <span className="text-amber-400 font-bold">{craterDiameterKm} km</span>
            </div>
          </div>
        </div>

        {/* Asteroid Trigger Controls Overlay */}
        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          <button
            onClick={triggerImpact}
            disabled={isImpacting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Flame className="w-4 h-4" />
            <span>{isImpacting ? 'Bolide Entering Atmosphere...' : 'Launch Chicxulub Bolide (66 Ma)'}</span>
          </button>

          <button
            onClick={resetSim}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer shadow-lg"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subterranean Mammalian Stratigraphy Cross-Section */}
      <div className="rounded-3xl border border-stone-800 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-200 uppercase tracking-wide">
              Subterranean Mammal Burrow & Geological Stratigraphy
            </span>
          </div>
          <span className="text-slate-400">
            Depth: <span className="text-amber-400 font-bold">{burrowDepthMeters}m</span>
          </span>
        </div>

        {/* Stratigraphic Layers Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-3 rounded-xl border border-stone-700 bg-stone-800/60">
            <div className="text-amber-400 font-bold text-[11px]">0.0m – 0.5m: Topsoil</div>
            <div className="text-slate-400 text-[10px] mt-0.5">Charred Organic Soil & Wildfires</div>
          </div>
          <div className="p-3 rounded-xl border border-stone-700 bg-stone-800/80">
            <div className="text-slate-300 font-bold text-[11px]">0.5m – 1.5m: Cretaceous Limestone</div>
            <div className="text-slate-400 text-[10px] mt-0.5">Carbonate Shells & Silt Matrix</div>
          </div>
          <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-950/20">
            <div className="text-rose-300 font-bold text-[11px]">1.5m – 2.5m: K-Pg Boundary Clay</div>
            <div className="text-slate-400 text-[10px] mt-0.5">Extraterrestrial Iridium Fallout</div>
          </div>
          <div className="p-3 rounded-xl border border-stone-700 bg-stone-900/90">
            <div className="text-emerald-400 font-bold text-[11px]">2.5m – 3.5m: Sandstone Bedrock</div>
            <div className="text-slate-400 text-[10px] mt-0.5">Cool Sanctuary ({subterraneanTempC}°C)</div>
          </div>
        </div>

        {/* Early Mammal Burrow Status Console */}
        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
              🐾
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <span>Early Mammal (Purgatorius) Status</span>
                {burrowSealed && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Tunnel Sealed
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Subterranean Temp: <span className="text-emerald-400 font-bold">{subterraneanTempC}°C</span> · Seeds Stored: <span className="text-amber-400 font-bold">{seedsStored}/6</span> · Air Quality: <span className="text-sky-400 font-bold">{airQuality}%</span>
              </div>
            </div>
          </div>

          {/* Mammal Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDigDeeper}
              disabled={burrowDepthMeters >= 3.5}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-medium text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Pickaxe className="w-3.5 h-3.5" />
              <span>Dig Deeper ({burrowDepthMeters}m)</span>
            </button>

            <button
              onClick={handleHoardSeeds}
              disabled={seedsStored >= 6}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-medium text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Nut className="w-3.5 h-3.5" />
              <span>Hoard Seeds ({seedsStored}/6)</span>
            </button>

            <button
              onClick={handleToggleSeal}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                burrowSealed
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <DoorClosed className="w-3.5 h-3.5" />
              <span>{burrowSealed ? 'Tunnel Sealed' : 'Seal Tunnel'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
