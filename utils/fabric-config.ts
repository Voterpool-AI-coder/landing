// Общие конфиги и утилиты: импортируются и компонентом, и воркером.

export type FabricThemeName = 'light' | 'dark';

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

export const FABRIC_THEMES: Record<FabricThemeName, FabricTheme> = {
  light: {
    bg: '#ffffff',
    blobs: [
      { color: '#d2e4ff', alpha: 0.5 },
      { color: '#c9e0ff', alpha: 0.42 },
      { color: '#d4e2ff', alpha: 0.4 },
      { color: '#fcfeff', alpha: 0.42 },
      { color: '#cde0fc', alpha: 0.46 },
    ],
    fold: { shade: '#98b9ef', crest: '#ffffff', intensity: 0.2 },
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
    fold: { shade: '#01030a', crest: '#2d45ff', intensity: 0.2 },
  },
};

/** Визуальный конфиг (геометрия ткани) — на скорость не влияет. */
export const FABRIC_CFG = {
  foldRadius: 230,
  pull: 20,
  grip: 40,
  wave: 1.2,
  waves: 1.8,
  maxDisplace: 180,
} as const;

/** Оптимизационный конфиг. */
export const PERF_CFG = {
  // true = не использовать OffscreenCanvas-воркер (отладка/совместимость)
  forceMainThread: false,

  // ── Разрешение ──
  bufScale: 0.02,
  minBufScale: 0.03,
  maxBufScale: 0.05,
  adaptive: true,
  frameBudgetMs: 3,
  adaptCooldownMs: 1000, // увеличен: каждая смена масштаба = пересоздание буфера

  // ── Частоты ──
  maxFps: 60,
  fieldFps: 60,
  idleFieldFps: 12,

  // ── Простое ──
  pauseWhenIdle: false,
  idleDelayMs: 2500,

  // ── Отклик ──
  mouseResponse: 5,

  // ── Точность ──
  exactSampling: false,

  // ── След ──
  trailSpacing: 8,
  trailMax: 70,
  trailLife: [1300, 3000] as [number, number],

  debug: false,
};

const rgbCache = new Map<string, [number, number, number]>();

export function hexToRgb(hex: string): [number, number, number] {
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

export function currentThemeName(): FabricThemeName {
  return typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
    ? 'dark'
    : 'light';
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
