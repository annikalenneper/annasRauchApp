import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AppState } from '../../src/storage/schema';
import {
  loadState,
  requestPersistence,
  saveState,
  STATE_KEY,
  STORAGE_PREFIX,
  type StorageLike,
} from '../../src/storage/store';

const state = (): AppState => ({
  schemaVersion: 2,
  createdAt: '2026-10-10',
  attempts: [{ startDate: '2026-10-10', slips: [{ date: '2026-10-12', trigger: 'stress' }] }],
  smoking: { cigarettesPerDay: 15, pricePerPack: 8.5, cigarettesPerPack: 20 },
  seenRewards: ['milestone-1'],
  settings: { homescreenHintDismissed: false },
});

function memoryStorage(initial: Record<string, string> = {}) {
  const items = new Map(Object.entries(initial));
  const storage: StorageLike = {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
  };
  return { storage, items };
}

const throwingStorage: StorageLike = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('storage key', () => {
  it('uses the rauchfrei:v1: prefix', () => {
    expect(STORAGE_PREFIX).toBe('rauchfrei:v1:');
    expect(STATE_KEY).toBe('rauchfrei:v1:state');
  });
});

describe('saveState and loadState', () => {
  it('round-trips a state', () => {
    const { storage } = memoryStorage();

    expect(saveState(state(), storage)).toEqual({ ok: true });
    expect(loadState(storage)).toEqual({ status: 'ok', state: state() });
  });

  it('writes only under the prefixed key', () => {
    const { storage, items } = memoryStorage();

    saveState(state(), storage);

    expect([...items.keys()]).toEqual(['rauchfrei:v1:state']);
  });

  it('uses localStorage by default', () => {
    const { storage, items } = memoryStorage();
    vi.stubGlobal('localStorage', storage);

    expect(saveState(state())).toEqual({ ok: true });
    expect(items.has(STATE_KEY)).toBe(true);
    expect(loadState()).toEqual({ status: 'ok', state: state() });
  });
});

describe('loadState', () => {
  it('reports empty storage', () => {
    expect(loadState(memoryStorage().storage)).toEqual({ status: 'empty' });
  });

  it('ignores keys of other apps on the same origin', () => {
    const { storage } = memoryStorage({ state: '{"other":"app"}' });

    expect(loadState(storage)).toEqual({ status: 'empty' });
  });

  it('upgrades data saved by the first app version', () => {
    const stored = JSON.stringify({ ...state(), schemaVersion: 1 });
    const { storage } = memoryStorage({ [STATE_KEY]: stored });

    expect(loadState(storage)).toEqual({ status: 'ok', state: state() });
  });

  it('reports broken JSON as corrupt instead of throwing', () => {
    const { storage } = memoryStorage({ [STATE_KEY]: '{"schemaVersion":1,' });

    expect(loadState(storage)).toEqual({ status: 'corrupt', reason: 'not valid JSON' });
  });

  it('reports data that cannot be migrated as corrupt', () => {
    const { storage } = memoryStorage({ [STATE_KEY]: '{"schemaVersion":99}' });

    expect(loadState(storage)).toEqual({ status: 'corrupt', reason: 'too-new' });
  });

  it('reports data that fails validation as corrupt', () => {
    const broken = { ...state(), attempts: [] };
    const { storage } = memoryStorage({ [STATE_KEY]: JSON.stringify(broken) });

    expect(loadState(storage)).toEqual({
      status: 'corrupt',
      reason: 'state.attempts: expected at least one attempt',
    });
  });

  it('leaves corrupt data untouched', () => {
    const { storage, items } = memoryStorage({ [STATE_KEY]: 'kaputt' });

    loadState(storage);

    expect(items.get(STATE_KEY)).toBe('kaputt');
  });

  it('reports blocked storage as unavailable', () => {
    expect(loadState(throwingStorage)).toEqual({ status: 'unavailable' });
  });
});

describe('saveState', () => {
  it('refuses to save an invalid state and keeps the old one', () => {
    const { storage, items } = memoryStorage();
    saveState(state(), storage);
    const before = items.get(STATE_KEY);

    const result = saveState({ ...state(), attempts: [] }, storage);

    expect(result).toEqual({ ok: false, reason: 'invalid' });
    expect(items.get(STATE_KEY)).toBe(before);
  });

  it('reports a failed write instead of throwing', () => {
    expect(saveState(state(), throwingStorage)).toEqual({ ok: false, reason: 'storage-failed' });
  });
});

describe('requestPersistence', () => {
  it('returns the answer of the browser', async () => {
    expect(await requestPersistence({ persist: async () => true })).toBe(true);
    expect(await requestPersistence({ persist: async () => false })).toBe(false);
  });

  it('returns false where the API is missing', async () => {
    expect(await requestPersistence(undefined)).toBe(false);
    expect(await requestPersistence({})).toBe(false);
  });

  it('returns false when the request fails', async () => {
    const persist = async () => {
      throw new Error('denied');
    };

    expect(await requestPersistence({ persist })).toBe(false);
  });
});
