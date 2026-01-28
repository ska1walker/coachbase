'use client'

// Squad Detail Page with Position Selection (Multi-select)
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  arrayRemove,
} from 'firebase/firestore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthGuard } from '@/components/AuthGuard'
import { AppHeader } from '@/components/AppHeader'
import { PageLayout } from '@/components/PageLayout'
import { BottomNav } from '@/components/BottomNav'
import { ArrowLeft, Plus, Edit2, Trash2, Users, TrendingUp, Upload, Download, UserPlus, Check, X, Star, History } from 'lucide-react'
import type { Player, Squad, PlayerPosition } from '@/lib/types'
import Link from 'next/link'
import { CSVUpload } from '@/components/CSVUpload'
import { exportPlayersToCSV } from '@/lib/csv-utils'
import { InviteCoTrainer } from '@/components/InviteCoTrainer'
import { useUserStats } from '@/hooks/useUserStats'

function SquadDetailContent() {
  const router = useRouter()
  const params = useParams()
  const squadId = params.id as string

  const [squad, setSquad] = useState<Squad | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [coTrainers, setCoTrainers] = useState<Array<{ uid: string; email: string }>>([])
  const [loadingCoTrainers, setLoadingCoTrainers] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [technik, setTechnik] = useState(5)
  const [fitness, setFitness] = useState(5)
  const [spielverstaendnis, setSpielverstaendnis] = useState(5)
  const [selectedPositions, setSelectedPositions] = useState<PlayerPosition[]>([])

  const availablePositions: PlayerPosition[] = ['Torhüter', 'Abwehr', 'Mittelfeld', 'Angriff']

  // Edit modal state
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)

  // CSV upload state
  const [showCSVUpload, setShowCSVUpload] = useState(false)

  // Co-Trainer invite state
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Gamification
  const { trackPlayerAdded } = useUserStats()

  // Check if current user is owner
  const isOwner = squad?.ownerId === auth.currentUser?.uid

  // Load squad info
  useEffect(() => {
    if (!squadId) return

    const loadSquad = async () => {
      const squadDoc = await getDoc(doc(db, 'squads', squadId))
      if (squadDoc.exists()) {
        setSquad({
          id: squadDoc.id,
          ...squadDoc.data(),
        } as Squad)
      } else {
        router.push('/squads')
      }
    }

    loadSquad()
  }, [squadId, router])

  // Load players for this squad
  useEffect(() => {
    if (!squadId) return

    const q = query(
      collection(db, 'players'),
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

  // Load co-trainers when squad changes
  useEffect(() => {
    if (!squad || !squad.coTrainerIds || squad.coTrainerIds.length === 0) {
      setCoTrainers([])
      return
    }

    const loadCoTrainers = async () => {
      setLoadingCoTrainers(true)
      try {
        const coTrainerPromises = squad.coTrainerIds!.map(async (uid) => {
          const userDoc = await getDoc(doc(db, 'users', uid))
          if (userDoc.exists()) {
            return {
              uid,
              email: userDoc.data().email || 'Unknown',
            }
          }
          return { uid, email: 'Unknown' }
        })

        const loadedCoTrainers = await Promise.all(coTrainerPromises)
        setCoTrainers(loadedCoTrainers)
      } catch (error) {
        console.error('Error loading co-trainers:', error)
      } finally {
        setLoadingCoTrainers(false)
      }
    }

    loadCoTrainers()
  }, [squad])

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert('Bitte gib einen Spielernamen ein!')
      return
    }

    const playerData = {
      squadId,
      name: name.trim(),
      technik,
      fitness,
      spielverstaendnis,
      total: technik + fitness + spielverstaendnis,
      positions: selectedPositions.length > 0 ? selectedPositions : undefined,
      createdAt: new Date().toISOString(),
    }

    try {
      await addDoc(collection(db, 'players'), playerData)
      // Reset form
      setName('')
      setTechnik(5)
      setFitness(5)
      setSpielverstaendnis(5)
      setSelectedPositions([])

      // Track achievement
      if (isOwner) {
        await trackPlayerAdded()
      }
    } catch (error) {
      console.error('Error adding player:', error)
      alert('Fehler beim Hinzufügen!')
    }
  }

  const handleUpdatePlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPlayer) return

    try {
      await updateDoc(doc(db, 'players', editingPlayer.id), {
        name: editingPlayer.name,
        technik: editingPlayer.technik,
        fitness: editingPlayer.fitness,
        spielverstaendnis: editingPlayer.spielverstaendnis,
        total: editingPlayer.technik + editingPlayer.fitness + editingPlayer.spielverstaendnis,
        positions: editingPlayer.positions && editingPlayer.positions.length > 0 ? editingPlayer.positions : undefined,
      })
      setEditingPlayer(null)
    } catch (error) {
      console.error('Error updating player:', error)
      alert('Fehler beim Aktualisieren!')
    }
  }

  const togglePosition = (position: PlayerPosition) => {
    setSelectedPositions((prev) => {
      if (prev.includes(position)) {
        return prev.filter((p) => p !== position)
      } else {
        return [...prev, position]
      }
    })
  }

  const toggleEditPosition = (position: PlayerPosition) => {
    if (!editingPlayer) return
    setEditingPlayer({
      ...editingPlayer,
      positions: editingPlayer.positions?.includes(position)
        ? editingPlayer.positions.filter((p) => p !== position)
        : [...(editingPlayer.positions || []), position],
    })
  }

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('Spieler wirklich löschen?')) return

    try {
      await deleteDoc(doc(db, 'players', playerId))
    } catch (error) {
      console.error('Error deleting player:', error)
      alert('Fehler beim Löschen!')
    }
  }

  const handleExportCSV = () => {
    if (players.length === 0) {
      alert('Keine Spieler zum Exportieren vorhanden!')
      return
    }
    exportPlayersToCSV(players, squad?.name || 'squad')
  }

  const handleImportComplete = () => {
    // Players will auto-refresh via onSnapshot listener
    setShowCSVUpload(false)
  }

  const handleRemoveCoTrainer = async (coTrainerUid: string) => {
    if (!confirm('Möchtest du diesen Co-Trainer wirklich entfernen?')) return

    try {
      await updateDoc(doc(db, 'squads', squadId), {
        coTrainerIds: arrayRemove(coTrainerUid),
      })
    } catch (error) {
      console.error('Error removing co-trainer:', error)
      alert('Fehler beim Entfernen des Co-Trainers!')
    }
  }

  const avgTotal = players.length > 0
    ? (players.reduce((sum, p) => sum + p.total, 0) / players.length).toFixed(1)
    : 0

  if (loading || !squad) {
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
        {/* Back Button */}
        <Link
          href="/squads"
          className="inline-flex items-center gap-2 text-sm text-mid-grey hover:text-neon-lime transition-smooth mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zu Teams
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-4xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-2">
                {squad.name}
              </h1>
              <p className="text-mid-grey">
                {isOwner ? 'Verwalte die Spieler in dieser Mannschaft' : 'Co-Trainer • Nur-Lesen Zugriff'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Teams generieren Button - Primary CTA */}
              {players.length >= 4 ? (
                <Link href={`/teams?squad=${squadId}`}>
                  {/* Mobile: Icon only */}
                  <Button
                    variant="primary"
                    className="md:hidden flex items-center justify-center"
                  >
                    <Users className="w-5 h-5" strokeWidth={2} />
                  </Button>

                  {/* Desktop: Icon + Text */}
                  <Button
                    variant="primary"
                    className="hidden md:flex items-center gap-2"
                  >
                    <Users className="w-5 h-5" strokeWidth={2} />
                    Teams generieren
                  </Button>
                </Link>
              ) : (
                <div className="relative group">
                  {/* Mobile: Icon only (disabled) */}
                  <Button
                    variant="primary"
                    disabled
                    className="md:hidden flex items-center justify-center"
                    title={`Noch ${4 - players.length} Spieler benötigt`}
                  >
                    <Users className="w-5 h-5" strokeWidth={2} />
                  </Button>

                  {/* Desktop: Icon + Text (disabled) */}
                  <Button
                    variant="primary"
                    disabled
                    className="hidden md:flex items-center gap-2"
                    title={`Noch ${4 - players.length} Spieler benötigt`}
                  >
                    <Users className="w-5 h-5" strokeWidth={2} />
                    Teams generieren
                  </Button>
                </div>
              )}

              {isOwner && (
                <>
                  {/* Mobile: Icon only */}
                  <Button
                    variant="secondary"
                    onClick={() => setShowInviteModal(true)}
                    className="md:hidden flex items-center justify-center"
                  >
                    <UserPlus className="w-5 h-5" strokeWidth={2} />
                  </Button>

                  {/* Desktop: Icon + Text */}
                  <Button
                    variant="secondary"
                    onClick={() => setShowInviteModal(true)}
                    className="hidden md:flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" strokeWidth={2} />
                    Co-Trainer einladen
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-neon-lime/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-neon-lime" />
              </div>
              <div>
                <p className="text-sm text-mid-grey uppercase tracking-label">Spieler</p>
                <p className="text-3xl font-bold text-deep-petrol dark:text-soft-mint">
                  {players.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-digital-orange/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-digital-orange" />
              </div>
              <div>
                <p className="text-sm text-mid-grey uppercase tracking-label">Ø Stärke</p>
                <p className="text-3xl font-bold text-deep-petrol dark:text-soft-mint">
                  {avgTotal}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Co-Trainer Management - Only visible to Owner */}
        {isOwner && coTrainers.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-digital-orange" strokeWidth={2} />
                Co-Trainer ({coTrainers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {coTrainers.map((coTrainer) => (
                  <div
                    key={coTrainer.uid}
                    className="flex items-center justify-between p-4 rounded-lg bg-soft-mint/50 dark:bg-card-dark border border-mid-grey/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-digital-orange/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-digital-orange" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="font-medium text-deep-petrol dark:text-soft-mint">
                          {coTrainer.email}
                        </p>
                        <p className="text-xs text-mid-grey">
                          Kann Teams generieren • Nur-Lesen Zugriff
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveCoTrainer(coTrainer.uid)}
                      className="p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-deep-petrol transition-smooth"
                      title="Co-Trainer entfernen"
                    >
                      <Trash2 className="w-4 h-4 text-mid-grey hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Player Form - Only for Owner */}
        {isOwner && (
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Neuen Spieler hinzufügen</CardTitle>
              <div className="flex gap-2">
                {/* Mobile: Icons only */}
                <Button
                  variant="secondary"
                  onClick={() => setShowCSVUpload(true)}
                  className="md:hidden flex items-center justify-center"
                >
                  <Upload className="w-5 h-5" />
                </Button>
                {players.length > 0 && (
                  <Button
                    variant="secondary"
                    onClick={handleExportCSV}
                    className="md:hidden flex items-center justify-center"
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                )}

                {/* Desktop: Icons + Text */}
                <Button
                  variant="secondary"
                  onClick={() => setShowCSVUpload(true)}
                  className="hidden md:flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  CSV Import
                </Button>
                {players.length > 0 && (
                  <Button
                    variant="secondary"
                    onClick={handleExportCSV}
                    className="hidden md:flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    CSV Export
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <Input
                label="Name"
                type="text"
                placeholder="Spielername"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Technik (1-10)"
                  type="number"
                  min="1"
                  max="10"
                  value={technik}
                  onChange={(e) => setTechnik(Number(e.target.value))}
                />
                <Input
                  label="Fitness (1-10)"
                  type="number"
                  min="1"
                  max="10"
                  value={fitness}
                  onChange={(e) => setFitness(Number(e.target.value))}
                />
                <Input
                  label="Spielverständnis (1-10)"
                  type="number"
                  min="1"
                  max="10"
                  value={spielverstaendnis}
                  onChange={(e) => setSpielverstaendnis(Number(e.target.value))}
                />
              </div>

              {/* Position Selection - Updated for Vercel deployment */}
              <div>
                <label className="block text-sm font-medium text-deep-petrol dark:text-soft-mint mb-2">
                  Position(en) - Mehrfachauswahl möglich
                </label>
                <p className="text-xs text-mid-grey mb-3 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-neon-lime text-neon-lime" />
                  Erste Auswahl = Hauptposition (beste Position des Spielers)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {availablePositions.map((position) => {
                    const positionIndex = selectedPositions.indexOf(position)
                    const isSelected = positionIndex !== -1
                    const isPrimary = positionIndex === 0

                    return (
                      <label
                        key={position}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-smooth ${
                          isSelected
                            ? isPrimary
                              ? 'border-neon-lime bg-neon-lime/20 ring-2 ring-neon-lime/30'
                              : 'border-orange-500 bg-orange-500/10'
                            : 'border-mid-grey/30 bg-white dark:bg-card-dark hover:border-neon-lime/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => togglePosition(position)}
                          className="w-4 h-4 text-neon-lime border-mid-grey/30 rounded focus:ring-neon-lime"
                        />
                        <span className="text-sm font-medium text-deep-petrol dark:text-soft-mint flex items-center gap-1">
                          {position}
                          {isSelected && (
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded-full font-bold flex items-center ${
                                isPrimary
                                  ? 'bg-neon-lime text-deep-petrol'
                                  : 'bg-orange-500 text-white'
                              }`}
                            >
                              {isPrimary ? <Star className="w-3 h-3 fill-current" /> : positionIndex + 1}
                            </span>
                          )}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Mobile: Icon only */}
              <Button
                type="submit"
                variant="primary"
                className="md:hidden flex items-center justify-center"
              >
                <Plus className="w-6 h-6" />
              </Button>

              {/* Desktop: Icon + Text */}
              <Button
                type="submit"
                variant="primary"
                className="hidden md:flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Spieler hinzufügen
              </Button>
            </form>
          </CardContent>
        </Card>
        )}

        {/* Players List */}
        {players.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-mid-grey" />
              <p className="text-mid-grey mb-4">
                Noch keine Spieler in diesem Team
              </p>
              <p className="text-sm text-mid-grey">
                Füge deinen ersten Spieler hinzu
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
              <Card key={player.id}>
                <CardContent className="p-6">
                  {editingPlayer?.id === player.id ? (
                    // Edit Mode
                    <form onSubmit={handleUpdatePlayer} className="space-y-3">
                      <Input
                        type="text"
                        value={editingPlayer.name}
                        onChange={(e) =>
                          setEditingPlayer({ ...editingPlayer, name: e.target.value })
                        }
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={editingPlayer.technik}
                          onChange={(e) =>
                            setEditingPlayer({
                              ...editingPlayer,
                              technik: Number(e.target.value),
                            })
                          }
                        />
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={editingPlayer.fitness}
                          onChange={(e) =>
                            setEditingPlayer({
                              ...editingPlayer,
                              fitness: Number(e.target.value),
                            })
                          }
                        />
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={editingPlayer.spielverstaendnis}
                          onChange={(e) =>
                            setEditingPlayer({
                              ...editingPlayer,
                              spielverstaendnis: Number(e.target.value),
                            })
                          }
                        />
                      </div>

                      {/* Position Selection in Edit Mode */}
                      <div>
                        <label className="flex items-center gap-1 text-xs font-medium text-mid-grey mb-2">
                          Position(en) - <Star className="w-3 h-3 fill-neon-lime text-neon-lime" /> Erste = Hauptposition
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {availablePositions.map((position) => {
                            const posIndex = editingPlayer.positions?.indexOf(position) ?? -1
                            const isSelected = posIndex !== -1
                            const isPrimary = posIndex === 0

                            return (
                              <label
                                key={position}
                                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-smooth ${
                                  isSelected
                                    ? isPrimary
                                      ? 'border-neon-lime bg-neon-lime/20 ring-1 ring-neon-lime/30'
                                      : 'border-orange-500 bg-orange-500/10'
                                    : 'border-mid-grey/30 hover:border-neon-lime/50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleEditPosition(position)}
                                  className="w-3 h-3"
                                />
                                <span className="flex items-center gap-1">
                                  {position}
                                  {isSelected && (
                                    <span
                                      className={`text-xs px-1 py-0.5 rounded font-bold flex items-center ${
                                        isPrimary
                                          ? 'bg-neon-lime text-deep-petrol'
                                          : 'bg-orange-500 text-white'
                                      }`}
                                    >
                                      {isPrimary ? <Star className="w-3 h-3 fill-current" /> : posIndex + 1}
                                    </span>
                                  )}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 justify-end">
                        <button
                          type="submit"
                          aria-label="Speichern"
                          className="w-10 h-10 rounded-full bg-neon-lime hover:bg-neon-lime/90 text-deep-petrol flex items-center justify-center transition-smooth"
                        >
                          <Check className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                        <button
                          type="button"
                          aria-label="Abbrechen"
                          onClick={() => setEditingPlayer(null)}
                          className="w-10 h-10 rounded-full bg-mid-grey/20 hover:bg-mid-grey/30 text-mid-grey hover:text-deep-petrol dark:hover:text-white flex items-center justify-center transition-smooth"
                        >
                          <X className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                      </div>
                    </form>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg text-deep-petrol dark:text-soft-mint">
                          {player.name}
                        </h3>
                        {isOwner && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEditingPlayer(player)}
                              className="p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-card-dark transition-smooth"
                            >
                              <Edit2 className="w-4 h-4 text-mid-grey" />
                            </button>
                            <button
                              onClick={() => handleDeletePlayer(player.id)}
                              className="p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-card-dark transition-smooth"
                            >
                              <Trash2 className="w-4 h-4 text-mid-grey hover:text-red-500" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        {/* Positions */}
                        {player.positions && player.positions.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {player.positions.map((position) => (
                                <span
                                  key={position}
                                  className="px-2 py-1 rounded-full text-xs font-medium bg-digital-orange/20 text-digital-orange"
                                >
                                  {position}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

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
                          <span className="font-medium">{player.spielverstaendnis}/10</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-mid-grey/20">
                          <span className="text-mid-grey font-bold">Gesamt:</span>
                          <span className="font-bold text-neon-lime">{player.total}</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Team Generation Button */}
      </PageLayout>

      <BottomNav />

      {/* CSV Upload Modal */}
      {showCSVUpload && (
        <CSVUpload
          squadId={squadId}
          onImportComplete={handleImportComplete}
          onClose={() => setShowCSVUpload(false)}
        />
      )}

      {/* Co-Trainer Invite Modal */}
      {showInviteModal && squad && (
        <InviteCoTrainer
          squadId={squadId}
          squadName={squad.name}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  )
}

export default function SquadDetailPage() {
  return (
    <AuthGuard>
      <SquadDetailContent />
    </AuthGuard>
  )
}
