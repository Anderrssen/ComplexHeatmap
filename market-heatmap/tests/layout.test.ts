import { describe, expect, it } from 'vitest';
import { computeLayout } from '../src/lib/layout';
import { simulateUniverse, toStock } from '../src/data/mock/generate';
import { SP500_SEED } from '../src/data/mock/sp500Seed';

const stocks = simulateUniverse(SP500_SEED, { seed: 'test', target: 500 }).map((i) => toStock(i, new Date(2026, 10, 5)));

describe('mock-data', () => {
  it('genererer ~500 unikke, gyldige aktier', () => {
    expect(stocks.length).toBeGreaterThanOrEqual(500);
    expect(new Set(stocks.map((s) => s.ticker)).size).toBe(stocks.length);
    for (const s of stocks) {
      expect(s.price).toBeGreaterThan(0);
      expect(s.marketCap).toBeGreaterThan(0);
      expect(Number.isFinite(s.change1D)).toBe(true);
      expect(s.sparkline.length).toBe(30);
    }
  });
});

describe('computeLayout', () => {
  const layout = computeLayout(stocks, { sizeMetric: 'marketCap', width: 1600, height: 900 });
  it('placerer alle aktier inden for viewporten', () => {
    expect(layout.leaves.length).toBe(stocks.length);
    for (const l of layout.leaves) {
      expect(l.x0).toBeGreaterThanOrEqual(0);
      expect(l.y0).toBeGreaterThanOrEqual(0);
      expect(l.x1).toBeLessThanOrEqual(1600);
      expect(l.y1).toBeLessThanOrEqual(900);
    }
  });
  it('har grupper for hver sektor med korrekte bladintervaller', () => {
    const sectors = layout.groups.filter((g) => g.kind === 'sector');
    expect(sectors.length).toBe(new Set(stocks.map((s) => s.sector)).size);
    for (const g of layout.groups) {
      for (let i = g.leafStart; i < g.leafEnd; i++) expect(stocks[layout.leaves[i].index].sector).toBe(g.sector);
    }
  });
  it('filtrerer på fokus (drill-down)', () => {
    const f = computeLayout(stocks, { sizeMetric: 'equal', width: 800, height: 600, focus: { sector: 'Energy' } });
    expect(f.leaves.every((l) => stocks[l.index].sector === 'Energy')).toBe(true);
    expect(f.groups.filter((g) => g.kind === 'sector')).toHaveLength(1);
  });
});
