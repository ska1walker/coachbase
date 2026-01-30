'use client'

import { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/collections'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs,
} from 'firebase/firestore'
import { AuthGuard } from '@/components/AuthGuard'
import { AppHeader } from '@/components/AppHeader'
import { PageLayout } from '@/components/PageLayout'
import { BottomNav } from '@/components/BottomNav'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Users,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Shield,
  Key,
  Edit2,
  Plus,
} from 'lucide-react'
import type { User, Squad, Player } from '@/lib/types'
import Link from 'next/link'

type ViewMode = 'users' | 'squads' | 'players'

interface ViewState {
  mode: ViewMode
  selectedUser?: User
  selectedSquad?: Squad
}

function AdminContent() {
  const [viewState, setViewState] = useState<ViewState>({ mode: 'users' })
  const [users, setUsers] = useState<User[]>([])
  const [squads, setSquads] = useState<Squad[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  // Password reset state
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [resettingPassword, setResettingPassword] = useState(false)

  // Load all users (Admin only)
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('email'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedUsers: User[] = []
      snapshot.forEach((doc) => {
        loadedUsers.push({
          uid: doc.id,
          ...doc.data(),
        } as User)
      })
      setUsers(loadedUsers)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Load squads for selected user
  useEffect(() => {
    if (viewState.mode !== 'squads' || !viewState.selectedUser) return

    const q = query(
      collection(db, COLLECTIONS.SQUADS),
      where('ownerId', '==', viewState.selectedUser.uid),
      orderBy('name')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedSquads: Squad[] = []
      snapshot.forEach((doc) => {
        loadedSquads.push({
          id: doc.id,
          ...doc.data(),
        } as Squad)
      })
      setSquads(loadedSquads)
    })

    return () => unsubscribe()
  }, [viewState])

  // Load players for selected squad
  useEffect(() => {
    if (viewState.mode !== 'players' || !viewState.selectedSquad) return

    const q = query(
      collection(db, COLLECTIONS.PLAYERS),
      where('squadId', '==', viewState.selectedSquad.id),
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
    })

    return () => unsubscribe()
  }, [viewState])

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('Spieler wirklich löschen?')) return

    try {
      await deleteDoc(doc(db, COLLECTIONS.PLAYERS, playerId))
    } catch (error) {
      console.error('Error deleting player:', error)
      alert('Fehler beim Löschen!')
    }
  }

  const handleDeleteSquad = async (squadId: string) => {
    if (!confirm('Team wirklich löschen? Alle Spieler werden ebenfalls gelöscht.')) return

    try {
      // Delete all players in squad first
      const playersQuery = query(collection(db, COLLECTIONS.PLAYERS), where('squadId', '==', squadId))
      const playersSnapshot = await getDocs(playersQuery)
      const deletePromises = playersSnapshot.docs.map((doc) => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      // Delete squad
      await deleteDoc(doc(db, COLLECTIONS.SQUADS, squadId))
    } catch (error) {
      console.error('Error deleting squad:', error)
      alert('Fehler beim Löschen!')
    }
  }

  const handleResetPassword = async () => {
    if (!viewState.selectedUser || !newPassword || newPassword.length < 6) {
      alert('Passwort muss mindestens 6 Zeichen lang sein')
      return
    }

    setResettingPassword(true)
    try {
      // Call adminResetUserPassword Cloud Function
      // Note: This requires the Cloud Function to be deployed
      // For now, we'll just show a placeholder
      alert('Cloud Function Integration erforderlich. Siehe ARCHITECTURE.md')
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Fehler beim Zurücksetzen!')
    } finally {
      setResettingPassword(false)
      setShowPasswordReset(false)
      setNewPassword('')
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-8 h-8 text-neon-lime" />
              <h1 className="text-4xl font-headline font-bold text-deep-petrol dark:text-soft-mint">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-mid-grey">
              {viewState.mode === 'users' && 'Alle registrierten Benutzer'}
              {viewState.mode === 'squads' &&
                `Teams von ${viewState.selectedUser?.email}`}
              {viewState.mode === 'players' &&
                `Spieler in ${viewState.selectedSquad?.name}`}
            </p>
          </div>

          <Link href="/squads">
            <Button variant="secondary">Zu meinen Teams</Button>
          </Link>
        </div>

        {/* Breadcrumb Navigation */}
        {viewState.mode !== 'users' && (
          <div className="mb-6 flex items-center gap-2 text-sm">
            <button
              onClick={() => setViewState({ mode: 'users' })}
              className="text-mid-grey hover:text-neon-lime transition-smooth flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Benutzer
            </button>
            {viewState.mode === 'squads' && (
              <span className="text-mid-grey">
                → {viewState.selectedUser?.email}
              </span>
            )}
            {viewState.mode === 'players' && (
              <>
                <button
                  onClick={() =>
                    setViewState({
                      mode: 'squads',
                      selectedUser: viewState.selectedUser,
                    })
                  }
                  className="text-mid-grey hover:text-neon-lime transition-smooth"
                >
                  → {viewState.selectedUser?.email}
                </button>
                <span className="text-mid-grey">
                  → {viewState.selectedSquad?.name}
                </span>
              </>
            )}
          </div>
        )}

        {/* Users View */}
        {viewState.mode === 'users' && (
          <div className="space-y-3">
            {users.map((user) => (
              <Card
                key={user.uid}
                className="cursor-pointer hover:shadow-card-hover transition-smooth"
                onClick={() =>
                  setViewState({ mode: 'squads', selectedUser: user })
                }
              >
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-neon-lime/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-neon-lime" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-deep-petrol dark:text-soft-mint">
                        {user.email}
                      </h3>
                      <p className="text-sm text-mid-grey flex items-center gap-2">
                        {user.role === 'admin' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-neon-lime/20 text-neon-lime text-xs font-bold">
                            <Shield className="w-3 h-3" />
                            ADMIN
                          </span>
                        )}
                        <span>
                          Erstellt:{' '}
                          {new Date(user.createdAt.toDate()).toLocaleDateString('de-DE')}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setViewState({ mode: 'users', selectedUser: user })
                        setShowPasswordReset(true)
                      }}
                      className="p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-card-dark transition-smooth"
                      title="Passwort zurücksetzen"
                    >
                      <Key className="w-5 h-5 text-mid-grey" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-mid-grey" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Squads View */}
        {viewState.mode === 'squads' && (
          <div>
            {squads.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-mid-grey" />
                  <p className="text-mid-grey">
                    Dieser Benutzer hat noch keine Teams erstellt
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {squads.map((squad) => (
                  <Card
                    key={squad.id}
                    className="cursor-pointer hover:shadow-card-hover transition-smooth"
                    onClick={() =>
                      setViewState({
                        mode: 'players',
                        selectedUser: viewState.selectedUser,
                        selectedSquad: squad,
                      })
                    }
                  >
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-digital-orange/20 flex items-center justify-center">
                          <Users className="w-6 h-6 text-digital-orange" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-deep-petrol dark:text-soft-mint">
                            {squad.name}
                          </h3>
                          <p className="text-sm text-mid-grey">
                            Erstellt:{' '}
                            {new Date(squad.createdAt.toDate()).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteSquad(squad.id)
                          }}
                          className="p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-card-dark transition-smooth"
                        >
                          <Trash2 className="w-5 h-5 text-mid-grey hover:text-red-500" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-mid-grey" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Players View */}
        {viewState.mode === 'players' && (
          <div>
            {players.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-mid-grey" />
                  <p className="text-mid-grey">
                    Dieses Team hat noch keine Spieler
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map((player) => (
                  <Card key={player.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg text-deep-petrol dark:text-soft-mint">
                          {player.name}
                        </h3>
                        <button
                          onClick={() => handleDeletePlayer(player.id)}
                          className="p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-card-dark transition-smooth"
                        >
                          <Trash2 className="w-4 h-4 text-mid-grey hover:text-red-500" />
                        </button>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-mid-grey">Technik:</span>
                          <span className="font-medium">{player.technik}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-mid-grey">Fitness:</span>
                          <span className="font-medium">{player.fitness}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-mid-grey">Spielverständnis:</span>
                          <span className="font-medium">
                            {player.spielverstaendnis}/10
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-mid-grey/20">
                          <span className="text-mid-grey font-bold">Gesamt:</span>
                          <span className="font-bold text-neon-lime">
                            {player.total}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Password Reset Modal */}
        {showPasswordReset && viewState.selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Passwort zurücksetzen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-mid-grey mb-4">
                  Neues Passwort für: <strong>{viewState.selectedUser.email}</strong>
                </p>

                <Input
                  label="Neues Passwort (min. 6 Zeichen)"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••"
                  className="mb-4"
                />

                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={handleResetPassword}
                    disabled={resettingPassword || newPassword.length < 6}
                    fullWidth
                  >
                    {resettingPassword ? 'Lädt...' : 'Passwort setzen'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowPasswordReset(false)
                      setNewPassword('')
                    }}
                    fullWidth
                  >
                    Abbrechen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </PageLayout>

      <BottomNav />
    </div>
  )
}

export default function AdminPage() {
  return (
    <AuthGuard requireAdmin>
      <AdminContent />
    </AuthGuard>
  )
}
