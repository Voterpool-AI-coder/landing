'use client';

import { useEffect, useRef } from 'react';

/**
 * Interactive fabric background.
 *
 * ─── НАСТРОЙКА ЦВЕТОВ ────────────────────────────────────────────────
 * Все основные цвета задаются в объекте FABRIC_THEMES ниже.
 *   bg            — фон полотна
 *   blobs[]       — пятна-градиенты (hex + alpha)
 *   fold.shade    — цвет впадины волны (тень складки)
 *   fold.crest    — цвет гребня волны (блик)
 *   fold.intensity— сила окрашивания волны, 0..1
 * light — светлая тема, dark — тёмная (класс .dark на <html>).
 * Смена темы подхватывается на лету (MutationObserver за <html class>).
 *
 * ─── КАК РАБОТАЕТ ТКАНЬ ──────────────────────────────────────────────
 * Поле рендерится попиксельно в низкоразрешающий буфер. Курсор
 * оставляет след из точек-«захвата»: каждая смещает координаты
 * сэмплирования назад против движения (протяжка), стягивает их к
 * линии жеста (grip — сборка) и добавляет поперечную волну.
 * Впадины волны окрашиваются в fold.shade, гребни — в fold.crest,
 * так что за мышью тянется цветная волна-градиент со складками.
 */

export type FabricTheme = {
  bg: string;
  blobs: { color: string; alpha: number }[];
  fold: {
    /** Цвет впадины волны — «тень» складки */
    shade: string;
    /** Цвет гребня волны — «блик» на ткани */
    crest: string;
    /** Общая сила окрашивания волны, 0..1 */
    intensity: number;
  };
};

export const FABRIC_THEMES: Record<'light' | 'dark', FabricTheme> = {
  light: {
    bg: '#ffffff',
    blobs: [
      { color: '#d2e4ff', alpha: 0.5 },
      { color: '#c9e0ff', alpha: 0.42 },
      { color: '#d4e2ff', alpha: 0.4 },
      { color: '#fcfeff', alpha: 0.42 },
      { color: '#cde0fc', alpha: 0.46 },
    ],
    fold: {
      shade: '#98b9ef',
      crest: '#ffffff',
      intensity: 0.2,
    },
  },
  dark: {
    bg: '#05080f',
    blobs: [
      { color: '#002383', alpha: 0.38 },
      { color: '#1e3a8a', alpha: 0.5 },
      { color: '#0e2490', alpha: 0.28 },
      { color: '#312e81', alpha: 0.45 },
      { color: '#043295', alpha: 0.26 },
    ],
    fold: {
      shade: '#01030a',
      crest: '#2d45ff', // светящийся бирюзовый гребень
      intensity: 0.2,
    },
  },
};

// ─── Геометрия ткани (сила эффекта) ────────────────────────────────
const CFG = {
  foldRadius: 230,
  pull: 20,
  grip: 40,
  wave: 1.2,
  waves: 1.8,
  maxDisplace: 180,
  trailSpacing: 13,
  trailMax: 76,
  trailLife: [1300, 3000] as const,
};

type TrailPoint = {
  x: number;
  y: number;
  nx: number;
  ny: number;
  life: number;
  max: number;
};

function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace('#', '');
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ];
}

function currentThemeName(): 'light' | 'dark' {
  return typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
    ? 'dark'
    : 'light';
}

export default function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const BUF_SCALE = 0.17;
    const buf = document.createElement('canvas');
    const bctx = buf.getContext('2d');
    let img: ImageData | null = null;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      buf.width = Math.max(2, Math.round(width * BUF_SCALE));
      buf.height = Math.max(2, Math.round(height * BUF_SCALE));
      img = bctx!.createImageData(buf.width, buf.height);
    };
    resize();

    // Активная тема + живое переключение
    let themeName = currentThemeName();
    const observer = new MutationObserver(() => {
      themeName = currentThemeName();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const mouse = {
      x: width / 2,
      y: height * 0.38,
      tx: width / 2,
      ty: height * 0.38,
    };
    let lastSpawnX = 0;
    let lastSpawnY = 0;
    let hasLastSpawn = false;
    let trail: TrailPoint[] = [];

    const onMove = (e: MouseEvent) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;

      if (reduced) return;
      if (!hasLastSpawn) {
        lastSpawnX = e.clientX;
        lastSpawnY = e.clientY;
        hasLastSpawn = true;
        return;
      }
      const dxs = e.clientX - lastSpawnX;
      const dys = e.clientY - lastSpawnY;
      const seg = Math.hypot(dxs, dys);
      if (seg < CFG.trailSpacing || seg > 400) return;
      if (trail.length >= CFG.trailMax) trail.shift();
      trail.push({
        x: e.clientX,
        y: e.clientY,
        nx: dxs / seg,
        ny: dys / seg,
        life: 0,
        max:
          CFG.trailLife[0] +
          Math.random() * (CFG.trailLife[1] - CFG.trailLife[0]),
      });
      lastSpawnX = e.clientX;
      lastSpawnY = e.clientY;
    };

    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) {
        mouse.tx = t.clientX;
        mouse.ty = t.clientY;
      }
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });

    const paint = (t: number, dtMs: number) => {
      if (!bctx || !img) return;
      const bw = buf.width;
      const bh = buf.height;
      const data = img.data;

      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      for (let i = 0; i < trail.length; i++) trail[i].life += dtMs;
      trail = trail.filter((p) => p.life < p.max);

      // Палитра активной темы
      const theme = FABRIC_THEMES[themeName];
      const bgRgb = hexToRgb(theme.bg);
      const shadeRgb = hexToRgb(theme.fold.shade);
      const crestRgb = hexToRgb(theme.fold.crest);
      const foldIntensity = theme.fold.intensity;
      const nBlobs = theme.blobs.length;

      // Параметры блобов на этот кадр
      const bcx = new Float32Array(nBlobs);
      const bcy = new Float32Array(nBlobs);
      const bR = new Float32Array(nBlobs);
      const ba = new Float32Array(nBlobs);
      const br = new Float32Array(nBlobs);
      const bgc = new Float32Array(nBlobs);
      const bb = new Float32Array(nBlobs);
      const diag = Math.sqrt(width * width + height * height);

      for (let j = 0; j < nBlobs; j++) {
        const ang = t * 0.00007 + (j / nBlobs) * Math.PI * 2;
        const cx =
          (0.5 +
            0.34 * Math.cos(ang + j * 1.3) +
            0.08 * Math.sin(t * 0.00019 + j)) *
            width +
          (mouse.x - width / 2) * 0.012;
        const cy =
          (0.5 +
            0.3 * Math.sin(ang * 1.18 + j * 2.1) +
            0.08 * Math.cos(t * 0.00023 + j)) *
            height +
          (mouse.y - height / 2) * 0.012;
        bcx[j] = cx;
        bcy[j] = cy;
        bR[j] = diag * (0.42 + 0.05 * Math.sin(t * 0.0004 + j * 1.7));
        ba[j] =
          theme.blobs[j].alpha * (0.9 + 0.1 * Math.sin(t * 0.0004 + j * 1.9));
        const c = hexToRgb(theme.blobs[j].color);
        br[j] = c[0];
        bgc[j] = c[1];
        bb[j] = c[2];
      }

      const worldPerBufX = width / bw;
      const worldPerBufY = height / bh;
      const nt = trail.length;
      const R2 = CFG.foldRadius * CFG.foldRadius;

      let di = 0;
      for (let py = 0; py < bh; py++) {
        const wy = (py + 0.5) * worldPerBufY;
        for (let px = 0; px < bw; px++, di += 4) {
          let sx = (px + 0.5) * worldPerBufX;
          let sy = wy;

          // ── Складки от следов мыши ──
          let ox = 0;
          let oy = 0;
          let waveSigned = 0; // знаковая сумма: впадина (-) или гребень (+)
          for (let k = 0; k < nt; k++) {
            const tp = trail[k];
            const dx = sx - tp.x;
            if (dx > CFG.foldRadius || dx < -CFG.foldRadius) continue;
            const dy = sy - tp.y;
            const q = dx * dx + dy * dy;
            if (q > R2) continue;
            const d = Math.sqrt(q) || 1;
            const f = (1 - d / CFG.foldRadius) * (1 - tp.life / tp.max);
            const f2 = f * f;
            const pullAmt = CFG.pull * f2;
            ox -= tp.nx * pullAmt;
            oy -= tp.ny * pullAmt;
            const gripAmt = CFG.grip * f2;
            ox -= (dx / d) * gripAmt;
            oy -= (dy / d) * gripAmt;
            const wv =
              Math.sin(
                (d / CFG.foldRadius) * Math.PI * CFG.waves - tp.life * 0.004,
              ) *
              CFG.pull *
              CFG.wave *
              f2;
            ox += -tp.ny * wv;
            oy += tp.nx * wv;
            waveSigned += wv;
          }
          const olen2 = ox * ox + oy * oy;
          let olen = Math.sqrt(olen2);
          if (olen > CFG.maxDisplace) {
            const k = CFG.maxDisplace / olen;
            ox *= k;
            oy *= k;
            olen = CFG.maxDisplace;
          }
          sx += ox;
          sy += oy;

          // ── Цвет поля в смещённой точке ──
          let r = bgRgb[0];
          let g = bgRgb[1];
          let bl = bgRgb[2];
          for (let j = 0; j < nBlobs; j++) {
            const dx = sx - bcx[j];
            const dy = sy - bcy[j];
            const Rj = bR[j];
            const q = dx * dx + dy * dy;
            if (q > Rj * Rj) continue;
            const u = 1 - Math.sqrt(q) / Rj;
            const w = u * u * (3 - 2 * u);
            const aa = ba[j] * w;
            const inv = 1 - aa;
            r = r * inv + br[j] * aa;
            g = g * inv + bgc[j] * aa;
            bl = bl * inv + bb[j] * aa;
          }

          // ── Окрашивание волны конфигурируемым градиентом ──
          if (olen > 2) {
            const mag = Math.min(1, olen / (CFG.maxDisplace * 0.8));
            const ws = Math.max(-1, Math.min(1, waveSigned / 55));
            if (ws < 0) {
              // впадина — тень складки (fold.shade)
              const aa = mag * foldIntensity * (-ws * 0.85 + 0.3);
              r += (shadeRgb[0] - r) * aa;
              g += (shadeRgb[1] - g) * aa;
              bl += (shadeRgb[2] - bl) * aa;
            } else {
              // гребень — блик (fold.crest)
              const aa = mag * foldIntensity * ws * 0.9;
              r += (crestRgb[0] - r) * aa;
              g += (crestRgb[1] - g) * aa;
              bl += (crestRgb[2] - bl) * aa;
            }
          }

          data[di] = r;
          data[di + 1] = g;
          data[di + 2] = bl;
          data[di + 3] = 255;
        }
      }

      bctx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(buf, 0, 0, width, height);
    };

    let raf = 0;
    let prev = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(now - prev, 50);
      prev = now;
      paint(now, dt);
      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      paint(12000, 16);
    } else {
      raf = requestAnimationFrame(loop);
    }

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        prev = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
