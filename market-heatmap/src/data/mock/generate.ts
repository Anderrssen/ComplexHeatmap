import type { Stock } from '../types';
import { gaussian, hashString, mulberry32 } from '../../lib/random';
import { rsi, tradingDaysYTD } from '../../lib/metrics';
import { pctChange } from '../normalize';
import type { SeedTree } from './sp500Seed';

export const HISTORY_DAYS = 260;
const SPARK_DAYS = 30;

interface SeedCompany {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  capB: number;
}

/** Simuleret instrument med fuld kurshistorik (bruges internt af MockProvider). */
export interface SimInstrument {
  base: SeedCompany;
  /** Antal udestående aktier — holdes fast, så market cap følger kursen. */
  shares: number;
  closes: number[];
  avgVolume: number;
  volume: number;
  /** Daglig volatilitet (bruges til intradag-bevægelser ved refresh). */
  dailyVol: number;
  sectorKey: string;
}

const NAME_A = ['Atlas', 'Summit', 'Crescent', 'Pioneer', 'Harbor', 'Granite', 'Liberty', 'Meridian', 'Northstar', 'Keystone', 'Evergreen', 'Sterling', 'Beacon', 'Frontier', 'Cobalt', 'Redwood', 'Silverline', 'Bluewater', 'Ironwood', 'Clearview', 'Westbrook', 'Highland', 'Oakmont', 'Brightpath', 'Lakeshore', 'Copperfield', 'Riverton', 'Stonegate', 'Vantage', 'Horizon'];
const NAME_B: Record<string, string[]> = {
  Technology: ['Systems', 'Software', 'Networks', 'Micro', 'Digital', 'Data'],
  'Communication Services': ['Media', 'Interactive', 'Broadcasting', 'Telecom'],
  'Consumer Cyclical': ['Brands', 'Retail', 'Leisure', 'Outfitters', 'Home'],
  'Consumer Defensive': ['Foods', 'Consumer', 'Provisions', 'Goods'],
  Healthcare: ['Therapeutics', 'Biosciences', 'Medical', 'Health', 'Pharma'],
  Financial: ['Bancorp', 'Financial', 'Capital', 'Holdings', 'Trust'],
  Industrials: ['Industries', 'Dynamics', 'Engineering', 'Logistics', 'Controls'],
  Energy: ['Energy', 'Resources', 'Petroleum', 'Midstream'],
  Utilities: ['Power', 'Electric', 'Utilities', 'Gas & Light'],
  'Real Estate': ['Properties', 'Realty', 'REIT', 'Land'],
  'Basic Materials': ['Materials', 'Chemicals', 'Metals', 'Minerals'],
};

function parseSeed(seed: SeedTree): SeedCompany[] {
  const out: SeedCompany[] = [];
  for (const [sector, industries] of Object.entries(seed)) {
    for (const [industry, list] of Object.entries(industries)) {
      for (const entry of list.split('|')) {
        const [ticker, name, cap] = entry.split(':');
        out.push({ ticker, name, sector, industry, capB: Number(cap) });
      }
    }
  }
  return out;
}

/** Fylder universet op med syntetiske mindre selskaber, fordelt efter industriens vægt. */
function fillSynthetic(companies: SeedCompany[], target: number, rand: () => number): SeedCompany[] {
  const used = new Set(companies.map((c) => c.ticker));
  const industries = [...new Map(companies.map((c) => [`${c.sector}|${c.industry}`, c])).values()];
  const out = [...companies];
  let guard = 0;
  while (out.length < target && guard++ < target * 50) {
    const ref = industries[Math.floor(rand() * industries.length)];
    const a = NAME_A[Math.floor(rand() * NAME_A.length)];
    const bList = NAME_B[ref.sector] ?? ['Group'];
    const b = bList[Math.floor(rand() * bList.length)];
    const name = `${a} ${b}`;
    const len = rand() < 0.6 ? 4 : 3;
    let ticker = (a.slice(0, 2) + b.slice(0, len - 2)).toUpperCase();
    if (used.has(ticker)) ticker = (a[0] + b[0] + String.fromCharCode(65 + Math.floor(rand() * 26)) + (len === 4 ? String.fromCharCode(65 + Math.floor(rand() * 26)) : '')).toUpperCase();
    if (used.has(ticker) || out.some((c) => c.name === name)) continue;
    used.add(ticker);
    // Log-uniform fordeling 6–35 mia. — typisk for de mindste S&P-medlemmer.
    const capB = Math.exp(Math.log(6) + rand() * (Math.log(35) - Math.log(6)));
    out.push({ ticker, name, sector: ref.sector, industry: ref.industry, capB: Math.round(capB * 10) / 10 });
  }
  return out;
}

export interface GenerateOptions {
  seed: string;
  target?: number;
  /** Skaleringsfaktor for markedsværdi (fx valutaomregning eller enhed). */
  capUnit?: number;
  /** Årlig volatilitet for markedsfaktoren. */
  marketVol?: number;
  /** Ekstra volatilitet for idiosynkratisk komponent (krypto ≫ aktier). */
  idioScale?: number;
}

/** Simulerer kurshistorik for alle selskaber med markeds-, sektor- og selskabsfaktor. */
export function simulateUniverse(seedTree: SeedTree, opts: GenerateOptions): SimInstrument[] {
  const rand = mulberry32(hashString(opts.seed));
  const companies = fillSynthetic(parseSeed(seedTree), opts.target ?? 0, rand);
  const capUnit = opts.capUnit ?? 1e9;
  const marketVolD = (opts.marketVol ?? 0.16) / Math.sqrt(252);
  const idioScale = opts.idioScale ?? 1;
  const N = HISTORY_DAYS;

  // Fælles markedsfaktor
  const marketDrift = 0.11 / 252;
  const market = Array.from({ length: N }, () => marketDrift + marketVolD * gaussian(rand));

  // Sektorfaktorer
  const sectorKeys = [...new Set(companies.map((c) => c.sector))];
  const sectorFactor = new Map<string, { beta: number; returns: number[] }>();
  for (const s of sectorKeys) {
    const drift = (gaussian(rand) * 0.12) / 252;
    const vol = (0.08 + rand() * 0.08) / Math.sqrt(252);
    sectorFactor.set(s, {
      beta: 0.7 + rand() * 0.6,
      returns: Array.from({ length: N }, () => drift + vol * gaussian(rand)),
    });
  }

  return companies.map((c) => {
    const r = mulberry32(hashString(opts.seed + c.ticker));
    const sf = sectorFactor.get(c.sector)!;
    // Mindre selskaber svinger mere.
    const sizeVol = 0.18 + 0.22 * Math.max(0, 1 - Math.log10(c.capB) / 3.5);
    const idioVolD = (sizeVol * idioScale) / Math.sqrt(252);
    const idioDrift = (gaussian(r) * 0.25 * idioScale) / 252;
    const beta = 0.6 + r() * 0.9;

    // Generér log-afkast og lad slutkursen ende omkring et realistisk niveau.
    const logRets: number[] = [];
    for (let i = 1; i < N; i++) {
      // Lejlighedsvise spring (earnings).
      const jump = r() < 0.012 ? gaussian(r) * 0.06 * idioScale : 0;
      logRets.push(beta * market[i] + sf.beta * sf.returns[i] + idioDrift + idioVolD * gaussian(r) + jump);
    }
    const lastPrice = Math.exp(Math.log(15) + r() * Math.log(40)); // ~15–600
    const closes = new Array<number>(N);
    closes[N - 1] = lastPrice;
    for (let i = N - 2; i >= 0; i--) closes[i] = closes[i + 1] / Math.exp(logRets[i]);

    const cap = c.capB * capUnit;
    const shares = cap / lastPrice;
    // Daglig omsætning ~0,3–1,2 % af market cap.
    const turnover = 0.003 + r() * 0.009;
    const avgVolume = (cap * turnover) / lastPrice;
    const lastMove = Math.abs(logRets[logRets.length - 1]) * 100;
    const volume = avgVolume * Math.exp(0.35 * gaussian(r)) * (1 + lastMove / 4);

    return {
      base: c,
      shares,
      closes: closes.map((x) => round(x)),
      avgVolume: Math.round(avgVolume),
      volume: Math.round(volume),
      dailyVol: Math.sqrt(beta * beta * marketVolD * marketVolD + idioVolD * idioVolD),
      sectorKey: c.sector,
    };
  });
}

function round(x: number): number {
  return x >= 1 ? Math.round(x * 100) / 100 : Math.round(x * 1e6) / 1e6;
}

/** Afleder den normaliserede Stock-type fra en simuleret kurshistorik. */
export function toStock(inst: SimInstrument, now: Date): Stock {
  const { closes } = inst;
  const n = closes.length;
  const last = closes[n - 1];
  const at = (daysBack: number) => closes[Math.max(0, n - 1 - daysBack)];
  const ytdBack = Math.min(n - 1, tradingDaysYTD(now));
  const year = closes.slice(-252);
  return {
    ticker: inst.base.ticker,
    name: inst.base.name,
    sector: inst.base.sector,
    industry: inst.base.industry,
    marketCap: Math.round(inst.shares * last),
    price: last,
    change1D: pctChange(at(1), last),
    change1W: pctChange(at(5), last),
    change1M: pctChange(at(21), last),
    changeYTD: pctChange(at(ytdBack), last),
    change1Y: pctChange(at(251), last),
    volume: inst.volume,
    avgVolume: inst.avgVolume,
    sparkline: closes.slice(-SPARK_DAYS),
    high52: Math.max(...year),
    low52: Math.min(...year),
    rsi14: rsi(closes.slice(-120)),
  };
}
