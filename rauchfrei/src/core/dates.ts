const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/** True for a real calendar date written as YYYY-MM-DD. */
export function isIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);
}

// Calendar dates are counted on a UTC day line, so time zones and daylight saving cannot shift them.
function toDayNumber(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number) as [number, number, number];
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

/** Whole calendar days from one date to another; negative if `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  return toDayNumber(to) - toDayNumber(from);
}

export function addDays(isoDate: string, days: number): string {
  return new Date((toDayNumber(isoDate) + days) * MS_PER_DAY).toISOString().slice(0, 10);
}

/** The calendar date a clock shows locally. Callers outside core pass the current moment. */
export function toLocalIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${String(date.getFullYear()).padStart(4, '0')}-${month}-${day}`;
}

export type StartDateCheck = 'ok' | 'invalid' | 'future';

/** A quit date must be a real date and must not lie in the future. */
export function checkStartDate(startDate: string, today: string): StartDateCheck {
  if (!isIsoDate(startDate)) return 'invalid';
  return daysBetween(startDate, today) < 0 ? 'future' : 'ok';
}
