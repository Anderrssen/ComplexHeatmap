import type { Universe, UniverseId } from './types';

export const UNIVERSES: Record<UniverseId, Universe> = {
  sp500: { id: 'sp500', label: 'S&P 500', currency: 'USD' },
  ndx100: { id: 'ndx100', label: 'Nasdaq 100', currency: 'USD' },
  omxc25: { id: 'omxc25', label: 'OMX C25', currency: 'DKK' },
  stoxx600: { id: 'stoxx600', label: 'STOXX Europe 600', currency: 'EUR' },
  crypto50: { id: 'crypto50', label: 'Krypto top 50', currency: 'USD' },
  world: { id: 'world', label: 'Verdensoverblik', currency: 'USD' },
};

export const UNIVERSE_ORDER: UniverseId[] = ['sp500', 'ndx100', 'omxc25', 'stoxx600', 'crypto50', 'world'];
