'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore'
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
  const [squads, setSquads] = useState<Squad[]>([])
  const [newSquadName, setNewSquadName] = useState('')
  const [creating, setCreating] = useState(false)
  const { trackSquadCreated } = useUserStats()

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    const q = query(
      collection(db, 'squads'),
      where('ownerId', '==', user.uid)
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
      setLoading(false)
    })

    return () => unsubscribe()
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
              <Button
                type="submit"
                variant="primary"
                disabled={creating || !newSquadName.trim()}
                className="flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Erstellen
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Squads List */}
        {squads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-mid-grey" />
              <p className="text-mid-grey mb-4">
                Du hast noch keine Teams erstellt
              </p>
              <p className="text-sm text-mid-grey">
                Erstelle dein erstes Team, um Spieler zu verwalten
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {squads.map((squad) => (
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
