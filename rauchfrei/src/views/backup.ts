import ui from '../content/ui.json';
import { createBackupCode } from '../storage/backup';
import { href, type AppContext } from './context';
import { el } from './dom';
import { icon } from './icons';
import { bottomNav } from './parts';

async function fillQr(holder: HTMLElement, code: string): Promise<void> {
  try {
    const { toDataURL } = await import('qrcode');
    const src = await toDataURL(code, { errorCorrectionLevel: 'M', margin: 2, width: 720 });
    holder.replaceChildren(el('img', { class: 'qr__image', src, alt: ui.backup.qrAlt }));
  } catch {
    holder.replaceChildren(el('p', { class: 'note note--center' }, ui.backup.qrTooBig));
  }
}

function backupCard(ctx: AppContext): HTMLElement {
  const qr = el('div', { class: 'qr' });
  const code = el('output', { class: 'code', 'aria-label': ui.backup.codeLabel });
  const status = el('p', { class: 'note note--center', role: 'status' });
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code.textContent ?? '');
      status.textContent = ui.backup.copied;
    } catch {
      status.textContent = ui.backup.copyFailed;
    }
  };
  void createBackupCode(ctx.state).then((backupCode) => {
    code.textContent = backupCode;
    return fillQr(qr, backupCode);
  });

  return el(
    'section',
    { class: 'card stack-m card--centered' },
    qr,
    code,
    el(
      'div',
      { class: 'grid-2 grid-2--full' },
      el(
        'button',
        { class: 'button button--ink button--small', type: 'button', onclick: copy },
        ui.backup.copy,
      ),
      el(
        'a',
        { class: 'button button--secondary button--small', href: href('wiederherstellen') },
        ui.backup.restore,
      ),
    ),
    status,
  );
}

function helpCard(): HTMLElement {
  return el(
    'section',
    { class: 'card stack-s', id: 'hilfe' },
    el('h2', { class: 'h2' }, ui.help.title),
    el('p', { class: 'lead lead--small' }, ui.help.text, el('br'), ui.help.hours),
    el(
      'a',
      { class: 'button button--primary button--medium', href: ui.help.phoneHref },
      icon('phone', 20),
      ui.help.phoneLabel,
    ),
    el(
      'a',
      {
        class: 'text-link',
        href: ui.help.onlineHref,
        target: '_blank',
        rel: 'noopener noreferrer',
      },
      ui.help.onlineLabel,
    ),
    el('p', { class: 'note' }, ui.help.disclaimer),
    el('p', { class: 'note' }, ui.help.source),
  );
}

/** Backup code with QR code, the way to restore, help and the privacy note. */
export function renderBackup(ctx: AppContext): HTMLElement {
  return el(
    'main',
    { class: 'screen' },
    el('header', { class: 'intro' }, el('h1', { class: 'h1 h1--small' }, ui.backup.title)),
    backupCard(ctx),
    el(
      'p',
      { class: 'hint' },
      el('strong', {}, ui.backup.newPhoneTitle),
      ' ',
      ui.backup.newPhoneText,
    ),
    helpCard(),
    el(
      'section',
      { class: 'hint stack-xxs' },
      el('strong', {}, ui.backup.privacyTitle),
      el('span', {}, ui.backup.privacyText),
    ),
    el('div', { class: 'spacer' }),
    bottomNav('sichern'),
  );
}
