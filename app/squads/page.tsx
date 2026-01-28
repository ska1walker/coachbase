'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, arrayRemove, getDoc, getDocs } from 'firebase/firestore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthGuard } from '@/components/AuthGuard'
import { AppHeader } from '@/components/AppHeader'
import { PageLayout } from '@/components/PageLayout'
import { Users, Plus, Trash2, Unlink, AlertTriangle, UserCircle, Clock, CheckCircle } from 'lucide-react'
import type { Squad } from '@/lib/types'
import { BottomNav } from '@/components/BottomNav'
import { useUserStats } from '@/hooks/useUserStats'

// Type for squad with owner info
type SquadWithOwner = Squad & {
  ownerName?: string
  coTrainerCount?: number
  pendingInvites?: number
}

function SquadsContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [ownedSquads, setOwnedSquads] = useState<SquadWithOwner[]>([])
  const [invitedSquads, setInvitedSquads] = useState<SquadWithOwner[]>([])
  const [newSquadName, setNewSquadName] = useState('')
  const [creating, setCreating] = useState(false)
  const { trackSquadCreated } = useUserStats()

  // Confirmation dialog state
  const [confirmAction, setConfirmAction] = useState<'delete' | 'unlink' | null>(null)
  const [confirmSquadId, setConfirmSquadId] = useState<string | null>(null)
  const [confirmSquadName, setConfirmSquadName] = useState<string>('')
  const [confirmInput, setConfirmInput] = useState('')

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

    const unsubscribeOwned = onSnapshot(ownedQuery, async (snapshot) => {
      const loadedSquads: SquadWithOwner[] = []

      for (const docSnap of snapshot.docs) {
        const squadData = {
          id: docSnap.id,
          ...docSnap.data(),
        } as Squad

        // Count accepted co-trainers
        const coTrainerCount = squadData.coTrainerIds?.length || 0

        // Count pending invites
        const invitesQuery = query(
          collection(db, 'squadInvites'),
          where('squadId', '==', docSnap.id),
          where('used', '==', false)
        )
        const invitesSnapshot = await getDocs(invitesQuery)
        const pendingInvites = invitesSnapshot.size

        loadedSquads.push({
          ...squadData,
          coTrainerCount,
          pendingInvites,
        })
      }

      setOwnedSquads(loadedSquads)
      setLoading(false)
    })

    const unsubscribeInvited = onSnapshot(invitedQuery, async (snapshot) => {
      const loadedSquads: SquadWithOwner[] = []

      for (const docSnap of snapshot.docs) {
        const squadData = {
          id: docSnap.id,
          ...docSnap.data(),
        } as Squad

        // Load owner name
        let ownerName = 'Unbekannt'
        try {
          const ownerDoc = await getDoc(doc(db, 'users', squadData.ownerId))
          if (ownerDoc.exists()) {
            const ownerData = ownerDoc.data()
            ownerName = ownerData.displayName || `${ownerData.firstName || ''} ${ownerData.lastName || ''}`.trim() || ownerData.email || 'Unbekannt'
          }
        } catch (error) {
          console.error('Error loading owner name:', error)
        }

        loadedSquads.push({
          ...squadData,
          ownerName,
        })
      }

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

  const openDeleteConfirmation = (squadId: string, squadName: string) => {
    setConfirmAction('delete')
    setConfirmSquadId(squadId)
    setConfirmSquadName(squadName)
    setConfirmInput('')
  }

  const openUnlinkConfirmation = (squadId: string, squadName: string) => {
    setConfirmAction('unlink')
    setConfirmSquadId(squadId)
    setConfirmSquadName(squadName)
    setConfirmInput('')
  }

  const cancelConfirmation = () => {
    setConfirmAction(null)
    setConfirmSquadId(null)
    setConfirmSquadName('')
    setConfirmInput('')
  }

  const executeConfirmedAction = async () => {
    if (!confirmSquadId || !confirmAction) return

    // Validate input
    const expectedInput = confirmAction === 'delete' ? 'löschen' : 'unlinken'
    if (confirmInput.toLowerCase() !== expectedInput) {
      alert(`Bitte "${expectedInput}" eingeben, um fortzufahren.`)
      return
    }

    try {
      if (confirmAction === 'delete') {
        await deleteDoc(doc(db, 'squads', confirmSquadId))
      } else if (confirmAction === 'unlink') {
        const user = auth.currentUser
        if (!user) return

        await updateDoc(doc(db, 'squads', confirmSquadId), {
          coTrainerIds: arrayRemove(user.uid)
        })
      }
      cancelConfirmation()
    } catch (error) {
      console.error(`Error ${confirmAction}ing squad:`, error)
      alert(`Fehler beim ${confirmAction === 'delete' ? 'Löschen' : 'Entfernen'}`)
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
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 rounded-lg bg-neon-lime/20 flex items-center justify-center">
                              <Users className="w-6 h-6 text-neon-lime" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-deep-petrol dark:text-soft-mint">
                                {squad.name}
                              </h3>
                              <p className="text-sm text-mid-grey">
                                {squad.createdAt?.toDate?.() ? squad.createdAt.toDate().toLocaleDateString('de-DE') : 'N/A'}
                              </p>

                              {/* Co-Trainer Status Badges */}
                              {(squad.coTrainerCount! > 0 || squad.pendingInvites! > 0) && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {squad.coTrainerCount! > 0 && (
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-lime/20 border border-neon-lime/40">
                                      <CheckCircle className="w-3 h-3 text-neon-lime" />
                                      <span className="text-xs font-medium text-neon-lime">
                                        {squad.coTrainerCount} {squad.coTrainerCount === 1 ? 'Akzeptiert' : 'Akzeptiert'}
                                      </span>
                                    </div>
                                  )}
                                  {squad.pendingInvites! > 0 && (
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-digital-orange/20 border border-digital-orange/40">
                                      <Clock className="w-3 h-3 text-digital-orange" />
                                      <span className="text-xs font-medium text-digital-orange">
                                        {squad.pendingInvites} {squad.pendingInvites === 1 ? 'Ausstehend' : 'Ausstehend'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openDeleteConfirmation(squad.id, squad.name)
                            }}
                            className="p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-card-dark transition-smooth"
                          >
                            <Trash2 className="w-5 h-5 text-mid-grey hover:text-red-500" />
                          </button>
                        </div>

                        <div className="text-sm text-mid-grey mt-4">
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
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 rounded-lg bg-digital-orange/20 flex items-center justify-center">
                              <Users className="w-6 h-6 text-digital-orange" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-deep-petrol dark:text-soft-mint mb-1">
                                {squad.name}
                              </h3>

                              {/* Owner Info */}
                              <div className="flex items-center gap-1.5 mb-2">
                                <UserCircle className="w-3.5 h-3.5 text-mid-grey" />
                                <span className="text-xs text-mid-grey">
                                  Besitzer: {squad.ownerName}
                                </span>
                              </div>

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
                              openUnlinkConfirmation(squad.id, squad.name)
                            }}
                            className="p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-card-dark transition-smooth"
                          >
                            <Unlink className="w-5 h-5 text-mid-grey hover:text-digital-orange" />
                          </button>
                        </div>

                        <div className="text-sm text-mid-grey mt-4">
                          Klicke um Team zu erstellen
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

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {confirmAction === 'delete' ? 'Team löschen' : 'Verbindung trennen'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-deep-petrol dark:text-soft-mint">
                  {confirmAction === 'delete'
                    ? `Möchtest du das Team "${confirmSquadName}" wirklich löschen? Alle Spieler und die gesamte History werden unwiderruflich gelöscht.`
                    : `Möchtest du dich wirklich von "${confirmSquadName}" entfernen? Du verlierst den Zugriff auf dieses Team.`
                  }
                </p>

                <div>
                  <label className="block text-sm font-medium mb-2 text-deep-petrol dark:text-soft-mint">
                    Bitte tippe <span className="font-bold text-red-600 dark:text-red-400">
                      "{confirmAction === 'delete' ? 'löschen' : 'unlinken'}"
                    </span> ein, um fortzufahren:
                  </label>
                  <Input
                    type="text"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    placeholder={confirmAction === 'delete' ? 'löschen' : 'unlinken'}
                    className="w-full"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="secondary"
                    onClick={cancelConfirmation}
                    className="flex-1"
                  >
                    Abbrechen
                  </Button>
                  <Button
                    variant="primary"
                    onClick={executeConfirmedAction}
                    disabled={confirmInput.toLowerCase() !== (confirmAction === 'delete' ? 'löschen' : 'unlinken')}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-mid-grey disabled:cursor-not-allowed"
                  >
                    {confirmAction === 'delete' ? 'Löschen' : 'Entfernen'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
