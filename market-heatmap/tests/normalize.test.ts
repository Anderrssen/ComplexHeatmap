import { describe, expect, it } from 'vitest';
import { normalizeStock, normalizeStocks, pctChange, toNumber, UNKNOWN_SECTOR } from '../src/data/normalize';

describe('toNumber', () => {
  it('parser tal, strenge og procent', () => {
    expect(toNumber(5)).toBe(5);
    expect(toNumber('1,234.5')).toBe(1234.5);
    expect(toNumber('-2.5%')).toBe(-2.5);
  });
  it('bruger fallback for ugyldige værdier', () => {
    expect(toNumber(null, 7)).toBe(7);
    expect(toNumber('abc', 7)).toBe(7);
    expect(toNumber(Infinity, 7)).toBe(7);
    expect(toNumber('', 7)).toBe(7);
  });
});

describe('normalizeStock', () => {
  it('normaliserer et gyldigt objekt', () => {
    const s = normalizeStock({
      ticker: ' aapl ', name: 'Apple  Inc', sector: 'Technology', industry: 'Consumer Electronics',
      marketCap: '3000000000000', price: '190.5', change1D: '1.2', volume: 1000, avgVolume: 800,
      sparkline: [1, '2', null, 3], rsi14: 'x',
    });
    expect(s).not.toBeNull();
    expect(s!.ticker).toBe('AAPL');
    expect(s!.name).toBe('Apple Inc');
    expect(s!.marketCap).toBe(3e12);
    expect(s!.price).toBe(190.5);
    expect(s!.change1D).toBe(1.2);
    expect(s!.change1W).toBe(0);
    expect(s!.sparkline).toEqual([1, 2, 3]);
    expect(s!.rsi14).toBeUndefined();
  });
  it('udfylder manglende sektor/industri/navn', () => {
    const s = normalizeStock({ ticker: 'X', price: 1 })!;
    expect(s.sector).toBe(UNKNOWN_SECTOR);
    expect(s.name).toBe('X');
  });
  it('afviser instrumenter uden ticker eller gyldig pris', () => {
    expect(normalizeStock({ price: 1 })).toBeNull();
    expect(normalizeStock({ ticker: 'X', price: 0 })).toBeNull();
    expect(normalizeStock({ ticker: 'X', price: 'n/a' })).toBeNull();
  });
  it('klipper negative størrelser til 0', () => {
    expect(normalizeStock({ ticker: 'X', price: 1, marketCap: -5, volume: -1 })).toMatchObject({ marketCap: 0, volume: 0 });
  });
});

describe('normalizeStocks', () => {
  it('fjerner ugyldige og duplikerede tickers', () => {
    const out = normalizeStocks([{ ticker: 'A', price: 1 }, { ticker: 'a', price: 2 }, { ticker: '', price: 1 }, { ticker: 'B', price: 3 }]);
    expect(out.map((s) => [s.ticker, s.price])).toEqual([['A', 1], ['B', 3]]);
  });
});

describe('pctChange', () => {
  it('beregner procentændring og er robust over for 0', () => {
    expect(pctChange(100, 110)).toBeCloseTo(10);
    expect(pctChange(0, 5)).toBe(0);
  });
});
