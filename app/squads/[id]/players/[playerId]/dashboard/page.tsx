'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/collections'
import { doc, getDoc } from 'firebase/firestore'
import { AuthGuard } from '@/components/AuthGuard'
import { AppHeader } from '@/components/AppHeader'
import { PageLayout } from '@/components/PageLayout'
import { BottomNav } from '@/components/BottomNav'
import { BackButton } from '@/components/ui/BackButton'
import { User, Share2 } from 'lucide-react'
import Link from 'next/link'
import type { Player, Squad, PlayerSnapshot } from '@/lib/types'
import { PlayerStatsCards } from '@/components/player-dashboard/PlayerStatsCards'
import { PlayerDevelopmentChart } from '@/components/player-dashboard/PlayerDevelopmentChart'
import { PlayerMatchStats } from '@/components/player-dashboard/PlayerMatchStats'
import { PlayerPositionChart } from '@/components/player-dashboard/PlayerPositionChart'
import {
  createPlayerDailySnapshot,
  fetchPlayerSnapshots,
  fetchPlayerMatchStats,
  type PlayerMatchStats as MatchStatsType
} from '@/lib/player-dashboard-utils'

function PlayerDashboardContent() {
  const router = useRouter()
  const params = useParams()
  const squadId = params.id as string
  const playerId = params.playerId as string

  const [squad, setSquad] = useState<Squad | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [snapshots, setSnapshots] = useState<PlayerSnapshot[]>([])
  const [matchStats, setMatchStats] = useState<MatchStatsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingSnapshots, setLoadingSnapshots] = useState(false)
  const [loadingMatchStats, setLoadingMatchStats] = useState(false)

  // Load squad info
  useEffect(() => {
    if (!squadId) return

    const loadSquad = async () => {
      try {
        const squadDoc = await getDoc(doc(db, COLLECTIONS.SQUADS, squadId))
        if (squadDoc.exists()) {
          setSquad({
            id: squadDoc.id,
            ...squadDoc.data(),
          } as Squad)
        } else {
          router.push('/squads')
        }
      } catch (error) {
        console.error('Error loading squad:', error)
        router.push('/squads')
      }
    }

    loadSquad()
  }, [squadId, router])

  // Load player data
  useEffect(() => {
    if (!playerId) return

    const loadPlayer = async () => {
      try {
        const playerDoc = await getDoc(doc(db, COLLECTIONS.PLAYERS, playerId))
        if (playerDoc.exists()) {
          const playerData = {
            id: playerDoc.id,
            ...playerDoc.data(),
          } as Player
          setPlayer(playerData)
          setLoading(false)
        } else {
          router.push(`/squads/${squadId}`)
        }
      } catch (error) {
        console.error('Error loading player:', error)
        router.push(`/squads/${squadId}`)
      }
    }

    loadPlayer()
  }, [playerId, squadId, router])

  // Load snapshots and create daily snapshot
  useEffect(() => {
    if (!playerId || !squadId || !player) return

    const loadDashboardData = async () => {
      setLoadingSnapshots(true)
      try {
        // Create/update today's snapshot
        await createPlayerDailySnapshot(playerId, squadId, player)

        // Fetch last 30 days of snapshots
        const snaps = await fetchPlayerSnapshots(playerId, 30)
        setSnapshots(snaps)
      } catch (error) {
        console.error('Error loading player dashboard data:', error)
      } finally {
        setLoadingSnapshots(false)
      }
    }

    loadDashboardData()
  }, [playerId, squadId, player])

  // Load match statistics
  useEffect(() => {
    if (!playerId || !squadId) return

    const loadMatchStats = async () => {
      setLoadingMatchStats(true)
      try {
        const stats = await fetchPlayerMatchStats(squadId, playerId)
        setMatchStats(stats)
      } catch (error) {
        console.error('Error loading match stats:', error)
      } finally {
        setLoadingMatchStats(false)
      }
    }

    loadMatchStats()
  }, [playerId, squadId])

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-mint dark:bg-deep-petrol flex items-center justify-center">
        <p className="text-mid-grey">Lädt...</p>
      </div>
    )
  }

  if (!player) {
    return null
  }

  return (
    <div className="min-h-screen bg-soft-mint dark:bg-deep-petrol pb-20 md:pb-8">
      <AppHeader />
      <PageLayout>
        {/* Back Button */}
        <div className="mb-6">
          <BackButton
            href={`/squads/${squadId}`}
            label={`Zurück zu ${squad?.name || 'Team'}`}
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-neon-lime/20 flex items-center justify-center">
                <User className="w-6 h-6 text-neon-lime" />
              </div>
              <div>
                <h1 className="text-4xl font-headline font-bold text-deep-petrol dark:text-soft-mint">
                  {player.name}
                </h1>
                <p className="text-mid-grey">Spieler-Dashboard</p>
              </div>
            </div>

            {/* Share Button */}
            <Link href={`/squads/${squadId}/players/${playerId}/share`}>
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-lime/10 hover:bg-neon-lime/20 border border-neon-lime/30 text-neon-lime font-medium text-sm transition-all"
                title="Spielerkarte teilen"
              >
                <Share2 className="w-4 h-4" strokeWidth={2} />
                <span className="hidden sm:inline">Teilen</span>
              </button>
            </Link>
          </div>

          {/* Positions */}
          {player.positions && player.positions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {player.positions.map((position) => (
                <span
                  key={position}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-digital-orange/20 text-digital-orange"
                >
                  {position}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <PlayerStatsCards player={player} snapshots={snapshots} />
        </div>

        {/* Development Chart */}
        <div className="mb-8">
          {loadingSnapshots ? (
            <div className="flex items-center justify-center h-[400px] text-mid-grey">
              <p>Lade Dashboard-Daten...</p>
            </div>
          ) : (
            <PlayerDevelopmentChart snapshots={snapshots} />
          )}
        </div>

        {/* Match Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-deep-petrol dark:text-soft-mint mb-4">
            Spiel-Statistiken
          </h2>
          {matchStats ? (
            <PlayerMatchStats stats={matchStats} loading={loadingMatchStats} />
          ) : (
            <PlayerMatchStats
              stats={{
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
              }}
              loading={loadingMatchStats}
            />
          )}
        </div>

        {/* Position Distribution Chart */}
        <div className="mb-8">
          {matchStats && (
            <PlayerPositionChart
              positionDistribution={matchStats.positionDistribution}
              totalMatches={matchStats.attendedMatches}
            />
          )}
        </div>
      </PageLayout>

      <BottomNav />
    </div>
  )
}

export default function PlayerDashboardPage() {
  return (
    <AuthGuard>
      <PlayerDashboardContent />
    </AuthGuard>
  )
}
