/** RSI(14) efter Wilders udglatning. Returnerer 50 ved for lidt data. */
export function rsi(closes: readonly number[], period = 14): number {
  if (closes.length <= period) return 50;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) gain += d;
    else loss -= d;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period;
  }
  if (avgLoss === 0) return avgGain === 0 ? 50 : 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/** Antal handelsdage (hverdage) fra årets start til og med `date`. */
export function tradingDaysYTD(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  let n = 0;
  for (const d = new Date(start); d <= date; d.setDate(d.getDate() + 1)) {
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) n++;
  }
  return n;
}

/** Relativ volumen: dagens volumen / gennemsnit. */
export function relativeVolume(volume: number, avgVolume: number): number {
  return avgVolume > 0 ? volume / avgVolume : 1;
}

/** Afstand fra 52-ugers high i procent (≤ 0). */
export function distFromHigh(price: number, high52: number | undefined): number {
  if (!high52 || high52 <= 0) return 0;
  return Math.min(0, ((price - high52) / high52) * 100);
}
