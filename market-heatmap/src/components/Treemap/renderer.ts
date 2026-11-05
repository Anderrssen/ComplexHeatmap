import type { Stock } from '../../data/types';
import type { TreemapLayout } from '../../lib/layout';
import type { Paint } from '../../lib/paint';
import { fitLabel, MONO_RATIO } from '../../lib/textFit';
import { FONT_STACK, THEME } from './theme';

export interface Scene {
  layout: TreemapLayout;
  paint: Paint;
  stocks: readonly Stock[];
  /** Farver til header-værdier (afhænger af palet). */
  signColors: { pos: string; neg: string };
  /** Vis værdier i headers/felter som fortegnsfarvet tekst? */
  signedHeaders: boolean;
}

/** Tegner treemap'en på et <canvas>. Ingen React — ren imperativ tegning. */
export class TreemapRenderer {
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private dpr = 1;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D understøttes ikke');
    this.ctx = ctx;
  }

  resize(width: number, height: number, dpr: number): void {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.canvas.width = Math.max(1, Math.round(width * dpr));
    this.canvas.height = Math.max(1, Math.round(height * dpr));
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
  }

  draw(scene: Scene): void {
    const { ctx } = this;
    const { layout, paint, stocks } = scene;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = THEME.background;
    ctx.fillRect(0, 0, this.width, this.height);

    // 1) Gruppebaggrunde (sektor, så industri ovenpå).
    for (const g of layout.groups) {
      ctx.fillStyle = g.kind === 'sector' ? THEME.sectorFill : THEME.industryFill;
      ctx.fillRect(g.x0, g.y0, g.x1 - g.x0, g.y1 - g.y0);
    }

    // 2) Felter.
    const { leaves } = layout;
    for (let i = 0; i < leaves.length; i++) {
      const l = leaves[i];
      ctx.fillStyle = paint.leafColor[i];
      ctx.fillRect(l.x0, l.y0, l.x1 - l.x0, l.y1 - l.y0);
    }

    // 3) Headers.
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    for (let gi = 0; gi < layout.groups.length; gi++) {
      const g = layout.groups[gi];
      if (!g.header) continue;
      const isSector = g.kind === 'sector';
      const size = isSector ? 11 : 9.5;
      const y = g.y0 + g.header / 2 + (isSector ? 0.5 : 0);
      const x = g.x0 + 4;
      const maxW = g.x1 - g.x0 - 8;
      const label = isSector ? g.name.toUpperCase() : g.name;
      const value = paint.groupText[gi];
      const v = paint.groupValue[gi];

      ctx.font = `${isSector ? 700 : 500} ${size}px ${FONT_STACK}`;
      const valueW = value.length * size * MONO_RATIO;
      const showValue = maxW > valueW + 6 * size * MONO_RATIO;
      const nameMax = showValue ? maxW - valueW - size : maxW;
      ctx.fillStyle = isSector ? THEME.sectorText : THEME.industryText;
      ctx.fillText(truncate(label, nameMax, size), x, y);
      if (showValue) {
        ctx.textAlign = 'right';
        ctx.fillStyle = !scene.signedHeaders || !Number.isFinite(v) || v === 0
          ? (isSector ? THEME.sectorText : THEME.industryText)
          : v > 0 ? scene.signColors.pos : scene.signColors.neg;
        ctx.fillText(value, g.x1 - 4, y);
        ctx.textAlign = 'left';
      }
    }

    // 4) Tickers + værdi.
    ctx.textAlign = 'center';
    let curFont = '';
    for (let i = 0; i < leaves.length; i++) {
      const l = leaves[i];
      const w = l.x1 - l.x0;
      const h = l.y1 - l.y0;
      if (w < 12 || h < 9) continue;
      const ticker = stocks[l.index].ticker;
      const text = paint.leafText[i];
      const fit = fitLabel(w, h, ticker.length, text.length);
      if (!fit) continue;
      const cx = l.x0 + w / 2;
      const cy = l.y0 + h / 2;
      const tFont = `700 ${fit.tickerSize}px ${FONT_STACK}`;
      if (tFont !== curFont) ctx.font = curFont = tFont;
      ctx.fillStyle = THEME.leafText;
      if (fit.valueSize > 0) {
        const total = fit.tickerSize * 1.1 + fit.valueSize * 1.1;
        const top = cy - total / 2;
        ctx.fillText(ticker, cx, top + fit.tickerSize * 0.55);
        const vFont = `500 ${fit.valueSize}px ${FONT_STACK}`;
        ctx.font = curFont = vFont;
        ctx.fillStyle = THEME.leafSubText;
        ctx.fillText(text, cx, top + fit.tickerSize * 1.1 + fit.valueSize * 0.6);
      } else {
        ctx.fillText(ticker, cx, cy + 0.5);
      }
    }
  }
}

/** Afkorter tekst med "…" ud fra monospace-bredde (undgår dyre measureText-kald). */
function truncate(text: string, maxW: number, size: number): string {
  const maxChars = Math.floor(maxW / (size * MONO_RATIO));
  if (maxChars <= 0) return '';
  if (text.length <= maxChars) return text;
  return maxChars <= 1 ? text[0] : text.slice(0, maxChars - 1) + '…';
}
