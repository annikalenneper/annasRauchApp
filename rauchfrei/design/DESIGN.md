# DESIGN.md – Gestaltung von Rauchfrei

Quelle: Design-Canvas „Rauchfrei App“ der Nutzerin (Stand 10.10.2026). Die sechs Screens liegen als Mockups in `design/mockups/`.

## Leitidee
„Frische Luft“: hell, ruhig, freundlich. Erfolge sind warm und feiernd (Korallrot), Ausrutscher werden dunkel und ruhig aufgefangen, nie alarmierend.

## Farben

| Token | Hell | Dunkel | Verwendung |
|---|---|---|---|
| `--ground` | `#F4F6EF` | `#141C18` | Seitenhintergrund |
| `--surface` | `#FFFFFF` | `#1E2A24` | Karten |
| `--surface-soft` | `#E6ECE1` | `#2B3A32` | Hinweisboxen, Fortschritts-Hintergrund, Icon-Kreise |
| `--ink` | `#1E2A24` | `#F4F6EF` | Haupttext, dunkle Buttons, Fortschrittsbalken |
| `--muted` | `#4A6956` | `#C9D6C3` | Nebentext (Kontrast ≥ 4.5:1 auf Grund und Karte) |
| `--line` | `#DCE3D6` | `#3A4B42` | dezente Rahmen |
| `--field-border` | `#BFCBB8` | `#5B6E62` | Eingabefelder, Chips |
| `--accent` | `#C2462A` | `#C2462A` | Haupt-Button (weiße Schrift), große Zahlen |
| `--accent-soft` | `#FBE3DA` | `#3A2620` | Meilenstein-Hintergrund |
| `--accent-on-dark` | `#F2A58E` | `#F2A58E` | Akzenttext auf dunklem Grund |
| `--celebrate` | `#E8603C` | `#E8603C` | nur Deko (Konfetti), nie für Text |

Regeln:
- `#E8603C` hat zu wenig Kontrast für Text, nur für Deko verwenden.
- Weißer Text nur auf `--accent` oder `--ink`.
- Die Rückmeldung nach einem Ausrutscher ist auch im hellen Modus dunkel (`--ink` als Grund). Das ist Absicht: ruhiger Raum.

## Schrift
- **Bricolage Grotesque** (500, 700, 800) für Zahlen, Überschriften, Sprüche
- **Atkinson Hyperlegible** (400, 700) für Fließtext, Labels, Buttons
- Beide selbst ausliefern (Fontsource), nicht von Google Fonts laden.

| Rolle | Schrift | Größe | Gewicht | Sonstiges |
|---|---|---|---|---|
| Tageszähler | Bricolage | 112px | 800 | `letter-spacing: -0.04em`, Farbe `--accent` |
| Meilenstein-Zahl | Bricolage | 168px | 800 | `letter-spacing: -0.05em` |
| H1 | Bricolage | 36–40px | 800 | `line-height: 1.05–1.08`, `letter-spacing: -0.03em` |
| Spruch | Bricolage | 21–24px | 500 | `line-height: 1.3` |
| Kennzahl | Bricolage | 30px | 700 | |
| Wortmarke „rauchfrei“ | Bricolage | 22px | 700 | klein geschrieben |
| Fließtext | Atkinson | 17px | 400 | `line-height: 1.45` |
| Nebentext | Atkinson | 14–15px | 400 | Farbe `--muted` |
| Overline | Atkinson | 13–14px | 700 | Großbuchstaben, `letter-spacing: 0.08–0.1em` |

Bei vergrößerter Systemschrift muss alles umbrechen statt abgeschnitten zu werden. Die großen Zahlen dürfen mit `clamp()` mitskalieren.

## Abstände und Formen
- Seitenrand 20–24px, Abstand zwischen Blöcken 16–24px
- Radien: große Karte 28px, Karte 24px, kleine Karte/Hinweis 20px, Feld 12–14px, Buttons und Chips voll rund
- Keine Schatten, Tiefe nur über Flächenfarben

## Komponenten
- **Haupt-Button:** 56px hoch, voll rund, `--accent`, weiße Schrift 18px fett
- **Zweit-Button:** 52px, transparenter Grund, 1.5px Rahmen in `--ink`
- **Dunkler Button:** wie Haupt-Button, Grund `--ink`
- **Auswahlkarte** (Ausrutscher/Neustart): Karte mit 44px-Icon-Kreis, Titel 21px Bricolage, Nebentext. Empfohlene Option mit 2px `--ink`-Rahmen, die andere mit 1.5px `--line`
- **Chip** (Auslöser): 44px hoch, `aria-pressed`. Aktiv = gefüllt hell mit dunkler Schrift, inaktiv = nur Rahmen
- **Kennzahl-Kachel:** Karte 20px Radius, Zahl oben, Bezeichnung darunter in `--muted`
- **Spruch-Karte:** dunkle Karte (`--ink`), Overline „Heute für dich“, Spruch in Bricolage
- **Fortschrittsbalken:** 10px hoch, Spur `--surface-soft`, Füllung `--ink`
- **Navigation unten:** drei Einträge (Start, Schatzkästchen, Sichern & Hilfe), Icon + 12px Label, aktiv fett in `--ink`
- **Icons:** Linien-Icons, 1.8px Strich, runde Enden (z. B. Lucide). Keine Emojis.
- Mindestgröße für alles Antippbare: 44×44px

## Screens

| Mockup | Screen | Etappe |
|---|---|---|
| `Onboarding.html` | Erster Start: Startdatum, optional Ersparnis-Angaben | 2 |
| `Main.html` | Startseite: Zähler, Meilenstein-Fortschritt, Ersparnis, Spruch, Ausrutscher-Knopf, Navigation | 2 |
| `Ausrutscher.html` | Auswahl Ausrutscher oder Neustart | 2 |
| `Rueckmeldung.html` | Ermutigende Rückmeldung + optionaler Auslöser | 2 |
| `Belohnung.html` | Meilenstein-Feier | 2 |
| `Sicherung.html` | QR-Sicherung, Wiederherstellen, Hilfe mit Rauchfrei-Telefon | 2 |

Die Zahlen in den Mockups sind Beispielwerte.

## Texte aus dem Design
Die App ist nur für Anna. Persönliche Anrede (Name, auch „Maus“) und Humor laut `CLAUDE.md`, Abschnitt „Ton der Texte“.

## Bewegung
- Meilenstein: Konfetti-Formen schweben kurz ein (≤ 600ms), sonst keine Animationen
- Bei `prefers-reduced-motion` alles statisch
