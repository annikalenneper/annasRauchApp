# PROGRESS.md – Rauchfrei

**Aktuelle Etappe:** 3 – Abnahme
**Letzte Aktualisierung:** 10.10.2026
**Status:** Etappe 1 und 2 fertig, App ist online: https://annikalenneper.github.io/annasRauchApp/ – wartet auf Test durch die Nutzerin und Anna

---

## Etappen

| Etappe | Inhalt | Status | Selbstcheck |
|---|---|---|---|
| 1 | Fundament: Gerüst, Deployment, Datenmodell, Kernlogik | ✅ fertig | bestanden |
| 2 | Die App: alle Screens, Inhalte, Feinschliff | ✅ fertig | bestanden |
| 3 | Abnahme durch die Nutzerin und Anna | 🔄 in Arbeit | – |
| – | Später: Umzug zu Netlify, Sync | ⏸ nur auf Wunsch | – |

Legende: ⬜ offen · 🔄 in Arbeit · ✅ fertig · ⏸ pausiert

---

## Aufgaben Etappe 1
- [x] Vite + TypeScript, ESLint, Prettier, Vitest, npm-Skripte `lint`, `typecheck`, `test`, `build`
- [x] `vite-plugin-pwa` mit Manifest und Platzhalter-Icons
- [x] GitHub-Actions-Workflow für GitHub Pages (Repo bleibt `annasRauchApp`, siehe E14)
- [x] Datenmodell, Speicher, Migrations-Gerüst
- [x] Kernlogik mit Unit-Tests für alle Grenzfälle
- [x] Selbstcheck

## Aufgaben Etappe 2
- [x] Design-Tokens als CSS-Variablen, Schriften lokal
- [x] Erster Start und Startseite
- [x] Ausrutscher, Neustart, Rückmeldung mit Auslöser
- [x] Belohnungen und Schatzkästchen
- [x] Sicherung und Wiederherstellung, Hilfe-Bereich (Hotline selbst gegenprüfen)
- [x] Inhalte im Anna-Ton fertigstellen
- [x] Home-Bildschirm-Hinweis, Dark Mode, reduzierte Bewegung, große Schrift
- [x] Selbstcheck
- [x] Nutzerin benachrichtigen: Link und Testanleitung

---

## Aufgaben Etappe 3
- [ ] Nutzerin testet auf dem iPhone: Home-Bildschirm, Startdatum vordatieren, Sicherung, QR-Scan mit der Kamera
- [ ] Anna testet, Rückmeldungen einarbeiten
- [ ] Endgültiges App-Icon (bisher Platzhalter: korallroter Grund, heller Ring)

---

## Entscheidungslog

| Nr. | Datum | Entscheidung | Begründung |
|---|---|---|---|
| E1 | 10.10.2026 | Web-App (PWA) statt App Store | Kostenlos, keine Apple-Prüfung, über Link erreichbar |
| E2 | 10.10.2026 | Keine Konten, alle Daten lokal auf dem Gerät | Kein Server, keine Gesundheitsdaten in der Cloud, dauerhaft kostenlos |
| E3 | 10.10.2026 | Hosting auf GitHub Pages, späterer Umzug zu Netlify möglich | Einfacher Start. Umzug per Sicherungscode, weil neue Adresse neuen Speicher bedeutet |
| E4 | 10.10.2026 | Ersparnis (Euro, nicht gerauchte Zigaretten) gehört dazu | Wunsch der Nutzerin |
| E5 | 10.10.2026 | Ausrutscher setzen den Zähler nicht zurück, Anna wählt selbst zwischen Ausrutscher und Neustart | Abstinenzverletzungseffekt vermeiden |
| E6 | 10.10.2026 | Sicherung per Code und QR-Code, Sync nur später auf Wunsch | Wenig Aufwand, kein Server |
| E7 | 10.10.2026 | Kein Sync über GitHub-App-Tokens | Braucht trotzdem einen Server, Tokens nicht pro Person eingrenzbar |
| E8 | 10.10.2026 | Gesundheitsfakten nur nach WHO, Hotline nach BIÖG | Seriöse Quellen |
| E9 | 10.10.2026 | Keine fremden Memes oder Bilder | Bildrechte |
| E10 | 10.10.2026 | Netlify-Konto der Nutzerin stammt von vor Sept. 2025 (altes Modell: 100 GB Bandbreite, 300 Build-Minuten) | Relevant für einen späteren Umzug |
| E11 | 10.10.2026 | Design laut `design/DESIGN.md` und sechs Mockups aus dem Design-Canvas der Nutzerin | Abgestimmte Gestaltung |
| E12 | 10.10.2026 | Die App ist nur für Anna, persönliche Anrede und Boss-Bitch-Humor in Maßen erwünscht | Wunsch der Nutzerin |
| E13 | 10.10.2026 | Drei Etappen statt elf Phasen, Claude arbeitet selbstständig bis Ende Etappe 2 | Nutzerin will möglichst selten eingreifen |
| E14 | 10.10.2026 | Das Repo bleibt `annasRauchApp` (Plan: `rauchfrei`), Adresse https://annikalenneper.github.io/annasRauchApp/ | Repo und Pages liefen schon vor dem überarbeiteten Plan, die Nutzerin nannte den Namen „egal“. Umbenennen braucht ihren GitHub-Zugang und ändert die Adresse, also nur bevor Anna die App nutzt |
| E15 | 10.10.2026 | TypeScript 6.0 statt 7 | `typescript-eslint` 8.71 verlangt `typescript <6.1.0` |
| E16 | 10.10.2026 | `createdAt` ist ein lokales Datum `YYYY-MM-DD`. Die Validierung lehnt unbekannte Felder ab | Keine Uhrzeiten im Datenmodell. Ungültige Daten werden nie teilweise übernommen |
| E17 | 10.10.2026 | Alle Belohnungen hängen an der Zahl der rauchfreien Tage (die große Zahl), nicht an Kalendertagen. Jahrestage = alle 365 rauchfreien Tage | Der Meilenstein „150“ kommt genau dann, wenn 150 auf der Startseite steht. Ein Ausrutscher löst nichts doppelt aus |
| E18 | 10.10.2026 | Sind viele Belohnungen auf einmal fällig (vordatierter Start), zeigt die App die jeweils neueste pro Art (höchstens drei). Der Rest liegt direkt im Schatzkästchen | Plan: höchstens drei auf einmal. Sonst kämen wochenlang alte Belohnungen nach |
| E19 | 10.10.2026 | Gesundheitsfakten: „20 Minuten“ erscheint am Starttag, „12 Stunden“ an Tag 1, „2–12 Wochen“ an Tag 14, „1–9 Monate“ an Tag 30 | Die App rechnet nur mit Tagen, nie mit Uhrzeiten |
| E20 | 10.10.2026 | Belohnungs-IDs tragen die Nummer des Versuchs (`1:milestone:7`). Wird das Startdatum nach hinten korrigiert, verschwinden Belohnungen jenseits des neuen Stands | Nach einem Neustart gibt es Tag 1 wieder. Das Schatzkästchen zeigt nichts, was nicht mehr stimmt |
| E21 | 10.10.2026 | Ausrutscher werden immer für heute vermerkt. „Ich fange neu an“ fragt einmal nach, bevor der neue Versuch beginnt | Einfach halten. Ein Neustart lässt sich nicht zurücknehmen, ein Fehltipp soll ihn nicht auslösen |
| E22 | 10.10.2026 | Sicherungscode: `RF1.` + Base64url(Deflate(JSON)) über die eingebaute `CompressionStream`, ohne Kompression als `RF0.` | Keine zusätzliche Bibliothek. QR-Erzeugung (`qrcode`) und Kamera-Scan (`jsqr`) werden erst auf der Sicherungsseite nachgeladen |
| E23 | 10.10.2026 | Alle sichtbaren Texte, auch Bedienelemente, liegen in `src/content/ui.json` | Prinzip aus `CLAUDE.md` |
| E24 | 10.10.2026 | Zwei Texte aus der Vorlage ohne „gescheitert“/„Scheitern“ umformuliert (Ausrutscher-Rückmeldung 2, Hinweis auf dem Ausrutscher-Screen) | Ton-Regel in `CLAUDE.md` geht vor |
| E25 | 10.10.2026 | Zusätzliche Tokens abgeleitet: `--accent-text` (dunkel: `--accent-on-dark`), `--on-ink`, `--on-ink-muted`. Größen in `rem`, damit die Systemschrift greift (iOS über `-apple-system-body`) | Kontrast großer Zahlen im Dark Mode, Vorgabe „große Systemschrift“ |
| E26 | 10.10.2026 | Zusätzliche Screens im selben Stil: Einstellungen (Startdatum, Ersparnis, Versuche), Wiederherstellen, Schatzkästchen-Liste, Notizfeld beim Auslöser | Abschnitt 3 des Plans verlangt sie, die Mockups zeigen sie nicht |
| E27 | 10.10.2026 | Playwright-Smoke-Test läuft lokal (`npm run test:e2e`), nicht im Deployment | Hält das Deployment schnell und unabhängig vom Browser-Download |
| E28 | 10.10.2026 | Hotline geprüft auf rauchfrei-info.de/unterstuetzung/telefonberatung/: 0800 8 31 31 31, kostenfrei, Mo–Do 10–22 Uhr, Fr–So 10–18 Uhr, keine Beratung am 24.–26.12. | Vorgabe aus dem Plan |

---

## Selbstchecks
_Pro Etappe eine Zeile, z. B.: „Etappe 1 – 12.10.2026 – Prinzipien eingehalten, keine externen Anfragen, kein toter Code: bestanden“_

- Etappe 1 – 10.10.2026 – lint, typecheck, test, build grün. `src/core/` ohne DOM, Speicher und aktuelle Zeit (Architekturtest), Speicherzugriff nur in `src/storage/`, kein toter Code: bestanden
- Etappe 2 – 10.10.2026 – 172 Unit-Tests und 12 Browser-Tests grün (Abläufe aus Abschnitt 3, Dark Mode, reduzierte Bewegung, große Schrift bei 320 px, keine Anfrage an fremde Server). Nicht geprüft: echtes iPhone, QR-Scan mit der Kamera, VoiceOver: bestanden mit diesen offenen Punkten

---

## Sitzungsprotokoll

### 10.10.2026 – Planung
- Konzept, Design und Ton mit der Nutzerin abgestimmt (E1–E13).
- Nächster Schritt: Etappe 1.

### 10.10.2026 – Etappe 1 und 2
- Gerüst, Deployment, Datenmodell, Speicher, Kernlogik, alle Screens nach `design/`, Inhalte im Anna-Ton, Sicherung mit QR-Code, Hilfe-Bereich.
- Vor dem überarbeiteten Plan hatte die Nutzerin die leere App schon auf dem iPhone getestet (Home-Bildschirm, Start im Flugmodus). iOS zeigt dabei einen Systemhinweis „Flugmodus ausschalten“, die App läuft trotzdem.
- Nächster Schritt: Etappe 3, Rückmeldungen der Nutzerin und von Anna einarbeiten.
