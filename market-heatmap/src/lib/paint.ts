import type { Stock } from '../data/types';
import type { TreemapLayout } from './layout';
import type { ColorMetric } from './colorMetrics';
import type { ColorScale } from './colorScale';

/** Alt, der afhænger af farvemetrikken — beregnes uden at røre layoutet. */
export interface Paint {
  leafColor: string[];
  leafValue: number[];
  leafText: string[];
  groupValue: number[];
  groupText: string[];
}

export function computePaint(layout: TreemapLayout, stocks: readonly Stock[], metric: ColorMetric, scale: ColorScale): Paint {
  const n = layout.leaves.length;
  const leafColor = new Array<string>(n);
  const leafValue = new Array<number>(n);
  const leafText = new Array<string>(n);
  for (let i = 0; i < n; i++) {
    const v = metric.value(stocks[layout.leaves[i].index]);
    leafValue[i] = v;
    leafColor[i] = scale(v);
    leafText[i] = metric.format(v);
  }
  // Gruppeværdi = størrelsesvægtet gennemsnit af bladene (samme vægt som arealet).
  const groupValue = layout.groups.map((g) => {
    let ws = 0;
    let vs = 0;
    for (let i = g.leafStart; i < g.leafEnd; i++) {
      const v = leafValue[i];
      if (!Number.isFinite(v)) continue;
      const w = layout.leaves[i].value;
      ws += w;
      vs += w * v;
    }
    return ws > 0 ? vs / ws : NaN;
  });
  return { leafColor, leafValue, leafText, groupValue, groupText: groupValue.map((v) => metric.format(v)) };
}
