import React, { useEffect, useRef } from 'react';
import { useUserLearning } from '../../context/UserLearningContext';
import { soundManager } from '../../services/audioSynthesizer';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  color: string;
  pulseSpeed: number;
}

interface CosmicRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export const AmbientCosmicParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { state } = useUserLearning();
  const ripplesRef = useRef<CosmicRipple[]>([]);

  // Choose palette according to active historical era
  const getEraPalette = () => {
    switch (state.currentEraId) {
      case 'big-bang':
        return {
          primary: '#f59e0b',
          secondary: '#ef4444',
          tertiary: '#38bdf8',
          nebulaA: 'rgba(245, 158, 11, 0.04)',
          nebulaB: 'rgba(239, 68, 68, 0.03)',
        };
      case 'before-dinosaurs':
        return {
          primary: '#10b981',
          secondary: '#06b6d4',
          tertiary: '#14b8a6',
          nebulaA: 'rgba(16, 185, 129, 0.04)',
          nebulaB: 'rgba(6, 182, 212, 0.03)',
        };
      case 'dinosaurs':
        return {
          primary: '#f97316',
          secondary: '#eab308',
          tertiary: '#ea580c',
          nebulaA: 'rgba(249, 115, 22, 0.04)',
          nebulaB: 'rgba(234, 179, 8, 0.03)',
        };
      case 'human-evolution':
        return {
          primary: '#f59e0b',
          secondary: '#fb923c',
          tertiary: '#38bdf8',
          nebulaA: 'rgba(245, 158, 11, 0.04)',
          nebulaB: 'rgba(56, 189, 248, 0.03)',
        };
      default:
        return {
          primary: '#f59e0b',
          secondary: '#38bdf8',
          tertiary: '#ffffff',
          nebulaA: 'rgba(245, 158, 11, 0.04)',
          nebulaB: 'rgba(56, 189, 248, 0.03)',
        };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse parallax tracking
    let mouseX = width / 2;
    let mouseY = height / 2;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Interactive cosmic click ripple
    const handleClick = (e: MouseEvent) => {
      // Ignore clicks on buttons/inputs
      const target = e.target as HTMLElement;
      if (target.closest('button, input, select, textarea, a')) return;

      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        maxRadius: 180,
        alpha: 0.9,
        color: '#f59e0b',
      });

      // Harmonious chime note on cosmic click!
      soundManager.playMusicalNote(Math.floor(Math.random() * 6));
    };
    window.addEventListener('click', handleClick);

    // Initialize 85 particles
    const palette = getEraPalette();
    const colors = [palette.primary, palette.secondary, palette.tertiary, '#ffffff', '#fed7aa'];
    const particles: Particle[] = [];
    const count = Math.min(85, Math.floor(width / 20));

    for (let i = 0; i < count; i++) {
      const baseAlpha = 0.2 + Math.random() * 0.6;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: 1 + Math.random() * 2.2,
        alpha: baseAlpha,
        baseAlpha,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulseSpeed: 0.01 + Math.random() * 0.02,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Drifting Atmospheric Nebula Gas Clouds
      const time = Date.now() * 0.0003;
      const nebGrad1 = ctx.createRadialGradient(
        width * 0.3 + Math.sin(time) * 100,
        height * 0.3 + Math.cos(time) * 80,
        10,
        width * 0.3,
        height * 0.3,
        width * 0.5
      );
      nebGrad1.addColorStop(0, palette.nebulaA);
      nebGrad1.addColorStop(1, 'transparent');
      ctx.fillStyle = nebGrad1;
      ctx.fillRect(0, 0, width, height);

      const nebGrad2 = ctx.createRadialGradient(
        width * 0.7 - Math.cos(time * 0.8) * 80,
        height * 0.6 + Math.sin(time * 0.8) * 100,
        10,
        width * 0.7,
        height * 0.6,
        width * 0.6
      );
      nebGrad2.addColorStop(0, palette.nebulaB);
      nebGrad2.addColorStop(1, 'transparent');
      ctx.fillStyle = nebGrad2;
      ctx.fillRect(0, 0, width, height);

      // 2. Render Interactive Celestial Shockwave Ripples
      for (let r = ripplesRef.current.length - 1; r >= 0; r--) {
        const rp = ripplesRef.current[r];
        rp.radius += 4;
        rp.alpha -= 0.02;

        if (rp.alpha <= 0 || rp.radius >= rp.maxRadius) {
          ripplesRef.current.splice(r, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = rp.color;
        ctx.globalAlpha = Math.max(0, rp.alpha);
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Constellation Links between close stars
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // 4. Update and render particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Mouse avoidance/repulsion
        const mdx = p.x - mouseX;
        const mdy = p.y - mouseY;
        const mdist = Math.hypot(mdx, mdy);
        if (mdist < 100 && mdist > 5) {
          p.x += (mdx / mdist) * 0.8;
          p.y += (mdy / mdist) * 0.8;
        }

        // Screen wrap
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Twinkle
        p.alpha = p.baseAlpha + Math.sin(Date.now() * p.pulseSpeed) * 0.25;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.05, Math.min(0.9, p.alpha));
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animId);
    };
  }, [state.currentEraId]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 will-change-transform"
      style={{ opacity: 0.85 }}
    />
  );
};
