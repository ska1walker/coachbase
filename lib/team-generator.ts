import type { Player, PlayerPosition } from './types'

/**
 * Team structure with detailed statistics
 */
export interface GeneratedTeam {
  players: Player[]
  totalStrength: number
  avgTechnik: number
  avgFitness: number
  avgSpielverstaendnis: number
  positionCounts: Record<PlayerPosition, number>
}

/**
 * Imbalance metrics for optimization
 */
interface ImbalanceMetrics {
  totalScore: number
  playerCountDiff: number
  technikDiff: number
  fitnessDiff: number
  spielverstaendnisDiff: number
  positionImbalance: number
}

/**
 * Position priority for team composition
 */
const POSITION_PRIORITY: Record<PlayerPosition, number> = {
  'Torhüter': 1.5,    // Highest priority - every team needs goalkeeper
  'Abwehr': 1.2,      // High priority - defensive stability
  'Mittelfeld': 1.0,  // Medium priority - most flexible
  'Angriff': 1.1,     // Medium-high priority - offensive power
}

/**
 * Calculate team statistics
 */
function calculateTeamStats(team: Player[]): GeneratedTeam {
  if (team.length === 0) {
    return {
      players: [],
      totalStrength: 0,
      avgTechnik: 0,
      avgFitness: 0,
      avgSpielverstaendnis: 0,
      positionCounts: {
        'Torhüter': 0,
        'Abwehr': 0,
        'Mittelfeld': 0,
        'Angriff': 0,
      },
    }
  }

  const totalStrength = team.reduce((sum, p) => sum + p.total, 0)
  const avgTechnik = team.reduce((sum, p) => sum + p.technik, 0) / team.length
  const avgFitness = team.reduce((sum, p) => sum + p.fitness, 0) / team.length
  const avgSpielverstaendnis = team.reduce((sum, p) => sum + p.spielverstaendnis, 0) / team.length

  // Count positions (players can have multiple positions)
  const positionCounts: Record<PlayerPosition, number> = {
    'Torhüter': 0,
    'Abwehr': 0,
    'Mittelfeld': 0,
    'Angriff': 0,
  }

  team.forEach((player) => {
    if (player.positions && player.positions.length > 0) {
      // Count each position the player can play
      player.positions.forEach((pos) => {
        positionCounts[pos]++
      })
    }
  })

  return {
    players: team,
    totalStrength,
    avgTechnik,
    avgFitness,
    avgSpielverstaendnis,
    positionCounts,
  }
}

/**
 * Calculate which position a player should fill for a team
 * Based on team needs and position priority
 */
function getBestPositionForTeam(
  player: Player,
  teamStats: GeneratedTeam,
  allTeamsStats: GeneratedTeam[]
): PlayerPosition | null {
  if (!player.positions || player.positions.length === 0) {
    return null
  }

  if (player.positions.length === 1) {
    return player.positions[0]
  }

  // Calculate position needs (lower count = higher need)
  const avgPositionCounts: Record<PlayerPosition, number> = {
    'Torhüter': 0,
    'Abwehr': 0,
    'Mittelfeld': 0,
    'Angriff': 0,
  }

  // Calculate average position counts across all teams
  allTeamsStats.forEach((stats) => {
    Object.entries(stats.positionCounts).forEach(([pos, count]) => {
      avgPositionCounts[pos as PlayerPosition] += count
    })
  })

  Object.keys(avgPositionCounts).forEach((pos) => {
    avgPositionCounts[pos as PlayerPosition] /= allTeamsStats.length
  })

  // Find position with highest need (lowest count relative to average)
  let bestPosition = player.positions[0]
  let highestNeed = -Infinity

  player.positions.forEach((pos) => {
    const currentCount = teamStats.positionCounts[pos]
    const avgCount = avgPositionCounts[pos]
    const priority = POSITION_PRIORITY[pos]

    // Need score: lower count + higher priority = higher need
    const needScore = (avgCount - currentCount) * priority

    if (needScore > highestNeed) {
      highestNeed = needScore
      bestPosition = pos
    }
  })

  return bestPosition
}

/**
 * Calculate imbalance score between teams
 * Lower score = better balance
 */
function calculateImbalance(teams: GeneratedTeam[]): ImbalanceMetrics {
  if (teams.length < 2) {
    return {
      totalScore: 0,
      playerCountDiff: 0,
      technikDiff: 0,
      fitnessDiff: 0,
      spielverstaendnisDiff: 0,
      positionImbalance: 0,
    }
  }

  // Calculate pairwise differences
  let totalPlayerCountDiff = 0
  let totalTechnikDiff = 0
  let totalFitnessDiff = 0
  let totalSpielverstaendnisDiff = 0
  let totalPositionImbalance = 0
  let comparisons = 0

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const teamA = teams[i]
      const teamB = teams[j]

      // Player count difference (heavily penalized)
      totalPlayerCountDiff += Math.abs(teamA.players.length - teamB.players.length) * 10

      // Attribute differences (normalized)
      totalTechnikDiff += Math.abs(teamA.avgTechnik - teamB.avgTechnik)
      totalFitnessDiff += Math.abs(teamA.avgFitness - teamB.avgFitness)
      totalSpielverstaendnisDiff += Math.abs(teamA.avgSpielverstaendnis - teamB.avgSpielverstaendnis)

      // Position imbalance
      Object.keys(POSITION_PRIORITY).forEach((pos) => {
        const position = pos as PlayerPosition
        const countDiff = Math.abs(
          teamA.positionCounts[position] - teamB.positionCounts[position]
        )
        const priority = POSITION_PRIORITY[position]
        totalPositionImbalance += countDiff * priority
      })

      comparisons++
    }
  }

  // Average across all comparisons
  const playerCountDiff = totalPlayerCountDiff / comparisons
  const technikDiff = totalTechnikDiff / comparisons
  const fitnessDiff = totalFitnessDiff / comparisons
  const spielverstaendnisDiff = totalSpielverstaendnisDiff / comparisons
  const positionImbalance = totalPositionImbalance / comparisons

  // Total weighted score
  const totalScore =
    playerCountDiff * 5.0 + // Player count is most important
    technikDiff * 2.0 +
    fitnessDiff * 2.0 +
    spielverstaendnisDiff * 2.0 +
    positionImbalance * 1.5

  return {
    totalScore,
    playerCountDiff,
    technikDiff,
    fitnessDiff,
    spielverstaendnisDiff,
    positionImbalance,
  }
}

/**
 * Initial greedy assignment with position awareness and STRICT team size parity
 */
function initialAssignment(players: Player[], teamCount: number): Player[][] {
  const teams: Player[][] = Array.from({ length: teamCount }, () => [])

  // Calculate target team size
  const targetSize = Math.floor(players.length / teamCount)
  const remainder = players.length % teamCount

  // Sort players by total strength (descending)
  const sortedPlayers = [...players].sort((a, b) => b.total - a.total)

  // Assign players using a position-aware greedy approach with size constraints
  sortedPlayers.forEach((player) => {
    // Calculate current stats for all teams
    const teamsStats = teams.map(calculateTeamStats)

    // Find teams that can still accept players (not at max size yet)
    const eligibleTeams: number[] = []

    teams.forEach((team, index) => {
      // Team can accept if it's below target size, or at target size but should get a remainder player
      const maxSize = index < remainder ? targetSize + 1 : targetSize
      if (team.length < maxSize) {
        eligibleTeams.push(index)
      }
    })

    // If no eligible teams (shouldn't happen), fall back to smallest team
    if (eligibleTeams.length === 0) {
      eligibleTeams.push(0)
    }

    // Among eligible teams, find the one with lowest total strength
    let bestTeamIndex = eligibleTeams[0]
    let lowestStrength = teamsStats[eligibleTeams[0]].totalStrength

    for (let i = 1; i < eligibleTeams.length; i++) {
      const teamIdx = eligibleTeams[i]
      if (teamsStats[teamIdx].totalStrength < lowestStrength) {
        lowestStrength = teamsStats[teamIdx].totalStrength
        bestTeamIndex = teamIdx
      }
    }

    // If player has positions, check if another eligible team needs this position more
    if (player.positions && player.positions.length > 0) {
      const bestPosition = getBestPositionForTeam(player, teamsStats[bestTeamIndex], teamsStats)

      if (bestPosition) {
        // Check if any other eligible team desperately needs this position
        for (const teamIdx of eligibleTeams) {
          if (teamIdx === bestTeamIndex) continue

          const teamStats = teamsStats[teamIdx]
          const strengthDiff = Math.abs(teamStats.totalStrength - lowestStrength)

          // Only consider teams that are not too far ahead in strength
          if (strengthDiff < player.total * 2) {
            const currentPosCount = teamStats.positionCounts[bestPosition]
            const bestTeamPosCount = teamsStats[bestTeamIndex].positionCounts[bestPosition]

            // If this team needs the position much more, assign there
            if (currentPosCount < bestTeamPosCount - 1) {
              bestTeamIndex = teamIdx
              break
            }
          }
        }
      }
    }

    teams[bestTeamIndex].push(player)
  })

  return teams
}

/**
 * Optimize teams through swapping with STRICT team size parity
 */
function optimizeTeamsWithSwaps(
  teams: Player[][],
  maxIterations: number = 1000
): Player[][] {
  let currentTeams = teams.map((team) => [...team])
  let currentStats = currentTeams.map(calculateTeamStats)
  let currentImbalance = calculateImbalance(currentStats)
  let iterations = 0
  let noImprovementCount = 0

  // Calculate allowed team size variance
  const totalPlayers = currentTeams.reduce((sum, team) => sum + team.length, 0)
  const teamCount = currentTeams.length
  const maxSizeDiff = totalPlayers % teamCount === 0 ? 0 : 1

  while (iterations < maxIterations && noImprovementCount < 50) {
    let improved = false

    // Try swapping players between all team pairs
    for (let i = 0; i < currentTeams.length; i++) {
      for (let j = i + 1; j < currentTeams.length; j++) {
        const teamA = currentTeams[i]
        const teamB = currentTeams[j]

        // Try all possible swaps
        for (let playerAIdx = 0; playerAIdx < teamA.length; playerAIdx++) {
          for (let playerBIdx = 0; playerBIdx < teamB.length; playerBIdx++) {
            // Create hypothetical swap
            const newTeams = currentTeams.map((team, idx) => {
              if (idx === i) {
                const newTeam = [...team]
                newTeam[playerAIdx] = teamB[playerBIdx]
                return newTeam
              } else if (idx === j) {
                const newTeam = [...team]
                newTeam[playerBIdx] = teamA[playerAIdx]
                return newTeam
              }
              return [...team]
            })

            // STRICT SIZE CHECK: Ensure no team size violation
            const teamSizes = newTeams.map(t => t.length)
            const minSize = Math.min(...teamSizes)
            const maxSize = Math.max(...teamSizes)

            // Reject swap if it violates size parity constraint
            if (maxSize - minSize > maxSizeDiff) {
              continue
            }

            const newStats = newTeams.map(calculateTeamStats)
            const newImbalance = calculateImbalance(newStats)

            // If swap improves balance, accept it
            if (newImbalance.totalScore < currentImbalance.totalScore - 0.01) {
              currentTeams = newTeams
              currentStats = newStats
              currentImbalance = newImbalance
              improved = true
            }
          }
        }
      }
    }

    iterations++
    if (improved) {
      noImprovementCount = 0
    } else {
      noImprovementCount++
    }

    // Early exit if balance is excellent
    if (currentImbalance.totalScore < 1.0) {
      break
    }
  }

  return currentTeams
}

/**
 * Main function: Generate balanced teams
 */
export function generateBalancedTeams(
  players: Player[],
  teamCount: number
): GeneratedTeam[] {
  if (players.length < teamCount) {
    throw new Error('Nicht genug Spieler für die gewünschte Teamanzahl')
  }

  // Step 1: Initial assignment
  const initialTeams = initialAssignment(players, teamCount)

  // Step 2: Optimize through swapping
  const optimizedTeams = optimizeTeamsWithSwaps(initialTeams)

  // Step 3: Calculate final stats
  const finalTeams = optimizedTeams.map(calculateTeamStats)

  return finalTeams
}

/**
 * Export for debugging/analysis
 */
export function analyzeTeamBalance(teams: GeneratedTeam[]): ImbalanceMetrics {
  return calculateImbalance(teams)
}
