import { daysBetween } from './dates';

export type RewardKind = 'milestone' | 'surprise' | 'health';

/** `day` is the number of smoke-free days at which the reward is earned. */
export interface Reward {
  kind: RewardKind;
  day: number;
}

export interface EarnedReward extends Reward {
  id: string;
  attemptIndex: number;
}

export const MAX_REWARDS_AT_ONCE = 3;

const FIXED_MILESTONES = [1, 2, 3, 5, 7, 10, 14, 21, 30, 50, 75, 100, 150, 200, 250, 300, 365];
const LAST_FIXED_MILESTONE = 365;
const KINDS: RewardKind[] = ['milestone', 'health', 'surprise'];

/** After the first year: every 100 days and every further year (counted as 365 days). */
export function isMilestoneDay(day: number): boolean {
  if (day <= LAST_FIXED_MILESTONE) return FIXED_MILESTONES.includes(day);
  return day % 100 === 0 || day % 365 === 0;
}

export function isAnniversary(day: number): boolean {
  return day > 0 && day % 365 === 0;
}

export function nextMilestone(day: number): number {
  let next = day + 1;
  while (!isMilestoneDay(next)) next++;
  return next;
}

export function previousMilestone(day: number): number {
  let previous = day;
  while (previous > 0 && !isMilestoneDay(previous)) previous--;
  return previous;
}

export interface MilestoneProgress {
  next: number;
  remaining: number;
  /** 0 to 1: how far the way from the last milestone to the next one is done. */
  fraction: number;
}

export function milestoneProgress(day: number): MilestoneProgress {
  const previous = previousMilestone(day);
  const next = nextMilestone(day);
  return { next, remaining: next - day, fraction: (day - previous) / (next - previous) };
}

function hash(text: string): number {
  let value = 2166136261;
  for (let index = 0; index < text.length; index++) {
    value = Math.imul(value ^ text.charCodeAt(index), 16777619);
  }
  return value >>> 0;
}

/** Small seeded generator (mulberry32): the same seed always yields the same sequence. */
function createRandom(seed: string): () => number {
  let state = hash(seed);
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Surprise days up to `upToDay`: 2 to 4 days apart, never on a milestone day. They depend only on
 * the start date, so opening the app more often cannot produce extra surprises.
 */
export function surpriseDays(startDate: string, upToDay: number): number[] {
  const random = createRandom(startDate);
  const days: number[] = [];
  let day = 0;
  for (;;) {
    day += 2 + Math.floor(random() * 3);
    while (isMilestoneDay(day)) day++;
    if (day > upToDay) return days;
    days.push(day);
  }
}

function milestoneDays(upToDay: number): number[] {
  const days: number[] = [];
  for (let day = 1; day <= upToDay; day++) if (isMilestoneDay(day)) days.push(day);
  return days;
}

/** All rewards earned up to and including the given smoke-free day, oldest first. */
export function scheduledRewards(
  startDate: string,
  upToDay: number,
  healthDays: number[],
): Reward[] {
  const of = (kind: RewardKind, days: number[]) => days.map((day) => ({ kind, day }));
  return [
    ...of('milestone', milestoneDays(upToDay)),
    ...of(
      'health',
      healthDays.filter((day) => day <= upToDay),
    ),
    ...of('surprise', surpriseDays(startDate, upToDay)),
  ].sort((a, b) => a.day - b.day || KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind));
}

export function rewardId(attemptIndex: number, reward: Reward): string {
  return `${attemptIndex}:${reward.kind}:${reward.day}`;
}

export function parseRewardId(id: string): EarnedReward | null {
  const match = /^(\d+):(milestone|surprise|health):(\d+)$/.exec(id);
  if (!match) return null;
  return {
    id,
    attemptIndex: Number(match[1]),
    kind: match[2] as RewardKind,
    day: Number(match[3]),
  };
}

/** Earned rewards of an attempt that have not been seen yet, oldest first. */
export function dueRewards(
  attemptIndex: number,
  startDate: string,
  day: number,
  healthDays: number[],
  seenRewards: string[],
): EarnedReward[] {
  const seen = new Set(seenRewards);
  return scheduledRewards(startDate, day, healthDays)
    .map((reward) => ({ ...reward, attemptIndex, id: rewardId(attemptIndex, reward) }))
    .filter((reward) => !seen.has(reward.id));
}

/** At most three to show right now: the newest of each kind. The rest goes straight to the box. */
export function pickRewardsToShow(due: EarnedReward[]): EarnedReward[] {
  const newestOf = (kind: RewardKind) => due.filter((reward) => reward.kind === kind).at(-1);
  return KINDS.map(newestOf)
    .filter((reward) => reward !== undefined)
    .slice(0, MAX_REWARDS_AT_ONCE);
}

/** Drops rewards of one attempt that lie beyond the given day, e.g. after the start date moved. */
export function dropRewardsAfter(
  seenRewards: string[],
  attemptIndex: number,
  day: number,
): string[] {
  return seenRewards.filter((id) => {
    const reward = parseRewardId(id);
    return !reward || reward.attemptIndex !== attemptIndex || reward.day <= day;
  });
}

/** Which of `count` texts belongs to a surprise day. Texts repeat only after all were used. */
export function surpriseTextIndex(startDate: string, day: number, count: number): number {
  const random = createRandom(`${startDate}:texts`);
  const order = Array.from({ length: count }, (_, index) => index);
  for (let index = count - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [order[index], order[other]] = [order[other] as number, order[index] as number];
  }
  const position = Math.max(0, surpriseDays(startDate, day).indexOf(day));
  return order[position % count] as number;
}

/** Which of `count` texts is today's saying on the home screen. Changes once per calendar day. */
export function dailyTextIndex(today: string, count: number): number {
  return Math.abs(daysBetween('2026-01-01', today)) % count;
}

/** Replaces placeholders such as {tage} in a text. */
export function fillText(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
    key in values ? String(values[key]) : placeholder,
  );
}
