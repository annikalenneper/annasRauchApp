import { expect, test, type Page } from '@playwright/test';

const STATE_KEY = 'rauchfrei:v1:state';
const TODAY = '2026-10-10';

// 1 May to 10 October 2026: 162 days. Every reward up to then is already seen.
const seededState = (extra: Record<string, unknown> = {}) => ({
  schemaVersion: 1,
  createdAt: '2026-05-01',
  attempts: [{ startDate: '2026-05-01', slips: [] }],
  smoking: { cigarettesPerDay: 15, pricePerPack: 8.9, cigarettesPerPack: 20 },
  seenRewards: [],
  settings: { homescreenHintDismissed: false },
  ...extra,
});

async function open(page: Page, state?: unknown) {
  await page.clock.setFixedTime(new Date(`${TODAY}T10:00:00`));
  await page.goto('./');
  if (state !== undefined) {
    await page.evaluate(
      ([key, value]) => localStorage.setItem(key as string, value as string),
      [STATE_KEY, typeof state === 'string' ? state : JSON.stringify(state)],
    );
    await page.reload();
  }
}

async function dismissRewards(page: Page) {
  await page.locator('.screen').waitFor();
  const next = page.getByRole('button', { name: 'Weiter', exact: true });
  while (await next.isVisible()) await next.click();
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/shots/${name}.png`, fullPage: true });
}

test('first start with a backdated date shows rewards, then the right numbers', async ({
  page,
}) => {
  await open(page);
  await expect(page.getByRole('heading', { name: 'Anna, du machst das toll!' })).toBeVisible();
  await shot(page, '1-onboarding');

  await page.getByLabel('Seit wann rauchst du nicht mehr?').fill('2026-05-01');
  await page.getByLabel('Zigaretten pro Tag').fill('15');
  await page.getByLabel('Preis pro Schachtel').fill('8,90');
  await page.getByRole('button', { name: 'Los geht’s' }).click();

  await expect(page.getByText('Meilenstein', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: /150/ })).toBeVisible();
  await expect(page.getByText('Bisher gespart: 1.001 €')).toBeVisible();
  await shot(page, '5-belohnung-meilenstein');
  await page.getByRole('button', { name: 'Weiter', exact: true }).click();

  await expect(page.getByText('Dein Körper', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Quelle: WHO/ })).toBeVisible();
  await shot(page, '5-belohnung-gesundheit');
  await page.getByRole('button', { name: 'Weiter', exact: true }).click();

  await expect(page.getByText('Überraschung', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Weiter', exact: true }).click();

  await expect(page.getByText('Rauchfrei seit 1. Mai 2026')).toBeVisible();
  await expect(page.locator('.counter__number')).toHaveText('162');
  await expect(page.getByText('noch 38 Tage bis 200')).toBeVisible();
  await expect(page.getByText('1.081 €')).toBeVisible();
  await expect(page.getByText('2.430')).toBeVisible();
  await shot(page, '2-startseite');

  await page.reload();
  await expect(page.locator('.counter__number')).toHaveText('162');
  await expect(page.getByText('Meilenstein', { exact: true })).toBeHidden();

  await page.getByRole('link', { name: 'Schatzkästchen' }).click();
  await expect(page.getByText('Meilenstein · 150 Tage')).toBeVisible();
  await expect(page.getByText('Meilenstein · 1 Tag', { exact: true })).toBeVisible();
  await shot(page, '5-schatzkaestchen');
});

test('a start date in the future is refused', async ({ page }) => {
  await open(page);
  await page.getByLabel('Seit wann rauchst du nicht mehr?').fill('2026-10-11');
  await page.getByRole('button', { name: 'Los geht’s' }).click();

  await expect(page.getByRole('alert')).toContainText('in der Zukunft');
  expect(await page.evaluate((key) => localStorage.getItem(key), STATE_KEY)).toBeNull();
});

test('a slip keeps the attempt running and records the trigger', async ({ page }) => {
  await open(page, seededState());
  await dismissRewards(page);

  await page.getByRole('link', { name: 'Ausrutscher melden' }).click();
  await expect(page.getByRole('heading', { name: 'Was ist passiert?' })).toBeVisible();
  await shot(page, '3-ausrutscher');
  await page.getByRole('button', { name: /Ich hatte einen Ausrutscher/ }).click();

  await expect(
    page.getByRole('heading', { name: 'Eine Zigarette löscht nicht 161 rauchfreie Tage aus.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Alkohol' }).click();
  await expect(page.getByRole('button', { name: 'Alkohol' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await shot(page, '4-rueckmeldung');
  await page.getByRole('button', { name: 'Weiter geht’s' }).click();

  await expect(page.locator('.counter__number')).toHaveText('161');
  await expect(page.getByText('161 von 162 Tagen rauchfrei')).toBeVisible();
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STATE_KEY);
  expect(saved.attempts).toHaveLength(1);
  expect(saved.attempts[0].slips).toEqual([{ date: TODAY, trigger: 'alkohol' }]);
});

test('repeated triggers and frequent slips get a gentle hint', async ({ page }) => {
  const slips = ['2026-09-30', '2026-10-05'].map((date) => ({ date, trigger: 'alkohol' }));
  await open(page, seededState({ attempts: [{ startDate: '2026-05-01', slips }] }));
  await dismissRewards(page);

  await page.getByRole('link', { name: 'Ausrutscher melden' }).click();
  await page.getByRole('button', { name: /Ich hatte einen Ausrutscher/ }).click();

  await expect(page.getByText('Beim Rauchfrei-Telefon hören dir Leute zu')).toBeVisible();
  await expect(page.getByText('Alkohol war schon öfter dabei')).toBeHidden();
  await page.getByRole('button', { name: 'Alkohol' }).click();
  await expect(page.getByText('Alkohol war schon öfter dabei')).toBeVisible();
});

test('a restart begins a new attempt and keeps the old one', async ({ page }) => {
  await open(page, seededState());
  await dismissRewards(page);

  await page.getByRole('link', { name: 'Ausrutscher melden' }).click();
  await page.getByRole('button', { name: /Ich fange neu an/ }).click();
  await page.getByRole('button', { name: 'Ja, neu anfangen' }).click();
  await dismissRewards(page);

  await expect(page.locator('.counter__number')).toHaveText('0');
  await expect(page.getByText('Dein längster Versuch: 162 Tage')).toBeVisible();

  await page.getByRole('link', { name: 'Einstellungen' }).click();
  await expect(page.getByText('1. Mai 2026 bis 10. Oktober 2026 · 162 Tage')).toBeVisible();
});

test('backup code restores the same state on an empty phone', async ({ page }) => {
  const slips = [{ date: '2026-06-10', trigger: 'stress', note: 'Prüfung <b>fett</b>' }];
  await open(page, seededState({ attempts: [{ startDate: '2026-05-01', slips }] }));
  await dismissRewards(page);
  const before = await page.evaluate((key) => localStorage.getItem(key), STATE_KEY);

  await page.getByRole('link', { name: 'Sichern & Hilfe' }).click();
  await expect(page.getByRole('img', { name: 'QR-Code deiner Sicherung' })).toBeVisible();
  await expect(page.getByRole('link', { name: '0800 8 31 31 31' })).toHaveAttribute(
    'href',
    'tel:08008313131',
  );
  await shot(page, '6-sicherung');
  await page.getByRole('button', { name: 'Code kopieren' }).click();
  await expect(page.getByText('Kopiert')).toBeVisible();
  const code = await page.evaluate(() => navigator.clipboard.readText());
  expect(code).toMatch(/^RF1\./);

  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
  await page.getByRole('link', { name: 'Ich habe schon einen Sicherungscode' }).click();

  await page.getByLabel('Sicherungscode').fill('RF1.kaputt');
  await page.getByRole('button', { name: 'Code prüfen' }).click();
  await expect(page.getByRole('alert')).toContainText('unvollständig oder beschädigt');

  await page.getByLabel('Sicherungscode').fill(code);
  await page.getByRole('button', { name: 'Code prüfen' }).click();
  await expect(page.getByText('Rauchfrei seit 1. Mai 2026')).toBeVisible();
  await expect(page.getByText('161 Tage rauchfrei')).toBeVisible();
  await shot(page, '6-wiederherstellen');
  expect(await page.evaluate((key) => localStorage.getItem(key), STATE_KEY)).toBeNull();

  await page.getByRole('button', { name: 'Diesen Stand übernehmen' }).click();
  await expect(page.locator('.counter__number')).toHaveText('161');
  expect(await page.evaluate((key) => localStorage.getItem(key), STATE_KEY)).toBe(before);
});

test('unreadable data shows a message and is left untouched', async ({ page }) => {
  await open(page, '{"schemaVersion":1,');

  await expect(page.getByRole('alert')).toContainText('lassen sich gerade nicht lesen');
  await expect(
    page.getByRole('link', { name: 'Mit Sicherungscode wiederherstellen' }),
  ).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), STATE_KEY)).toBe(
    '{"schemaVersion":1,',
  );
});

test('settings correct the start date and the savings', async ({ page }) => {
  await open(page, seededState({ smoking: undefined }));
  await dismissRewards(page);
  await expect(page.getByText('gespart')).toBeHidden();

  await page.getByRole('link', { name: 'Ersparnis einrichten' }).click();
  await page.getByLabel('Startdatum korrigieren').fill('2026-10-03');
  await page.getByLabel('Zigaretten pro Tag').fill('10');
  await page.getByLabel('Preis pro Schachtel').fill('9');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await dismissRewards(page);

  await expect(page.locator('.counter__number')).toHaveText('7');
  await expect(page.getByText('32 €')).toBeVisible();
  await page.getByRole('link', { name: 'Schatzkästchen' }).click();
  await expect(page.getByText('Meilenstein · 150 Tage')).toBeHidden();
  await expect(page.getByText('Meilenstein · 7 Tage')).toBeVisible();
});

test('an uncertain start shows a small plus/minus next to the number', async ({ page }) => {
  const margin = page.getByLabel(/Plus\/minus wie viele Tage/);
  await open(page);
  await page.getByLabel('Seit wann rauchst du nicht mehr?').fill('2026-05-01');
  await margin.fill('5');
  await page.getByRole('button', { name: 'Los geht’s' }).click();
  await dismissRewards(page);

  await expect(page.locator('.counter__number')).toHaveText('162');
  await expect(page.locator('.counter__margin')).toHaveText('± 5');
  await shot(page, '2-startseite-ungefaehr');

  await page.getByRole('link', { name: 'Einstellungen' }).click();
  await expect(margin).toHaveValue('5');
  await margin.fill('viele');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('alert')).toContainText('ganze Zahl');
  await margin.fill('');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.locator('.counter__number')).toHaveText('162');
  await expect(page.locator('.counter__margin')).toHaveCount(0);
});

test('the homescreen hint can be closed for good', async ({ page }) => {
  await open(page, seededState());
  await dismissRewards(page);

  await expect(page.getByText('Leg mich auf deinen Home-Bildschirm')).toBeVisible();
  await page.getByRole('button', { name: 'Hinweis schließen' }).click();
  await expect(page.getByText('Leg mich auf deinen Home-Bildschirm')).toBeHidden();
  await page.reload();
  await expect(page.getByText('Leg mich auf deinen Home-Bildschirm')).toBeHidden();
});

test('the app talks to no other server', async ({ page }) => {
  const foreign: string[] = [];
  page.on('request', (request) => {
    const url = request.url();
    if (!url.startsWith('http://localhost') && !url.startsWith('data:')) foreign.push(url);
  });

  await open(page, seededState());
  await dismissRewards(page);
  for (const name of ['Schatzkästchen', 'Sichern & Hilfe', 'Start']) {
    await page.getByRole('link', { name, exact: true }).click();
  }
  await page.getByRole('link', { name: 'Sichern & Hilfe' }).click();
  await expect(page.getByRole('img', { name: 'QR-Code deiner Sicherung' })).toBeVisible();

  expect(foreign).toEqual([]);
});

test.describe('dark mode and reduced motion', () => {
  test.use({ colorScheme: 'dark', reducedMotion: 'reduce' });

  test('screens render in dark mode without animation', async ({ page }) => {
    await open(page, seededState({ attempts: [{ startDate: '2026-05-13', slips: [] }] }));
    await expect(page.getByRole('heading', { name: /150/ })).toBeVisible();
    const animation = await page
      .locator('.confetti')
      .evaluate((node) => getComputedStyle(node).animationName);
    expect(animation).toBe('none');
    await shot(page, 'dark-belohnung');

    await dismissRewards(page);
    await expect(page.locator('.counter__number')).toHaveText('150');
    await shot(page, 'dark-startseite');
    await page.getByRole('link', { name: 'Sichern & Hilfe' }).click();
    await expect(page.getByRole('img', { name: 'QR-Code deiner Sicherung' })).toBeVisible();
    await shot(page, 'dark-sicherung');
  });
});

test.describe('large system font on a small phone', () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test('nothing is cut off horizontally', async ({ page }) => {
    await open(page, seededState());
    await page.addStyleTag({ content: ':root { font-size: 150% !important; }' });
    await dismissRewards(page);

    for (const name of ['Start', 'Schatzkästchen', 'Sichern & Hilfe']) {
      await page.getByRole('link', { name, exact: true }).click();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `horizontal overflow on ${name}`).toBeLessThanOrEqual(0);
    }
    await page.getByRole('link', { name: 'Start', exact: true }).click();
    await shot(page, 'grosse-schrift-startseite');
  });
});
