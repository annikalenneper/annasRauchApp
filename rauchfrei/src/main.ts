import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import '@fontsource/bricolage-grotesque/latin-500.css';
import '@fontsource/bricolage-grotesque/latin-700.css';
import '@fontsource/bricolage-grotesque/latin-800.css';
import './styles/main.css';

import ui from './content/ui.json';
import { toLocalIsoDate } from './core/dates';
import { dueRewards, pickRewardsToShow, type EarnedReward } from './core/rewards';
import { currentAttempt, currentAttemptIndex, smokeFreeDays } from './core/slips';
import type { AppState } from './storage/schema';
import { loadState, requestPersistence, saveState } from './storage/store';
import { renderBackup } from './views/backup';
import { href, type AppContext, type Route } from './views/context';
import { renderHome } from './views/home';
import { renderOnboarding } from './views/onboarding';
import { renderResponse } from './views/response';
import { renderRestore } from './views/restore';
import { renderReward } from './views/reward';
import { HEALTH_DAYS } from './views/reward-text';
import { renderSettings } from './views/settings';
import { renderSlip } from './views/slip';
import { renderStorageError } from './views/storage-error';
import { renderTreasure } from './views/treasure';

const ROUTES: Route[] = [
  'start',
  'schatz',
  'sichern',
  'wiederherstellen',
  'ausrutscher',
  'rueckmeldung',
  'einstellungen',
];

const root = document.querySelector<HTMLElement>('#app') as HTMLElement;
const loaded = loadState();

let state: AppState | null = loaded.status === 'ok' ? loaded.state : null;
let storageProblem =
  loaded.status === 'corrupt' || loaded.status === 'unavailable' ? loaded.status : null;
/** Rewards waiting to be celebrated, one screen each. */
let rewardQueue: EarnedReward[] = [];

const today = () => toLocalIsoDate(new Date());

function currentRoute(): Route {
  const name = location.hash.replace(/^#\/?/, '') as Route;
  return ROUTES.includes(name) ? name : 'start';
}

function go(route: Route): void {
  if (currentRoute() === route) render();
  else location.hash = href(route);
}

function save(next: AppState): boolean {
  if (!saveState(next).ok) return false;
  state = next;
  storageProblem = null;
  return true;
}

function mount(screen: HTMLElement): void {
  root.replaceChildren(screen);
  window.scrollTo(0, 0);
}

/** Marks everything newly earned as seen and queues the newest rewards for display. */
function collectRewards(current: AppState): void {
  const attempt = currentAttempt(current);
  const due = dueRewards(
    currentAttemptIndex(current),
    attempt.startDate,
    smokeFreeDays(attempt, today()),
    HEALTH_DAYS,
    current.seenRewards,
  );
  if (due.length === 0) return;
  const seenRewards = [...current.seenRewards, ...due.map((reward) => reward.id)];
  if (save({ ...current, seenRewards })) rewardQueue = pickRewardsToShow(due);
}

function renderWithoutState(route: Route): HTMLElement {
  if (storageProblem === 'unavailable') return renderStorageError('unavailable');
  if (route === 'wiederherstellen') {
    return renderRestore({
      today: today(),
      replacesExisting: false,
      backRoute: 'start',
      backLabel: ui.common.backToStart,
      accept: (restored) => save(restored) && (go('start'), true),
    });
  }
  if (storageProblem === 'corrupt') return renderStorageError('corrupt');
  return renderOnboarding(today(), (created) => {
    if (!save(created)) return false;
    void requestPersistence(navigator.storage);
    go('start');
    return true;
  });
}

function slippedToday(current: AppState): boolean {
  return currentAttempt(current).slips.at(-1)?.date === today();
}

function renderScreen(route: Route, ctx: AppContext): HTMLElement {
  switch (route) {
    case 'schatz':
      return renderTreasure(ctx);
    case 'sichern':
      return renderBackup(ctx);
    case 'ausrutscher':
      return renderSlip(ctx);
    case 'rueckmeldung':
      return renderResponse(ctx);
    case 'einstellungen':
      return renderSettings(ctx);
    case 'wiederherstellen':
      return renderRestore({
        today: ctx.today,
        replacesExisting: true,
        backRoute: 'sichern',
        backLabel: ui.common.backToBackup,
        accept: (restored) => save(restored) && (go('start'), true),
      });
    default:
      return renderHome(ctx);
  }
}

function render(): void {
  let route = currentRoute();
  if (!state) return mount(renderWithoutState(route));
  if (route === 'rueckmeldung' && !slippedToday(state)) {
    history.replaceState(null, '', href('start'));
    route = 'start';
  }
  if (route === 'start' && rewardQueue.length === 0) collectRewards(state);

  const ctx: AppContext = { state, today: today(), save, go };
  const reward = route === 'start' ? rewardQueue[0] : undefined;
  if (!reward) return mount(renderScreen(route, ctx));
  const startDate = currentAttempt(state).startDate;
  mount(
    renderReward(ctx, reward, startDate, () => {
      rewardQueue = rewardQueue.slice(1);
      render();
    }),
  );
}

window.addEventListener('hashchange', render);
document.addEventListener('visibilitychange', () => {
  // A new day may have begun while the app was in the background.
  if (document.visibilityState === 'visible' && state && currentRoute() === 'start') render();
});

render();
if (state) void requestPersistence(navigator.storage);
