# SquadMatch - Setup Anleitung

## ✅ Was bereits gemacht wurde

1. ✅ Next.js Projektstruktur
2. ✅ Tailwind Design System
3. ✅ Firebase Client Config
4. ✅ Cloud Functions Code
5. ✅ Security Rules
6. ✅ TypeScript Interfaces
7. ✅ UI Komponenten (Button, Card, Input, Stepper)
8. ✅ PlayerSelectionCard
9. ✅ MatchHistory Komponente
10. ✅ BottomNav

## 🚀 App zum Laufen bringen

### 1. Dependencies installieren

```bash
cd /Users/kai/Documents/claude/squad-match
npm install
```

### 2. Development Server starten

```bash
npm run dev
```

App läuft auf: **http://localhost:3000**

### 3. Firebase Functions Setup (Optional)

Die Cloud Functions sind bereits geschrieben, müssen aber deployed werden:

```bash
# In Functions-Ordner wechseln
cd functions

# Dependencies installieren
npm install

# Functions deployen
firebase deploy --only functions
```

**Wichtig**: Du brauchst das Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
```

### 4. Security Rules deployen

```bash
# Im Hauptordner
firebase deploy --only firestore:rules
```

### 5. Ersten Admin erstellen

```bash
firebase functions:shell

# In der Shell:
setAdminRole({email: 'deine@email.com'})
```

Dann **Logout + Login** in der App!

## 📝 Was noch fehlt

### To-Do Pages (noch zu erstellen):

1. **`/squads/page.tsx`** - Squad Management
2. **`/history/page.tsx`** - Match History View
3. **`/profile/page.tsx`** - User Profile

### Aktuelle Pages:

- ✅ `/` - Login/Registrierung
- ✅ `/admin` - Admin Dashboard
- ✅ `/teams` - Team-Auswahl

## 🎯 Quick Test

### Test 1: Login
1. Öffne http://localhost:3000
2. Registriere einen neuen Account
3. Du solltest zu `/admin` weitergeleitet werden

### Test 2: Spieler anlegen
1. In `/admin`
2. Füge Testspieler hinzu
3. Prüfe ob sie in der Liste erscheinen

### Test 3: Teams generieren
1. Gehe zu `/teams`
2. Wähle Spieler aus
3. Nutze Stepper für Team-Anzahl
4. Klicke "Teams generieren"

**Hinweis**: Aktuell nutzt `/teams` noch den lokalen Algorithmus. Um die Cloud Function zu nutzen, muss der Code in `createTeams()` angepasst werden:

```typescript
// Vorher (lokal):
const createTeams = () => {
  // Snake-Draft Algorithmus lokal
}

// Nachher (Cloud Function):
const createTeams = async () => {
  const result = await generateTeams({
    squadId: 'default-squad', // TODO: Echte Squad ID
    playerIds: Array.from(selectedPlayerIds),
    teamCount
  })

  if (result.success) {
    setTeams(result.teams.map((t, idx) => ({
      players: t.players,
      totalStrength: t.totalStrength
    })))
  }
}
```

## 🔧 Nützliche Commands

```bash
# Development
npm run dev

# Build für Production
npm run build

# Production Start
npm run start

# Firebase Emulators (lokal testen)
firebase emulators:start

# Functions deployen
cd functions && firebase deploy --only functions

# Rules deployen
firebase deploy --only firestore:rules

# Logs ansehen
firebase functions:log
```

## 📱 Testing

### Mobile Testing

1. Chrome DevTools öffnen (F12)
2. Device Toolbar (Cmd+Shift+M)
3. iPhone SE wählen
4. Bottom Navigation sollte sichtbar sein

### Dark Mode Testing

1. System Dark Mode aktivieren
2. App sollte automatisch umschalten
3. Oder: Browser DevTools → Rendering → Emulate CSS media: prefers-color-scheme: dark

## 🐛 Bekannte Issues

### Issue: Firebase Functions noch nicht deployed

**Symptom**: `generateTeams()` funktioniert nicht
**Lösung**: Functions deployen oder lokalen Algorithmus nutzen

### Issue: "Permission denied" in Firestore

**Symptom**: Kann keine Daten lesen/schreiben
**Lösung**: Security Rules deployen

### Issue: Admin-Features nicht verfügbar

**Symptom**: Admin-Dashboard zeigt Fehler
**Lösung**: `setAdminRole()` ausführen + neu anmelden

## 📚 Weiterführende Dokumentation

- **ARCHITECTURE.md** - Vollständige Architektur-Dokumentation
- **README.md** - Projekt-Übersicht
- **Tailwind Config** - Design System Details

## ❓ Support

Bei Problemen:
1. Browser-Konsole prüfen (F12)
2. Firebase Console prüfen
3. ARCHITECTURE.md → Troubleshooting

---

**Status**: ✅ App ist grundsätzlich lauffähig. Cloud Functions optional.
**Nächster Schritt**: `npm install && npm run dev`
