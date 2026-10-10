import { describe, expect, it } from 'vitest';

// src/core/ must stay pure logic: no DOM, no storage, no reading the current time.
const coreSources = import.meta.glob<string>('../../src/core/**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const forbidden = [
  { name: 'DOM', pattern: /\b(document|window|navigator|HTMLElement)\b/ },
  { name: 'storage', pattern: /\b(localStorage|sessionStorage|indexedDB)\b/ },
  { name: 'current time', pattern: /\bDate\.now\b|\bnew Date\(\s*\)/ },
];

export function findViolations(sources: Record<string, string>): string[] {
  return Object.entries(sources).flatMap(([file, source]) =>
    forbidden
      .filter(({ pattern }) => pattern.test(source))
      .map(({ name }) => `${file}: uses ${name}`),
  );
}

describe('architecture', () => {
  it('keeps src/core free of DOM, storage and current-time access', () => {
    expect(findViolations(coreSources)).toEqual([]);
  });

  it('detects forbidden access', () => {
    const violations = findViolations({
      'dom.ts': 'document.title',
      'storage.ts': 'localStorage.getItem("x")',
      'time.ts': 'const now = new Date();',
      'clean.ts': 'export const parse = (iso: string) => new Date(iso);',
    });

    expect(violations).toEqual([
      'dom.ts: uses DOM',
      'storage.ts: uses storage',
      'time.ts: uses current time',
    ]);
  });
});
