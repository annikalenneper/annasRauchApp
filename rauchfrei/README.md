# Rauchfrei

Eine kostenlose, werbefreie Web-App, die rauchfreie Tage zählt. Ohne Konto, ohne Tracking, alle Daten bleiben auf dem Gerät.

- Plan: [IMPLEMENTIERUNGSPLAN.md](IMPLEMENTIERUNGSPLAN.md)
- Stand: [PROGRESS.md](PROGRESS.md)

## Entwicklung

```bash
npm install
npm run dev        # lokaler Entwicklungsserver
npm run lint
npm run typecheck
npm test           # Unit-Tests
npm run test:e2e   # Smoke-Test im Browser (einmalig vorher: npx playwright install chromium)
npm run build      # Ergebnis in dist/
npm run preview    # gebaute Version lokal ansehen
```

## Deployment

Jeder Push auf `main` baut die App und veröffentlicht sie über GitHub Actions auf GitHub Pages (`.github/workflows/deploy.yml` im Repo-Wurzelverzeichnis).
