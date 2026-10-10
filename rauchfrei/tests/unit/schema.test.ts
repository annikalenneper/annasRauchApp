import { describe, expect, it } from 'vitest';
import { validateState, type AppState } from '../../src/storage/schema';

const minimalState = (): AppState => ({
  schemaVersion: 2,
  createdAt: '2026-10-10',
  attempts: [{ startDate: '2026-10-10', slips: [] }],
  seenRewards: [],
  settings: { homescreenHintDismissed: false },
});

const fullState = (): AppState => ({
  schemaVersion: 2,
  createdAt: '2026-05-03',
  attempts: [
    { startDate: '2026-01-01', slips: [{ date: '2026-01-20' }] },
    {
      startDate: '2026-05-03',
      slips: [
        { date: '2026-06-01', trigger: 'alkohol' },
        { date: '2026-07-15', trigger: 'stress', note: 'Langer Tag im Büro' },
      ],
    },
  ],
  smoking: { cigarettesPerDay: 15, pricePerPack: 8.5, cigarettesPerPack: 20 },
  seenRewards: ['milestone-1', 'milestone-2'],
  settings: { homescreenHintDismissed: true },
});

const withChange = (change: (state: Record<string, unknown>) => void): unknown => {
  const state = structuredClone(fullState()) as unknown as Record<string, unknown>;
  change(state);
  return state;
};

const firstAttempt = (state: Record<string, unknown>) =>
  (state.attempts as Record<string, unknown>[])[0] as Record<string, unknown>;

const smoking = (state: Record<string, unknown>) => state.smoking as Record<string, unknown>;

describe('validateState', () => {
  it('accepts a minimal state', () => {
    expect(validateState(minimalState())).toEqual({ ok: true, state: minimalState() });
  });

  it('accepts a full state', () => {
    expect(validateState(fullState())).toEqual({ ok: true, state: fullState() });
  });

  it('returns a copy, not the input object', () => {
    const input = fullState();
    const result = validateState(input);

    expect(result.ok && result.state).not.toBe(input);
  });

  it.each([
    ['null', null],
    ['a string', 'state'],
    ['an array', []],
    ['a number', 1],
  ])('rejects %s', (_label, value) => {
    expect(validateState(value).ok).toBe(false);
  });

  it.each<[string, (state: Record<string, unknown>) => void]>([
    ['a wrong schema version', (s) => (s.schemaVersion = 3)],
    ['a missing schema version', (s) => delete s.schemaVersion],
    ['an unknown field', (s) => (s.extra = true)],
    ['an invalid createdAt', (s) => (s.createdAt = '2026-02-30')],
    ['a non-string createdAt', (s) => (s.createdAt = 20261010)],
    ['no attempts', (s) => (s.attempts = [])],
    ['attempts that are not a list', (s) => (s.attempts = {})],
    ['an attempt that is not an object', (s) => (s.attempts = ['2026-01-01'])],
    ['an invalid start date', (s) => (firstAttempt(s).startDate = 'gestern')],
    ['slips that are not a list', (s) => (firstAttempt(s).slips = null)],
    ['a start margin of 0', (s) => (firstAttempt(s).startUncertaintyDays = 0)],
    ['a fractional start margin', (s) => (firstAttempt(s).startUncertaintyDays = 2.5)],
    ['a start margin above a year', (s) => (firstAttempt(s).startUncertaintyDays = 366)],
    ['a start margin given as text', (s) => (firstAttempt(s).startUncertaintyDays = '5')],
    ['a slip without date', (s) => (firstAttempt(s).slips = [{}])],
    ['a slip with an invalid date', (s) => (firstAttempt(s).slips = [{ date: '2026-13-01' }])],
    [
      'an unknown trigger',
      (s) => (firstAttempt(s).slips = [{ date: '2026-01-02', trigger: 'wetter' }]),
    ],
    ['a non-string note', (s) => (firstAttempt(s).slips = [{ date: '2026-01-02', note: 5 }])],
    [
      'a note longer than 200 characters',
      (s) => (firstAttempt(s).slips = [{ date: '2026-01-02', note: 'x'.repeat(201) }]),
    ],
    [
      'an unknown slip field',
      (s) => (firstAttempt(s).slips = [{ date: '2026-01-02', mood: 'ok' }]),
    ],
    ['smoking that is not an object', (s) => (s.smoking = 15)],
    ['zero cigarettes per day', (s) => (smoking(s).cigarettesPerDay = 0)],
    ['a negative price', (s) => (smoking(s).pricePerPack = -1)],
    ['a non-finite price', (s) => (smoking(s).pricePerPack = Infinity)],
    ['a price given as text', (s) => (smoking(s).pricePerPack = '8,50')],
    ['a fractional pack size', (s) => (smoking(s).cigarettesPerPack = 19.5)],
    ['a missing pack size', (s) => delete smoking(s).cigarettesPerPack],
    ['seenRewards that are not a list', (s) => (s.seenRewards = 'milestone-1')],
    ['a non-string reward id', (s) => (s.seenRewards = [1])],
    ['missing settings', (s) => delete s.settings],
    ['a non-boolean hint flag', (s) => (s.settings = { homescreenHintDismissed: 'yes' })],
  ])('rejects %s', (_label, change) => {
    const result = validateState(withChange(change));

    expect(result.ok).toBe(false);
  });

  it('accepts a note of exactly 200 characters', () => {
    const state = withChange(
      (s) => (firstAttempt(s).slips = [{ date: '2026-01-02', note: 'x'.repeat(200) }]),
    );

    expect(validateState(state).ok).toBe(true);
  });

  it('accepts and keeps a start margin', () => {
    const result = validateState(withChange((s) => (firstAttempt(s).startUncertaintyDays = 5)));

    expect(result.ok && result.state.attempts[0]).toMatchObject({ startUncertaintyDays: 5 });
  });

  it('names the offending field', () => {
    const result = validateState(withChange((s) => (firstAttempt(s).startDate = 'gestern')));

    expect(result).toEqual({
      ok: false,
      error: 'state.attempts[0].startDate: expected a YYYY-MM-DD date',
    });
  });
});
