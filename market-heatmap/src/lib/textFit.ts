/** Forhold mellem tegnbredde og fontstørrelse for monospace-fonte. */
export const MONO_RATIO = 0.6;
export const MIN_TICKER_PX = 7;
export const MIN_SUBLABEL_PX = 8;
export const MAX_TICKER_PX = 44;

export interface LabelFit {
  tickerSize: number;
  /** 0 = vis ikke værdi under tickeren. */
  valueSize: number;
}

/**
 * Bestemmer fontstørrelser for ticker og værdi ud fra feltets størrelse.
 * Returnerer null, hvis feltet er for lille til tekst.
 */
export function fitLabel(w: number, h: number, tickerLen: number, valueLen: number): LabelFit | null {
  const padX = w > 30 ? 6 : 2;
  const availW = w - padX;
  const byWidth = availW / (Math.max(1, tickerLen) * MONO_RATIO);

  // Forsøg med to linjer: ticker + værdi (værdi ≈ 0,62 × tickerstørrelse).
  const two = Math.min(byWidth, (h - 4) / (1.15 + 0.62 * 1.15), MAX_TICKER_PX);
  if (two >= 10) {
    const valueSize = Math.min(two * 0.62, availW / (Math.max(1, valueLen) * MONO_RATIO));
    if (valueSize >= MIN_SUBLABEL_PX) return { tickerSize: Math.floor(two), valueSize: Math.floor(valueSize) };
  }
  const one = Math.min(byWidth, (h - 2) / 1.15, MAX_TICKER_PX);
  if (one >= MIN_TICKER_PX) return { tickerSize: Math.floor(one), valueSize: 0 };
  return null;
}
