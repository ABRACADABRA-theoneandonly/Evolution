import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FlaskConical,
  Zap,
  Droplets,
  Sparkles,
  Layers,
  Thermometer,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useUserLearning } from '../../context/UserLearningContext';
import { soundManager } from '../../services/audioSynthesizer';

type MoleculeType = 'prebiotic' | 'amino-acid' | 'nucleotide' | 'oxygen' | 'iron-rust';

interface Molecule {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: MoleculeType;
  name: string;
  chemicalFormula: string;
  color: string;
  size: number;
  angle: number;
  vRot: number;
}

interface LightningBolt {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  branches: { x1: number; y1: number; x2: number; y2: number }[];
  alpha: number;
}

export const PrimordialSoupSim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { recordSimulationInteraction, addXP, triggerConfetti } = useUserLearning();

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [sparkVoltage, setSparkVoltage] = useState<number>(50); // kV
  const [oceanTemp, setOceanTemp] = useState<number>(78); // °C
  const [cyanobacteriaReefs, setCyanobacteriaReefs] = useState<number>(1);

  // Reaction statistics
  const [aminoAcidCount, setAminoAcidCount] = useState<number>(0);
  const [rnaChainsSynthesized, setRnaChainsSynthesized] = useState<number>(0);
  const [atmosphericOxygen, setAtmosphericOxygen] = useState<number>(0.05); // %
  const [ironPrecipitated, setIronPrecipitated] = useState<number>(0); // %
  const [oxidationPhase, setOxidationPhase] = useState<'Anoxic Archean' | 'Banded Iron Deposition' | 'Great Oxidation Event'>(
    'Anoxic Archean'
  );

  // RNA construction mini-game
  const [activeRnaChain, setActiveRnaChain] = useState<string[]>([]);
  const [lightningBolts, setLightningBolts] = useState<LightningBolt[]>([]);

  const moleculesRef = useRef<Molecule[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Initialize prebiotic broth with ball-and-stick molecules
  const initMolecules = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initial: Molecule[] = [];
    const precursors = [
      { name: 'Water', formula: 'H₂O', color: '#38bdf8' },
      { name: 'Methane', formula: 'CH₄', color: '#94a3b8' },
      { name: 'Ammonia', formula: 'NH₃', color: '#a855f7' },
      { name: 'Hydrogen', formula: 'H₂', color: '#cbd5e1' },
      { name: 'Hydrogen Cyanide', formula: 'HCN', color: '#f59e0b' },
    ];

    for (let i = 0; i < 50; i++) {
      const p = precursors[i % precursors.length];
      initial.push({
        id: i,
        x: Math.random() * canvas.width,
        y: 60 + Math.random() * (canvas.height - 120),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        type: 'prebiotic',
        name: p.name,
        chemicalFormula: p.formula,
        color: p.color,
        size: 5,
        angle: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.05,
      });
    }

    moleculesRef.current = initial;
    setAminoAcidCount(0);
    setRnaChainsSynthesized(0);
    setAtmosphericOxygen(0.05);
    setIronPrecipitated(0);
    setOxidationPhase('Anoxic Archean');
    setActiveRnaChain([]);
  }, []);

  useEffect(() => {
    initMolecules();
  }, [initMolecules]);

  // Generate multi-branched lightning
  const generateLightning = (x1: number, y1: number, x2: number, y2: number): LightningBolt => {
    const branches: { x1: number; y1: number; x2: number; y2: number }[] = [];
    let curX = x1;
    let curY = y1;
    const steps = 8;
    const dx = (x2 - x1) / steps;
    const dy = (y2 - y1) / steps;

    for (let i = 0; i < steps; i++) {
      const nextX = curX + dx + (Math.random() - 0.5) * 26;
      const nextY = curY + dy + (Math.random() - 0.5) * 18;
      branches.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });

      if (Math.random() > 0.5) {
        branches.push({
          x1: nextX,
          y1: nextY,
          x2: nextX + (Math.random() - 0.5) * 40,
          y2: nextY + Math.random() * 26,
        });
      }
      curX = nextX;
      curY = nextY;
    }

    return { x1, y1, x2, y2, branches, alpha: 1 };
  };

  // Trigger Miller-Urey electric discharge spark
  const triggerElectricSpark = () => {
    soundManager.playCosmicBlast();
    recordSimulationInteraction('before-dinosaurs', 'electric-spark');

    const canvas = canvasRef.current;
    if (!canvas) return;

    const bolts = [
      generateLightning(canvas.width * 0.32, 10, canvas.width * 0.48, 70),
      generateLightning(canvas.width * 0.68, 10, canvas.width * 0.52, 70),
    ];
    setLightningBolts(bolts);

    setTimeout(() => {
      setLightningBolts([]);
    }, 320);

    const aminos = [
      { name: 'Glycine', formula: 'C₂H₅NO₂', color: '#10b981' },
      { name: 'Alanine', formula: 'C₃H₇NO₂', color: '#10b981' },
      { name: 'Aspartate', formula: 'C₄H₇NO₄', color: '#059669' },
    ];

    const nucleotides = [
      { name: 'Adenine', formula: 'C₅H₅N₅', color: '#38bdf8' },
      { name: 'Uracil', formula: 'C₄H₄N₂O₂', color: '#60a5fa' },
      { name: 'Cytosine', formula: 'C₄H₅N₃O', color: '#818cf8' },
      { name: 'Guanine', formula: 'C₅H₅N₅O', color: '#38bdf8' },
    ];

    const newMolecules: Molecule[] = [];
    for (let i = 0; i < 6; i++) {
      const isNucleotide = Math.random() > 0.45;
      const pick = isNucleotide
        ? nucleotides[Math.floor(Math.random() * nucleotides.length)]
        : aminos[Math.floor(Math.random() * aminos.length)];

      newMolecules.push({
        id: Date.now() + i,
        x: canvas.width / 2 + (Math.random() - 0.5) * 90,
        y: 85 + (Math.random() - 0.5) * 35,
        vx: (Math.random() - 0.5) * 2.5,
        vy: 1.2 + Math.random() * 2,
        type: isNucleotide ? 'nucleotide' : 'amino-acid',
        name: pick.name,
        chemicalFormula: pick.formula,
        color: pick.color,
        size: isNucleotide ? 7 : 6,
        angle: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08,
      });
    }

    moleculesRef.current = [...moleculesRef.current, ...newMolecules];
    setAminoAcidCount((prev) => prev + newMolecules.length);
    addXP(45, 'Synthesized Prebiotic Bio-Monomers');
  };

  // Add photosynthetic cyanobacteria microbial mat
  const addCyanobacteriaStromatolite = () => {
    if (cyanobacteriaReefs >= 6) return;
    setCyanobacteriaReefs((prev) => prev + 1);
    soundManager.playQuizSuccess();
    recordSimulationInteraction('before-dinosaurs', 'cyanobacteria');

    setAtmosphericOxygen((prev) => {
      const next = parseFloat((prev + 3.8).toFixed(2));
      if (next >= 15) {
        setOxidationPhase('Great Oxidation Event');
        triggerConfetti();
      } else if (next >= 2) {
        setOxidationPhase('Banded Iron Deposition');
      }
      return next;
    });

    setIronPrecipitated((prev) => Math.min(100, prev + 22));
    addXP(60, 'Stromatolite Reef Oxygenation');
  };

  // Click on a nucleotide in the broth to link RNA chain
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 880;
    const clickY = ((e.clientY - rect.top) / rect.height) * 430;

    const hitIdx = moleculesRef.current.findIndex(
      (m) => m.type === 'nucleotide' && Math.hypot(m.x - clickX, m.y - clickY) < 28
    );

    if (hitIdx !== -1) {
      const hit = moleculesRef.current[hitIdx];
      const baseLetter = hit.name[0];
      moleculesRef.current.splice(hitIdx, 1);
      soundManager.playCursorSpark();

      setActiveRnaChain((prev) => {
        const next = [...prev, baseLetter];
        if (next.length >= 5) {
          soundManager.playQuizSuccess();
          triggerConfetti();
          setRnaChainsSynthesized((c) => c + 1);
          addXP(95, 'Catalytic Ribozyme Assembled & Folded!');
          return [];
        }
        return next;
      });
    }
  };

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      // Shimmering Ocean Light Rays
      const time = Date.now() * 0.0015;
      ctx.save();
      for (let r = 0; r < 4; r++) {
        const rx = cw * 0.2 + r * (cw * 0.2) + Math.sin(time + r) * 25;
        const rayGrad = ctx.createLinearGradient(rx, 0, rx + 40, ch);
        rayGrad.addColorStop(0, 'rgba(56, 189, 248, 0.14)');
        rayGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(rx, 0);
        ctx.lineTo(rx + 50, 0);
        ctx.lineTo(rx + 90, ch);
        ctx.lineTo(rx + 20, ch);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Electric Discharge Lightning Bolts
      lightningBolts.forEach((bolt) => {
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#67e8f9';
        ctx.beginPath();
        bolt.branches.forEach((b) => {
          ctx.moveTo(b.x1, b.y1);
          ctx.lineTo(b.x2, b.y2);
        });
        ctx.stroke();
        ctx.restore();
      });

      // Ball-and-Stick Molecules
      moleculesRef.current.forEach((m) => {
        if (isPlaying) {
          m.x += m.vx;
          m.y += m.vy;
          m.angle += m.vRot;

          if (m.x < 20 || m.x > cw - 20) m.vx *= -1;
          if (m.y < 30 || m.y > ch - 30) m.vy *= -1;
        }

        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(m.angle);

        if (m.type === 'nucleotide') {
          ctx.strokeStyle = m.color;
          ctx.lineWidth = 2.5;
          ctx.shadowBlur = 16;
          ctx.shadowColor = m.color;

          ctx.beginPath();
          ctx.arc(0, 0, m.size, 0, Math.PI * 2);
          ctx.fillStyle = m.color;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(m.size + 4, 0, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        } else if (m.type === 'amino-acid') {
          ctx.fillStyle = m.color;
          ctx.shadowBlur = 12;
          ctx.shadowColor = m.color;

          ctx.beginPath();
          ctx.arc(-4, 0, 4.5, 0, Math.PI * 2);
          ctx.arc(4, 0, 4.5, 0, Math.PI * 2);
          ctx.arc(0, -5, 3.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, m.size, 0, Math.PI * 2);
          ctx.fillStyle = m.color;
          ctx.fill();
        }
        ctx.restore();

        if (m.type === 'nucleotide' || m.type === 'amino-acid') {
          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(m.chemicalFormula, m.x + 11, m.y + 3);
        }
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, lightningBolts]);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 md:p-6 shadow-2xl space-y-6">
      {/* Simulation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <FlaskConical className="w-4 h-4" />
            </span>
            <h3 className="text-xl font-bold font-display text-slate-100">
              Prebiotic Deep-Sea Hydrothermal Vent & Great Oxidation Lab
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate deep-sea hydrothermal black smoker vents, trigger Miller-Urey lightning discharges, assemble self-replicating ribozymes, and bloom cyanobacteria.
          </p>
        </div>

        {/* Oxidation Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              oxidationPhase === 'Great Oxidation Event'
                ? 'bg-sky-400 animate-ping'
                : oxidationPhase === 'Banded Iron Deposition'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-emerald-400'
            }`}
          />
          <span className="text-slate-200 font-bold">{oxidationPhase}</span>
        </div>
      </div>

      {/* Photorealistic Interactive Reactor Stage */}
      <div
        onClick={handleCanvasClick}
        className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl cursor-pointer group min-h-[420px]"
      >
        {/* Photorealistic Deep-Sea Hydrothermal Vent Background */}
        <img
          src="/src/assets/images/realistic_hydrothermal_vent_1791064592777.jpg"
          alt="Photorealistic Deep-Sea Hydrothermal Black Smoker Vent"
          className="absolute inset-0 w-full h-full object-cover filter contrast-110 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

        {/* Canvas Overlay for Molecules and Electric Arcs */}
        <canvas
          ref={canvasRef}
          width={880}
          height={430}
          className="relative z-10 w-full h-72 sm:h-96 md:h-[430px] object-cover block pointer-events-none"
        />

        {/* RNA Assembly Chain HUD */}
        <div className="absolute top-4 left-4 bg-slate-950/85 border border-slate-800 backdrop-blur-md p-3 rounded-2xl shadow-xl max-w-xs pointer-events-none z-20">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-sky-400 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RNA Polymerization Lab (Click Floating Bases)</span>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold font-mono transition-all ${
                  activeRnaChain[i]
                    ? 'border-sky-400 bg-sky-500/20 text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                    : 'border-slate-800 bg-slate-950 text-slate-600'
                }`}
              >
                {activeRnaChain[i] || '—'}
              </div>
            ))}
            <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
              {activeRnaChain.length}/5 Bases
            </span>
          </div>
        </div>

        {/* Action Controls Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-20">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(!isPlaying);
              }}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                initMolecules();
                soundManager.playHoverBlip();
              }}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Reset Chemical Broth"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2.5 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerElectricSpark();
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Trigger Lightning Discharge</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                addCyanobacteriaStromatolite();
              }}
              disabled={cyanobacteriaReefs >= 6}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Droplets className="w-4 h-4" />
              <span>Stromatolite Reef ({cyanobacteriaReefs}/6)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Geobiological Readouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Synthesized Amino Acids</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{aminoAcidCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Glycine, Alanine, Aspartate</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Self-Replicating Ribozymes</div>
          <div className="text-xl font-bold font-mono text-sky-400 mt-1">{rnaChainsSynthesized}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">RNA World catalytic chains</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Atmospheric O₂ Concentration</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">{atmosphericOxygen}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Modern level: 20.95%</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Rust Precipitation (BIFs)</div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">{ironPrecipitated}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Fe²⁺ oxidized to hematite</div>
        </div>
      </div>
    </div>
  );
};
