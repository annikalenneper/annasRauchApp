import type { AppState } from '../storage/schema';

export type Route =
  | 'start'
  | 'schatz'
  | 'sichern'
  | 'wiederherstellen'
  | 'ausrutscher'
  | 'rueckmeldung'
  | 'einstellungen';

/** What a screen gets from the app: the current state and ways to change it or move on. */
export interface AppContext {
  state: AppState;
  /** Today's local date as YYYY-MM-DD. */
  today: string;
  /** Saves the new state. False if the browser refused to store it. */
  save(next: AppState): boolean;
  go(route: Route): void;
}

export function href(route: Route): string {
  return `#/${route}`;
}
