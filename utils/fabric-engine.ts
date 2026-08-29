// Движок ткани. Не знает ни про React, ни про DOM-события: планировщик
// кадров и время приходят снаружи (hooks), поэтому один и тот же код
// работает и в воркере, и на главном потоке (fallback).

import type { FabricThemeName } from './fabric-config';
import {
  FABRIC_CFG,
  FABRIC_THEMES,
  PERF_CFG,
  clamp,
  hexToRgb,
} from './fabric-config';

export type EngineHooks = {
  schedule(cb: (now: number) => void): number;
  cancel(handle: number): void;
  now(): number;
};

export type FabricEngine = {
  setViewport(width: number, height: number): void;
  pointer(x: number, y: number): void;
  setTheme(name: FabricThemeName): void;
  setHidden(hidden: boolean): void;
  dispose(): void;
};

type TrailPoint = {
  x: number;
  y: number;
  nx: number;
  ny: number;
  life: number;
  max: number;
};

export function createFabricEngine(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  surface: { setSize(w: number, h: number): void },
  opts: { reduced: boolean; theme: FabricThemeName; hooks: EngineHooks },
): FabricEngine {
  const { reduced, hooks } = opts;
  let themeName: FabricThemeName = opts.theme;

  // ── Буферы ──
  let width = 1;
  let height = 1;
  let scale = clamp(
    PERF_CFG.bufScale,
    PERF_CFG.minBufScale,
    PERF_CFG.maxBufScale,
  );
  let bw = 2;
  let bh = 2;
  let worldPerBufX = 1;
  let worldPerBufY = 1;
  let img: ImageData | null = null;
  let out = new Uint8ClampedArray(0);
  let field = new Uint8ClampedArray(0);
  let dispX = new Float32Array(0);
  let dispY = new Float32Array(0);
  let waveS = new Float32Array(0);
  let mask = new Uint8Array(0);

  let blobCap = 0;
  let blobCount = 0;
  let bcx = new Float32Array(0);
  let bcy = new Float32Array(0);
  let bR = new Float32Array(0);
  let ba = new Float32Array(0);
  let br = new Float32Array(0);
  let bgc = new Float32Array(0);
  let bb = new Float32Array(0);

  // ── Состояние цикла ──
  let raf = 0;
  let sleeping = false;
  let hidden = false;
  let disposed = false;
  let lastFrame = 0;
  let lastInput = 0;
  let fieldT = -1e9;
  let prevNt = 0;
  let emaCost = PERF_CFG.frameBudgetMs;
  let overStreak = 0;
  let underStreak = 0;
  let lastAdapt = 0;
  const startT = hooks.now();

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let mouseInit = false;
  let lastSpawnX = 0;
  let lastSpawnY = 0;
  let hasLastSpawn = false;
  const trail: TrailPoint[] = [];

  // ── Параметры блобов (формулы оригинала) ──
  const updateBlobParams = (t: number) => {
    const theme = FABRIC_THEMES[themeName];
    const nBlobs = theme.blobs.length;
    blobCount = nBlobs;
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
    const diag = Math.sqrt(width * width + height * height) || 1;
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
  };

  // ── Фоновое поле (bg + blobs) ──
  const paintField = () => {
    const f = field;
    const bg = hexToRgb(FABRIC_THEMES[themeName].bg);
    const nB = blobCount;
    let di = 0;
    for (let py = 0; py < bh; py++) {
      const sy = (py + 0.5) * worldPerBufY;
      for (let px = 0; px < bw; px++, di += 4) {
        const sx = (px + 0.5) * worldPerBufX;
        let r = bg[0];
        let g = bg[1];
        let bl = bg[2];
        for (let j = 0; j < nB; j++) {
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
        f[di] = r;
        f[di + 1] = g;
        f[di + 2] = bl;
      }
    }
  };

  // ── Композиция кадра (математика следа — 1:1 с оригиналом) ──
  const compose = () => {
    const f = field;
    const nt = trail.length;

    if (nt === 0) {
      out.set(f);
      return;
    }

    const R = FABRIC_CFG.foldRadius;
    const R2 = R * R;
    const pullC = FABRIC_CFG.pull;
    const gripC = FABRIC_CFG.grip;
    const waveC = FABRIC_CFG.wave;
    const wavesN = FABRIC_CFG.waves;

    dispX.fill(0);
    dispY.fill(0);
    waveS.fill(0);
    mask.fill(0);

    // Растеризация влияния следов (порядок точек k=0..nt-1 сохранён)
    for (let k = 0; k < nt; k++) {
      const tp = trail[k];
      const tnx = tp.nx;
      const tny = tp.ny;
      const fade = 1 - tp.life / tp.max;
      const lp = tp.life * 0.004;
      const tpx = tp.x;
      const tpy = tp.y;

      let gx0 = Math.ceil((tpx - R) / worldPerBufX - 0.5);
      let gx1 = Math.floor((tpx + R) / worldPerBufX - 0.5);
      let gy0 = Math.ceil((tpy - R) / worldPerBufY - 0.5);
      let gy1 = Math.floor((tpy + R) / worldPerBufY - 0.5);
      if (gx0 < 0) gx0 = 0;
      if (gy0 < 0) gy0 = 0;
      if (gx1 > bw - 1) gx1 = bw - 1;
      if (gy1 > bh - 1) gy1 = bh - 1;
      if (gx0 > gx1 || gy0 > gy1) continue;

      for (let py = gy0; py <= gy1; py++) {
        const wy = (py + 0.5) * worldPerBufY;
        const dy = wy - tpy;
        if (dy > R || dy < -R) continue;
        let gi = py * bw + gx0;
        for (let px = gx0; px <= gx1; px++, gi++) {
          const dx = (px + 0.5) * worldPerBufX - tpx;
          if (dx > R || dx < -R) continue;
          const q = dx * dx + dy * dy;
          if (q > R2) continue;
          mask[gi] = 1;
          const d = Math.sqrt(q) || 1;
          const ff = (1 - d / R) * fade;
          const f2 = ff * ff;
          const pullAmt = pullC * f2;
          const gripAmt = gripC * f2;
          const wv =
            Math.sin((d / R) * Math.PI * wavesN - lp) * pullC * waveC * f2;
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

    const theme = FABRIC_THEMES[themeName];
    const foldIntensity = theme.fold.intensity;
    const shade = hexToRgb(theme.fold.shade);
    const crest = hexToRgb(theme.fold.crest);
    const bg = hexToRgb(theme.bg);
    const nB = blobCount;
    const MD80 = FABRIC_CFG.maxDisplace * 0.8;
    const maxDisp = FABRIC_CFG.maxDisplace;
    const invWX = 1 / worldPerBufX;
    const invWY = 1 / worldPerBufY;
    const exact = PERF_CFG.exactSampling;
    const bm1 = bw - 1;
    const bhm1 = bh - 1;

    let di = 0;
    let gi = 0;
    for (let py = 0; py < bh; py++) {
      for (let px = 0; px < bw; px++, di += 4, gi++) {
        if (mask[gi] === 0) {
          out[di] = f[di];
          out[di + 1] = f[di + 1];
          out[di + 2] = f[di + 2];
          continue;
        }

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
        const sx = (px + 0.5) * worldPerBufX + ox;
        const sy = (py + 0.5) * worldPerBufY + oy;

        let r: number;
        let g: number;
        let bl: number;
        if (exact) {
          r = bg[0];
          g = bg[1];
          bl = bg[2];
          for (let j = 0; j < nB; j++) {
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
        } else {
          let fx = sx * invWX - 0.5;
          let fy = sy * invWY - 0.5;
          if (fx < 0) fx = 0;
          else if (fx > bm1) fx = bm1;
          if (fy < 0) fy = 0;
          else if (fy > bhm1) fy = bhm1;
          const x0 = fx | 0;
          const y0 = fy | 0;
          const txf = fx - x0;
          const tyf = fy - y0;
          let x1 = x0 + 1;
          if (x1 > bm1) x1 = bm1;
          let y1 = y0 + 1;
          if (y1 > bhm1) y1 = bhm1;
          const i00 = (y0 * bw + x0) << 2;
          const i10 = (y0 * bw + x1) << 2;
          const i01 = (y1 * bw + x0) << 2;
          const i11 = (y1 * bw + x1) << 2;
          const a0 = f[i00] + (f[i10] - f[i00]) * txf;
          const a1 = f[i01] + (f[i11] - f[i01]) * txf;
          r = a0 + (a1 - a0) * tyf;
          const b0 = f[i00 + 1] + (f[i10 + 1] - f[i00 + 1]) * txf;
          const b1 = f[i01 + 1] + (f[i11 + 1] - f[i01 + 1]) * txf;
          g = b0 + (b1 - b0) * tyf;
          const c0 = f[i00 + 2] + (f[i10 + 2] - f[i00 + 2]) * txf;
          const c1 = f[i01 + 2] + (f[i11 + 2] - f[i01 + 2]) * txf;
          bl = c0 + (c1 - c0) * tyf;
        }

        if (olen > 2) {
          const mag = Math.min(1, olen / MD80);
          const wsRaw = waveS[gi];
          const ws = wsRaw < -55 ? -1 : wsRaw > 55 ? 1 : wsRaw / 55;
          if (ws < 0) {
            const aa = mag * foldIntensity * (-ws * 0.85 + 0.3);
            r += (shade[0] - r) * aa;
            g += (shade[1] - g) * aa;
            bl += (shade[2] - bl) * aa;
          } else {
            const aa = mag * foldIntensity * ws * 0.9;
            r += (crest[0] - r) * aa;
            g += (crest[1] - g) * aa;
            bl += (crest[2] - bl) * aa;
          }
        }

        out[di] = r;
        out[di + 1] = g;
        out[di + 2] = bl;
      }
    }
  };

  const present = () => {
    if (img) ctx.putImageData(img, 0, 0);
  };

  // Полная синхронная перерисовка. Вызывается после ЛЮБОГО изменения
  // backing store: compositor никогда не видит пустой canvas.
  const renderSync = () => {
    if (!img) return;
    updateBlobParams(reduced ? 12000 : hooks.now());
    paintField();
    fieldT = hooks.now();
    if (!reduced && trail.length > 0) compose();
    else out.set(field);
    present();
  };

  const applyViewport = (w: number, h: number) => {
    width = Math.max(1, w);
    height = Math.max(1, h);
    bw = Math.max(2, Math.round(width * scale));
    bh = Math.max(2, Math.round(height * scale));
    worldPerBufX = width / bw;
    worldPerBufY = height / bh;
    // ⚠️ Установка размера очищает backing store — поэтому сразу ниже
    // идёт renderSync (главный фикс мерцания).
    surface.setSize(bw, bh);
    img = ctx.createImageData(bw, bh);
    out = img.data;
    const n = bw * bh;
    field = new Uint8ClampedArray(n * 4);
    dispX = new Float32Array(n);
    dispY = new Float32Array(n);
    waveS = new Float32Array(n);
    mask = new Uint8Array(n);
    for (let i = 3; i < field.length; i += 4) field[i] = 255;
    for (let i = 3; i < out.length; i += 4) out[i] = 255;
    if (!mouseInit) {
      mouse.tx = width / 2;
      mouse.ty = height * 0.38;
      mouse.x = mouse.tx;
      mouse.y = mouse.ty;
    }
    renderSync();
    start();
  };

  const stop = () => {
    if (raf !== 0) {
      hooks.cancel(raf);
      raf = 0;
    }
  };

  const start = () => {
    if (disposed || hidden || reduced || sleeping) return;
    if (raf === 0) {
      lastFrame = 0;
      raf = hooks.schedule(frame);
    }
  };

  const wake = () => {
    if (sleeping) sleeping = false;
    start();
  };

  // ── Основной цикл ──
  const frame = (now: number) => {
    raf = 0;
    if (!img) return;

    // FPS-потолок
    if (PERF_CFG.maxFps > 0 && lastFrame !== 0) {
      const minIv = 1000 / PERF_CFG.maxFps;
      if (now - lastFrame < minIv - 0.25) {
        raf = hooks.schedule(frame);
        return;
      }
    }
    const dtMs = Math.min(lastFrame !== 0 ? now - lastFrame : 16, 50);
    lastFrame = now;

    // Затухание следа (сжатие на месте)
    let wt = 0;
    for (let i = 0; i < trail.length; i++) {
      const p = trail[i];
      p.life += dtMs;
      if (p.life < p.max) trail[wt++] = p;
    }
    trail.length = wt;

    // FPS-независимое сглаживание курсора
    const k = 1 - Math.exp((-PERF_CFG.mouseResponse * dtMs) / 1000);
    mouse.x += (mouse.tx - mouse.x) * k;
    mouse.y += (mouse.ty - mouse.y) * k;

    const nt = trail.length;
    const idle = nt === 0;
    const fieldFps = idle ? PERF_CFG.idleFieldFps : PERF_CFG.fieldFps;
    const fieldDue = fieldFps <= 0 || now - fieldT >= 1000 / fieldFps;
    // prevNt > 0 — след только что полностью угас: форсируем один кадр,
    // чтобы остаточные складки гарантированно стёрлись
    const needPaint = nt > 0 || fieldDue || prevNt > 0;

    const t0 = hooks.now();
    if (needPaint) {
      updateBlobParams(now);
      if (fieldDue) {
        paintField();
        fieldT = now;
      }
      compose();
      present();
    }
    prevNt = nt;
    const cost = hooks.now() - t0;

    // ── Адаптив с гистерезисом: без «пилы» пересозданий буфера ──
    if (
      PERF_CFG.adaptive &&
      nt > 0 &&
      now - startT > 700 &&
      now - lastAdapt > PERF_CFG.adaptCooldownMs
    ) {
      emaCost += (cost - emaCost) * 0.25;
      if (PERF_CFG.debug) {
        console.log(
          '[fabric] scale=%s cost=%.2fms ema=%.2fms',
          scale.toFixed(3),
          cost,
          emaCost,
        );
      }
      if (emaCost > PERF_CFG.frameBudgetMs) {
        overStreak++;
        underStreak = 0;
      } else if (emaCost < PERF_CFG.frameBudgetMs * 0.45) {
        underStreak++;
        overStreak = 0;
      } else {
        overStreak = 0;
        underStreak = 0;
      }

      if (overStreak >= 2 && scale > PERF_CFG.minBufScale) {
        scale = Math.max(PERF_CFG.minBufScale, scale * 0.78);
        applyViewport(width, height); // renderSync внутри — без пустого кадра
        lastAdapt = hooks.now();
        emaCost = PERF_CFG.frameBudgetMs;
        overStreak = 0;
        underStreak = 0;
      } else if (underStreak >= 4 && scale < PERF_CFG.maxBufScale) {
        scale = Math.min(PERF_CFG.maxBufScale, scale * 1.12);
        applyViewport(width, height);
        lastAdapt = hooks.now();
        emaCost = PERF_CFG.frameBudgetMs;
        overStreak = 0;
        underStreak = 0;
      }
    }

    // Сон в простое
    if (
      PERF_CFG.pauseWhenIdle &&
      idle &&
      now - lastInput > PERF_CFG.idleDelayMs
    ) {
      sleeping = true;
      return; // wake() перезапустит цикл
    }

    raf = hooks.schedule(frame);
  };

  return {
    setViewport: (w, h) => applyViewport(w, h),

    pointer(x, y) {
      lastInput = hooks.now();
      mouse.tx = x;
      mouse.ty = y;
      if (!mouseInit) {
        mouse.x = x;
        mouse.y = y;
        mouseInit = true;
      }
      if (reduced) return;
      wake();
      if (!hasLastSpawn) {
        lastSpawnX = x;
        lastSpawnY = y;
        hasLastSpawn = true;
        return;
      }
      const dxs = x - lastSpawnX;
      const dys = y - lastSpawnY;
      const seg = Math.hypot(dxs, dys);
      if (seg < PERF_CFG.trailSpacing || seg > 400) return;
      if (trail.length >= PERF_CFG.trailMax) trail.shift();
      trail.push({
        x,
        y,
        nx: dxs / seg,
        ny: dys / seg,
        life: 0,
        max:
          PERF_CFG.trailLife[0] +
          Math.random() * (PERF_CFG.trailLife[1] - PERF_CFG.trailLife[0]),
      });
      lastSpawnX = x;
      lastSpawnY = y;
    },

    setTheme(name) {
      if (name === themeName) return;
      themeName = name;
      renderSync(); // мгновенная перекраска, без смешанного кадра
    },

    setHidden(h) {
      hidden = h;
      if (h) stop();
      else {
        sleeping = false;
        start();
      }
    },

    dispose() {
      disposed = true;
      stop();
      trail.length = 0;
    },
  };
}
