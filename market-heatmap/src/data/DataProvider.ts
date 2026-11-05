import type { MarketSnapshot, UniverseId } from './types';

/** Fælles interface, så datakilden kan skiftes ud. */
export interface DataProvider {
  readonly id: string;
  readonly label: string;
  /** Universer providerens data dækker. */
  supports(universe: UniverseId): boolean;
  fetchSnapshot(universe: UniverseId, signal?: AbortSignal): Promise<MarketSnapshot>;
}
