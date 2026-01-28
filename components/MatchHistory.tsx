'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, getDocs, collectionGroup } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Calendar, Users, Heart, TrendingUp } from 'lucide-react'
import type { MatchHistory, Squad } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MatchHistoryListProps {
  squadId?: string
}

export function MatchHistoryList({ squadId }: MatchHistoryListProps) {
  const [matches, setMatches] = useState<MatchHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<MatchHistory | null>(null)
  const [squadNames, setSquadNames] = useState<Record<string, string>>({})

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    if (squadId) {
      // Load history for specific squad
      const q = query(
        collection(db, 'squads', squadId, 'matches'),
        orderBy('date', 'desc')
      )

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const loadedMatches: MatchHistory[] = []
          snapshot.forEach((doc) => {
            loadedMatches.push({
              id: doc.id,
              ...doc.data(),
            } as MatchHistory)
          })
          setMatches(loadedMatches)
          setLoading(false)
        },
        (error) => {
          console.error('Error loading match history:', error)
          setLoading(false)
          setMatches([])
        }
      )

      return () => unsubscribe()
    } else {
      // Load all matches from all user's squads
      loadAllUserMatches(user.uid)
    }
  }, [squadId])

  const loadAllUserMatches = async (userId: string) => {
    try {
      // Step 1: Load all squads where user is owner or co-trainer
      const ownedSquadsQuery = query(
        collection(db, 'squads'),
        where('ownerId', '==', userId)
      )
      const invitedSquadsQuery = query(
        collection(db, 'squads'),
        where('coTrainerIds', 'array-contains', userId)
      )

      const [ownedSnapshot, invitedSnapshot] = await Promise.all([
        getDocs(ownedSquadsQuery),
        getDocs(invitedSquadsQuery)
      ])

      const squadIds = new Set<string>()
      const squadNamesMap: Record<string, string> = {}

      ownedSnapshot.forEach((doc) => {
        squadIds.add(doc.id)
        squadNamesMap[doc.id] = (doc.data() as Squad).name
      })

      invitedSnapshot.forEach((doc) => {
        squadIds.add(doc.id)
        squadNamesMap[doc.id] = (doc.data() as Squad).name
      })

      setSquadNames(squadNamesMap)

      // Step 2: Load matches from all squads
      if (squadIds.size === 0) {
        setMatches([])
        setLoading(false)
        return
      }

      const matchPromises = Array.from(squadIds).map(async (squadId) => {
        const matchesQuery = query(
          collection(db, 'squads', squadId, 'matches'),
          orderBy('date', 'desc')
        )
        const snapshot = await getDocs(matchesQuery)
        const squadMatches: MatchHistory[] = []
        snapshot.forEach((doc) => {
          squadMatches.push({
            id: doc.id,
            ...doc.data(),
          } as MatchHistory)
        })
        return squadMatches
      })

      const allMatchArrays = await Promise.all(matchPromises)
      const allMatches = allMatchArrays.flat()

      // Sort by date descending
      allMatches.sort((a, b) => {
        const aTime = a.date?.toMillis?.() || 0
        const bTime = b.date?.toMillis?.() || 0
        return bTime - aTime
      })

      setMatches(allMatches)
      setLoading(false)
    } catch (error) {
      console.error('Error loading all matches:', error)
      setLoading(false)
      setMatches([])
    }
  }

  const toggleLike = async (matchId: string, currentLiked: boolean) => {
    try {
      await updateDoc(doc(db, 'match_history', matchId), {
        liked: !currentLiked,
      })
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unbekannt'
    const date = timestamp.toDate()
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-mid-grey">
          Lädt...
        </CardContent>
      </Card>
    )
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-mid-grey">
          Noch keine Team-Generierungen vorhanden
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Match List */}
      {!selectedMatch && (
        <div className="space-y-3">
          {matches.map((match) => (
            <Card
              key={match.id}
              className={cn(
                'cursor-pointer transition-smooth hover:shadow-card-hover',
                match.liked && 'border-2 border-neon-lime'
              )}
              onClick={() => setSelectedMatch(match)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Squad Name - only show if not filtered by squadId */}
                    {!squadId && match.squadId && squadNames[match.squadId] && (
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-neon-lime" />
                        <span className="text-sm font-bold text-neon-lime">
                          {squadNames[match.squadId]}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-mid-grey" />
                      <span className="text-sm text-mid-grey">
                        {formatDate(match.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-digital-orange" />
                        <span className="font-bold text-deep-petrol dark:text-soft-mint">
                          {match.teamCount} Teams
                        </span>
                      </div>
                      <span className="text-sm text-mid-grey">
                        {match.playerCount} Spieler
                      </span>
                    </div>

                    {/* Quick Preview */}
                    <div className="mt-2 text-sm text-mid-grey">
                      {match.teams.map((team, idx) => (
                        <span key={idx}>
                          Team {team.teamNumber}: {team.players.length} Spieler
                          {idx < match.teams.length - 1 ? ' • ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleLike(match.id, match.liked || false)
                    }}
                    className="p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-card-dark transition-smooth"
                  >
                    <Heart
                      className={cn(
                        'w-6 h-6 transition-smooth',
                        match.liked
                          ? 'fill-neon-lime text-neon-lime'
                          : 'text-mid-grey'
                      )}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Match Detail View */}
      {selectedMatch && (
        <div>
          <button
            onClick={() => setSelectedMatch(null)}
            className="mb-4 text-sm text-neon-lime hover:underline"
          >
            ← Zurück zur Liste
          </button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Match Details</CardTitle>
                  <p className="text-sm text-mid-grey mt-1">
                    {formatDate(selectedMatch.date)}
                  </p>
                </div>
                <button
                  onClick={() => toggleLike(selectedMatch.id, selectedMatch.liked || false)}
                  className="p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-card-dark"
                >
                  <Heart
                    className={cn(
                      'w-6 h-6',
                      selectedMatch.liked
                        ? 'fill-neon-lime text-neon-lime'
                        : 'text-mid-grey'
                    )}
                  />
                </button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedMatch.teams.map((team) => (
                  <div
                    key={team.teamNumber}
                    className="p-4 rounded-lg bg-soft-mint/50 dark:bg-card-dark"
                  >
                    <h3 className="font-bold text-lg mb-2">
                      Team {team.teamNumber}
                    </h3>
                    <div className="space-y-2">
                      {team.players.map((player) => (
                        <div
                          key={player.id}
                          className="p-2 rounded bg-white dark:bg-deep-petrol text-sm"
                        >
                          <div className="font-medium">{player.name}</div>
                          <div className="text-xs text-mid-grey">
                            T: {player.technik} • F: {player.fitness} • S:{' '}
                            {player.spielverstaendnis} • Σ {player.total}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-mid-grey/20 text-sm">
                      <div className="flex justify-between">
                        <span className="text-mid-grey">Teamstärke:</span>
                        <span className="font-bold">{team.totalStrength}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-mid-grey">Durchschnitt:</span>
                        <span className="font-bold">{team.averageStrength}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
