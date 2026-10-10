# Implementierungsplan: Rauchfrei

Eine kostenlose, werbefreie Web-App, die beim Rauchstopp hilft. Im Kern zählt sie rauchfreie Tage. Dazu kommen Ersparnis, kleine Belohnungen und ein freundlicher Umgang mit Ausrutschern.

Anlass: Eine Freundin nutzte eine Tagezähler-App, die nach 150 Tagen Geld verlangte. Diese App soll das Gegenteil sein: einfach, dauerhaft kostenlos, ohne Konto, ohne Tracking.

Stand: 10.10.2026

---

## 1. Zielbild

**Für wen:** Menschen, die mit dem Rauchen aufgehört haben oder aufhören wollen. Keine technischen Vorkenntnisse nötig.

**Was die App kann (Version 1):**
- Beim ersten Öffnen: Startdatum abfragen, optional Zigaretten pro Tag und Preis pro Schachtel
- Startseite: große Zahl „rauchfreie Tage“, darunter Ersparnis in Euro und nicht gerauchte Zigaretten
- Belohnungen: Meilenstein-Sprüche, zwischendurch Überraschungs-Sprüche und Gesundheitsfakten
- Ausrutscher melden mit einer ermutigenden, psychologisch sinnvollen Rückmeldung
- Neustart, ohne dass die bisherigen Versuche verloren gehen
- Sicherung per Code und QR-Code, Wiederherstellung auf einem neuen Handy
- Hilfe-Seite mit Hinweis auf kostenlose Rauchstopp-Beratung

**Was die App nicht macht:** Konten, Server, Werbung, Tracking, Abo, Push-Benachrichtigungen, medizinische Beratung.

---

## 2. Architektur

- **Web-App (PWA)**, die man über „Zum Home-Bildschirm“ wie eine normale App ablegt. Funktioniert offline.
- **Hosting:** zunächst GitHub Pages, Deployment über GitHub Actions bei jedem Push auf `main`.
- **Alle Nutzerdaten bleiben auf dem Gerät** (localStorage). Es gibt keinen Server. Mehrere Nutzer sind kein Problem, weil jeder nur seine eigenen Daten auf seinem eigenen Handy hat.
- **Inhalte** (Sprüche, Meilensteine, Gesundheitsfakten, Ausrutscher-Rückmeldungen) liegen als JSON im Repo und werden mit ausgeliefert. Neue Sprüche: Datei ändern, pushen, fertig.

### Technik
- Vite + TypeScript, **kein Framework** (die App hat nur wenige Ansichten)
- `vite-plugin-pwa` für Manifest und Service Worker
- `qrcode` zum Erzeugen von QR-Codes, `jsqr` zum Scannen mit der Kamera
- Vitest für Unit-Tests, Playwright für einen Smoke-Test der Hauptabläufe
- ESLint + Prettier
- Keine externen Laufzeit-Anfragen: keine CDNs, keine Webfonts von fremden Servern, keine Analytics

### Projektstruktur

```
rauchfrei/
├── CLAUDE.md
├── PROGRESS.md
├── IMPLEMENTIERUNGSPLAN.md
├── README.md
├── index.html
├── vite.config.ts
├── public/
│   └── icons/                 # App-Icons in allen nötigen Größen
├── src/
│   ├── main.ts                # Einstieg, Router zwischen Ansichten
│   ├── core/                  # reine Logik, kein DOM, kein Speicher
│   │   ├── dates.ts           # Tage zählen, Zeitzonen-sicher
│   │   ├── savings.ts         # Ersparnis
│   │   ├── slips.ts           # Ausrutscher und Neustarts
│   │   └── rewards.ts         # welche Belohnung ist heute dran
│   ├── storage/
│   │   ├── schema.ts          # Datentypen + Version
│   │   ├── store.ts           # Laden/Speichern mit Präfix
│   │   ├── migrations.ts      # Schema-Upgrades
│   │   └── backup.ts          # Export-/Import-Code
│   ├── views/                 # onboarding, home, slip, reward, backup, help, privacy
│   ├── content/
│   │   ├── milestones.json
│   │   ├── sprueche.json
│   │   ├── health.json
│   │   └── slip-responses.json
│   └── styles/
└── tests/
    ├── unit/
    └── e2e/
```

### Datenmodell (Schema-Version 1)

```ts
interface AppState {
  schemaVersion: 1;
  createdAt: string;                // ISO-Datum
  attempts: Attempt[];              // mindestens einer, der letzte ist der aktuelle
  smoking?: {
    cigarettesPerDay: number;
    pricePerPack: number;           // Euro
    cigarettesPerPack: number;      // Standard 20
  };
  seenRewards: string[];            // IDs bereits gezeigter Belohnungen
  settings: { homescreenHintDismissed: boolean };
}

interface Attempt {
  startDate: string;                // YYYY-MM-DD, lokales Datum
  slips: Slip[];
}

interface Slip {
  date: string;                     // YYYY-MM-DD
  trigger?: "stress" | "alkohol" | "gesellschaft" | "langeweile" | "gewohnheit" | "sonstiges";
  note?: string;                    // max. 200 Zeichen, freiwillig
}
```

Speicherschlüssel: `rauchfrei:v1:state`. Das Präfix ist wichtig, weil sich alle Projekte unter `<nutzer>.github.io` denselben Browserspeicher teilen.

---

## 3. Fachliche Regeln

### Tage zählen
- Gezählt werden **Kalendertage** im lokalen Datum, nicht 24-Stunden-Blöcke. Wer am 1. aufhört, hat am 2. einen rauchfreien Tag.
- Der Starttag selbst zählt als Tag 0.
- Rechnung ausschließlich mit `YYYY-MM-DD`-Werten, nie mit Uhrzeiten. So können Sommerzeit und Zeitzonen nichts verschieben.
- **Rauchfreie Tage** = Tage seit Start des aktuellen Versuchs minus Anzahl verschiedener Tage mit Ausrutscher.

### Ausrutscher-Konzept

Hintergrund: In der Rückfallforschung beschreibt der **Abstinenzverletzungseffekt** (Marlatt), dass ein einzelner Ausrutscher oft als „jetzt ist eh alles vorbei“ gedeutet wird. Genau dieses Denken führt dann zum echten Rückfall. Ein Zähler, der hart auf null springt, verstärkt das. Daher:

- Die Person entscheidet selbst, was passiert ist:
  - **„Ich hatte einen Ausrutscher“**: Der Versuch läuft weiter. Der Tag wird als Ausrutscher-Tag vermerkt. Anzeige z. B. „147 von 150 Tagen rauchfrei“.
  - **„Ich fange neu an“**: Ein neuer Versuch beginnt mit neuem Startdatum. Der alte Versuch bleibt in der Historie erhalten („Dein längster Versuch: 150 Tage“).
- Die App wählt **nie** selbst den Neustart und schlägt ihn auch nicht vor.
- Nach dem Melden kommt eine Rückmeldung aus `slip-responses.json`:
  - kein Vorwurf, keine Ausrufezeichen-Strenge
  - betont, was schon geschafft wurde (konkrete Zahl der rauchfreien Tage nennen)
  - lenkt auf den nächsten Schritt statt auf den Fehler
- Optional danach: „Magst du festhalten, was der Auslöser war?“ mit den Auswahlfeldern aus dem Datenmodell. Ab dem dritten Ausrutscher mit gleichem Auslöser erscheint ein sanfter Hinweis darauf (z. B. „Alkohol war schon öfter dabei. Vielleicht hilft ein Plan für den nächsten Abend.“).
- Ab dem dritten Ausrutscher innerhalb von 14 Tagen erscheint zusätzlich ein freundlicher Hinweis auf die kostenlose Beratung (siehe Hilfe-Seite). Kein Druck, nur ein Angebot.

### Ersparnis
- Kosten pro Tag = Zigaretten pro Tag × Preis pro Schachtel ÷ Zigaretten pro Schachtel
- Ersparnis = rauchfreie Tage × Kosten pro Tag (Ausrutscher-Tage zählen nicht mit)
- Nicht gerauchte Zigaretten = rauchfreie Tage × Zigaretten pro Tag
- Anzeige gerundet auf ganze Euro, Formatierung `de-DE`
- Ist nichts angegeben, wird der Ersparnis-Bereich ausgeblendet. Es gibt einen Link „Ersparnis einrichten“.
- Kleine Vergleiche für Spaß ab bestimmten Beträgen aus einer Liste in `milestones.json` (z. B. „Das ist ein Wochenende am Meer“).

### Belohnungen
- **Meilensteine** an Tag 1, 2, 3, 5, 7, 10, 14, 21, 30, 50, 75, 100, 150, 200, 250, 300, 365, danach alle 100 Tage und jeder Jahrestag. Jeder Meilenstein hat einen eigenen Text.
- **Überraschungen** zwischen den Meilensteinen alle 2 bis 4 Tage. Welche Tage das sind, wird aus dem Startdatum deterministisch berechnet (gleicher Start ergibt gleiche Tage), damit nichts durch erneutes Öffnen „erschummelt“ wird.
- **Gesundheitsfakten** erscheinen, sobald der passende Zeitpunkt seit Rauchstopp erreicht ist (Inhalte nach WHO, siehe unten).
- Belohnungen werden beim Öffnen gezeigt, wenn eine noch nicht gesehene fällig ist. Mehrere fällige werden nacheinander angezeigt, höchstens drei auf einmal.
- Alle bisherigen Belohnungen sind in einem „Schatzkästchen“ nachlesbar.
- **Keine fremden Memes oder Bilder** (Bildrechte). Wenn Bilder, dann selbst erstellt oder schlichte Emoji-Kompositionen.

### Sicherung und Umzug
- **Sicherungscode:** Zustand als JSON → komprimiert → Base64url. Daraus ein QR-Code und ein Text-Code zum Kopieren.
- **Wiederherstellen** in der App selbst: Code einfügen oder QR-Code mit der Kamera scannen.
- **Wichtig für iPhones:** Eine Web-App auf dem Home-Bildschirm hat einen **eigenen, von Safari getrennten Speicher**. Ein Import-Link, der in Safari aufgeht, landet daher nicht in der Home-Bildschirm-App. Die Wiederherstellung muss deshalb **innerhalb der installierten App** passieren.
- Beim Import: Schema-Version prüfen, ggf. migrieren, Vorschau anzeigen („Startdatum 3. Mai, 160 Tage“) und erst nach Bestätigung überschreiben.
- Das ist gleichzeitig der **Umzugsweg**, falls die App später auf eine andere Adresse zieht (z. B. Netlify). Eine neue Adresse bedeutet neuen Browserspeicher, die Daten wandern also per Sicherungscode mit.

### Home-Bildschirm-Hinweis
- Safari löscht Daten von Webseiten, die 7 Tage nicht besucht wurden. Für Apps auf dem Home-Bildschirm gilt das nicht.
- Läuft die App nicht im Standalone-Modus, zeigt sie deshalb einen gut sichtbaren, schließbaren Hinweis mit kurzer Anleitung (iPhone: Teilen → Zum Home-Bildschirm; Android: Menü → App installieren).
- Zusätzlich `navigator.storage.persist()` anfragen, wo verfügbar.

---

## 4. Inhalte (Grundstock)

Die Texte unten werden in Phase 5 in die JSON-Dateien übernommen. Ton: warm, locker, ein bisschen Humor, nie belehrend. Du-Form.

### Meilensteine (`milestones.json`)
- **Tag 1:** Der erste Tag ist geschafft. Der schwerste Teil von allem ist, anzufangen, und das hast du hinter dir.
- **Tag 2:** Zwei Tage! Dein Körper hat das Kohlenmonoxid schon längst rausgeworfen.
- **Tag 3:** Drei Tage. Viele sagen, das ist der härteste Abschnitt. Du stehst mittendrin und hältst durch.
- **Tag 5:** Fünf Tage. Eine ganze Hand voll.
- **Tag 7:** Eine Woche rauchfrei! Das ist kein Zufall mehr, das ist eine Entscheidung.
- **Tag 10:** Zweistellig. Ab heute brauchst du zwei Ziffern für deinen Erfolg.
- **Tag 14:** Zwei Wochen. Deine Lunge fängt an, aufzuräumen.
- **Tag 21:** Drei Wochen. Neue Gewohnheiten fühlen sich langsam normal an.
- **Tag 30:** Ein Monat! Gönn dir was von dem Geld, das du nicht verbrannt hast.
- **Tag 50:** Fünfzig. Halbe Hundert. Ganz schön stark.
- **Tag 75:** Dreiviertel auf dem Weg zur 100.
- **Tag 100:** HUNDERT TAGE. Dreistellig. Lass dich feiern.
- **Tag 150:** 150 Tage. Andere Apps wollen hier Geld von dir. Wir sagen nur: Respekt.
- **Tag 200:** 200 Tage. Du bist längst jemand, der nicht raucht.
- **Tag 365:** Ein ganzes Jahr. Dein Herz-Risiko ist nur noch etwa halb so hoch wie vorher. Was für ein Geschenk an dich selbst.

### Überraschungs-Sprüche (`sprueche.json`)
1. Jeder Tag ohne ist ein Tag für dich.
2. Du bist stärker als jede Zigarette, und sie weiß das inzwischen auch.
3. Die Lust kommt in Wellen. Wellen gehen vorbei. Du bleibst.
4. Kleiner Reminder: Ein Verlangen dauert meist nur ein paar Minuten. Ein Glas Wasser, kurz raus, durchatmen.
5. Dein zukünftiges Ich hat gerade zufrieden genickt.
6. Riechst du das? Genau, nichts. Herrlich.
7. Du machst das nicht perfekt, du machst es weiter. Das zählt.
8. Wenn's heute schwer ist: nur bis morgen früh. Mehr musst du nicht.
9. Treppe statt Aufzug? Mal schauen, wie die Puste sich anfühlt.
10. Die Zigarette hat dir nie Ruhe gegeben. Sie hat nur die Unruhe gemacht, die sie dann gelindert hat.
11. Gönn dir heute etwas Kleines. Du hast es dir verdient.
12. Erzähl heute jemandem, wie viele Tage du schon hast. Stolz ist erlaubt.
13. Dein Geschmackssinn kommt zurück. Iss was richtig Gutes.
14. Keine Raucherpause? Mach eine Glückspause.
15. Du hast schon so viele Momente geschafft, in denen du früher geraucht hättest.
16. Heute ist wieder so ein Tag, an dem du gewinnst.
17. Deine Klamotten danken dir.
18. Wer so lange durchhält, kann auch noch einen Tag mehr.
19. Kaffee schmeckt übrigens auch ohne.
20. Du bist nicht „ohne“, du bist frei.
21. Atme einmal ganz tief ein. Das ist jetzt deine Luft.
22. Rückschläge gehören dazu. Aufgeben nicht.
23. Jeder rauchfreie Tag ist ein Beweis. Du sammelst gerade ganz schön viele.
24. Die Gewohnheit flüstert. Du musst nicht zuhören.
25. Weiter so. Ehrlich.

### Gesundheitsfakten (`health.json`), Quelle: WHO
- **20 Minuten:** Herzfrequenz und Blutdruck sinken.
- **12 Stunden:** Der Kohlenmonoxid-Wert im Blut ist wieder normal.
- **2 bis 12 Wochen:** Durchblutung und Lungenfunktion verbessern sich.
- **1 bis 9 Monate:** Husten und Kurzatmigkeit lassen nach.
- **1 Jahr:** Das Risiko für koronare Herzkrankheit ist etwa halb so hoch wie bei Rauchenden.
- **5 Jahre:** Das Schlaganfallrisiko sinkt auf das von Nichtrauchenden (je nach Person nach 5 bis 15 Jahren).
- **10 Jahre:** Das Lungenkrebsrisiko ist etwa halb so hoch wie bei Rauchenden, auch das Risiko für mehrere andere Krebsarten sinkt.
- **15 Jahre:** Das Risiko für koronare Herzkrankheit entspricht dem von Nichtrauchenden.

Quelle: https://www.who.int/news-room/questions-and-answers/item/tobacco-health-benefits-of-smoking-cessation
Die App zeigt die Quelle unter jedem Fakt an. Keine weiteren Gesundheitsaussagen ohne seriöse Quelle.

### Rückmeldungen auf Ausrutscher (`slip-responses.json`)
`{tage}` wird durch die Zahl der rauchfreien Tage im aktuellen Versuch ersetzt.

1. Danke, dass du ehrlich bist. Eine Zigarette löscht nicht {tage} rauchfreie Tage aus. Die gehören dir.
2. Ausrutscher passieren auf fast jedem Weg raus aus dem Rauchen. Das heißt nicht, dass du gescheitert bist. Es heißt, dass du unterwegs bist.
3. Just begin again. Nicht ab Montag, nicht ab morgen, einfach ab jetzt.
4. Du hast {tage} Tage bewiesen, dass du es kannst. Das war kein Zufall, und es ist nicht vorbei.
5. Sei heute freundlich zu dir. Mit dir selbst zu schimpfen macht den nächsten Schritt nur schwerer.
6. Was war heute anders als sonst? Wenn du's weißt, bist du beim nächsten Mal vorbereitet.

### Hilfe-Seite
- Rauchfrei-Telefon des Bundesinstituts für Öffentliche Gesundheit (BIÖG): **0800 8 31 31 31**, kostenlos
  Mo–Do 10–22 Uhr, Fr–So 10–18 Uhr
- Online-Programm: https://www.rauchfrei-info.de
- Hinweis: Die App ersetzt keine ärztliche oder therapeutische Beratung.
- Quelle für Nummer und Zeiten: BIÖG-Themendossier Rauchstopp 2025. Vor Veröffentlichung noch einmal auf rauchfrei-info.de gegenprüfen.

---

## 5. Entwicklungsphasen

Jede Phase endet mit lauffähigem Stand, grünen Tests und einem Eintrag in `PROGRESS.md`.

### Phase 0 – Gerüst und Deployment
- Vite + TypeScript, ESLint, Prettier, Vitest einrichten
- `vite-plugin-pwa` mit Manifest (Name, Icons, `display: standalone`, Theme-Farbe)
- GitHub Actions: Build und Deploy auf GitHub Pages bei Push auf `main`
- `base`-Pfad in `vite.config.ts` auf den Repo-Namen setzen
- **Fertig, wenn:** eine leere Seite unter der GitHub-Pages-Adresse erreichbar ist, sich auf dem iPhone zum Home-Bildschirm hinzufügen lässt und offline startet.

### Phase 1 – Datenmodell und Speicher
- `schema.ts`, `store.ts` mit Präfix `rauchfrei:v1:`, `migrations.ts` mit Grundgerüst für spätere Versionen
- Validierung beim Laden. Kaputte Daten führen nicht zum Absturz, sondern zu einer Fehlermeldung mit Hinweis auf die Sicherung.
- `navigator.storage.persist()` anfragen
- **Fertig, wenn:** Speichern, Laden, Validieren und eine Test-Migration per Unit-Test abgedeckt sind.

### Phase 2 – Kernlogik
- `dates.ts`, `savings.ts`, `slips.ts`, `rewards.ts` als reine Funktionen
- Tests für: Monatswechsel, Schaltjahr, Sommerzeitwechsel, Start heute, Start in der Zukunft (nicht erlaubt), mehrere Ausrutscher am selben Tag, Neustart, Ersparnis ohne Angaben
- **Fertig, wenn:** alle Regeln aus Abschnitt 3 als Tests vorliegen und grün sind.

### Phase 3 – Onboarding und Startseite
- Erststart: Startdatum (Datumsfeld, Standard heute, nicht in der Zukunft), optional Ersparnis-Angaben
- Startseite: große Tageszahl, Ersparnis, nicht gerauchte Zigaretten, Knopf „Ausrutscher melden“
- Home-Bildschirm-Hinweis
- Einstellungen: Ersparnis-Angaben ändern, Startdatum korrigieren
- **Fertig, wenn:** man auf dem iPhone die App einrichten kann und die Zahlen stimmen.

### Phase 4 – Ausrutscher und Neustart
- Ablauf laut Abschnitt 3: Auswahl Ausrutscher oder Neustart, Rückmeldung, optional Auslöser
- Historie der Versuche mit „längster Versuch“
- Hinweise bei wiederholtem Auslöser und bei häufigen Ausrutschern
- **Fertig, wenn:** beide Wege funktionieren, die Rückmeldungen erscheinen und die Zählung korrekt bleibt.

### Phase 5 – Belohnungen und Inhalte
- Texte aus Abschnitt 4 in die JSON-Dateien übernehmen
- Anzeige fälliger Belohnungen beim Öffnen, Schatzkästchen
- Gesundheitsfakten mit Quellenangabe
- Kleine Animation beim Meilenstein (dezent, mit `prefers-reduced-motion` abschaltbar)
- **Fertig, wenn:** sich mit einem vordatierten Startdatum alle Belohnungsarten auslösen lassen und keine doppelt kommt.

### Phase 6 – Sicherung und Wiederherstellung
- Export: Code und QR-Code anzeigen, Code kopieren
- Import: Code einfügen oder QR-Code per Kamera scannen, Vorschau, Bestätigung
- Hinweistext zum iPhone-Speicher (Wiederherstellung in der installierten App)
- **Fertig, wenn:** Export auf Handy A und Import auf Handy B denselben Stand ergeben (manuell getestet und als E2E-Test im Browser).

### Phase 7 – Feinschliff
- Hilfe-Seite (Abschnitt 4) und Datenschutz-Seite: Daten bleiben auf dem Gerät, keine Cookies, kein Tracking
- Dark Mode, große Schrift funktioniert, Bedienbarkeit mit VoiceOver
- Lighthouse: PWA installierbar, Barrierefreiheit mindestens 95
- **Fertig, wenn:** alle Prüfpunkte erfüllt sind.

### Phase 8 – Testlauf
- Freundin und ein bis zwei weitere Personen nutzen die App eine Woche
- Rückmeldungen sammeln, Texte nachschärfen
- **Fertig, wenn:** die Rückmeldungen eingearbeitet sind und die Nutzerin Version 1 abgenommen hat.

### Phase 9 – Optional: Umzug zu Netlify
- Nur auf ausdrückliche Entscheidung der Nutzerin
- Neue Adresse = neuer Browserspeicher. Die alte Version zeigt einen Umzugshinweis mit Anleitung: Sicherungscode erzeugen → neue App installieren → dort wiederherstellen.
- Die alte Adresse bleibt mindestens 3 Monate mit diesem Hinweis online.
- Wenn möglich gleich eine eigene Domain nutzen, dann bleibt die Adresse bei künftigen Umzügen gleich.

### Phase 10 – Optional: Sync über Netlify
- Voraussetzung: Phase 9
- Zufälliger Sync-Schlüssel pro Person, Daten im Browser verschlüsselt (Web Crypto, AES-GCM, Schlüssel aus dem Sync-Schlüssel abgeleitet)
- Eine Netlify Function speichert und liefert verschlüsselte Daten über Netlify Blobs. Der Server sieht nie Klartext.
- Vorher: Kosten und Kontingent von Blobs im Konto der Nutzerin prüfen und im Entscheidungslog festhalten
- Missbrauchsschutz: Größenlimit pro Eintrag, Ratenbegrenzung pro IP

---

## 6. Risiken

| Risiko | Gegenmaßnahme |
|---|---|
| Daten gehen verloren (Safari-Löschung, Handywechsel) | Home-Bildschirm-Hinweis, `storage.persist()`, Sicherungscode |
| Umzug auf neue Adresse verliert Daten | Umzug nur per Sicherungscode, alte Adresse bleibt mit Hinweis online |
| Andere Projekte unter `github.io` überschreiben Daten | Präfix `rauchfrei:v1:` für alle Schlüssel |
| Ausrutscher-Rückmeldung wirkt herablassend | Texte im Testlauf prüfen, Ton-Regeln in `CLAUDE.md` |
| Falsche Gesundheitsaussagen | Nur WHO-Fakten mit Quelle, keine weiteren ohne seriöse Quelle |
| Hotline-Nummer veraltet | Vor Veröffentlichung gegenprüfen, Quelle mit Datum im Code |
