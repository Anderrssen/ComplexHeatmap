import { useMemo, useState } from 'react';
import { MockProvider } from './data/mock/MockProvider';
import type { UniverseId } from './data/types';
import { UNIVERSES } from './data/universes';
import { useMarketData } from './hooks/useMarketData';
import { Treemap } from './components/Treemap/Treemap';
import { Legend } from './components/Legend';
import { COLOR_METRICS, type ColorMetricId } from './lib/colorMetrics';
import { makeColorScale, type PaletteId } from './lib/colorScale';
import type { SizeMetric } from './lib/layout';
import { formatTime } from './lib/format';

const provider = new MockProvider();

export default function App() {
  const [universe] = useState<UniverseId>('sp500');
  const [colorMetricId] = useState<ColorMetricId>('change1D');
  const [sizeMetric] = useState<SizeMetric>('marketCap');
  const [paletteId, setPaletteId] = useState<PaletteId>('redGreen');
  const { snapshot, loading, error } = useMarketData(provider, universe);

  const stocks = snapshot?.stocks ?? [];
  const metric = COLOR_METRICS[colorMetricId];
  const scale = useMemo(() => makeColorScale(metric.locked, paletteId), [metric, paletteId]);

  return (
    <div className="flex h-dvh flex-col bg-[#0a0b0d] text-zinc-200">
      <header className="flex h-10 shrink-0 items-center gap-4 border-b border-zinc-800 px-3 font-mono text-xs">
        <span className="font-bold tracking-wider text-zinc-100">MARKEDSKORT</span>
        <span className="text-zinc-500">{UNIVERSES[universe].label}</span>
        <span className="text-zinc-500">{metric.label}</span>
        <span className="text-zinc-600">{stocks.length} instrumenter</span>
        <div className="ml-auto flex items-center gap-4">
          <Legend scale={scale} metric={metric} />
          <button
            type="button"
            className="border border-zinc-700 px-2 py-0.5 text-zinc-300 hover:border-zinc-500 hover:text-white"
            onClick={() => setPaletteId((p) => (p === 'redGreen' ? 'blueOrange' : 'redGreen'))}
          >
            Palet: {paletteId === 'redGreen' ? 'Rød/grøn' : 'Orange/blå'}
          </button>
          {snapshot && <span className="tabular-nums text-zinc-500">{snapshot.source} · {formatTime(snapshot.asOf)}</span>}
        </div>
      </header>
      <main className="relative min-h-0 flex-1">
        {error && <div className="absolute inset-0 grid place-items-center font-mono text-sm text-red-400">Fejl: {error}</div>}
        {loading && !snapshot && <div className="absolute inset-0 grid place-items-center font-mono text-sm text-zinc-500">Indlæser…</div>}
        {snapshot && <Treemap stocks={stocks} sizeMetric={sizeMetric} colorMetric={metric} colorScale={scale} />}
      </main>
    </div>
  );
}
