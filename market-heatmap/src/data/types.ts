/** Normaliseret instrument — alle providers mapper til denne type. */
export interface Stock {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  /** Markedsværdi i universets valuta. */
  marketCap: number;
  price: number;
  /** Procentvise ændringer, fx 1.25 = +1,25 %. */
  change1D: number;
  change1W: number;
  change1M: number;
  changeYTD: number;
  change1Y: number;
  volume: number;
  avgVolume: number;
  /** Seneste lukkekurser (ældst først), bruges til tooltip-sparkline. */
  sparkline: number[];
  /** Valgfrie felter til afledte metrikker. */
  high52?: number;
  low52?: number;
  rsi14?: number;
}

export type Period = '1D' | '1W' | '1M' | 'YTD' | '1Y';

export type UniverseId = 'sp500' | 'ndx100' | 'omxc25' | 'stoxx600' | 'crypto50' | 'world';

export interface Universe {
  id: UniverseId;
  label: string;
  currency: string;
}

export interface MarketSnapshot {
  universe: UniverseId;
  currency: string;
  stocks: Stock[];
  /** Tidspunkt (epoch ms) for dataene. */
  asOf: number;
  source: string;
}
