// Рендер-воркер: владеет OffscreenCanvas, крутит rAF-цикл и putImageData.
// Главный поток в рендере не участвует вообще.

import type { FabricThemeName } from './fabric-config';
import { createFabricEngine, type FabricEngine } from './fabric-engine';

type Msg =
  | {
      type: 'init';
      canvas: OffscreenCanvas;
      width: number;
      height: number;
      reduced: boolean;
      theme: FabricThemeName;
    }
  | { type: 'pointer'; x: number; y: number }
  | { type: 'viewport'; width: number; height: number }
  | { type: 'theme'; theme: FabricThemeName }
  | { type: 'visibility'; hidden: boolean };

const scope = self as unknown as {
  postMessage(msg: unknown, transfer?: Transferable[]): void;
  requestAnimationFrame(cb: (t: number) => void): number;
  cancelAnimationFrame(id: number): void;
  onmessage: ((e: MessageEvent<Msg>) => void) | null;
};

// rAF есть во всех воркерах с поддержкой OffscreenCanvas; setTimeout — страховка
const hasRaf = typeof requestAnimationFrame === 'function';

let engine: FabricEngine | null = null;
let surfaceCanvas: OffscreenCanvas | null = null;

scope.onmessage = (e: MessageEvent<Msg>) => {
  const m = e.data;

  if (!engine) {
    if (m.type !== 'init') return;
    surfaceCanvas = m.canvas;
    const ctx = m.canvas.getContext('2d', {
      alpha: false,
      // desynchronized намеренно НЕ ставим — источник мерцания
    }) as OffscreenCanvasRenderingContext2D | null;
    if (!ctx) return;

    engine = createFabricEngine(
      ctx,
      {
        setSize: (w, h) => {
          if (surfaceCanvas) {
            surfaceCanvas.width = w;
            surfaceCanvas.height = h;
          }
        },
      },
      {
        reduced: m.reduced,
        theme: m.theme,
        hooks: hasRaf
          ? {
              schedule: (cb) => scope.requestAnimationFrame(cb),
              cancel: (id) => scope.cancelAnimationFrame(id),
              now: () => performance.now(),
            }
          : {
              schedule: (cb) =>
                setTimeout(
                  () => cb(performance.now()),
                  16,
                ) as unknown as number,
              cancel: (id) => clearTimeout(id),
              now: () => performance.now(),
            },
      },
    );
    engine.setViewport(m.width, m.height); // сразу рисует первый кадр
    return;
  }

  switch (m.type) {
    case 'pointer':
      engine.pointer(m.x, m.y);
      break;
    case 'viewport':
      engine.setViewport(m.width, m.height);
      break;
    case 'theme':
      engine.setTheme(m.theme);
      break;
    case 'visibility':
      engine.setHidden(m.hidden);
      break;
    case 'init':
      break;
  }
};
