'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { collection, onSnapshot, query, where, orderBy, addDoc, Timestamp, doc, updateDoc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/collections'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { PlayerSelectionCard } from '@/components/PlayerSelectionCard'
import { AppHeader } from '@/components/AppHeader'
import { BottomNav } from '@/components/BottomNav'
import { Users, Shuffle, RotateCcw, ArrowRight, MessageCircle, ChevronDown, ChevronUp, UserPlus, X, Shirt, AlertTriangle, Info, Scale, Sparkles } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'
import { useUserStats } from '@/hooks/useUserStats'
import { showToast } from '@/components/ui/Toast'
import { generateBalancedTeams, analyzeTeamBalance, type GeneratedTeam } from '@/lib/team-generator'
import {
  generateBalancedTeams as generateAdvancedTeams,
  generateBalanceScoreCard,
  type BalancedTeam,
  type BalanceScoreCard
} from '@/lib/advanced-team-generator'
import type { Player } from '@/lib/types'

interface Team {
  players: Player[]
  totalStrength: number
}

interface BuddyGroup {
  id: string
  playerIds: string[]
}

function TeamsPageContent() {
  const searchParams = useSearchParams()
  const squadId = searchParams.get('squad')

  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set())
  const [teamCount, setTeamCount] = useState(2)
  const [teams, setTeams] = useState<Team[]>([])
  const [balanceScoreCard, setBalanceScoreCard] = useState<BalanceScoreCard | null>(null)
  const [buddyGroups, setBuddyGroups] = useState<BuddyGroup[]>([])
  const [showBuddySection, setShowBuddySection] = useState(false)
  const [leibchenTeamIndex, setLeibchenTeamIndex] = useState<number | null>(null)
  const [showSaveMatchDialog, setShowSaveMatchDialog] = useState(false)
  const [savedMatchId, setSavedMatchId] = useState<string | null>(null)
  const [matchScores, setMatchScores] = useState<number[]>([])
  const [isSavingMatch, setIsSavingMatch] = useState(false)
  const { trackTeamGenerated} = useUserStats()

  // Load players for the specific squad
  useEffect(() => {
    if (!squadId) {
      setAllPlayers([])
      setSelectedPlayerIds(new Set())
      return
    }

    const q = query(
      collection(db, COLLECTIONS.PLAYERS),
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

      // Auto-select all players by default
      const allPlayerIds = new Set(loadedPlayers.map(p => p.id))
      setSelectedPlayerIds(allPlayerIds)
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

  // Bulk selection handlers
  const selectAllPlayers = () => {
    const allPlayerIds = new Set(allPlayers.map(p => p.id))
    setSelectedPlayerIds(allPlayerIds)
  }

  const deselectAllPlayers = () => {
    setSelectedPlayerIds(new Set())
  }

  // Buddy Group Management
  const getBuddyLimit = () => {
    const playerCount = selectedPlayerIds.size
    if (playerCount >= 10) return 3
    if (playerCount >= 8) return 2
    return 0 // Not allowed below 8
  }

  const addBuddyGroup = () => {
    const newGroup: BuddyGroup = {
      id: `buddy-${Date.now()}`,
      playerIds: []
    }
    setBuddyGroups([...buddyGroups, newGroup])
  }

  const removeBuddyGroup = (groupId: string) => {
    setBuddyGroups(buddyGroups.filter(g => g.id !== groupId))
  }

  const togglePlayerInBuddyGroup = (groupId: string, playerId: string) => {
    setBuddyGroups(buddyGroups.map(group => {
      if (group.id !== groupId) return group

      const isInGroup = group.playerIds.includes(playerId)
      const limit = getBuddyLimit()

      if (isInGroup) {
        // Remove player from group
        return { ...group, playerIds: group.playerIds.filter(id => id !== playerId) }
      } else {
        // Add player to group (if limit not reached and player not in another group)
        const playerInOtherGroup = buddyGroups.some(g =>
          g.id !== groupId && g.playerIds.includes(playerId)
        )

        if (playerInOtherGroup) {
          showToast('Dieser Spieler ist bereits in einer anderen Buddy-Gruppe!', 'warning')
          return group
        }

        if (group.playerIds.length >= limit) {
          showToast(`Max. ${limit} Spieler pro Buddy-Gruppe!`, 'warning')
          return group
        }

        return { ...group, playerIds: [...group.playerIds, playerId] }
      }
    }))
  }

  const createTeams = () => {
    if (selectedPlayerIds.size < 4) {
      showToast('Bitte wähle mindestens 4 Spieler aus!', 'warning')
      return
    }

    if (teamCount < 2 || teamCount > selectedPlayerIds.size) {
      showToast(`Anzahl der Teams muss zwischen 2 und ${selectedPlayerIds.size} liegen!`, 'warning')
      return
    }

    // Filter selected players
    const selectedPlayers = allPlayers.filter((p) => selectedPlayerIds.has(p.id))

    try {
      if (teamCount === 2) {
        // Use ADVANCED team generator for 2 teams (stricter constraints)
        // Filter out empty buddy groups before passing
        const validBuddyGroups = buddyGroups.filter(g => g.playerIds.length >= 2)
        const result = generateAdvancedTeams(selectedPlayers, {}, validBuddyGroups)

        // Convert to Team interface
        const newTeams: Team[] = [
          {
            players: result.teamA.players,
            totalStrength: result.teamA.stats.totalStrength,
          },
          {
            players: result.teamB.players,
            totalStrength: result.teamB.stats.totalStrength,
          },
        ]

        setTeams(newTeams)

        // Generate and store balance score card
        const scoreCard = generateBalanceScoreCard(result.teamA, result.teamB)
        setBalanceScoreCard(scoreCard)

        console.log('Advanced Balance Score Card:', scoreCard)

        // Randomly assign Leibchen team
        setLeibchenTeamIndex(Math.floor(Math.random() * 2))
      } else {
        // Use STANDARD team generator for 3+ teams
        const generatedTeams = generateBalancedTeams(selectedPlayers, teamCount)

        // Convert to old Team interface for compatibility
        const newTeams: Team[] = generatedTeams.map((team) => ({
          players: team.players,
          totalStrength: team.totalStrength,
        }))

        setTeams(newTeams)
        setBalanceScoreCard(null) // No score card for 3+ teams

        // Log balance metrics for debugging
        const balanceMetrics = analyzeTeamBalance(generatedTeams)
        console.log('Team Balance Metrics:', balanceMetrics)

        // Randomly assign Leibchen team for multi-team
        setLeibchenTeamIndex(Math.floor(Math.random() * teamCount))
      }

      // Track achievement
      trackTeamGenerated()

      // Show dialog to ask if user wants to save match
      setShowSaveMatchDialog(true)
      // Reset saved match state
      setSavedMatchId(null)
      setMatchScores([])
    } catch (error) {
      console.error('Error generating teams:', error)
      showToast('Fehler beim Generieren der Teams!', 'error')
    }
  }


  const saveMatch = async () => {
    if (!squadId || teams.length === 0 || !auth.currentUser) return

    setIsSavingMatch(true)
    try {
      // Prepare teams data with names
      const teamsData = teams.map((team, index) => ({
        teamNumber: index + 1,
        teamName: `Team ${index + 1}`,
        players: team.players,
        totalStrength: team.totalStrength,
        averageStrength: team.players.length > 0
          ? team.totalStrength / team.players.length
          : 0
      }))

      // Save match to Firestore
      const matchDoc = await addDoc(collection(db, COLLECTIONS.SQUADS, squadId, COLLECTIONS.MATCHES), {
        squadId: squadId,
        ownerId: auth.currentUser.uid,
        date: Timestamp.now(),
        teams: teamsData,
        teamCount: teams.length,
        playerCount: teams.reduce((sum, t) => sum + t.players.length, 0),
        leibchenTeamIndex: leibchenTeamIndex,
        createdAt: Timestamp.now()
      })

      setSavedMatchId(matchDoc.id)
      // Initialize scores array with zeros
      setMatchScores(new Array(teams.length).fill(0))
      setShowSaveMatchDialog(false)
      showToast('Match gespeichert! Du kannst jetzt das Ergebnis eintragen.', 'success')
    } catch (error) {
      console.error('Error saving match:', error)
      showToast('Fehler beim Speichern des Matches!', 'error')
    } finally {
      setIsSavingMatch(false)
    }
  }

  const saveMatchResult = async () => {
    if (!squadId || !savedMatchId) return

    setIsSavingMatch(true)
    try {
      const matchRef = doc(db, COLLECTIONS.SQUADS, squadId, 'matches', savedMatchId)
      await updateDoc(matchRef, {
        result: {
          scores: matchScores,
          savedAt: Timestamp.now()
        }
      })
      alert('Ergebnis gespeichert!')
    } catch (error) {
      console.error('Error saving result:', error)
      alert('Fehler beim Speichern des Ergebnisses!')
    } finally {
      setIsSavingMatch(false)
    }
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
    setBalanceScoreCard(null)
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
  // FIXED: Only consider SELECTED players, not all players
  const assignedPlayerIds = new Set(
    teams.flatMap((team) => team.players.map((p) => p.id))
  )
  const latecomers = allPlayers.filter((p) =>
    selectedPlayerIds.has(p.id) && !assignedPlayerIds.has(p.id)
  )

  return (
    <div className="min-h-screen bg-soft-mint dark:bg-deep-petrol pb-20 md:pb-8">
      <AppHeader />
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton
            href={squadId ? `/squads/${squadId}` : '/squads'}
            label="Zurück zur Verwaltung"
          />
        </div>

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
          </div>
        </Card>

        {/* Team Creation Controls - Moved to top for better UX */}
        <Card className="mb-6 sticky top-[80px] z-40 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full md:w-auto">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-smooth ${
                  selectedPlayerIds.size < 4
                    ? 'bg-digital-orange/20 text-digital-orange border-2 border-digital-orange/40'
                    : 'bg-neon-lime text-deep-petrol'
                }`}>
                  <Users className="w-5 h-5" />
                  {selectedPlayerIds.size} / {allPlayers.length} ausgewählt
                  {selectedPlayerIds.size < 4 && (
                    <span className="text-xs ml-1">(min. 4)</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={teamCount}
                  onChange={(e) => setTeamCount(Number(e.target.value))}
                  className="w-20 px-3 py-2 rounded-lg bg-white dark:bg-card-dark border-2 border-mid-grey/30 focus:border-neon-lime focus:outline-none transition-smooth text-center number-input-neon"
                  aria-label="Anzahl der Teams"
                />
                <span className="text-sm text-mid-grey hidden md:inline">Teams</span>
              </div>

              <Button
                variant={selectedPlayerIds.size < 4 ? "secondary" : "primary"}
                onClick={createTeams}
                disabled={selectedPlayerIds.size < 4}
                className={`flex items-center justify-center gap-2 w-full md:w-auto ${
                  selectedPlayerIds.size < 4
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {selectedPlayerIds.size < 4 && (
                  <AlertTriangle className="w-5 h-5" />
                )}
                <Shuffle className="w-5 h-5" />
                <span className="font-bold">
                  {selectedPlayerIds.size < 4
                    ? 'Zu wenig Spieler'
                    : 'Teams generieren'}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Teams */}
        {teams.length > 0 && (
          <div className="space-y-6 mb-6">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {teams.map((team, index) => {
                const avgStrength = team.players.length > 0
                  ? (team.totalStrength / team.players.length).toFixed(1)
                  : '0'

                return (
                  <Card key={index} variant="elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span>Team {index + 1}</span>
                          {leibchenTeamIndex === index && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-digital-orange/20 border border-digital-orange/40">
                              <Shirt className="w-4 h-4 text-digital-orange" strokeWidth={2} />
                              <span className="text-xs font-bold text-digital-orange uppercase">
                                Leibchen
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-neon-lime">
                          Ø {avgStrength}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {team.players.map((player) => {
                          // Check if player is in a buddy group
                          const isBuddy = buddyGroups.some(group =>
                            group.playerIds.includes(player.id)
                          )

                          return (
                            <div
                              key={player.id}
                              className="p-3 rounded-lg bg-soft-mint/50 dark:bg-deep-petrol border border-mid-grey/10"
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2">
                                  {isBuddy && (
                                    <div className="w-6 h-6 rounded-full bg-digital-orange/20 flex items-center justify-center flex-shrink-0">
                                      <UserPlus className="w-3.5 h-3.5 text-digital-orange" strokeWidth={2} />
                                    </div>
                                  )}
                                  <div className="font-bold text-base">{player.name}</div>
                                </div>
                              {player.positions && player.positions.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {player.positions.map((pos) => (
                                    <span
                                      key={pos}
                                      className="px-1.5 py-0.5 rounded text-xs font-medium bg-digital-orange/20 text-digital-orange"
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
                        )
                        })}
                      </div>
                      <div className="pt-3 border-t border-mid-grey/20 text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-mid-grey">Spieler:</span>
                          <span className="font-bold">{team.players.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-mid-grey">Teamstärke:</span>
                          <span className="font-bold">{team.totalStrength}</span>
                        </div>

                        {/* Attribute Averages */}
                        <div className="pt-2 border-t border-mid-grey/10">
                          <div className="flex justify-between text-xs">
                            <span className="text-mid-grey">Ø Technik:</span>
                            <span className="font-medium">
                              {team.players.length > 0
                                ? (team.players.reduce((sum, p) => sum + p.technik, 0) / team.players.length).toFixed(1)
                                : '0'}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-mid-grey">Ø Fitness:</span>
                            <span className="font-medium">
                              {team.players.length > 0
                                ? (team.players.reduce((sum, p) => sum + p.fitness, 0) / team.players.length).toFixed(1)
                                : '0'}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-mid-grey">Ø Spielverständnis:</span>
                            <span className="font-medium">
                              {team.players.length > 0
                                ? (team.players.reduce((sum, p) => sum + p.spielverstaendnis, 0) / team.players.length).toFixed(1)
                                : '0'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Balance Score Card - Only for 2 teams with Advanced Generator */}
            {balanceScoreCard && teamCount === 2 && (
              <Card className={`border-2 ${
                balanceScoreCard.isPerfect
                  ? 'bg-neon-lime/5 border-neon-lime/30'
                  : balanceScoreCard.score < 5.0
                  ? 'bg-digital-orange/5 border-digital-orange/30'
                  : 'bg-orange-500/5 border-orange-500/30'
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Scale className="w-5 h-5" />
                      Team Balance Analyse
                      {balanceScoreCard.isPerfect && (
                        <span className="text-xs px-2 py-1 rounded-full bg-neon-lime text-deep-petrol font-bold">
                          PERFEKT
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-medium text-mid-grey">
                      Score: {balanceScoreCard.score.toFixed(2)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Team A Stats */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-deep-petrol dark:text-soft-mint mb-3">
                        Team 1 Durchschnitte
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-mid-grey">Spieler:</span>
                          <span className="font-medium">{balanceScoreCard.teamA.playerCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-mid-grey">Ø Technik:</span>
                          <span className="font-medium">{balanceScoreCard.teamA.avgTechnik.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-mid-grey">Ø Fitness:</span>
                          <span className="font-medium">{balanceScoreCard.teamA.avgFitness.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-mid-grey">Ø Spielverständnis:</span>
                          <span className="font-medium">{balanceScoreCard.teamA.avgSpielverstaendnis.toFixed(2)}</span>
                        </div>
                        <div className="pt-2 border-t border-mid-grey/20">
                          <div className="flex justify-between text-xs">
                            <span className="text-mid-grey">Torhüter:</span>
                            <span>{balanceScoreCard.teamA.positionCounts.GK}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-mid-grey">Abwehr:</span>
                            <span>{balanceScoreCard.teamA.positionCounts.DEF}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-mid-grey">Mittelfeld:</span>
                            <span>{balanceScoreCard.teamA.positionCounts.MID}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-mid-grey">Angriff:</span>
                            <span>{balanceScoreCard.teamA.positionCounts.ATT}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Team B Stats */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-deep-petrol dark:text-soft-mint mb-3">
                        Team 2 Durchschnitte
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-mid-grey">Spieler:</span>
                          <span className="font-medium">{balanceScoreCard.teamB.playerCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-mid-grey">Ø Technik:</span>
                          <span className="font-medium">{balanceScoreCard.teamB.avgTechnik.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-mid-grey">Ø Fitness:</span>
                          <span className="font-medium">{balanceScoreCard.teamB.avgFitness.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-mid-grey">Ø Spielverständnis:</span>
                          <span className="font-medium">{balanceScoreCard.teamB.avgSpielverstaendnis.toFixed(2)}</span>
                        </div>
                        <div className="pt-2 border-t border-mid-grey/20">
                          <div className="flex justify-between text-xs">
                            <span className="text-mid-grey">Torhüter:</span>
                            <span>{balanceScoreCard.teamB.positionCounts.GK}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-mid-grey">Abwehr:</span>
                            <span>{balanceScoreCard.teamB.positionCounts.DEF}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-mid-grey">Mittelfeld:</span>
                            <span>{balanceScoreCard.teamB.positionCounts.MID}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-mid-grey">Angriff:</span>
                            <span>{balanceScoreCard.teamB.positionCounts.ATT}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Imbalance Metrics */}
                  <div className="mt-4 pt-4 border-t border-mid-grey/20">
                    <h4 className="font-bold text-sm text-deep-petrol dark:text-soft-mint mb-2">
                      Unterschiede (je niedriger, desto besser)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-white dark:bg-card-dark">
                        <div className="text-mid-grey">Spieleranzahl</div>
                        <div className="font-bold">{balanceScoreCard.imbalance.playerCountDiff.toFixed(2)}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-card-dark">
                        <div className="text-mid-grey">Technik</div>
                        <div className="font-bold">{balanceScoreCard.imbalance.technikDiff.toFixed(2)}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-card-dark">
                        <div className="text-mid-grey">Fitness</div>
                        <div className="font-bold">{balanceScoreCard.imbalance.fitnessDiff.toFixed(2)}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-card-dark">
                        <div className="text-mid-grey">Spielverst.</div>
                        <div className="font-bold">{balanceScoreCard.imbalance.spielverstaendnisDiff.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save Match Dialog */}
            {showSaveMatchDialog && !savedMatchId && (
              <Card className="bg-neon-lime/10 border-2 border-neon-lime/30">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-deep-petrol dark:text-soft-mint mb-1">
                        Match speichern?
                      </h3>
                      <p className="text-sm text-mid-grey">
                        Speichere das Match, um später das Ergebnis einzutragen
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => setShowSaveMatchDialog(false)}
                        disabled={isSavingMatch}
                      >
                        Nein
                      </Button>
                      <Button
                        variant="primary"
                        onClick={saveMatch}
                        disabled={isSavingMatch}
                      >
                        {isSavingMatch ? 'Speichert...' : 'Ja, speichern'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Match Result Input */}
            {savedMatchId && (
              <Card className="bg-digital-orange/10 border-2 border-digital-orange/30">
                <CardHeader>
                  <CardTitle>Ergebnis eintragen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-mid-grey">
                      Trage das Spielergebnis ein. Du kannst dies auch später in der History bearbeiten.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {teams.map((team, index) => (
                        <div key={index} className="space-y-2">
                          <label className="block text-sm font-medium">
                            Team {index + 1}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={matchScores[index] || 0}
                            onChange={(e) => {
                              const newScores = [...matchScores]
                              newScores[index] = parseInt(e.target.value) || 0
                              setMatchScores(newScores)
                            }}
                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-card-dark border-2 border-mid-grey/30 focus:border-digital-orange focus:outline-none transition-smooth number-input-neon"
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="primary"
                      onClick={saveMatchResult}
                      disabled={isSavingMatch}
                      className="w-full md:w-auto"
                    >
                      {isSavingMatch ? 'Speichert...' : 'Ergebnis speichern'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

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
              <Card className="bg-digital-orange/5 border-2 border-digital-orange/20">
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

        {/* Selected Count & Bulk Actions */}
        <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm text-mid-grey">
              Spieler Auswahl:
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={selectAllPlayers}
              disabled={selectedPlayerIds.size === allPlayers.length}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Alle auswählen
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={deselectAllPlayers}
              disabled={selectedPlayerIds.size === 0}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Alle abwählen
            </Button>
          </div>
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

        {/* Buddy Groups Section - Collapsible */}
        {selectedPlayerIds.size >= 8 && (
          <Card className="mb-6">
            <button
              onClick={() => setShowBuddySection(!showBuddySection)}
              className="w-full p-6 flex items-center justify-between hover:bg-soft-mint/30 dark:hover:bg-deep-petrol/30 transition-smooth"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-digital-orange/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-digital-orange" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <h3 className="font-headline font-bold text-deep-petrol dark:text-soft-mint">
                    Buddy-Gruppen festlegen
                  </h3>
                  <p className="text-sm text-mid-grey">
                    Optional: Spieler gruppieren die zusammen spielen sollen
                  </p>
                </div>
              </div>
              {showBuddySection ? (
                <ChevronUp className="w-5 h-5 text-mid-grey" />
              ) : (
                <ChevronDown className="w-5 h-5 text-mid-grey" />
              )}
            </button>

            {showBuddySection && (
              <CardContent className="border-t border-mid-grey/20">
                <div className="space-y-4">
                  {/* Info Box */}
                  <div className="p-4 rounded-lg bg-digital-orange/10 border border-digital-orange/30">
                    <p className="text-sm text-deep-petrol dark:text-soft-mint mb-2 flex items-start gap-2">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span><strong>Buddy-Gruppen:</strong> Spieler in einer Buddy-Gruppe werden garantiert ins gleiche Team gesetzt.</span>
                    </p>
                    <p className="text-xs text-mid-grey">
                      {selectedPlayerIds.size >= 10
                        ? `Bei ${selectedPlayerIds.size} Spielern: Max. 3 Buddies pro Gruppe`
                        : `Bei ${selectedPlayerIds.size} Spielern: Max. 2 Buddies pro Gruppe`}
                    </p>
                  </div>

                  {/* Buddy Groups */}
                  {buddyGroups.length > 0 && (
                    <div className="space-y-3">
                      {buddyGroups.map((group, index) => {
                        const selectedPlayers = allPlayers.filter(p =>
                          selectedPlayerIds.has(p.id)
                        )
                        return (
                          <div
                            key={group.id}
                            className="p-4 rounded-lg border-2 border-digital-orange/30 bg-digital-orange/5"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-medium text-deep-petrol dark:text-soft-mint">
                                Buddy-Gruppe {index + 1}
                              </span>
                              <button
                                onClick={() => removeBuddyGroup(group.id)}
                                className="w-6 h-6 rounded-full hover:bg-red-500/20 flex items-center justify-center transition-smooth"
                                aria-label="Gruppe entfernen"
                              >
                                <X className="w-4 h-4 text-red-500" strokeWidth={2} />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                              {selectedPlayers.map(player => {
                                const isInGroup = group.playerIds.includes(player.id)
                                const isInOtherGroup = buddyGroups.some(g =>
                                  g.id !== group.id && g.playerIds.includes(player.id)
                                )

                                return (
                                  <button
                                    key={player.id}
                                    onClick={() => togglePlayerInBuddyGroup(group.id, player.id)}
                                    disabled={isInOtherGroup}
                                    className={`p-2 rounded-lg text-sm font-medium transition-smooth ${
                                      isInGroup
                                        ? 'bg-digital-orange text-white border-2 border-digital-orange'
                                        : isInOtherGroup
                                        ? 'bg-mid-grey/10 text-mid-grey/50 border border-mid-grey/20 cursor-not-allowed'
                                        : 'bg-white dark:bg-card-dark border border-mid-grey/30 hover:border-digital-orange text-deep-petrol dark:text-soft-mint'
                                    }`}
                                  >
                                    {player.name}
                                  </button>
                                )
                              })}
                            </div>

                            {group.playerIds.length > 0 && (
                              <div className="mt-2 text-xs text-digital-orange">
                                {group.playerIds.length} / {getBuddyLimit()} Spieler gewählt
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Add Buddy Group Button */}
                  <Button
                    variant="secondary"
                    onClick={addBuddyGroup}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Buddy-Gruppe hinzufügen
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

export default function TeamsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-deep-petrol dark:bg-deep-petrol p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-neon-lime border-t-transparent mx-auto mb-4"></div>
          <p className="text-soft-mint">Teams werden geladen...</p>
        </div>
      </div>
    }>
      <TeamsPageContent />
    </Suspense>
  )
}
