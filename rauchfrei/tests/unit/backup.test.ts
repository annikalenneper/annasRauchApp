import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBackupCode, readBackupCode } from '../../src/storage/backup';
import type { AppState } from '../../src/storage/schema';

const state = (): AppState => ({
  schemaVersion: 2,
  createdAt: '2026-05-01',
  attempts: [
    { startDate: '2026-01-01', slips: [] },
    {
      startDate: '2026-05-01',
      slips: [
        { date: '2026-06-10', trigger: 'alkohol', note: 'Geburtstag bei Jörg – „nur eine“ 🙈' },
      ],
    },
  ],
  smoking: { cigarettesPerDay: 15, pricePerPack: 8.9, cigarettesPerPack: 20 },
  seenRewards: ['1:milestone:1', '1:health:0'],
  settings: { homescreenHintDismissed: true },
});

const encode = (value: unknown) =>
  'RF0.' +
  btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(value))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('backup code', () => {
  it('round-trips a state', async () => {
    const code = await createBackupCode(state());

    expect(code).toMatch(/^RF1\.[A-Za-z0-9_-]+$/);
    expect(await readBackupCode(code)).toEqual({ ok: true, state: state() });
  });

  it('survives line breaks and spaces from copying', async () => {
    const code = await createBackupCode(state());
    const pasted = `  ${code.slice(0, 20)}\n${code.slice(20, 40)} ${code.slice(40)}\n`;

    expect(await readBackupCode(pasted)).toEqual({ ok: true, state: state() });
  });

  it('falls back to an uncompressed code where the browser cannot compress', async () => {
    vi.stubGlobal('CompressionStream', undefined);

    const code = await createBackupCode(state());

    expect(code).toMatch(/^RF0\./);
    expect(await readBackupCode(code)).toEqual({ ok: true, state: state() });
  });

  it('reports an empty input', async () => {
    expect(await readBackupCode('  \n ')).toEqual({ ok: false, reason: 'empty' });
  });

  it.each(['hallo', 'RF2.abc', 'RF1.', 'RF1.abc$def', '<script>alert(1)</script>'])(
    'rejects "%s" as wrong format',
    async (input) => {
      expect(await readBackupCode(input)).toEqual({ ok: false, reason: 'format' });
    },
  );

  it('rejects an overlong code', async () => {
    expect(await readBackupCode('RF1.' + 'A'.repeat(60_000))).toEqual({
      ok: false,
      reason: 'format',
    });
  });

  it('rejects a truncated code', async () => {
    const code = await createBackupCode(state());

    expect(await readBackupCode(code.slice(0, -12))).toMatchObject({ ok: false });
  });

  it('rejects data that is not compressed JSON', async () => {
    expect(await readBackupCode('RF1.AAAAAAAAAAAAAAAA')).toEqual({ ok: false, reason: 'damaged' });
    expect(await readBackupCode('RF0.AAAA')).toEqual({ ok: false, reason: 'damaged' });
  });

  it('rejects a backup from a newer app version', async () => {
    expect(await readBackupCode(encode({ ...state(), schemaVersion: 3 }))).toEqual({
      ok: false,
      reason: 'too-new',
    });
  });

  it('upgrades a backup made by the first app version', async () => {
    expect(await readBackupCode(encode({ ...state(), schemaVersion: 1 }))).toEqual({
      ok: true,
      state: state(),
    });
  });

  it('rejects an invalid state completely', async () => {
    const broken = { ...state(), attempts: [{ startDate: '2026-02-30', slips: [] }] };

    expect(await readBackupCode(encode(broken))).toEqual({ ok: false, reason: 'invalid' });
    expect(await readBackupCode(encode({ ...state(), extra: 1 }))).toEqual({
      ok: false,
      reason: 'invalid',
    });
    expect(await readBackupCode(encode([1, 2, 3]))).toEqual({ ok: false, reason: 'invalid' });
  });
});
