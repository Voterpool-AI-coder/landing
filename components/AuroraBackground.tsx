'use client';

import { useEffect, useRef } from 'react';
import {
  PERF_CFG,
  currentThemeName,
  type FabricThemeName,
} from '../utils/fabric-config';
import { createFabricEngine, type FabricEngine } from '../utils/fabric-engine';

// Реэкспорты для обратной совместимости с прежним API компонента
export { FABRIC_CFG, FABRIC_THEMES, PERF_CFG } from '../utils/fabric-config';
export type { FabricTheme, FabricThemeName } from '../utils/fabric-config';

type Api = {
  pointer(x: number, y: number): void;
  viewport(w: number, h: number): void;
  theme(t: FabricThemeName): void;
  visibility(hidden: boolean): void;
};

export default function AuroraBackground() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    // Свежий canvas на каждый запуск эффекта: transferControlToOffscreen()
    // можно вызвать только один раз на элемент (важно для StrictMode).
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.pointerEvents = 'none';
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);

    const canWorker =
      !PERF_CFG.forceMainThread &&
      typeof Worker !== 'undefined' &&
      typeof OffscreenCanvas !== 'undefined' &&
      typeof HTMLCanvasElement !== 'undefined' &&
      'transferControlToOffscreen' in HTMLCanvasElement.prototype;

    let worker: Worker | null = null;
    let engine: FabricEngine | null = null;
    let api: Api | null = null;

    if (canWorker) {
      const w = new Worker(
        new URL('../utils/fabric.worker.ts', import.meta.url),
        {
          type: 'module',
        },
      );
      worker = w;
      const off = canvas.transferControlToOffscreen();
      w.postMessage(
        {
          type: 'init',
          canvas: off,
          width: window.innerWidth,
          height: window.innerHeight,
          reduced,
          theme: currentThemeName(),
        },
        [off],
      );
      api = {
        pointer: (x, y) => w.postMessage({ type: 'pointer', x, y }),
        viewport: (width, height) =>
          w.postMessage({ type: 'viewport', width, height }),
        theme: (theme) => w.postMessage({ type: 'theme', theme }),
        visibility: (hidden) => w.postMessage({ type: 'visibility', hidden }),
      };
    } else {
      // Fallback: тот же движок на главном потоке (без desynchronized!)
      const ctx = canvas.getContext('2d', { alpha: false });
      if (ctx) {
        const e = createFabricEngine(
          ctx,
          {
            setSize: (w, h) => {
              canvas.width = w;
              canvas.height = h;
            },
          },
          {
            reduced,
            theme: currentThemeName(),
            hooks: {
              schedule: (cb) => window.requestAnimationFrame(cb),
              cancel: (id) => window.cancelAnimationFrame(id),
              now: () => performance.now(),
            },
          },
        );
        engine = e;
        api = {
          pointer: (x, y) => e.pointer(x, y),
          viewport: (width, height) => e.setViewport(width, height),
          theme: (theme) => e.setTheme(theme),
          visibility: (hidden) => e.setHidden(hidden),
        };
        e.setViewport(window.innerWidth, window.innerHeight);
      }
    }

    if (!api) {
      canvas.remove();
      return;
    }

    api.visibility(document.hidden); // синхронизируем стартовое состояние

    const onMove = (e: MouseEvent) => api!.pointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) api!.pointer(t.clientX, t.clientY);
    };
    const onResize = () => api!.viewport(window.innerWidth, window.innerHeight);
    const onVis = () => api!.visibility(document.hidden);

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);

    const themeObserver = new MutationObserver(() =>
      api!.theme(currentThemeName()),
    );
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      themeObserver.disconnect();
      if (worker) worker.terminate();
      engine?.dispose();
      canvas.remove();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    />
  );
}
