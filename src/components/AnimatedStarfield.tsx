
import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  r: number;
  phase: number;
}

interface Tentacle {
  angle0: number;
  len: number;
  phase: number;
  r: number;
  side: 'back' | 'front';
}

interface Drop {
  y: number;
  speed: number;
}

interface Drone {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  energy: number;
  targetX: number;
  targetY: number;
  avoiding: boolean;
}

const CyberBackground = () => {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const matrixCanvasRef = useRef<HTMLCanvasElement>(null);
  const hudCanvasRef = useRef<HTMLCanvasElement>(null);
  const dronesCanvasRef = useRef<HTMLCanvasElement>(null);
  const krakenCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0, nx: 0, ny: 0 });
  const nodesRef = useRef<Node[]>([]);
  const tentaclesRef = useRef<Tentacle[]>([]);
  const dropsRef = useRef<Drop[]>([]);
  const dronesRef = useRef<Drone[]>([]);
  const krakenRef = useRef({ x: -400, y: 0, speed: 0.09, roll: 0, blinkTimer: 0 });
  const matrixRef = useRef({ fontSize: 16, cols: 0 });

  const COLORS = {
    RICH_BLACK: '#0D0D0D',
    VIVAD_YELLOW: '#FFD300',
    Y06: 'rgba(255,211,0,0.06)',
    Y08: 'rgba(255,211,0,0.08)',
    Y12: 'rgba(255,211,0,0.12)',
    Y18: 'rgba(255,211,0,0.18)',
    Y25: 'rgba(255,211,0,0.25)',
    Y35: 'rgba(255,211,0,0.35)',
    W07: 'rgba(255,255,255,0.07)',
    W12: 'rgba(255,255,255,0.12)',
    B12: 'rgba(13,13,13,0.12)',
    B18: 'rgba(13,13,13,0.18)'
  };

  // Ultra-realistic kraken configuration
  const KR_CFG = {
    TENTACLES: 8,
    SEGMENTS: 26,
    R_BASE: 28,
    LEN_BASE: 440,
    SPEED: 0.09,
    BODY_ALPHA: 0.42,
    FOG_NEAR: 0.2,
    FOG_FAR: 0.85,
    LIGHT_DIR: { x: -0.6, y: -0.8 },
    GLOW: true
  };

  // SAFE-ZONE для авторизации (центр)
  const SAFE = { x: 0.30, y: 0.25, w: 0.40, h: 0.50 };
  const safeRect = (w: number, h: number) => ({ 
    x: SAFE.x * w, 
    y: SAFE.y * h, 
    w: SAFE.w * w, 
    h: SAFE.h * h 
  });

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // RNG for stable appearance
  const rng = (seed: number) => {
    return function() {
      seed |= 0;
      seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };
  const RAND = rng(0xC0DEC0DE);

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
    const brands = ["PRO MEGA SPOT LLC", "HIGH TECHNOLOGY AI"];
    const tokens = ['UAV', 'IMU', 'RTK', 'AI', 'VIO', 'LIDAR', 'EMS', 'FIRE', 'POL', 'RESC', 'AGRO', 'STAR'];
    
    const r = Math.random();
    if (r < 0.62) return Math.random() > 0.5 ? '0' : '1';
    if (r < 0.90) return '0123456789ABCDEF'[Math.floor(Math.random() * 16)];
    if (r < 0.965) return tokens[Math.floor(Math.random() * tokens.length)];
    return brands[Math.floor(Math.random() * brands.length)];
  };

  const setupMatrix = (w: number) => {
    const matrix = matrixRef.current;
    matrix.cols = Math.max(1, Math.floor(w / matrix.fontSize));
    dropsRef.current = Array(matrix.cols).fill(0).map(() => ({
      y: Math.random() * 50,
      speed: 0.4 + Math.random() * 0.85
    }));
  };

  const setupNodes = (w: number, h: number) => {
    const count = 44;
    nodesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 2 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2
    }));
  };

  const setupDrones = (w: number, h: number) => {
    const count = 24;
    dronesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: 2 + Math.random() * 3,
      phase: Math.random() * Math.PI * 2,
      energy: Math.random(),
      targetX: 0,
      targetY: 0,
      avoiding: false
    }));
  };

  const setupKraken = (w: number, h: number) => {
    const kraken = krakenRef.current;
    kraken.y = h * 0.60;
    kraken.x = -w * 0.38;
    kraken.roll = 0;
    
    const count = KR_CFG.TENTACLES;
    tentaclesRef.current = Array.from({ length: count }, (_, i) => ({
      angle0: (-Math.PI / 5) + (i / (count - 1)) * (Math.PI / 2.4),
      len: KR_CFG.LEN_BASE + RAND() * 160,
      phase: RAND() * Math.PI * 2,
      r: KR_CFG.R_BASE * (0.9 + RAND() * 0.2),
      side: i < count / 2 ? 'back' : 'front'
    }));
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = COLORS.RICH_BLACK;
    ctx.fillRect(0, 0, w, h);

    // Enhanced noise effect
    if (!prefersReduced) {
      ctx.globalAlpha = 0.05;
      for (let i = 0; i < 140; i++) {
        ctx.fillStyle = COLORS.W07;
        const x = (i * 67 + (t * 0.05) % w) % w;
        const y = (i * 149 + (t * 0.07) % h) % h;
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.globalAlpha = 1;
    }

    // Vignette effect
    const gradient = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, Math.hypot(w, h) * 0.6);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  };

  const drawMatrix = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    const matrix = matrixRef.current;
    let drops = dropsRef.current;
    
    if (!matrix.cols || !drops.length) {
      setupMatrix(w);
      drops = dropsRef.current;
    }

    ctx.fillStyle = COLORS.B18;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = COLORS.VIVAD_YELLOW;
    ctx.font = `${matrix.fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;

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
    
    // Enhanced grid
    ctx.strokeStyle = COLORS.Y18;
    ctx.lineWidth = 1;
    const step = 90;
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
    ctx.strokeStyle = COLORS.Y25;
    for (let r = 120; r <= 360; r += 60) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Nodes and connections
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = COLORS.Y18;
    ctx.fillStyle = COLORS.Y25;

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

    // Draw nodes with pulsing
    for (const n of nodes) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.003 + n.phase);
      const rr = n.r + pulse * 1.2;
      ctx.beginPath();
      ctx.arc(n.x, n.y, rr, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const normalize = (x: number, y: number) => {
    const mag = Math.hypot(x, y) || 1;
    return { x: x / mag, y: y / mag };
  };

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const drawDrones = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    if (prefersReduced) return;
    
    let drones = dronesRef.current;
    if (!drones.length) {
      setupDrones(w, h);
      drones = dronesRef.current;
    }
    
    ctx.clearRect(0, 0, w, h);
    
    const safe = safeRect(w, h);
    const kraken = krakenRef.current;
    const krakenX = kraken.x + 280;
    const krakenY = kraken.y;
    
    // Update drone positions with boid behavior
    for (let i = 0; i < drones.length; i++) {
      const drone = drones[i];
      
      // Avoid safe zone
      const distToSafe = Math.hypot(
        drone.x - (safe.x + safe.w/2),
        drone.y - (safe.y + safe.h/2)
      );
      
      if (distToSafe < safe.w/2 + 100) {
        const repelX = (drone.x - (safe.x + safe.w/2)) / distToSafe;
        const repelY = (drone.y - (safe.y + safe.h/2)) / distToSafe;
        drone.vx += repelX * 0.3;
        drone.vy += repelY * 0.3;
        drone.avoiding = true;
      } else {
        drone.avoiding = false;
      }
      
      // Flock behavior
      let sepX = 0, sepY = 0, alignX = 0, alignY = 0, cohX = 0, cohY = 0;
      let sepCount = 0, alignCount = 0, cohCount = 0;
      
      for (let j = 0; j < drones.length; j++) {
        if (i === j) continue;
        const other = drones[j];
        const dist = Math.hypot(drone.x - other.x, drone.y - other.y);
        
        // Separation
        if (dist < 50 && dist > 0) {
          sepX += (drone.x - other.x) / dist;
          sepY += (drone.y - other.y) / dist;
          sepCount++;
        }
        
        // Alignment & Cohesion
        if (dist < 100) {
          alignX += other.vx;
          alignY += other.vy;
          alignCount++;
          
          cohX += other.x;
          cohY += other.y;
          cohCount++;
        }
      }
      
      if (sepCount > 0) {
        drone.vx += (sepX / sepCount) * 0.15;
        drone.vy += (sepY / sepCount) * 0.15;
      }
      
      if (alignCount > 0) {
        drone.vx += ((alignX / alignCount) - drone.vx) * 0.05;
        drone.vy += ((alignY / alignCount) - drone.vy) * 0.05;
      }
      
      if (cohCount > 0) {
        drone.vx += ((cohX / cohCount) - drone.x) * 0.002;
        drone.vy += ((cohY / cohCount) - drone.y) * 0.002;
      }
      
      // Kraken attraction (weak)
      const distToKraken = Math.hypot(drone.x - krakenX, drone.y - krakenY);
      if (distToKraken > 200 && !drone.avoiding) {
        drone.vx += (krakenX - drone.x) * 0.0005;
        drone.vy += (krakenY - drone.y) * 0.0005;
      }
      
      // Limit velocity
      const speed = Math.hypot(drone.vx, drone.vy);
      if (speed > 3) {
        drone.vx = (drone.vx / speed) * 3;
        drone.vy = (drone.vy / speed) * 3;
      }
      
      // Update position
      drone.x += drone.vx;
      drone.y += drone.vy;
      
      // Wrap around screen
      if (drone.x < 0) drone.x = w;
      if (drone.x > w) drone.x = 0;
      if (drone.y < 0) drone.y = h;
      if (drone.y > h) drone.y = 0;
      
      // Draw drone
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.005 + drone.phase);
      const alpha = drone.avoiding ? 0.8 : 0.4 + pulse * 0.4;
      
      ctx.save();
      ctx.translate(drone.x, drone.y);
      
      // Drone body
      ctx.fillStyle = `rgba(255,211,0,${alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, drone.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Direction indicator
      const angle = Math.atan2(drone.vy, drone.vx);
      ctx.strokeStyle = COLORS.Y25;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * (drone.size + 8), Math.sin(angle) * (drone.size + 8));
      ctx.stroke();
      
      // Energy trails
      if (drone.energy > 0.7) {
        ctx.strokeStyle = COLORS.VIVAD_YELLOW;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-Math.cos(angle) * 10, -Math.sin(angle) * 10);
        ctx.lineTo(-Math.cos(angle) * 20, -Math.sin(angle) * 20);
        ctx.stroke();
      }
      
      ctx.restore();
      
      // Data tethers to nearby drones
      for (let j = i + 1; j < drones.length; j++) {
        const other = drones[j];
        const dist = Math.hypot(drone.x - other.x, drone.y - other.y);
        if (dist < 80) {
          ctx.strokeStyle = `rgba(255,211,0,${0.1 * (1 - dist/80)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(drone.x, drone.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
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

    // Enhanced movement
    kraken.x += KR_CFG.SPEED;
    if (kraken.x > w + 520) kraken.x = -520;
    
    const cx = kraken.x + 280 + mouse.nx * 14 * 0.2;
    const cy = kraken.y - 14 + Math.sin(t * 0.0005) * 2 + mouse.ny * 10 * 0.1;
    kraken.roll = 0.04 * Math.sin(t * 0.0006);

    // Separate back and front tentacles for depth
    const backTentacles = tentacles.filter(s => s.side === 'back');
    const frontTentacles = tentacles.filter(s => s.side !== 'back');

    // Draw back tentacles (darker, in fog)
    for (const tentacle of backTentacles) {
      drawTentacle(ctx, cx, cy, tentacle, t, true);
    }

    // Draw body
    drawBody(ctx, cx, cy, t, kraken.roll);

    // Draw front tentacles
    for (const tentacle of frontTentacles) {
      drawTentacle(ctx, cx, cy, tentacle, t, false);
    }
  };

  const drawBody = (ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, roll: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(roll);
    ctx.globalAlpha = KR_CFG.BODY_ALPHA;

    const W = 260, H = 98, R = 36;
    
    // Internal fill with gradient
    const grad = ctx.createLinearGradient(0, -H/2, 0, H/2);
    grad.addColorStop(0, COLORS.Y12);
    grad.addColorStop(0.55, COLORS.Y35);
    grad.addColorStop(1, COLORS.Y12);
    
    drawRoundedCapsule(ctx, -W/2, -H/2, W, H, R);
    ctx.fillStyle = grad;
    ctx.fill();

    // Outer edge
    ctx.strokeStyle = COLORS.Y25;
    ctx.lineWidth = 2;
    drawRoundedCapsule(ctx, -W/2, -H/2, W, H, R);
    ctx.stroke();

    // Tentacle sockets
    ctx.strokeStyle = COLORS.Y18;
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) {
      const gx = -W * 0.30 + i * (W * 0.2);
      ctx.beginPath();
      ctx.ellipse(gx, H * 0.20, 16, 8, 0, 0, Math.PI);
      ctx.stroke();
    }

    // Armor plates
    ctx.beginPath();
    ctx.moveTo(-W * 0.44, -H * 0.18);
    ctx.lineTo(-W * 0.14, -H * 0.32);
    ctx.lineTo(W * 0.14, -H * 0.32);
    ctx.lineTo(W * 0.44, -H * 0.18);
    ctx.moveTo(-W * 0.44, H * 0.18);
    ctx.lineTo(-W * 0.14, H * 0.32);
    ctx.lineTo(W * 0.14, H * 0.32);
    ctx.lineTo(W * 0.44, H * 0.18);
    ctx.stroke();

    // Ventilation slits
    ctx.beginPath();
    for (let i = -88; i <= 88; i += 18) {
      ctx.moveTo(i, -H * 0.30);
      ctx.lineTo(i + 8, -H * 0.20);
      ctx.moveTo(i, H * 0.30);
      ctx.lineTo(i + 8, H * 0.20);
    }
    ctx.stroke();

    // Sensors with blinking
    const blink = (Math.sin(t * 0.004) + 1) / 2 > 0.92 ? 1.6 : 1;
    drawGlowDot(ctx, -42, -10, 7 * blink);
    drawGlowDot(ctx, 42, -10, 7 * blink);

    // Scanning sector
    const ang = (t * 0.0012) % (Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, W * 0.52, ang, ang + Math.PI / 9);
    ctx.closePath();
    ctx.fillStyle = COLORS.Y06;
    ctx.fill();

    ctx.restore();
  };

  const drawGlowDot = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    ctx.save();
    ctx.fillStyle = COLORS.VIVAD_YELLOW;
    if (KR_CFG.GLOW) {
      ctx.shadowBlur = 24;
      ctx.shadowColor = COLORS.VIVAD_YELLOW;
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    ctx.strokeStyle = COLORS.Y25;
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

  const drawTentacle = (ctx: CanvasRenderingContext2D, cx: number, cy: number, tnt: Tentacle, t: number, isBack: boolean) => {
    const N = KR_CFG.SEGMENTS;
    const baseAng = tnt.angle0 + 0.14 * Math.sin(t * 0.001 + tnt.phase);
    const len = tnt.len * (0.96 + 0.04 * Math.sin(t * 0.0011 + tnt.phase));
    const light = normalize(KR_CFG.LIGHT_DIR.x, KR_CFG.LIGHT_DIR.y);

    // Build spine
    const spine = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const ang = baseAng + 0.7 * u * Math.sin(t * 0.0012 + tnt.phase + u * 2);
      const rad = 80 + len * u;
      const x = cx + Math.cos(ang) * rad;
      const y = cy + Math.sin(ang) * rad;
      
      // Tangent and normal
      const du = 1 / (N * 3);
      const ang2 = baseAng + 0.7 * (u + du) * Math.sin(t * 0.0012 + tnt.phase + (u + du) * 2);
      const rad2 = 80 + len * (u + du);
      const x2 = cx + Math.cos(ang2) * rad2;
      const y2 = cy + Math.sin(ang2) * rad2;
      const tx = x2 - x, ty = y2 - y;
      const mag = Math.hypot(tx, ty) || 1;
      const nx = -ty / mag, ny = tx / mag;

      const taper = (1 - u);
      const R = (tnt.r * (0.9 + 0.1 * Math.sin(t * 0.002 + u * 6))) * Math.pow(taper, 0.5) + 3;

      spine.push({ x, y, nx, ny, R, u });
    }

    // Draw segments with shading and fog
    for (let i = 0; i < N; i++) {
      const a = spine[i], b = spine[i + 1];
      const aL = { x: a.x + a.nx * a.R, y: a.y + a.ny * a.R };
      const aR = { x: a.x - a.nx * a.R, y: a.y - a.ny * a.R };
      const bL = { x: b.x + b.nx * b.R, y: b.y + b.ny * b.R };
      const bR = { x: b.x - b.nx * b.R, y: b.y - b.ny * b.R };

      // Lighting
      const segNx = (a.nx + b.nx) * 0.5, segNy = (a.ny + b.ny) * 0.5;
      const ndotl = Math.max(0, segNx * light.x + segNy * light.y);
      const shadeFront = 0.12 + 0.38 * ndotl;
      const fog = lerp(KR_CFG.FOG_NEAR, KR_CFG.FOG_FAR, a.u);

      // Segment body
      ctx.beginPath();
      ctx.moveTo(aL.x, aL.y);
      ctx.lineTo(bL.x, bL.y);
      ctx.lineTo(bR.x, bR.y);
      ctx.lineTo(aR.x, aR.y);
      ctx.closePath();
      ctx.fillStyle = `rgba(255,211,0,${(shadeFront * fog).toFixed(3)})`;
      ctx.fill();

      // Specular highlight
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(255,255,255,${(0.08 * fog).toFixed(3)})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Ring plates
      if (i % 4 === 0) {
        ctx.beginPath();
        ctx.moveTo(aL.x, aL.y);
        ctx.lineTo(aR.x, aR.y);
        ctx.strokeStyle = `rgba(255,211,0,${(0.18 * fog).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Glowing veins
    if (KR_CFG.GLOW) {
      ctx.globalCompositeOperation = 'lighter';
      for (const offs of [-0.45, 0.45]) {
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const p = spine[i];
          const vx = p.x + p.nx * (p.R * offs);
          const vy = p.y + p.ny * (p.R * offs);
          if (i === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.strokeStyle = COLORS.VIVAD_YELLOW;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    // Outer edge for front tentacles
    if (!isBack) {
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const p = spine[i];
        ctx.lineTo(p.x + p.nx * p.R, p.y + p.ny * p.R);
      }
      for (let i = N; i >= 0; i--) {
        const p = spine[i];
        ctx.lineTo(p.x - p.nx * p.R, p.y - p.ny * p.R);
      }
      ctx.closePath();
      ctx.strokeStyle = COLORS.Y18;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  };

  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    const matrixCanvas = matrixCanvasRef.current;
    const hudCanvas = hudCanvasRef.current;
    const dronesCanvas = dronesCanvasRef.current;
    const krakenCanvas = krakenCanvasRef.current;

    if (!bgCanvas || !matrixCanvas || !hudCanvas || !dronesCanvas || !krakenCanvas) return;

    const bgCtx = createCtx(bgCanvas);
    const matrixCtx = createCtx(matrixCanvas);
    const hudCtx = createCtx(hudCanvas);
    const dronesCtx = createCtx(dronesCanvas);
    const krakenCtx = createCtx(krakenCanvas);

    if (!bgCtx || !matrixCtx || !hudCtx || !dronesCtx || !krakenCtx) return;

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
        dronesCtx.resize();
        krakenCtx.resize();
        setupMatrix(w);
        setupNodes(w, h);
        setupDrones(w, h);
        setupKraken(w, h);
      }
    };

    const animate = (t: number) => {
      drawBackground(bgCtx.ctx, w, h, t);
      if (!prefersReduced) {
        drawMatrix(matrixCtx.ctx, w, h, t);
        drawHUD(hudCtx.ctx, w, h, t);
        drawDrones(dronesCtx.ctx, w, h, t);
        drawKraken(krakenCtx.ctx, w, h, t);
      }
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
           filter: 'saturate(1.06)'
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
        ref={dronesCanvasRef}
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
