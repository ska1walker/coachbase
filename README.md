# CoachBase

**Faire Teams auf Knopfdruck.**

CoachBase ist die Web-App für Trainer und Freizeitsportler, die eine schnelle und faire Team-Aufteilung ermöglicht. Keine Zettelwirtschaft mehr - verwalte mehrere Mannschaften, füge Spieler hinzu und generiere ausgeglichene Teams basierend auf Skill-Levels.

## ✨ Features

- **Multi-Squad Management**: Verwalte mehrere Mannschaften (z.B. U19, Alte Herren) in einem Account
- **Fairer Algorithmus**: Snake-Draft-basierte Team-Generierung für ausgeglichene Teams
- **Skill-Bewertung**: Bewerte Spieler in 3 Kategorien (Technik, Fitness, Spielverständnis)
- **Match History**: Speichere und markiere deine besten Team-Generierungen
- **Mobile-First**: Optimiert für Smartphone und Tablet
- **Dark Mode**: Automatische Anpassung an System-Präferenzen
- **Admin-Dashboard**: Umfassende Verwaltung für Admins (User → Squads → Spieler)

## 🚀 Quick Start

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev
```

App läuft auf: **http://localhost:3000**

## 📱 App-Struktur

### Öffentliche Bereiche
- `/` - Landing Page (Marketing)
- `/login` - Login/Registrierung

### Protected Bereiche (Auth erforderlich)
- `/squads` - Squad-Übersicht
- `/squads/[id]` - Spieler-Verwaltung für ein Squad
- `/teams` - Team-Generierung
- `/history` - Match History
- `/profile` - User-Profil
- `/admin` - Admin Dashboard (nur für Admins)

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS mit Custom Design System
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions)
- **UI**: Lucide React Icons

## 🎨 Design System

- **Primary**: Neon Lime #DFFF00
- **Secondary**: Digital Purple #6A00FF
- **Dark**: Deep Petrol #0A1F1D
- **Light**: Soft Mint #E8F3E8
- **Neutral**: Mid Grey #A0B0A8

## 📊 Datenmodell

```
User (1) → (n) Squads (1) → (n) Players
```

### Collections:
- **users**: Account-Daten, Rolle (admin/user)
- **squads**: Mannschaften (gehören zu einem User)
- **players**: Spieler (gehören zu einem Squad)
- **match_history**: Generierte Teams

## 🔐 Security

- Firebase Authentication (Email/Password)
- Firestore Security Rules mit role-based access
- Custom Claims für Admin-Rechte
- Protected Routes mit AuthGuard-Komponente

## 🛠️ Setup

### 1. Firebase konfigurieren

Aktiviere in der Firebase Console:
- **Authentication** → Email/Password
- **Firestore Database**
- **Cloud Functions** (optional)

### 2. Umgebungsvariablen

Die Firebase-Config ist bereits in `/lib/firebase.ts` eingetragen.

### 3. Cloud Functions deployen (optional)

```bash
cd functions
npm install
firebase deploy --only functions
```

### 4. Security Rules deployen (optional)

```bash
firebase deploy --only firestore:rules
```

### 5. Ersten Admin erstellen (optional)

```bash
firebase functions:shell
> setAdminRole({email: 'deine@email.com'})
```

Danach: **Logout + Login** in der App!

## 📚 Dokumentation

- **SETUP.md** - Detaillierte Setup-Anleitung
- **ARCHITECTURE.md** - Architektur-Dokumentation

## 🐛 Bekannte Probleme

- Cloud Functions müssen deployed sein für Match History
- Admin-Passwort-Reset benötigt deployed Cloud Function
- Email/Password Auth muss in Firebase Console aktiviert sein

## 📄 Lizenz

Private Projekt

---

**CoachBase** - Automatisierte und faire Teamaufteilung © 2026
