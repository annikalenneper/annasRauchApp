import ui from '../content/ui.json';
import { fillText } from '../core/rewards';
import { addSlip, currentAttempt, restart, smokeFreeDays } from '../core/slips';
import type { AppContext } from './context';
import { el } from './dom';
import { icon, type IconName } from './icons';
import { backLink } from './parts';

function choice(
  name: IconName,
  title: string,
  text: string,
  recommended: boolean,
  onclick: () => void,
): HTMLElement {
  return el(
    'button',
    { class: recommended ? 'choice choice--recommended' : 'choice', type: 'button', onclick },
    el('span', { class: 'choice__icon' }, icon(name)),
    el(
      'span',
      { class: 'stack-xs' },
      el('span', { class: 'choice__title' }, title),
      el('span', { class: 'choice__text' }, text),
    ),
  );
}

/** Anna decides herself: a slip keeps the attempt running, a restart begins a new one. */
export function renderSlip(ctx: AppContext): HTMLElement {
  const days = smokeFreeDays(currentAttempt(ctx.state), ctx.today);
  const options = el('div', { class: 'stack-m' });

  const reportSlip = () => {
    if (ctx.save(addSlip(ctx.state, ctx.today))) ctx.go('rueckmeldung');
  };
  const confirmRestart = () => {
    if (ctx.save(restart(ctx.state, ctx.today))) ctx.go('start');
  };

  const showChoices = () => {
    options.replaceChildren(
      choice('forward', ui.slip.slipTitle, ui.slip.slipText, true, reportSlip),
      choice(
        'restart',
        ui.slip.restartTitle,
        fillText(ui.slip.restartText, { tage: days }),
        false,
        showConfirm,
      ),
    );
  };
  const showConfirm = () => {
    const confirm = el(
      'button',
      { class: 'button button--ink', type: 'button', onclick: confirmRestart },
      ui.slip.restartConfirm,
    );
    options.replaceChildren(
      el(
        'section',
        { class: 'card stack-m' },
        el('h2', { class: 'h2' }, ui.slip.restartConfirmTitle),
        el('p', { class: 'lead' }, fillText(ui.slip.restartConfirmText, { tage: days })),
        confirm,
        el(
          'button',
          { class: 'button button--secondary', type: 'button', onclick: showChoices },
          ui.slip.restartCancel,
        ),
      ),
    );
    confirm.focus();
  };
  showChoices();

  return el(
    'main',
    { class: 'screen screen--roomy' },
    el('header', { class: 'topbar' }, backLink('start', ui.common.back)),
    el(
      'div',
      { class: 'stack-s' },
      el('h1', { class: 'h1' }, ui.slip.title),
      el('p', { class: 'lead' }, ui.slip.intro),
    ),
    options,
    el('div', { class: 'spacer' }),
    el('p', { class: 'hint' }, ui.slip.note),
  );
}
