import { describe, expect, it } from 'vitest';
import {
  addDays,
  checkStartDate,
  daysBetween,
  isIsoDate,
  toLocalIsoDate,
} from '../../src/core/dates';

describe('isIsoDate', () => {
  it.each(['2026-10-10', '2026-01-31', '2026-04-30', '2024-02-29', '2000-02-29'])(
    'accepts %s',
    (value) => {
      expect(isIsoDate(value)).toBe(true);
    },
  );

  it.each([
    ['a non-leap 29 February', '2026-02-29'],
    ['a century that is not a leap year', '1900-02-29'],
    ['day 31 in a 30-day month', '2026-04-31'],
    ['day 0', '2026-05-00'],
    ['month 0', '2026-00-10'],
    ['month 13', '2026-13-10'],
    ['a timestamp', '2026-10-10T12:00:00Z'],
    ['a German date', '10.10.2026'],
    ['missing leading zeros', '2026-1-5'],
    ['an empty string', ''],
  ])('rejects %s', (_label, value) => {
    expect(isIsoDate(value)).toBe(false);
  });
});

describe('daysBetween', () => {
  it('counts the start day as day 0 and the next day as day 1', () => {
    expect(daysBetween('2026-05-01', '2026-05-01')).toBe(0);
    expect(daysBetween('2026-05-01', '2026-05-02')).toBe(1);
  });

  it('counts across a month change', () => {
    expect(daysBetween('2026-01-31', '2026-02-01')).toBe(1);
    expect(daysBetween('2026-04-28', '2026-05-03')).toBe(5);
  });

  it('counts across a year change', () => {
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
  });

  it('includes 29 February in a leap year only', () => {
    expect(daysBetween('2024-02-28', '2024-03-01')).toBe(2);
    expect(daysBetween('2026-02-28', '2026-03-01')).toBe(1);
    expect(daysBetween('2024-01-01', '2025-01-01')).toBe(366);
  });

  it('is not shifted by the change to summer time or back', () => {
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2);
    expect(daysBetween('2026-03-01', '2026-11-01')).toBe(245);
  });

  it('is negative when the second date is earlier', () => {
    expect(daysBetween('2026-05-02', '2026-05-01')).toBe(-1);
  });

  it('matches the example from the design: 1 May to 10 October 2026', () => {
    expect(daysBetween('2026-05-01', '2026-10-10')).toBe(162);
  });
});

describe('addDays', () => {
  it('moves across month, year and leap day', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('is the inverse of daysBetween', () => {
    expect(daysBetween('2026-03-20', addDays('2026-03-20', 400))).toBe(400);
  });
});

describe('toLocalIsoDate', () => {
  it('uses the local calendar date, also late in the evening and early in the morning', () => {
    expect(toLocalIsoDate(new Date(2026, 9, 10, 23, 59))).toBe('2026-10-10');
    expect(toLocalIsoDate(new Date(2026, 9, 11, 0, 1))).toBe('2026-10-11');
    expect(toLocalIsoDate(new Date(2026, 0, 5, 12))).toBe('2026-01-05');
  });
});

describe('checkStartDate', () => {
  it('allows today and the past', () => {
    expect(checkStartDate('2026-10-10', '2026-10-10')).toBe('ok');
    expect(checkStartDate('2026-05-01', '2026-10-10')).toBe('ok');
  });

  it('does not allow a start in the future', () => {
    expect(checkStartDate('2026-10-11', '2026-10-10')).toBe('future');
  });

  it('does not allow an invalid date', () => {
    expect(checkStartDate('2026-02-30', '2026-10-10')).toBe('invalid');
    expect(checkStartDate('', '2026-10-10')).toBe('invalid');
  });
});
