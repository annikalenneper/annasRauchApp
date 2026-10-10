import { describe, expect, it } from 'vitest';
import {
  dailyTextIndex,
  dropRewardsAfter,
  dueRewards,
  fillText,
  isAnniversary,
  isMilestoneDay,
  milestoneProgress,
  parseRewardId,
  pickRewardsToShow,
  rewardId,
  scheduledRewards,
  surpriseDays,
  surpriseTextIndex,
} from '../../src/core/rewards';

const HEALTH_DAYS = [0, 1, 14, 30, 365];
const START = '2026-05-01';

describe('milestones', () => {
  it('fall on the planned days', () => {
    const days = Array.from({ length: 366 }, (_, day) => day).filter(isMilestoneDay);

    expect(days).toEqual([1, 2, 3, 5, 7, 10, 14, 21, 30, 50, 75, 100, 150, 200, 250, 300, 365]);
  });

  it('continue every 100 days and every year after the first year', () => {
    const days = Array.from({ length: 800 }, (_, day) => day).filter(
      (day) => day > 365 && isMilestoneDay(day),
    );

    expect(days).toEqual([400, 500, 600, 700, 730]);
    expect(isAnniversary(730)).toBe(true);
    expect(isAnniversary(700)).toBe(false);
  });

  it('show the way to the next one like in the design: 160 → 200', () => {
    expect(milestoneProgress(160)).toEqual({ next: 200, remaining: 40, fraction: 0.2 });
  });

  it('start from 0 before the first milestone', () => {
    expect(milestoneProgress(0)).toEqual({ next: 1, remaining: 1, fraction: 0 });
  });

  it('begin a new stretch on a milestone day', () => {
    expect(milestoneProgress(150)).toEqual({ next: 200, remaining: 50, fraction: 0 });
  });
});

describe('surpriseDays', () => {
  const days = surpriseDays(START, 400);

  it('are 2 to 4 days apart, a little more only around a milestone', () => {
    const gaps = days.map((day, index) => day - (days[index - 1] ?? 0));

    expect(Math.min(...gaps)).toBeGreaterThanOrEqual(2);
    expect(Math.max(...gaps)).toBeLessThanOrEqual(6);
  });

  it('never fall on a milestone day', () => {
    expect(days.filter(isMilestoneDay)).toEqual([]);
  });

  it('are the same for the same start date', () => {
    expect(surpriseDays(START, 400)).toEqual(days);
  });

  it('do not change when more days pass', () => {
    expect(surpriseDays(START, 100)).toEqual(days.filter((day) => day <= 100));
  });

  it('differ for another start date', () => {
    expect(surpriseDays('2026-05-02', 400)).not.toEqual(days);
  });
});

describe('scheduledRewards', () => {
  it('has nothing but the first health fact on day 0', () => {
    expect(scheduledRewards(START, 0, HEALTH_DAYS)).toEqual([{ kind: 'health', day: 0 }]);
  });

  it('contains all three kinds, oldest first', () => {
    const rewards = scheduledRewards(START, 30, HEALTH_DAYS);

    expect(rewards.filter((reward) => reward.kind === 'milestone').map((r) => r.day)).toEqual([
      1, 2, 3, 5, 7, 10, 14, 21, 30,
    ]);
    expect(rewards.filter((reward) => reward.kind === 'health').map((r) => r.day)).toEqual([
      0, 1, 14, 30,
    ]);
    expect(rewards.some((reward) => reward.kind === 'surprise')).toBe(true);
    expect(rewards.map((reward) => reward.day)).toEqual(
      [...rewards.map((reward) => reward.day)].sort((a, b) => a - b),
    );
  });
});

describe('dueRewards and pickRewardsToShow', () => {
  it('returns nothing twice once rewards are marked as seen', () => {
    const due = dueRewards(0, START, 150, HEALTH_DAYS, []);
    const seen = due.map((reward) => reward.id);

    expect(due.length).toBeGreaterThan(10);
    expect(dueRewards(0, START, 150, HEALTH_DAYS, seen)).toEqual([]);
  });

  it('only returns what is new on the next day', () => {
    const seen = dueRewards(0, START, 149, HEALTH_DAYS, []).map((reward) => reward.id);

    expect(dueRewards(0, START, 150, HEALTH_DAYS, seen)).toEqual([
      { id: '0:milestone:150', attemptIndex: 0, kind: 'milestone', day: 150 },
    ]);
  });

  it('treats a new attempt separately', () => {
    const seen = dueRewards(0, START, 5, HEALTH_DAYS, []).map((reward) => reward.id);

    expect(dueRewards(1, START, 1, HEALTH_DAYS, seen).map((reward) => reward.id)).toEqual([
      '1:health:0',
      '1:milestone:1',
      '1:health:1',
    ]);
  });

  it('shows at most three: the newest of each kind', () => {
    const shown = pickRewardsToShow(dueRewards(0, START, 150, HEALTH_DAYS, []));

    expect(shown.map((reward) => reward.kind)).toEqual(['milestone', 'health', 'surprise']);
    expect(shown[0]).toMatchObject({ day: 150 });
    expect(shown[1]).toMatchObject({ day: 30 });
  });

  it('shows nothing when nothing is due', () => {
    expect(pickRewardsToShow([])).toEqual([]);
  });
});

describe('reward ids', () => {
  it('round-trip', () => {
    const id = rewardId(2, { kind: 'surprise', day: 17 });

    expect(id).toBe('2:surprise:17');
    expect(parseRewardId(id)).toEqual({ id, attemptIndex: 2, kind: 'surprise', day: 17 });
  });

  it('reject unknown ids', () => {
    expect(parseRewardId('milestone-1')).toBeNull();
    expect(parseRewardId('0:party:3')).toBeNull();
  });

  it('can be dropped beyond a day for one attempt', () => {
    const seen = ['0:milestone:100', '1:milestone:5', '1:milestone:7', '1:health:14', 'alt'];

    expect(dropRewardsAfter(seen, 1, 5)).toEqual(['0:milestone:100', '1:milestone:5', 'alt']);
  });
});

describe('texts', () => {
  it('gives every surprise its own text until all were used', () => {
    const days = surpriseDays(START, 400).slice(0, 25);
    const indexes = days.map((day) => surpriseTextIndex(START, day, 25));

    expect(new Set(indexes).size).toBe(25);
    expect(surpriseTextIndex(START, days[3]!, 25)).toBe(indexes[3]);
  });

  it('picks one saying per calendar day', () => {
    expect(dailyTextIndex('2026-10-10', 25)).toBe(dailyTextIndex('2026-10-10', 25));
    expect(dailyTextIndex('2026-10-11', 25)).not.toBe(dailyTextIndex('2026-10-10', 25));
    expect(dailyTextIndex('2025-06-01', 25)).toBeLessThan(25);
  });

  it('fills placeholders and leaves unknown ones alone', () => {
    expect(fillText('{tage} Tage, {name}', { tage: 160 })).toBe('160 Tage, {name}');
  });
});
