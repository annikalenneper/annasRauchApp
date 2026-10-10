import content from '../content/slip-responses.json';
import ui from '../content/ui.json';
import { fillText } from '../core/rewards';
import {
  currentAttempt,
  describeLastSlip,
  hasFrequentSlips,
  isRepeatedTrigger,
  smokeFreeDays,
} from '../core/slips';
import { MAX_NOTE_LENGTH, TRIGGERS, type AppState, type Trigger } from '../storage/schema';
import { href, type AppContext } from './context';
import { el, svg } from './dom';

function pickResponse(state: AppState, days: number) {
  if (days < 2) return content.early;
  const slipCount = state.attempts.reduce((sum, attempt) => sum + attempt.slips.length, 0);
  return content.responses[(slipCount - 1) % content.responses.length] ?? content.early;
}

function waves(): SVGSVGElement {
  const wave = (y: number) => `M4 ${y}c10-10 20-10 30 0s20 10 30 0 20-10 28-4`;
  return svg(
    {
      class: 'waves',
      width: 96,
      height: 56,
      viewBox: '0 0 96 56',
      stroke: 'currentColor',
      'stroke-width': 3,
      'stroke-linecap': 'round',
    },
    [
      ['path', { d: wave(20) }],
      ['path', { d: wave(40) }],
    ],
  );
}

/** Calm screen after a slip: encouragement first, then the optional trigger. */
export function renderResponse(ctx: AppContext): HTMLElement {
  const days = smokeFreeDays(currentAttempt(ctx.state), ctx.today);
  const response = pickResponse(ctx.state, days);
  let selected: Trigger | undefined;

  const hint = el('p', { class: 'hint', hidden: true });
  const note = el('input', {
    id: 'note',
    class: 'field',
    type: 'text',
    maxlength: MAX_NOTE_LENGTH,
    autocomplete: 'off',
  });
  const chips = TRIGGERS.map((trigger) => {
    const chip = el(
      'button',
      { class: 'chip', type: 'button', 'aria-pressed': 'false' },
      content.triggerLabels[trigger],
    );
    chip.addEventListener('click', () => select(selected === trigger ? undefined : trigger));
    return { trigger, chip };
  });

  const select = (trigger: Trigger | undefined) => {
    selected = trigger;
    for (const entry of chips) {
      entry.chip.setAttribute('aria-pressed', String(entry.trigger === trigger));
    }
    const repeated =
      trigger !== undefined && isRepeatedTrigger(describeLastSlip(ctx.state, trigger), trigger);
    hint.textContent = repeated ? content.triggerHints[trigger] : '';
    hint.hidden = !repeated;
  };
  const finish = () => {
    const next = describeLastSlip(ctx.state, selected, note.value.trim());
    if (ctx.save(next)) ctx.go('start');
  };

  return el(
    'main',
    { class: 'screen screen--roomy screen--calm' },
    waves(),
    el(
      'div',
      { class: 'stack-m' },
      el('h1', { class: 'h1 h1--calm' }, fillText(response.headline, { tage: days })),
      el('p', { class: 'accent-line' }, fillText(response.accent, { tage: days })),
      el('p', { class: 'lead' }, fillText(response.text, { tage: days })),
    ),
    el(
      'section',
      { class: 'card stack-m' },
      el(
        'div',
        { class: 'stack-xxs' },
        el('h2', { class: 'label' }, ui.response.triggerTitle),
        el('p', { class: 'note' }, ui.response.triggerNote),
      ),
      el('div', { class: 'chips' }, ...chips.map((entry) => entry.chip)),
      hint,
      el(
        'div',
        { class: 'stack-xs' },
        el('label', { class: 'label-small', for: 'note' }, ui.response.noteLabel),
        note,
      ),
    ),
    hasFrequentSlips(ctx.state, ctx.today) &&
      el(
        'section',
        { class: 'hint stack-s' },
        el('span', {}, content.counselingHint),
        el('a', { class: 'text-link', href: href('sichern') }, content.counselingLink),
      ),
    el('div', { class: 'spacer' }),
    el(
      'div',
      { class: 'stack-s' },
      el(
        'button',
        { class: 'button button--ink', type: 'button', onclick: finish },
        ui.response.continue,
      ),
      el('a', { class: 'text-link text-link--center', href: href('start') }, ui.response.skip),
    ),
  );
}
