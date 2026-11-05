import type { DataProvider } from '../DataProvider';
import type { MarketSnapshot, UniverseId } from '../types';
import { UNIVERSES } from '../universes';
import { simulateUniverse, toStock, type SimInstrument } from './generate';
import { SP500_SEED } from './sp500Seed';
import { gaussian, mulberry32 } from '../../lib/random';

type MockConfig = { build: () => SimInstrument[] };

const CONFIGS: Partial<Record<UniverseId, MockConfig>> = {
  sp500: { build: () => simulateUniverse(SP500_SEED, { seed: 'sp500', target: 503 }) },
};

/**
 * Mock-datakilde: realistiske, deterministiske data uden API-nøgler.
 * Hvert kald til `fetchSnapshot` simulerer en lille intradag-bevægelse,
 * så auto-refresh giver synlige ændringer.
 */
export class MockProvider implements DataProvider {
  readonly id = 'mock';
  readonly label = 'Mock-data';
  private cache = new Map<UniverseId, SimInstrument[]>();
  private tick = 0;

  constructor(private readonly opts: { latencyMs?: number; now?: () => Date } = {}) {}

  supports(universe: UniverseId): boolean {
    return universe in CONFIGS;
  }

  async fetchSnapshot(universe: UniverseId, signal?: AbortSignal): Promise<MarketSnapshot> {
    const cfg = CONFIGS[universe];
    if (!cfg) throw new Error(`MockProvider understøtter ikke universet "${universe}" endnu`);

    let insts = this.cache.get(universe);
    if (!insts) {
      insts = cfg.build();
      this.cache.set(universe, insts);
    } else {
      this.advance(insts);
    }

    const latency = this.opts.latencyMs ?? 120;
    if (latency > 0) await delay(latency, signal);

    const now = this.opts.now?.() ?? new Date();
    return {
      universe,
      currency: UNIVERSES[universe].currency,
      stocks: insts.map((i) => toStock(i, now)),
      asOf: now.getTime(),
      source: this.label,
    };
  }

  /** Flytter seneste kurs en smule (≈ et par minutters handel). */
  private advance(insts: SimInstrument[]): void {
    const rand = mulberry32(++this.tick * 7919);
    const marketShock = gaussian(rand) * 0.0015;
    const sectorShock = new Map<string, number>();
    for (const inst of insts) {
      let s = sectorShock.get(inst.sectorKey);
      if (s === undefined) sectorShock.set(inst.sectorKey, (s = gaussian(rand) * 0.001));
      const move = marketShock + s + gaussian(rand) * inst.dailyVol * 0.12;
      const n = inst.closes.length;
      inst.closes[n - 1] = Math.max(0.0001, inst.closes[n - 1] * Math.exp(move));
      inst.volume = Math.round(inst.volume * (1 + Math.abs(move) * 2 + rand() * 0.004));
    }
  }
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new DOMException('Afbrudt', 'AbortError'));
    });
  });
}
