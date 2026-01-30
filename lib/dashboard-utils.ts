import { db } from './firebase'
import { COLLECTIONS } from './collections'
import { collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy, limit, Timestamp } from 'firebase/firestore'
import type { Player, SquadSnapshot } from './types'

/**
 * Calculate average squad strength from players
 */
export function calculateAverageStrength(players: Player[]): number {
  if (players.length === 0) return 0
  const total = players.reduce((sum, player) => sum + player.total, 0)
  return Math.round((total / players.length) * 10) / 10
}

/**
 * Create or update today's snapshot for a squad
 * This should be called whenever squad page is loaded
 */
export async function createDailySnapshot(
  squadId: string,
  players: Player[]
): Promise<void> {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const avgStrength = calculateAverageStrength(players)

  try {
    // Check if snapshot for today already exists
    const snapshotsRef = collection(db, COLLECTIONS.SQUADS, squadId, 'snapshots')
    const q = query(snapshotsRef, where('date', '==', today))
    const existingSnaps = await getDocs(q)

    if (existingSnaps.empty) {
      // Create new snapshot
      await addDoc(snapshotsRef, {
        date: today,
        averageStrength: avgStrength,
        playerCount: players.length,
        timestamp: Timestamp.now(),
        createdAt: Timestamp.now(),
      })
    } else {
      // Update existing snapshot
      const snapDoc = existingSnaps.docs[0]
      await updateDoc(doc(db, COLLECTIONS.SQUADS, squadId, 'snapshots', snapDoc.id), {
        averageStrength: avgStrength,
        playerCount: players.length,
        timestamp: Timestamp.now(),
      })
    }
  } catch (error) {
    console.error('Error creating/updating snapshot:', error)
  }
}

/**
 * Fetch last N days of snapshots for a squad
 */
export async function fetchSnapshots(
  squadId: string,
  days: number = 30
): Promise<SquadSnapshot[]> {
  try {
    const snapshotsRef = collection(db, COLLECTIONS.SQUADS, squadId, 'snapshots')
    const q = query(
      snapshotsRef,
      orderBy('date', 'desc'),
      limit(days)
    )

    const snapshot = await getDocs(q)
    const snapshots: SquadSnapshot[] = []

    snapshot.forEach((doc) => {
      snapshots.push({
        id: doc.id,
        squadId,
        ...doc.data(),
      } as SquadSnapshot)
    })

    // Return in chronological order (oldest first)
    return snapshots.reverse()
  } catch (error) {
    console.error('Error fetching snapshots:', error)
    return []
  }
}
