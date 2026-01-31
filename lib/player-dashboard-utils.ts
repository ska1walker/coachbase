import { db } from './firebase'
import { collection, doc, setDoc, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore'
import { getCollectionName } from './firebase'
import type { Player, PlayerSnapshot, MatchHistory, PlayerPosition } from './types'

// ============================================
// Match Statistics Types
// ============================================

export interface PlayerMatchStats {
  totalMatches: number           // Gesamtzahl Matches im Squad
  attendedMatches: number        // Matches mit diesem Spieler
  attendanceRate: number         // Prozent (0-100)
  wins: number
  losses: number
  draws: number
  winRate: number                // Prozent (0-100), nur bei Matches mit Ergebnis
  matchesWithResults: number     // Anzahl Matches mit eingetragenem Ergebnis
  lastMatchDate: Date | null     // Datum des letzten Einsatzes
  positionDistribution: Record<PlayerPosition, number>  // Häufigkeit pro Position
}

/**
 * Creates or updates daily snapshot for a player
 * Idempotent: safe to call multiple times per day
 * Storage: players/{playerId}/snapshots/{YYYY-MM-DD}
 */
export async function createPlayerDailySnapshot(
  playerId: string,
  squadId: string,
  player: Player
): Promise<void> {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const snapshotRef = doc(db, 'players', playerId, 'snapshots', today)

  const snapshotData: Omit<PlayerSnapshot, 'id'> = {
    playerId,
    squadId,
    date: today,
    technik: player.technik,
    fitness: player.fitness,
    spielverstaendnis: player.spielverstaendnis,
    total: player.total,
    timestamp: Timestamp.now(),
    createdAt: Timestamp.now(),
  }

  try {
    await setDoc(snapshotRef, snapshotData, { merge: true })
  } catch (error) {
    console.error('Error creating player snapshot:', error)
    throw error
  }
}

/**
 * Fetches last N days of player snapshots
 * Returns oldest-first for chronological chart display
 */
export async function fetchPlayerSnapshots(
  playerId: string,
  days: number = 30
): Promise<PlayerSnapshot[]> {
  try {
    const snapshotsRef = collection(db, 'players', playerId, 'snapshots')
    const q = query(snapshotsRef, orderBy('date', 'desc'), limit(days))

    const snapshot = await getDocs(q)

    const snapshots: PlayerSnapshot[] = []
    snapshot.forEach((doc) => {
      snapshots.push({
        id: doc.id,
        ...doc.data(),
      } as PlayerSnapshot)
    })

    // Reverse for chronological order (oldest first)
    return snapshots.reverse()
  } catch (error) {
    console.error('Error fetching player snapshots:', error)
    return []
  }
}

/**
 * Calculate trend direction for a metric
 * Returns: 'up' | 'down' | 'stable'
 */
export function calculateTrend(
  snapshots: PlayerSnapshot[],
  metric: 'technik' | 'fitness' | 'spielverstaendnis' | 'total'
): 'up' | 'down' | 'stable' {
  if (snapshots.length < 2) return 'stable'

  const recent = snapshots[snapshots.length - 1][metric]
  const previous = snapshots[snapshots.length - 2][metric]

  if (recent > previous) return 'up'
  if (recent < previous) return 'down'
  return 'stable'
}

// ============================================
// Match Statistics Functions
// ============================================

/**
 * Fetches all matches for a squad and calculates player-specific statistics
 */
export async function fetchPlayerMatchStats(
  squadId: string,
  playerId: string
): Promise<PlayerMatchStats> {
  try {
    // Fetch all matches for this squad
    const matchesRef = collection(db, getCollectionName('squads'), squadId, 'matches')
    const q = query(matchesRef, orderBy('date', 'desc'))
    const snapshot = await getDocs(q)

    const matches: MatchHistory[] = []
    snapshot.forEach((doc) => {
      matches.push({
        id: doc.id,
        ...doc.data(),
      } as MatchHistory)
    })

    return calculatePlayerMatchStats(matches, playerId)
  } catch (error) {
    console.error('Error fetching player match stats:', error)
    return getEmptyMatchStats()
  }
}

/**
 * Calculate all match statistics for a specific player
 */
function calculatePlayerMatchStats(
  matches: MatchHistory[],
  playerId: string
): PlayerMatchStats {
  const totalMatches = matches.length
  let attendedMatches = 0
  let wins = 0
  let losses = 0
  let draws = 0
  let matchesWithResults = 0
  let lastMatchDate: Date | null = null

  const positionDistribution: Record<PlayerPosition, number> = {
    'Torhüter': 0,
    'Abwehr': 0,
    'Mittelfeld': 0,
    'Angriff': 0,
  }

  for (const match of matches) {
    // Find if player was in this match and in which team
    let playerTeamIndex = -1
    let playerInMatch: Player | undefined

    for (let teamIdx = 0; teamIdx < match.teams.length; teamIdx++) {
      const team = match.teams[teamIdx]
      const player = team.players.find(p => p.id === playerId)
      if (player) {
        playerTeamIndex = teamIdx
        playerInMatch = player
        break
      }
    }

    if (playerTeamIndex === -1 || !playerInMatch) {
      // Player was not in this match
      continue
    }

    // Player attended this match
    attendedMatches++

    // Track last match date
    const matchDate = match.date?.toDate?.() || new Date(match.date as unknown as string)
    if (!lastMatchDate || matchDate > lastMatchDate) {
      lastMatchDate = matchDate
    }

    // Track position distribution
    if (playerInMatch.positions && playerInMatch.positions.length > 0) {
      // Use primary position (first in array)
      const primaryPosition = playerInMatch.positions[0] as PlayerPosition
      if (primaryPosition in positionDistribution) {
        positionDistribution[primaryPosition]++
      }
    }

    // Calculate win/loss/draw if result exists
    if (match.result?.scores && match.result.scores.length >= 2) {
      matchesWithResults++
      const playerTeamScore = match.result.scores[playerTeamIndex]
      const otherScores = match.result.scores.filter((_, idx) => idx !== playerTeamIndex)
      const maxOtherScore = Math.max(...otherScores)

      if (playerTeamScore > maxOtherScore) {
        wins++
      } else if (playerTeamScore < maxOtherScore) {
        losses++
      } else {
        draws++
      }
    }
  }

  // Calculate rates
  const attendanceRate = totalMatches > 0 ? (attendedMatches / totalMatches) * 100 : 0
  const winRate = matchesWithResults > 0 ? (wins / matchesWithResults) * 100 : 0

  return {
    totalMatches,
    attendedMatches,
    attendanceRate,
    wins,
    losses,
    draws,
    winRate,
    matchesWithResults,
    lastMatchDate,
    positionDistribution,
  }
}

/**
 * Returns empty stats object for error cases
 */
function getEmptyMatchStats(): PlayerMatchStats {
  return {
    totalMatches: 0,
    attendedMatches: 0,
    attendanceRate: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0,
    matchesWithResults: 0,
    lastMatchDate: null,
    positionDistribution: {
      'Torhüter': 0,
      'Abwehr': 0,
      'Mittelfeld': 0,
      'Angriff': 0,
    },
  }
}

/**
 * Format relative time for "last match" display
 */
export function formatRelativeTime(date: Date | null): string {
  if (!date) return 'Noch kein Einsatz'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Heute'
  if (diffDays === 1) return 'Gestern'
  if (diffDays < 7) return `Vor ${diffDays} Tagen`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `Vor ${weeks} ${weeks === 1 ? 'Woche' : 'Wochen'}`
  }

  // Format as date
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
