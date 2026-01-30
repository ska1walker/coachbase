'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/collections'
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { AuthGuard } from '@/components/AuthGuard'
import { AppHeader } from '@/components/AppHeader'
import { PageLayout } from '@/components/PageLayout'
import { BottomNav } from '@/components/BottomNav'
import { BarChart3 } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'
import type { Player, Squad, SquadSnapshot } from '@/lib/types'
import { DashboardStatsCards } from '@/components/dashboard/DashboardStatsCards'
import { SquadDevelopmentChart } from '@/components/dashboard/SquadDevelopmentChart'
import { PositionBalanceChart } from '@/components/dashboard/PositionBalanceChart'
import { createDailySnapshot, fetchSnapshots } from '@/lib/dashboard-utils'

function DashboardContent() {
  const router = useRouter()
  const params = useParams()
  const squadId = params.id as string

  const [squad, setSquad] = useState<Squad | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [snapshots, setSnapshots] = useState<SquadSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSnapshots, setLoadingSnapshots] = useState(false)

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

  // Load players
  useEffect(() => {
    if (!squadId) return

    const q = query(
      collection(db, COLLECTIONS.PLAYERS),
      where('squadId', '==', squadId),
      orderBy('name')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedPlayers: Player[] = []
      snapshot.forEach((doc) => {
        loadedPlayers.push({
          id: doc.id,
          ...doc.data(),
        } as Player)
      })
      setPlayers(loadedPlayers)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [squadId])

  // Load snapshots and create daily snapshot
  useEffect(() => {
    if (!squadId || players.length === 0) return

    const loadDashboardData = async () => {
      setLoadingSnapshots(true)
      try {
        // Create/update today's snapshot
        await createDailySnapshot(squadId, players)

        // Fetch last 30 days of snapshots
        const snaps = await fetchSnapshots(squadId, 30)
        setSnapshots(snaps)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoadingSnapshots(false)
      }
    }

    loadDashboardData()
  }, [squadId, players])

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-mint dark:bg-deep-petrol flex items-center justify-center">
        <p className="text-mid-grey">Lädt...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-soft-mint dark:bg-deep-petrol pb-20 md:pb-8">
      <AppHeader />
      <PageLayout>
        {/* Header with Back Button */}
        <div className="mb-6">
          <BackButton
            href={`/squads/${squadId}`}
            label={`Zurück zu ${squad?.name || 'Team'}`}
          />
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-digital-orange/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-digital-orange" />
            </div>
            <div>
              <h1 className="text-4xl font-headline font-bold text-deep-petrol dark:text-soft-mint">
                Dashboard
              </h1>
              <p className="text-mid-grey">{squad?.name}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <DashboardStatsCards players={players} />
        </div>

        {/* Squad Development Chart */}
        <div className="mb-8">
          {loadingSnapshots ? (
            <div className="flex items-center justify-center h-[400px] text-mid-grey">
              <p>Lade Dashboard-Daten...</p>
            </div>
          ) : (
            <SquadDevelopmentChart snapshots={snapshots} />
          )}
        </div>

        {/* Position Balance Chart */}
        <div className="mb-8">
          <PositionBalanceChart players={players} />
        </div>

        {/* Placeholder for future charts */}
        <div className="text-center text-mid-grey text-sm">
          Weitere Charts folgen bald...
        </div>
      </PageLayout>

      <BottomNav />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
