'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, getDocs, deleteDoc, Timestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/collections'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Calendar, Users, Heart, TrendingUp, Edit2, Trash2, X, Check, AlertTriangle } from 'lucide-react'
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

  // Edit state
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null)
  const [editScores, setEditScores] = useState<number[]>([])

  // Delete confirmation state
  const [deleteConfirmMatchId, setDeleteConfirmMatchId] = useState<string | null>(null)

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    if (squadId) {
      // Load history for specific squad
      const q = query(
        collection(db, COLLECTIONS.SQUADS, squadId, 'matches'),
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
        collection(db, COLLECTIONS.SQUADS),
        where('ownerId', '==', userId)
      )
      const invitedSquadsQuery = query(
        collection(db, COLLECTIONS.SQUADS),
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
          collection(db, COLLECTIONS.SQUADS, squadId, 'matches'),
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

  const toggleLike = async (match: MatchHistory, currentLiked: boolean) => {
    try {
      const matchRef = doc(db, COLLECTIONS.SQUADS, match.squadId, 'matches', match.id)
      await updateDoc(matchRef, {
        liked: !currentLiked,
      })
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const startEditingScore = (match: MatchHistory) => {
    setEditingMatchId(match.id)
    // Initialize with existing scores or zeros
    const initialScores = match.result?.scores || new Array(match.teamCount).fill(0)
    setEditScores([...initialScores])
  }

  const cancelEditingScore = () => {
    setEditingMatchId(null)
    setEditScores([])
  }

  const saveScore = async (match: MatchHistory) => {
    try {
      const matchRef = doc(db, COLLECTIONS.SQUADS, match.squadId, 'matches', match.id)
      await updateDoc(matchRef, {
        result: {
          scores: editScores,
          savedAt: Timestamp.now()
        }
      })

      // Optimistic UI update
      setMatches(prev => prev.map(m =>
        m.id === match.id
          ? { ...m, result: { scores: editScores, savedAt: Timestamp.now() } }
          : m
      ))

      setEditingMatchId(null)
      setEditScores([])
    } catch (error) {
      console.error('Error saving score:', error)
      alert('Fehler beim Speichern des Ergebnisses!')
    }
  }

  const deleteMatch = async (match: MatchHistory) => {
    try {
      const matchRef = doc(db, COLLECTIONS.SQUADS, match.squadId, 'matches', match.id)
      await deleteDoc(matchRef)

      // Optimistic UI update
      setMatches(prev => prev.filter(m => m.id !== match.id))
      setDeleteConfirmMatchId(null)

      // Close detail view if deleted match was selected
      if (selectedMatch?.id === match.id) {
        setSelectedMatch(null)
      }
    } catch (error) {
      console.error('Error deleting match:', error)
      alert('Fehler beim Löschen des Matches!')
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
      {/* Delete Confirmation Dialog */}
      {deleteConfirmMatchId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Match löschen?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-mid-grey mb-6">
                Möchtest du dieses Match wirklich unwiderruflich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setDeleteConfirmMatchId(null)}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    const match = matches.find(m => m.id === deleteConfirmMatchId)
                    if (match) deleteMatch(match)
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Löschen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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

                    {/* Result Display or Edit */}
                    {editingMatchId === match.id ? (
                      <div className="mt-3 p-3 rounded-lg bg-neon-lime/10 border border-neon-lime/30" onClick={(e) => e.stopPropagation()}>
                        <p className="text-xs font-bold text-neon-lime mb-2">ERGEBNIS BEARBEITEN</p>
                        <div className="flex items-center gap-2">
                          {editScores.map((score, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              <span className="text-xs text-mid-grey">Team {idx + 1}:</span>
                              <input
                                type="number"
                                min="0"
                                value={score}
                                onChange={(e) => {
                                  const newScores = [...editScores]
                                  newScores[idx] = parseInt(e.target.value) || 0
                                  setEditScores(newScores)
                                }}
                                className="w-16 px-2 py-1 text-sm rounded border border-mid-grey/30 bg-white dark:bg-card-dark"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              saveScore(match)
                            }}
                            className="flex items-center gap-1 px-3 py-1 rounded bg-neon-lime text-deep-petrol text-xs font-bold hover:bg-neon-lime/80"
                          >
                            <Check className="w-3 h-3" />
                            Speichern
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              cancelEditingScore()
                            }}
                            className="flex items-center gap-1 px-3 py-1 rounded bg-mid-grey/20 text-mid-grey text-xs hover:bg-mid-grey/30"
                          >
                            <X className="w-3 h-3" />
                            Abbrechen
                          </button>
                        </div>
                      </div>
                    ) : match.result?.scores ? (
                      <div className="mt-3 p-3 rounded-lg bg-digital-orange/10 border border-digital-orange/30">
                        <p className="text-xs font-bold text-digital-orange mb-1">ERGEBNIS</p>
                        <div className="flex items-center gap-3 text-lg font-bold text-deep-petrol dark:text-soft-mint">
                          {match.result.scores.map((score, idx) => (
                            <span key={idx}>
                              {idx > 0 && <span className="text-mid-grey mx-2">:</span>}
                              {score}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-mid-grey">
                        {match.teams.map((team, idx) => (
                          <span key={idx}>
                            Team {team.teamNumber}: {team.players.length} Spieler
                            {idx < match.teams.length - 1 ? ' • ' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {/* Edit Score Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        startEditingScore(match)
                      }}
                      className="p-2 rounded-lg hover:bg-digital-orange/20 transition-smooth"
                      title="Ergebnis bearbeiten"
                    >
                      <Edit2 className="w-5 h-5 text-digital-orange" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteConfirmMatchId(match.id)
                      }}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-smooth"
                      title="Match löschen"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>

                    {/* Like Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLike(match, match.liked || false)
                      }}
                      className="p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-card-dark transition-smooth"
                      title="Als Favorit markieren"
                    >
                      <Heart
                        className={cn(
                          'w-5 h-5 transition-smooth',
                          match.liked
                            ? 'fill-neon-lime text-neon-lime'
                            : 'text-mid-grey'
                        )}
                      />
                    </button>
                  </div>
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
                <div className="flex-1">
                  <CardTitle>Match Details</CardTitle>
                  <p className="text-sm text-mid-grey mt-1">
                    {formatDate(selectedMatch.date)}
                  </p>

                  {/* Result Display in Detail View */}
                  {selectedMatch.result?.scores && (
                    <div className="mt-3 p-3 rounded-lg bg-digital-orange/10 border border-digital-orange/30 inline-block">
                      <p className="text-xs font-bold text-digital-orange mb-1">ENDERGEBNIS</p>
                      <div className="flex items-center gap-3 text-2xl font-bold text-deep-petrol dark:text-soft-mint">
                        {selectedMatch.result.scores.map((score, idx) => (
                          <span key={idx}>
                            {idx > 0 && <span className="text-mid-grey mx-2">:</span>}
                            {score}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEditingScore(selectedMatch)}
                    className="p-2 rounded-lg hover:bg-digital-orange/20 transition-smooth"
                    title="Ergebnis bearbeiten"
                  >
                    <Edit2 className="w-5 h-5 text-digital-orange" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmMatchId(selectedMatch.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-smooth"
                    title="Match löschen"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                  <button
                    onClick={() => toggleLike(selectedMatch, selectedMatch.liked || false)}
                    className="p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-card-dark transition-smooth"
                    title="Als Favorit markieren"
                  >
                    <Heart
                      className={cn(
                        'w-5 h-5',
                        selectedMatch.liked
                          ? 'fill-neon-lime text-neon-lime'
                          : 'text-mid-grey'
                      )}
                    />
                  </button>
                </div>
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
