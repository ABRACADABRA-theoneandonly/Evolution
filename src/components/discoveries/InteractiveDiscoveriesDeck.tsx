import React, { useState, useRef, useEffect } from 'react';
import {
  Flame,
  Zap,
  Globe,
  Compass,
  Sparkles,
  Info,
  CheckCircle2,
  Droplets,
  Search,
  RotateCcw,
  Pickaxe,
  Radio,
  Eye,
  Award,
  Layers,
  Thermometer,
  Skull,
  Activity,
  Atom,
  Feather,
} from 'lucide-react';
import { soundManager } from '../../services/audioSynthesizer';
import { useUserLearning } from '../../context/UserLearningContext';

type DinosaurBonePart = 'cranium' | 'maxilla' | 'teeth' | 'orbit' | 'cervical' | 'dentary';

export const InteractiveDiscoveriesDeck: React.FC = () => {
  const { state, addXP, triggerConfetti } = useUserLearning();
  const currentEra = state.currentEraId;

  // Era-specific active tabs
  const [dinoTab, setDinoTab] = useState<'excavation' | 'bolide'>('excavation');
  const [prehistoricTab, setPrehistoricTab] = useState<'ecosystem' | 'volcano'>('ecosystem');
  const [cosmicTab, setCosmicTab] = useState<'fusion' | 'cmb'>('fusion');
  const [homininTab, setHomininTab] = useState<'tools' | 'cave-art'>('tools');

  // --- DINOSAURS: PROCEDURAL SKELETAL EXCAVATION (NO CREATURE PHOTO) ---
  const [excavationTool, setExcavationTool] = useState<'brush' | 'chisel' | 'radar'>('brush');
  const [revealedTiles, setRevealedTiles] = useState<number[]>([]);
  const [radarScanned, setRadarScanned] = useState<boolean>(false);
  const [fossilCompleted, setFossilCompleted] = useState<boolean>(false);
  const boneCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const TOTAL_TILES = 16;

  // --- DINOSAURS: BOLIDE SYSTEM ---
  const [meteorFired, setMeteorFired] = useState<boolean>(false);

  // --- BEFORE DINOSAURS: CAMBRIAN ECOSYSTEM ---
  const ecosystemCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [foodBait, setFoodBait] = useState<{ x: number; y: number } | null>(null);

  // --- BEFORE DINOSAURS: VOLCANO SYSTEM ---
  const [volcanoErupting, setVolcanoErupting] = useState<boolean>(false);
  const [so2Ejected, setSo2Ejected] = useState<number>(0);
  const [volcanoScreenShake, setVolcanoScreenShake] = useState<number>(0);

  // --- BIG BANG: FUSION SYSTEM ---
  const [protonsFused, setProtonsFused] = useState<number>(4);
  const [fusionYieldMeV, setFusionYieldMeV] = useState<number>(26.7);

  // --- HUMAN EVOLUTION: CAVE ART SYSTEM ---
  const [pigmentColor, setPigmentColor] = useState<string>('#991b1b');
  const caveCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Trigger Meteor Blast in Dinosaur Era
  const triggerMeteorStrike = () => {
    setMeteorFired(false);
    setTimeout(() => {
      setMeteorFired(true);
      soundManager.playMeteorWhoosh();
      setTimeout(() => {
        soundManager.playSupernova();
        triggerConfetti();
      }, 1000);
      addXP(50, 'Chicxulub Asteroid Cataclysm Simulated');
    }, 60);
  };

  // Trigger Siberian Traps Volcano (Before Dinosaurs)
  const triggerEruption = () => {
    if (volcanoErupting) return;
    setVolcanoErupting(true);
    setVolcanoScreenShake(8);
    soundManager.playVolcanoEruption();
    setSo2Ejected((prev) => prev + 50);
    triggerConfetti();
    addXP(60, 'Permian Siberian Traps Super-Eruption Simulated');

    setTimeout(() => {
      setVolcanoErupting(false);
      setVolcanoScreenShake(0);
    }, 4500);
  };

  // Render Detailed Procedural Skeleton on Canvas (NO CREATURE PHOTO)
  useEffect(() => {
    if (currentEra !== 'dinosaurs' || dinoTab !== 'excavation') return;
    const canvas = boneCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cw = (canvas.width = 460);
    const ch = (canvas.height = 460);
    ctx.clearRect(0, 0, cw, ch);

    // Matrix background: Sedimentary sandstone rock texture
    ctx.fillStyle = '#292524';
    ctx.fillRect(0, 0, cw, ch);

    // Natural stone sediment striations
    ctx.strokeStyle = 'rgba(120, 113, 108, 0.25)';
    ctx.lineWidth = 1.5;
    for (let y = 30; y < ch; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(cw, y + Math.sin(y) * 12);
      ctx.stroke();
    }

    // Procedural Anatomical Dinosaur Skull (Articulated Bone Matrix)
    ctx.save();
    ctx.translate(cw * 0.1, ch * 0.25);

    // 1. Braincase & Occipital Region (Bone color: #fef3c7 fossilized cream/ivory)
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;

    // Cranial Vault
    ctx.beginPath();
    ctx.moveTo(60, 40);
    ctx.bezierCurveTo(90, 10, 200, 10, 260, 45);
    ctx.lineTo(310, 85); // Snout tip
    ctx.lineTo(310, 110);
    ctx.lineTo(220, 105);
    ctx.lineTo(190, 85);
    ctx.lineTo(120, 95);
    ctx.lineTo(60, 90);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Fenestrae (Weight-reducing skull openings in theropod anatomy)
    ctx.fillStyle = '#1c1917';
    // Antorbital Fenestra
    ctx.beginPath();
    ctx.ellipse(200, 65, 32, 18, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Orbit (Binocular Eye Socket)
    ctx.beginPath();
    ctx.ellipse(135, 58, 22, 19, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Lateral Temporal Fenestra
    ctx.beginPath();
    ctx.ellipse(82, 64, 16, 22, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Serrated Bone-Crushing Maxillary Teeth
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    for (let t = 0; t < 9; t++) {
      const tx = 175 + t * 14;
      const th = 18 + (t % 3) * 6;
      ctx.beginPath();
      ctx.moveTo(tx, 105);
      ctx.lineTo(tx + 4, 105 + th);
      ctx.lineTo(tx + 8, 105);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 4. Articulated Dentary (Lower Jaw)
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(55, 105);
    ctx.lineTo(290, 118);
    ctx.lineTo(285, 142);
    ctx.lineTo(150, 148);
    ctx.lineTo(55, 130);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dentary Lower Teeth
    ctx.fillStyle = '#ffffff';
    for (let t = 0; t < 8; t++) {
      const tx = 165 + t * 14;
      const th = 14 + (t % 2) * 5;
      ctx.beginPath();
      ctx.moveTo(tx, 118);
      ctx.lineTo(tx + 3.5, 118 - th);
      ctx.lineTo(tx + 7, 118);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Labeled Bone Landmarks
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('• Antorbital Fenestra', 155, 38);
    ctx.fillText('• Ziphodont Dentition', 205, 162);
    ctx.fillText('• Stereoscopic Orbit', 95, 30);

    ctx.restore();
  }, [currentEra, dinoTab]);

  // Handle tile excavation in dinosaur lab
  const handleExcavateTile = (idx: number) => {
    if (revealedTiles.includes(idx)) return;

    if (excavationTool === 'radar') {
      setRadarScanned(true);
      soundManager.playCursorSpark();
      return;
    }

    soundManager.playFlintStrike();
    const next = [...revealedTiles, idx];
    setRevealedTiles(next);

    if (next.length >= TOTAL_TILES && !fossilCompleted) {
      setFossilCompleted(true);
      soundManager.playQuizSuccess();
      triggerConfetti();
      addXP(100, 'Tyrannosaurus Cranial Anatomy Fully Unearthed');
    } else {
      addXP(10, 'Excavated Sedimentary Matrix');
    }
  };

  const handleResetExcavation = () => {
    soundManager.playHoverBlip();
    setRevealedTiles([]);
    setRadarScanned(false);
    setFossilCompleted(false);
  };

  // --- CAMBRIAN ECOSYSTEM ANIMATION (BEFORE DINOSAURS TOPIC ONLY) ---
  useEffect(() => {
    if (currentEra !== 'before-dinosaurs' || prehistoricTab !== 'ecosystem') return;
    const canvas = ecosystemCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const cw = (canvas.width = 720);
    const ch = (canvas.height = 360);

    const organisms = [
      { x: 180, y: 120, vx: 1.4, vy: 0.3, size: 28, type: 'anomalocaris', color: '#14b8a6' },
      { x: 420, y: 180, vx: -1.0, vy: -0.2, size: 20, type: 'opabinia', color: '#38bdf8' },
      { x: 120, y: ch - 40, vx: 0.5, vy: 0, size: 16, type: 'trilobite', color: '#f59e0b' },
      { x: 340, y: ch - 40, vx: -0.6, vy: 0, size: 16, type: 'trilobite', color: '#f59e0b' },
    ];

    const render = () => {
      ctx.clearRect(0, 0, cw, ch);
      const time = Date.now() * 0.002;

      // Aquatic seabed gradient
      const seaGrad = ctx.createLinearGradient(0, 0, 0, ch);
      seaGrad.addColorStop(0, '#0c4a6e');
      seaGrad.addColorStop(0.7, '#075985');
      seaGrad.addColorStop(1, '#082f49');
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, 0, cw, ch);

      // Sunbeam caustics
      for (let s = 0; s < 4; s++) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.beginPath();
        const sx = cw * 0.2 + s * 160 + Math.sin(time + s) * 20;
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx + 40, 0);
        ctx.lineTo(sx + 90, ch);
        ctx.lineTo(sx + 20, ch);
        ctx.fill();
      }

      // Draw food bait
      if (foodBait) {
        ctx.beginPath();
        ctx.arc(foodBait.x, foodBait.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#fde047';
        ctx.fill();
      }

      // Organisms
      organisms.forEach((org) => {
        if (foodBait && org.type !== 'trilobite') {
          const dx = foodBait.x - org.x;
          const dy = foodBait.y - org.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 10) {
            org.vx += (dx / dist) * 0.06;
            org.vy += (dy / dist) * 0.06;
          }
        }

        org.x += org.vx;
        org.y += org.vy;
        org.vx *= 0.99;
        org.vy *= 0.99;

        if (org.x < 30 || org.x > cw - 30) org.vx *= -1;
        if (org.y < 30 || org.y > ch - 40) org.vy *= -1;

        ctx.save();
        ctx.translate(org.x, org.y);
        ctx.rotate(Math.atan2(org.vy, org.vx));

        if (org.type === 'anomalocaris') {
          ctx.fillStyle = '#0f766e';
          ctx.beginPath();
          ctx.ellipse(0, 0, org.size * 1.4, org.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#2dd4bf';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(org.size * 1.2, -7);
          ctx.lineTo(org.size * 1.8, -14);
          ctx.moveTo(org.size * 1.2, 7);
          ctx.lineTo(org.size * 1.8, 14);
          ctx.stroke();
        } else {
          ctx.fillStyle = org.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, org.size * 1.1, org.size * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [currentEra, prehistoricTab, foodBait]);

  return (
    <div id="discoveries-deck" className="rounded-3xl border border-slate-800 bg-slate-950 p-5 md:p-6 shadow-2xl space-y-6">
      {/* ========================================================
          1. AGE OF THE DINOSAURS TOPIC (STRICTLY CONFINED HERE)
          NO PICTURE OF CREATURE - DETAILED PROCEDURAL ANIMATIONS
          ======================================================== */}
      {currentEra === 'dinosaurs' && (
        <div className="space-y-6 animate-fade-in">
          {/* Deck Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Pickaxe className="w-4 h-4" />
                </span>
                <h3 className="text-xl font-bold font-display text-slate-100">
                  Mesozoic Paleontological Field Lab & Extinction Analytics
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Excavate authentic articulated dinosaur skeletal fossils bone-by-bone from sandstone matrix without photos, and analyze the 10km bolide extinction impact.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => {
                  setDinoTab('excavation');
                  soundManager.playHoverBlip();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  dinoTab === 'excavation'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-amber-400 hover:bg-slate-800'
                }`}
              >
                🦴 Skeletal Anatomy Excavation
              </button>
              <button
                onClick={() => {
                  setDinoTab('bolide');
                  soundManager.playHoverBlip();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  dinoTab === 'bolide'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-rose-400 hover:bg-slate-800'
                }`}
              >
                ☄️ Bolide Kinetic Trajectory
              </button>
            </div>
          </div>

          {/* Dinosaur Lab 1: Procedural Fossil Skeletal Reconstruction (NO CREATURE PHOTO) */}
          {dinoTab === 'excavation' && (
            <div className="space-y-6">
              {/* Excavation Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-xs font-mono text-slate-300">
                  Specimen: <span className="text-amber-400 font-bold">Tyrannosaurus Rex (Articulated Cranium & Dentary)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'brush', label: 'Dusting Brush', icon: <Search className="w-3.5 h-3.5" /> },
                    { id: 'chisel', label: 'Rock Chisel', icon: <Pickaxe className="w-3.5 h-3.5" /> },
                    { id: 'radar', label: 'Ground Radar', icon: <Radio className="w-3.5 h-3.5" /> },
                  ].map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setExcavationTool(tool.id as typeof excavationTool);
                        soundManager.playHoverBlip();
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        excavationTool === tool.id
                          ? 'bg-sky-500 text-slate-950 font-bold shadow'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tool.icon}
                      <span>{tool.label}</span>
                    </button>
                  ))}

                  <button
                    onClick={handleResetExcavation}
                    className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer ml-2"
                    title="Reset Excavation Grid"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid Stage: Pure Procedural Bones Canvas Underneath (NO PICTURE) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 relative aspect-square max-w-md mx-auto w-full rounded-3xl border-2 border-slate-700 bg-stone-900 p-3 shadow-2xl overflow-hidden">
                  {/* Procedural Vector Skeleton Canvas (NO CREATURE PHOTO) */}
                  <div className="absolute inset-3 rounded-2xl overflow-hidden pointer-events-none">
                    <canvas ref={boneCanvasRef} width={460} height={460} className="w-full h-full object-contain block" />
                  </div>

                  {/* Sandstone Rock Matrix Overlay Tiles */}
                  <div className="relative z-10 grid grid-cols-4 grid-rows-4 gap-1.5 h-full w-full">
                    {Array.from({ length: TOTAL_TILES }).map((_, idx) => {
                      const isRevealed = revealedTiles.includes(idx);
                      return (
                        <button
                          key={idx}
                          onClick={() => handleExcavateTile(idx)}
                          className={`rounded-xl border transition-all duration-300 flex items-center justify-center cursor-pointer select-none ${
                            isRevealed
                              ? 'opacity-0 pointer-events-none scale-90'
                              : radarScanned
                              ? 'bg-sky-950/85 border-sky-400/70 shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                              : 'bg-stone-800/95 hover:bg-stone-750 border-stone-600 shadow-md hover:scale-[1.02]'
                          }`}
                        >
                          {!isRevealed && (
                            <span className="text-[10px] font-mono font-bold text-stone-300">
                              {radarScanned ? 'BONE' : `STRATA-${idx + 1}`}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Paleontology Osteology Field Notes */}
                <div className="md:col-span-5 space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-400 font-mono font-bold">Late Cretaceous (66 Ma)</span>
                      <span className="font-mono text-slate-400">
                        {Math.round((revealedTiles.length / TOTAL_TILES) * 100)}% Excavated
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-100 font-display">
                      Tyrannosaurus Rex Cranial Osteology
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Procedurally unearth anatomical cranial architecture: antorbital fenestra for skull lightness, fused nasals for torsion resistance, and 30cm ziphodont serrated teeth capable of 57,000 Newtons of bone-crushing bite pressure.
                    </p>
                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                      📍 Quarry: <span className="text-slate-200">Hell Creek Formation, Garfield County, Montana</span>
                    </div>
                  </div>

                  {fossilCompleted && (
                    <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-3 animate-fade-in shadow-xl">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-bold text-sm text-emerald-200">Osteological Articulation Complete!</div>
                        <div>Cranial elements catalogued into Chronos Paleontology Archive. +100 XP awarded!</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dinosaur Lab 2: Chicxulub Bolide Extinction */}
          {dinoTab === 'bolide' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-100 font-display">
                    Chicxulub Asteroid Kinetic Energy Simulation (66 Ma)
                  </h4>
                  <button
                    onClick={triggerMeteorStrike}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-xl transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Fire Hypersonic Bolide</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Impactor Mass:</span>
                    <div className="text-amber-400 font-bold mt-0.5">1.3 × 10¹⁵ kg</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Kinetic Energy:</span>
                    <div className="text-rose-400 font-bold mt-0.5">100,000,000 Megatons</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Atmospheric SO₂:</span>
                    <div className="text-sky-400 font-bold mt-0.5">325 Gigatons Aerosols</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          2. BEFORE DINOSAURS TOPIC ONLY (NO DINOSAURS HERE)
          ======================================================== */}
      {currentEra === 'before-dinosaurs' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30">
                  <Droplets className="w-4 h-4" />
                </span>
                <h3 className="text-xl font-bold font-display text-slate-100">
                  Pre-Dinosaurian Marine Explosion & Siberian Volcanism
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Explore the early Paleozoic ocean radiation and the devastating Permian-Triassic extinction that preceded the rise of dinosaurs.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setPrehistoricTab('ecosystem')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  prehistoricTab === 'ecosystem'
                    ? 'bg-teal-500 text-slate-950 font-bold shadow'
                    : 'text-teal-400 hover:bg-slate-800'
                }`}
              >
                🦐 Cambrian Reef (541 Ma)
              </button>
              <button
                onClick={() => setPrehistoricTab('volcano')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  prehistoricTab === 'volcano'
                    ? 'bg-rose-500 text-slate-950 font-bold shadow'
                    : 'text-rose-400 hover:bg-slate-800'
                }`}
              >
                🌋 Siberian Traps (252 Ma)
              </button>
            </div>
          </div>

          {prehistoricTab === 'ecosystem' && (
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl min-h-[360px]">
              <canvas
                ref={ecosystemCanvasRef}
                width={720}
                height={360}
                className="w-full h-72 sm:h-96 md:h-[360px] object-cover block cursor-crosshair"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 720;
                  const y = ((e.clientY - rect.top) / rect.height) * 360;
                  setFoodBait({ x, y });
                  soundManager.playCursorSpark();
                  setTimeout(() => setFoodBait(null), 3500);
                }}
              />
              <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs text-slate-200 pointer-events-none shadow-lg">
                💡 Click into the Cambrian water column to drop organic detritus and observe Anomalocaris hunt!
              </div>
            </div>
          )}

          {prehistoricTab === 'volcano' && (
            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-100 font-display">
                    Permian Siberian Traps Flood Basalts (252 Ma)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    The Great Dying: 96% of marine species and 70% of terrestrial vertebrate species wiped out prior to the Age of the Dinosaurs.
                  </p>
                </div>
                <button
                  onClick={triggerEruption}
                  disabled={volcanoErupting}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  <Flame className="w-4 h-4" />
                  <span>{volcanoErupting ? 'Eruption in Progress...' : 'Trigger Super-Eruption'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          3. BIG BANG TOPIC ONLY (NO DINOSAURS HERE)
          ======================================================== */}
      {currentEra === 'big-bang' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  <Atom className="w-4 h-4" />
                </span>
                <h3 className="text-xl font-bold font-display text-slate-100">
                  Cosmic Big Bang Nucleosynthesis & Primordial Elements
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Investigate the first 20 minutes of cosmic spacetime: light element fusion of Hydrogen into Helium.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Primordial Hydrogen (H-1)</span>
              <div className="text-2xl font-bold font-mono text-sky-400">75% Mass</div>
              <div className="text-[10px] text-slate-500">Unfused cosmic protons</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Primordial Helium (He-4)</span>
              <div className="text-2xl font-bold font-mono text-amber-400">25% Mass</div>
              <div className="text-[10px] text-slate-500">Alpha particle synthesis</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Cosmic Background Temp</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">2.725 Kelvin</div>
              <div className="text-[10px] text-slate-500">Redshifted relic radiation</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. HUMAN EVOLUTION TOPIC ONLY (NO DINOSAURS HERE)
          ======================================================== */}
      {currentEra === 'human-evolution' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30">
                  <Feather className="w-4 h-4" />
                </span>
                <h3 className="text-xl font-bold font-display text-slate-100">
                  Anthropological Archaeology & Lithic Technologies
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Explore the progression of human material culture from Oldowan pebble choppers to symbolic Upper Paleolithic cave art.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Mode 1: Oldowan</span>
              <div className="text-sm font-bold text-slate-100">2.6 – 1.7 Ma</div>
              <div className="text-[10px] text-slate-400">Pebble choppers used by Homo habilis</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Mode 2: Acheulean</span>
              <div className="text-sm font-bold text-slate-100">1.7 Ma – 200 ka</div>
              <div className="text-[10px] text-slate-400">Bifacial teardrop handaxes of Homo erectus</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Mode 3: Levallois</span>
              <div className="text-sm font-bold text-slate-100">300 – 40 ka</div>
              <div className="text-[10px] text-slate-400">Prepared tortoise-core hafted spear tips</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
