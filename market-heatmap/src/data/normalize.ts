import type { Stock } from './types';

export const UNKNOWN_SECTOR = 'Ukendt';
export const UNKNOWN_INDUSTRY = 'Øvrige';

/** Konverterer et vilkårligt input til et endeligt tal (fallback ved NaN/null/strenge). */
export function toNumber(v: unknown, fallback = 0): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : fallback;
  if (typeof v === 'string') {
    const cleaned = v.trim().replace(/%$/, '').replace(/,/g, '');
    if (cleaned === '') return fallback;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function cleanText(v: unknown, fallback: string): string {
  if (typeof v !== 'string') return fallback;
  const s = v.trim().replace(/\s+/g, ' ');
  return s === '' ? fallback : s;
}

/** Procentændring mellem to kurser; 0 hvis basis mangler. */
export function pctChange(from: number, to: number): number {
  if (!Number.isFinite(from) || !Number.isFinite(to) || from <= 0) return 0;
  return ((to - from) / from) * 100;
}

export type RawStock = { [K in keyof Stock]?: unknown };

/**
 * Validerer og normaliserer et rå-objekt til `Stock`.
 * Returnerer `null` hvis instrumentet ikke kan bruges (ingen ticker eller pris).
 */
export function normalizeStock(raw: RawStock): Stock | null {
  const ticker = cleanText(raw.ticker, '').toUpperCase();
  const price = toNumber(raw.price, NaN);
  if (!ticker || !Number.isFinite(price) || price <= 0) return null;

  const sparkline = Array.isArray(raw.sparkline)
    ? raw.sparkline.map((x) => toNumber(x, NaN)).filter((x) => Number.isFinite(x))
    : [];

  const optional = (v: unknown): number | undefined => {
    const n = toNumber(v, NaN);
    return Number.isFinite(n) ? n : undefined;
  };

  return {
    ticker,
    name: cleanText(raw.name, ticker),
    sector: cleanText(raw.sector, UNKNOWN_SECTOR),
    industry: cleanText(raw.industry, UNKNOWN_INDUSTRY),
    marketCap: Math.max(0, toNumber(raw.marketCap)),
    price,
    change1D: toNumber(raw.change1D),
    change1W: toNumber(raw.change1W),
    change1M: toNumber(raw.change1M),
    changeYTD: toNumber(raw.changeYTD),
    change1Y: toNumber(raw.change1Y),
    volume: Math.max(0, toNumber(raw.volume)),
    avgVolume: Math.max(0, toNumber(raw.avgVolume)),
    sparkline,
    high52: optional(raw.high52),
    low52: optional(raw.low52),
    rsi14: optional(raw.rsi14),
  };
}

/** Normaliserer en liste og fjerner ugyldige og duplikerede tickers (første vinder). */
export function normalizeStocks(raws: RawStock[]): Stock[] {
  const seen = new Set<string>();
  const out: Stock[] = [];
  for (const r of raws) {
    const s = normalizeStock(r);
    if (!s || seen.has(s.ticker)) continue;
    seen.add(s.ticker);
    out.push(s);
  }
  return out;
}
