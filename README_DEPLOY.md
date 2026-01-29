# 🚀 CoachBase Deployment Guide

Dieses Dokument erklärt, wie du das automatisierte Deployment-System von CoachBase nutzt.

## 📋 Übersicht

CoachBase nutzt ein **Branch-basiertes Deployment-System** mit automatischer Vercel-Integration:

- **`develop` Branch** → Vercel Preview Deployments (zum Testen)
- **`main` Branch** → Vercel Production Deployment (Live-Version)

## 🛠️ Workflow

### 1. Feature entwickeln und testen

Arbeite immer im `develop` Branch:

```bash
# Sicherstellen, dass du im develop Branch bist
git checkout develop

# Deine Änderungen vornehmen...
# (Code schreiben, Features hinzufügen, Bugs fixen)
```

### 2. Preview-Deployment erstellen

Wenn du deine Änderungen testen möchtest:

```bash
./deploy.sh
```

**Was passiert:**
- ✅ Alle Änderungen werden committed
- ✅ Der `develop` Branch wird zu GitHub gepusht
- ✅ Vercel erstellt automatisch ein **Preview-Deployment**
- 🔗 Du bekommst eine Preview-URL zum Testen (in deinem Vercel Dashboard)

**Interaktiv:** Das Skript fragt dich nach einer Commit-Message. Drücke Enter für eine automatische Nachricht.

### 3. Live gehen (Production)

Wenn alles getestet ist und live gehen soll:

```bash
./deploy.sh prod
```

**Was passiert:**
- ⚠️ Sicherheitsabfrage (du musst "yes" eingeben)
- ✅ Wechsel zu `main` Branch
- ✅ `develop` wird in `main` gemerged
- ✅ `main` wird zu GitHub gepusht
- ✅ Vercel deployed automatisch zur **Production**
- ✅ Automatischer Rückwechsel zu `develop`

## 🎯 Best Practices

### ✅ DO's

- **Immer in `develop` arbeiten** - Niemals direkt in `main` coden
- **Vor Production testen** - Nutze Preview-Deployments zum Testen
- **Kleine, häufige Commits** - Deploye oft, um Feedback zu bekommen
- **Aussagekräftige Commit-Messages** - Beschreibe, was du geändert hast

### ❌ DON'Ts

- **Nicht direkt in `main` pushen** - Nutze immer den `develop` → `main` Flow
- **Nicht ungetestete Features live bringen** - Teste immer erst im Preview
- **Keine Breaking Changes ohne Warnung** - Kommuniziere größere Änderungen

## 📊 Vercel Dashboard

Nach jedem Deployment kannst du den Status hier überprüfen:

- **Preview Deployments:** https://vercel.com/dein-team/coachbase/deployments (develop)
- **Production:** https://vercel.com/dein-team/coachbase (main)

## 🔄 Typische Workflows

### Neues Feature entwickeln

```bash
# 1. In develop arbeiten
git checkout develop

# 2. Feature coden...

# 3. Preview deployen und testen
./deploy.sh
# Commit message: "Add new player statistics feature"

# 4. Feature testen auf Preview-URL

# 5. Wenn alles funktioniert: Live bringen
./deploy.sh prod
```

### Hotfix für Production

```bash
# 1. In develop arbeiten (nicht in main!)
git checkout develop

# 2. Bugfix coden...

# 3. Schnell testen
./deploy.sh
# Commit message: "Fix: Team generator duplicate bug"

# 4. Wenn Fix funktioniert: Sofort live
./deploy.sh prod
```

### Größeres Feature über mehrere Tage

```bash
# Tag 1: Erste Änderungen
./deploy.sh
# "WIP: Start implementing dashboard feature"

# Tag 2: Weiter entwickeln
./deploy.sh
# "WIP: Add dashboard charts"

# Tag 3: Feature fertig
./deploy.sh
# "Feature: Complete trainer dashboard"

# Alles getestet? → Live bringen
./deploy.sh prod
```

## 🆘 Troubleshooting

### "Not in a git repository"
→ Du bist nicht im richtigen Verzeichnis. `cd` zum Projekt-Root.

### "Merge conflict"
→ Du musst Konflikte manuell lösen:
```bash
git status  # Zeigt konfliktbehaftete Dateien
# Konflikte in den Dateien lösen
git add .
git commit -m "Resolve merge conflicts"
./deploy.sh prod  # Nochmal versuchen
```

### Preview-URL nicht sichtbar
→ Gehe zu deinem Vercel Dashboard und suche nach dem neuesten Deployment.

### Production-Deployment fehlgeschlagen
→ Prüfe die Vercel Build-Logs im Dashboard. Meistens sind es:
- Build-Fehler (TypeScript, ESLint)
- Fehlende Environment-Variablen
- Node.js Version-Probleme

## 🔧 Manuelle Git-Befehle (falls nötig)

Falls das Skript nicht funktioniert, kannst du auch manuell deployen:

```bash
# Preview (develop)
git add -A
git commit -m "Your message"
git push origin develop

# Production (main)
git checkout main
git merge develop
git push origin main
git checkout develop
```

## 📝 Notizen

- **Erstellt:** 2026-01-29
- **Letzte Aktualisierung:** 2026-01-29
- **Vercel Project:** teamsport-46873
- **Repository:** https://github.com/ska1walker/coachbase

---

**Happy Deploying! 🎉**
