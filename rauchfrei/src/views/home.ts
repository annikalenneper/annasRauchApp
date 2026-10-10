import milestones from '../content/milestones.json';
import sprueche from '../content/sprueche.json';
import ui from '../content/ui.json';
import { dailyTextIndex, fillText, milestoneProgress } from '../core/rewards';
import { calculateSavings, pickComparison } from '../core/savings';
import { currentAttempt, daysSinceStart, longestAttemptDays, smokeFreeDays } from '../core/slips';
import { href, type AppContext } from './context';
import { el } from './dom';
import { dayWord, formatDate, formatEuros, formatNumber } from './format';
import { icon } from './icons';
import { bottomNav, wordmark } from './parts';
import { isIos, isStandalone } from './platform';

function counterCard(ctx: AppContext, free: number, total: number): HTMLElement {
  const attempt = currentAttempt(ctx.state);
  const progress = milestoneProgress(free);
  const since =
    total === 0
      ? ui.home.sinceToday
      : fillText(ui.home.since, { datum: formatDate(attempt.startDate) });
  const remaining =
    progress.remaining === 1
      ? fillText(ui.home.remainingOne, { ziel: progress.next })
      : fillText(ui.home.remaining, { rest: progress.remaining, ziel: progress.next });
  const bar = el('div', { class: 'progress__fill' });
  bar.style.width = `${Math.round(progress.fraction * 100)}%`;

  return el(
    'section',
    { class: 'card card--hero' },
    el('p', { class: 'meta' }, since),
    el(
      'p',
      { class: 'counter' },
      el('span', { class: 'counter__number' }, formatNumber(free)),
      el(
        'span',
        { class: 'counter__side' },
        attempt.startUncertaintyDays !== undefined &&
          el(
            'span',
            { class: 'counter__margin' },
            fillText(ui.home.margin, { tage: attempt.startUncertaintyDays }),
          ),
        el('span', { class: 'counter__unit' }, dayWord(free)),
      ),
    ),
    free !== total &&
      el('p', { class: 'meta' }, fillText(ui.home.ofDays, { rauchfrei: free, gesamt: total })),
    el(
      'div',
      { class: 'progress-block' },
      el(
        'div',
        { class: 'progress-label' },
        el('span', {}, ui.home.nextMilestone),
        el('strong', {}, remaining),
      ),
      el('div', { class: 'progress' }, bar),
    ),
  );
}

function tile(value: string, label: string): HTMLElement {
  return el(
    'div',
    { class: 'card card--tile' },
    el('div', { class: 'figure' }, value),
    el('div', { class: 'note' }, label),
  );
}

function savingsBlock(ctx: AppContext, free: number): HTMLElement {
  const savings = calculateSavings(ctx.state.smoking, free);
  if (!savings) {
    return el('a', { class: 'text-link', href: href('einstellungen') }, ui.home.setupSavings);
  }
  const comparison = pickComparison(milestones.comparisons, savings.euros);
  return el(
    'section',
    { class: 'stack-s' },
    el(
      'div',
      { class: 'grid-2' },
      tile(formatEuros(savings.euros), ui.home.saved),
      tile(formatNumber(savings.cigarettes), ui.home.notSmoked),
    ),
    comparison && el('p', { class: 'note note--center' }, comparison.text),
  );
}

function homescreenHint(ctx: AppContext): HTMLElement | false {
  if (isStandalone() || ctx.state.settings.homescreenHintDismissed) return false;
  const dismiss = () => {
    ctx.save({ ...ctx.state, settings: { ...ctx.state.settings, homescreenHintDismissed: true } });
    ctx.go('start');
  };
  return el(
    'section',
    { class: 'hint hint--closable' },
    el(
      'div',
      { class: 'stack-xxs' },
      el('strong', {}, ui.homescreenHint.title),
      el('span', {}, ui.homescreenHint.why),
      el('span', {}, isIos() ? ui.homescreenHint.ios : ui.homescreenHint.android),
    ),
    el(
      'button',
      {
        class: 'icon-button',
        type: 'button',
        'aria-label': ui.homescreenHint.dismiss,
        onclick: dismiss,
      },
      icon('close'),
    ),
  );
}

export function renderHome(ctx: AppContext): HTMLElement {
  const attempt = currentAttempt(ctx.state);
  const free = smokeFreeDays(attempt, ctx.today);
  const spruch = sprueche[dailyTextIndex(ctx.today, sprueche.length)];

  return el(
    'main',
    { class: 'screen' },
    el(
      'header',
      { class: 'topbar topbar--spread' },
      wordmark(),
      el(
        'a',
        { class: 'icon-button', href: href('einstellungen'), 'aria-label': ui.home.settings },
        icon('settings'),
      ),
    ),
    counterCard(ctx, free, daysSinceStart(attempt, ctx.today)),
    savingsBlock(ctx, free),
    el(
      'section',
      { class: 'card card--ink stack-s' },
      el('div', { class: 'overline' }, ui.home.todayForYou),
      el('p', { class: 'quote' }, spruch),
    ),
    homescreenHint(ctx),
    ctx.state.attempts.length > 1 &&
      el(
        'p',
        { class: 'note note--center' },
        fillText(ui.home.longest, { tage: longestAttemptDays(ctx.state, ctx.today) }),
      ),
    el('div', { class: 'spacer' }),
    el(
      'div',
      { class: 'stack-s' },
      el('a', { class: 'button button--secondary', href: href('ausrutscher') }, ui.home.reportSlip),
      bottomNav('start'),
    ),
  );
}
