import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  r: number;
  phase: number;
}

interface Tentacle {
  baseAngle: number;
  len: number;
  phase: number;
  width: number;
}

interface Drop {
  y: number;
  speed: number;
}

const CyberBackground = () => {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const matrixCanvasRef = useRef<HTMLCanvasElement>(null);
  const hudCanvasRef = useRef<HTMLCanvasElement>(null);
  const krakenCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0, nx: 0, ny: 0 });
  const nodesRef = useRef<Node[]>([]);
  const tentaclesRef = useRef<Tentacle[]>([]);
  const dropsRef = useRef<Drop[]>([]);
  const krakenRef = useRef({ x: -400, y: 0, speed: 0.18 });
  const matrixRef = useRef({ fontSize: 16, cols: 0 });

  const COLORS = {
    RICH_BLACK: '#0D0D0D',
    VIVAD_YELLOW: '#FFD300',
    Y_GHOST_08: 'rgba(255,211,0,0.08)',
    Y_GHOST_12: 'rgba(255,211,0,0.12)',
    Y_GHOST_20: 'rgba(255,211,0,0.20)',
    Y_GHOST_30: 'rgba(255,211,0,0.30)',
    BLACK_85: 'rgba(13,13,13,0.85)',
    WHITE_05: 'rgba(255,255,255,0.05)'
  };

  const createCtx = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    
    resize();
    return { ctx, resize };
  };

  const getGlyph = () => {
    const r = Math.random();
    if (r < 0.7) return Math.random() > 0.5 ? '0' : '1';
    if (r < 0.95) return '0123456789ABCDEF'[Math.floor(Math.random() * 16)];
    const tokens = ['UAV', 'IMU', 'RTK', 'AI', 'VIO', 'LIDAR', 'EMS', 'FIRE', 'POL', 'RESC', 'AGRO', 'STAR'];
    return tokens[Math.floor(Math.random() * tokens.length)];
  };

  const setupMatrix = (w: number) => {
    const matrix = matrixRef.current;
    matrix.cols = Math.max(1, Math.floor(w / matrix.fontSize));
    dropsRef.current = Array(matrix.cols).fill(0).map(() => ({
      y: Math.random() * 50,
      speed: 1 + Math.random() * 2.2
    }));
  };

  const setupNodes = (w: number, h: number) => {
    const count = 36;
    nodesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 2 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2
    }));
  };

  const setupKraken = (w: number, h: number) => {
    const kraken = krakenRef.current;
    kraken.y = h * 0.55;
    kraken.x = -w * 0.35;
    
    const count = 8;
    tentaclesRef.current = Array.from({ length: count }, (_, i) => ({
      baseAngle: (-Math.PI / 6) + (i / (count - 1)) * (Math.PI / 3),
      len: 340 + Math.random() * 120,
      phase: Math.random() * Math.PI * 2,
      width: 3 - (i / count) * 1.5
    }));
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = COLORS.RICH_BLACK;
    ctx.fillRect(0, 0, w, h);

    // Noise effect
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 120; i++) {
      ctx.fillStyle = COLORS.WHITE_05;
      const x = (i * 73 + (t * 0.05) % w) % w;
      const y = (i * 131 + (t * 0.08) % h) % h;
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;

    // Pulsing glows
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.0011);
    const r1 = 220 + 60 * pulse;
    const r2 = 140 + 40 * (1 - pulse);
    
    drawRadialGlow(ctx, w * 0.18, h * 0.22, r1, COLORS.Y_GHOST_12);
    drawRadialGlow(ctx, w * 0.82, h * 0.72, r2, COLORS.Y_GHOST_08);
  };

  const drawRadialGlow = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) => {
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawMatrix = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    const matrix = matrixRef.current;
    let drops = dropsRef.current;
    
    if (!matrix.cols || !drops.length) {
      setupMatrix(w);
      drops = dropsRef.current;
    }

    ctx.fillStyle = 'rgba(13,13,13,0.15)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = COLORS.VIVAD_YELLOW;
    ctx.font = `${matrix.fontSize}px ui-monospace, monospace`;

    const mouse = mouseRef.current;
    const parX = mouse.nx * 4;
    
    for (let i = 0; i < Math.min(matrix.cols, drops.length); i++) {
      const drop = drops[i];
      if (!drop) continue;
      
      const x = i * matrix.fontSize + parX;
      const y = drop.y * matrix.fontSize;
      const glyph = getGlyph();
      ctx.fillText(glyph, x, y);

      if (y > h && Math.random() > 0.975) drop.y = 0;
      drop.y += drop.speed;
    }
  };

  const drawHUD = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    let nodes = nodesRef.current;
    const mouse = mouseRef.current;
    
    if (!nodes.length) {
      setupNodes(w, h);
      nodes = nodesRef.current;
    }
    
    ctx.clearRect(0, 0, w, h);
    
    // Grid
    ctx.strokeStyle = COLORS.Y_GHOST_20;
    ctx.lineWidth = 1;
    const step = 80;
    const off = (t * 0.01) % step;
    ctx.beginPath();
    for (let x = -step + off; x < w; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = -step + off; y < h; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Central circles
    const cx = w * 0.5 + mouse.nx * 8;
    const cy = h * 0.5 + mouse.ny * 6;
    ctx.strokeStyle = COLORS.Y_GHOST_30;
    for (let r = 120; r <= 360; r += 60) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Rotating sector
    const ang = (t * 0.001) % (Math.PI * 2);
    ctx.beginPath();
    ctx.arc(cx, cy, 220, ang, ang + Math.PI / 12);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,211,0,0.08)';
    ctx.fill();

    // Nodes and connections
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = COLORS.Y_GHOST_20;
    ctx.fillStyle = COLORS.Y_GHOST_30;

    // Connect nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        if (d < 140) {
          ctx.globalAlpha = 1 - d / 140;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    // Draw nodes
    for (const n of nodes) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.003 + n.phase);
      const rr = n.r + pulse * 1.5;
      ctx.beginPath();
      ctx.arc(n.x, n.y, rr, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawKraken = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    const kraken = krakenRef.current;
    let tentacles = tentaclesRef.current;
    const mouse = mouseRef.current;
    
    if (!tentacles.length) {
      setupKraken(w, h);
      tentacles = tentaclesRef.current;
    }
    
    ctx.clearRect(0, 0, w, h);

    const targetBiasX = mouse.nx * 25;
    const targetBiasY = mouse.ny * 15;
    kraken.x += kraken.speed;
    const driftY = Math.sin(t * 0.0006) * 0.3;
    kraken.y += driftY + (targetBiasY - 0.02 * kraken.y) * 0.0001;

    if (kraken.x > w + 420) kraken.x = -420;

    const cx = kraken.x + 220 + targetBiasX * 0.2;
    const cy = kraken.y - 40;

    // Body core
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = COLORS.Y_GHOST_12;
    ctx.lineWidth = 2;

    // Central capsule
    drawRoundedCapsule(ctx, -90, -28, 180, 56, 26);
    ctx.stroke();

    // Body panels
    ctx.beginPath();
    ctx.moveTo(-70, -10); ctx.lineTo(-15, -22); ctx.lineTo(15, -22); ctx.lineTo(70, -10);
    ctx.moveTo(-70, 10); ctx.lineTo(-15, 22); ctx.lineTo(15, 22); ctx.lineTo(70, 10);
    ctx.stroke();

    // Eyes with glow
    drawGlowDot(ctx, -26, -6, 4);
    drawGlowDot(ctx, 26, -6, 4);

    // Vents
    ctx.beginPath();
    for (let i = -40; i <= 40; i += 16) {
      ctx.moveTo(i, -18); ctx.lineTo(i + 6, -12);
      ctx.moveTo(i, 18); ctx.lineTo(i + 6, 12);
    }
    ctx.stroke();
    ctx.restore();

    // Tentacles
    ctx.strokeStyle = COLORS.Y_GHOST_12;
    for (let i = 0; i < tentacles.length; i++) {
      const tnt = tentacles[i];
      const baseAng = tnt.baseAngle + 0.15 * Math.sin(t * 0.001 + tnt.phase);
      const len = tnt.len * (0.96 + 0.04 * Math.sin(t * 0.0013 + tnt.phase));
      const baseX = cx + Math.cos(baseAng) * 40;
      const baseY = cy + Math.sin(baseAng) * 40;

      const segs = 4;
      let px = baseX, py = baseY;
      ctx.lineWidth = tnt.width;
      ctx.beginPath();
      ctx.moveTo(px, py);
      
      for (let s = 1; s <= segs; s++) {
        const u = s / segs;
        const ang = baseAng + 0.8 * u * Math.sin(t * 0.0012 + tnt.phase + u * 2);
        const rad = len * u;
        const tx = cx + Math.cos(ang) * (60 + rad);
        const ty = cy + Math.sin(ang) * (60 + rad);
        const mx = (px + tx) / 2 + 12 * Math.sin(t * 0.002 + i + s);
        const my = (py + ty) / 2 + 12 * Math.cos(t * 0.0022 + i - s);
        ctx.quadraticCurveTo(mx, my, tx, ty);
        px = tx; py = ty;
      }
      ctx.stroke();

      // Tech segments
      ctx.lineWidth = 1;
      ctx.strokeStyle = COLORS.Y_GHOST_20;
      ctx.beginPath();
      for (let k = 0; k <= 5; k++) {
        const u = k / 5;
        const ang = baseAng + 0.8 * u;
        const rad = len * u;
        const tx = cx + Math.cos(ang) * (60 + rad);
        const ty = cy + Math.sin(ang) * (60 + rad);
        ctx.moveTo(tx - 6, ty - 4);
        ctx.lineTo(tx + 6, ty + 4);
      }
      ctx.stroke();
      ctx.strokeStyle = COLORS.Y_GHOST_12;
    }
  };

  const drawGlowDot = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    ctx.save();
    ctx.fillStyle = COLORS.VIVAD_YELLOW;
    ctx.shadowBlur = 14;
    ctx.shadowColor = COLORS.VIVAD_YELLOW;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    ctx.strokeStyle = COLORS.Y_GHOST_30;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, r + 3, 0, Math.PI * 2);
    ctx.stroke();
  };

  const drawRoundedCapsule = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    const x2 = x + w, y2 = y + h;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x2 - r, y);
    ctx.quadraticCurveTo(x2, y, x2, y + r);
    ctx.lineTo(x2, y2 - r);
    ctx.quadraticCurveTo(x2, y2, x2 - r, y2);
    ctx.lineTo(x + r, y2);
    ctx.quadraticCurveTo(x, y2, x, y2 - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  };

  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    const matrixCanvas = matrixCanvasRef.current;
    const hudCanvas = hudCanvasRef.current;
    const krakenCanvas = krakenCanvasRef.current;

    if (!bgCanvas || !matrixCanvas || !hudCanvas || !krakenCanvas) return;

    const bgCtx = createCtx(bgCanvas);
    const matrixCtx = createCtx(matrixCanvas);
    const hudCtx = createCtx(hudCanvas);
    const krakenCtx = createCtx(krakenCanvas);

    if (!bgCtx || !matrixCtx || !hudCtx || !krakenCtx) return;

    const getSize = () => ({
      w: bgCanvas.clientWidth,
      h: bgCanvas.clientHeight
    });

    let { w, h } = getSize();

    const handleMouseMove = (e: MouseEvent) => {
      const mouse = mouseRef.current;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.nx = (mouse.x / w) * 2 - 1;
      mouse.ny = (mouse.y / h) * 2 - 1;
    };

    const handleResize = () => {
      const newSize = getSize();
      if (newSize.w !== w || newSize.h !== h) {
        w = newSize.w;
        h = newSize.h;
        bgCtx.resize();
        matrixCtx.resize();
        hudCtx.resize();
        krakenCtx.resize();
        setupMatrix(w);
        setupNodes(w, h);
        setupKraken(w, h);
      }
    };

    const animate = (t: number) => {
      drawBackground(bgCtx.ctx, w, h, t);
      drawMatrix(matrixCtx.ctx, w, h, t);
      drawHUD(hudCtx.ctx, w, h, t);
      drawKraken(krakenCtx.ctx, w, h, t);
      animationRef.current = requestAnimationFrame(animate);
    };

    // Initialize
    handleResize();
    animate(0);

    window.addEventListener('pointermove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0"
         style={{
           background: 'radial-gradient(1200px 800px at 15% 20%, rgba(255,211,0,0.06), transparent 60%), radial-gradient(1000px 900px at 85% 70%, rgba(255,211,0,0.04), transparent 60%), #0D0D0D',
           filter: 'saturate(1.05)'
         }}>
      <canvas
        ref={bgCanvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <canvas
        ref={matrixCanvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <canvas
        ref={hudCanvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <canvas
        ref={krakenCanvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};

export default CyberBackground;