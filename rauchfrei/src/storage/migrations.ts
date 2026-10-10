import { SCHEMA_VERSION } from './schema';

export type Migration = (state: Record<string, unknown>) => Record<string, unknown>;

/** Keyed by the version a step upgrades from: `migrations[1]` turns v1 data into v2 data. */
export const migrations: Readonly<Record<number, Migration>> = {
  // v2 added the optional `startUncertaintyDays` of an attempt. Existing data needs no change.
  1: (state) => state,
};

export type MigrationResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; reason: 'not-an-object' | 'no-version' | 'too-new' | 'missing-migration' };

/** Upgrades stored data step by step to the target version. The result still needs validation. */
export function migrate(
  raw: unknown,
  steps: Readonly<Record<number, Migration>> = migrations,
  targetVersion: number = SCHEMA_VERSION,
): MigrationResult {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { ok: false, reason: 'not-an-object' };
  }
  let value = raw as Record<string, unknown>;
  const storedVersion = value.schemaVersion;
  if (typeof storedVersion !== 'number' || !Number.isInteger(storedVersion) || storedVersion < 1) {
    return { ok: false, reason: 'no-version' };
  }
  if (storedVersion > targetVersion) return { ok: false, reason: 'too-new' };

  for (let version = storedVersion; version < targetVersion; version++) {
    const step = steps[version];
    if (!step) return { ok: false, reason: 'missing-migration' };
    value = { ...step(value), schemaVersion: version + 1 };
  }
  return { ok: true, value };
}
