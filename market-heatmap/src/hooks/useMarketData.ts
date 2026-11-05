import { useEffect, useState } from 'react';
import type { DataProvider } from '../data/DataProvider';
import type { MarketSnapshot, UniverseId } from '../data/types';

export interface MarketDataState {
  snapshot: MarketSnapshot | null;
  loading: boolean;
  error: string | null;
}

export function useMarketData(provider: DataProvider, universe: UniverseId): MarketDataState {
  const [state, setState] = useState<MarketDataState>({ snapshot: null, loading: true, error: null });

  useEffect(() => {
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    provider
      .fetchSnapshot(universe, ctrl.signal)
      .then((snapshot) => setState({ snapshot, loading: false, error: null }))
      .catch((e: unknown) => {
        if (ctrl.signal.aborted) return;
        setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : String(e) }));
      });
    return () => ctrl.abort();
  }, [provider, universe]);

  return state;
}
