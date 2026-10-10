import { describe, expect, it } from 'vitest';
import { migrate, migrations, type Migration } from '../../src/storage/migrations';
import { SCHEMA_VERSION } from '../../src/storage/schema';

describe('migrate', () => {
  it('returns data of the current version unchanged', () => {
    const raw = { schemaVersion: SCHEMA_VERSION, createdAt: '2026-10-10' };

    expect(migrate(raw)).toEqual({ ok: true, value: raw });
  });

  it('has a migration for every version below the current one', () => {
    for (let version = 1; version < SCHEMA_VERSION; version++) {
      expect(migrations[version], `migration from v${version}`).toBeTypeOf('function');
    }
  });

  it('runs a test migration chain up to the target version', () => {
    const steps: Record<number, Migration> = {
      1: (state) => ({ ...state, seenRewards: [] }),
      2: ({ startDate, ...rest }) => ({ ...rest, attempts: [{ startDate, slips: [] }] }),
    };

    const result = migrate({ schemaVersion: 1, startDate: '2026-05-03' }, steps, 3);

    expect(result).toEqual({
      ok: true,
      value: {
        schemaVersion: 3,
        seenRewards: [],
        attempts: [{ startDate: '2026-05-03', slips: [] }],
      },
    });
  });

  it('does not change the input object', () => {
    const raw = { schemaVersion: 1 };

    migrate(raw, { 1: (state) => ({ ...state, added: true }) }, 2);

    expect(raw).toEqual({ schemaVersion: 1 });
  });

  it.each([
    ['null', null],
    ['a string', 'x'],
    ['an array', [1]],
  ])('rejects %s', (_label, raw) => {
    expect(migrate(raw)).toEqual({ ok: false, reason: 'not-an-object' });
  });

  it.each([
    ['missing', {}],
    ['text', { schemaVersion: '1' }],
    ['fractional', { schemaVersion: 1.5 }],
    ['zero', { schemaVersion: 0 }],
  ])('rejects a %s schema version', (_label, raw) => {
    expect(migrate(raw)).toEqual({ ok: false, reason: 'no-version' });
  });

  it('rejects data from a newer app version', () => {
    expect(migrate({ schemaVersion: SCHEMA_VERSION + 1 })).toEqual({
      ok: false,
      reason: 'too-new',
    });
  });

  it('rejects data when a migration step is missing', () => {
    expect(migrate({ schemaVersion: 1 }, {}, 2)).toEqual({
      ok: false,
      reason: 'missing-migration',
    });
  });
});
