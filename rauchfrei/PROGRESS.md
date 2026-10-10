# PROGRESS.md – Rauchfrei

**Aktuelle Phase:** 2 – Kernlogik
**Letzte Aktualisierung:** 10.10.2026
**Status:** Phase 0 und 1 abgeschlossen. Phase 1 ist lokal committet, noch nicht gepusht. Nächster Schritt: Phase 2

---

## Phasenübersicht

| Phase | Inhalt | Status | Phasen-Check |
|---|---|---|---|
| 0 | Gerüst und Deployment | ✅ fertig | bestanden, 10.10.2026 |
| 1 | Datenmodell und Speicher | ✅ fertig | bestanden, 10.10.2026 |
| 2 | Kernlogik | ⬜ offen | – |
| 3 | Onboarding und Startseite | ⬜ offen | – |
| 4 | Ausrutscher und Neustart | ⬜ offen | – |
| 5 | Belohnungen und Inhalte | ⬜ offen | – |
| 6 | Sicherung und Wiederherstellung | ⬜ offen | – |
| 7 | Feinschliff | ⬜ offen | – |
| 8 | Testlauf | ⬜ offen | – |
| 9 | Umzug zu Netlify (optional) | ⏸ wartet auf Entscheidung | – |
| 10 | Sync über Netlify (optional) | ⏸ wartet auf Entscheidung | – |

Legende: ⬜ offen · 🔄 in Arbeit · ✅ fertig · ⏸ pausiert · ❌ verworfen

---

## Aufgaben der aktuellen Phase

### Phase 1 – Datenmodell und Speicher
- [x] `schema.ts`: Datentypen, Version, strenge Validierung
- [x] `migrations.ts`: Grundgerüst, Test-Migration
- [x] `store.ts`: Laden/Speichern unter `rauchfrei:v1:state`
- [x] Kaputte Daten: Fehlermeldung statt Absturz, mit Hinweis auf die Sicherung
- [x] `navigator.storage.persist()` anfragen
- [x] Testabdeckung `src/core/` und `src/storage/` mindestens 90 %, im Testlauf erzwungen
- [x] Phasen-Check

### Phase 0 – Gerüst und Deployment (abgeschlossen)
- [x] Repo-Name mit der Nutzerin abstimmen (bestimmt die GitHub-Pages-Adresse) – bleibt `annasRauchApp`, siehe E11
- [x] Vite + TypeScript, ESLint, Prettier, Vitest
- [x] npm-Skripte: `lint`, `typecheck`, `test`, `build`
- [x] `vite-plugin-pwa` mit Manifest und Platzhalter-Icons
- [x] GitHub-Actions-Workflow für GitHub Pages
- [x] Erster Push auf `main`, in den Repo-Einstellungen Pages-Quelle auf „GitHub Actions“ stellen, Deployment prüfen
- [x] Architekturtest-Gerüst
- [x] Test auf dem iPhone: Home-Bildschirm, offline starten
- [x] Phasen-Check

---

## Entscheidungslog

| Nr. | Datum | Entscheidung | Begründung |
|---|---|---|---|
| E1 | 10.10.2026 | Web-App (PWA) statt App Store | Kostenlos, keine Apple-Prüfung, über Link teilbar |
| E2 | 10.10.2026 | Keine Konten, alle Nutzerdaten lokal auf dem Gerät | Kein Server nötig, keine Gesundheitsdaten in der Cloud, dauerhaft kostenlos |
| E3 | 10.10.2026 | Hosting zuerst auf GitHub Pages, späterer Umzug zu Netlify möglich | Einfacher Start. Umzug per Sicherungscode, weil neue Adresse neuen Speicher bedeutet |
| E4 | 10.10.2026 | Ersparnis (Euro, nicht gerauchte Zigaretten) ist Teil von Version 1 | Wunsch der Nutzerin |
| E5 | 10.10.2026 | Ausrutscher setzen den Zähler nicht zurück. Die Person wählt selbst zwischen Ausrutscher und Neustart | Abstinenzverletzungseffekt vermeiden |
| E6 | 10.10.2026 | Sicherung per Code und QR-Code in Version 1, Sync erst optional in Phase 10 | Wenig Aufwand, kein Server, kein Datenschutzproblem |
| E7 | 10.10.2026 | Kein Sync über GitHub-App-Tokens | Braucht trotzdem einen Server, Tokens nicht pro Person eingrenzbar, Daten Dritter im eigenen Account |
| E8 | 10.10.2026 | Gesundheitsfakten nur nach WHO, Hotline nach BIÖG | Seriöse Quellen, keine eigenen medizinischen Aussagen |
| E9 | 10.10.2026 | Keine fremden Memes oder Bilder | Bildrechte |
| E10 | 10.10.2026 | Netlify-Konto der Nutzerin stammt von vor Sept. 2025 (altes Modell: 100 GB Bandbreite, 300 Build-Minuten) | Relevant für Phase 9 und 10 |
| E11 | 10.10.2026 | `base` = `/annasRauchApp/`, Adresse wird https://annikalenneper.github.io/annasRauchApp/. App-Name im Manifest: „Rauchfrei“ | Das Repo existiert bereits unter diesem Namen. Von der Nutzerin am 10.10.2026 freigegeben („ist egal“). Ändern ist vor dem Testlauf eine Zeile in `vite.config.ts`, danach bedeutet eine neue Adresse neuen Speicher |
| E12 | 10.10.2026 | Die App liegt im Unterordner `rauchfrei/` des Repos, der Workflow im Repo-Wurzelverzeichnis (`.github/workflows/deploy.yml`) mit `working-directory: rauchfrei` | Vorgabe aus der Startdatei. GitHub liest Workflows nur aus dem Wurzelverzeichnis |
| E13 | 10.10.2026 | TypeScript 6.0.x statt 7.x | `typescript-eslint` 8.71 verlangt `typescript <6.1.0` (Quelle: peerDependencies auf npm, geprüft am 10.10.2026) |
| E14 | 10.10.2026 | Zusätzliche Entwicklungs-Abhängigkeiten: `@eslint/js` und `typescript-eslint` | Regelsätze, damit ESLint TypeScript prüfen kann. Nur für die Entwicklung, 0 KB im ausgelieferten Bundle |
| E15 | 10.10.2026 | Platzhalter-Icons (grüne Fläche, heller Ring) selbst per Skript erzeugt, 192/512/maskable 512/apple-touch 180 | Keine fremden Bilder (E9). Werden in Phase 7 durch das endgültige Icon ersetzt |
| E16 | 10.10.2026 | Neue Entwicklungs-Abhängigkeit `@vitest/coverage-v8`. `npm test` läuft immer mit Abdeckungsmessung und bricht unter 90 % für `src/core/` und `src/storage/` ab | Die 90-%-Regel aus `CLAUDE.md` wird so lokal und im Deployment erzwungen. Nur für die Entwicklung, 0 KB im Bundle |
| E17 | 10.10.2026 | `createdAt` wird als lokales Datum `YYYY-MM-DD` gespeichert | Der Plan sagt nur „ISO-Datum“. So gilt die Regel „nie mit Uhrzeiten“ für alle Datumsfelder |
| E18 | 10.10.2026 | Die Validierung lehnt unbekannte Felder ab und gibt nur einen neu aufgebauten Zustand zurück | „Ungültige Daten werden abgelehnt, nie teilweise übernommen“ (`CLAUDE.md`). Neue Felder kommen nur über eine neue Schema-Version |
| E19 | 10.10.2026 | `isIsoDate` liegt schon jetzt in `src/core/dates.ts`, obwohl die Datei zu Phase 2 gehört | Die Validierung braucht die Datumsprüfung. So gibt es sie nur einmal |
| E20 | 10.10.2026 | Speicherfunktionen bekommen den Speicher als Parameter (Standard: `localStorage`) | Tests laufen mit einem nachgebauten Speicher, ohne Browser-Umgebung und ohne zusätzliche Abhängigkeit |

---

## Offene Fragen
- [x] Phase 0: Name des Repos bzw. der App – Nutzerin am 10.10.2026: ist egal, also bleibt `annasRauchApp` / „Rauchfrei“ (E11)
- [ ] Phase 7: Endgültiges App-Icon (E15)
- [ ] Phase 7: iOS-Systemhinweis „Flugmodus ausschalten“ beim Offline-Start – vermeidbar? (siehe Phasen-Check 0)
- [ ] Phase 3: Fehlermeldung bei kaputten Daten im Browser prüfen (Smoke-Test)
- [ ] Phase 6: Die Meldung bei kaputten Daten verweist auf den Sicherungscode. Den Weg zur Wiederherstellung dort anbinden
- [ ] Phase 5: Möchte die Nutzerin eigene Sprüche ergänzen?
- [ ] Phase 7: Hotline-Nummer und Zeiten vor Veröffentlichung auf rauchfrei-info.de gegenprüfen
- [ ] Nach Phase 8: Umzug zu Netlify (Phase 9) und Sync (Phase 10) gewünscht?

---

## Phasen-Checks

_Vorlage:_

```
### Phase X – <Name> – <Datum>
1. „Fertig, wenn“ erfüllt:                 Ja/Nein – …
2. Qualitätsprüfungen grün:                 Ja/Nein – …
3. core/ frei von DOM, Speicher, Date.now:  Ja/Nein – …
4. Keine externen Laufzeit-Anfragen:        Ja/Nein – …
5. Ton-Regeln eingehalten:                  Ja/Nein – …
6. Schema-Änderung mit Migration und Test:  Ja/Nein/entfällt – …
7. Abweichungen dokumentiert:               Ja/Nein – …
8. Toter Code entfernt:                     Ja/Nein – …
Ergebnis: bestanden / nicht bestanden
```

### Phase 0 – Gerüst und Deployment – 10.10.2026
1. „Fertig, wenn“ erfüllt:                 Ja – Seite ist unter der GitHub-Pages-Adresse erreichbar. Nutzerin hat sie auf dem iPhone zum Home-Bildschirm hinzugefügt und im Flugmodus gestartet, die App erschien normal.
2. Qualitätsprüfungen grün:                 Ja – lint, typecheck, test, build lokal und im GitHub-Actions-Lauf.
3. core/ frei von DOM, Speicher, Date.now:  Ja – Architekturtest grün (`src/core/` ist noch leer).
4. Keine externen Laufzeit-Anfragen:        Ja – Build nach fremden Adressen durchsucht, einzige Fundstelle ist ein Hinweistext in Workbox, kein Abruf. Der Netzwerk-Tab im Browser wurde nicht eigens angesehen.
5. Ton-Regeln eingehalten:                  Ja – einziger Text ist die Manifest-Beschreibung.
6. Schema-Änderung mit Migration und Test:  entfällt – noch kein Schema.
7. Abweichungen dokumentiert:               Ja – E11 bis E15.
8. Toter Code entfernt:                     Ja – keiner vorhanden.
Ergebnis: bestanden

Beobachtung beim iPhone-Test: Im Flugmodus zeigt iOS den Systemhinweis „Flugmodus ausschalten …“. Auslöser ist die Update-Prüfung des Service Workers beim Start (Anfrage an die eigene Adresse). Die App läuft trotzdem aus dem Cache. In Phase 7 prüfen, ob sich der Hinweis vermeiden lässt.

### Phase 1 – Datenmodell und Speicher – 10.10.2026
1. „Fertig, wenn“ erfüllt:                 Ja – Speichern, Laden, Validieren und eine Test-Migration (zwei Schritte, v1 → v3) sind per Unit-Test abgedeckt.
2. Qualitätsprüfungen grün:                 Ja – lint, typecheck, test (84 Tests), build. Abdeckung `src/core/` + `src/storage/`: 99 % Anweisungen, 98 % Zweige.
3. core/ frei von DOM, Speicher, Date.now:  Ja – Architekturtest grün. Er prüft jetzt zusätzlich, dass nur `src/storage/` auf den Browserspeicher zugreift.
4. Keine externen Laufzeit-Anfragen:        Ja – Build nach fremden Adressen durchsucht, weiterhin nur der Hinweistext in Workbox.
5. Ton-Regeln eingehalten:                  Ja – zwei neue Meldungen (Daten nicht lesbar, Speichern blockiert): Du-Form, kein Vorwurf.
6. Schema-Änderung mit Migration und Test:  entfällt – Version 1 ist das erste Schema.
7. Abweichungen dokumentiert:               Ja – E16 bis E20.
8. Toter Code entfernt:                     Ja – keiner vorhanden.
Ergebnis: bestanden

Einschränkung: Die Fehlermeldung bei kaputten Daten ist nur über die Speicherlogik getestet, nicht im Browser angesehen. Das kommt in Phase 3 in den Smoke-Test.

---

## Sitzungsprotokoll

### 10.10.2026 – Planung
- Konzept mit der Nutzerin abgestimmt: Web-App ohne Konto, Ersparnis, Sprüche-Grundstock, Ausrutscher-Konzept, QR-Sicherung.
- Sync-Varianten bewertet (Sicherungscode, Netlify Function + Blobs, GitHub App). Entscheidung E6/E7.
- Nächster Schritt: Phase 0.

### 10.10.2026 – Phase 0, Gerüst
- Projektdateien aus der Startdatei angelegt.
- Vite 8, TypeScript 6, ESLint 10, Prettier, Vitest 5, `vite-plugin-pwa` 2 eingerichtet. Manifest, Service Worker (Precache aller Dateien inkl. Icons), Platzhalter-Icons.
- Architekturtest prüft `src/core/` auf DOM, Speicher und aktuelle Zeit (aktuell noch leer) und testet seine eigene Erkennung.
- `lint`, `typecheck`, `test`, `build` grün. Bundle: 0,4 KB JS + 0,3 KB CSS (gzip), dazu Workbox-Service-Worker.
- Build lokal über `vite preview` ausgeliefert: Seite, Manifest, Service Worker und Icons unter `/annasRauchApp/` erreichbar. Keine externen Adressen im Build.
- Noch nicht geprüft: Deployment auf GitHub Pages (noch nichts gepusht), Installation und Offline-Start auf dem iPhone.
- Nächster Schritt: Repo-Name bestätigen, pushen, Pages aktivieren, iPhone-Test, Phasen-Check.

### 10.10.2026 – Phase 0, Deployment
- Commit `58aecc2` auf `main` gepusht. Erster Lauf scheiterte an `configure-pages`, weil Pages im Repo noch nicht aktiviert war. Nutzerin hat die Quelle auf „GitHub Actions“ gestellt, der Lauf ist danach grün.
- Geprüft per Abruf: Seite, Service Worker, Manifest und alle vier Icons antworten unter https://annikalenneper.github.io/annasRauchApp/ mit 200, alle Pfade im HTML tragen das Präfix `/annasRauchApp/`.
- Noch offen: Test auf dem iPhone (Home-Bildschirm, Offline-Start), danach Phasen-Check.

### 10.10.2026 – Phase 0 abgeschlossen, Phase 1
- iPhone-Test durch die Nutzerin bestanden (Home-Bildschirm, Start im Flugmodus). Phasen-Check 0 eingetragen.
- `schema.ts`: Typen laut Plan, strenge Validierung mit Angabe des fehlerhaften Felds.
- `migrations.ts`: schrittweises Hochziehen alter Stände. Die Liste ist noch leer, weil es nur Version 1 gibt.
- `store.ts`: Laden und Speichern unter `rauchfrei:v1:state`. Laden wirft nie und verändert nichts. Ungültige Zustände werden nicht gespeichert.
- `main.ts` lädt beim Start den Zustand, zeigt bei kaputten Daten oder blockiertem Speicher eine Meldung und fragt `navigator.storage.persist()` an.
- `npm test` misst jetzt immer die Abdeckung und bricht unter 90 % ab.
- Nächster Schritt: Phase 2 (Kernlogik).
