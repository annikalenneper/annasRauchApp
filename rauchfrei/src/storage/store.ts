import { migrate } from './migrations';
import { validateState, type AppState } from './schema';

// All projects under <user>.github.io share one browser storage, so every key carries this prefix.
export const STORAGE_PREFIX = 'rauchfrei:v1:';
export const STATE_KEY = `${STORAGE_PREFIX}state`;

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export type LoadResult =
  | { status: 'empty' }
  | { status: 'ok'; state: AppState }
  | { status: 'corrupt'; reason: string }
  | { status: 'unavailable' };

export type SaveResult = { ok: true } | { ok: false; reason: 'invalid' | 'storage-failed' };

function parseStored(raw: string): LoadResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: 'corrupt', reason: 'not valid JSON' };
  }
  const migrated = migrate(parsed);
  if (!migrated.ok) return { status: 'corrupt', reason: migrated.reason };
  const validated = validateState(migrated.value);
  return validated.ok
    ? { status: 'ok', state: validated.state }
    : { status: 'corrupt', reason: validated.error };
}

/** Reads the saved state. Never throws and never changes what is stored. */
export function loadState(storage?: StorageLike): LoadResult {
  let raw: string | null;
  try {
    raw = (storage ?? localStorage).getItem(STATE_KEY);
  } catch {
    return { status: 'unavailable' };
  }
  return raw === null ? { status: 'empty' } : parseStored(raw);
}

/** Saves the state. An invalid state is refused, so what is stored stays loadable. */
export function saveState(state: AppState, storage?: StorageLike): SaveResult {
  const validated = validateState(state);
  if (!validated.ok) return { ok: false, reason: 'invalid' };
  try {
    (storage ?? localStorage).setItem(STATE_KEY, JSON.stringify(validated.state));
    return { ok: true };
  } catch {
    return { ok: false, reason: 'storage-failed' };
  }
}

/** Asks the browser not to evict our data. Resolves to false where that is not possible. */
export async function requestPersistence(
  manager: Partial<Pick<StorageManager, 'persist'>> | undefined,
): Promise<boolean> {
  if (!manager?.persist) return false;
  try {
    return await manager.persist();
  } catch {
    return false;
  }
}
