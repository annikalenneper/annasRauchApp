import { isIsoDate } from '../core/dates';

export const SCHEMA_VERSION = 1;
export const MAX_NOTE_LENGTH = 200;

export const TRIGGERS = [
  'stress',
  'alkohol',
  'gesellschaft',
  'langeweile',
  'gewohnheit',
  'sonstiges',
] as const;

export type Trigger = (typeof TRIGGERS)[number];

export interface Slip {
  date: string;
  trigger?: Trigger;
  note?: string;
}

export interface Attempt {
  startDate: string;
  slips: Slip[];
}

export interface SmokingInfo {
  cigarettesPerDay: number;
  pricePerPack: number;
  cigarettesPerPack: number;
}

export interface Settings {
  homescreenHintDismissed: boolean;
}

export interface AppState {
  schemaVersion: typeof SCHEMA_VERSION;
  createdAt: string;
  /** At least one; the last one is the current attempt. */
  attempts: Attempt[];
  smoking?: SmokingInfo;
  seenRewards: string[];
  settings: Settings;
}

export type ValidationResult = { ok: true; state: AppState } | { ok: false; error: string };

class InvalidStateError extends Error {}

function fail(path: string, expected: string): never {
  throw new InvalidStateError(`${path}: expected ${expected}`);
}

function asRecord(value: unknown, path: string, allowedKeys: string[]): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(path, 'an object');
  }
  const unknownKey = Object.keys(value).find((key) => !allowedKeys.includes(key));
  if (unknownKey !== undefined) fail(`${path}.${unknownKey}`, 'no such field');
  return value as Record<string, unknown>;
}

function asArray(value: unknown, path: string): unknown[] {
  return Array.isArray(value) ? value : fail(path, 'a list');
}

function asString(value: unknown, path: string): string {
  return typeof value === 'string' ? value : fail(path, 'a string');
}

function asDate(value: unknown, path: string): string {
  return typeof value === 'string' && isIsoDate(value) ? value : fail(path, 'a YYYY-MM-DD date');
}

function asPositiveNumber(value: unknown, path: string): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : fail(path, 'a number greater than 0');
}

function asTrigger(value: unknown, path: string): Trigger {
  const trigger = TRIGGERS.find((candidate) => candidate === value);
  return trigger ?? fail(path, `one of ${TRIGGERS.join(', ')}`);
}

function asNote(value: unknown, path: string): string {
  return typeof value === 'string' && value.length <= MAX_NOTE_LENGTH
    ? value
    : fail(path, `a string of at most ${MAX_NOTE_LENGTH} characters`);
}

function parseSlip(value: unknown, path: string): Slip {
  const record = asRecord(value, path, ['date', 'trigger', 'note']);
  const slip: Slip = { date: asDate(record.date, `${path}.date`) };
  if (record.trigger !== undefined) slip.trigger = asTrigger(record.trigger, `${path}.trigger`);
  if (record.note !== undefined) slip.note = asNote(record.note, `${path}.note`);
  return slip;
}

function parseAttempt(value: unknown, path: string): Attempt {
  const record = asRecord(value, path, ['startDate', 'slips']);
  return {
    startDate: asDate(record.startDate, `${path}.startDate`),
    slips: asArray(record.slips, `${path}.slips`).map((slip, index) =>
      parseSlip(slip, `${path}.slips[${index}]`),
    ),
  };
}

function parseSmoking(value: unknown, path: string): SmokingInfo {
  const record = asRecord(value, path, ['cigarettesPerDay', 'pricePerPack', 'cigarettesPerPack']);
  const cigarettesPerPack = asPositiveNumber(record.cigarettesPerPack, `${path}.cigarettesPerPack`);
  if (!Number.isInteger(cigarettesPerPack)) fail(`${path}.cigarettesPerPack`, 'a whole number');
  return {
    cigarettesPerDay: asPositiveNumber(record.cigarettesPerDay, `${path}.cigarettesPerDay`),
    pricePerPack: asPositiveNumber(record.pricePerPack, `${path}.pricePerPack`),
    cigarettesPerPack,
  };
}

function parseSettings(value: unknown, path: string): Settings {
  const record = asRecord(value, path, ['homescreenHintDismissed']);
  if (typeof record.homescreenHintDismissed !== 'boolean') {
    fail(`${path}.homescreenHintDismissed`, 'true or false');
  }
  return { homescreenHintDismissed: record.homescreenHintDismissed };
}

const STATE_KEYS = ['schemaVersion', 'createdAt', 'attempts', 'smoking', 'seenRewards', 'settings'];

function parseState(value: unknown): AppState {
  const record = asRecord(value, 'state', STATE_KEYS);
  if (record.schemaVersion !== SCHEMA_VERSION) fail('state.schemaVersion', `${SCHEMA_VERSION}`);
  const attempts = asArray(record.attempts, 'state.attempts').map((attempt, index) =>
    parseAttempt(attempt, `state.attempts[${index}]`),
  );
  if (attempts.length === 0) fail('state.attempts', 'at least one attempt');
  const state: AppState = {
    schemaVersion: SCHEMA_VERSION,
    createdAt: asDate(record.createdAt, 'state.createdAt'),
    attempts,
    seenRewards: asArray(record.seenRewards, 'state.seenRewards').map((id, index) =>
      asString(id, `state.seenRewards[${index}]`),
    ),
    settings: parseSettings(record.settings, 'state.settings'),
  };
  if (record.smoking !== undefined) state.smoking = parseSmoking(record.smoking, 'state.smoking');
  return state;
}

/** Strict check of unknown data. Returns a freshly built state, never the input itself. */
export function validateState(value: unknown): ValidationResult {
  try {
    return { ok: true, state: parseState(value) };
  } catch (error) {
    if (error instanceof InvalidStateError) return { ok: false, error: error.message };
    throw error;
  }
}
