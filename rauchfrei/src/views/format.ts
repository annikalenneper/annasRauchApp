import ui from '../content/ui.json';

const dateFormat = new Intl.DateTimeFormat('de-DE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const euroFormat = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

/** "2026-05-01" → "1. Mai 2026" */
export function formatDate(isoDate: string): string {
  return dateFormat.format(new Date(`${isoDate}T00:00:00Z`));
}

export function formatNumber(value: number): string {
  return value.toLocaleString('de-DE');
}

export function formatEuros(value: number): string {
  return euroFormat.format(value);
}

export function dayWord(count: number): string {
  return count === 1 ? ui.common.day : ui.common.days;
}
