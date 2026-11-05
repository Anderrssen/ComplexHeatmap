import type { Stock } from '../data/types';

export interface GroupAggregate {
  key: string;
  count: number;
  marketCap: number;
  /** Market-cap-vægtet gennemsnit af metrikken. */
  weighted: number;
  advancers: number;
  decliners: number;
  unchanged: number;
}

/**
 * Aggregerer instrumenter pr. nøgle (fx sektor) med market-cap-vægtet gennemsnit.
 * Instrumenter med ugyldig værdi tæller med i antal, men ikke i gennemsnittet.
 */
export function aggregateBy(
  stocks: readonly Stock[],
  key: (s: Stock) => string,
  value: (s: Stock) => number,
  weight: (s: Stock) => number = (s) => s.marketCap,
): GroupAggregate[] {
  const map = new Map<string, GroupAggregate & { wsum: number; vsum: number }>();
  for (const s of stocks) {
    const k = key(s);
    let g = map.get(k);
    if (!g) map.set(k, (g = { key: k, count: 0, marketCap: 0, weighted: 0, advancers: 0, decliners: 0, unchanged: 0, wsum: 0, vsum: 0 }));
    g.count++;
    g.marketCap += s.marketCap;
    const v = value(s);
    if (!Number.isFinite(v)) continue;
    if (v > 0) g.advancers++;
    else if (v < 0) g.decliners++;
    else g.unchanged++;
    const w = Math.max(0, weight(s));
    g.wsum += w;
    g.vsum += w * v;
  }
  return [...map.values()]
    .map(({ wsum, vsum, ...g }) => ({ ...g, weighted: wsum > 0 ? vsum / wsum : 0 }))
    .sort((a, b) => b.marketCap - a.marketCap);
}

export const aggregateBySector = (stocks: readonly Stock[], value: (s: Stock) => number) =>
  aggregateBy(stocks, (s) => s.sector, value);

export interface MarketSummary {
  weighted: number;
  advancers: number;
  decliners: number;
  unchanged: number;
  topGainers: Stock[];
  topLosers: Stock[];
}

export function summarize(stocks: readonly Stock[], value: (s: Stock) => number, topN = 5): MarketSummary {
  const [all] = aggregateBy(stocks, () => 'all', value);
  const valid = stocks.filter((s) => Number.isFinite(value(s)));
  const sorted = [...valid].sort((a, b) => value(b) - value(a));
  return {
    weighted: all?.weighted ?? 0,
    advancers: all?.advancers ?? 0,
    decliners: all?.decliners ?? 0,
    unchanged: all?.unchanged ?? 0,
    topGainers: sorted.slice(0, topN).filter((s) => value(s) > 0),
    topLosers: sorted.slice(-topN).reverse().filter((s) => value(s) < 0),
  };
}
