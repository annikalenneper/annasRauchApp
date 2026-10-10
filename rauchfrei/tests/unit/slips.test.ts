import { describe, expect, it } from 'vitest';
import {
  addSlip,
  attemptHistory,
  changeStartDate,
  createState,
  currentAttempt,
  daysSinceStart,
  describeLastSlip,
  hasFrequentSlips,
  isRepeatedTrigger,
  longestAttemptDays,
  restart,
  slipDayCount,
  smokeFreeDays,
} from '../../src/core/slips';
import { validateState, type Attempt } from '../../src/storage/schema';

const TODAY = '2026-10-10';
const attempt = (startDate: string, ...slipDates: string[]): Attempt => ({
  startDate,
  slips: slipDates.map((date) => ({ date })),
});

describe('createState', () => {
  it('creates a valid state without smoking details', () => {
    const state = createState('2026-05-01', TODAY);

    expect(validateState(state).ok).toBe(true);
    expect(state.smoking).toBeUndefined();
    expect(state.attempts).toEqual([{ startDate: '2026-05-01', slips: [] }]);
  });

  it('keeps how sure Anna is about the start, and leaves it out when exact', () => {
    const unsure = createState('2026-05-01', TODAY, undefined, 5);

    expect(unsure.attempts[0]).toEqual({
      startDate: '2026-05-01',
      startUncertaintyDays: 5,
      slips: [],
    });
    expect(validateState(unsure).ok).toBe(true);
    expect(createState('2026-05-01', TODAY, undefined, 0).attempts[0]).toEqual({
      startDate: '2026-05-01',
      slips: [],
    });
  });

  it('keeps the smoking details', () => {
    const smoking = { cigarettesPerDay: 15, pricePerPack: 8.9, cigarettesPerPack: 20 };

    expect(createState(TODAY, TODAY, smoking).smoking).toEqual(smoking);
  });
});

describe('counting days', () => {
  it('starts at 0 on the start day', () => {
    expect(smokeFreeDays(attempt(TODAY), TODAY)).toBe(0);
  });

  it('counts 1 on the day after the start', () => {
    expect(smokeFreeDays(attempt('2026-10-09'), TODAY)).toBe(1);
  });

  it('never goes below 0, even if the stored start lies in the future', () => {
    expect(daysSinceStart(attempt('2026-10-12'), TODAY)).toBe(0);
    expect(smokeFreeDays(attempt('2026-10-12'), TODAY)).toBe(0);
  });

  it('subtracts slip days: 160 of 162', () => {
    const withSlips = attempt('2026-05-01', '2026-06-10', '2026-08-02');

    expect(daysSinceStart(withSlips, TODAY)).toBe(162);
    expect(smokeFreeDays(withSlips, TODAY)).toBe(160);
  });

  it('counts several slips on the same day only once', () => {
    const withSlips = attempt('2026-05-01', '2026-06-10', '2026-06-10', '2026-06-10');

    expect(slipDayCount(withSlips, TODAY)).toBe(1);
    expect(smokeFreeDays(withSlips, TODAY)).toBe(161);
  });

  it('ignores slips outside the attempt', () => {
    const withSlips = attempt('2026-05-01', '2026-04-20', '2026-10-11');

    expect(slipDayCount(withSlips, TODAY)).toBe(0);
  });

  it('does not go below 0 after a slip on the start day', () => {
    expect(smokeFreeDays(attempt(TODAY, TODAY), TODAY)).toBe(0);
  });
});

describe('addSlip', () => {
  it('records the slip and keeps the attempt running', () => {
    const before = createState('2026-05-01', TODAY);
    const after = addSlip(before, TODAY);

    expect(after.attempts).toHaveLength(1);
    expect(currentAttempt(after).slips).toEqual([{ date: TODAY }]);
    expect(smokeFreeDays(currentAttempt(after), TODAY)).toBe(161);
  });

  it('does not change the given state', () => {
    const before = createState('2026-05-01', TODAY);
    addSlip(before, TODAY);

    expect(currentAttempt(before).slips).toEqual([]);
  });
});

describe('describeLastSlip', () => {
  it('adds trigger and note to the newest slip only', () => {
    const state = addSlip(addSlip(createState('2026-05-01', TODAY), '2026-06-01'), TODAY);

    const described = describeLastSlip(state, 'alkohol', 'Geburtstag');

    expect(currentAttempt(described).slips).toEqual([
      { date: '2026-06-01' },
      { date: TODAY, trigger: 'alkohol', note: 'Geburtstag' },
    ]);
    expect(validateState(described).ok).toBe(true);
  });

  it('leaves out an empty note', () => {
    const state = addSlip(createState('2026-05-01', TODAY), TODAY);

    expect(currentAttempt(describeLastSlip(state, 'stress', '')).slips).toEqual([
      { date: TODAY, trigger: 'stress' },
    ]);
  });

  it('does nothing without a slip', () => {
    const state = createState('2026-05-01', TODAY);

    expect(describeLastSlip(state, 'stress')).toBe(state);
  });
});

describe('restart', () => {
  const first = addSlip(createState('2026-05-01', '2026-05-01'), '2026-06-10');
  const restarted = restart(first, TODAY);

  it('begins a new attempt today with a count of 0', () => {
    expect(currentAttempt(restarted)).toEqual({ startDate: TODAY, slips: [] });
    expect(smokeFreeDays(currentAttempt(restarted), TODAY)).toBe(0);
  });

  it('keeps the earlier attempt in the history', () => {
    expect(attemptHistory(restarted, TODAY)).toEqual([
      { startDate: '2026-05-01', endDate: TODAY, smokeFreeDays: 161, isCurrent: false },
      { startDate: TODAY, endDate: TODAY, smokeFreeDays: 0, isCurrent: true },
    ]);
  });

  it('remembers the longest attempt', () => {
    expect(longestAttemptDays(restarted, '2026-10-20')).toBe(161);
    expect(longestAttemptDays(restarted, '2027-10-10')).toBe(365);
  });
});

describe('changeStartDate', () => {
  const state = createState('2026-05-01', TODAY);

  it('moves the start of the current attempt', () => {
    expect(currentAttempt(changeStartDate(state, '2026-04-01', TODAY)!).startDate).toBe(
      '2026-04-01',
    );
  });

  it('sets and removes the start margin and keeps the slips', () => {
    const withSlip = addSlip(state, '2026-06-01');
    const unsure = changeStartDate(withSlip, '2026-05-01', TODAY, 7)!;

    expect(currentAttempt(unsure)).toEqual({
      startDate: '2026-05-01',
      startUncertaintyDays: 7,
      slips: [{ date: '2026-06-01' }],
    });
    expect(currentAttempt(changeStartDate(unsure, '2026-05-01', TODAY)!)).toEqual({
      startDate: '2026-05-01',
      slips: [{ date: '2026-06-01' }],
    });
  });

  it('starts a new attempt without a margin', () => {
    const unsure = changeStartDate(state, '2026-05-01', TODAY, 7)!;

    expect(currentAttempt(restart(unsure, TODAY))).toEqual({ startDate: TODAY, slips: [] });
  });

  it('refuses a future or invalid date', () => {
    expect(changeStartDate(state, '2026-10-11', TODAY)).toBeNull();
    expect(changeStartDate(state, 'morgen', TODAY)).toBeNull();
  });
});

describe('hints', () => {
  const withTriggers = (...triggers: ('alkohol' | 'stress')[]) =>
    triggers.reduce(
      (state, trigger, index) => describeLastSlip(addSlip(state, `2026-0${index + 5}-15`), trigger),
      createState('2026-05-01', TODAY),
    );

  it('notices a trigger from its third time on', () => {
    expect(isRepeatedTrigger(withTriggers('alkohol', 'alkohol'), 'alkohol')).toBe(false);
    expect(isRepeatedTrigger(withTriggers('alkohol', 'stress', 'alkohol'), 'alkohol')).toBe(false);
    expect(isRepeatedTrigger(withTriggers('alkohol', 'alkohol', 'alkohol'), 'alkohol')).toBe(true);
  });

  it('counts triggers across attempts', () => {
    const state = describeLastSlip(
      addSlip(restart(withTriggers('alkohol', 'alkohol'), '2026-09-01'), '2026-09-05'),
      'alkohol',
    );

    expect(isRepeatedTrigger(state, 'alkohol')).toBe(true);
  });

  it('notices three slips within 14 days', () => {
    const slips = (...dates: string[]) =>
      dates.reduce((state, date) => addSlip(state, date), createState('2026-05-01', TODAY));

    expect(hasFrequentSlips(slips('2026-09-27', '2026-10-05', TODAY), TODAY)).toBe(true);
    expect(hasFrequentSlips(slips('2026-09-26', '2026-10-05', TODAY), TODAY)).toBe(false);
    expect(hasFrequentSlips(slips('2026-10-05', TODAY), TODAY)).toBe(false);
  });
});
