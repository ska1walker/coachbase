# Advanced Team Generator v2.0

> Algorithmus für faire Fußballteam-Generierung mit attribute-level balancing

**Version:** 2.0.0
**Entwickelt:** 2026-01-23
**Datei:** `lib/advanced-team-generator.ts`

---

## 🎯 Überblick

Der **Advanced Team Generator v2.0** ist eine Weiterentwicklung des ursprünglichen Team-Generators mit Fokus auf:

1. **Harte Constraints** (MUSS erfüllt werden)
2. **Attribute-Level Balancing** (nicht nur Total Score)
3. **Swap-Mechanismus** mit Variance-Minimierung

---

## ✨ Features

### 1. Harte Constraints (Hard Rules)

✅ **Torhüter-Verteilung**
- Jedes Team erhält (wenn möglich) **genau 1 Torhüter**
- Bei nur 1 Torhüter: Wird Team A zugewiesen
- Bei 2 Torhütern: Perfekte 1:1 Verteilung
- Bei 3+ Torhütern: Snake-Draft nach Stärke

✅ **Team-Größe**
- Teams müssen **gleich groß** sein (+/- 1 Spieler)
- Bei ungerader Spielerzahl: Differenz = 1 (akzeptabel)

✅ **Positions-Abdeckung**
- Jedes Team benötigt Spieler in **DEF, MID, ATT**
- Flexible Positionen werden genutzt um Lücken zu füllen
- Vermeidet: Team aus nur Stürmern

---

### 2. Optimierungs-Ziele (Soft Constraints)

Der Algorithmus balanciert **JEDES Attribut separat**:

📊 **Technik-Durchschnitt** muss fast identisch sein
📊 **Fitness-Durchschnitt** muss fast identisch sein
📊 **Spielverständnis-Durchschnitt** muss fast identisch sein

**Vermieden wird:**
- ❌ Team A: Super fit, aber technisch schwach
- ❌ Team B: Technisch stark, aber langsam

**Stattdessen:**
- ✅ Beide Teams: Ausgeglichene Attribute

---

### 3. Drei-Phasen Algorithmus

#### Phase 1: Torhüter-Verteilung
```typescript
distributeGoalkeepers(players)
```
- Separiert Torhüter von Feld-Spielern
- Verteilt Torhüter fair (1:1 wenn möglich)
- Basis für faire Teams

#### Phase 2: Initial Distribution
```typescript
initialDistribution(nonGoalkeepers, teamA, teamB)
```
- Snake-Draft Algorithmus
- Sortiert nach Gesamtstärke (descending)
- Abwechselnde Zuweisung mit Position-Awareness

#### Phase 3: Swap-Optimierung
```typescript
optimizeThroughSwaps(teamA, teamB, config)
```
- Bis zu 1000 Iterationen (konfigurierbar)
- Versucht alle möglichen Spieler-Swaps
- Akzeptiert Swap nur wenn Variance sinkt
- Stoppt bei Variance < Threshold oder 50 Iterationen ohne Verbesserung

---

## 📊 Variance Calculation

Die **Variance** (Imbalance) wird berechnet als gewichtete Summe:

```typescript
totalVariance =
  playerCountDiff × 10.0 +      // Höchste Priorität!
  technikDiff × 2.0 +
  fitnessDiff × 2.0 +
  spielverstaendnisDiff × 2.0 +
  positionImbalance × 2.0
```

**Ziel:** Variance → 0 (perfekte Balance)

---

## 🚀 Usage

### Basic Usage

```typescript
import { generateBalancedTeams, generateBalanceScoreCard, printBalanceScoreCard } from '@/lib/advanced-team-generator'
import type { Player } from '@/lib/types'

// Deine Spieler-Liste
const players: Player[] = [
  {
    id: '1',
    name: 'Manuel Neuer',
    technik: 7,
    fitness: 6,
    spielverstaendnis: 9,
    total: 22,
    positions: ['Torhüter'],
    // ... rest
  },
  // ... more players
]

// Teams generieren
const result = generateBalancedTeams(players)

// Balance Score Card
const scoreCard = generateBalanceScoreCard(result.teamA, result.teamB)

// Ausgabe
console.log(printBalanceScoreCard(scoreCard))
```

---

### Mit Custom Config

```typescript
const result = generateBalancedTeams(players, {
  maxSwapIterations: 2000,        // Default: 1000
  varianceThreshold: 0.1,         // Default: 0.5 (stoppe wenn < threshold)
  positionWeight: 3.0,            // Default: 2.0
  attributeWeight: {
    technik: 2.0,                 // Default: 1.0
    fitness: 2.0,                 // Default: 1.0
    spielverstaendnis: 2.0,       // Default: 1.0
  },
})
```

---

## 📋 API Reference

### `generateBalancedTeams(players, config?)`

**Input:**
- `players: Player[]` - Liste von Spielern
- `config?: Partial<GeneratorConfig>` - Optional config

**Output:**
```typescript
{
  teamA: BalancedTeam,
  teamB: BalancedTeam
}
```

**BalancedTeam:**
```typescript
{
  players: Player[],
  stats: TeamStats
}
```

**TeamStats:**
```typescript
{
  playerCount: number
  totalStrength: number
  avgTechnik: number
  avgFitness: number
  avgSpielverstaendnis: number
  positionCounts: { GK, DEF, MID, ATT }
  hasGoalkeeper: boolean
}
```

---

### `generateBalanceScoreCard(teamA, teamB)`

**Input:**
- `teamA: BalancedTeam`
- `teamB: BalancedTeam`

**Output:**
```typescript
{
  teamA: TeamStats
  teamB: TeamStats
  imbalance: {
    playerCountDiff: number
    technikDiff: number
    fitnessDiff: number
    spielverstaendnisDiff: number
    totalVariance: number
    positionImbalance: number
  }
  isPerfect: boolean
  score: number  // Lower is better
}
```

---

### `printBalanceScoreCard(scoreCard)`

**Input:**
- `scoreCard: BalanceScoreCard`

**Output:**
- `string` - Formatted ASCII table

**Beispiel Output:**
```
╔══════════════════════════════════════════════════════╗
║          BALANCE SCORE CARD                          ║
╠══════════════════════════════════════════════════════╣
║  Status: ✅ PERFECT                                  ║
║  Score:  2.45 (lower is better)                      ║
╠══════════════════════════════════════════════════════╣
║  TEAM A                      TEAM B                  ║
╠══════════════════════════════════════════════════════╣
║  Players: 11               Players: 11               ║
║  Technik: 6.82             Technik: 6.73             ║
║  Fitness: 7.09             Fitness: 7.18             ║
║  Spielv.: 7.45             Spielv.: 7.36             ║
╠══════════════════════════════════════════════════════╣
║  POSITIONS                                           ║
╠══════════════════════════════════════════════════════╣
║  GK:  1                    GK:  1                    ║
║  DEF: 4                    DEF: 4                    ║
║  MID: 5                    MID: 4                    ║
║  ATT: 3                    ATT: 4                    ║
╚══════════════════════════════════════════════════════╝
```

---

## 🧪 Testing

### Unit Tests

**Location:** `lib/__tests__/advanced-team-generator.test.ts`

**Test Scenarios:**
1. ✅ Odd number of players
2. ✅ Player with very high values (outlier)
3. ✅ Players with multiple positions
4. ✅ Only one goalkeeper
5. ✅ No goalkeepers
6. ✅ Perfect balance scenario
7. ✅ Edge cases (2 players, 22 players, all same position)
8. ✅ Custom configuration

**Run Tests:**
```bash
# Install dependencies first
npm install --save-dev @jest/globals jest ts-jest

# Run tests
npm test -- advanced-team-generator
```

---

### Examples

**Location:** `lib/examples/team-generator-example.ts`

**Run Examples:**
```bash
npx ts-node lib/examples/team-generator-example.ts
```

**Verfügbare Beispiele:**
- `example1_BalancedTeams()` - 11 vs 11 balanced teams
- `example2_OutlierPlayer()` - Team with superstar (Messi)
- `example3_OddPlayers()` - Odd number (7 players)
- `example4_VersatilePlayers()` - Multiple positions
- `example5_CustomConfig()` - Custom configuration

---

## ⚙️ Configuration

### GeneratorConfig

```typescript
interface GeneratorConfig {
  maxSwapIterations: number     // Max iterations für Swap-Phase
  varianceThreshold: number     // Stop wenn variance < threshold
  positionWeight: number        // Weight für Position-Imbalance
  attributeWeight: {
    technik: number
    fitness: number
    spielverstaendnis: number
  }
}
```

### Default Config

```typescript
{
  maxSwapIterations: 1000,
  varianceThreshold: 0.5,
  positionWeight: 2.0,
  attributeWeight: {
    technik: 1.0,
    fitness: 1.0,
    spielverstaendnis: 1.0,
  },
}
```

---

## 📊 Performance

### Benchmarks

**Setup:**
- MacBook Pro M1
- Node.js 20.x
- TypeScript 5.3

**Results:**
- **10 Players:** < 10ms
- **22 Players:** < 50ms
- **40 Players:** < 200ms (mit 1000 iterations)

**Optimierungen:**
- Early exit bei variance < threshold
- Max 50 iterations ohne Verbesserung
- Effiziente Array-Operationen

---

## 🆚 Vergleich zu v1.0

| Feature | v1.0 (team-generator.ts) | v2.0 (advanced-team-generator.ts) |
|---------|--------------------------|-----------------------------------|
| **Torhüter-Constraint** | ⚠️ Berücksichtigt | ✅ Garantiert (1:1) |
| **Attribute-Balance** | ⚠️ Via Total Score | ✅ Jedes Attribut separat |
| **Position-Coverage** | ✅ Ja | ✅ Ja (verbessert) |
| **Swap-Mechanismus** | ✅ Ja | ✅ Ja (verfeinert) |
| **Balance Score Card** | ❌ Nein | ✅ Ja |
| **Unit Tests** | ❌ Nein | ✅ Ja (umfassend) |
| **Custom Config** | ⚠️ Limitiert | ✅ Vollständig |
| **Variance Metric** | ✅ Basis | ✅ Erweitert |

---

## 🔬 Algorithmus-Details

### Swap-Validierung

Ein Swap ist nur **valid** wenn:

1. ✅ Team-Größe bleibt ±1
2. ✅ Beide Teams behalten mindestens 1 Torhüter
3. ✅ Beide Teams behalten Position-Coverage (DEF, MID, ATT)

### Variance-Minimierung

Der Algorithmus akzeptiert einen Swap **nur wenn:**

```typescript
newVariance < currentVariance - 0.01
```

**Stoppt wenn:**
- Max Iterations erreicht (1000)
- 50 Iterationen ohne Verbesserung
- Variance < Threshold (0.5)

---

## 💡 Best Practices

### 1. Spieler-Daten Qualität

✅ **DO:**
- Präzise Attribute (1-10)
- Korrekte Positionen
- Mindestens 1 Position pro Spieler

❌ **DON'T:**
- Alle Spieler mit gleichen Werten
- Fehlende Positionen
- Unrealistische Outlier (10-10-10 für alle)

---

### 2. Configuration Tuning

**Für schnelle Generierung:**
```typescript
{ maxSwapIterations: 500 }
```

**Für höchste Qualität:**
```typescript
{
  maxSwapIterations: 2000,
  varianceThreshold: 0.1,
}
```

**Für Position-Fokus:**
```typescript
{
  positionWeight: 3.0,
}
```

---

### 3. Balance Prüfung

Immer **Balance Score Card** ausgeben:

```typescript
const scoreCard = generateBalanceScoreCard(teamA, teamB)

if (scoreCard.isPerfect) {
  console.log('✅ Teams sind perfekt balanced!')
} else if (scoreCard.score < 5.0) {
  console.log('✅ Teams sind gut balanced')
} else {
  console.log('⚠️ Teams könnten besser balanced sein')
  console.log(printBalanceScoreCard(scoreCard))
}
```

---

## 🐛 Known Limitations

### 1. Nur 2 Teams
**Aktuell:** Algorithmus generiert nur 2 Teams.
**Future:** Multi-Team Support (3+ Teams)

### 2. Goalkeeper Constraint
**Aktuell:** Beide Teams brauchen mindestens 1 GK für Swaps.
**Impact:** Bei nur 1 GK können keine Swaps mit GK gemacht werden.

### 3. Performance bei 50+ Spielern
**Aktuell:** Bei sehr vielen Spielern (50+) kann es langsam werden.
**Lösung:** `maxSwapIterations` reduzieren oder timeout implementieren.

---

## 🔮 Future Enhancements

### Geplante Features

- [ ] **Multi-Team Support** (3-10 Teams gleichzeitig)
- [ ] **Custom Attribute Weights** pro Team
- [ ] **Position Roles** (z.B. "Defensive Midfielder" vs "Offensive Midfielder")
- [ ] **Player Preferences** (wer will mit wem spielen?)
- [ ] **Fatigue System** (Spieler nach vorherigem Match müder)
- [ ] **Historical Balance** (Balance über mehrere Matches)
- [ ] **Web Worker Support** (für große Spielerlisten)
- [ ] **Real-time Progress** (Callback für Optimization-Progress)

---

## 📞 Support

**Fragen oder Probleme?**
- Check Unit Tests für Beispiele
- Check `lib/examples/` für Usage
- Erstelle GitHub Issue mit:
  - Player-Daten (anonymisiert)
  - Erwartetes vs. Aktuelles Ergebnis
  - Balance Score Card Output

---

## 📄 License

Part of CoachBase Project
© 2026 Kai (@ska1walker)

---

**Version:** 2.0.0
**Letzte Aktualisierung:** 2026-01-23
**Nächstes Review:** Nach User-Feedback
