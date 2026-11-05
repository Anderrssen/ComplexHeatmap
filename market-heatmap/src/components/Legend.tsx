import { paletteLUT, type ColorScale } from '../lib/colorScale';
import type { ColorMetric } from '../lib/colorMetrics';

/** Farveforklaring: gradient + domæneværdier. */
export function Legend({ scale, metric }: { scale: ColorScale; metric: ColorMetric }) {
  const lut = paletteLUT(scale.palette.id);
  const stops = [0, 0.25, 0.5, 0.75, 1].map((t) => `${lut[Math.round(t * (lut.length - 1))]} ${t * 100}%`).join(', ');
  const { min, center, max } = scale.domain;
  return (
    <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400" title={metric.label}>
      <span className="tabular-nums">{metric.format(min)}</span>
      <div className="h-3 w-40 border border-zinc-800" style={{ background: `linear-gradient(90deg, ${stops})` }} />
      <span className="tabular-nums">{metric.format(max)}</span>
      <span className="sr-only">Neutral ved {metric.format(center)}</span>
    </div>
  );
}
