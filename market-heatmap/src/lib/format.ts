const nf = new Map<string, Intl.NumberFormat>();
function fmt(digits: number): Intl.NumberFormat {
  const key = String(digits);
  let f = nf.get(key);
  if (!f) nf.set(key, (f = new Intl.NumberFormat('da-DK', { minimumFractionDigits: digits, maximumFractionDigits: digits })));
  return f;
}

export function formatNumber(v: number, digits = 2): string {
  return Number.isFinite(v) ? fmt(digits).format(v) : '–';
}

/** "+1,23 %" — fortegn altid med; minus som ægte minustegn. */
export function formatPct(v: number, digits = 2): string {
  if (!Number.isFinite(v)) return '–';
  const s = fmt(digits).format(Math.abs(v));
  const sign = v > 0 ? '+' : v < 0 ? '−' : '';
  return `${sign}${s}%`;
}

export function formatPrice(v: number): string {
  if (!Number.isFinite(v)) return '–';
  if (v >= 1000) return fmt(0).format(v);
  if (v >= 1) return fmt(2).format(v);
  return fmt(v >= 0.01 ? 4 : 6).format(v);
}

/** Kompakt beløb: 1,23 bio. / 456 mia. / 12,3 mio. */
export function formatCompact(v: number): string {
  if (!Number.isFinite(v)) return '–';
  const a = Math.abs(v);
  if (a >= 1e12) return fmt(2).format(v / 1e12) + ' bio.';
  if (a >= 1e9) return fmt(a >= 1e11 ? 0 : 1).format(v / 1e9) + ' mia.';
  if (a >= 1e6) return fmt(1).format(v / 1e6) + ' mio.';
  if (a >= 1e3) return fmt(1).format(v / 1e3) + ' t.';
  return fmt(0).format(v);
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
