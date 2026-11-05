import { useEffect, useMemo, useRef } from 'react';
import type { Stock } from '../../data/types';
import { computeLayout, type Focus, type SizeMetric } from '../../lib/layout';
import { computePaint } from '../../lib/paint';
import type { ColorMetric } from '../../lib/colorMetrics';
import type { ColorScale } from '../../lib/colorScale';
import { useDevicePixelRatio, useElementSize } from '../../hooks/useElementSize';
import { TreemapRenderer } from './renderer';
import { THEME } from './theme';

export interface TreemapProps {
  stocks: readonly Stock[];
  sizeMetric: SizeMetric;
  colorMetric: ColorMetric;
  colorScale: ColorScale;
  focus?: Focus;
}

export function Treemap({ stocks, sizeMetric, colorMetric, colorScale, focus }: TreemapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<TreemapRenderer | null>(null);
  const { width, height } = useElementSize(containerRef);
  const dpr = useDevicePixelRatio();

  const sector = focus?.sector;
  const industry = focus?.industry;
  // Layout: KUN data, størrelsesmetrik, fokus og viewport.
  const layout = useMemo(
    () => computeLayout(stocks, { sizeMetric, width, height, focus: { sector, industry } }),
    [stocks, sizeMetric, width, height, sector, industry],
  );
  // Paint: farvemetrik/skala — genbruger layoutet.
  const paint = useMemo(() => computePaint(layout, stocks, colorMetric, colorScale), [layout, stocks, colorMetric, colorScale]);

  useEffect(() => {
    if (!canvasRef.current) return;
    rendererRef.current ??= new TreemapRenderer(canvasRef.current);
  }, []);

  useEffect(() => {
    rendererRef.current?.resize(width, height, dpr);
  }, [width, height, dpr]);

  useEffect(() => {
    const r = rendererRef.current;
    if (!r || width === 0 || height === 0) return;
    const blueOrange = colorScale.palette.id === 'blueOrange';
    r.draw({
      layout,
      paint,
      stocks,
      signedHeaders: colorMetric.isChange,
      signColors: blueOrange
        ? { pos: THEME.positiveAlt, neg: THEME.negativeAlt }
        : { pos: THEME.positive, neg: THEME.negative },
    });
  }, [layout, paint, stocks, colorMetric, colorScale, width, height, dpr]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 block" />
    </div>
  );
}
