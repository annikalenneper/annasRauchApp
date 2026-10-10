import { describe, expect, it } from 'vitest';
import { isIsoDate } from '../../src/core/dates';

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
