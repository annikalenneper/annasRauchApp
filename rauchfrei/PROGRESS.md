# PROGRESS.md – Rauchfrei

**Aktuelle Phase:** 0 – Gerüst und Deployment
**Letzte Aktualisierung:** 10.10.2026
**Status:** Gerüst steht lokal und ist grün. Offen: Repo-Name bestätigen, erster Push/Deployment, iPhone-Test

---

## Phasenübersicht

| Phase | Inhalt | Status | Phasen-Check |
|---|---|---|---|
| 0 | Gerüst und Deployment | 🔄 in Arbeit | – |
| 1 | Datenmodell und Speicher | ⬜ offen | – |
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

### Phase 0 – Gerüst und Deployment
- [x] Repo-Name mit der Nutzerin abstimmen (bestimmt die GitHub-Pages-Adresse) – bleibt `annasRauchApp`, siehe E11
- [x] Vite + TypeScript, ESLint, Prettier, Vitest
- [x] npm-Skripte: `lint`, `typecheck`, `test`, `build`
- [x] `vite-plugin-pwa` mit Manifest und Platzhalter-Icons
- [x] GitHub-Actions-Workflow für GitHub Pages (geschrieben, noch nicht gelaufen)
- [ ] Erster Push auf `main`, in den Repo-Einstellungen Pages-Quelle auf „GitHub Actions“ stellen, Deployment prüfen
- [x] Architekturtest-Gerüst
- [ ] Test auf dem iPhone: Home-Bildschirm, offline starten
- [ ] Phasen-Check

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

---

## Offene Fragen
- [x] Phase 0: Name des Repos bzw. der App – Nutzerin am 10.10.2026: ist egal, also bleibt `annasRauchApp` / „Rauchfrei“ (E11)
- [ ] Phase 7: Endgültiges App-Icon (E15)
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
