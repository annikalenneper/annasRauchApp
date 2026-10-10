# CLAUDE.md – Arbeitsanweisungen für Rauchfrei

## Zu Beginn jeder Sitzung
1. `PROGRESS.md` lesen: aktuelle Phase, offene Punkte, Entscheidungen.
2. Den Abschnitt der aktuellen Phase in `IMPLEMENTIERUNGSPLAN.md` lesen.
3. `npm run lint`, `npm run typecheck` und `npm test` ausführen. Ist etwas rot, zuerst reparieren.

## Am Ende jeder Sitzung
1. Alle Qualitätsprüfungen ausführen.
2. `PROGRESS.md` aktualisieren: Aufgaben abhaken, Sitzungseintrag, offene Fragen.
3. Neue Entscheidungen ins Entscheidungslog.

---

## Arbeitsweise
- **Eine Phase nach der anderen.** Phase N+1 erst, wenn die „Fertig, wenn“-Bedingung von Phase N erfüllt ist.
- **Kleine Schritte**, jeder für sich lauffähig.
- **Tests zuerst** für alles in `src/core/` und `src/storage/`.
- **Nicht raten.** Unklares in offizieller Doku nachsehen, Quelle ins Entscheidungslog. Sonst als offene Frage notieren und nachfragen.
- **Abweichungen vom Plan** erst ins Entscheidungslog, dann umsetzen.
- **Optionale Phasen (9, 10)** nur nach ausdrücklicher Freigabe der Nutzerin.

---

## Prinzipien

### Architektur
1. `src/core/` ist reine Logik: kein DOM, kein `localStorage`, kein `Date.now()` direkt. Das heutige Datum wird als Parameter übergeben. Per Test geprüft (`tests/unit/architecture.test.ts`).
2. Nur `src/storage/` greift auf `localStorage` zu.
3. Alle Datumsrechnungen mit `YYYY-MM-DD`-Werten, nie mit Uhrzeiten.
4. Inhalte nur aus `src/content/*.json`, keine Texte fest im Code (außer Bedienelemente).
5. Jede Änderung am Datenmodell erhöht `schemaVersion` und bringt eine Migration mit Test mit.

### Datenschutz und Sicherheit (nicht verhandelbar)
- Keine Anfragen an fremde Server zur Laufzeit. Keine CDNs, keine externen Fonts, kein Analytics.
- Keine Cookies.
- Alle Speicherschlüssel mit Präfix `rauchfrei:v1:`.
- Der Import validiert jeden Code streng. Ungültige Daten werden abgelehnt, nie teilweise übernommen.
- Freitext-Notizen werden nie als HTML gerendert (`textContent`, nie `innerHTML`).

### Ton und Inhalte
- Du-Form, warm, locker, nie belehrend, kein Schuldgefühl.
- Bei Ausrutschern nie Wörter wie „gescheitert“, „versagt“, „leider“, „wieder bei null“.
- Die App schlägt nie von sich aus einen Neustart vor.
- Gesundheitsaussagen nur mit seriöser Quelle (WHO, BIÖG) und Quellenangabe in der App.
- Keine fremden Bilder oder Memes.

---

## Qualitätsprüfungen

Vor jedem Abhaken müssen grün sein:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Zusätzlich:
- Testabdeckung `src/core/` und `src/storage/` mindestens 90 %
- Neue Abhängigkeiten nur mit Eintrag im Entscheidungslog (Name, Zweck, Größe, warum nötig)
- Bundle-Größe im Blick: Ziel unter 150 KB (gzip) ohne Icons

---

## Phasen-Check

Am Ende jeder Phase in `PROGRESS.md` mit Ja/Nein und kurzer Begründung beantworten:

1. Sind alle „Fertig, wenn“-Bedingungen erfüllt?
2. Laufen alle Qualitätsprüfungen grün?
3. Ist `src/core/` frei von DOM, Speicher und `Date.now()`? (Architekturtest grün)
4. Gibt es keine externen Laufzeit-Anfragen? (Netzwerk-Tab im Build geprüft)
5. Halten alle neuen Texte die Ton-Regeln ein?
6. Gab es Schema-Änderungen, und wenn ja, mit Migration und Test?
7. Sind Abweichungen vom Plan dokumentiert?
8. Gibt es toten Code? Wenn ja, entfernen.

Ist eine Antwort „Nein“, ist die Phase nicht fertig.

---

## Code-Stil
- TypeScript `strict`
- Funktionen kurz, eine Aufgabe, ab ca. 40 Zeilen aufteilen
- Bezeichner im Code Englisch, alle Texte für Nutzer Deutsch
- Keine auskommentierten Code-Blöcke
