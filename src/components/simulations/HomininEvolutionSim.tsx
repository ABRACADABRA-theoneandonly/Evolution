import React, { useState, useEffect, useRef } from 'react';
import {
  Footprints,
  Brain,
  Flame,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  HelpCircle,
  Hammer,
  Zap,
  Award,
  Layers,
  Crosshair,
  Info,
  Scan,
  RotateCw,
  Wind,
  Play,
  Pause,
  RotateCcw,
  Sun,
  Moon,
  Compass,
  Eye,
  Activity,
  Droplets,
  Shirt,
  Home,
  ArrowRight,
  ArrowUpRight,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import { useUserLearning } from '../../context/UserLearningContext';
import { soundManager } from '../../services/audioSynthesizer';

interface EvolutionaryStage {
  id: string;
  name: string;
  species: string;
  epoch: string;
  timeMa: number; // Million years ago
  cranialVolumeCc: number;
  statureCm: number;
  clothingLevel: 'none-dense-fur' | 'none-sparse-hair' | 'fiber-waistband' | 'pelt-loincloth' | 'ice-age-parka' | 'tailored-sewn-tunic';
  clothingDescription: string;
  posture: 'hunched-knuckle' | 'habitual-upright' | 'endurance-runner' | 'robust-cold' | 'gracile-modern';
  livingHabit: string;
  shelterType: string;
  dietAndFood: string;
  toolInHand: string;
  socialStructure: string;
  keyEvolutionaryShift: string;
  environmentTheme: 'rainforest' | 'savanna-mosaic' | 'rift-valley' | 'hearth-camp' | 'ice-age-cave' | 'paleolithic-village';
  evolutionaryArrows: {
    part: string;
    label: string;
    fromTrait: string;
    toTrait: string;
    metric: string;
    dx: number;
    dy: number;
  }[];
}

const EVOLUTIONARY_STAGES: EvolutionaryStage[] = [
  {
    id: 'stage-1',
    name: 'The Forest Ape-Human',
    species: 'Sahelanthropus / Ardipithecus',
    epoch: 'Late Miocene',
    timeMa: 7.0,
    cranialVolumeCc: 350,
    statureCm: 115,
    clothingLevel: 'none-dense-fur',
    clothingDescription: 'Zero clothing. Thick, coarse dark primate fur protecting against tropical downpours and thorns.',
    posture: 'hunched-knuckle',
    livingHabit: 'Canopy climbing, branch swinging, sleeping in arboreal leaf nests to evade saber-toothed predators.',
    shelterType: 'Treetop Arboreal Leaf Nests',
    dietAndFood: 'Wild forest figs, fibrous leaves, roots, and insects.',
    toolInHand: 'Flexible Wooden Twig & River Stone',
    socialStructure: 'Small arboreal kinship foraging groups',
    keyEvolutionaryShift: 'Downward-facing foramen magnum: first transition from quadrupedal climbing to facultative upright standing.',
    environmentTheme: 'rainforest',
    evolutionaryArrows: [
      {
        part: 'Cranium & Brain',
        label: 'Cranial Vault',
        fromTrait: 'Chimpanzee-size braincase',
        toTrait: 'Pre-frontal expansion begins',
        metric: '350 cm³',
        dx: 22,
        dy: -125,
      },
      {
        part: 'Jaws & Teeth',
        label: 'Facial Prognathism',
        fromTrait: 'Prominent ape snout & long canines',
        toTrait: 'Reduced canine dimorphism',
        metric: 'Prognathic 48°',
        dx: 52,
        dy: -98,
      },
      {
        part: 'Spine & Pelvis',
        label: 'Spine Carriage',
        fromTrait: 'C-shaped forward-bent spine',
        toTrait: 'Intermediate downward foramen magnum',
        metric: 'Facultative Biped',
        dx: -45,
        dy: -65,
      },
      {
        part: 'Feet & Toes',
        label: 'Opposable Big Toe',
        fromTrait: 'Divergent grasping hallux',
        toTrait: 'Climbing arboreal foot',
        metric: 'Grasping Thumb-Toe',
        dx: 28,
        dy: 12,
      },
    ],
  },
  {
    id: 'stage-2',
    name: 'The Savanna Walker',
    species: 'Australopithecus afarensis ("Lucy")',
    epoch: 'Pliocene',
    timeMa: 3.8,
    cranialVolumeCc: 430,
    statureCm: 125,
    clothingLevel: 'none-sparse-hair',
    clothingDescription: 'Zero clothing. Moderate body hair coverage with early thermoregulatory thinning under equatorial sun.',
    posture: 'habitual-upright',
    livingHabit: 'Walking across volcanic ash trackways (Laetoli), foraging roots in open savanna-woodland mosaic, sleeping in low trees.',
    shelterType: 'Thorn Bush Night Windbreaks & Low Trees',
    dietAndFood: 'Underground storage organs (tubers), hard grass seeds, scavenged bird eggs.',
    toolInHand: 'Cracked River Cobble (Nut Cracking)',
    socialStructure: 'Multi-male/multi-female cooperative savanna bands',
    keyEvolutionaryShift: 'Valgus knee angle, locked pelvis, and shock-absorbing non-opposable big toe enabling habitual two-legged walking.',
    environmentTheme: 'savanna-mosaic',
    evolutionaryArrows: [
      {
        part: 'Cranium & Brain',
        label: 'Endocranial Growth',
        fromTrait: 'Small cranial capacity',
        toTrait: '+23% brain expansion',
        metric: '430 cm³',
        dx: 22,
        dy: -128,
      },
      {
        part: 'Pelvis & Knee',
        label: 'Valgus Bicondylar Knee',
        fromTrait: 'Wide splayed hips',
        toTrait: 'Inward angled femur placing knees under center of gravity',
        metric: 'Valgus Angle 9°',
        dx: -40,
        dy: -35,
      },
      {
        part: 'Foot Arch',
        label: 'Non-Opposable Arched Foot',
        fromTrait: 'Grasping climbing toe',
        toTrait: 'Inline big toe + longitudinal shock-absorbing arch',
        metric: 'Laetoli Trackway Arch',
        dx: 30,
        dy: 10,
      },
    ],
  },
  {
    id: 'stage-3',
    name: 'The Handy Toolmaker',
    species: 'Homo habilis ("Handy Man")',
    epoch: 'Early Pleistocene',
    timeMa: 2.3,
    cranialVolumeCc: 610,
    statureCm: 135,
    clothingLevel: 'fiber-waistband',
    clothingDescription: 'Early plant-fiber cord and light untanned pelt wrap around the waist for tool carrying and pelvic warmth.',
    posture: 'habitual-upright',
    livingHabit: 'Cooperative bone marrow scavenging along lakeshores, intentional hammerstone flaking to produce razor-sharp stone edges.',
    shelterType: 'Lakeside Semi-Permanent Rock Circles',
    dietAndFood: 'Bone marrow scavenged from big-cat kills, wild melons, roots.',
    toolInHand: 'Sharp Oldowan Pebble Chopper (Mode 1)',
    socialStructure: 'Cooperative foraging bands sharing butchered carcasses',
    keyEvolutionaryShift: '35% brain expansion and precision thumb opposability allowing engineered stone manufacture.',
    environmentTheme: 'rift-valley',
    evolutionaryArrows: [
      {
        part: 'Cranium & Brain',
        label: 'Broca’s Area Expansion',
        fromTrait: 'Ape neurological wiring',
        toTrait: 'Expansion of frontal lobe & primitive vocal coordination',
        metric: '610 cm³ (+42%)',
        dx: 25,
        dy: -135,
      },
      {
        part: 'Hand & Thumb',
        label: 'Precision Grip',
        fromTrait: 'Curved climbing phalanges',
        toTrait: 'Broad apical tufts & elongated opposable thumb',
        metric: 'Forceful Pincher Grip',
        dx: 48,
        dy: -45,
      },
      {
        part: 'Mouth & Dentition',
        label: 'Molar Reduction',
        fromTrait: 'Massive crushing megadont molars',
        toTrait: 'Smaller teeth as stone tools pre-process tough foods',
        metric: 'Gracile Dentition',
        dx: 45,
        dy: -105,
      },
    ],
  },
  {
    id: 'stage-4',
    name: 'The Fire Master & Runner',
    species: 'Homo erectus ("Turkana Boy")',
    epoch: 'Pleistocene',
    timeMa: 1.8,
    cranialVolumeCc: 950,
    statureCm: 175,
    clothingLevel: 'pelt-loincloth',
    clothingDescription: 'Animal hide apron and sinew-tied waist wrap to protect thighs while running through thorn-bush savannas.',
    posture: 'endurance-runner',
    livingHabit: 'Controlled hearth fire, roasting tubers and meat, persistence running to exhaust prey in the midday sun, out-of-Africa migration.',
    shelterType: 'Open-Air Campfires & Protective Brush Huts',
    dietAndFood: 'Cooked ungulate meat, roasted starch, calorically dense prepared foods.',
    toolInHand: 'Bifacial Acheulean Teardrop Handaxe (Mode 2)',
    socialStructure: 'Multi-generational tribal camps centered around the communal campfire',
    keyEvolutionaryShift: 'Loss of body fur and evolution of millions of eccrine sweat glands, enabling persistence hunting and long-distance running.',
    environmentTheme: 'hearth-camp',
    evolutionaryArrows: [
      {
        part: 'Cranium & Brain',
        label: 'Doubled Brain Volume',
        fromTrait: 'Small cranial capacity',
        toTrait: 'Large braincase with occipital torus & heavy brow ridge',
        metric: '950 cm³',
        dx: 28,
        dy: -160,
      },
      {
        part: 'Torso & Sweat Glands',
        label: 'Fur Loss & Sweat Glands',
        fromTrait: 'Trapped heat in body fur',
        toTrait: 'Bare skin with 2-4 million eccrine glands for running evaporative cooling',
        metric: 'Persistence Hunting',
        dx: -45,
        dy: -90,
      },
      {
        part: 'Limb Proportions',
        label: 'Modern Limb Ratio',
        fromTrait: 'Short legs & long climbing arms',
        toTrait: 'Long spring-like legs with Achilles tendon for distance running',
        metric: 'Modern Stature 175 cm',
        dx: 45,
        dy: -40,
      },
    ],
  },
  {
    id: 'stage-5',
    name: 'The Ice Age Big-Game Hunter',
    species: 'Homo neanderthalensis',
    epoch: 'Middle/Late Pleistocene',
    timeMa: 0.12,
    cranialVolumeCc: 1450,
    statureCm: 165,
    clothingLevel: 'ice-age-parka',
    clothingDescription: 'Thick fur-lined mammoth/bear hide cloak with bone pin fastener, leather leg wraps (gaiters), and sub-zero moccasins.',
    posture: 'robust-cold',
    livingHabit: 'Deep limestone cave living, ambush hunting of woolly rhinos and mammoths, hafting stone blades onto spears with birch pitch, intentional floral burials.',
    shelterType: 'Limestone Rock Shelters & Insulated Caves',
    dietAndFood: 'Megafauna meat (bison, mammoth), coastal shellfish, medicinal herbs.',
    toolInHand: 'Levallois Spear with Hafted Flint Tip (Mode 3)',
    socialStructure: 'Close-knit familial clans with symbolic burial rituals and care for elderly/injured',
    keyEvolutionaryShift: 'Massive cranial vault, robust barrel chest for cold thermoregulation, and complex hafted composite tools.',
    environmentTheme: 'ice-age-cave',
    evolutionaryArrows: [
      {
        part: 'Cranium & Brain',
        label: 'Peak Endocranial Volume',
        fromTrait: 'Smaller archaic braincases',
        toTrait: 'Elongated skull with occipital bun & large visual cortex',
        metric: '1,450 cm³ (Largest)',
        dx: 30,
        dy: -155,
      },
      {
        part: 'Nose & Face',
        label: 'Midfacial Projection & Nose',
        fromTrait: 'Flat nasal apertures',
        toTrait: 'Enormous projected nasal cavity to warm & humidify frigid glacial air',
        metric: 'Cold-Adapted Nasal Vault',
        dx: 50,
        dy: -120,
      },
      {
        part: 'Ribcage & Clothing',
        label: 'Barrel Chest & Hide Clothing',
        fromTrait: 'Slender tropical body build',
        toTrait: 'Broad hyper-muscular ribcage + insulated tailored fur wraps',
        metric: 'Bergmann’s Thermal Rule',
        dx: -50,
        dy: -80,
      },
    ],
  },
  {
    id: 'stage-6',
    name: 'The Symbolic Innovator',
    species: 'Homo sapiens (Modern Human)',
    epoch: 'Upper Paleolithic to Present',
    timeMa: 0.03,
    cranialVolumeCc: 1350,
    statureCm: 178,
    clothingLevel: 'tailored-sewn-tunic',
    clothingDescription: 'Upper Paleolithic tailored leather tunic, stitched with bone needles and sinew, decorated with beadwork and soft boots.',
    posture: 'gracile-modern',
    livingHabit: 'Symbolic cave wall painting, tailored clothing stitched with bone needles, spear-throwers (atlatls), musical bone flutes, agriculture, permanent settlements.',
    shelterType: 'Mammoth-Bone & Hide Dwellings / Villages',
    dietAndFood: 'Broad-spectrum omnivory, fish, foraged grains, and early domesticated crops.',
    toolInHand: 'Antler Needle, Atlatl & Micro-blade Spear (Mode 4/5)',
    socialStructure: 'Large symbolic networks, trade routes, art ceremonies, and language',
    keyEvolutionaryShift: 'High vaulted globular cranium, chin (mental trigone), complex symbolic syntax language, and rapid cultural accumulation.',
    environmentTheme: 'paleolithic-village',
    evolutionaryArrows: [
      {
        part: 'Cranium & Brain',
        label: 'Globular High Forehead',
        fromTrait: 'Low sloping forehead with brow bar',
        toTrait: 'Vertical frontal vault with expanded parietal & temporal lobes',
        metric: '1,350 cm³ Globular',
        dx: 28,
        dy: -168,
      },
      {
        part: 'Chin & Face',
        label: 'Mental Trigone (True Chin)',
        fromTrait: 'Sloping chinless jaw',
        toTrait: 'Inverted T-shaped triangular bony chin supporting articulate speech',
        metric: 'Flat Orthognathic Face',
        dx: 52,
        dy: -130,
      },
      {
        part: 'Tailored Clothing',
        label: 'Eyed Bone Needle & Tailoring',
        fromTrait: 'Crude draped untied hides',
        toTrait: 'Multi-piece tailored thermal clothing stitched with sinew threads',
        metric: 'Bone Needle Technology',
        dx: -45,
        dy: -85,
      },
      {
        part: 'Skeleton',
        label: 'Gracile High-Efficiency Frame',
        fromTrait: 'Heavy thick bone shafts',
        toTrait: 'Slender energy-efficient skeleton optimized for agility & endurance',
        metric: 'Gracile Stature 178 cm',
        dx: 45,
        dy: -30,
      },
    ],
  },
];

export const HomininEvolutionSim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { recordSimulationInteraction, addXP, triggerConfetti } = useUserLearning();

  const [currentStageIdx, setCurrentStageIdx] = useState<number>(3); // Homo erectus default
  const [activeHabitAction, setActiveHabitAction] = useState<'stride' | 'food' | 'shelter' | 'craft'>('stride');
  const [isPlayingTimeLapse, setIsPlayingTimeLapse] = useState<boolean>(false);
  const [showEvolutionArrows, setShowEvolutionArrows] = useState<boolean>(true);
  const [selectedArrow, setSelectedArrow] = useState<string | null>(null);
  const [clothingDisplayMode, setClothingDisplayMode] = useState<'with-clothing' | 'anatomical-skin'>('with-clothing');

  const stage = EVOLUTIONARY_STAGES[currentStageIdx];
  const walkCycleRef = useRef<number>(0);
  const craftStrikeTimeRef = useRef<number>(0);

  // Time-lapse auto play across millions of years
  useEffect(() => {
    let timer: number;
    if (isPlayingTimeLapse) {
      timer = window.setInterval(() => {
        setCurrentStageIdx((prev) => {
          const next = (prev + 1) % EVOLUTIONARY_STAGES.length;
          soundManager.playCursorSpark();
          if (next === EVOLUTIONARY_STAGES.length - 1) {
            triggerConfetti();
            addXP(50, 'Completed Human Evolution Time-Lapse');
          }
          return next;
        });
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlayingTimeLapse, triggerConfetti, addXP]);

  const handleNextStage = () => {
    soundManager.playHoverBlip();
    setCurrentStageIdx((prev) => (prev + 1) % EVOLUTIONARY_STAGES.length);
  };

  const handlePrevStage = () => {
    soundManager.playHoverBlip();
    setCurrentStageIdx((prev) => (prev - 1 + EVOLUTIONARY_STAGES.length) % EVOLUTIONARY_STAGES.length);
  };

  // Main Procedural Canvas Animation for Human Body & Living Habit Environment
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const cw = (canvas.width = 880);
      const ch = (canvas.height = 460);
      const groundY = ch * 0.76;

      ctx.clearRect(0, 0, cw, ch);
      walkCycleRef.current += activeHabitAction === 'stride' ? 0.06 : 0.035;
      const cycle = walkCycleRef.current;

      // ==========================================
      // 1. PROCEDURAL LIVING HABIT ENVIRONMENT
      // ==========================================
      const env = stage.environmentTheme;

      // Sky Background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      if (env === 'rainforest') {
        skyGrad.addColorStop(0, '#064e3b');
        skyGrad.addColorStop(0.6, '#047857');
        skyGrad.addColorStop(1, '#a7f3d0');
      } else if (env === 'savanna-mosaic') {
        skyGrad.addColorStop(0, '#1e3a8a');
        skyGrad.addColorStop(0.5, '#0284c7');
        skyGrad.addColorStop(0.85, '#bae6fd');
        skyGrad.addColorStop(1, '#fde68a');
      } else if (env === 'rift-valley') {
        skyGrad.addColorStop(0, '#0369a1');
        skyGrad.addColorStop(0.6, '#38bdf8');
        skyGrad.addColorStop(1, '#fed7aa');
      } else if (env === 'hearth-camp') {
        skyGrad.addColorStop(0, '#4c1d95');
        skyGrad.addColorStop(0.4, '#991b1b');
        skyGrad.addColorStop(0.7, '#ea580c');
        skyGrad.addColorStop(1, '#fef08a');
      } else if (env === 'ice-age-cave') {
        skyGrad.addColorStop(0, '#020617');
        skyGrad.addColorStop(0.6, '#0f172a');
        skyGrad.addColorStop(1, '#334155');
      } else {
        skyGrad.addColorStop(0, '#1e1b4b');
        skyGrad.addColorStop(0.5, '#4338ca');
        skyGrad.addColorStop(0.8, '#818cf8');
        skyGrad.addColorStop(1, '#fed7aa');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, cw, groundY);

      // Environment Shelters & Background Features
      if (env === 'rainforest') {
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(30, 0, 50, groundY);
        ctx.fillRect(cw - 85, 0, 65, groundY);

        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(55, 0);
        ctx.bezierCurveTo(95, 100, 75, 180, 55, 230);
        ctx.stroke();

        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.ellipse(80, 115, 55, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('Arboreal Sleeping Nest', 32, 98);
      } else if (env === 'savanna-mosaic') {
        ctx.fillStyle = '#451a03';
        ctx.fillRect(cw * 0.74 - 7, groundY - 140, 14, 140);
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.ellipse(cw * 0.74, groundY - 150, 80, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ca8a04';
        for (let g = 0; g < 32; g++) {
          const gx = g * 28;
          ctx.beginPath();
          ctx.moveTo(gx, groundY);
          ctx.lineTo(gx + 6, groundY - 18 - (g % 3) * 6);
          ctx.lineTo(gx + 12, groundY);
          ctx.fill();
        }
      } else if (env === 'hearth-camp' || env === 'ice-age-cave' || env === 'paleolithic-village') {
        const fireX = cw * 0.75;
        const fireY = groundY - 8;

        ctx.fillStyle = '#451a03';
        ctx.fillRect(fireX - 28, fireY - 4, 56, 8);

        const flameHeight = 38 + Math.sin(cycle * 4) * 8;
        const fireGrad = ctx.createRadialGradient(fireX, fireY - 15, 2, fireX, fireY - 15, 50);
        fireGrad.addColorStop(0, '#fef08a');
        fireGrad.addColorStop(0.3, '#f97316');
        fireGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.4)');
        fireGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.arc(fireX, fireY - 15, 50, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(fireX - 18, fireY);
        ctx.quadraticCurveTo(fireX, fireY - flameHeight, fireX + 18, fireY);
        ctx.fill();

        if (stage.timeMa <= 1.8) {
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(fireX - 35, fireY - 26);
          ctx.lineTo(fireX + 35, fireY - 26);
          ctx.stroke();

          ctx.fillStyle = '#7c2d12';
          ctx.beginPath();
          ctx.ellipse(fireX, fireY - 26, 16, 8, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Flying fire embers
        ctx.fillStyle = '#fde047';
        for (let s = 0; s < 5; s++) {
          const sx = fireX + Math.sin(cycle * 2 + s) * 18;
          const sy = fireY - 25 - (s * 14 + (cycle * 25) % 45);
          ctx.fillRect(sx, sy, 2.5, 2.5);
        }

        if (env === 'ice-age-cave') {
          ctx.fillStyle = '#1c1917';
          ctx.beginPath();
          ctx.moveTo(cw * 0.52, 0);
          ctx.lineTo(cw, 0);
          ctx.lineTo(cw, groundY);
          ctx.lineTo(cw * 0.62, groundY);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#fde047';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('Limestone Cave & Mammoth Bone Hearth', cw * 0.58, 45);
        }
      }

      // Ground Sedimentary Surface
      const groundGrad = ctx.createLinearGradient(0, groundY, 0, ch);
      if (env === 'rainforest') {
        groundGrad.addColorStop(0, '#14532d');
        groundGrad.addColorStop(1, '#052e16');
      } else if (env === 'ice-age-cave') {
        groundGrad.addColorStop(0, '#475569');
        groundGrad.addColorStop(1, '#0f172a');
      } else {
        groundGrad.addColorStop(0, '#78350f');
        groundGrad.addColorStop(1, '#451a03');
      }
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundY, cw, ch - groundY);

      // Footprints on the ground
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let f = 0; f < 4; f++) {
        const fx = cw * 0.36 - f * 42;
        ctx.beginPath();
        ctx.ellipse(fx, groundY + 8, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // ==========================================
      // 2. DETAILED PROCEDURAL HUMAN FIGURE
      // PERFORMING ACTUAL ACTIONS & CLOTHING
      // ==========================================
      const charX = cw * 0.42;
      const scale = stage.statureCm / 175; // Normalized height scale
      const hipBob = activeHabitAction === 'stride' ? Math.sin(cycle * 2) * (stage.posture === 'hunched-knuckle' ? 3 : 5) : Math.sin(cycle) * 2;

      // Kinematic Action Angles
      let spineLean = stage.posture === 'hunched-knuckle' ? 0.38 : stage.posture === 'habitual-upright' ? 0.16 : 0.04;
      let legStrideL = 0;
      let legStrideR = 0;
      let armAngleR = 0;
      let armAngleL = 0;
      let forearmAngleR = 0;
      let headPitch = 0;
      let jawOpen = 0;

      if (activeHabitAction === 'stride') {
        // Walking or running gait kinematics
        legStrideL = Math.sin(cycle) * 24;
        legStrideR = Math.sin(cycle + Math.PI) * 24;
        armAngleR = Math.sin(cycle) * 25;
        armAngleL = Math.sin(cycle + Math.PI) * 25;
      } else if (activeHabitAction === 'food') {
        // Eating / Roasting action: Brings hand to mouth, opens jaw to chew!
        spineLean += 0.12;
        const chewCycle = Math.sin(cycle * 3);
        jawOpen = Math.max(0, chewCycle * 5); // Chewing jaw animation
        headPitch = -0.15 + chewCycle * 0.05;
        armAngleR = -45 + Math.sin(cycle * 1.5) * 15; // Arm bends toward mouth
        forearmAngleR = -70 + Math.sin(cycle * 1.5) * 10;
        armAngleL = 10;
      } else if (activeHabitAction === 'shelter') {
        // Crouching/Resting by shelter: Lower knees, observant gaze
        spineLean += 0.18;
        headPitch = 0.1;
        armAngleR = 15;
        armAngleL = -15;
      } else if (activeHabitAction === 'craft') {
        // Tool Crafting / Flint Knapping: Striking hammerstone down against core!
        const strikePhase = (cycle * 2) % (Math.PI * 2);
        const isStrikingDown = strikePhase > Math.PI * 0.7 && strikePhase < Math.PI * 1.1;

        if (isStrikingDown) {
          craftStrikeTimeRef.current = Date.now();
        }

        spineLean += 0.14;
        armAngleL = 20; // Left hand holding core stone steady
        forearmAngleR = -25 - Math.sin(strikePhase) * 45; // Right arm raises & strikes down!
        armAngleR = -20 - Math.sin(strikePhase) * 35;
      }

      ctx.save();
      ctx.translate(charX, groundY - hipBob);
      ctx.scale(scale, scale);

      // Ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 4 + hipBob, 28, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Skin & Fur Colors
      const skinColor =
        stage.clothingLevel === 'none-dense-fur'
          ? '#3b2f2f'
          : stage.clothingLevel === 'none-sparse-hair'
          ? '#5c4033'
          : stage.clothingLevel === 'pelt-loincloth'
          ? '#78350f'
          : stage.clothingLevel === 'ice-age-parka'
          ? '#d4a373'
          : '#c68642';

      const showClothing = clothingDisplayMode === 'with-clothing';

      // 1. Back Left Leg
      ctx.strokeStyle = skinColor;
      ctx.lineWidth = stage.posture === 'robust-cold' ? 12 : 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-5, -60);
      ctx.lineTo(-5 + legStrideL * 0.6, -30);
      ctx.lineTo(-3 + legStrideL, 0);
      ctx.stroke();

      // Ice Age Leather Leg Wraps (Gaiters / Moccasins)
      if (showClothing && (stage.clothingLevel === 'ice-age-parka' || stage.clothingLevel === 'tailored-sewn-tunic')) {
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 11;
        ctx.beginPath();
        ctx.moveTo(-5 + legStrideL * 0.6, -26);
        ctx.lineTo(-3 + legStrideL, 0);
        ctx.stroke();

        // Sinew cross-lacing
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;
        for (let l = 0; l < 3; l++) {
          const ly = -20 + l * 8;
          ctx.beginPath();
          ctx.moveTo(-9 + legStrideL * 0.8, ly);
          ctx.lineTo(-1 + legStrideL * 0.8, ly + 4);
          ctx.stroke();
        }
      }

      // Foot & Toes
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      if (stage.id === 'stage-1') {
        ctx.ellipse(-3 + legStrideL + 4, 0, 7, 4, 0.4, 0, Math.PI * 2); // Grasping ape hallux
      } else {
        ctx.ellipse(-3 + legStrideL + 5, 0, 8, 3.5, 0, 0, Math.PI * 2); // Arched foot
      }
      ctx.fill();

      // 2. Torso / Ribcage & Detailed Clothing
      ctx.save();
      ctx.translate(0, -60);
      ctx.rotate(spineLean);

      // Anatomical Torso Base
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.ellipse(0, -22, stage.posture === 'robust-cold' ? 16 : 13, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dense Fur Texture (Stage 1 & 2)
      if (stage.clothingLevel === 'none-dense-fur' || stage.clothingLevel === 'none-sparse-hair') {
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 1.5;
        for (let h = -12; h <= 12; h += 4) {
          ctx.beginPath();
          ctx.moveTo(h, -35);
          ctx.lineTo(h + 2, -28);
          ctx.stroke();
        }
      }

      // CLOTHING PROGRESSION LAYERS:
      if (showClothing) {
        if (stage.clothingLevel === 'fiber-waistband') {
          // Stage 3: Braided plant fiber cord + animal skin apron
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-13, 0);
          ctx.lineTo(13, 0);
          ctx.stroke();

          ctx.fillStyle = '#713f12';
          ctx.beginPath();
          ctx.moveTo(-8, 0);
          ctx.lineTo(8, 0);
          ctx.lineTo(6, 14);
          ctx.lineTo(-6, 14);
          ctx.closePath();
          ctx.fill();
        } else if (stage.clothingLevel === 'pelt-loincloth') {
          // Stage 4: Homo erectus Animal Pelt Kilt
          ctx.fillStyle = '#854d0e';
          ctx.beginPath();
          ctx.moveTo(-14, -6);
          ctx.lineTo(14, -6);
          ctx.lineTo(12, 18);
          ctx.lineTo(-12, 18);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (stage.clothingLevel === 'ice-age-parka') {
          // Stage 5: Neanderthal Double-Layer Fur Cloak / Parka
          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.moveTo(-18, -44);
          ctx.lineTo(18, -44);
          ctx.lineTo(20, 16);
          ctx.lineTo(-20, 16);
          ctx.closePath();
          ctx.fill();

          // Fur trim
          ctx.fillStyle = '#d4d4d4';
          ctx.beginPath();
          ctx.ellipse(0, -42, 18, 5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Bone pin fastener
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-4, -36);
          ctx.lineTo(6, -30);
          ctx.stroke();
        } else if (stage.clothingLevel === 'tailored-sewn-tunic') {
          // Stage 6: Upper Paleolithic Tailored Sewn Leather Tunic
          ctx.fillStyle = '#92400e';
          ctx.beginPath();
          ctx.moveTo(-16, -42);
          ctx.lineTo(16, -42);
          ctx.lineTo(17, 18);
          ctx.lineTo(-17, 18);
          ctx.closePath();
          ctx.fill();

          // Stitched Fringe Hem with Sinew
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.5;
          for (let f = -15; f <= 15; f += 3) {
            ctx.beginPath();
            ctx.moveTo(f, 18);
            ctx.lineTo(f, 24);
            ctx.stroke();
          }

          // Sea Shell / Animal Tooth Necklace
          ctx.fillStyle = '#fef3c7';
          for (let b = -3; b <= 3; b++) {
            ctx.beginPath();
            ctx.arc(b * 3.5, -34 + Math.abs(b) * 1.5, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 3. Neck & Articulated Cranium
      ctx.save();
      ctx.translate(2, -48);
      ctx.rotate(headPitch);

      const prognathism = stage.id === 'stage-1' ? 16 : stage.id === 'stage-2' ? 12 : stage.id === 'stage-3' ? 9 : stage.id === 'stage-4' ? 6 : 2;
      const cranialVaultHeight = (stage.cranialVolumeCc / 1450) * 18;

      // High Globular Cranium Vault
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(0, -12, 11 + cranialVaultHeight * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Facial profile (Ape snout vs modern flat face)
      ctx.beginPath();
      ctx.moveTo(6, -14);
      ctx.lineTo(10 + prognathism, -4);
      ctx.lineTo(8 + prognathism * 0.7, 4 + jawOpen);
      ctx.lineTo(stage.id === 'stage-6' ? 4 : 0, 6 + jawOpen);
      ctx.lineTo(-4, 4);
      ctx.closePath();
      ctx.fill();

      // Brow Ridge
      if (stage.id !== 'stage-6') {
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(4, -14, 8, 3.5);
      }

      // Eye & Blink
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(6, -9, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(7, -9, 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Head Hair
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(-2, -14, 12, Math.PI * 0.8, Math.PI * 1.9);
      ctx.fill();

      ctx.restore(); // Restore head
      ctx.restore(); // Restore torso

      // 4. Front Right Leg
      ctx.strokeStyle = skinColor;
      ctx.lineWidth = stage.posture === 'robust-cold' ? 13 : 10;
      ctx.beginPath();
      ctx.moveTo(3, -60);
      ctx.lineTo(3 + legStrideR * 0.6, -30);
      ctx.lineTo(5 + legStrideR, 0);
      ctx.stroke();

      // Front Leg Wrap (Stage 5/6)
      if (showClothing && (stage.clothingLevel === 'ice-age-parka' || stage.clothingLevel === 'tailored-sewn-tunic')) {
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 11;
        ctx.beginPath();
        ctx.moveTo(3 + legStrideR * 0.6, -26);
        ctx.lineTo(5 + legStrideR, 0);
        ctx.stroke();
      }

      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.ellipse(5 + legStrideR + 5, 0, 8, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 5. Right Arm & Tool / Food / Crafting
      ctx.save();
      ctx.translate(6, -100);
      ctx.rotate((armAngleR * Math.PI) / 180);
      ctx.strokeStyle = skinColor;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(10, 22);
      ctx.stroke();

      // Forearm & Hand with Tool
      ctx.translate(10, 22);
      ctx.rotate((forearmAngleR * Math.PI) / 180);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(8, 20);
      ctx.stroke();

      // Hand Item / Tool / Food Render based on action
      ctx.translate(8, 20);
      if (activeHabitAction === 'food') {
        // Holding roasted skewer or wild fig
        ctx.fillStyle = stage.timeMa <= 1.8 ? '#7c2d12' : '#15803d';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (activeHabitAction === 'craft') {
        // Holding hammerstone with strike sparks!
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Spark particles if recently struck
        if (Date.now() - craftStrikeTimeRef.current < 200) {
          ctx.fillStyle = '#fef08a';
          for (let sp = 0; sp < 6; sp++) {
            const sx = (Math.random() - 0.5) * 24;
            const sy = (Math.random() - 0.5) * 24;
            ctx.fillRect(sx, sy, 3, 3);
          }
        }
      } else {
        // Stride: Holding specific cultural tool
        if (stage.id === 'stage-1') {
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-2, -6);
          ctx.lineTo(8, 14);
          ctx.stroke();
        } else if (stage.id === 'stage-4') {
          // Teardrop Handaxe
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(8, 2);
          ctx.lineTo(0, 8);
          ctx.lineTo(-8, 2);
          ctx.closePath();
          ctx.fill();
        } else if (stage.id === 'stage-5') {
          // Mousterian Spear
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-10, 24);
          ctx.lineTo(10, -45);
          ctx.stroke();
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.moveTo(10, -45);
          ctx.lineTo(14, -58);
          ctx.lineTo(7, -54);
          ctx.closePath();
          ctx.fill();
        } else if (stage.id === 'stage-6') {
          // Atlatl Spear
          ctx.strokeStyle = '#a16207';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-8, 18);
          ctx.lineTo(14, -38);
          ctx.stroke();
        }
      }
      ctx.restore();

      // ==========================================
      // 3. EVOLUTIONARY TRAJECTORY ARROWS OVERLAY
      // Shows exactly how anatomy transformed
      // ==========================================
      if (showEvolutionArrows) {
        stage.evolutionaryArrows.forEach((arrow, aIdx) => {
          const arrowStartX = arrow.dx > 0 ? arrow.dx + 55 : arrow.dx - 55;
          const arrowStartY = arrow.dy - 15;
          const arrowTargetX = arrow.dx;
          const arrowTargetY = arrow.dy;

          ctx.save();
          // Glowing Callout Arrow
          ctx.strokeStyle = '#f59e0b';
          ctx.fillStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 2]);

          // Line to target point
          ctx.beginPath();
          ctx.moveTo(arrowStartX, arrowStartY);
          ctx.lineTo(arrowTargetX, arrowTargetY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Arrowhead
          ctx.beginPath();
          ctx.arc(arrowTargetX, arrowTargetY, 4, 0, Math.PI * 2);
          ctx.fill();

          // Text Label Box
          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1;

          const textWidth = ctx.measureText(arrow.label).width;
          const boxX = arrow.dx > 0 ? arrowStartX : arrowStartX - textWidth - 50;
          const boxY = arrowStartY - 16;

          ctx.fillRect(boxX, boxY, textWidth + 50, 24);
          ctx.strokeRect(boxX, boxY, textWidth + 50, 24);

          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(`➔ ${arrow.label}`, boxX + 6, boxY + 12);
          ctx.fillStyle = '#38bdf8';
          ctx.font = '9px monospace';
          ctx.fillText(arrow.metric, boxX + 6, boxY + 21);

          ctx.restore();
        });
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [currentStageIdx, activeHabitAction, stage, showEvolutionArrows, clothingDisplayMode]);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 md:p-6 shadow-2xl space-y-6">
      {/* Simulation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30">
              <Footprints className="w-4 h-4" />
            </span>
            <h3 className="text-xl font-bold font-display text-slate-100">
              7-Million-Year Human Evolution: Anatomical Morphing & Living Habits
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Watch the human figure perform daily living actions, observe clothing progression, and follow anatomical trajectory arrows showing how appearances evolved.
          </p>
        </div>

        {/* Global Controls: Time-Lapse & Evolution Arrows */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Evolution Arrows Toggle */}
          <button
            onClick={() => setShowEvolutionArrows(!showEvolutionArrows)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              showEvolutionArrows
                ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{showEvolutionArrows ? 'Evolution Arrows: ON' : 'Show Trajectory Arrows'}</span>
          </button>

          {/* Clothing View Toggle */}
          <button
            onClick={() => setClothingDisplayMode(clothingDisplayMode === 'with-clothing' ? 'anatomical-skin' : 'with-clothing')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
          >
            <Shirt className="w-3.5 h-3.5 text-sky-400" />
            <span>{clothingDisplayMode === 'with-clothing' ? 'Clothing: Visible' : 'Anatomical Skin View'}</span>
          </button>

          {/* Auto Time-Lapse Play */}
          <button
            onClick={() => setIsPlayingTimeLapse(!isPlayingTimeLapse)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              isPlayingTimeLapse
                ? 'bg-amber-500 text-slate-950 animate-pulse'
                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {isPlayingTimeLapse ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlayingTimeLapse ? 'Time-Lapse: Morphing...' : 'Play 7 Ma Morph'}</span>
          </button>
        </div>
      </div>

      {/* Evolutionary Stage Timeline Cards with Flow Arrows */}
      <div className="relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {EVOLUTIONARY_STAGES.map((s, idx) => {
            const isSelected = idx === currentStageIdx;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentStageIdx(idx);
                  soundManager.playHoverBlip();
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.25)] text-slate-100'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <div className="text-[10px] font-mono text-amber-400 font-bold">{s.timeMa} Ma</div>
                <div className="font-bold text-xs truncate mt-0.5">{s.name.split(' ')[1] || s.name}</div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5">{s.species.split(' ')[0]}</div>

                {/* Connecting Milestone Arrow */}
                {idx < EVOLUTIONARY_STAGES.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-amber-500/50 group-hover:text-amber-400">
                    ➔
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Procedural Animation Stage */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={880}
          height={460}
          className="w-full h-80 sm:h-96 md:h-[460px] object-cover block"
        />

        {/* Top-Left Stage HUD: Name & Stature */}
        <div className="absolute top-4 left-4 bg-slate-950/85 border border-slate-800 backdrop-blur-md p-3.5 rounded-2xl shadow-xl max-w-sm pointer-events-none space-y-1">
          <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{stage.epoch} · {stage.timeMa} Million Years Ago</span>
          </div>
          <h4 className="text-base font-bold text-slate-100 font-display">{stage.name}</h4>
          <div className="text-xs text-amber-300 italic">{stage.species}</div>
          <div className="text-[11px] text-slate-300 pt-1 leading-snug">
            {stage.keyEvolutionaryShift}
          </div>
        </div>

        {/* Top-Right Telemetry: Brain, Stature & Clothing */}
        <div className="absolute top-4 right-4 bg-slate-950/85 border border-slate-800 backdrop-blur-md p-3 rounded-2xl shadow-xl max-w-xs pointer-events-none space-y-1.5 font-mono text-xs">
          <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider">
            <span>Cranial Brain Volume</span>
            <span className="text-sky-400 font-bold">{stage.cranialVolumeCc} cm³</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-sky-400 transition-all duration-500"
              style={{ width: `${(stage.cranialVolumeCc / 1500) * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            <span>Stature Height</span>
            <span className="text-amber-400 font-bold">{stage.statureCm} cm</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>Clothing Layer</span>
            <span className="text-emerald-400 font-bold capitalize">{stage.clothingLevel.replace(/-/g, ' ')}</span>
          </div>
        </div>

        {/* Bottom Interactive Habit Actions Bar */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
            <span className="text-[11px] font-mono text-amber-400 font-bold px-2 hidden sm:inline">Action:</span>
            {[
              { id: 'stride', label: '🚶 Bipedal Walk / Run', desc: 'Active Locomotion & Gait' },
              { id: 'food', label: '🍖 Forage & Eat', desc: 'Chewing & Roasting Meat' },
              { id: 'shelter', label: '🏕️ Shelter & Rest', desc: 'Dwelling & Safety' },
              { id: 'craft', label: '🛠️ Knap Flint & Craft', desc: 'Striking Stone & Sparks' },
            ].map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  setActiveHabitAction(action.id as typeof activeHabitAction);
                  soundManager.playHoverBlip();
                  if (action.id === 'craft') soundManager.playFlintStrike();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  activeHabitAction === action.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md text-[11px] font-mono text-amber-300">
            Active Tool: <span className="font-bold text-white">{stage.toolInHand}</span>
          </div>
        </div>
      </div>

      {/* Evolutionary Trajectory Breakdown: Detailed Arrows Summary */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 border border-amber-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase">
            <ArrowRight className="w-4 h-4" />
            <span>Active Anatomical Transformation Trajectory ({stage.name})</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {stage.evolutionaryArrows.length} Critical Anatomical Shifts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {stage.evolutionaryArrows.map((arrow, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs"
            >
              <div className="font-bold text-amber-300 flex items-center justify-between">
                <span>{arrow.part}</span>
                <span className="text-[10px] font-mono text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-500/30">
                  {arrow.metric}
                </span>
              </div>
              <div className="text-slate-400 text-[11px]">
                <span className="line-through text-slate-500">{arrow.fromTrait}</span> ➔ <span className="text-slate-200">{arrow.toTrait}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Living Habits Deep Dive Matrix: Clothing, Food, Shelter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Habit Card 1: Clothing Evolution */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 uppercase">
            <Shirt className="w-3.5 h-3.5" />
            <span>Clothing & Thermal Protection</span>
          </div>
          <div className="font-bold text-sm text-slate-100 capitalize">
            {stage.clothingLevel.replace(/-/g, ' ')}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{stage.clothingDescription}</p>
        </div>

        {/* Habit Card 2: Diet & Food Processing */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
            <Flame className="w-3.5 h-3.5" />
            <span>Dietary & Cooking Evolution</span>
          </div>
          <div className="font-bold text-sm text-slate-100">
            {stage.timeMa <= 1.8 ? 'Cooked & Pre-Digested Nutrition' : 'Raw Foraged Plant & Bone Scavenging'}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{stage.dietAndFood}</p>
        </div>

        {/* Habit Card 3: Shelter & Living Habits */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase">
            <Home className="w-3.5 h-3.5" />
            <span>Dwelling & Shelter Habit</span>
          </div>
          <div className="font-bold text-sm text-slate-100">{stage.shelterType}</div>
          <p className="text-xs text-slate-300 leading-relaxed">{stage.livingHabit}</p>
        </div>
      </div>
    </div>
  );
};
