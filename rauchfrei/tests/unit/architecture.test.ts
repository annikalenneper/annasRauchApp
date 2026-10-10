import { describe, expect, it } from 'vitest';

type Rule = { name: string; pattern: RegExp };

const allSources = import.meta.glob<string>('../../src/**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const sourcesIn = (folder: string) =>
  Object.fromEntries(Object.entries(allSources).filter(([file]) => file.includes(folder)));

const sourcesOutside = (folder: string) =>
  Object.fromEntries(Object.entries(allSources).filter(([file]) => !file.includes(folder)));

const storageAccess: Rule = {
  name: 'storage',
  pattern: /\b(localStorage|sessionStorage|indexedDB)\b/,
};

// src/core/ must stay pure logic: no DOM, no storage, no reading the current time.
const coreRules: Rule[] = [
  { name: 'DOM', pattern: /\b(document|window|navigator|HTMLElement)\b/ },
  storageAccess,
  { name: 'current time', pattern: /\bDate\.now\b|\bnew Date\(\s*\)/ },
];

function findViolations(sources: Record<string, string>, rules: Rule[]): string[] {
  return Object.entries(sources).flatMap(([file, source]) =>
    rules.filter(({ pattern }) => pattern.test(source)).map(({ name }) => `${file}: uses ${name}`),
  );
}

describe('architecture', () => {
  it('finds the source files', () => {
    expect(Object.keys(sourcesIn('/src/core/'))).not.toEqual([]);
    expect(Object.keys(sourcesIn('/src/storage/'))).not.toEqual([]);
  });

  it('keeps src/core free of DOM, storage and current-time access', () => {
    expect(findViolations(sourcesIn('/src/core/'), coreRules)).toEqual([]);
  });

  it('lets only src/storage touch browser storage', () => {
    expect(findViolations(sourcesOutside('/src/storage/'), [storageAccess])).toEqual([]);
  });

  it('detects forbidden access', () => {
    const violations = findViolations(
      {
        'dom.ts': 'document.title',
        'storage.ts': 'localStorage.getItem("x")',
        'time.ts': 'const now = new Date();',
        'clean.ts': 'export const parse = (iso: string) => new Date(iso);',
      },
      coreRules,
    );

    expect(violations).toEqual([
      'dom.ts: uses DOM',
      'storage.ts: uses storage',
      'time.ts: uses current time',
    ]);
  });
});
