'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AuthGuard } from '@/components/AuthGuard'
import { AppHeader } from '@/components/AppHeader'
import { PageLayout } from '@/components/PageLayout'
import { BottomNav } from '@/components/BottomNav'
import { Trophy, Edit2, Calendar, Users, Shirt } from 'lucide-react'
import type { MatchHistory } from '@/lib/types'

function HistoryContent() {
  const params = useParams()
  const router = useRouter()
  const squadId = params.id as string

  const [matches, setMatches] = useState<MatchHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null)
  const [editScores, setEditScores] = useState<number[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!squadId) return

    const q = query(
      collection(db, 'squads', squadId, 'matches'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMatches: MatchHistory[] = []
      snapshot.forEach((doc) => {
        loadedMatches.push({
          id: doc.id,
          ...doc.data(),
        } as MatchHistory)
      })
      setMatches(loadedMatches)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [squadId])

  const startEditingResult = (match: MatchHistory) => {
    setEditingMatchId(match.id)
    // Initialize with existing scores or zeros
    const initialScores = match.result?.scores || new Array(match.teamCount).fill(0)
    setEditScores(initialScores)
  }

  const saveResult = async (matchId: string) => {
    setIsSaving(true)
    try {
      const matchRef = doc(db, 'squads', squadId, 'matches', matchId)
      await updateDoc(matchRef, {
        result: {
          scores: editScores,
          savedAt: Timestamp.now()
        }
      })
      setEditingMatchId(null)
      setEditScores([])
    } catch (error) {
      console.error('Error saving result:', error)
      alert('Fehler beim Speichern des Ergebnisses!')
    } finally {
      setIsSaving(false)
    }
  }

  const cancelEditing = () => {
    setEditingMatchId(null)
    setEditScores([])
  }

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
          <Button
            variant="secondary"
            onClick={() => router.push(`/squads/${squadId}`)}
            className="mb-4"
          >
            ← Zurück
          </Button>
          <h1 className="text-4xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-2">
            Match History
          </h1>
          <p className="text-mid-grey">
            Alle gespeicherten Matches und Ergebnisse
          </p>
        </div>

        {/* Matches List */}
        {matches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-mid-grey" />
              <p className="text-mid-grey mb-4">
                Noch keine Matches gespeichert
              </p>
              <p className="text-sm text-mid-grey">
                Generiere Teams und speichere Matches, um die History aufzubauen
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {matches.map((match) => {
              const isEditing = editingMatchId === match.id
              const hasResult = match.result && match.result.scores.length > 0

              return (
                <Card key={match.id} variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-neon-lime" />
                        <span>
                          {match.createdAt?.toDate?.()
                            ? match.createdAt.toDate().toLocaleDateString('de-DE', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-mid-grey">
                        <Users className="w-4 h-4" />
                        {match.playerCount} Spieler
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Teams Display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {match.teams.map((team, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg bg-soft-mint/50 dark:bg-deep-petrol border border-mid-grey/10"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg">
                                {team.teamName || `Team ${team.teamNumber}`}
                              </h3>
                              {match.leibchenTeamIndex === index && (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-digital-orange/20 border border-digital-orange/40">
                                  <Shirt className="w-3 h-3 text-digital-orange" strokeWidth={2} />
                                  <span className="text-xs font-bold text-digital-orange uppercase">
                                    Leibchen
                                  </span>
                                </div>
                              )}
                            </div>
                            {hasResult && !isEditing && (
                              <div className="text-2xl font-bold text-neon-lime">
                                {match.result!.scores[index]}
                              </div>
                            )}
                          </div>

                          {/* Players */}
                          <div className="space-y-2">
                            {team.players.map((player) => (
                              <div
                                key={player.id}
                                className="text-sm text-deep-petrol dark:text-soft-mint"
                              >
                                • {player.name}
                                {player.positions && player.positions.length > 0 && (
                                  <span className="text-xs text-mid-grey ml-2">
                                    [{player.positions.join(', ')}]
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 pt-3 border-t border-mid-grey/20 text-sm text-mid-grey">
                            Ø Stärke: {team.averageStrength.toFixed(1)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Result Editing */}
                    {isEditing ? (
                      <div className="p-4 rounded-lg bg-digital-orange/10 border border-digital-orange/30">
                        <h4 className="font-bold mb-3">Ergebnis eintragen</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                          {match.teams.map((team, index) => (
                            <div key={index} className="space-y-2">
                              <label className="block text-sm font-medium">
                                {team.teamName || `Team ${team.teamNumber}`}
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={editScores[index] || 0}
                                onChange={(e) => {
                                  const newScores = [...editScores]
                                  newScores[index] = parseInt(e.target.value) || 0
                                  setEditScores(newScores)
                                }}
                                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-card-dark border-2 border-mid-grey/30 focus:border-digital-orange focus:outline-none transition-smooth"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="secondary"
                            onClick={cancelEditing}
                            disabled={isSaving}
                          >
                            Abbrechen
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => saveResult(match.id)}
                            disabled={isSaving}
                          >
                            {isSaving ? 'Speichert...' : 'Ergebnis speichern'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => startEditingResult(match)}
                          className="flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          {hasResult ? 'Ergebnis bearbeiten' : 'Ergebnis eintragen'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
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
