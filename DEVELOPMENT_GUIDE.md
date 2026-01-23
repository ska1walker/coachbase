# CoachBase - Development Guide

> Detaillierter Guide für die Entwicklung neuer Features und Code-Patterns.
> Für Claude Code: Lies diese Datei bevor du neuen Code schreibst!

**Version:** 1.0.0
**Zuletzt aktualisiert:** 2026-01-23

---

## 📋 Inhaltsverzeichnis

1. [Code-Struktur & Patterns](#code-struktur--patterns)
2. [Neue Features entwickeln](#neue-features-entwickeln)
3. [Firestore Patterns](#firestore-patterns)
4. [UI/UX Best Practices](#uiux-best-practices)
5. [Security & Permissions](#security--permissions)
6. [Testing Guide](#testing-guide)
7. [Common Tasks](#common-tasks)
8. [Code-Beispiele](#code-beispiele)

---

## 🏗️ Code-Struktur & Patterns

### Next.js App Router Pattern

```typescript
// ✅ GOOD: Server Component (default)
// app/squads/page.tsx
export default function SquadsPage() {
  // Server-side rendering
  return <div>...</div>
}

// ✅ GOOD: Client Component (wenn nötig)
// components/InteractiveButton.tsx
'use client'

import { useState } from 'react'

export default function InteractiveButton() {
  const [clicked, setClicked] = useState(false)
  return <button onClick={() => setClicked(true)}>...</button>
}
```

**Regel:** Nur `'use client'` wenn wirklich nötig (State, Events, Hooks).

---

### Component Structure

```
components/
├── ui/                    # Basis UI-Komponenten (atoms)
│   ├── Button.tsx        # Wiederverwendbar, keine Business Logic
│   ├── Card.tsx
│   └── Input.tsx
├── [Feature]Component.tsx # Feature-spezifische Komponenten
│   ├── PlayerCard.tsx    # Business Logic
│   └── TeamDisplay.tsx
└── layouts/              # Layout-Komponenten
    ├── AppHeader.tsx
    └── BottomNav.tsx
```

**Best Practice:**
- UI-Komponenten: Rein presentational
- Feature-Komponenten: Business Logic + UI
- Layouts: Page-Structure

---

### TypeScript Patterns

```typescript
// ✅ GOOD: Interfaces aus lib/types.ts importieren
import type { Player, Squad, TeamResult } from '@/lib/types'

// ✅ GOOD: Props Interface
interface PlayerCardProps {
  player: Player
  onEdit?: (player: Player) => void
  onDelete?: (id: string) => void
  isSelected?: boolean
}

// ❌ BAD: any verwenden
const handleSubmit = (data: any) => { ... }

// ✅ GOOD: Typed
const handleSubmit = (data: Player) => { ... }
```

---

### Custom Hooks Pattern

```typescript
// ✅ GOOD: Custom Hook
// hooks/useSquads.ts
'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import type { Squad } from '@/lib/types'

export function useSquads() {
  const { user } = useAuth()
  const [squads, setSquads] = useState<Squad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) {
      setSquads([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'squads'),
      where('ownerId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Squad[]
        setSquads(data)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  return { squads, loading, error }
}
```

---

## 🆕 Neue Features entwickeln

### Checklist für neues Feature

- [ ] 1. **TypeScript Types definieren** (`lib/types.ts`)
- [ ] 2. **Firestore Collection** (falls nötig)
- [ ] 3. **Security Rules** schreiben (`firestore.rules`)
- [ ] 4. **UI-Komponenten** erstellen
- [ ] 5. **Logic-Hooks** schreiben
- [ ] 6. **Page/Route** erstellen
- [ ] 7. **Navigation** aktualisieren
- [ ] 8. **Testing** (manuell)
- [ ] 9. **Dokumentation** updaten

---

### Beispiel: Neue Funktion "Spieler-Notizen"

#### 1. Types definieren

```typescript
// lib/types.ts
export interface PlayerNote {
  id: string
  playerId: string
  squadId: string
  authorId: string
  note: string
  createdAt: Timestamp
  updatedAt?: Timestamp
}
```

#### 2. Firestore Collection

Collection: `player_notes`

```
player_notes/
  {noteId}/
    - playerId: string
    - squadId: string
    - authorId: string
    - note: string
    - createdAt: Timestamp
```

#### 3. Security Rules

```javascript
// firestore.rules
match /player_notes/{noteId} {
  // Read: Squad owner OR co-trainer
  allow read: if isAuthenticated() && (
    isOwnerOrCoTrainer(resource.data.squadId)
  );

  // Create: Squad owner OR co-trainer
  allow create: if isAuthenticated() &&
                   isOwnerOrCoTrainer(request.resource.data.squadId) &&
                   request.resource.data.authorId == request.auth.uid;

  // Update/Delete: Author only
  allow update, delete: if isAuthenticated() &&
                           resource.data.authorId == request.auth.uid;
}
```

#### 4. Hook erstellen

```typescript
// hooks/usePlayerNotes.ts
export function usePlayerNotes(playerId: string) {
  const [notes, setNotes] = useState<PlayerNote[]>([])
  // ... Firestore Logic
  return { notes, addNote, deleteNote, updateNote }
}
```

#### 5. UI-Komponente

```typescript
// components/PlayerNotesSection.tsx
export function PlayerNotesSection({ playerId }: { playerId: string }) {
  const { notes, addNote } = usePlayerNotes(playerId)

  return (
    <div>
      {/* UI für Notizen */}
    </div>
  )
}
```

---

## 🔥 Firestore Patterns

### Real-time Listener (bevorzugt)

```typescript
// ✅ GOOD: Real-time mit onSnapshot
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'players'),
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setPlayers(data)
    }
  )

  return () => unsubscribe() // Cleanup!
}, [])
```

### One-time Read

```typescript
// ✅ GOOD: One-time read mit getDocs
const fetchPlayers = async () => {
  const snapshot = await getDocs(collection(db, 'players'))
  const data = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  return data
}
```

### Write Operations

```typescript
// ✅ GOOD: Add document
const addPlayer = async (playerData: Omit<Player, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'players'), {
      ...playerData,
      createdAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding player:', error)
    throw error
  }
}

// ✅ GOOD: Update document
const updatePlayer = async (playerId: string, updates: Partial<Player>) => {
  try {
    await updateDoc(doc(db, 'players', playerId), {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating player:', error)
    throw error
  }
}

// ✅ GOOD: Delete document
const deletePlayer = async (playerId: string) => {
  try {
    await deleteDoc(doc(db, 'players', playerId))
  } catch (error) {
    console.error('Error deleting player:', error)
    throw error
  }
}
```

### Query Patterns

```typescript
// ✅ GOOD: WHERE clause
const q = query(
  collection(db, 'players'),
  where('squadId', '==', squadId),
  where('total', '>=', 20),
  orderBy('total', 'desc'),
  limit(10)
)

// ✅ GOOD: Composite Query (Index erforderlich!)
const q = query(
  collection(db, 'squads'),
  where('ownerId', '==', userId),
  orderBy('createdAt', 'desc')
)

// ⚠️ WICHTIG: Firestore Indexes
// Wenn Query fehlschlägt: Firebase Console → Firestore → Indexes
// Oder: firestore.indexes.json
```

---

## 🎨 UI/UX Best Practices

### Loading States

```typescript
// ✅ GOOD: Loading State zeigen
if (loading) {
  return <div className="animate-pulse">Loading...</div>
}

// ✅ BESSER: Skeleton Screen
if (loading) {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 bg-gray-200 animate-pulse rounded" />
      ))}
    </div>
  )
}
```

### Error Handling

```typescript
// ✅ GOOD: Error State zeigen
if (error) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-800">
        Fehler beim Laden: {error.message}
      </p>
      <button onClick={retry} className="mt-2">
        Erneut versuchen
      </button>
    </div>
  )
}
```

### Empty States

```typescript
// ✅ GOOD: Empty State mit Action
if (items.length === 0) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 mb-4">
        Noch keine Spieler vorhanden
      </p>
      <button onClick={openAddDialog}>
        Ersten Spieler hinzufügen
      </button>
    </div>
  )
}
```

### Form Validation

```typescript
// ✅ GOOD: Client-side Validation
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()

  // Validation
  if (!name.trim()) {
    setError('Name ist erforderlich')
    return
  }

  if (technik < 1 || technik > 10) {
    setError('Technik muss zwischen 1 und 10 liegen')
    return
  }

  // Submit
  onSubmit({ name, technik, ... })
}
```

### Responsive Design

```typescript
// ✅ GOOD: Tailwind Responsive Classes
<div className="
  grid
  grid-cols-1          // Mobile: 1 Column
  md:grid-cols-2       // Tablet: 2 Columns
  lg:grid-cols-3       // Desktop: 3 Columns
  gap-4
">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// ✅ GOOD: Hide on Mobile
<div className="hidden md:block">
  Desktop Only Content
</div>

// ✅ GOOD: Show on Mobile only
<div className="md:hidden">
  Mobile Only Content
</div>
```

---

## 🔒 Security & Permissions

### Owner-Check Pattern

```typescript
// ✅ GOOD: Owner-Check before Operation
const deleteSquad = async (squadId: string) => {
  const { user } = useAuth()

  // Fetch squad
  const squadDoc = await getDoc(doc(db, 'squads', squadId))
  const squad = squadDoc.data()

  // Check ownership
  if (squad.ownerId !== user.uid) {
    throw new Error('Nur der Owner kann das Squad löschen')
  }

  // Delete
  await deleteDoc(doc(db, 'squads', squadId))
}
```

### Admin-Check Pattern

```typescript
// ✅ GOOD: Admin-Check
const { user, isAdmin } = useAuth()

if (!isAdmin) {
  return <div>Zugriff verweigert</div>
}

// Admin content
return <AdminDashboard />
```

### Co-Trainer Check Pattern

```typescript
// ✅ GOOD: Co-Trainer Check
const canEdit = useMemo(() => {
  if (!user || !squad) return false

  // Owner kann immer editieren
  if (squad.ownerId === user.uid) return true

  // Co-Trainer NICHT (by design)
  return false
}, [user, squad])

return (
  <button disabled={!canEdit} onClick={handleEdit}>
    Bearbeiten
  </button>
)
```

---

## 🧪 Testing Guide

### Manual Testing Checklist

Neues Feature testen:

- [ ] **Happy Path** - Standard-Workflow funktioniert
- [ ] **Edge Cases** - Leere Daten, max. Werte, etc.
- [ ] **Error Cases** - Netzwerkfehler, Permission Denied
- [ ] **Mobile** - Responsive Layout, Touch-Targets
- [ ] **Dark Mode** - Farben korrekt
- [ ] **Loading States** - Zeigt Feedback
- [ ] **Real-time** - Updates ohne Refresh
- [ ] **Permissions** - Owner/Co-Trainer/Admin korrekt

### Browser Testing

- [ ] Chrome (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (Latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Device Testing

- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667, iPhone SE)
- [ ] Large Mobile (414x896, iPhone 11)

---

## 🛠️ Common Tasks

### Task: Neue Firestore Collection hinzufügen

1. **Type definieren** (`lib/types.ts`)
2. **Security Rules** (`firestore.rules`)
3. **Hook erstellen** (`hooks/use[Collection].ts`)
4. **UI-Komponente** bauen
5. **Rules deployen**: `firebase deploy --only firestore:rules`

### Task: Neue Route hinzufügen

1. **Erstelle** `app/[route]/page.tsx`
2. **Protected Route?** → `<AuthGuard>` wrappen
3. **Navigation** update (`components/AppHeader.tsx`, `components/BottomNav.tsx`)
4. **Teste** alle Breakpoints

### Task: Cloud Function hinzufügen

1. **Schreibe Function** in `functions/src/index.ts`
2. **Lokaler Test**: `npm run serve` (in /functions)
3. **Deploy**: `firebase deploy --only functions`
4. **Client-Code**: `lib/firebase-functions.ts` erweitern

### Task: UI-Komponente hinzufügen

1. **Erstelle** `components/ui/[Component].tsx`
2. **Props Interface** definieren
3. **Tailwind Styling** (Mobile-First!)
4. **Storybook?** (falls implementiert)
5. **Export** aus `components/ui/index.ts`

---

## 💻 Code-Beispiele

### Beispiel: Vollständige CRUD-Komponente

```typescript
// components/PlayerManager.tsx
'use client'

import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Player } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface PlayerManagerProps {
  squadId: string
}

export function PlayerManager({ squadId }: PlayerManagerProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [technik, setTechnik] = useState(5)

  // Real-time listener
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'players'),
      (snapshot) => {
        const data = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Player))
          .filter(p => p.squadId === squadId)
        setPlayers(data)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [squadId])

  // CREATE
  const handleAdd = async () => {
    try {
      await addDoc(collection(db, 'players'), {
        squadId,
        name,
        technik,
        fitness: 5,
        spielverstaendnis: 5,
        total: technik + 5 + 5,
        createdAt: new Date().toISOString()
      })
      setName('')
    } catch (error) {
      console.error('Error adding player:', error)
    }
  }

  // UPDATE
  const handleUpdate = async (playerId: string, updates: Partial<Player>) => {
    try {
      await updateDoc(doc(db, 'players', playerId), updates)
    } catch (error) {
      console.error('Error updating player:', error)
    }
  }

  // DELETE
  const handleDelete = async (playerId: string) => {
    if (!confirm('Spieler wirklich löschen?')) return

    try {
      await deleteDoc(doc(db, 'players', playerId))
    } catch (error) {
      console.error('Error deleting player:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      {/* Add Form */}
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Spielername"
        />
        <Input
          type="number"
          value={technik}
          onChange={(e) => setTechnik(Number(e.target.value))}
          min={1}
          max={10}
        />
        <Button onClick={handleAdd}>
          Hinzufügen
        </Button>
      </div>

      {/* Players List */}
      <div className="grid gap-2">
        {players.map(player => (
          <div key={player.id} className="flex items-center justify-between p-4 border rounded">
            <span>{player.name}</span>
            <span>Technik: {player.technik}</span>
            <Button variant="ghost" onClick={() => handleDelete(player.id)}>
              Löschen
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

### Beispiel: Protected Route

```typescript
// app/admin/page.tsx
import { AuthGuard } from '@/components/AuthGuard'
import { AdminDashboard } from '@/components/AdminDashboard'

export default function AdminPage() {
  return (
    <AuthGuard requireAdmin>
      <AdminDashboard />
    </AuthGuard>
  )
}
```

---

### Beispiel: Custom Hook mit Error Handling

```typescript
// hooks/usePlayers.ts
'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Player } from '@/lib/types'

export function usePlayers(squadId: string) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!squadId) {
      setPlayers([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'players'),
      where('squadId', '==', squadId)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Player[]

          setPlayers(data)
          setError(null)
        } catch (err) {
          setError(err as Error)
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setError(err as Error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [squadId])

  return { players, loading, error }
}
```

---

## 📝 Coding Standards

### Naming Conventions

```typescript
// ✅ GOOD: PascalCase für Components
export function PlayerCard() {}

// ✅ GOOD: camelCase für Functions/Variables
const handleClick = () => {}
const isLoading = true

// ✅ GOOD: UPPER_CASE für Constants
const MAX_PLAYERS = 30
const API_URL = 'https://...'

// ✅ GOOD: Interfaces mit I-Prefix NICHT verwenden
interface PlayerProps {} // ✅ GOOD
interface IPlayerProps {} // ❌ BAD
```

### File Naming

```
// ✅ GOOD
components/PlayerCard.tsx       // PascalCase für Components
hooks/useAuth.ts               // camelCase für Hooks
lib/firebase.ts                // lowercase für Utils
app/squads/page.tsx            // lowercase für Routes
```

### Import Order

```typescript
// 1. React/Next
import { useState } from 'react'
import Image from 'next/image'

// 2. External Libraries
import { collection } from 'firebase/firestore'
import { User } from 'lucide-react'

// 3. Internal Libraries
import { db } from '@/lib/firebase'
import { cn } from '@/lib/utils'

// 4. Components
import { Button } from '@/components/ui/Button'
import { PlayerCard } from '@/components/PlayerCard'

// 5. Types
import type { Player, Squad } from '@/lib/types'

// 6. Styles
import './styles.css'
```

---

## 🚨 Common Pitfalls

### ❌ BAD: useEffect ohne Cleanup

```typescript
// ❌ BAD: Memory Leak!
useEffect(() => {
  onSnapshot(collection(db, 'players'), (snap) => {
    setPlayers(snap.docs)
  })
}, [])

// ✅ GOOD: Mit Cleanup
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'players'),
    (snap) => setPlayers(snap.docs)
  )
  return () => unsubscribe()
}, [])
```

### ❌ BAD: Fehlende Error Handling

```typescript
// ❌ BAD: No error handling
const deletePlayer = async (id: string) => {
  await deleteDoc(doc(db, 'players', id))
}

// ✅ GOOD: Mit Error Handling
const deletePlayer = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'players', id))
  } catch (error) {
    console.error('Error deleting player:', error)
    throw error
  }
}
```

### ❌ BAD: Unnötige Re-Renders

```typescript
// ❌ BAD: Neue Array-Referenz bei jedem Render
const filteredPlayers = players.filter(p => p.total > 20)

// ✅ GOOD: Mit useMemo
const filteredPlayers = useMemo(
  () => players.filter(p => p.total > 20),
  [players]
)
```

---

## 📚 Weitere Ressourcen

- **Next.js Docs:** https://nextjs.org/docs
- **Firebase Docs:** https://firebase.google.com/docs
- **Tailwind Docs:** https://tailwindcss.com/docs
- **TypeScript Handbook:** https://www.typescriptlang.org/docs

---

**Ende des Development Guides**

**Letzte Aktualisierung:** 2026-01-23
**Version:** 1.0.0
**Nächstes Review:** Bei größeren Architektur-Änderungen
