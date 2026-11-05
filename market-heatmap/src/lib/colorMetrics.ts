import type { Stock } from '../data/types';
import { distFromHigh, relativeVolume } from './metrics';
import type { ColorDomain } from './colorScale';
import { formatPct, formatNumber } from './format';

export type ColorMetricId =
  | 'change1D' | 'change1W' | 'change1M' | 'changeYTD' | 'change1Y'
  | 'relVolume' | 'distHigh' | 'rsi14';

export interface ColorMetric {
  id: ColorMetricId;
  label: string;
  short: string;
  value: (s: Stock) => number;
  format: (v: number) => string;
  /** Standard låst skala. */
  locked: ColorDomain;
  /** Skal værdien vises i felterne som procent? */
  isChange: boolean;
}

const sym = (x: number): ColorDomain => ({ min: -x, center: 0, max: x });

export const COLOR_METRICS: Record<ColorMetricId, ColorMetric> = {
  change1D: { id: 'change1D', label: '% ændring 1D', short: '1D', value: (s) => s.change1D, format: formatPct, locked: sym(3), isChange: true },
  change1W: { id: 'change1W', label: '% ændring 1U', short: '1U', value: (s) => s.change1W, format: formatPct, locked: sym(6), isChange: true },
  change1M: { id: 'change1M', label: '% ændring 1M', short: '1M', value: (s) => s.change1M, format: formatPct, locked: sym(10), isChange: true },
  changeYTD: { id: 'changeYTD', label: '% ændring ÅTD', short: 'ÅTD', value: (s) => s.changeYTD, format: formatPct, locked: sym(25), isChange: true },
  change1Y: { id: 'change1Y', label: '% ændring 1Å', short: '1Å', value: (s) => s.change1Y, format: formatPct, locked: sym(40), isChange: true },
  relVolume: {
    id: 'relVolume', label: 'Relativ volumen', short: 'RVol',
    value: (s) => relativeVolume(s.volume, s.avgVolume),
    format: (v) => formatNumber(v, 2) + 'x',
    locked: { min: 0.5, center: 1, max: 2.5 }, isChange: false,
  },
  distHigh: {
    id: 'distHigh', label: 'Afstand fra 52-ugers high', short: '52U-H',
    value: (s) => (s.high52 ? distFromHigh(s.price, s.high52) : NaN),
    format: formatPct,
    locked: { min: -30, center: -10, max: 0 }, isChange: false,
  },
  rsi14: {
    id: 'rsi14', label: 'RSI(14)', short: 'RSI',
    value: (s) => s.rsi14 ?? NaN,
    format: (v) => formatNumber(v, 0),
    locked: { min: 30, center: 50, max: 70 }, isChange: false,
  },
};

export const COLOR_METRIC_ORDER: ColorMetricId[] = ['change1D', 'change1W', 'change1M', 'changeYTD', 'change1Y', 'relVolume', 'distHigh', 'rsi14'];
