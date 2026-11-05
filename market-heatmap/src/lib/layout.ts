import { hierarchy, treemap, treemapSquarify, type HierarchyRectangularNode } from 'd3-hierarchy';
import type { Stock } from '../data/types';

export type SizeMetric = 'marketCap' | 'dollarVolume' | 'equal';

export const SIZE_METRICS: { id: SizeMetric; label: string }[] = [
  { id: 'marketCap', label: 'Markedsværdi' },
  { id: 'dollarVolume', label: 'Omsætning' },
  { id: 'equal', label: 'Lige store' },
];

export function sizeValue(s: Stock, metric: SizeMetric): number {
  switch (metric) {
    case 'marketCap':
      return s.marketCap;
    case 'dollarVolume':
      return s.price * s.avgVolume;
    case 'equal':
      return 1;
  }
}

/** Fokus for drill-down. Tom = hele universet. */
export interface Focus {
  sector?: string;
  industry?: string;
}

export interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface LeafRect extends Rect {
  /** Indeks i det oprindelige `stocks`-array. */
  index: number;
  /** Indeks i `groups` for forælder-industrien. */
  group: number;
  value: number;
}

export interface GroupRect extends Rect {
  depth: 1 | 2;
  kind: 'sector' | 'industry';
  name: string;
  sector: string;
  /** Højde af headeren i px (0 = ingen plads til header). */
  header: number;
  value: number;
  /** Indekser i `leaves` [start, end). Blade ligger samlet pr. gruppe. */
  leafStart: number;
  leafEnd: number;
}

export interface TreemapLayout {
  width: number;
  height: number;
  focus: Focus;
  groups: GroupRect[];
  leaves: LeafRect[];
}

export const LAYOUT = {
  sectorHeader: 17,
  industryHeader: 13,
  /** Minimumsstørrelse for at vise en header. */
  sectorHeaderMin: { w: 48, h: 40 },
  industryHeaderMin: { w: 56, h: 34 },
  gapSector: 3,
  gapIndustry: 2,
  gapLeaf: 1,
};

interface TreeDatum {
  name: string;
  children?: TreeDatum[];
  stockIndex?: number;
  value?: number;
}

/**
 * Bygger hierarkiet Sektor → Industri → Aktie og beregner et squarified treemap.
 * Ren funktion — afhænger kun af data, størrelsesmetrik, fokus og viewport.
 */
export function computeLayout(
  stocks: readonly Stock[],
  opts: { sizeMetric: SizeMetric; width: number; height: number; focus?: Focus; include?: (s: Stock) => boolean },
): TreemapLayout {
  const { width, height, sizeMetric } = opts;
  const focus = opts.focus ?? {};

  const sectors = new Map<string, Map<string, TreeDatum[]>>();
  stocks.forEach((s, i) => {
    if (focus.sector && s.sector !== focus.sector) return;
    if (focus.industry && s.industry !== focus.industry) return;
    if (opts.include && !opts.include(s)) return;
    const v = sizeValue(s, sizeMetric);
    if (!(v > 0)) return;
    let inds = sectors.get(s.sector);
    if (!inds) sectors.set(s.sector, (inds = new Map()));
    let list = inds.get(s.industry);
    if (!list) inds.set(s.industry, (list = []));
    list.push({ name: s.ticker, stockIndex: i, value: v });
  });

  const rootDatum: TreeDatum = {
    name: 'root',
    children: [...sectors].map(([sector, inds]) => ({
      name: sector,
      children: [...inds].map(([industry, leaves]) => ({ name: industry, children: leaves })),
    })),
  };

  const empty: TreemapLayout = { width, height, focus, groups: [], leaves: [] };
  if (width <= 0 || height <= 0 || rootDatum.children!.length === 0) return empty;

  const root = hierarchy(rootDatum)
    .sum((d) => d.value ?? 0)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  const fitsHeader = (n: HierarchyRectangularNode<TreeDatum>, min: { w: number; h: number }) =>
    n.x1 - n.x0 >= min.w && n.y1 - n.y0 >= min.h;

  treemap<TreeDatum>()
    .size([width, height])
    .tile(treemapSquarify.ratio(1.2))
    .round(true)
    .paddingInner((n) => (n.depth === 0 ? LAYOUT.gapSector : n.depth === 1 ? LAYOUT.gapIndustry : LAYOUT.gapLeaf))
    .paddingTop((n) => {
      if (n.depth === 1) return fitsHeader(n, LAYOUT.sectorHeaderMin) ? LAYOUT.sectorHeader : 0;
      if (n.depth === 2) return fitsHeader(n, LAYOUT.industryHeaderMin) ? LAYOUT.industryHeader : 0;
      return 0;
    })(root);

  const groups: GroupRect[] = [];
  const leaves: LeafRect[] = [];
  const rr = root as HierarchyRectangularNode<TreeDatum>;
  for (const sec of rr.children ?? []) {
    const secIdx = groups.length;
    groups.push({
      x0: sec.x0, y0: sec.y0, x1: sec.x1, y1: sec.y1,
      depth: 1, kind: 'sector', name: sec.data.name, sector: sec.data.name,
      header: fitsHeader(sec, LAYOUT.sectorHeaderMin) ? LAYOUT.sectorHeader : 0,
      value: sec.value ?? 0, leafStart: leaves.length, leafEnd: 0,
    });
    for (const ind of sec.children ?? []) {
      const indIdx = groups.length;
      const start = leaves.length;
      for (const leaf of ind.children ?? []) {
        leaves.push({ x0: leaf.x0, y0: leaf.y0, x1: leaf.x1, y1: leaf.y1, index: leaf.data.stockIndex!, group: indIdx, value: leaf.value ?? 0 });
      }
      groups.push({
        x0: ind.x0, y0: ind.y0, x1: ind.x1, y1: ind.y1,
        depth: 2, kind: 'industry', name: ind.data.name, sector: sec.data.name,
        header: fitsHeader(ind, LAYOUT.industryHeaderMin) ? LAYOUT.industryHeader : 0,
        value: ind.value ?? 0, leafStart: start, leafEnd: leaves.length,
      });
    }
    groups[secIdx].leafEnd = leaves.length;
  }
  return { width, height, focus, groups, leaves };
}
