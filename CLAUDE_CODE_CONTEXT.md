# CoachBase - Claude Code Context

> **WICHTIG:** Diese Datei ist speziell für Claude Code CLI geschrieben.
> Lies sie IMMER am Anfang einer neuen Session, um den vollen Kontext zu haben!

**Zuletzt aktualisiert:** 2026-01-23
**Version:** 1.0.0
**Entwickler:** Kai (@ska1walker)

---

## 📌 Was ist dieses Projekt?

**CoachBase** (Projektname: squad-match) ist eine **Web-App für faire Mannschaftsaufteilung beim Sport**.

### Das Problem, das wir lösen:
- Trainer/Sportler müssen oft Teams fair aufteilen
- Manuelle Aufteilung ist zeitaufwendig und oft unausgeglichen
- Zettelwirtschaft und keine Historie von guten Kombinationen

### Unsere Lösung:
- **Intelligenter Algorithmus** teilt Teams basierend auf Spieler-Skills auf
- **Multi-Squad System** für verschiedene Mannschaften (U19, Alte Herren, etc.)
- **Match History** speichert erfolgreiche Team-Kombinationen
- **Co-Trainer System** ermöglicht Zusammenarbeit
- **Gamification** motiviert zur regelmäßigen Nutzung

---

## 🎯 Kernfunktionalitäten (Alle bereits implementiert!)

### ✅ User Features (Vollständig implementiert)
1. **Multi-Squad Management**
   - User kann mehrere Squads erstellen (z.B. "U19", "Alte Herren")
   - Jedes Squad hat eigene Spieler
   - Co-Trainer können eingeladen werden (read-only + Teams generieren)

2. **Spielerverwaltung**
   - CRUD für Spieler
   - 3 Attribute: Technik, Fitness, Spielverständnis (je 1-10)
   - **Positionen**: Torhüter, Abwehr, Mittelfeld, Angriff (Mehrfachauswahl!)
   - CSV Import/Export

3. **Team-Generator** ⭐ KERN-FEATURE
   - **Lokaler Algorithmus** (kein Cloud Function Call nötig!)
   - Greedy Initial Assignment
   - Swap-basierte Optimierung (bis 1000 Iterationen)
   - Berücksichtigt: Skill-Balance UND Positionen
   - Stepper UI für Teamanzahl (2-10 Teams)

4. **Match History**
   - Speichert generierte Teams
   - Like-Funktion für gute Kombinationen
   - Filtert nach Squad
   - Cloud Function: `saveMatchHistory`

5. **Co-Trainer System**
   - Magic Link Einladungen (Token-basiert, 7 Tage gültig)
   - Read-only Zugriff auf Squad
   - Können Teams generieren, aber NICHT Spieler bearbeiten
   - Cloud Functions: `createInvite`, `acceptInvite`

6. **Gamification**
   - XP & Level System
   - Achievements
   - Streak-Tracking (tägliche Nutzung)
   - Hall of Fame (Leaderboard, opt-in via `showInLeaderboard`)

### ✅ Admin Features (Vollständig implementiert)
1. **Admin Dashboard** (`/admin`)
   - User Management (alle User sehen)
   - Squads & Players einsehen (über alle User)
   - Passwort-Reset für User
   - Admin Actions Log

2. **Cloud Functions für Admins**
   - `adminResetUserPassword` - Passwort zurücksetzen
   - `setAdminRole` - Admin-Rolle setzen (via Firebase CLI)

---

## 🏗️ Technische Architektur

### Frontend
- **Framework:** Next.js 15.5.9 (App Router)
- **React:** 18.3.1
- **TypeScript:** Strict mode enabled
- **Styling:** Tailwind CSS 3.4.0
- **Icons:** Lucide React
- **State Management:** React Context API

### Backend
- **Firebase Authentication:** Email/Password
- **Firestore Database:** NoSQL, Real-time listeners
- **Cloud Functions:** Node.js 20, TypeScript
- **Custom Claims:** Role-based access (admin/user)

### Deployment
- **GitHub:** `git@github.com:ska1walker/coachbase.git`
- **Vercel:** Auto-deploy on push to `main`
- **Live URL:** https://squad-match.vercel.app

### Firebase Projekt
- **Project ID:** `teamsport-46873`
- **Region:** us-central1 (Functions)
- **Authentication:** Email/Password enabled
- **Firestore:** Production mode mit Security Rules

---

## 📊 Datenmodell (Firestore)

### Collections

#### `users`
```typescript
{
  uid: string                    // Firebase Auth UID (PK)
  email: string
  role: 'admin' | 'user'
  createdAt: Timestamp
  lastActive?: Timestamp
  // Profile
  displayName?: string
  clubName?: string
  location?: string
  bio?: string
  avatarUrl?: string
  showInLeaderboard?: boolean    // DSGVO: Opt-in für Hall of Fame
  // Gamification
  stats?: {
    squadsCreated: number
    playersAdded: number
    teamsGenerated: number
    currentStreak: number
    longestStreak: number
    lastActiveDate: string       // YYYY-MM-DD
    level: number
    xp: number
    achievements: string[]
  }
}
```

#### `squads`
```typescript
{
  id: string                     // Auto-generated
  ownerId: string                // ref -> users.uid
  coTrainerIds?: string[]        // UIDs mit read-only Rechten
  name: string                   // z.B. "Alte Herren"
  createdAt: Timestamp
}
```

#### `players`
```typescript
{
  id: string
  squadId: string                // ref -> squads.id
  name: string
  technik: number                // 1-10
  fitness: number                // 1-10
  spielverstaendnis: number      // 1-10
  total: number                  // Sum of attributes
  positions?: PlayerPosition[]   // ['Torhüter', 'Abwehr', ...]
  createdAt: string
}

type PlayerPosition = 'Torhüter' | 'Abwehr' | 'Mittelfeld' | 'Angriff'
```

#### `match_history`
```typescript
{
  id: string
  squadId: string                // ref -> squads.id
  ownerId: string                // ref -> users.uid (wer generiert hat)
  date: Timestamp
  teams: TeamResult[]            // Die generierten Teams
  teamCount: number
  playerCount: number
  liked: boolean                 // User kann favorisieren
  createdAt: Timestamp
}

interface TeamResult {
  teamNumber: number
  players: Player[]
  totalStrength: number
  averageStrength: number
}
```

#### `squad_invites`
```typescript
{
  id: string
  token: string                  // Secure random token (64 chars hex)
  squadId: string                // ref -> squads.id
  squadName: string
  createdBy: string              // UID des Owners
  createdByEmail: string
  createdAt: Timestamp
  expiresAt: Timestamp           // +7 Tage
  used: boolean
  usedBy?: string                // UID wer angenommen hat
  usedAt?: Timestamp
}
```

#### `admin_actions`
```typescript
{
  id: string
  action: string                 // 'password_reset', etc.
  adminUid: string
  targetUid?: string
  timestamp: Timestamp
}
```

---

## 🔒 Security Rules (Firestore)

### Wichtige Regeln (bereits deployed):

**Helper Functions:**
- `isAuthenticated()` - User ist angemeldet
- `isAdmin()` - Custom Claim: role === 'admin'
- `isOwner(ownerId)` - User ist der Owner
- `isCoTrainer(squadId)` - User ist Co-Trainer
- `isOwnerOrCoTrainer(squadId)` - Owner ODER Co-Trainer

**Squads:**
- Read: Owner OR Co-Trainer OR Admin
- Create: Authentifiziert
- Update/Delete: **NUR OWNER** (Co-Trainer NICHT!)

**Players:**
- Read: Owner OR Co-Trainer OR Admin
- Create/Update/Delete: **NUR OWNER** (Co-Trainer NICHT!)

**Match History:**
- Read: Owner OR Co-Trainer OR Admin
- Create: Owner OR Co-Trainer (beide dürfen Teams generieren!)
- Update: NUR Owner (für 'liked' toggle)
- Delete: NUR Owner

**Users:**
- Read: Alle authentifizierten User (für Hall of Fame)
- Update: Eigenes Profil (aber NICHT role field!)
- Role ändern: NUR Admin

---

## 🎨 Design System

### Farben
```typescript
--primary: #DFFF00        // Neon Lime
--secondary: #6A00FF      // Digital Purple
--dark: #0A1F1D          // Deep Petrol
--light: #E8F3E8         // Soft Mint
--neutral: #A0B0A8       // Mid Grey
```

### Tailwind Config
- Custom colors definiert in `tailwind.config.ts`
- Dark mode: System-based
- Mobile-first approach
- Touch targets: min. 44px

### UI Komponenten (`components/ui/`)
- **Button** - Primary/Secondary/Ghost variants
- **Card** - Container mit Shadow
- **Input** - Form inputs mit Focus states
- **Stepper** - +/- Buttons für Zahlen (Touch-optimiert)

---

## 🧠 Team-Generator Algorithmus

**Datei:** `lib/team-generator.ts`

### Warum lokal statt Cloud Function?
✅ Schneller (kein Netzwerk-Call)
✅ Kostenlos (keine Function-Calls)
✅ Ausgefeilter Algorithmus
✅ Funktioniert offline

### Algorithmus-Flow:

1. **Initial Assignment (Greedy)**
   - Sortiere Spieler nach Gesamtstärke (absteigend)
   - Weise jeden Spieler dem schwächsten Team zu
   - Berücksichtige Position-Needs (Torhüter > Abwehr > Mittelfeld > Angriff)

2. **Optimization (Swap-basiert)**
   - Max. 1000 Iterationen
   - Versuche alle möglichen Player-Swaps zwischen Teams
   - Berechne Imbalance-Score (gewichtete Summe):
     - Player Count Difference × 5.0 (wichtigste Metrik!)
     - Technik Difference × 2.0
     - Fitness Difference × 2.0
     - Spielverständnis Difference × 2.0
     - Position Imbalance × 1.5
   - Akzeptiere Swap nur wenn Imbalance sinkt
   - Stoppe wenn 50 Iterationen ohne Verbesserung ODER Score < 1.0

3. **Result**
   - Balanced Teams mit Position-Awareness
   - Jedes Team hat Stats: totalStrength, avgTechnik, avgFitness, avgSpielverstaendnis, positionCounts

### Position Priority:
```typescript
Torhüter: 1.5      // Höchste Priorität
Abwehr: 1.2        // Hoch
Angriff: 1.1       // Mittel-Hoch
Mittelfeld: 1.0    // Mittel (flexibelste Position)
```

---

## 📱 Navigation & Routes

### Public Routes
- `/` - Landing Page (Marketing)
- `/login` - Login/Registrierung
- `/impressum` - Impressum
- `/datenschutz` - Datenschutz
- `/credits` - Credits

### Protected Routes (Auth erforderlich)
- `/squads` - Squad-Übersicht
- `/squads/[id]` - Spielerverwaltung für ein Squad
- `/teams` - Team-Generierung
- `/history` - Match History
- `/profile` - User-Profil
- `/hall-of-fame` - Leaderboard

### Admin Routes (Admin-Rolle erforderlich)
- `/admin` - Dashboard
- `/admin` - User Management (gleiche Route, verschiedene Tabs)

### Navigation Components
- **Desktop:** `<AppHeader />` - Top navigation
- **Mobile:** `<BottomNav />` - Bottom navigation (< 768px)

---

## 🔥 Cloud Functions

**Alle deployed in:** `us-central1`

### Deployed Functions:

#### `saveMatchHistory`
```typescript
Input: { squadId, teams, teamCount, playerCount }
Output: { success, matchHistoryId }
Security: Owner OR Co-Trainer (beide dürfen speichern!)
```

#### `adminResetUserPassword`
```typescript
Input: { targetUid, newPassword }
Output: { success, message }
Security: NUR Admin (checked via custom claims)
Logs: Schreibt in admin_actions collection
```

#### `setAdminRole`
```typescript
Input: { email }
Output: { success, message }
Security: Manuell via Firebase CLI ausführen
Wichtig: User muss LOGOUT + LOGIN nach Rolle-Änderung!
```

#### `createInvite`
```typescript
Input: { squadId }
Output: { success, inviteId, token, expiresAt }
Security: NUR Squad Owner
Token: 64 char secure hex string
Expires: +7 Tage
```

#### `acceptInvite`
```typescript
Input: { token }
Output: { success, squadId, squadName, message }
Security: Authentifiziert
Checks:
  - Token existiert
  - Nicht bereits verwendet
  - Nicht abgelaufen
  - User ist nicht bereits Owner/Co-Trainer
Action: Fügt User zu squad.coTrainerIds hinzu
```

### ⚠️ WICHTIG: generateTeams Function
Es gibt KEINE `generateTeams` Cloud Function mehr!
Der Algorithmus läuft **lokal im Frontend** (`lib/team-generator.ts`).

---

## 🎮 Gamification System

**Datei:** `lib/gamification.ts`

### XP & Levels
```typescript
Level 1: 0-100 XP      "Rookie"
Level 2: 100-250 XP    "Trainer"
Level 3: 250-500 XP    "Coach"
Level 4: 500-1000 XP   "Profi"
Level 5: 1000+ XP      "Legende"
```

### XP-Vergabe
```typescript
Squad erstellt:       +50 XP
Spieler hinzugefügt:  +10 XP
Teams generiert:      +20 XP
Streak (täglich):     +5 XP pro Tag
```

### Achievements (Beispiele)
- **"Erster Squad"** - Squad erstellt
- **"Team von 11"** - 11+ Spieler in einem Squad
- **"Matchmaker"** - 10 Team-Generierungen
- **"Social Butterfly"** - 3+ Co-Trainer eingeladen
- **"Streak Master"** - 7 Tage Streak

### Streak System
- Tracked in `user.stats.lastActiveDate` (YYYY-MM-DD)
- Bei täglicher Nutzung: `currentStreak++`
- Bei Pause > 1 Tag: `currentStreak = 1`
- `longestStreak` wird persistent gespeichert

---

## 🎨 UI/UX Best Practices (Bereits implementiert)

### Mobile-First
- Bottom Navigation auf < 768px
- Touch targets min. 44px
- Stepper statt Input-Felder wo sinnvoll
- Swipe-gestures wo möglich

### Accessibility
- Semantic HTML
- ARIA labels wo nötig
- Keyboard navigation
- Screen reader friendly

### Performance
- Next.js Image optimization
- Code splitting (automatisch via Next.js)
- Lazy loading für schwere Components
- Firestore real-time listeners (effizient)

### Error Handling
- Try-catch in allen async Functions
- User-friendly Error Messages
- Firestore errors werden abgefangen
- Network errors zeigen Retry-Option

---

## 🐛 Bekannte Limitationen & Workarounds

### 1. Firebase Security Rules - Co-Trainer
**Limitation:** Co-Trainer können nur Teams generieren, NICHT Spieler bearbeiten.

**Grund:** Security by Design. Owner behält volle Kontrolle über Squad-Daten.

**Workaround:** Wenn Co-Trainer mehr Rechte braucht → Owner muss Spieler bearbeiten.

### 2. Custom Claims - Logout erforderlich
**Limitation:** Nach `setAdminRole` muss User sich neu anmelden.

**Grund:** Custom Claims werden nur beim Login geladen.

**Lösung:** Im Code immer darauf hinweisen! User muss Logout + Login machen.

### 3. Team-Generator - Max Iterations
**Limitation:** Algorithmus läuft max. 1000 Iterationen oder stoppt bei 50 Iterationen ohne Verbesserung.

**Grund:** Performance. Bei sehr vielen Spielern (50+) würde es sonst zu langsam.

**Aktuell:** Funktioniert perfekt bis ca. 40 Spieler.

### 4. CSV Import - Format muss stimmen
**Limitation:** CSV muss genau das Format haben: `name,technik,fitness,spielverstaendnis,positions`

**Grund:** Keine intelligente Format-Erkennung implementiert.

**Lösung:** Template/Beispiel-CSV Download-Button in UI (TODO?).

### 5. Firebase Emulator
**Status:** NICHT konfiguriert.

**Grund:** Entwicklung direkt gegen Production DB (kleines Projekt).

**Best Practice:** Für größere Projekte sollte Emulator genutzt werden.

---

## 📂 Wichtige Dateien & ihre Funktionen

### Root-Level
```
├── WORKFLOW.md              # Workflow für Claude Code (diese Datei lesen!)
├── CLAUDE_CODE_CONTEXT.md   # Vollständiger Kontext (diese Datei!)
├── README.md                # Projekt-Übersicht (User-facing)
├── ARCHITECTURE.md          # Detaillierte Architektur
├── SETUP.md                 # Setup-Anleitung
├── package.json             # Dependencies
├── next.config.js           # Next.js Config
├── tailwind.config.ts       # Design System Config
├── tsconfig.json            # TypeScript Config
├── firestore.rules          # Firestore Security Rules
├── firestore.indexes.json   # Firestore Indexes
└── firebase.json            # Firebase Config
```

### `/app` - Next.js Pages (App Router)
```
├── layout.tsx               # Root Layout mit AuthProvider
├── page.tsx                 # Landing Page (/)
├── login/page.tsx           # Login/Registrierung
├── squads/
│   ├── page.tsx            # Squad-Übersicht
│   └── [id]/page.tsx       # Squad-Detail & Spielerverwaltung
├── teams/page.tsx           # Team-Generierung
├── history/page.tsx         # Match History
├── profile/page.tsx         # User-Profil
├── hall-of-fame/page.tsx    # Leaderboard
└── admin/page.tsx           # Admin Dashboard
```

### `/components`
```
├── ui/                      # Basis UI-Komponenten
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── Stepper.tsx         # Touch-optimierter +/- Stepper
├── AppHeader.tsx            # Top Navigation (Desktop)
├── BottomNav.tsx            # Bottom Navigation (Mobile)
├── AuthGuard.tsx            # HOC für Protected Routes
├── PlayerSelectionCard.tsx  # Spieler-Card für Team-Auswahl
├── MatchHistory.tsx         # Match History Component
├── CSVUpload.tsx            # CSV Import/Export
├── InviteCoTrainer.tsx      # Co-Trainer Magic Link UI
├── EditProfile.tsx          # Profile Edit Form
└── ThemeProvider.tsx        # Dark Mode Provider
```

### `/lib`
```
├── firebase.ts              # Firebase Client Config & Exports
├── firebase-functions.ts    # Callable Functions Wrapper
├── types.ts                 # TypeScript Interfaces
├── team-generator.ts        # Team-Generator Algorithmus ⭐
├── gamification.ts          # Gamification Logic
├── csv-utils.ts             # CSV Import/Export Utils
├── validation.ts            # Form Validation Helpers
└── utils.ts                 # General Utils (cn, etc.)
```

### `/functions` - Cloud Functions
```
├── src/
│   └── index.ts            # Alle Cloud Functions
├── package.json            # Function Dependencies
└── tsconfig.json           # Function TypeScript Config
```

### `/contexts`
```
└── AuthContext.tsx         # Firebase Auth Context Provider
```

### `/hooks`
```
└── useAuth.ts              # Custom Hook für Auth State
```

---

## 🚀 Development Workflow (WICHTIG!)

### 1. Neue Session starten
```bash
cd /Users/kai/Documents/claude/squad-match
claude
```

**Als Claude Code:**
> "Lies bitte WORKFLOW.md und CLAUDE_CODE_CONTEXT.md"

### 2. Dev-Server starten
```bash
npm run dev
```
→ App läuft auf http://localhost:3000 (oder 3003)

### 3. Features entwickeln
- User sagt was er möchte
- Claude schreibt Code
- User testet im Browser
- Iterieren bis perfekt

### 4. Git Workflow
```bash
# Claude erstellt Commit:
git add .
git commit -m "✨ Feature-Beschreibung"

# User pushed:
git push origin main

# Vercel deployed automatisch!
```

---

## 🎯 Was Claude Code KANN

✅ **Alle Dateien lesen/schreiben/editieren**
✅ **Git Commits erstellen** (`git add`, `git commit`)
✅ **Dev-Server starten/stoppen**
✅ **Tests ausführen**
✅ **Build erstellen** (`npm run build`)
✅ **Firebase Functions deployen** (`firebase deploy --only functions`)
✅ **Firestore Rules deployen** (`firebase deploy --only firestore:rules`)
✅ **Code debuggen & fixen**
✅ **Dependencies installieren** (`npm install`)
✅ **Git Status checken**

---

## 🚫 Was Claude Code NICHT KANN

❌ **`git push` ausführen** (benötigt User Credentials)
❌ **In Browser schauen** (User muss testen)
❌ **GitHub/Vercel Dashboard öffnen**
❌ **SSH Keys nutzen** (Security)
❌ **Interactive Prompts beantworten** (z.B. `firebase login`)

---

## 💡 Wichtige Hinweise für Claude Code

### Beim Code schreiben:

1. **Firebase Config niemals ändern!**
   - `lib/firebase.ts` enthält die Production Config
   - Niemals API Keys ändern/entfernen

2. **Security Rules beachten**
   - Co-Trainer können NUR lesen + Teams generieren
   - Owner-Check immer vor Update/Delete
   - Admin-Check für privilegierte Operationen

3. **TypeScript Types nutzen**
   - Alle Interfaces in `lib/types.ts` definiert
   - Niemals `any` verwenden wenn Type bekannt

4. **Mobile-First**
   - Immer zuerst Mobile-Layout entwickeln
   - Dann Desktop mit Media Queries
   - Touch targets min. 44px

5. **Error Handling**
   - Alle async Functions in try-catch
   - User-friendly Error Messages
   - Console.error für Debugging

6. **Real-time Listeners**
   - `onSnapshot` statt `getDocs` für Live-Updates
   - Listener cleanup in useEffect return

7. **Performance**
   - Keine unnötigen Re-Renders
   - useMemo/useCallback wo sinnvoll
   - Firestore Queries limitieren (wo möglich)

### Beim Debugging:

1. **Browser Console checken**
   - User soll F12 drücken und Fehler kopieren

2. **Firebase Console**
   - Firestore Daten checken
   - Functions Logs ansehen

3. **Vercel Logs**
   - Bei Deployment-Problemen
   - Runtime Errors in Production

### Bei neuen Features:

1. **Überlege Security Rules**
   - Wer darf lesen/schreiben?
   - In `firestore.rules` dokumentieren

2. **TypeScript Types erweitern**
   - Neue Interfaces in `lib/types.ts`
   - Export für andere Dateien

3. **Mobile-Ansicht testen**
   - User bitten auf Mobile zu testen
   - Oder DevTools Device Mode

4. **Dokumentation updaten**
   - Diese Datei aktualisieren
   - Neue Features dokumentieren

---

## 🔧 Troubleshooting Guide

### Problem: Dev-Server startet nicht
```bash
# Port belegt?
lsof -ti:3000 | xargs kill -9

# Dependencies fehlen?
npm install

# Cache löschen?
rm -rf .next
npm run dev
```

### Problem: Firebase Auth funktioniert nicht
```bash
# Check Firebase Console:
# Authentication → Email/Password enabled?

# Check lib/firebase.ts:
# Config korrekt?

# User neu anmelden lassen
```

### Problem: Firestore Permission Denied
```bash
# Rules deployed?
firebase deploy --only firestore:rules

# Custom Claims korrekt?
# Admin: setAdminRole ausführen, dann Logout + Login

# Owner-Check:
# Ist user.uid === squad.ownerId?
```

### Problem: Cloud Function Error
```bash
# Logs checken:
firebase functions:log

# Neu deployen:
cd functions
npm install
firebase deploy --only functions
```

### Problem: Vercel Build Fail
```bash
# Check Vercel Dashboard Logs
# Meist TypeScript Errors

# Lokal testen:
npm run build

# Wenn lokal funktioniert:
# → Vercel Environment Variables checken
```

### Problem: Team-Generator zu langsam
```typescript
// In lib/team-generator.ts:
// Reduziere maxIterations von 1000 auf 500

const optimizedTeams = optimizeTeamsWithSwaps(
  initialTeams,
  500  // statt 1000
)
```

---

## 📈 Nächste Features / Roadmap (Optional)

### Bereits diskutiert / Ideen:
- [ ] Spieler-Filter nach Position
- [ ] Export als PDF (Team-Aufstellungen)
- [ ] WhatsApp/Email-Share der Teams
- [ ] Spieler-Stats über Zeit (wer spielt wie oft?)
- [ ] Team-Bewertung nach Spiel (wie war das Match?)
- [ ] Automatische Team-Rotation (jeder spielt mit jedem)
- [ ] Custom Attribute-Namen (nicht nur Technik/Fitness/Spielverst.)
- [ ] Spieler-Verfügbarkeit (wer kann heute?)
- [ ] Multi-Language Support (EN, DE)

### Technische Verbesserungen:
- [ ] Firebase Emulator Setup (für lokale Entwicklung)
- [ ] E2E Tests (Playwright/Cypress)
- [ ] Storybook für UI-Komponenten
- [ ] PWA (Offline-Funktionalität)
- [ ] Push Notifications (Teams fertig)

---

## 🎓 Lessons Learned

### Was funktioniert gut:
✅ **Lokaler Team-Generator** statt Cloud Function
✅ **Multi-Squad System** - sehr flexibel
✅ **Co-Trainer mit read-only** - gutes Security-Modell
✅ **Real-time Firestore Listeners** - Live-Updates ohne Refresh
✅ **Tailwind CSS** - schnelles Styling
✅ **TypeScript** - weniger Bugs

### Was verbessert werden könnte:
⚠️ **CSV Import** - Format zu strikt
⚠️ **Admin-Erstellung** - Zu manuell (via CLI)
⚠️ **Error Messages** - Könnten detaillierter sein
⚠️ **Loading States** - Mehr Skeleton Screens
⚠️ **Tests** - Keine automatisierten Tests vorhanden

---

## 📞 Support & Links

**Live App:** https://squad-match.vercel.app
**GitHub:** https://github.com/ska1walker/coachbase
**Vercel Dashboard:** https://vercel.com/dashboard
**Firebase Console:** https://console.firebase.google.com/project/teamsport-46873

**Entwickler:**
- GitHub: @ska1walker
- Email: [via GitHub Profile]

---

## ✅ Checkliste für neue Claude Code Session

Beim Start einer neuen Session:

- [ ] `cd /Users/kai/Documents/claude/squad-match`
- [ ] `claude` (CLI starten)
- [ ] "Lies WORKFLOW.md und CLAUDE_CODE_CONTEXT.md"
- [ ] Verstehe den aktuellen Projekt-Status
- [ ] Frage User was er entwickeln möchte
- [ ] `npm run dev` starten (wenn Development)
- [ ] Features entwickeln
- [ ] Git Commit erstellen (User pushed dann)
- [ ] Diese Datei updaten wenn große Änderungen

---

**Ende der Claude Code Context-Dokumentation**

Diese Datei sollte IMMER aktuell gehalten werden!
Bei neuen Features, Architektur-Änderungen, oder wichtigen Entscheidungen → HIER DOKUMENTIEREN!

**Version:** 1.0.0
**Letzte Änderung:** 2026-01-23
**Nächstes Review:** Bei größeren Feature-Releases
