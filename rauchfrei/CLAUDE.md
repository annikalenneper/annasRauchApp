# CLAUDE.md – Arbeitsanweisungen für Rauchfrei

Kleines Projekt für eine Person. Ziel: zügig fertig werden, ohne die Nutzerin oft zu unterbrechen.

## Arbeitsweise
- **Selbstständig arbeiten.** Entscheidungen innerhalb des Plans selbst treffen und mit einem Satz im Entscheidungslog in `PROGRESS.md` festhalten.
- **Nur nachfragen, wenn** etwas nicht rückgängig zu machen ist, Konten oder Zugänge der Nutzerin gebraucht werden (GitHub-Repo, Pages aktivieren) oder sich der Plan selbst widerspricht.
- **Nicht raten:** Unklares in der offiziellen Doku nachsehen.
- **Keine Zwischenberichte.** Die Nutzerin hört erst am Ende von Etappe 2 wieder von dir, mit Link und Testanleitung.
- Am Ende jeder Sitzung `PROGRESS.md` aktualisieren (abhaken, ein Satz ins Protokoll), damit eine neue Sitzung nahtlos weitermachen kann.
- Bei Arbeit an Oberflächen: `design/DESIGN.md` und das passende Mockup in `design/mockups/` ansehen.

## Prinzipien
- `src/core/` ist reine Logik: kein DOM, kein `localStorage`, kein `Date.now()`. Das heutige Datum kommt als Parameter.
- Nur `src/storage/` greift auf `localStorage` zu, alle Schlüssel mit Präfix `rauchfrei:v1:`.
- Datumsrechnung ausschließlich mit `YYYY-MM-DD`-Werten.
- Texte für die Nutzerin kommen aus `src/content/*.json`, nicht fest aus dem Code.
- Jede Änderung am Datenmodell bekommt eine neue `schemaVersion` und eine Migration.
- Keine Anfragen an fremde Server zur Laufzeit, keine Cookies, kein Tracking. Schriften selbst ausliefern (z. B. Fontsource), nie von Google Fonts laden.
- Import-Codes streng validieren. Freitext nie als HTML rendern.
- Farben, Schriften und Abstände nur aus `design/DESIGN.md` (als CSS-Variablen). Die Mockups sind Vorlage für Aufbau und Wirkung, kein Code zum Kopieren.

## Ton der Texte
- Die App ist **nur für Anna**. Sie darf persönlich angesprochen werden, mit Namen und auch mal mit „Maus“.
- **Gern humorvoll, mit einer Prise Boss-Bitch-Humor:** selbstbewusst, augenzwinkernd, feiert ihre Stärke (Richtung „Du bist hier der Boss, nicht die Kippe.“). **Nicht übertreiben:** höchstens etwa jeder dritte Text mit dieser Attitüde, der Rest warm und schlicht. Kein Cringe, keine Dauer-Ausrufezeichen.
- **Bei Ausrutschern** zuerst Wärme, Humor nur ganz leicht und nie auf ihre Kosten. Nie „gescheitert“, „versagt“, „leider“ oder „wieder bei null“. Die App schlägt nie von sich aus einen Neustart vor.
- Gesundheitsaussagen nur nach WHO oder BIÖG, mit Quellenangabe. Keine fremden Bilder oder Memes.

## Qualität
Bevor eine Etappe als fertig gilt:
- `npm run lint`, `npm run typecheck`, `npm test` und `npm run build` laufen fehlerfrei.
- Unit-Tests decken `src/core/` und `src/storage/` mit den Grenzfällen aus dem Plan ab. Eine Abdeckungsquote gibt es nicht.
- Kurzer Selbstcheck ohne die Nutzerin: Prinzipien eingehalten, keine externen Anfragen, kein toter Code. Ergebnis als eine Zeile in `PROGRESS.md`.

## Code-Stil
TypeScript `strict`, kurze Funktionen, Bezeichner auf Englisch, alle Texte für Anna auf Deutsch.
