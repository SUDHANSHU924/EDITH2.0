import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

/* ─────────────────────────────────────────────
   Canvas-powered animated background for EDITH
   - Scrolling 3D perspective grid (floor + ceiling)
   - Glowing grid-node pulses
   - Horizontal data-stream bursts
   - Particle field
   - Scanlines
───────────────────────────────────────────── */

function useAnimatedGrid(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    /* Data stream pool */
    const streams: Array<{ x: number; y: number; len: number; speed: number; color: string; alpha: number }> = [];
    const spawnStream = () => {
      const colors = ['#00F0FF', '#7B61FF', '#4F8EF7', '#2FD4A3'];
      streams.push({
        x: -200,
        y: Math.random() * canvas.height,
        len: 120 + Math.random() * 200,
        speed: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.25 + Math.random() * 0.45,
      });
    };
    let streamTimer = 0;

    /* Node pulse pool */
    const pulses: Array<{ x: number; y: number; r: number; maxR: number; alpha: number; color: string }> = [];

    /* Particle field */
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: 0.8 + Math.random() * 1.4,
      color: ['#00F0FF', '#7B61FF', '#4F8EF7'][Math.floor(Math.random() * 3)],
      alpha: 0.15 + Math.random() * 0.35,
    }));

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      t += 0.5;

      ctx.clearRect(0, 0, W, H);

      /* ── 1. Floor perspective grid ── */
      {
        const COLS = 16;
        const horizon = H * 0.52;
        const vanishX = W / 2;
        const gridScroll = (t * 1.0) % 80;

        ctx.save();

        // Vertical converging lines — individual glow per line
        for (let c = 0; c <= COLS; c++) {
          const baseX = (W / COLS) * c;
          const distFromCenter = Math.abs(c - COLS / 2) / (COLS / 2);
          const alpha = 0.35 - distFromCenter * 0.18;
          const grad = ctx.createLinearGradient(0, horizon, 0, H);
          grad.addColorStop(0, `rgba(0,240,255,0)`);
          grad.addColorStop(0.15, `rgba(0,240,255,${alpha * 0.4})`);
          grad.addColorStop(1, `rgba(0,240,255,${alpha})`);
          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth = c === COLS / 2 ? 1.5 : 1;
          ctx.shadowColor = '#00F0FF';
          ctx.shadowBlur = c === COLS / 2 ? 8 : 3;
          ctx.moveTo(vanishX + (baseX - vanishX) * 0.008, horizon);
          ctx.lineTo(baseX, H);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Horizontal rows — scrolling toward viewer
        for (let row = 0; row < 22; row++) {
          const progress = ((row * 80 + gridScroll) % (80 * 22)) / (80 * 22);
          if (progress < 0.03) continue;
          const y = horizon + (H - horizon) * Math.pow(progress, 2.0);
          if (y > H) continue;
          const bright = Math.pow(progress, 1.1);
          const spread = 1 - progress * 0.97;
          const leftX  = vanishX - (vanishX) * (1 - spread);
          const rightX = vanishX + (W - vanishX) * (1 - spread);

          ctx.beginPath();
          const rowAlpha = 0.12 + bright * 0.32;
          ctx.strokeStyle = `rgba(0,240,255,${rowAlpha})`;
          ctx.lineWidth = 0.8 + bright * 1.8;
          ctx.shadowColor = '#00F0FF';
          ctx.shadowBlur = bright > 0.6 ? 10 : 4;
          ctx.moveTo(leftX, y);
          ctx.lineTo(rightX, y);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      /* ── 2. Ceiling perspective grid (purple) ── */
      {
        const COLS = 12;
        const horizon = H * 0.40;
        const vanishX = W / 2;
        const gridScroll = (t * 0.6) % 80;

        ctx.save();
        for (let c = 0; c <= COLS; c++) {
          const baseX = (W / COLS) * c;
          const grad = ctx.createLinearGradient(0, 0, 0, horizon);
          grad.addColorStop(0, `rgba(123,97,255,0.22)`);
          grad.addColorStop(1, `rgba(123,97,255,0)`);
          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.9;
          ctx.shadowColor = '#7B61FF';
          ctx.shadowBlur = 4;
          ctx.moveTo(vanishX + (baseX - vanishX) * 0.008, horizon);
          ctx.lineTo(baseX, 0);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        for (let row = 0; row < 12; row++) {
          const progress = ((row * 80 + gridScroll) % (80 * 12)) / (80 * 12);
          if (progress < 0.05) continue;
          const y = horizon - horizon * Math.pow(progress, 2.0);
          if (y < 0) continue;
          const bright = Math.pow(progress, 1.2);
          const spread = 1 - progress * 0.96;
          const leftX  = vanishX - vanishX * (1 - spread);
          const rightX = vanishX + (W - vanishX) * (1 - spread);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(123,97,255,${0.08 + bright * 0.22})`;
          ctx.lineWidth = 0.7 + bright * 1.2;
          ctx.shadowColor = '#7B61FF';
          ctx.shadowBlur = bright > 0.5 ? 8 : 3;
          ctx.moveTo(leftX, y);
          ctx.lineTo(rightX, y);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      /* ── 3. Dot grid overlay ── */
      {
        const spacing = 42;
        ctx.save();
        for (let x = spacing / 2; x < W; x += spacing) {
          for (let y = spacing / 2; y < H; y += spacing) {
            const pulse = 0.5 + 0.5 * Math.sin(t * 0.025 + x * 0.012 + y * 0.009);
            ctx.beginPath();
            ctx.arc(x, y, 1.1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,240,255,${0.07 + pulse * 0.10})`;
            ctx.shadowColor = '#00F0FF';
            ctx.shadowBlur = pulse > 0.8 ? 6 : 0;
            ctx.fill();
          }
        }
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      /* ── 4. Glowing grid-intersection pulses ── */
      if (Math.random() < 0.04) {
        const cols = ['#00F0FF', '#7B61FF', '#2FD4A3'];
        const snapX = Math.round(Math.random() * 12) * (W / 12);
        const snapY = Math.round(Math.random() * 8) * (H / 8);
        pulses.push({ x: snapX, y: snapY, r: 0, maxR: 40 + Math.random() * 60, alpha: 0.7, color: cols[Math.floor(Math.random() * cols.length)] });
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.r += 1.2;
        p.alpha -= 0.018;
        if (p.alpha <= 0) { pulses.splice(i, 1); continue; }
        ctx.beginPath();
        const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        rg.addColorStop(0, `rgba(${p.color === '#00F0FF' ? '0,240,255' : p.color === '#7B61FF' ? '123,97,255' : '47,212,163'},${p.alpha * 0.5})`);
        rg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = rg;
        ctx.fill();
        // Outer ring
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = `${p.color}${Math.floor(p.alpha * 80).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      /* ── 5. Data stream bursts ── */
      streamTimer++;
      if (streamTimer > 45 + Math.random() * 60) { spawnStream(); streamTimer = 0; }
      for (let i = streams.length - 1; i >= 0; i--) {
        const s = streams[i];
        s.x += s.speed;
        if (s.x > W + s.len) { streams.splice(i, 1); continue; }
        const grad = ctx.createLinearGradient(s.x - s.len, 0, s.x, 0);
        grad.addColorStop(0, `${s.color}00`);
        grad.addColorStop(0.4, `${s.color}${Math.floor(s.alpha * 255).toString(16).padStart(2, '0')}`);
        grad.addColorStop(1, `${s.color}${Math.floor(s.alpha * 100).toString(16).padStart(2, '0')}`);
        ctx.beginPath();
        ctx.moveTo(s.x - s.len, s.y);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      /* ── 6. Floating particles ── */
      ctx.save();
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.floor(p.alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.restore();

      /* ── 7. Horizon glow line ── */
      {
        const y = H * 0.54;
        const g = ctx.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, 'rgba(0,240,255,0)');
        g.addColorStop(0.2, 'rgba(0,240,255,0.08)');
        g.addColorStop(0.5, 'rgba(0,240,255,0.25)');
        g.addColorStop(0.8, 'rgba(0,240,255,0.08)');
        g.addColorStop(1, 'rgba(0,240,255,0)');
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef]);
}

const MATRIX_CHARS = '01アイウエカキクサシスタチツナニヌハヒフヘマミムメモヤユヨラリルレロ';

function MatrixColumn({ x, delay, duration }: { x: number; delay: number; duration: number }) {
  const chars = Array.from({ length: 26 }, () =>
    MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
  );
  return (
    <div style={{
      position: 'absolute', left: x, top: '-12%',
      display: 'flex', flexDirection: 'column', gap: 2,
      fontFamily: 'JetBrains Mono, monospace', fontSize: 9, lineHeight: '13px',
      color: '#00F0FF',
      animation: `matrix-fall ${duration}s linear infinite`,
      animationDelay: `${delay}s`,
    }}>
      {chars.map((c, i) => (
        <span key={i} style={{
          opacity: Math.max(0, (26 - i) / 26) * (i === 0 ? 1 : 0.6),
          filter: i < 2 ? 'brightness(2.5) drop-shadow(0 0 4px #00F0FF)' : 'none',
          color: i === 0 ? '#fff' : undefined,
        }}>
          {c}
        </span>
      ))}
    </div>
  );
}

export function BackgroundGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useAnimatedGrid(canvasRef);

  return (
    <div className="pointer-events-none"
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, overflow: 'hidden' }}>

      {/* ── Animated canvas (grid, streams, particles) ── */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {/* ── Large cyan glow blob (left) ── */}
      <motion.div style={{ position: 'absolute', left: '15%', top: '40%', transform: 'translate(-50%,-50%)' }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.06, 0.13, 0.06] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
        <div style={{ width: 750, height: 750, borderRadius: '50%', background: 'radial-gradient(circle, #00F0FF 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </motion.div>

      {/* ── Purple glow blob (right) ── */}
      <motion.div style={{ position: 'absolute', right: '10%', top: '30%', transform: 'translate(50%,-50%)' }}
        animate={{ scale: [1, 1.45, 1], opacity: [0.04, 0.1, 0.04] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}>
        <div style={{ width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, #7B61FF 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </motion.div>

      {/* ── Green accent blob (center-bottom) ── */}
      <motion.div style={{ position: 'absolute', left: '55%', bottom: '10%', transform: 'translate(-50%,50%)' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.02, 0.06, 0.02] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 5 }}>
        <div style={{ width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, #2FD4A3 0%, transparent 70%)', filter: 'blur(120px)' }} />
      </motion.div>

      {/* ── Horizontal sweep scanline ── */}
      <motion.div style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent 0%, rgba(0,240,255,0.2) 20%, rgba(0,240,255,0.9) 50%, rgba(0,240,255,0.2) 80%, transparent 100%)',
        boxShadow: '0 0 30px 6px rgba(0,240,255,0.3)',
      }}
        animate={{ y: ['-2vh', '102vh'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear', repeatDelay: 14 }}
      />

      {/* ── Vertical sweep scanline ── */}
      <motion.div style={{
        position: 'absolute', top: 0, bottom: 0, width: 1,
        background: 'linear-gradient(180deg, transparent 0%, rgba(123,97,255,0.3) 20%, rgba(123,97,255,0.8) 50%, rgba(123,97,255,0.3) 80%, transparent 100%)',
        boxShadow: '0 0 22px 4px rgba(123,97,255,0.25)',
      }}
        animate={{ x: ['-2vw', '102vw'] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear', repeatDelay: 28, delay: 6 }}
      />

      {/* ── Matrix columns — left strip ── */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 72, height: '100%', overflow: 'hidden' }}>
        {[3, 17, 31, 47, 61].map((x, i) => (
          <MatrixColumn key={i} x={x} delay={i * 2.2} duration={8 + i * 1.8} />
        ))}
      </div>

      {/* ── Matrix columns — right strip ── */}
      <div style={{ position: 'absolute', right: 0, top: 0, width: 72, height: '100%', overflow: 'hidden' }}>
        {[3, 17, 31, 47, 61].map((x, i) => (
          <MatrixColumn key={i} x={x} delay={i * 1.8 + 1} duration={9 + i * 2} />
        ))}
      </div>

      {/* ── CRT scanline texture ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
        pointerEvents: 'none',
      }} />

      {/* ── Corner HUD brackets ── */}
      {[
        { top: 18, left: 18 },
        { top: 18, right: 18 },
        { bottom: 18, left: 18 },
        { bottom: 18, right: 18 },
      ].map((pos, i) => (
        <motion.div key={i} style={{
          position: 'absolute', width: 36, height: 36,
          borderTop:    i < 2  ? '2px solid rgba(0,240,255,0.7)' : undefined,
          borderBottom: i >= 2 ? '2px solid rgba(0,240,255,0.7)' : undefined,
          borderLeft:  i % 2 === 0 ? '2px solid rgba(0,240,255,0.7)' : undefined,
          borderRight: i % 2 === 1 ? '2px solid rgba(0,240,255,0.7)' : undefined,
          boxShadow: i < 2
            ? (i === 0 ? 'inset 4px 4px 8px rgba(0,240,255,0.1)' : 'inset -4px 4px 8px rgba(0,240,255,0.1)')
            : (i === 2 ? 'inset 4px -4px 8px rgba(0,240,255,0.1)' : 'inset -4px -4px 8px rgba(0,240,255,0.1)'),
          ...pos,
        }}
          animate={{ opacity: [0.5, 1, 0.5], borderColor: ['rgba(0,240,255,0.5)', 'rgba(0,240,255,1)', 'rgba(0,240,255,0.5)'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
        />
      ))}

      {/* ── Edge vignette ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
