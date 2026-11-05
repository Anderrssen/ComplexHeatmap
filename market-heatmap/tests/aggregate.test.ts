import { describe, expect, it } from 'vitest';
import { aggregateBySector, summarize } from '../src/lib/aggregate';
import type { Stock } from '../src/data/types';

const mk = (ticker: string, sector: string, marketCap: number, change1D: number): Stock => ({
  ticker, name: ticker, sector, industry: 'X', marketCap, price: 10,
  change1D, change1W: 0, change1M: 0, changeYTD: 0, change1Y: 0,
  volume: 0, avgVolume: 0, sparkline: [],
});

const stocks = [
  mk('A', 'Tech', 300, 2),
  mk('B', 'Tech', 100, -2),
  mk('C', 'Energy', 50, 0),
  mk('D', 'Energy', 50, -4),
  mk('E', 'Energy', 10, NaN),
];

describe('aggregateBySector', () => {
  const agg = aggregateBySector(stocks, (s) => s.change1D);
  it('grupperer og sorterer efter market cap', () => {
    expect(agg.map((g) => g.key)).toEqual(['Tech', 'Energy']);
    expect(agg[0].marketCap).toBe(400);
    expect(agg[1].count).toBe(3);
  });
  it('beregner market-cap-vægtet ændring', () => {
    expect(agg[0].weighted).toBeCloseTo((300 * 2 + 100 * -2) / 400); // 1
    expect(agg[1].weighted).toBeCloseTo((50 * 0 + 50 * -4) / 100); // −2, NaN udelades
  });
  it('tæller stigere, fald og uændrede', () => {
    expect(agg[0]).toMatchObject({ advancers: 1, decliners: 1, unchanged: 0 });
    expect(agg[1]).toMatchObject({ advancers: 0, decliners: 1, unchanged: 1 });
  });
});

describe('summarize', () => {
  const s = summarize(stocks, (x) => x.change1D, 2);
  it('giver samlet vægtet ændring og breadth', () => {
    expect(s.weighted).toBeCloseTo((600 - 200 + 0 - 200) / 500);
    expect(s.advancers).toBe(1);
    expect(s.decliners).toBe(2);
  });
  it('finder top stigere og fald (kun med korrekt fortegn)', () => {
    expect(s.topGainers.map((x) => x.ticker)).toEqual(['A']);
    expect(s.topLosers.map((x) => x.ticker)).toEqual(['D', 'B']);
  });
});
