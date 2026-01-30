import { db } from './firebase'
import { collection, doc, setDoc, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore'
import type { Player, PlayerSnapshot } from './types'

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
