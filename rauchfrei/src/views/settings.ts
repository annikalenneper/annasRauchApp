import ui from '../content/ui.json';
import { dropRewardsAfter, fillText } from '../core/rewards';
import {
  attemptHistory,
  changeStartDate,
  currentAttempt,
  currentAttemptIndex,
  smokeFreeDays,
} from '../core/slips';
import type { AppState, SmokingInfo } from '../storage/schema';
import type { AppContext } from './context';
import { el } from './dom';
import { formatDate } from './format';
import { backLink, errorText, showError, smokingFields, startDateField } from './parts';

function applySettings(
  ctx: AppContext,
  start: { startDate: string; uncertaintyDays?: number },
  smoking: SmokingInfo | undefined,
): AppState | null {
  const moved = changeStartDate(ctx.state, start.startDate, ctx.today, start.uncertaintyDays);
  if (!moved) return null;
  const days = smokeFreeDays(currentAttempt(moved), ctx.today);
  const next: AppState = {
    ...moved,
    seenRewards: dropRewardsAfter(moved.seenRewards, currentAttemptIndex(moved), days),
  };
  delete next.smoking;
  if (smoking) next.smoking = smoking;
  return next;
}

function history(ctx: AppContext): HTMLElement | false {
  const attempts = attemptHistory(ctx.state, ctx.today);
  if (attempts.length < 2) return false;
  const line = (attempt: (typeof attempts)[number]) =>
    fillText(attempt.isCurrent ? ui.settings.historyCurrent : ui.settings.historyPast, {
      von: formatDate(attempt.startDate),
      bis: formatDate(attempt.endDate),
      tage: attempt.smokeFreeDays,
    });
  return el(
    'section',
    { class: 'card stack-s' },
    el('h2', { class: 'label' }, ui.settings.historyTitle),
    el('ul', { class: 'list stack-xs' }, ...attempts.reverse().map((a) => el('li', {}, line(a)))),
  );
}

/** Correct the start date and the smoking details; shows earlier attempts. */
export function renderSettings(ctx: AppContext): HTMLElement {
  const attempt = currentAttempt(ctx.state);
  const date = startDateField(
    attempt.startDate,
    ctx.today,
    ui.settings.startTitle,
    attempt.startUncertaintyDays,
  );
  const smoking = smokingFields(ctx.state.smoking);
  const error = errorText();

  const submit = (event: Event) => {
    event.preventDefault();
    const chosen = date.read();
    const details = smoking.read();
    if (!chosen.ok) return showError(error, chosen.error);
    if (!details.ok) return showError(error, details.error);
    const next = applySettings(ctx, chosen, details.smoking);
    if (next && ctx.save(next)) return ctx.go('start');
    showError(error, ui.form.errorSave);
  };

  return el(
    'form',
    { class: 'screen screen--roomy', novalidate: true, onsubmit: submit },
    el(
      'header',
      { class: 'topbar' },
      backLink('start', ui.common.back),
      el('h1', { class: 'h1 h1--small' }, ui.settings.title),
    ),
    date.node,
    smoking.node,
    error,
    el('button', { class: 'button button--primary', type: 'submit' }, ui.settings.save),
    history(ctx),
  );
}
