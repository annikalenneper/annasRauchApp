import ui from '../content/ui.json';
import { href } from './context';
import { el } from './dom';

/** Shown instead of the app when the saved data cannot be read or the browser blocks storage. */
export function renderStorageError(kind: 'corrupt' | 'unavailable'): HTMLElement {
  const corrupt = kind === 'corrupt';
  return el(
    'main',
    { class: 'screen screen--roomy' },
    el(
      'section',
      { class: 'stack-m intro', role: 'alert' },
      el(
        'h1',
        { class: 'h1' },
        corrupt ? ui.storageError.corruptTitle : ui.storageError.unavailableTitle,
      ),
      el(
        'p',
        { class: 'lead' },
        corrupt ? ui.storageError.corruptText : ui.storageError.unavailableText,
      ),
    ),
    corrupt &&
      el(
        'a',
        { class: 'button button--primary', href: href('wiederherstellen') },
        ui.storageError.corruptAction,
      ),
  );
}
