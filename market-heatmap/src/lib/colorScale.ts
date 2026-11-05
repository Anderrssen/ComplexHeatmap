import { interpolateLab, piecewise } from 'd3-interpolate';

export type PaletteId = 'redGreen' | 'blueOrange';

export interface Palette {
  id: PaletteId;
  label: string;
  /** Fra mest negativ → neutral → mest positiv. */
  stops: string[];
  /** Farve for manglende værdi. */
  missing: string;
}

export const NEUTRAL = '#3b3f48';

export const PALETTES: Record<PaletteId, Palette> = {
  redGreen: {
    id: 'redGreen',
    label: 'Rød / grøn',
    stops: ['#f0333f', '#a8303b', '#5e3039', NEUTRAL, '#2c5b3f', '#2b8f4f', '#2fd060'],
    missing: '#25272c',
  },
  blueOrange: {
    id: 'blueOrange',
    label: 'Orange / blå (farveblind)',
    stops: ['#ff8c1a', '#b8661f', '#6a4529', NEUTRAL, '#2b4b70', '#2b73c2', '#3fa3ff'],
    missing: '#25272c',
  },
};

/** Domæne for divergerende skala: min ↦ −1, center ↦ 0, max ↦ +1. */
export interface ColorDomain {
  min: number;
  center: number;
  max: number;
}

/** Afbilder en værdi til [−1, 1] stykvis lineært omkring centrum (afklippet). */
export function toUnit(v: number, d: ColorDomain): number {
  if (!Number.isFinite(v)) return NaN;
  if (v >= d.center) {
    const span = d.max - d.center;
    return span <= 0 ? (v > d.center ? 1 : 0) : Math.min(1, (v - d.center) / span);
  }
  const span = d.center - d.min;
  return span <= 0 ? -1 : Math.max(-1, (v - d.center) / span);
}

/** Simpel kvantil på et sorteret array (lineær interpolation). */
export function quantileSorted(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) return NaN;
  const idx = (sorted.length - 1) * Math.min(1, Math.max(0, p));
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/**
 * Automatisk, symmetrisk domæne ud fra percentiler af afstanden til centrum.
 * Bruger fx 95-percentilen, så outliers ikke "udvasker" farverne.
 */
export function autoDomain(values: readonly number[], center: number, percentile = 0.95, minSpan = 1e-9): ColorDomain {
  const dev = values.filter(Number.isFinite).map((v) => Math.abs(v - center)).sort((a, b) => a - b);
  const span = Math.max(minSpan, quantileSorted(dev, percentile) || 0);
  return { min: center - span, center, max: center + span };
}

export interface ColorScale {
  (v: number): string;
  domain: ColorDomain;
  palette: Palette;
}

const LUT_SIZE = 257; // ulige → præcis neutral midte
const lutCache = new Map<PaletteId, string[]>();

/** Opslagstabel med forudberegnede farver (hurtig ved 1.000+ felter). */
export function paletteLUT(id: PaletteId): string[] {
  let lut = lutCache.get(id);
  if (!lut) {
    const interp = piecewise(interpolateLab, PALETTES[id].stops);
    lut = Array.from({ length: LUT_SIZE }, (_, i) => toHex(interp(i / (LUT_SIZE - 1))));
    lutCache.set(id, lut);
  }
  return lut;
}

export function makeColorScale(domain: ColorDomain, paletteId: PaletteId): ColorScale {
  const lut = paletteLUT(paletteId);
  const palette = PALETTES[paletteId];
  const fn = ((v: number) => {
    const u = toUnit(v, domain);
    if (Number.isNaN(u)) return palette.missing;
    return lut[Math.round(((u + 1) / 2) * (LUT_SIZE - 1))];
  }) as ColorScale;
  fn.domain = domain;
  fn.palette = palette;
  return fn;
}

/** d3 returnerer "rgb(r, g, b)" — vi normaliserer til hex for stabile sammenligninger. */
function toHex(c: string): string {
  const m = c.match(/\d+(\.\d+)?/g);
  if (!m || m.length < 3) return c;
  return '#' + m.slice(0, 3).map((x) => Math.round(Number(x)).toString(16).padStart(2, '0')).join('');
}
