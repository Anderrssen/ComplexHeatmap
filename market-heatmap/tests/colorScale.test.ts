import { describe, expect, it } from 'vitest';
import { autoDomain, makeColorScale, NEUTRAL, PALETTES, paletteLUT, quantileSorted, toUnit } from '../src/lib/colorScale';

describe('toUnit', () => {
  const d = { min: -3, center: 0, max: 3 };
  it('afbilder centrum til 0 og ekstremer til ±1', () => {
    expect(toUnit(0, d)).toBe(0);
    expect(toUnit(3, d)).toBe(1);
    expect(toUnit(-3, d)).toBe(-1);
    expect(toUnit(1.5, d)).toBeCloseTo(0.5);
  });
  it('klipper værdier uden for den låste skala', () => {
    expect(toUnit(10, d)).toBe(1);
    expect(toUnit(-99, d)).toBe(-1);
  });
  it('håndterer asymmetriske domæner stykvis', () => {
    const a = { min: -30, center: -10, max: 0 };
    expect(toUnit(-10, a)).toBe(0);
    expect(toUnit(-5, a)).toBeCloseTo(0.5);
    expect(toUnit(-20, a)).toBeCloseTo(-0.5);
  });
  it('giver NaN for manglende værdier', () => {
    expect(toUnit(NaN, d)).toBeNaN();
  });
});

describe('makeColorScale', () => {
  const scale = makeColorScale({ min: -3, center: 0, max: 3 }, 'redGreen');
  it('giver neutral grå i centrum', () => {
    expect(scale(0)).toBe(NEUTRAL);
  });
  it('giver paletens ekstremfarver ved og uden for grænserne', () => {
    expect(scale(3)).toBe(PALETTES.redGreen.stops.at(-1));
    expect(scale(-3)).toBe(PALETTES.redGreen.stops[0]);
    expect(scale(50)).toBe(scale(3));
  });
  it('bruger "missing"-farve for NaN', () => {
    expect(scale(NaN)).toBe(PALETTES.redGreen.missing);
  });
  it('er monoton i grøn-kanalen for positive værdier', () => {
    const g = (hex: string) => parseInt(hex.slice(3, 5), 16);
    expect(g(scale(1))).toBeLessThan(g(scale(2)));
    expect(g(scale(2))).toBeLessThan(g(scale(3)));
  });
  it('har en farveblind-palet med andre farver', () => {
    const alt = makeColorScale(scale.domain, 'blueOrange');
    expect(alt(3)).not.toBe(scale(3));
    expect(alt(0)).toBe(NEUTRAL);
    expect(paletteLUT('blueOrange')).toHaveLength(257);
  });
});

describe('autoDomain', () => {
  it('er symmetrisk om centrum og bruger percentil af afvigelsen', () => {
    const values = Array.from({ length: 101 }, (_, i) => i - 50); // −50..50
    const d = autoDomain(values, 0, 0.9);
    expect(d.center).toBe(0);
    expect(d.max).toBeCloseTo(45);
    expect(d.min).toBeCloseTo(-45);
  });
  it('ignorerer NaN og lader sig ikke styre af en enkelt outlier', () => {
    const values = [...Array(99).fill(1), 1000, NaN];
    expect(autoDomain(values, 0, 0.95).max).toBeCloseTo(1);
  });
  it('har et minimumsspænd ved konstante data', () => {
    const d = autoDomain([2, 2, 2], 2, 0.95, 0.5);
    expect(d.max - d.center).toBe(0.5);
  });
});

describe('quantileSorted', () => {
  it('interpolerer lineært', () => {
    expect(quantileSorted([0, 10], 0.5)).toBe(5);
    expect(quantileSorted([], 0.5)).toBeNaN();
  });
});
