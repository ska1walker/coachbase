# Team-Generierungs-Algorithmus Dokumentation

## Übersicht

CoachBase verwendet zwei verschiedene Algorithmen zur Team-Generierung:

1. **Advanced Team Generator** (`lib/advanced-team-generator.ts`) - Für **2 Teams**
2. **Standard Team Generator** (`lib/team-generator.ts`) - Für **3+ Teams**

Beide Algorithmen folgen dem gleichen Grundprinzip: **Strikte Teamgrößen-Parität** (gleiche Spieleranzahl pro Team, ±1 nur bei ungerader Gesamtzahl) kombiniert mit **Multi-Attribut-Balancierung**.

---

## Kern-Prinzipien

### 1. Strikte Teamgrößen-Parität

**Regel:** Teams müssen immer gleich viele Spieler haben.

- **Bei gerader Spieleranzahl (z.B. 10 Spieler):** Alle Teams haben exakt gleich viele Spieler
  - 2 Teams: 5 vs 5
  - 5 Teams: 2 vs 2 vs 2 vs 2 vs 2

- **Bei ungerader Spieleranzahl (z.B. 11 Spieler):** Maximale Differenz von 1 Spieler
  - 2 Teams: 6 vs 5
  - 3 Teams: 4 vs 4 vs 3

**Implementierung:**
- Zielgröße wird beim initialen Assignment berechnet
- Spieler werden nur Teams zugewiesen, die noch nicht voll sind
- Bei Swap-Optimierung werden nur Swaps akzeptiert, die die Größen-Parität beibehalten

### 2. Multi-Attribut-Balancierung

Teams werden nicht nur nach **Gesamtstärke** balanciert, sondern nach **allen drei Attributen einzeln**:

- **Technik** (T)
- **Fitness** (F)
- **Spielverständnis** (S)

**Ziel:** Minimiere die Durchschnitts-Differenz zwischen Teams für jedes Attribut.

### 3. Positionsverteilung

Teams sollen ausgewogene Positionen haben:

- **Torhüter (GK):** Mindestens 1 pro Team (hart)
- **Abwehr (DEF):** Mindestens 2, ideal 4
- **Mittelfeld (MID):** Mindestens 2, ideal 5
- **Angriff (ATT):** Mindestens 1, ideal 3

---

## Advanced Team Generator (2 Teams)

**Verwendet bei:** `teamCount === 2`

### Algorithmus-Phasen

#### Phase 0: Buddy-Gruppen-Verteilung

**Was sind Buddy-Gruppen?**
- Spieler, die garantiert im gleichen Team spielen sollen
- z.B. Geschwister, beste Freunde, oder Spieler die gut zusammen harmonieren

**Verteilungs-Logik:**

```
1. Berechne Ziel-Teamgrößen:
   - targetSizeA = ceil(totalPlayers / 2)  // Größeres Team bei ungerader Anzahl
   - targetSizeB = floor(totalPlayers / 2) // Kleineres Team bei ungerader Anzahl
   - maxDiff = totalPlayers % 2            // 0 für gerade, 1 für ungerade

2. Sortiere Buddy-Gruppen nach Größe (größte zuerst)

3. Validierung:
   - Wenn eine Gruppe größer ist als targetSizeA → Fehler
   - Wenn Gruppen nicht verteilt werden können ohne Parität zu brechen → Fehler

4. Greedy Bin-Packing:
   - Versuche jede Gruppe dem kleineren Team zuzuweisen
   - Prüfe dabei immer, ob Teamgröße innerhalb der Grenzen bleibt
   - Bei Gleichstand: Wähle Team, das noch Platz hat
```

**Beispiel:**
```
Spieler: 10 total
Buddy-Gruppen: [A, B, C] (3 Spieler), [D, E] (2 Spieler)
Zielgrößen: Team A = 5, Team B = 5

Schritt 1: Gruppe [A,B,C] → Team A (Team A: 3, Team B: 0)
Schritt 2: Gruppe [D,E] → Team B (Team A: 3, Team B: 2)
Restliche 5 Spieler werden in Phase 2 verteilt
```

#### Phase 1: Torhüter-Verteilung

**Ziel:** Jedes Team bekommt mindestens einen Torhüter.

```
1. Filtere alle Torhüter aus den verbleibenden Spielern

2. Verteilungs-Strategien:
   - 0 Torhüter: Weiter zu Phase 2
   - 1 Torhüter: Zu Team A
   - 2 Torhüter: 1 zu Team A, 1 zu Team B
   - 3+ Torhüter: Snake Draft nach Stärke sortiert
     * Stärkster → Team A
     * Zweitstärkster → Team B
     * Drittstärkster → Team A
     * etc.
```

**Snake Draft Beispiel:**
```
Torhüter (sortiert): [GK1: 28], [GK2: 25], [GK3: 22], [GK4: 20]

Team A: GK1 (28), GK3 (22)
Team B: GK2 (25), GK4 (20)
→ Ausgeglichen: Ø 25.0 vs Ø 22.5
```

#### Phase 2: Initial Distribution (Nicht-Torhüter)

**Strategie:** Snake Draft mit strikter Größen-Kontrolle

```
1. Sortiere alle verbleibenden Spieler nach Gesamtstärke (absteigend)

2. Berechne finale Zielgrößen (inkl. bereits zugewiesener Torhüter & Buddies):
   - targetSizeA = ceil(totalPlayers / 2)
   - targetSizeB = floor(totalPlayers / 2)

3. Snake Draft mit Kapazitätsprüfung:
   FOR each player (strongest first):
     IF teamA ist voll AND teamB nicht voll:
       → teamB.push(player)
     ELSE IF teamB ist voll AND teamA nicht voll:
       → teamA.push(player)
     ELSE (beide können aufnehmen):
       → Snake Draft Pattern:
         Round 0 (even): A, B
         Round 1 (odd):  B, A
         Round 2 (even): A, B
         etc.
```

**Beispiel mit 12 Spielern (nach GK-Verteilung):**
```
Bereits zugewiesen:
- Team A: 1 Torhüter
- Team B: 1 Torhüter

Ziel: Team A = 6, Team B = 6
Verbleibend: 10 Feldspieler [P1:27, P2:26, P3:25, P4:24, P5:23, P6:22, P7:21, P8:20, P9:19, P10:18]

Snake Draft:
Round 0: P1→A, P2→B  (A: 2, B: 2)
Round 1: P3→B, P4→A  (A: 3, B: 3)
Round 2: P5→A, P6→B  (A: 4, B: 4)
Round 3: P7→B, P8→A  (A: 5, B: 5)
Round 4: P9→A, P10→B (A: 6, B: 6) ✓
```

#### Phase 3: Swap-Optimierung

**Ziel:** Minimiere die Varianz über alle Attribute hinweg durch intelligente Spielertausche.

**Varianz-Berechnung:**
```typescript
variance =
  playerCountDiff * 10.0 +                    // HÖCHSTE Priorität
  technikDiff * 2.0 +                         // Einzelne Attribute
  fitnessDiff * 2.0 +
  spielverstaendnisDiff * 2.0 +
  positionImbalance * config.positionWeight + // Positionsverteilung
  depthPenalty * config.positionDepthWeight + // Positions-Tiefe
  strengthLevelPenalty * config.strengthLevelWeight + // Star-Verteilung
  positionPreferencePenalty * config.positionPreferenceWeight // Primärpositionen
```

**Swap-Algorithmus:**

```
1. Initialisierung:
   - currentVariance = calculateVariance(teamA, teamB)
   - maxAllowedDiff = totalPlayers % 2  // 0 oder 1

2. Iterative Verbesserung (max 1000 Iterationen):
   FOR i in teamA:
     FOR j in teamB:
       playerA = teamA[i]
       playerB = teamB[j]

       // Prüfe Hard Constraints
       IF playerA oder playerB ist in Buddy-Gruppe:
         SKIP (Buddy-Spieler dürfen nicht getauscht werden)

       IF swap verletzt Größen-Parität (sizeDiff > maxAllowedDiff):
         SKIP

       IF swap entfernt letzten Torhüter aus einem Team:
         SKIP

       IF swap entfernt komplette Positions-Coverage:
         SKIP

       // Simuliere Swap
       newTeamA = teamA - playerA + playerB
       newTeamB = teamB - playerB + playerA
       newVariance = calculateVariance(newTeamA, newTeamB)

       // Akzeptiere wenn besser
       IF newVariance < currentVariance - 0.01:
         ACCEPT swap
         currentVariance = newVariance
         BREAK (versuche nächste Iteration)

3. Abbruch-Bedingungen:
   - Maximale Iterationen erreicht (1000)
   - Keine Verbesserung in 50 Iterationen
   - Varianz unter Schwellenwert (0.5)
```

**Beispiel-Swap:**
```
Vor Swap:
Team A: [GK:25, P1:27, P2:23, P3:21, P4:19] = Ø 23.0
Team B: [GK:24, P5:26, P6:22, P7:20, P8:18] = Ø 22.0
Differenz: 1.0

Swap P4 (19) ↔ P5 (26):
Team A: [GK:25, P1:27, P2:23, P3:21, P5:26] = Ø 24.4
Team B: [GK:24, P4:19, P6:22, P7:20, P8:18] = Ø 20.6
Differenz: 3.8 → ABGELEHNT (schlechter)

Swap P1 (27) ↔ P6 (22):
Team A: [GK:25, P6:22, P2:23, P3:21, P4:19] = Ø 22.0
Team B: [GK:24, P5:26, P1:27, P7:20, P8:18] = Ø 23.0
Differenz: 1.0 → NEUTRAL (kein Vorteil)

Swap P2 (23) ↔ P7 (20):
Team A: [GK:25, P1:27, P7:20, P3:21, P4:19] = Ø 22.4
Team B: [GK:24, P5:26, P6:22, P2:23, P8:18] = Ø 22.6
Differenz: 0.2 → AKZEPTIERT! ✓
```

### Erweiterte Features (nur 2-Team-Generator)

#### 1. Position Depth Requirements

**Problem:** Ein Team könnte 5 Stürmer aber nur 1 Verteidiger haben.

**Lösung:** Penalty-System für fehlende Positions-Tiefe

```typescript
POSITION_REQUIREMENTS = {
  GK:  { min: 1, ideal: 1 },
  DEF: { min: 2, ideal: 4 },
  MID: { min: 2, ideal: 5 },
  ATT: { min: 1, ideal: 3 },
}

Penalty:
- Unter Minimum: (min - count) * 50  // KRITISCH
- Unter Ideal:   (ideal - count) * 2 // Sub-optimal
```

**Beispiel:**
```
Team mit nur 1 Verteidiger:
- Minimum = 2, Actual = 1
- Penalty = (2 - 1) * 50 = 50
- Sehr hoher Penalty → Algorithmus vermeidet diese Konstellation
```

#### 2. Strength Level Distribution

**Problem:** Ein Team könnte alle Star-Spieler haben, das andere nur schwache Spieler.

**Lösung:** Klassifiziere Spieler in Kategorien und balanciere diese.

```
Klassifizierung:
1. Sortiere alle Spieler nach Gesamtstärke
2. Top 33%    = Stars   (z.B. 27-30 Punkte)
3. Middle 33% = Average (z.B. 22-26 Punkte)
4. Bottom 33% = Weak    (z.B. 15-21 Punkte)

Berechne Imbalance:
- Star-Differenz * 3.0   (höchstes Gewicht)
- Average-Differenz * 2.0
- Weak-Differenz * 1.0
```

**Beispiel:**
```
12 Spieler total:
Stars: [30, 29, 28, 27]
Average: [25, 24, 23, 22]
Weak: [20, 19, 18, 17]

Schlechte Verteilung:
Team A: 3 Stars, 1 Average, 2 Weak
Team B: 1 Star, 3 Average, 2 Weak
→ Penalty = |3-1| * 3.0 = 6.0

Gute Verteilung:
Team A: 2 Stars, 2 Average, 2 Weak
Team B: 2 Stars, 2 Average, 2 Weak
→ Penalty = 0.0 ✓
```

#### 3. Position Preference

**Problem:** Spieler spielen am besten auf ihrer Primärposition.

**Annahme:** Erste Position im `positions` Array ist die Primärposition des Spielers.

```
Penalty wenn:
- Spieler hat keine Position definiert: +5
- Team hat zu viele Spieler für die Primärposition des Spielers: +3
  (Spieler muss wahrscheinlich auf Sekundärposition spielen)
```

**Beispiel:**
```
Spieler: { name: "Max", positions: ["Mittelfeld", "Angriff"], total: 25 }
Primärposition: "Mittelfeld"

Team hat bereits 7 Mittelfeldspieler (ideal: 5):
→ Penalty +3, weil Max wahrscheinlich als Stürmer spielen muss
```

---

## Standard Team Generator (3+ Teams)

**Verwendet bei:** `teamCount >= 3`

**Unterschiede zum Advanced Generator:**

1. **Keine Buddy-Gruppen:** Wird derzeit nur bei 2 Teams unterstützt
2. **Kein Strength Level Balancing:** Vereinfachte Logik
3. **Position Depth Requirements:** Vereinfacht, nur bei Swap-Validierung

### Algorithmus-Phasen

#### Phase 1: Initial Assignment

**Strikte Größen-Kontrolle mit Greedy-Verteilung**

```
1. Berechne Zielgrößen:
   - targetSize = floor(totalPlayers / teamCount)
   - remainder = totalPlayers % teamCount
   - Erste 'remainder' Teams bekommen +1 Spieler

Beispiel (11 Spieler, 3 Teams):
   - targetSize = floor(11/3) = 3
   - remainder = 11 % 3 = 2
   - Team 0: maxSize = 4 (index < remainder)
   - Team 1: maxSize = 4 (index < remainder)
   - Team 2: maxSize = 3 (index >= remainder)

2. Sortiere Spieler nach Gesamtstärke (absteigend)

3. Greedy Assignment mit Positions-Awareness:
   FOR each player (strongest first):
     // Finde Teams die noch Platz haben
     eligibleTeams = teams.filter(team => team.size < maxSize)

     // Wähle Team mit niedrigster Gesamtstärke
     bestTeam = min(eligibleTeams, by: totalStrength)

     // Positions-Check: Hat anderes Team diese Position dringender nötig?
     IF player hat Positionen:
       FOR each otherEligibleTeam:
         IF otherTeam.positionCount[pos] < bestTeam.positionCount[pos] - 1:
           AND strengthDiff ist nicht zu groß:
             bestTeam = otherTeam
             BREAK

     bestTeam.push(player)
```

**Beispiel:**
```
9 Spieler, 3 Teams
Zielgrößen: 3, 3, 3 (alle gleich)

Spieler sortiert: [P1:29, P2:27, P3:25, P4:23, P5:22, P6:21, P7:20, P8:19, P9:18]

Runde 1: P1→Team0, P2→Team1, P3→Team2 (alle: 1 Spieler)
Runde 2: P4→Team0, P5→Team1, P6→Team2 (alle: 2 Spieler)
Runde 3: P7→Team0, P8→Team1, P9→Team2 (alle: 3 Spieler) ✓

Resultat:
Team 0: [P1:29, P4:23, P7:20] = 72 total
Team 1: [P2:27, P5:22, P8:19] = 68 total
Team 2: [P3:25, P6:21, P9:18] = 64 total
```

#### Phase 2: Swap-Optimierung

**Unterschied zu 2-Team-Generator:**
- Testet Swaps zwischen **allen Team-Paaren** (nicht nur A↔B)
- Bei 3 Teams: A↔B, A↔C, B↔C
- Bei 4 Teams: A↔B, A↔C, A↔D, B↔C, B↔D, C↔D

```
1. Berechne maxSizeDiff:
   - maxSizeDiff = totalPlayers % teamCount === 0 ? 0 : 1

2. Multi-Team Swap Loop:
   FOR i in 0..(teamCount-1):
     FOR j in (i+1)..teamCount:
       // Versuche alle Spieler zwischen Team i und Team j zu swappen
       FOR playerAIdx in teams[i]:
         FOR playerBIdx in teams[j]:
           // Simuliere Swap
           newTeams = swap(teams, i, playerAIdx, j, playerBIdx)

           // STRIKTE Größen-Prüfung
           teamSizes = newTeams.map(t => t.length)
           IF max(teamSizes) - min(teamSizes) > maxSizeDiff:
             SKIP swap

           // Berechne neue Balance
           newImbalance = calculateImbalance(newTeams)

           IF newImbalance < currentImbalance - 0.01:
             ACCEPT swap
```

**Beispiel (3 Teams):**
```
Vor Optimierung:
Team 0: [P1:29, P6:21, P9:18] = Ø 22.7
Team 1: [P2:27, P5:22, P7:20] = Ø 23.0
Team 2: [P3:25, P4:23, P8:19] = Ø 22.3

Swap P6 (21) ↔ P5 (22):
Team 0: [P1:29, P5:22, P9:18] = Ø 23.0
Team 1: [P2:27, P6:21, P7:20] = Ø 22.7
Team 2: [P3:25, P4:23, P8:19] = Ø 22.3

Neue Varianz ist kleiner → Akzeptiert ✓
```

---

## Balance Score Berechnung

### Für 2 Teams (Advanced Generator)

**Balance Score Card** zeigt detaillierte Metriken:

```typescript
imbalance = {
  playerCountDiff: |teamA.count - teamB.count|,
  technikDiff: |teamA.avgTechnik - teamB.avgTechnik|,
  fitnessDiff: |teamA.avgFitness - teamB.avgFitness|,
  spielverstaendnisDiff: |teamA.avgSpielverstaendnis - teamB.avgSpielverstaendnis|,
  positionImbalance: Σ|teamA.posCount[pos] - teamB.posCount[pos]|,
  totalVariance: gewichtete Summe aller Differenzen
}

score = totalVariance (niedriger ist besser)

isPerfect =
  playerCountDiff ≤ 1 AND
  technikDiff < 0.5 AND
  fitnessDiff < 0.5 AND
  spielverstaendnisDiff < 0.5 AND
  positionImbalance ≤ 2
```

**Bewertungs-Skala:**
- **Score 0.0-5.0:** Perfekte Balance (grün)
- **Score 5.0-15.0:** Gute Balance (orange)
- **Score >15.0:** Akzeptable Balance (rot)

### Für 3+ Teams (Standard Generator)

**Pairwise Imbalance Calculation:**

```
Berechne Differenzen zwischen ALLEN Team-Paaren:

Bei 3 Teams (A, B, C):
- Vergleiche A↔B
- Vergleiche A↔C
- Vergleiche B↔C

totalImbalance = average(alle paarweisen Differenzen)
```

**Beispiel:**
```
Team A: Ø Technik 8.0
Team B: Ø Technik 7.5
Team C: Ø Technik 7.0

Paarweise Differenzen:
|8.0 - 7.5| = 0.5
|8.0 - 7.0| = 1.0
|7.5 - 7.0| = 0.5

Average Technik-Diff = (0.5 + 1.0 + 0.5) / 3 = 0.67
```

---

## Hard Constraints (Dürfen NIE verletzt werden)

### 1. Teamgrößen-Parität
```
WENN totalPlayers % teamCount === 0:
  → Alle Teams MÜSSEN gleich groß sein
  → maxDiff = 0

WENN totalPlayers % teamCount !== 0:
  → Maximale Differenz = 1 Spieler
  → maxDiff = 1
```

### 2. Torhüter-Verteilung (nur 2-Team-Generator)
```
Jedes Team MUSS mindestens 1 Torhüter haben
→ Swaps, die dies verletzen, werden abgelehnt
```

### 3. Positions-Coverage (nur 2-Team-Generator)
```
Jedes Team MUSS mindestens 1 Spieler in jeder Position haben:
- Mindestens 1 Abwehr-Spieler
- Mindestens 1 Mittelfeld-Spieler
- Mindestens 1 Angriffs-Spieler

→ Swaps, die komplette Position entfernen, werden abgelehnt
```

### 4. Buddy-Gruppen-Integrität (nur 2-Team-Generator)
```
Spieler in einer Buddy-Gruppe:
- MÜSSEN im gleichen Team bleiben
- DÜRFEN NICHT getauscht werden
- Werden bereits in Phase 0 zugewiesen
```

---

## Soft Constraints (Werden optimiert, aber können verletzt werden)

### 1. Attribut-Balance
**Ziel:** Minimiere Differenz der Durchschnittswerte

```
Gewichtung:
- Technik: 2.0x
- Fitness: 2.0x
- Spielverständnis: 2.0x
```

### 2. Positions-Balance
**Ziel:** Ähnliche Anzahl pro Position in jedem Team

```
Gewichtung:
- Abwehr: 1.2x (wichtig)
- Mittelfeld: 1.0x (flexibel)
- Angriff: 1.1x (wichtig)
- Torhüter: 1.5x (kritisch)
```

### 3. Position Depth (nur Advanced)
**Ziel:** Jedes Team hat genug Spieler für jede Position

```
Ideal-Werte bieten taktische Flexibilität:
- 4 Abwehr-Spieler → Kann 4er-Kette spielen
- 5 Mittelfeld-Spieler → Kann Mittelfeld dominieren
- 3 Angriffs-Spieler → Kann 3er-Sturm spielen
```

### 4. Strength Level Distribution (nur Advanced)
**Ziel:** Stars, Average, und Weak-Spieler gleichmäßig verteilen

```
Verhindert "Super-Team" Effekt:
- Nicht alle Stars in einem Team
- Nicht alle schwachen Spieler in einem Team
```

---

## Komplexitäts-Analyse

### Advanced Team Generator (2 Teams)

**Zeit-Komplexität:**
- Phase 0 (Buddies): O(b) wo b = Anzahl Buddy-Gruppen
- Phase 1 (GK): O(g log g) wo g = Anzahl Torhüter
- Phase 2 (Initial): O(n log n) wo n = Anzahl Spieler
- Phase 3 (Swaps): O(i * n²) wo i = Iterationen (max 1000)
- **Gesamt: O(n²)** für typische Fälle

**Speicher-Komplexität:** O(n)

**Typische Laufzeit:**
- 10 Spieler: ~50-200 Iterationen, <100ms
- 20 Spieler: ~200-500 Iterationen, <500ms
- 30 Spieler: ~500-1000 Iterationen, ~1-2s

### Standard Team Generator (3+ Teams)

**Zeit-Komplexität:**
- Phase 1 (Initial): O(n log n)
- Phase 2 (Swaps): O(i * t² * n²) wo t = teamCount
- **Gesamt: O(t² * n²)**

**Typische Laufzeit:**
- 12 Spieler, 3 Teams: ~100-300 Iterationen, <200ms
- 20 Spieler, 4 Teams: ~300-600 Iterationen, ~500ms

---

## Beispiel-Durchlauf (2 Teams, 10 Spieler)

### Input
```
Spieler:
GK1: [Torhüter] T:9 F:8 S:7 = 24
P1:  [Mittelfeld, Angriff] T:10 F:9 S:9 = 28
P2:  [Abwehr, Mittelfeld] T:8 F:9 S:9 = 26
P3:  [Angriff] T:9 F:8 S:8 = 25
GK2: [Torhüter] T:8 F:7 S:7 = 22
P4:  [Mittelfeld] T:8 F:7 S:8 = 23
P5:  [Abwehr] T:7 F:8 S:7 = 22
P6:  [Angriff] T:7 F:7 F:7 = 21
P7:  [Mittelfeld] T:7 F:6 S:7 = 20
P8:  [Abwehr] T:6 F:7 S:6 = 19

Buddy-Gruppen: [P1, P4] (müssen zusammen spielen)
```

### Ausführung

**Phase 0: Buddy-Verteilung**
```
Gruppe [P1:28, P4:23] (2 Spieler, Gesamt: 51)
Zielgrößen: targetA=5, targetB=5

Team A: [] (0 Spieler)
Team B: [] (0 Spieler)

→ Team A ist kleiner, kann 2 aufnehmen
→ Team A = [P1:28, P4:23] ✓
```

**Phase 1: Torhüter-Verteilung**
```
Torhüter: [GK1:24, GK2:22]
→ GK1 → Team A
→ GK2 → Team B

Team A: [P1:28, P4:23, GK1:24] (3 Spieler)
Team B: [GK2:22] (1 Spieler)
```

**Phase 2: Initial Distribution**
```
Verbleibend: [P2:26, P3:25, P5:22, P6:21, P7:20, P8:19]
Zielgrößen: targetA=5, targetB=5

Snake Draft:
Round 0: P2→A, P3→B  (A:4, B:2)
Round 1: P5→B, P6→A  (A:5 VOLL, B:3)
Round 2: P7→B, P8→B  (A:5, B:5) ✓

Team A: [P1:28, P4:23, GK1:24, P2:26, P6:21] = 122 total
Team B: [GK2:22, P3:25, P5:22, P7:20, P8:19] = 108 total
```

**Phase 3: Swap-Optimierung**
```
Initiale Varianz = 15.2

Iteration 1:
- Teste Swap P4(23) ↔ P7(20)
  Team A: [P1, P7, GK1, P2, P6] = 119 → Ø 23.8
  Team B: [GK2, P3, P5, P4, P8] = 111 → Ø 22.2
  Neue Varianz = 12.8 → AKZEPTIERT ✓

Iteration 2:
- Teste Swap P6(21) ↔ P5(22)
  Team A: [P1, P7, GK1, P2, P5] = 120 → Ø 24.0
  Team B: [GK2, P3, P6, P4, P8] = 110 → Ø 22.0
  Neue Varianz = 13.1 → ABGELEHNT (schlechter)

... (weitere Iterationen)

Iteration 47:
- Teste Swap P2(26) ↔ P3(25)
  Team A: [P1, P7, GK1, P3, P6] = 121 → Ø 24.2
  Team B: [GK2, P2, P5, P4, P8] = 109 → Ø 21.8
  Neue Varianz = 10.5 → AKZEPTIERT ✓

Keine Verbesserung in letzten 50 Iterationen → STOPP
```

### Output
```
Team A (5 Spieler):
- P1 (Mittelfeld): 28
- P7 (Mittelfeld): 20
- GK1 (Torhüter): 24
- P3 (Angriff): 25
- P6 (Angriff): 21
Gesamt: 118, Ø 23.6
Positionen: GK:1, MID:2, ATT:2

Team B (5 Spieler):
- GK2 (Torhüter): 22
- P2 (Abwehr): 26
- P5 (Abwehr): 22
- P4 (Mittelfeld): 23
- P8 (Abwehr): 19
Gesamt: 112, Ø 22.4
Positionen: GK:1, DEF:3, MID:1

Balance Score:
- Spieler-Differenz: 0 ✓
- Durchschnitts-Differenz: 1.2
- Technik-Diff: 0.8
- Fitness-Diff: 0.6
- Spielverst.-Diff: 0.9
- Score: 8.2 (GUTE BALANCE)
```

---

## Wichtige Edge Cases

### 1. Ungerade Spieleranzahl
```
11 Spieler, 2 Teams:
→ Team A: 6 Spieler
→ Team B: 5 Spieler
→ Differenz: 1 (erlaubt) ✓

11 Spieler, 3 Teams:
→ Team A: 4 Spieler
→ Team B: 4 Spieler
→ Team C: 3 Spieler
→ Max Differenz: 1 (erlaubt) ✓
```

### 2. Nur 1 Torhüter (2 Teams)
```
Spieler: 10 total, davon 1 GK

Phase 1: GK → Team A
Team A: [GK] (1 Spieler)
Team B: [] (0 Spieler)

Phase 2: Verteile 9 Feldspieler
→ Team B bekommt mehr Spieler initial (4 vs 4)
→ Finale Größen: 5 vs 5 ✓

ABER: Team B hat keinen Torhüter!
→ Wird in UI mit Warnung angezeigt
```

### 3. Zu große Buddy-Gruppe
```
10 Spieler, Buddy-Gruppe mit 6 Spielern:
→ targetSizeA = 5, targetSizeB = 5
→ Gruppe (6) > targetSizeA (5)
→ FEHLER: "Buddy-Gruppe zu groß!"
```

### 4. Weniger Spieler als Teams
```
8 Spieler, 3 Teams:
→ targetSize = 2
→ remainder = 2
→ Team Größen: 3, 3, 2 ✓

5 Spieler, 3 Teams:
→ targetSize = 1
→ remainder = 2
→ Team Größen: 2, 2, 1 ✓
```

---

## Performance-Optimierungen

### 1. Early Exit bei guter Balance
```typescript
if (currentImbalance.totalScore < 1.0) {
  break // Balance ist bereits sehr gut
}
```

### 2. No-Improvement Counter
```typescript
if (!improved) {
  noImprovementCount++
}
if (noImprovementCount >= 50) {
  break // Lokales Optimum erreicht
}
```

### 3. Varianz-Schwellenwert
```typescript
while (currentVariance > config.varianceThreshold) {
  // Default threshold: 0.5
}
```

### 4. Greedy First-Fit bei Eligible Teams
```typescript
// Statt alle Teams zu testen, nur Teams die Platz haben
eligibleTeams = teams.filter(t => t.size < maxSize)
bestTeam = min(eligibleTeams, by: totalStrength)
```

---

## Konfiguration

### Advanced Generator Config
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
  positionDepthWeight: 3.0,        // Hoch: Positions-Tiefe wichtig
  strengthLevelWeight: 2.5,         // Hoch: Star-Verteilung wichtig
  positionPreferenceWeight: 1.5,    // Mittel: Primärpositionen bevorzugt
}
```

**Anpassung der Config:**
```typescript
// Fokus auf Attribut-Balance (weniger auf Positionen)
const customConfig = {
  attributeWeight: { technik: 2.0, fitness: 2.0, spielverstaendnis: 2.0 },
  positionWeight: 1.0,
}

generateBalancedTeams(players, customConfig, buddyGroups)
```

---

## Garantien

### Was der Algorithmus IMMER garantiert:

✅ **Gleiche Teamgrößen** (±1 nur bei ungerader Anzahl)
✅ **Jedes Team hat mindestens 1 Torhüter** (bei 2 Teams, wenn möglich)
✅ **Jedes Team hat Positions-Coverage** (bei 2 Teams, wenn möglich)
✅ **Buddy-Gruppen bleiben zusammen** (bei 2 Teams)
✅ **Algorithmus terminiert** (max 1000 Iterationen)

### Was der Algorithmus VERSUCHT (aber nicht garantiert):

⚡ Perfekte Attribut-Balance (kann durch Constraints limitiert sein)
⚡ Ideale Positions-Tiefe (abhängig von verfügbaren Spielern)
⚡ Gleichmäßige Star-Verteilung (bei wenigen Spielern schwierig)

---

## Testing & Validierung

### Empfohlene Test-Szenarien

1. **Basis-Tests:**
   - 10 Spieler, 2 Teams, keine Buddies
   - 11 Spieler, 2 Teams, keine Buddies (ungerade)
   - 12 Spieler, 3 Teams, keine Buddies
   - 13 Spieler, 3 Teams, keine Buddies (ungerade)

2. **Buddy-Tests:**
   - 10 Spieler, 1 Buddy-Gruppe (2 Spieler)
   - 12 Spieler, 2 Buddy-Gruppen (je 2 Spieler)
   - Edge: Buddy-Gruppe zu groß (sollte Fehler werfen)

3. **Position-Tests:**
   - Nur 1 Torhüter (beide Teams sollten trotzdem gleich groß sein)
   - Viele Torhüter (z.B. 4 Torhüter bei 10 Spielern)
   - Unausgewogene Positionen (8 Stürmer, 2 Verteidiger)

4. **Stress-Tests:**
   - 30 Spieler, 2 Teams
   - 40 Spieler, 5 Teams
   - 100 Spieler, 10 Teams

### Beispiel-Validierung
```typescript
const result = generateBalancedTeams(players, {}, buddyGroups)

// Prüfe Teamgrößen
const sizeDiff = Math.abs(result.teamA.stats.playerCount - result.teamB.stats.playerCount)
const maxAllowedDiff = players.length % 2
assert(sizeDiff <= maxAllowedDiff, "Team size parity violated!")

// Prüfe Buddy-Gruppen
buddyGroups.forEach(group => {
  const inTeamA = group.playerIds.every(id =>
    result.teamA.players.some(p => p.id === id)
  )
  const inTeamB = group.playerIds.every(id =>
    result.teamB.players.some(p => p.id === id)
  )
  assert(inTeamA || inTeamB, "Buddy group split across teams!")
})

// Prüfe Balance Score
const scoreCard = generateBalanceScoreCard(result.teamA, result.teamB)
console.log(`Balance Score: ${scoreCard.score}`)
console.log(`Is Perfect: ${scoreCard.isPerfect}`)
```

---

## Zukünftige Verbesserungen

### Mögliche Erweiterungen:

1. **Buddy-Gruppen für 3+ Teams**
   - Erweitere Standard Generator um Buddy-Gruppen-Support
   - Komplexere Bin-Packing-Logik erforderlich

2. **Genetischer Algorithmus**
   - Für sehr große Spielerzahlen (50+)
   - Population-basierte Optimierung statt Greedy

3. **Maschinelles Lernen**
   - Lerne aus historischen Matches
   - Berücksichtige Spieler-Chemie und Zusammenspiel

4. **Custom Constraints**
   - Coach kann eigene Regeln definieren
   - z.B. "Max 2 Anfänger pro Team"

5. **Multi-Objective Optimization**
   - Pareto-Front für Trade-offs zwischen Zielen
   - UI zeigt mehrere Balance-Optionen zur Auswahl

---

## Fehlerbehandlung

### Häufige Fehler

**1. "Buddy-Gruppe zu groß"**
```
Ursache: Gruppe hat mehr Spieler als halbe Teamgröße
Lösung: Reduziere Buddy-Gruppe oder füge mehr Spieler hinzu
```

**2. "Nicht genug Spieler"**
```
Ursache: players.length < teamCount
Lösung: Reduziere Teamanzahl oder füge mehr Spieler hinzu
```

**3. "Buddy-Verteilung würde zu ungleichen Teams führen"**
```
Ursache: Buddy-Gruppen-Größen passen nicht zur Gesamt-Spielerzahl
Beispiel: 10 Spieler, Gruppen [7, 3] → unmöglich auf 5-5 zu verteilen
Lösung: Passe Buddy-Gruppen-Größen an
```

---

## Zusammenfassung

**Kern-Philosophie:**
1. **Fairness durch gleiche Teamgrößen** (oberste Priorität)
2. **Balance über alle Dimensionen** (Stärke, Attribute, Positionen)
3. **Flexibilität durch Soft Constraints** (Optimierung statt harte Regeln)
4. **Transparenz durch Score Card** (Nutzer sieht Balance-Qualität)

Der Algorithmus ist **deterministisch** bei gleicher Eingabe (gleiche Sortierung) und liefert **reproduzierbare Ergebnisse**. Die Optimierung konvergiert typischerweise in wenigen hundert Iterationen zu einer sehr guten Lösung.
