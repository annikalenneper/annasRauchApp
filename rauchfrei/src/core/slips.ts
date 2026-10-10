import {
  SCHEMA_VERSION,
  type AppState,
  type Attempt,
  type Slip,
  type SmokingInfo,
  type Trigger,
} from '../storage/schema';
import { addDays, checkStartDate, daysBetween } from './dates';

export const REPEATED_TRIGGER_THRESHOLD = 3;
export const FREQUENT_SLIP_THRESHOLD = 3;
export const FREQUENT_SLIP_WINDOW_DAYS = 14;

function newAttempt(
  startDate: string,
  uncertaintyDays: number | undefined,
  slips: Slip[],
): Attempt {
  const attempt: Attempt = { startDate, slips };
  if (uncertaintyDays) attempt.startUncertaintyDays = uncertaintyDays;
  return attempt;
}

export function createState(
  startDate: string,
  today: string,
  smoking?: SmokingInfo,
  uncertaintyDays?: number,
): AppState {
  const state: AppState = {
    schemaVersion: SCHEMA_VERSION,
    createdAt: today,
    attempts: [newAttempt(startDate, uncertaintyDays, [])],
    seenRewards: [],
    settings: { homescreenHintDismissed: false },
  };
  if (smoking) state.smoking = smoking;
  return state;
}

export function currentAttempt(state: AppState): Attempt {
  return state.attempts[state.attempts.length - 1] as Attempt;
}

export function currentAttemptIndex(state: AppState): number {
  return state.attempts.length - 1;
}

/** Calendar days since the attempt began. The start day itself is day 0. */
export function daysSinceStart(attempt: Attempt, today: string): number {
  return Math.max(0, daysBetween(attempt.startDate, today));
}

/** Number of different days with a slip between start and today. */
export function slipDayCount(attempt: Attempt, today: string): number {
  const days = attempt.slips
    .map((slip) => slip.date)
    .filter((date) => daysBetween(attempt.startDate, date) >= 0 && daysBetween(date, today) >= 0);
  return new Set(days).size;
}

export function smokeFreeDays(attempt: Attempt, today: string): number {
  return Math.max(0, daysSinceStart(attempt, today) - slipDayCount(attempt, today));
}

function replaceCurrentAttempt(state: AppState, attempt: Attempt): AppState {
  return { ...state, attempts: [...state.attempts.slice(0, -1), attempt] };
}

/** Records a slip. The attempt keeps running. */
export function addSlip(state: AppState, date: string): AppState {
  const attempt = currentAttempt(state);
  return replaceCurrentAttempt(state, { ...attempt, slips: [...attempt.slips, { date }] });
}

/** Adds trigger and note to the most recent slip of the current attempt. */
export function describeLastSlip(state: AppState, trigger?: Trigger, note?: string): AppState {
  const attempt = currentAttempt(state);
  const last = attempt.slips[attempt.slips.length - 1];
  if (!last) return state;
  const described: Slip = { date: last.date };
  if (trigger) described.trigger = trigger;
  if (note) described.note = note;
  return replaceCurrentAttempt(state, {
    ...attempt,
    slips: [...attempt.slips.slice(0, -1), described],
  });
}

/** Begins a new attempt. Earlier attempts stay in the history. */
export function restart(state: AppState, today: string): AppState {
  return { ...state, attempts: [...state.attempts, { startDate: today, slips: [] }] };
}

/**
 * Corrects the start of the current attempt and how sure Anna is about it.
 * Returns null for an invalid or future date.
 */
export function changeStartDate(
  state: AppState,
  startDate: string,
  today: string,
  uncertaintyDays?: number,
): AppState | null {
  if (checkStartDate(startDate, today) !== 'ok') return null;
  const slips = currentAttempt(state).slips;
  return replaceCurrentAttempt(state, newAttempt(startDate, uncertaintyDays, slips));
}

export interface AttemptSummary {
  startDate: string;
  endDate: string;
  smokeFreeDays: number;
  isCurrent: boolean;
}

/** Every attempt with its length. A past attempt ends on the day the next one began. */
export function attemptHistory(state: AppState, today: string): AttemptSummary[] {
  return state.attempts.map((attempt, index) => {
    const next = state.attempts[index + 1];
    const endDate = next ? next.startDate : today;
    return {
      startDate: attempt.startDate,
      endDate,
      smokeFreeDays: smokeFreeDays(attempt, endDate),
      isCurrent: !next,
    };
  });
}

export function longestAttemptDays(state: AppState, today: string): number {
  return Math.max(...attemptHistory(state, today).map((attempt) => attempt.smokeFreeDays));
}

function allSlips(state: AppState): Slip[] {
  return state.attempts.flatMap((attempt) => attempt.slips);
}

/** True once the same trigger has been recorded three times or more. */
export function isRepeatedTrigger(state: AppState, trigger: Trigger): boolean {
  const count = allSlips(state).filter((slip) => slip.trigger === trigger).length;
  return count >= REPEATED_TRIGGER_THRESHOLD;
}

/** True once three or more slips fall into the last 14 days, today included. */
export function hasFrequentSlips(state: AppState, today: string): boolean {
  const windowStart = addDays(today, -(FREQUENT_SLIP_WINDOW_DAYS - 1));
  const recent = allSlips(state).filter(
    (slip) => daysBetween(windowStart, slip.date) >= 0 && daysBetween(slip.date, today) >= 0,
  );
  return recent.length >= FREQUENT_SLIP_THRESHOLD;
}
