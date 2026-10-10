import ui from '../content/ui.json';
import { createState } from '../core/slips';
import type { AppState } from '../storage/schema';
import { href } from './context';
import { el } from './dom';
import { errorText, showError, smokingFields, startDateField, wordmark } from './parts';

/** First start: asks for the quit date and, optionally, what smoking used to cost. */
export function renderOnboarding(today: string, start: (state: AppState) => boolean): HTMLElement {
  const date = startDateField(today, today, ui.form.startLabel);
  const smoking = smokingFields();
  const error = errorText();

  const submit = (event: Event) => {
    event.preventDefault();
    const chosen = date.read();
    const details = smoking.read();
    if (!chosen.ok) return showError(error, chosen.error);
    if (!details.ok) return showError(error, details.error);
    const saved = start(createState(chosen.startDate, today, details.smoking));
    showError(error, saved ? null : ui.form.errorSave);
  };

  return el(
    'form',
    { class: 'screen screen--roomy', novalidate: true, onsubmit: submit },
    el(
      'header',
      { class: 'stack-s intro' },
      wordmark(),
      el('h1', { class: 'h1 h1--large' }, ui.onboarding.title),
      el('p', { class: 'lead' }, ui.onboarding.intro),
    ),
    date.node,
    smoking.node,
    error,
    el('div', { class: 'spacer' }),
    el(
      'div',
      { class: 'stack-s' },
      el('button', { class: 'button button--primary', type: 'submit' }, ui.onboarding.submit),
      el('p', { class: 'note note--center' }, ui.onboarding.homescreenNote),
      el(
        'a',
        { class: 'text-link text-link--center', href: href('wiederherstellen') },
        ui.onboarding.restoreLink,
      ),
    ),
  );
}
