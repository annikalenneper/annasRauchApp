import ui from '../content/ui.json';
import { checkStartDate } from '../core/dates';
import { parseDecimal } from '../core/savings';
import { MAX_START_UNCERTAINTY_DAYS, type SmokingInfo } from '../storage/schema';
import { href, type Route } from './context';
import { el } from './dom';
import { icon, type IconName } from './icons';

export function wordmark(): HTMLElement {
  return el('div', { class: 'wordmark' }, ui.common.wordmark);
}

export function backLink(route: Route, label: string): HTMLElement {
  return el('a', { class: 'icon-button', href: href(route), 'aria-label': label }, icon('back'));
}

export function bottomNav(active: Route): HTMLElement {
  const entry = (route: Route, name: IconName, label: string) =>
    el(
      'a',
      { class: 'nav__item', href: href(route), 'aria-current': route === active && 'page' },
      icon(name, 22),
      label,
    );
  return el(
    'nav',
    { class: 'nav', 'aria-label': ui.nav.label },
    entry('start', 'home', ui.nav.start),
    entry('schatz', 'treasure', ui.nav.treasure),
    entry('sichern', 'backup', ui.nav.backup),
  );
}

export function errorText(): HTMLElement {
  return el('p', { class: 'error', role: 'alert', hidden: true });
}

export function showError(node: HTMLElement, message: string | null): void {
  node.textContent = message ?? '';
  node.hidden = message === null;
}

export interface StartDateField {
  node: HTMLElement;
  /** The chosen date and its optional "give or take", or the message to show. */
  read(): { ok: true; startDate: string; uncertaintyDays?: number } | { ok: false; error: string };
}

function readUncertainty(input: string): number | null {
  if (input.trim() === '') return 0;
  const days = parseDecimal(input);
  const valid = days !== null && Number.isInteger(days) && days <= MAX_START_UNCERTAINTY_DAYS;
  return valid ? days : null;
}

export function startDateField(
  value: string,
  today: string,
  label: string,
  uncertaintyDays?: number,
): StartDateField {
  const input = el('input', { id: 'start', class: 'field', type: 'date', value, max: today });
  const margin = el('input', {
    id: 'margin',
    class: 'field field--short',
    type: 'text',
    inputmode: 'numeric',
    value: uncertaintyDays ?? '',
    'aria-describedby': 'margin-note',
  });
  const node = el(
    'div',
    { class: 'card stack-m' },
    el('div', { class: 'stack-s' }, el('label', { class: 'label', for: 'start' }, label), input),
    el(
      'div',
      { class: 'stack-xs' },
      el('label', { class: 'label-small', for: 'margin' }, ui.form.marginLabel),
      margin,
      el('div', { class: 'note', id: 'margin-note' }, ui.form.marginNote),
    ),
  );
  const read: StartDateField['read'] = () => {
    const check = checkStartDate(input.value, today);
    if (check === 'future') return { ok: false, error: ui.form.errorStartFuture };
    if (check === 'invalid') return { ok: false, error: ui.form.errorStartInvalid };
    const days = readUncertainty(margin.value);
    if (days === null) return { ok: false, error: ui.form.errorMargin };
    return days > 0
      ? { ok: true, startDate: input.value, uncertaintyDays: days }
      : { ok: true, startDate: input.value };
  };
  return { node, read };
}

export interface SmokingFields {
  node: HTMLElement;
  /** `smoking` is undefined when Anna left the fields empty. */
  read(): { ok: true; smoking?: SmokingInfo } | { ok: false; error: string };
}

function numberField(id: string, label: string, value: string, mode: string) {
  const input = el('input', { id, class: 'field', type: 'text', inputmode: mode, value });
  const node = el(
    'div',
    { class: 'stack-xs' },
    el('label', { class: 'label-small', for: id }, label),
    input,
  );
  return { node, input };
}

function toGerman(value: number | undefined): string {
  return value === undefined ? '' : String(value).replace('.', ',');
}

export function smokingFields(initial?: SmokingInfo): SmokingFields {
  const perDay = numberField(
    'perday',
    ui.form.perDay,
    toGerman(initial?.cigarettesPerDay),
    'numeric',
  );
  const price = numberField('price', ui.form.price, toGerman(initial?.pricePerPack), 'decimal');
  const perPack = numberField(
    'perpack',
    ui.form.perPack,
    toGerman(initial?.cigarettesPerPack ?? 20),
    'numeric',
  );
  const node = el(
    'div',
    { class: 'card stack-m' },
    el(
      'div',
      { class: 'stack-xxs' },
      el('div', { class: 'label' }, ui.form.smokingTitle),
      el('div', { class: 'note' }, ui.form.smokingNote),
    ),
    el('div', { class: 'grid-3' }, perDay.node, price.node, perPack.node),
  );

  const read: SmokingFields['read'] = () => {
    const [day, cost, pack] = [perDay, price, perPack].map((field) => field.input.value.trim());
    if (!day && !cost) return { ok: true };
    if (!day || !cost) return { ok: false, error: ui.form.errorSmokingIncomplete };
    const smoking = {
      cigarettesPerDay: parseDecimal(day ?? ''),
      pricePerPack: parseDecimal(cost ?? ''),
      cigarettesPerPack: pack ? parseDecimal(pack) : 20,
    };
    const valid = Object.values(smoking).every((value) => value !== null && value > 0);
    if (!valid || !Number.isInteger(smoking.cigarettesPerPack)) {
      return { ok: false, error: ui.form.errorSmokingNumbers };
    }
    return { ok: true, smoking: smoking as SmokingInfo };
  };
  return { node, read };
}
