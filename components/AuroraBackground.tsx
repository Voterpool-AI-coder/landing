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
 *
 * Влияние следов растеризуется в низкоразрешающую сетку смещений:
 * каждая точка обрабатывается один раз в своём bbox, а не для каждого
 * пикселя буфера. Порядок суммирования по точкам сохранён.
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

const rgbCache = new Map<string, [number, number, number]>();

function hexToRgb(hex: string): [number, number, number] {
  let v = rgbCache.get(hex);
  if (!v) {
    const s = hex.replace('#', '');
    v = [
      parseInt(s.slice(0, 2), 16),
      parseInt(s.slice(2, 4), 16),
      parseInt(s.slice(4, 6), 16),
    ];
    rgbCache.set(hex, v);
  }
  return v;
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

    const BUF_SCALE = 0.05;
    const buf = document.createElement('canvas');
    const bctx = buf.getContext('2d', { alpha: false });
    let img: ImageData | null = null;

    // Переиспользуемые буферы (без аллокаций в кадре)
    let dispX = new Float32Array(0);
    let dispY = new Float32Array(0);
    let waveS = new Float32Array(0);

    let blobCap = 0;
    let bcx = new Float32Array(0);
    let bcy = new Float32Array(0);
    let bR = new Float32Array(0);
    let ba = new Float32Array(0);
    let br = new Float32Array(0);
    let bgc = new Float32Array(0);
    let bb = new Float32Array(0);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      buf.width = Math.max(2, Math.round(width * BUF_SCALE));
      buf.height = Math.max(2, Math.round(height * BUF_SCALE));
      img = bctx!.createImageData(buf.width, buf.height);
      // Альфа-канал постоянна — заполняем один раз, а не каждый кадр
      const d = img.data;
      for (let i = 3; i < d.length; i += 4) d[i] = 255;
      dispX = new Float32Array(buf.width * buf.height);
      dispY = new Float32Array(buf.width * buf.height);
      waveS = new Float32Array(buf.width * buf.height);
      // Состояние контекста сбрасывается при смене размеров
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
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
    const trail: TrailPoint[] = [];

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

      // Сжатие следа на месте (вместо filter с аллокацией)
      let wt = 0;
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        p.life += dtMs;
        if (p.life < p.max) trail[wt++] = p;
      }
      trail.length = wt;

      // Палитра активной темы
      const theme = FABRIC_THEMES[themeName];
      const bgRgb = hexToRgb(theme.bg);
      const shadeRgb = hexToRgb(theme.fold.shade);
      const crestRgb = hexToRgb(theme.fold.crest);
      const foldIntensity = theme.fold.intensity;
      const nBlobs = theme.blobs.length;

      if (nBlobs > blobCap) {
        blobCap = nBlobs;
        bcx = new Float32Array(nBlobs);
        bcy = new Float32Array(nBlobs);
        bR = new Float32Array(nBlobs);
        ba = new Float32Array(nBlobs);
        br = new Float32Array(nBlobs);
        bgc = new Float32Array(nBlobs);
        bb = new Float32Array(nBlobs);
      }

      // Параметры блобов на этот кадр
      const diag = Math.sqrt(width * width + height * height);

      for (let j = 0; j < nBlobs; j++) {
        const ang = t * 0.00007 + (j / nBlobs) * Math.PI * 2;
        bcx[j] =
          (0.5 +
            0.34 * Math.cos(ang + j * 1.3) +
            0.08 * Math.sin(t * 0.00019 + j)) *
            width +
          (mouse.x - width / 2) * 0.012;
        bcy[j] =
          (0.5 +
            0.3 * Math.sin(ang * 1.18 + j * 2.1) +
            0.08 * Math.cos(t * 0.00023 + j)) *
            height +
          (mouse.y - height / 2) * 0.012;
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
      const R = CFG.foldRadius;
      const R2 = R * R;
      const pullC = CFG.pull;
      const gripC = CFG.grip;
      const waveC = CFG.wave;

      // ── Растеризация влияния следов в сетку смещений ──
      // Каждый пиксель получает те же суммы ox/oy/waveSigned, что и в
      // попиксельной схеме: вклады точек добавляются в том же порядке k=0..nt-1.
      dispX.fill(0);
      dispY.fill(0);
      waveS.fill(0);
      for (let k = 0; k < nt; k++) {
        const tp = trail[k];
        const tnx = tp.nx;
        const tny = tp.ny;
        const fade = 1 - tp.life / tp.max; // константа точки на этот кадр
        const lp = tp.life * 0.004;
        const tx = tp.x;
        const ty = tp.y;

        // bbox точки в координатах буфера (надмножество круга радиуса R)
        let gx0 = Math.ceil((tx - R) / worldPerBufX - 0.5);
        let gx1 = Math.floor((tx + R) / worldPerBufX - 0.5);
        let gy0 = Math.ceil((ty - R) / worldPerBufY - 0.5);
        let gy1 = Math.floor((ty + R) / worldPerBufY - 0.5);
        if (gx0 < 0) gx0 = 0;
        if (gy0 < 0) gy0 = 0;
        if (gx1 > bw - 1) gx1 = bw - 1;
        if (gy1 > bh - 1) gy1 = bh - 1;
        if (gx0 > gx1 || gy0 > gy1) continue;

        for (let py = gy0; py <= gy1; py++) {
          const wy = (py + 0.5) * worldPerBufY;
          const dy = wy - ty;
          if (dy > R || dy < -R) continue;
          let gi = py * bw + gx0;
          for (let px = gx0; px <= gx1; px++, gi++) {
            const dx = (px + 0.5) * worldPerBufX - tx;
            if (dx > R || dx < -R) continue;
            const q = dx * dx + dy * dy;
            if (q > R2) continue;
            const d = Math.sqrt(q) || 1;
            const f = (1 - d / R) * fade;
            const f2 = f * f;
            const pullAmt = pullC * f2;
            const gripAmt = gripC * f2;
            const wv =
              Math.sin((d / R) * Math.PI * CFG.waves - lp) *
              pullC *
              waveC *
              f2;
            dispX[gi] -= tnx * pullAmt;
            dispY[gi] -= tny * pullAmt;
            dispX[gi] -= (dx / d) * gripAmt;
            dispY[gi] -= (dy / d) * gripAmt;
            dispX[gi] += -tny * wv;
            dispY[gi] += tnx * wv;
            waveS[gi] += wv;
          }
        }
      }

      const MD80 = CFG.maxDisplace * 0.8;
      const maxDisp = CFG.maxDisplace;

      let di = 0;
      let gi = 0;
      for (let py = 0; py < bh; py++) {
        const wy = (py + 0.5) * worldPerBufY;
        for (let px = 0; px < bw; px++, di += 4, gi++) {
          let sx = (px + 0.5) * worldPerBufX;
          let sy = wy;

          // ── Складки от следов мыши (из сетки смещений) ──
          let ox = dispX[gi];
          let oy = dispY[gi];
          const olen2 = ox * ox + oy * oy;
          let olen = Math.sqrt(olen2);
          if (olen > maxDisp) {
            const kc = maxDisp / olen;
            ox *= kc;
            oy *= kc;
            olen = maxDisp;
          }
          sx += ox;
          sy += oy;

          // ── Цвет поля в смещённой точке ──
          let r = bgRgb[0];
          let g = bgRgb[1];
          let bl = bgRgb[2];
          for (let j = 0; j < nBlobs; j++) {
            const dx = sx - bcx[j];
            const Rj = bR[j];
            if (dx > Rj || dx < -Rj) continue;
            const dy = sy - bcy[j];
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
            const mag = Math.min(1, olen / MD80);
            const wsRaw = waveS[gi];
            const ws = Math.max(-1, Math.min(1, wsRaw / 55));
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
        }
      }

      bctx.putImageData(img, 0, 0);
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
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
