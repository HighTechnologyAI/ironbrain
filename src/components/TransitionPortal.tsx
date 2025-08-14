import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TransitionPortalProps {
  isActive: boolean;
  onComplete: () => void;
}

const TransitionPortal = ({ isActive, onComplete }: TransitionPortalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [phase, setPhase] = useState<'kraken' | 'door' | 'portal' | 'consume' | 'complete'>('kraken');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    let startTime = Date.now();
    const PHASE_DURATION = 1200; // milliseconds per phase

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const phaseProgress = Math.min(elapsed / PHASE_DURATION, 1);
      
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      ctx.clearRect(0, 0, w, h);

      if (phase === 'kraken') {
        drawKrakenAttraction(ctx, w, h, phaseProgress);
        if (phaseProgress >= 1) {
          setPhase('door');
          startTime = Date.now();
        }
      } else if (phase === 'door') {
        drawDoorSlide(ctx, w, h, phaseProgress);
        if (phaseProgress >= 1) {
          setPhase('portal');
          startTime = Date.now();
        }
      } else if (phase === 'portal') {
        drawCyberPortal(ctx, w, h, phaseProgress);
        if (phaseProgress >= 1) {
          setPhase('consume');
          startTime = Date.now();
        }
      } else if (phase === 'consume') {
        drawConsumption(ctx, w, h, phaseProgress);
        if (phaseProgress >= 1) {
          setPhase('complete');
          navigate('/');
          setTimeout(() => {
            onComplete();
          }, 500);
          return;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resize);
    };
  }, [isActive, phase, navigate, onComplete]);

  const drawKrakenAttraction = (ctx: CanvasRenderingContext2D, w: number, h: number, progress: number) => {
    // Dark overlay
    ctx.fillStyle = `rgba(13, 13, 13, ${progress * 0.7})`;
    ctx.fillRect(0, 0, w, h);

    // Kraken position (left side)
    const krakenX = w * 0.2;
    const krakenY = h * 0.6;

    // Energy beams from kraken to user
    const userX = w * 0.5;
    const userY = h * 0.5;

    for (let i = 0; i < 8; i++) {
      const offset = (i / 8) * Math.PI * 2;
      const waveOffset = Math.sin(Date.now() * 0.01 + offset) * 20;
      
      ctx.strokeStyle = `rgba(255, 211, 0, ${0.6 * progress})`;
      ctx.lineWidth = 3 + Math.sin(Date.now() * 0.005 + offset) * 2;
      
      ctx.beginPath();
      ctx.moveTo(krakenX + waveOffset, krakenY);
      
      // Curved beam
      const midX = (krakenX + userX) / 2 + Math.sin(Date.now() * 0.008 + offset) * 50;
      const midY = (krakenY + userY) / 2 + Math.cos(Date.now() * 0.008 + offset) * 30;
      
      ctx.quadraticCurveTo(midX, midY, userX, userY);
      ctx.stroke();
    }

    // Pulsing energy at user position
    const pulse = Math.sin(Date.now() * 0.02) * 0.5 + 0.5;
    const radius = 50 + pulse * 30;
    
    const gradient = ctx.createRadialGradient(userX, userY, 0, userX, userY, radius);
    gradient.addColorStop(0, `rgba(255, 211, 0, ${0.8 * progress})`);
    gradient.addColorStop(1, 'rgba(255, 211, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(userX, userY, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawDoorSlide = (ctx: CanvasRenderingContext2D, w: number, h: number, progress: number) => {
    // Background portal energy
    ctx.fillStyle = 'rgba(0, 20, 40, 0.9)';
    ctx.fillRect(0, 0, w, h);

    // Door slide effect - auth window moves to the side
    const slideDistance = w * 0.6 * progress;
    const authX = w * 0.5 - slideDistance;
    const authY = h * 0.25;
    const authW = w * 0.4;
    const authH = h * 0.5;

    // Draw sliding auth window
    ctx.save();
    ctx.globalAlpha = 1 - progress * 0.3;
    
    // Window frame
    ctx.strokeStyle = `rgba(255, 211, 0, 0.8)`;
    ctx.lineWidth = 2;
    ctx.strokeRect(authX, authY, authW, authH);
    
    // Window content blur
    ctx.fillStyle = `rgba(13, 13, 13, 0.6)`;
    ctx.fillRect(authX, authY, authW, authH);
    
    ctx.restore();

    // Portal energy behind the door
    if (progress > 0.3) {
      const portalProgress = (progress - 0.3) / 0.7;
      drawPortalEnergyRings(ctx, w * 0.7, h * 0.5, portalProgress);
    }
  };

  const drawCyberPortal = (ctx: CanvasRenderingContext2D, w: number, h: number, progress: number) => {
    // Dark cyber space
    ctx.fillStyle = 'rgba(5, 10, 25, 0.95)';
    ctx.fillRect(0, 0, w, h);

    const centerX = w * 0.7;
    const centerY = h * 0.5;

    // Portal rings
    for (let i = 0; i < 12; i++) {
      const ringProgress = (progress + i * 0.1) % 1;
      const radius = 50 + ringProgress * 300;
      const alpha = Math.max(0, 1 - ringProgress);
      
      ctx.strokeStyle = `rgba(0, 255, 200, ${alpha * 0.6})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner glow
      if (i % 3 === 0) {
        ctx.strokeStyle = `rgba(255, 211, 0, ${alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Portal vortex
    const vortexRadius = 80 + Math.sin(Date.now() * 0.01) * 20;
    const vortexGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, vortexRadius
    );
    vortexGradient.addColorStop(0, `rgba(0, 255, 200, ${0.8 * progress})`);
    vortexGradient.addColorStop(0.7, `rgba(255, 211, 0, ${0.4 * progress})`);
    vortexGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = vortexGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, vortexRadius, 0, Math.PI * 2);
    ctx.fill();

    // Data streams
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + Date.now() * 0.005;
      const distance = 100 + Math.sin(Date.now() * 0.008 + i) * 50;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      ctx.fillStyle = `rgba(0, 255, 200, 0.8)`;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawConsumption = (ctx: CanvasRenderingContext2D, w: number, h: number, progress: number) => {
    // Portal center
    const centerX = w * 0.7;
    const centerY = h * 0.5;

    // Consumption vortex
    const vortexSize = 150 * (1 + progress * 3);
    
    // Create swirling effect
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(Date.now() * 0.02);
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const spiralRadius = vortexSize * (1 - progress * 0.5);
      
      ctx.strokeStyle = `rgba(0, 255, 200, ${(1 - progress) * 0.8})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, spiralRadius + i * 10, angle, angle + Math.PI / 4);
      ctx.stroke();
    }
    
    ctx.restore();

    // Screen distortion overlay
    const distortAlpha = progress * 0.9;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, w);
    gradient.addColorStop(0, `rgba(0, 255, 200, ${distortAlpha})`);
    gradient.addColorStop(0.3, `rgba(255, 211, 0, ${distortAlpha * 0.5})`);
    gradient.addColorStop(1, `rgba(5, 10, 25, ${distortAlpha})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Final flash
    if (progress > 0.8) {
      const flashAlpha = (progress - 0.8) / 0.2;
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.7})`;
      ctx.fillRect(0, 0, w, h);
    }
  };

  const drawPortalEnergyRings = (ctx: CanvasRenderingContext2D, x: number, y: number, progress: number) => {
    for (let i = 0; i < 6; i++) {
      const radius = 30 + i * 20 + progress * 50;
      const alpha = Math.max(0, 1 - progress) * (1 - i * 0.1);
      
      ctx.strokeStyle = `rgba(0, 255, 200, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: 'transparent' }}
      />
    </div>
  );
};

export default TransitionPortal;