import type { SmokingInfo } from '../storage/schema';

export interface Savings {
  /** Rounded to whole euros. */
  euros: number;
  cigarettes: number;
}

export interface Comparison {
  euros: number;
  text: string;
}

export function costPerDay(smoking: SmokingInfo): number {
  return (smoking.cigarettesPerDay * smoking.pricePerPack) / smoking.cigarettesPerPack;
}

/** Null when no smoking details were given; then the savings area stays hidden. */
export function calculateSavings(
  smoking: SmokingInfo | undefined,
  smokeFreeDays: number,
): Savings | null {
  if (!smoking) return null;
  return {
    euros: Math.round(smokeFreeDays * costPerDay(smoking)),
    cigarettes: Math.round(smokeFreeDays * smoking.cigarettesPerDay),
  };
}

/** The biggest comparison the saved amount already covers, if any. */
export function pickComparison(comparisons: Comparison[], euros: number): Comparison | null {
  const reached = comparisons.filter((comparison) => comparison.euros <= euros);
  return reached.reduce<Comparison | null>(
    (best, comparison) => (!best || comparison.euros > best.euros ? comparison : best),
    null,
  );
}

/** Reads a German or English decimal such as "8,90 €" or "8.9". Null if it is not a number. */
export function parseDecimal(input: string): number | null {
  const cleaned = input.replace(/€/g, '').trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  return Number(cleaned);
}
