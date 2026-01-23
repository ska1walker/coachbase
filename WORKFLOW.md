# CoachBase - Development Workflow

> Diese Datei beschreibt den Standard-Workflow für die Entwicklung mit Claude Code CLI.
> Claude Code kann diese Datei bei jedem Start lesen und die Workflows befolgen.

## 🚀 Quick Start nach MacBook-Neustart

### 1. Projekt öffnen & Claude Code starten
```bash
cd /Users/kai/Documents/claude/squad-match
claude
```

### 2. Development Server starten
Sage zu Claude: **"Starte den Development Server"**

Claude führt aus:
```bash
npm run dev
```

App läuft auf: **http://localhost:3000** (oder Port 3003)

---

## 🔄 Standard Development Workflow

### Phase 1: Lokale Entwicklung

1. **Dev-Server läuft** → Browser öffnen auf `localhost:3000`
2. **Features entwickeln** → Sage Claude was du brauchst
3. **Im Browser testen** → Iteriere bis perfekt
4. **Dev-Server stoppen** → `Ctrl + C` (wenn fertig)

### Phase 2: Deployment

1. **Sage zu Claude:** "Deploye zu GitHub" oder "Committe die Änderungen"
2. **Claude erstellt Commit:**
   ```bash
   git add .
   git commit -m "✨ Feature-Beschreibung"
   ```
3. **Du pushst zu GitHub:**
   ```bash
   git push origin main
   ```
   - Username: `ska1walker`
   - Password: [GitHub Personal Access Token]
4. **Vercel deployed automatisch** → Live in 1-2 Minuten

---

## 📁 Projekt-Struktur

```
squad-match/
├── app/              # Next.js Pages & Routes
├── components/       # React Komponenten
├── lib/             # Utilities & Firebase Config
├── functions/       # Firebase Cloud Functions
├── firestore.rules  # Firestore Security Rules
└── package.json     # Dependencies
```

---

## 🔐 Authentifizierung

### Git/GitHub
- **Repository:** `git@github.com:ska1walker/coachbase.git`
- **HTTPS URL:** `https://github.com/ska1walker/coachbase.git`
- **Branch:** `main`
- **Auth:** Personal Access Token (bei HTTPS)

### Firebase
- **Project:** `teamsport-46873`
- **Config:** `lib/firebase.ts`

### Vercel
- **Projekt:** `squad-match`
- **Live URL:** https://squad-match.vercel.app
- **Auto-Deploy:** Bei jedem Push zu `main`

---

## 🎯 Häufige Befehle

### Development
```bash
npm run dev          # Dev-Server starten
npm run build        # Production Build
npm run start        # Production Server
npm run lint         # ESLint ausführen
```

### Git
```bash
git status           # Status checken
git log --oneline    # Commit Historie
git diff             # Änderungen anzeigen
```

### Firebase
```bash
firebase login                        # Anmelden
firebase projects:list                # Projekte anzeigen
firebase functions:list               # Functions auflisten
firebase deploy --only functions      # Functions deployen
firebase deploy --only firestore:rules # Rules deployen
```

---

## 🛠️ Was Claude Code kann/nicht kann

### ✅ Claude KANN:
- Alle Files lesen/schreiben/editieren
- Git Commits erstellen (`git add`, `git commit`)
- Dev-Server starten/stoppen
- Tests ausführen
- Firebase Functions deployen
- Code schreiben & debuggen

### ❌ Claude KANN NICHT:
- `git push` ausführen (benötigt deine Credentials)
- In Browser schauen
- GitHub/Vercel Dashboard öffnen
- SSH Keys nutzen

---

## 🎮 Command-Referenz

Sage zu Claude:

| Command | Aktion |
|---------|--------|
| "Start dev" | `npm run dev` |
| "Build app" | `npm run build` |
| "Deploy" | Git commit + Push-Anweisung |
| "Git status" | Zeigt Status |
| "Neue Feature: X" | Entwickelt Feature X |
| "Fix Bug in Y" | Debuggt & fixt Bug |
| "Deploy Firebase Functions" | Functions deployen |
| "Lies WORKFLOW.md" | Diese Datei lesen |

---

## 📊 Deployment-Ablauf

```
Code schreiben (lokal)
    ↓
Testen (localhost:3000)
    ↓
Claude: git add + git commit
    ↓
Du: git push origin main
    ↓
GitHub empfängt Code
    ↓
Vercel deployed automatisch
    ↓
Live auf squad-match.vercel.app
```

---

## 🐛 Troubleshooting

### Dev-Server startet nicht
```bash
# Port bereits belegt? Kill Prozess:
lsof -ti:3000 | xargs kill -9

# Oder nutze anderen Port:
PORT=3001 npm run dev
```

### Git Push schlägt fehl
```bash
# SSH Problem? Wechsel zu HTTPS:
git remote set-url origin https://github.com/ska1walker/coachbase.git

# Dann mit Token pushen
```

### Firebase Functions Error
```bash
# Neu deployen:
cd functions
npm install
firebase deploy --only functions
```

---

## 💡 Pro-Tips

1. **Zweites Terminal-Tab für Git-Befehle:**
   - Dev-Server in Tab 1 laufen lassen
   - Git-Befehle in Tab 2 ausführen
   - `Cmd + T` für neuen Tab

2. **Änderungen schnell rückgängig machen:**
   ```bash
   git restore .              # Alle unstaged Änderungen
   git reset --soft HEAD~1    # Letzten Commit rückgängig
   ```

3. **Live-Logs von Vercel:**
   - https://vercel.com/dashboard → Projekt → Logs

4. **Firebase Console:**
   - https://console.firebase.google.com
   - Projekt: `teamsport-46873`

---

## 📌 Wichtige Links

- **Live App:** https://squad-match.vercel.app
- **GitHub Repo:** https://github.com/ska1walker/coachbase
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Firebase Console:** https://console.firebase.google.com
- **Documentation:**
  - README.md
  - ARCHITECTURE.md
  - SETUP.md

---

## 🎯 Bei neuem Claude Code Chat

**Sage einfach:**
> "Lies bitte WORKFLOW.md"

Dann weiß ich sofort:
- Wie dein Projekt strukturiert ist
- Welche Commands du nutzt
- Was ich tun kann/nicht kann
- Wie der Deployment-Prozess läuft

---

**Zuletzt aktualisiert:** 2026-01-23
**Projekt-Version:** Next.js 15.5.9
**Node Version:** 20.x
