'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, arrayRemove } from 'firebase/firestore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthGuard } from '@/components/AuthGuard'
import { AppHeader } from '@/components/AppHeader'
import { PageLayout } from '@/components/PageLayout'
import { Users, Plus, Trash2 } from 'lucide-react'
import type { Squad } from '@/lib/types'
import { BottomNav } from '@/components/BottomNav'
import { useUserStats } from '@/hooks/useUserStats'

function SquadsContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [ownedSquads, setOwnedSquads] = useState<Squad[]>([])
  const [invitedSquads, setInvitedSquads] = useState<Squad[]>([])
  const [newSquadName, setNewSquadName] = useState('')
  const [creating, setCreating] = useState(false)
  const { trackSquadCreated } = useUserStats()

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    // Query for owned squads
    const ownedQuery = query(
      collection(db, 'squads'),
      where('ownerId', '==', user.uid)
    )

    // Query for invited squads (where user is in coTrainerIds)
    const invitedQuery = query(
      collection(db, 'squads'),
      where('coTrainerIds', 'array-contains', user.uid)
    )

    const unsubscribeOwned = onSnapshot(ownedQuery, (snapshot) => {
      const loadedSquads: Squad[] = []
      snapshot.forEach((doc) => {
        loadedSquads.push({
          id: doc.id,
          ...doc.data(),
        } as Squad)
      })
      setOwnedSquads(loadedSquads)
      setLoading(false)
    })

    const unsubscribeInvited = onSnapshot(invitedQuery, (snapshot) => {
      const loadedSquads: Squad[] = []
      snapshot.forEach((doc) => {
        loadedSquads.push({
          id: doc.id,
          ...doc.data(),
        } as Squad)
      })
      setInvitedSquads(loadedSquads)
    })

    return () => {
      unsubscribeOwned()
      unsubscribeInvited()
    }
  }, [router])

  const createSquad = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSquadName.trim() || !auth.currentUser) return

    setCreating(true)
    try {
      await addDoc(collection(db, 'squads'), {
        name: newSquadName.trim(),
        ownerId: auth.currentUser.uid,
        createdAt: new Date(),
      })
      setNewSquadName('')

      // Track achievement
      await trackSquadCreated()
    } catch (error) {
      console.error('Error creating squad:', error)
      alert('Fehler beim Erstellen des Teams')
    } finally {
      setCreating(false)
    }
  }

  const deleteSquad = async (squadId: string) => {
    if (!confirm('Team wirklich löschen? Alle Spieler werden ebenfalls gelöscht.')) return

    try {
      await deleteDoc(doc(db, 'squads', squadId))
    } catch (error) {
      console.error('Error deleting squad:', error)
      alert('Fehler beim Löschen des Teams')
    }
  }

  const leaveAsCoTrainer = async (squadId: string) => {
    if (!confirm('Möchtest du dich wirklich von diesem Team entfernen?')) return

    try {
      const user = auth.currentUser
      if (!user) return

      await updateDoc(doc(db, 'squads', squadId), {
        coTrainerIds: arrayRemove(user.uid)
      })
    } catch (error) {
      console.error('Error leaving squad:', error)
      alert('Fehler beim Verlassen des Teams')
    }
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
          <h1 className="text-4xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-2">
            Meine Teams
          </h1>
          <p className="text-mid-grey">
            Verwalte deine Teams und Spieler
          </p>
        </div>

        {/* Create Squad Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Neues Team erstellen</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createSquad} className="flex gap-4">
              <Input
                type="text"
                placeholder="Team Name (z.B. FC Musterstadt)"
                value={newSquadName}
                onChange={(e) => setNewSquadName(e.target.value)}
                className="flex-1"
              />
              {/* Mobile: Icon only */}
              <Button
                type="submit"
                variant="primary"
                disabled={creating || !newSquadName.trim()}
                className="md:hidden flex items-center justify-center min-w-[48px]"
              >
                <Plus className="w-6 h-6" />
              </Button>

              {/* Desktop: Icon + Text */}
              <Button
                type="submit"
                variant="primary"
                disabled={creating || !newSquadName.trim()}
                className="hidden md:flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Erstellen
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Owned Squads Section */}
        {ownedSquads.length === 0 && invitedSquads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-mid-grey" />
              <p className="text-mid-grey mb-4">
                Du hast noch keine Teams erstellt oder wurdest eingeladen
              </p>
              <p className="text-sm text-mid-grey">
                Erstelle dein erstes Team, um Spieler zu verwalten
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Owned Teams */}
            {ownedSquads.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-4">
                  Meine Teams
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ownedSquads.map((squad) => (
                    <Card
                      key={squad.id}
                      className="hover:shadow-card-hover transition-smooth cursor-pointer"
                      onClick={() => router.push(`/squads/${squad.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-neon-lime/20 flex items-center justify-center">
                              <Users className="w-6 h-6 text-neon-lime" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-deep-petrol dark:text-soft-mint">
                                {squad.name}
                              </h3>
                              <p className="text-sm text-mid-grey">
                                {squad.createdAt?.toDate?.() ? squad.createdAt.toDate().toLocaleDateString('de-DE') : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSquad(squad.id)
                            }}
                            className="p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-card-dark transition-smooth"
                          >
                            <Trash2 className="w-5 h-5 text-mid-grey hover:text-red-500" />
                          </button>
                        </div>

                        <div className="text-sm text-mid-grey">
                          Klicke um Spieler zu verwalten
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Invited Teams */}
            {invitedSquads.length > 0 && (
              <div>
                <h2 className="text-2xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-4">
                  Eingeladene Teams
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {invitedSquads.map((squad) => (
                    <Card
                      key={squad.id}
                      className="hover:shadow-card-hover transition-smooth cursor-pointer"
                      onClick={() => router.push(`/squads/${squad.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-digital-orange/20 flex items-center justify-center">
                              <Users className="w-6 h-6 text-digital-orange" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-deep-petrol dark:text-soft-mint mb-1">
                                {squad.name}
                              </h3>
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-mid-grey">
                                  {squad.createdAt?.toDate?.() ? squad.createdAt.toDate().toLocaleDateString('de-DE') : 'N/A'}
                                </p>
                                <div className="inline-flex items-center px-1.5 py-0.5 rounded bg-digital-orange/20">
                                  <span className="text-xs font-medium text-digital-orange">
                                    Co-Trainer
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              leaveAsCoTrainer(squad.id)
                            }}
                            className="p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-card-dark transition-smooth"
                          >
                            <Trash2 className="w-5 h-5 text-mid-grey hover:text-red-500" />
                          </button>
                        </div>

                        <div className="text-sm text-mid-grey">
                          Klicke um Spieler zu verwalten
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </PageLayout>

      <BottomNav />
    </div>
  )
}

export default function SquadsPage() {
  return (
    <AuthGuard>
      <SquadsContent />
    </AuthGuard>
  )
}
