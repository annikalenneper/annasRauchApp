import ui from '../content/ui.json';
import { fillText } from '../core/rewards';
import { currentAttempt, smokeFreeDays } from '../core/slips';
import { readBackupCode } from '../storage/backup';
import type { AppState } from '../storage/schema';
import type { Route } from './context';
import { el } from './dom';
import { formatDate } from './format';
import { icon } from './icons';
import { backLink, errorText, showError } from './parts';

export interface RestoreOptions {
  today: string;
  /** True if this phone already holds a state that would be replaced. */
  replacesExisting: boolean;
  backRoute: Route;
  backLabel: string;
  /** Takes over the restored state. False if it could not be saved. */
  accept(state: AppState): boolean;
}

/** Shows the camera and resolves with the first QR code it sees. Returns a function to stop. */
function startScanner(
  video: HTMLVideoElement,
  onCode: (code: string) => void,
  onError: () => void,
) {
  let stream: MediaStream | undefined;
  let stopped = false;
  const stop = () => {
    stopped = true;
    stream?.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  };

  const run = async () => {
    const [{ default: jsQR }, media] = await Promise.all([
      import('jsqr'),
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }),
    ]);
    stream = media;
    if (stopped) return stop();
    video.muted = true;
    video.srcObject = media;
    await video.play();
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const scanFrame = () => {
      if (stopped || !context) return;
      if (video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        const frame = context.getImageData(0, 0, canvas.width, canvas.height);
        const found = jsQR(frame.data, frame.width, frame.height);
        if (found?.data) return onCode(found.data);
      }
      requestAnimationFrame(scanFrame);
    };
    scanFrame();
  };
  run().catch(() => {
    stop();
    onError();
  });
  return stop;
}

function preview(state: AppState, options: RestoreOptions): HTMLElement {
  const attempt = currentAttempt(state);
  const days = smokeFreeDays(attempt, options.today);
  const error = errorText();
  const confirm = () => {
    if (!options.accept(state)) showError(error, ui.form.errorSave);
  };
  return el(
    'section',
    { class: 'card stack-s' },
    el('h2', { class: 'h2' }, ui.restore.previewTitle),
    el(
      'p',
      { class: 'lead' },
      fillText(ui.restore.previewStart, { datum: formatDate(attempt.startDate) }),
    ),
    el(
      'p',
      { class: 'lead' },
      days === 1 ? ui.restore.previewDaysOne : fillText(ui.restore.previewDays, { tage: days }),
    ),
    state.attempts.length > 1 &&
      el(
        'p',
        { class: 'note' },
        fillText(ui.restore.previewAttempts, { anzahl: state.attempts.length }),
      ),
    options.replacesExisting && el('p', { class: 'hint' }, ui.restore.overwriteNote),
    error,
    el(
      'button',
      { class: 'button button--primary', type: 'button', onclick: confirm },
      ui.restore.confirm,
    ),
  );
}

/** Restore from a backup: paste the code or scan the QR code, check the preview, then confirm. */
export function renderRestore(options: RestoreOptions): HTMLElement {
  const input = el('textarea', {
    id: 'code',
    class: 'field field--area',
    rows: 4,
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
  });
  const error = errorText();
  const result = el('div', {});
  const video = el('video', { class: 'scanner', playsinline: true, muted: true, hidden: true });
  const scanHint = el('p', { class: 'note note--center', hidden: true }, ui.restore.scanHint);
  const scanButton = el('button', {
    class: 'button button--secondary button--medium',
    type: 'button',
  });
  let stopScanner: (() => void) | undefined;

  const check = async () => {
    const read = await readBackupCode(input.value);
    showError(error, read.ok ? null : ui.restore.errors[read.reason]);
    result.replaceChildren(...(read.ok ? [preview(read.state, options)] : []));
    if (read.ok) result.scrollIntoView({ block: 'nearest' });
  };
  const setScanning = (scanning: boolean) => {
    video.hidden = scanHint.hidden = !scanning;
    scanButton.replaceChildren(
      icon(scanning ? 'close' : 'camera', 20),
      scanning ? ui.restore.scanStop : ui.restore.scan,
    );
  };
  const endScan = () => {
    stopScanner?.();
    stopScanner = undefined;
    setScanning(false);
  };
  const beginScan = () => {
    showError(error, null);
    setScanning(true);
    stopScanner = startScanner(
      video,
      (code) => {
        endScan();
        input.value = code;
        void check();
      },
      () => {
        endScan();
        showError(error, ui.restore.scanFailed);
      },
    );
    window.addEventListener('hashchange', endScan, { once: true });
  };
  scanButton.addEventListener('click', () => (stopScanner ? endScan() : beginScan()));
  setScanning(false);

  return el(
    'main',
    { class: 'screen screen--roomy' },
    el(
      'header',
      { class: 'topbar' },
      backLink(options.backRoute, options.backLabel),
      el('h1', { class: 'h1 h1--small' }, ui.restore.title),
    ),
    el('p', { class: 'lead' }, ui.restore.intro),
    el(
      'section',
      { class: 'card stack-m' },
      scanButton,
      video,
      scanHint,
      el(
        'div',
        { class: 'stack-xs' },
        el('label', { class: 'label', for: 'code' }, ui.restore.codeLabel),
        input,
      ),
      error,
      el(
        'button',
        { class: 'button button--ink', type: 'button', onclick: () => void check() },
        ui.restore.check,
      ),
    ),
    result,
  );
}
