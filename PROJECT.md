# CoachBase - Projekt-Konfiguration

> Web-App für Fußballtrainer zur Unterstützung bei der Mannschaftswahl und Team-Statistiken.

## Lokaler Pfad

```
iCloud Drive > Dokumente > claude > squad-match
~/Documents/claude/squad-match
```

## URLs

| Umgebung | URL | Branch |
|----------|-----|--------|
| Production | https://squad-match.vercel.app | `main` |
| Preview/Dev | https://develop-coachbase.vercel.app | `develop` |
| GitHub Repo | https://github.com/ska1walker/coachbase | - |

## Tech-Stack

- **Framework:** Next.js 15.0.3 + React 18.3.1
- **Sprache:** TypeScript 5.3.3
- **Styling:** Tailwind CSS 3.4.0
- **Backend:** Firebase 10.7.1 (Firestore + Auth)
- **Deployment:** Vercel
- **Package Manager:** npm

## Firebase

- **Projekt-ID:** teamsport-46873
- **Console:** https://console.firebase.google.com/project/teamsport-46873/
- **Auth:** Email/Password
- **Datenbank:** Cloud Firestore

### Collections

| Production | Dev/Preview | Beschreibung |
|------------|-------------|--------------|
| `users` | `users` | Benutzerprofile (global, nicht prefixed) |
| `squads` | `dev_squads` | Teams/Mannschaften |
| `players` | `dev_players` | Spieler |
| `squadInvites` | `dev_squadInvites` | Co-Trainer Einladungen |
| `match_history` | `dev_match_history` | Spielhistorie |
| `admin_actions` | `admin_actions` | Admin-Log |

**Subcollections (unter squads):**
- `matches` - Einzelne Spiele
- `snapshots` - Dashboard-Statistiken

### Environment Variable

```
NEXT_PUBLIC_FIRESTORE_PREFIX=dev_   # Preview
NEXT_PUBLIC_FIRESTORE_PREFIX=       # Production (leer)
```

## Rollen-System

| Rolle | Beschreibung |
|-------|--------------|
| `user` | Standard-Nutzer |
| `admin` | Vollzugriff (via Firebase Custom Claim) |
| `owner` | Squad-Besitzer (volle Kontrolle) |
| `co-trainer` | Kann Matches erstellen/bearbeiten |

### Berechtigungen

| Aktion | Owner | Co-Trainer |
|--------|-------|------------|
| Squad erstellen/löschen | ✅ | ❌ |
| Squad bearbeiten | ✅ | ❌ |
| Spieler hinzufügen/bearbeiten/löschen | ✅ | ❌ |
| Teams generieren | ✅ | ✅ |
| Matches erstellen/bearbeiten | ✅ | ✅ |
| Matches löschen | ✅ | ❌ |
| Co-Trainer einladen | ✅ | ❌ |

## Wichtige Dateien

| Pfad | Beschreibung |
|------|--------------|
| `/lib/firebase.ts` | Firebase Init & `getCollectionName()` |
| `/lib/collections.ts` | Collection-Namen mit Prefix-Logik |
| `/lib/types.ts` | TypeScript Interfaces |
| `/lib/advanced-team-generator.ts` | 8-Faktoren Team-Algorithmus |
| `/lib/gamification.ts` | Level & Achievement System |
| `/firestore.rules` | Datenbank-Sicherheitsregeln |
| `/contexts/LevelUpContext.tsx` | Gamification State |
| `/hooks/useUserStats.ts` | User-Statistiken Hook |
| `/components/AuthGuard.tsx` | Route-Schutz |

## Git Workflow

```bash
# Feature entwickeln
git checkout develop
git pull origin develop
# ... Änderungen machen ...
git add .
git commit -m "Beschreibung"
git push origin develop
# → Automatisches Preview-Deployment

# Production Release
git checkout main
git merge develop
git push origin main
# → Automatisches Production-Deployment
```

## Nützliche Befehle

```bash
# Entwicklung starten
npm run dev

# Build testen
npm run build

# Linting
npm run lint

# Firebase Emulator (lokal)
firebase emulators:start

# Firestore Rules deployen
firebase deploy --only firestore:rules

# Redeploy triggern (ohne Änderungen)
git commit --allow-empty -m "Trigger redeploy"
git push origin develop
```

## Vercel Dashboard

Deployments und Logs können im Vercel Dashboard eingesehen werden:
- Projekt: coachbase (ska1walker)

## Design-Farben

| Name | Verwendung |
|------|------------|
| `deep-petrol` | Primärfarbe, Hintergründe |
| `soft-mint` | Akzente, Highlights |
| `neon-lime` | Call-to-Actions, Erfolg |
| `digital-orange` | Warnungen, Badges |

## Notizen

- `users` Collection ist bewusst NICHT prefixed - wird für Auth global benötigt
- Co-Trainer Einladungen laufen nach 7 Tagen ab
- Squad-Subcollections (`matches`, `snapshots`) erben automatisch den Prefix vom Parent
