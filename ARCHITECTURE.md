# SquadMatch - Architektur Dokumentation

## 📋 Übersicht

SquadMatch ist eine React/Next.js App mit Firebase Backend. Die App nutzt Cloud Functions für die Team-Generierung und Admin-Funktionen.

## 🗄️ Firestore Datenmodell

### Collections

#### `users`
```typescript
{
  uid: string            // Firebase Auth UID (PK)
  email: string
  role: 'admin' | 'user'
  createdAt: Timestamp
}
```

#### `squads`
```typescript
{
  id: string
  ownerId: string        // ref -> users.uid
  name: string
  createdAt: Timestamp
}
```

#### `players`
```typescript
{
  id: string
  squadId: string        // ref -> squads.id
  name: string
  technik: number        // 1-10
  fitness: number        // 1-10
  spielverstaendnis: number  // 1-10
  total: number          // Summe der Attribute
  attributes?: object    // Optional für zukünftige Erweiterungen
  createdAt: string
}
```

#### `match_history` (NEU)
```typescript
{
  id: string
  squadId: string        // ref -> squads.id
  ownerId: string        // ref -> users.uid
  date: Timestamp
  teams: TeamResult[]    // Generierte Teams
  teamCount: number
  playerCount: number
  liked: boolean         // User kann gute Kombinationen markieren
  createdAt: Timestamp
}

// TeamResult Interface
{
  teamNumber: number
  players: Player[]
  totalStrength: number
  averageStrength: number
}
```

## 🔥 Cloud Functions

### Existierende Functions

#### `generateTeams` (EXISTIERT BEREITS - NICHT ÄNDERN!)
```typescript
// Input
{
  squadId: string
  playerIds: string[]
  teamCount: number
}

// Output
{
  success: boolean
  teams: TeamResult[]
  matchHistoryId?: string
  error?: string
}
```

**Wichtig**: Diese Function existiert bereits und darf NICHT verändert werden!

### Neue Functions

#### `saveMatchHistory`
Speichert Team-Generierung in die History.

```typescript
// Input
{
  squadId: string
  teams: TeamResult[]
  teamCount: number
  playerCount: number
}

// Output
{
  success: boolean
  matchHistoryId: string
}
```

**Nutzung**: Nach `generateTeams` aufrufen, um das Ergebnis zu speichern.

#### `adminResetUserPassword`
Admin kann User-Passwörter zurücksetzen.

```typescript
// Input
{
  targetUid: string
  newPassword: string  // min. 6 Zeichen
}

// Output
{
  success: boolean
  message: string
  error?: string
}
```

**Security**: Prüft `context.auth.token.role === 'admin'`

#### `setAdminRole`
Setzt Admin-Role für einen User.

```typescript
// Input
{
  email: string
}

// Output
{
  success: boolean
  message: string
}
```

**Nutzung**: Manuell via Firebase CLI ausführen

```bash
firebase functions:shell
> setAdminRole({email: 'admin@example.com'})
```

## 🔒 Security Rules

### Berechtigungskonzept

**User Rollen**:
- `user`: Normale User (können nur eigene Daten sehen/bearbeiten)
- `admin`: Admin (voller Zugriff auf alle Daten)

**Regeln**:

```
users:
  - read: own document oder admin
  - create: own document
  - update: nur admin (für Role-Änderungen)

squads:
  - read: own squads oder admin
  - create: authentifiziert
  - update/delete: owner oder admin

players:
  - read: öffentlich (für Team-Auswahl)
  - create: authentifiziert
  - update/delete: squad owner oder admin

match_history:
  - read: owner oder admin
  - create: owner (automatisch via squadId check)
  - update: owner (für 'liked' toggle)
  - delete: owner oder admin
```

## 🎨 UI/UX Komponenten

### Neue Komponenten

#### `<Stepper />`
Touch-optimierter +/- Button für Team-Anzahl.

```tsx
<Stepper
  value={teamCount}
  onChange={setTeamCount}
  min={2}
  max={10}
  label="Anzahl der Teams"
/>
```

**Design**: Neon-Lime für Increment, Outline für Decrement

#### `<MatchHistoryList />`
Zeigt vergangene Team-Generierungen.

```tsx
<MatchHistoryList squadId="..." />
```

**Features**:
- Sortiert nach Datum (neueste zuerst)
- Like/Unlike Funktion
- Detail-View mit vollständiger Aufstellung
- Mobile-First Card-Layout

#### `<BottomNav />`
Bottom Navigation für Mobile (User).

```tsx
<BottomNav />
```

**Routen**:
- Squads
- History
- Profil

## 📱 Navigation

### User Navigation (Mobile First)

**Bottom Nav** (< 768px):
- Squads
- History
- Profil

**Desktop** (> 768px):
- Sidebar oder Top Nav

### Admin Navigation

**Separate Route**: `/admin`

**Features**:
- Dashboard
- User Management
- Passwort-Reset
- Match History (alle Squads)

## 🚀 Deployment

### Firebase Setup

1. **Functions deployen**:
```bash
cd functions
npm install
npm run deploy
```

2. **Security Rules deployen**:
```bash
firebase deploy --only firestore:rules
```

3. **Ersten Admin erstellen**:
```bash
firebase functions:shell
> setAdminRole({email: 'deine@email.com'})
```

### Custom Claims

Nach `setAdminRole` muss der User sich **neu anmelden**, damit die Claims wirksam werden!

```typescript
// Im Code prüfen:
const idTokenResult = await user.getIdTokenResult()
const isAdmin = idTokenResult.claims.role === 'admin'
```

## 🔄 Workflow: Team-Generierung

### Client-Seite (Frontend)

```typescript
import { generateTeams } from '@/lib/firebase-functions'

// 1. Teams generieren (Cloud Function)
const result = await generateTeams({
  squadId: 'squad-id',
  playerIds: ['player-1', 'player-2', ...],
  teamCount: 2
})

// 2. History wird automatisch gespeichert
// (entweder in generateTeams oder via separater saveMatchHistory Function)

// 3. Teams anzeigen
setTeams(result.teams)
```

## 📁 Datei-Struktur

```
squad-match/
├── app/
│   ├── page.tsx                  # Login
│   ├── admin/
│   │   └── page.tsx              # Admin Dashboard
│   ├── teams/
│   │   └── page.tsx              # Team-Auswahl
│   ├── squads/
│   │   └── page.tsx              # User Squads (NEU)
│   ├── history/
│   │   └── page.tsx              # Match History (NEU)
│   └── profile/
│       └── page.tsx              # User Profil (NEU)
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Stepper.tsx           # NEU
│   ├── PlayerSelectionCard.tsx
│   ├── MatchHistory.tsx          # NEU
│   ├── BottomNav.tsx             # NEU
│   └── ThemeProvider.tsx
├── lib/
│   ├── firebase.ts
│   ├── firebase-functions.ts     # NEU
│   ├── types.ts                  # NEU
│   └── utils.ts
├── functions/                     # NEU
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── firestore.rules                # NEU
```

## ✅ Nächste Schritte

1. **Functions deployen**
2. **Security Rules deployen**
3. **Ersten Admin erstellen**
4. **Squads/History/Profile Pages erstellen**
5. **Admin Dashboard erweitern**
6. **Team-Generierung umbauen** (Cloud Function statt lokal)

## 🐛 Troubleshooting

### "Permission denied" Error

**Ursache**: Security Rules greifen
**Lösung**: Prüfe Custom Claims (`idTokenResult.claims.role`)

### Admin-Role funktioniert nicht

**Ursache**: User hat sich nicht neu angemeldet
**Lösung**: Logout + Login nach `setAdminRole`

### Cloud Function Timeout

**Ursache**: Komplexe Berechnungen
**Lösung**: Timeout in `firebase.json` erhöhen:

```json
{
  "functions": {
    "timeoutSeconds": 60
  }
}
```

## 📚 Referenzen

- [Firebase Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Callable Cloud Functions](https://firebase.google.com/docs/functions/callable)
