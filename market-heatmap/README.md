# Markedskort — interaktivt heatmap over de finansielle markeder

React + TypeScript + Vite, D3 (squarified treemap) og `<canvas>`-rendering.

> Status: **fase 1** — mock-data og statisk treemap på canvas med farver.
> Fuld opsætnings- og deploy-guide (Cloudflare Worker, `.env`) kommer i fase 4.

## Kom i gang

```bash
cd market-heatmap
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest
npm run typecheck  # tsc uden output
```

## Struktur

```
src/
  data/         DataProvider-interface, normalisering, universer, mock/
  lib/          layout (d3-hierarchy), farveskalaer, metrikker, aggregering, tekst-fit, formatering
  components/   Treemap (canvas-renderer), Legend, …
  hooks/        useMarketData, useElementSize
tests/          Vitest: farveskala, aggregering, normalisering, layout
```

**Layout vs. paint:** `computeLayout()` afhænger kun af data, størrelsesmetrik, fokus og viewport.
`computePaint()` (farver og tekster) afhænger af farvemetrik og skala. Skift af farvemetrik tegner derfor kun forfra, uden at layoutet beregnes igen.
