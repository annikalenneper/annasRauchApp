import ui from '../content/ui.json';
import { parseRewardId, type EarnedReward } from '../core/rewards';
import { currentAttemptIndex } from '../core/slips';
import type { AppContext } from './context';
import { el } from './dom';
import { bottomNav } from './parts';
import { describeReward } from './reward-text';

function newestFirst(a: EarnedReward, b: EarnedReward): number {
  return b.attemptIndex - a.attemptIndex || b.day - a.day;
}

function rewardCard(ctx: AppContext, reward: EarnedReward): HTMLElement {
  const startDate = ctx.state.attempts[reward.attemptIndex]?.startDate ?? '';
  const text = describeReward(reward, startDate);
  const earlier = reward.attemptIndex !== currentAttemptIndex(ctx.state);
  return el(
    'li',
    { class: `card card--tile stack-xs treasure--${reward.kind}` },
    el('div', { class: 'overline' }, text.label),
    el('p', { class: 'quote' }, text.text),
    text.source &&
      el(
        'a',
        { class: 'text-link', href: text.source.url, target: '_blank', rel: 'noopener noreferrer' },
        text.source.label,
      ),
    earlier && el('div', { class: 'note' }, ui.treasure.earlierAttempt),
  );
}

/** Everything Anna has earned so far, newest first. */
export function renderTreasure(ctx: AppContext): HTMLElement {
  const rewards = ctx.state.seenRewards
    .map(parseRewardId)
    .filter((reward) => reward !== null)
    .sort(newestFirst);

  return el(
    'main',
    { class: 'screen' },
    el(
      'header',
      { class: 'stack-xs intro' },
      el('h1', { class: 'h1' }, ui.treasure.title),
      el('p', { class: 'lead' }, rewards.length ? ui.treasure.intro : ui.treasure.empty),
    ),
    el('ul', { class: 'list stack-s' }, ...rewards.map((reward) => rewardCard(ctx, reward))),
    el('div', { class: 'spacer' }),
    bottomNav('schatz'),
  );
}
