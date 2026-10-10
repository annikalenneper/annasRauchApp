import { describe, expect, it } from 'vitest';
import { calculateSavings, costPerDay, parseDecimal, pickComparison } from '../../src/core/savings';

const smoking = { cigarettesPerDay: 15, pricePerPack: 8.9, cigarettesPerPack: 20 };

describe('calculateSavings', () => {
  it('returns nothing without smoking details', () => {
    expect(calculateSavings(undefined, 160)).toBeNull();
  });

  it('multiplies the cost per day by the smoke-free days', () => {
    expect(costPerDay(smoking)).toBeCloseTo(6.675);
    expect(calculateSavings(smoking, 160)).toEqual({ euros: 1068, cigarettes: 2400 });
  });

  it('rounds to whole euros', () => {
    expect(calculateSavings(smoking, 1)?.euros).toBe(7);
    expect(calculateSavings(smoking, 150)?.euros).toBe(1001);
  });

  it('is 0 on day 0', () => {
    expect(calculateSavings(smoking, 0)).toEqual({ euros: 0, cigarettes: 0 });
  });
});

describe('pickComparison', () => {
  const comparisons = [
    { euros: 50, text: 'a' },
    { euros: 500, text: 'c' },
    { euros: 200, text: 'b' },
  ];

  it('picks the biggest one already reached', () => {
    expect(pickComparison(comparisons, 499)?.text).toBe('b');
    expect(pickComparison(comparisons, 500)?.text).toBe('c');
  });

  it('picks nothing below the first amount', () => {
    expect(pickComparison(comparisons, 49)).toBeNull();
  });
});

describe('parseDecimal', () => {
  it.each([
    ['8,90', 8.9],
    ['8.9', 8.9],
    ['8,90 €', 8.9],
    [' 9 ', 9],
    ['15', 15],
  ])('reads %s', (input, expected) => {
    expect(parseDecimal(input)).toBe(expected);
  });

  it.each(['', 'acht', '8,9,0', '-3', '1e5'])('rejects "%s"', (input) => {
    expect(parseDecimal(input)).toBeNull();
  });
});
