'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { PlayerSelectionCard, type Player } from '@/components/PlayerSelectionCard'
import { Users, Shuffle, RotateCcw, Shield, ArrowRight, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useUserStats } from '@/hooks/useUserStats'

interface Team {
  players: Player[]
  totalStrength: number
}

function TeamsPageContent() {
  const searchParams = useSearchParams()
  const squadId = searchParams.get('squad')

  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set())
  const [teamCount, setTeamCount] = useState(2)
  const [teams, setTeams] = useState<Team[]>([])
  const { trackTeamGenerated } = useUserStats()

  // Load players for the specific squad
  useEffect(() => {
    if (!squadId) {
      setAllPlayers([])
      return
    }

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
      setAllPlayers(loadedPlayers)
    })

    return () => unsubscribe()
  }, [squadId])

  const handleTogglePlayer = (playerId: string) => {
    setSelectedPlayerIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(playerId)) {
        newSet.delete(playerId)
      } else {
        newSet.add(playerId)
      }
      return newSet
    })
  }

  const createTeams = () => {
    if (selectedPlayerIds.size < 2) {
      alert('Bitte wähle mindestens 2 Spieler aus!')
      return
    }

    if (teamCount < 2 || teamCount > selectedPlayerIds.size) {
      alert(`Anzahl der Teams muss zwischen 2 und ${selectedPlayerIds.size} liegen!`)
      return
    }

    // Filter selected players
    const selectedPlayers = allPlayers.filter((p) => selectedPlayerIds.has(p.id))

    // Sort by total strength (descending)
    const sortedPlayers = [...selectedPlayers].sort((a, b) => b.total - a.total)

    // Initialize teams
    const newTeams: Team[] = Array.from({ length: teamCount }, () => ({
      players: [],
      totalStrength: 0,
    }))

    // Snake-Draft Algorithm
    sortedPlayers.forEach((player, index) => {
      const round = Math.floor(index / teamCount)
      let teamIndex: number

      if (round % 2 === 0) {
        // Even round: left to right
        teamIndex = index % teamCount
      } else {
        // Odd round: right to left (Snake)
        teamIndex = teamCount - 1 - (index % teamCount)
      }

      newTeams[teamIndex].players.push(player)
      newTeams[teamIndex].totalStrength += player.total
    })

    setTeams(newTeams)

    // Track achievement
    trackTeamGenerated()
  }

  const addLatePlayer = (playerId: string) => {
    if (teams.length === 0) return

    const player = allPlayers.find((p) => p.id === playerId)
    if (!player) return

    // Find weakest team
    let weakestTeamIndex = 0
    let lowestStrength = teams[0].totalStrength

    teams.forEach((team, index) => {
      if (team.totalStrength < lowestStrength) {
        lowestStrength = team.totalStrength
        weakestTeamIndex = index
      }
    })

    // Add player to weakest team
    const updatedTeams = teams.map((team, index) => {
      if (index === weakestTeamIndex) {
        return {
          players: [...team.players, player],
          totalStrength: team.totalStrength + player.total,
        }
      }
      return team
    })

    setTeams(updatedTeams)
    setSelectedPlayerIds((prev) => {
      const newSet = new Set(prev)
      newSet.add(playerId)
      return newSet
    })
  }

  const resetSelection = () => {
    setSelectedPlayerIds(new Set())
    setTeams([])
  }

  const shareTeamsOnWhatsApp = () => {
    if (teams.length === 0) return

    // Format teams as text
    let message = '⚽ Teams für heute:\n\n'

    teams.forEach((team, index) => {
      const avgStrength = team.players.length > 0
        ? (team.totalStrength / team.players.length).toFixed(1)
        : '0'

      message += `*Team ${index + 1}* (Ø ${avgStrength})\n`

      team.players.forEach((player) => {
        const posStr = player.positions && player.positions.length > 0
          ? ` [${player.positions.join(', ')}]`
          : ''
        message += `• ${player.name}${posStr} (T:${player.technik} F:${player.fitness} S:${player.spielverstaendnis})\n`
      })

      message += `Teamstärke: ${team.totalStrength}\n\n`
    })

    message += '✨ Erstellt mit CoachBase\nhttps://coachbase.app'

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message)

    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  // Get players that are not in teams yet (Nachzügler)
  const assignedPlayerIds = new Set(
    teams.flatMap((team) => team.players.map((p) => p.id))
  )
  const latecomers = allPlayers.filter((p) => !assignedPlayerIds.has(p.id))

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-h1-mobile md:text-h1-desktop font-headline mb-1">
                <span className="text-gradient">CoachBase</span>
              </h1>
              <p className="text-sm text-mid-grey uppercase tracking-label">
                Faire Team-Auswahl
              </p>
            </div>
            <Link href="/squads">
              {/* Mobile: Icon only */}
              <Button variant="secondary" className="md:hidden flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </Button>

              {/* Desktop: Icon + Text */}
              <Button variant="secondary" className="hidden md:flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Zur Verwaltung
              </Button>
            </Link>
          </div>
        </Card>

        {/* Info Box */}
        <div className="mb-6 p-4 rounded-lg bg-neon-lime/10 border-l-4 border-neon-lime">
          <p className="text-sm text-deep-petrol dark:text-soft-mint">
            <strong>Tipp:</strong> Klicke auf die Spieler, die heute mitspielen. Die ausgewählten
            Spieler werden dann fair auf Teams verteilt.
          </p>
          <p className="text-xs text-mid-grey mt-2">
            ⚠️ Mindestens 4 Spieler erforderlich für Team-Generierung
          </p>
        </div>

        {/* Selected Count */}
        <div className="mb-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-lime text-deep-petrol font-bold">
            <Users className="w-5 h-5" />
            {selectedPlayerIds.size} ausgewählt
          </div>

          {selectedPlayerIds.size > 0 && (
            <>
              {/* Mobile: Icon only */}
              <Button
                variant="secondary"
                size="sm"
                onClick={resetSelection}
                className="md:hidden flex items-center justify-center"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>

              {/* Desktop: Icon + Text */}
              <Button
                variant="secondary"
                size="sm"
                onClick={resetSelection}
                className="hidden md:flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Zurücksetzen
              </Button>
            </>
          )}
        </div>

        {/* Player Selection Grid */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Spieler auswählen</CardTitle>
          </CardHeader>
          <CardContent>
            {!squadId ? (
              <p className="text-center text-mid-grey py-8">
                Bitte wähle zuerst ein Team in der Verwaltung aus.
              </p>
            ) : allPlayers.length === 0 ? (
              <p className="text-center text-mid-grey py-8">
                Noch keine Spieler vorhanden. Bitte zuerst Spieler in der Verwaltung anlegen.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {allPlayers.map((player) => (
                  <PlayerSelectionCard
                    key={player.id}
                    player={player}
                    selected={selectedPlayerIds.has(player.id)}
                    onToggle={handleTogglePlayer}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Creation Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Teams erstellen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    Anzahl der Teams
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={teamCount}
                    onChange={(e) => setTeamCount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-card-dark border-2 border-mid-grey/30 focus:border-neon-lime focus:outline-none transition-smooth"
                  />
                </div>
                <div className="flex items-end">
                  {/* Mobile: Icon only */}
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={createTeams}
                    disabled={selectedPlayerIds.size < 4}
                    className="md:hidden flex items-center justify-center"
                  >
                    <Shuffle className="w-6 h-6" />
                  </Button>

                  {/* Desktop: Icon + Text */}
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={createTeams}
                    disabled={selectedPlayerIds.size < 4}
                    className="hidden md:flex items-center justify-center gap-2"
                  >
                    <Shuffle className="w-5 h-5" />
                    Teams generieren
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generated Teams */}
        {teams.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {teams.map((team, index) => {
                const avgStrength = team.players.length > 0
                  ? (team.totalStrength / team.players.length).toFixed(1)
                  : '0'

                return (
                  <Card key={index} variant="elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Team {index + 1}</span>
                        <span className="text-sm font-medium text-neon-lime">
                          Ø {avgStrength}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {team.players.map((player) => (
                          <div
                            key={player.id}
                            className="p-3 rounded-lg bg-soft-mint/50 dark:bg-deep-petrol border border-mid-grey/10"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="font-bold text-base">{player.name}</div>
                              {player.positions && player.positions.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {player.positions.map((pos) => (
                                    <span
                                      key={pos}
                                      className="px-1.5 py-0.5 rounded text-xs font-medium bg-digital-purple/20 text-digital-purple"
                                    >
                                      {pos}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-mid-grey">
                              T: {player.technik} • F: {player.fitness} • S:{' '}
                              {player.spielverstaendnis} • Σ {player.total}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-3 border-t border-mid-grey/20 text-sm">
                        <div className="flex justify-between">
                          <span className="text-mid-grey">Spieler:</span>
                          <span className="font-bold">{team.players.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-mid-grey">Teamstärke:</span>
                          <span className="font-bold">{team.totalStrength}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* WhatsApp Share Button */}
            <Card className="bg-neon-lime/10 border-2 border-neon-lime/30">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-deep-petrol dark:text-soft-mint mb-1">
                      Teams teilen
                    </h3>
                    <p className="text-sm text-mid-grey">
                      Sende die Teamaufteilung direkt an Eltern und Spieler
                    </p>
                  </div>
                  {/* Mobile: Icon only */}
                  <Button
                    variant="primary"
                    onClick={shareTeamsOnWhatsApp}
                    className="md:hidden flex items-center justify-center"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </Button>

                  {/* Desktop: Icon + Text */}
                  <Button
                    variant="primary"
                    onClick={shareTeamsOnWhatsApp}
                    className="hidden md:flex items-center gap-2 whitespace-nowrap"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Via WhatsApp teilen
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Nachzügler Section */}
            {latecomers.length > 0 && (
              <Card className="bg-digital-purple/5 border-2 border-digital-purple/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Nachzügler hinzufügen ({latecomers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-mid-grey mb-4">
                    Spieler, die später kommen, können hier fair auf die Teams verteilt werden.
                  </p>
                  <div className="space-y-2">
                    {latecomers.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-card-dark"
                      >
                        <div>
                          <div className="font-bold">{player.name}</div>
                          <div className="text-sm text-mid-grey">
                            Gesamt: {player.total}/30
                          </div>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => addLatePlayer(player.id)}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TeamsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-neon-lime border-t-transparent mx-auto mb-4"></div>
          <p className="text-mid-grey">Lädt...</p>
        </div>
      </div>
    }>
      <TeamsPageContent />
    </Suspense>
  )
}
