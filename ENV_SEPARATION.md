# 🔥 Firebase Environment Separation

## ✅ Implementiert: Prefix-basierte Dev/Prod Trennung

Seit diesem Update sind **Development** und **Production** Daten sauber getrennt.

---

## 📊 Wie es funktioniert

### Environment Detection

```typescript
// In development oder Vercel Preview:
isDevelopment() // → true

// In production:
isDevelopment() // → false
```

### Collection Names

| Base Name | Development | Production |
|-----------|-------------|------------|
| `squads` | `dev_squads` | `squads` |
| `players` | `dev_players` | `players` |
| `squadInvites` | `dev_squadInvites` | `squadInvites` |
| `users` | `users` | `users` ⚠️ |

⚠️ **Users sind NICHT getrennt** - bleiben global für Login-Funktionalität.

---

## 🗂️ Firestore Structure

```
Firestore Database (teamsport-46873)
├── squads (Production)
│   ├── {squadId}
│   └── matches (Subcollection)
├── players (Production)
├── dev_squads (Development/Preview)
│   ├── {squadId}
│   └── matches (Subcollection)
├── dev_players (Development/Preview)
├── users (Shared)
└── dev_squadInvites (Development)
```

---

## 💻 Code Usage

### Richtig ✅

```typescript
import { COLLECTIONS } from '@/lib/collections'

// Automatisch richtige Collection
const squadsRef = collection(db, COLLECTIONS.SQUADS)
const playersRef = collection(db, COLLECTIONS.PLAYERS)

// Dokument-Referenzen
const squadDoc = doc(db, COLLECTIONS.SQUADS, squadId)
const playerDoc = doc(db, COLLECTIONS.PLAYERS, playerId)
```

### Falsch ❌

```typescript
// Niemals hard-coded Collection-Namen!
const squadsRef = collection(db, 'squads') // ❌ Falsch!
const playerDoc = doc(db, 'players', id)   // ❌ Falsch!
```

---

## 🚀 Deployment Behavior

### Preview (develop Branch)

```bash
./deploy.sh
```

**Nutzt:**
- `dev_squads`
- `dev_players`
- `dev_squadInvites`

**URL:** `squad-match-xyz-preview.vercel.app`

---

### Production (main Branch)

```bash
./deploy.sh prod
```

**Nutzt:**
- `squads`
- `players`
- `squadInvites`

**URL:** `squad-match.vercel.app`

---

## 🔍 Environment Variables

**NICHT NÖTIG!**

Das System nutzt:
- `process.env.NODE_ENV` (automatisch von Next.js gesetzt)
- `process.env.NEXT_PUBLIC_VERCEL_ENV` (automatisch von Vercel gesetzt)

Keine manuellen Env-Variablen erforderlich! 🎉

---

## 🧪 Lokales Testing

```bash
# Development Mode (nutzt dev_* Collections)
npm run dev

# Production Build lokal testen (nutzt prod Collections)
npm run build && npm start
```

---

## 📝 Firestore Rules Update (Optional)

Falls du Firestore Rules nutzt, kannst du jetzt Pattern-Matching verwenden:

```javascript
// firestore.rules
match /{environment}_squads/{squadId} {
  // environment kann 'dev' oder '' sein
  allow read, write: if request.auth != null;
}

match /{environment}_players/{playerId} {
  allow read, write: if request.auth != null;
}
```

---

## ⚠️ Wichtige Hinweise

### Users Collection

Die `users` Collection ist **NICHT getrennt**:
- Gleiche Users in Dev und Prod
- Login funktioniert überall
- Test-User sehen Production-User (nur Metadaten)

**Falls das ein Problem ist**, müsstest du auf **Option B** (separate Firebase-Projekte) upgraden.

### Migration

Falls du später zu **separaten Firebase-Projekten** (Option B) wechseln willst:

1. Neues Firebase-Projekt erstellen
2. `dev_*` Collections exportieren
3. In neues Projekt importieren
4. Environment Variables in Vercel setzen
5. `COLLECTIONS` object anpassen

---

## 🎯 Best Practices

### ✅ DO's

- Nutze **immer** `COLLECTIONS.*` für Collection-Namen
- Teste **zuerst** in Preview, dann Production
- Check Firestore Console nach Deploy

### ❌ DON'Ts

- **Nie** hard-coded Collection-Namen (`'squads'`, `'players'`)
- **Nie** manuell zwischen Collections wechseln
- **Nie** Production-Daten in Dev kopieren (Datenschutz!)

---

## 📚 Weitere Infos

**Dateien:**
- `lib/firebase.ts` - Environment Detection
- `lib/collections.ts` - Collection Names
- `ENV_SEPARATION.md` - Diese Doku

**Bei Fragen:**
Schau in die Code-Kommentare in `lib/collections.ts`!

---

**Erstellt:** 2026-01-29
**Status:** ✅ Aktiv in Production
