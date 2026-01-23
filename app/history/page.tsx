'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { MatchHistoryList } from '@/components/MatchHistory'
import { BottomNav } from '@/components/BottomNav'
import { AuthGuard } from '@/components/AuthGuard'
import { AppHeader } from '@/components/AppHeader'
import { PageLayout } from '@/components/PageLayout'

function HistoryContent() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return
    setLoading(false)
  }, [])

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-2">
            Match History
          </h1>
          <p className="text-mid-grey">
            Alle deine Team-Generierungen
          </p>
        </div>

        {/* Match History Component */}
        <MatchHistoryList />
      </PageLayout>

      <BottomNav />
    </div>
  )
}

export default function HistoryPage() {
  return (
    <AuthGuard>
      <HistoryContent />
    </AuthGuard>
  )
}
