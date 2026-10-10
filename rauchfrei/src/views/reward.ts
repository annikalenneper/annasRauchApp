import ui from '../content/ui.json';
import { fillText, type EarnedReward } from '../core/rewards';
import { calculateSavings } from '../core/savings';
import type { AppContext } from './context';
import { el, svg } from './dom';
import { formatEuros, formatNumber } from './format';
import { icon } from './icons';
import { describeReward } from './reward-text';

function confetti(): SVGSVGElement {
  const line = { 'stroke-width': 4, 'stroke-linecap': 'round' };
  return svg({ class: 'confetti', viewBox: '0 0 390 300', preserveAspectRatio: 'xMidYMin slice' }, [
    ['circle', { class: 'fill-accent', cx: 40, cy: 60, r: 7 }],
    ['circle', { class: 'fill-ink', cx: 340, cy: 90, r: 10 }],
    ['circle', { class: 'fill-muted', cx: 300, cy: 30, r: 5 }],
    ['path', { class: 'stroke-ink', d: 'M80 120l14-10', ...line }],
    ['path', { class: 'stroke-accent', d: 'M320 180l12 12', ...line }],
    ['path', { class: 'stroke-muted', d: 'M30 210l10 14', ...line }],
    [
      'rect',
      {
        class: 'fill-celebrate',
        x: 250,
        y: 130,
        width: 12,
        height: 12,
        rx: 2,
        transform: 'rotate(20 256 136)',
      },
    ],
    [
      'rect',
      {
        class: 'fill-ink',
        x: 120,
        y: 40,
        width: 10,
        height: 10,
        rx: 2,
        transform: 'rotate(-15 125 45)',
      },
    ],
  ]);
}

function savingsNote(ctx: AppContext, reward: EarnedReward): HTMLElement | false {
  const savings = calculateSavings(ctx.state.smoking, reward.day);
  if (reward.kind !== 'milestone' || !savings || savings.euros < 1) return false;
  return el(
    'div',
    { class: 'card card--tile card--row' },
    icon('heart', 28),
    el('span', {}, fillText(ui.reward.savedSoFar, { euro: formatEuros(savings.euros) })),
  );
}

/** Full-screen celebration for one reward. */
export function renderReward(
  ctx: AppContext,
  reward: EarnedReward,
  startDate: string,
  onContinue: () => void,
): HTMLElement {
  const text = describeReward(reward, startDate);
  const isMilestone = reward.kind === 'milestone';
  const button = el(
    'button',
    { class: 'button button--ink', type: 'button', onclick: onContinue },
    ui.reward.continue,
  );

  const screen = el(
    'main',
    { class: 'screen screen--roomy screen--celebrate' },
    isMilestone && confetti(),
    el('p', { class: 'overline overline--strong' }, text.overline),
    isMilestone
      ? el(
          'h1',
          { class: 'milestone' },
          el('span', { class: 'milestone__number' }, formatNumber(reward.day)),
          el(
            'span',
            { class: 'milestone__unit' },
            reward.day === 1 ? ui.reward.daySmokeFree : ui.reward.daysSmokeFree,
          ),
        )
      : el('h1', { class: 'h1 h1--large' }, text.title),
    el('p', { class: 'quote quote--large' }, text.text),
    text.source &&
      el(
        'a',
        { class: 'text-link', href: text.source.url, target: '_blank', rel: 'noopener noreferrer' },
        text.source.label,
      ),
    savingsNote(ctx, reward),
    el('div', { class: 'spacer' }),
    el(
      'div',
      { class: 'stack-s' },
      button,
      el('p', { class: 'note note--center' }, ui.reward.kept),
    ),
  );
  queueMicrotask(() => button.focus());
  return screen;
}
