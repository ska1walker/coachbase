# 🚀 Vercel Environment Setup

## Erforderlich: Environment Variables in Vercel setzen

Um Dev/Prod Daten-Trennung zu aktivieren, musst du in Vercel folgende Environment Variable setzen:

### 📝 Schritt-für-Schritt Anleitung:

1. **Gehe zu Vercel Dashboard:**
   ```
   https://vercel.com/dein-team/squad-match/settings/environment-variables
   ```

2. **Füge neue Environment Variable hinzu:**

   **Name:**
   ```
   NEXT_PUBLIC_FIRESTORE_PREFIX
   ```

   **Value für Preview:**
   ```
   dev_
   ```

   **Value für Production:**
   ```
   (leer lassen - kein Wert)
   ```

3. **Environment Selection:**
   - ✅ **Preview** → Value: `dev_`
   - ✅ **Production** → Value: `` (leer)
   - ⚠️ **Development** → NICHT in Vercel (nutzt .env.local)

### 🖼️ Visual Guide:

```
┌─────────────────────────────────────────┐
│ Add Environment Variable                │
├─────────────────────────────────────────┤
│                                         │
│ Name: NEXT_PUBLIC_FIRESTORE_PREFIX      │
│                                         │
│ Value (Preview):   dev_                 │
│ Value (Production): [leave empty]       │
│                                         │
│ Environments:                           │
│ ☑ Preview                               │
│ ☑ Production                            │
│ ☐ Development                           │
│                                         │
│         [Save] [Cancel]                 │
└─────────────────────────────────────────┘
```

---

## ✅ Überprüfung

Nach dem Setup:

### Preview Environment:
- URL: `squad-match-xyz-preview.vercel.app`
- Nutzt Collections: `dev_squads`, `dev_players`, `dev_squadInvites`
- Firestore Console → Siehst du `dev_*` Collections

### Production Environment:
- URL: `squad-match.vercel.app`
- Nutzt Collections: `squads`, `players`, `squadInvites`
- Firestore Console → Siehst du normale Collections

---

## 🔧 Lokale Entwicklung

Bereits eingerichtet via `.env.local`:

```bash
NEXT_PUBLIC_FIRESTORE_PREFIX=dev_
```

**Test lokal:**
```bash
npm run dev
# → Nutzt dev_* Collections
```

---

## 🚨 Wichtig nach Environment Variable Setup:

Nach dem Hinzufügen der Environment Variable in Vercel:

1. **Trigger Re-Deploy:**
   ```bash
   git commit --allow-empty -m "Trigger redeploy for env vars"
   git push origin develop
   ```

2. **Oder in Vercel UI:**
   - Gehe zu Deployments
   - Klicke auf "Redeploy" beim letzten Deployment

**Grund:** Environment Variables werden nur beim Build-Zeit eingebettet!

---

## 📊 Wie es funktioniert

### Code (`lib/firebase.ts`):
```typescript
const ENV_PREFIX = process.env.NEXT_PUBLIC_FIRESTORE_PREFIX || ''

export const getCollectionName = (baseName: string): string => {
  return `${ENV_PREFIX}${baseName}`
}
```

### Ergebnis:

| Environment | ENV_PREFIX | Input | Output |
|-------------|------------|-------|--------|
| **Production** | `''` | `'squads'` | `'squads'` |
| **Preview** | `'dev_'` | `'squads'` | `'dev_squads'` |
| **Local** | `'dev_'` | `'squads'` | `'dev_squads'` |

---

## 🎯 Vorteile dieser Lösung:

✅ **Build-Time Evaluation** - Keine Runtime-Detection nötig
✅ **Kein SSR-Problem** - Env vars sind zur Build-Zeit statisch
✅ **Vercel-Native** - Nutzt Vercel's Environment System
✅ **Einfach** - Ein Variable, klare Werte
✅ **Sicher** - Production bleibt unberührt

---

## 🆘 Troubleshooting

### "Preview nutzt Production-Daten"
→ Environment Variable nicht gesetzt oder Re-Deploy vergessen

### "Kann keine Squads sehen"
→ Falsche Collection (dev_squads vs squads) - Check Firestore Console

### "Local nutzt Production-Daten"
→ `.env.local` fehlt oder falsch gesetzt

---

**Erstellt:** 2026-01-29
**Letzte Aktualisierung:** 2026-01-29
