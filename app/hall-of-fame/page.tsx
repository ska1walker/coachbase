'use client'

import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AppHeader } from '@/components/AppHeader'
import { BottomNav } from '@/components/BottomNav'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { calculateLevel } from '@/lib/gamification'
import type { User } from '@/lib/types'
import { Trophy, Flame, Users, Target } from 'lucide-react'

interface LeaderboardEntry {
  uid: string
  displayName?: string
  level: number
  xp: number
  teamsGenerated: number
  currentStreak: number
}

export default function HallOfFamePage() {
  const [topCoaches, setTopCoaches] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, orderBy('stats.xp', 'desc'), limit(10))
      const snapshot = await getDocs(q)

      const coaches: LeaderboardEntry[] = []
      snapshot.forEach((doc) => {
        const data = doc.data() as User
        // Only include users with stats, XP > 0, AND opted-in to leaderboard
        if (
          data.stats &&
          data.stats.xp > 0 &&
          data.showInLeaderboard !== false // Default true, so undefined is also included
        ) {
          coaches.push({
            uid: doc.id,
            displayName: data.displayName || 'Anonymer Coach',
            level: data.stats.level || 1,
            xp: data.stats.xp || 0,
            teamsGenerated: data.stats.teamsGenerated || 0,
            currentStreak: data.stats.currentStreak || 0,
          })
        }
      })

      setTopCoaches(coaches)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level: number) => {
    return calculateLevel(topCoaches.find((c) => c.level === level)?.xp || 0).color
  }

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `${rank}.`
  }

  return (
    <div className="min-h-screen bg-soft-mint dark:bg-deep-petrol pb-20">
      <AppHeader />

      <div className="px-4 py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-digital-orange" />
            <h1 className="text-h1-mobile md:text-h1-desktop font-headline text-deep-petrol dark:text-soft-mint">
              Hall of Fame
            </h1>
          </div>
          <p className="text-mid-grey">Die besten Coaches der Community</p>
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <h2 className="text-h2-mobile md:text-h2-desktop font-headline text-deep-petrol dark:text-soft-mint">
              Top Coaches
            </h2>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-mid-grey">Lade Rangliste...</div>
            ) : topCoaches.length === 0 ? (
              <div className="text-center py-8 text-mid-grey">
                Noch keine Coaches in der Rangliste
              </div>
            ) : (
              <div className="space-y-3">
                {topCoaches.map((coach, index) => {
                  const levelInfo = calculateLevel(coach.xp)
                  return (
                    <div
                      key={coach.uid}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                        index < 3
                          ? 'bg-gradient-to-r from-neon-lime/10 to-digital-orange/10 border-2 border-digital-orange/20'
                          : 'bg-soft-mint/50 dark:bg-card-dark/50'
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0 w-12 text-center">
                        <span className="text-2xl font-bold">{getMedalEmoji(index + 1)}</span>
                      </div>

                      {/* Coach Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-deep-petrol dark:text-soft-mint truncate">
                          {coach.displayName}
                        </div>
                        <div className="text-sm text-mid-grey flex items-center gap-2">
                          <span
                            className="inline-block px-2 py-1 rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: levelInfo.color }}
                          >
                            Level {coach.level}
                          </span>
                          <span>{levelInfo.title}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-digital-orange">{coach.xp}</div>
                          <div className="text-xs text-mid-grey">XP</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-deep-petrol dark:text-soft-mint">
                            {coach.teamsGenerated}
                          </div>
                          <div className="text-xs text-mid-grey">Teams</div>
                        </div>
                        {coach.currentStreak > 0 && (
                          <div className="text-center">
                            <div className="font-bold text-orange-500 flex items-center gap-1 justify-center">
                              <Flame className="w-4 h-4" />
                              {coach.currentStreak}
                            </div>
                            <div className="text-xs text-mid-grey">Streak</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Community Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="text-center py-6">
              <Users className="w-8 h-8 text-digital-orange mx-auto mb-2" />
              <div className="text-2xl font-bold text-deep-petrol dark:text-soft-mint">
                {topCoaches.length}
              </div>
              <div className="text-sm text-mid-grey">Aktive Coaches</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center py-6">
              <Target className="w-8 h-8 text-digital-orange mx-auto mb-2" />
              <div className="text-2xl font-bold text-deep-petrol dark:text-soft-mint">
                {topCoaches.reduce((sum, c) => sum + c.teamsGenerated, 0)}
              </div>
              <div className="text-sm text-mid-grey">Generierte Teams</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center py-6">
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-deep-petrol dark:text-soft-mint">
                {Math.max(...topCoaches.map((c) => c.currentStreak), 0)}
              </div>
              <div className="text-sm text-mid-grey">Längster Streak</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
