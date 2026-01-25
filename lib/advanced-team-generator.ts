/**
 * Advanced Team Generator with Attribute-Level Balancing
 *
 * This algorithm ensures fair team distribution by:
 * 1. Hard Constraints: Goalkeeper distribution, team size, position coverage
 * 2. Soft Constraints: Balance EACH attribute separately (not just total score)
 * 3. Swap Mechanism: Minimize variance across all attributes
 *
 * @author Claude Code
 * @version 2.0.0
 */

import type { Player, PlayerPosition } from './types'

/**
 * Position enum mapping (GK, DEF, MID, ATT)
 */
type PositionEnum = 'GK' | 'DEF' | 'MID' | 'ATT'

/**
 * Position mapping from German to English enum
 */
const POSITION_MAP: Record<PlayerPosition, PositionEnum> = {
  'Torhüter': 'GK',
  'Abwehr': 'DEF',
  'Mittelfeld': 'MID',
  'Angriff': 'ATT',
}

/**
 * Reverse mapping
 */
const POSITION_MAP_REVERSE: Record<PositionEnum, PlayerPosition> = {
  'GK': 'Torhüter',
  'DEF': 'Abwehr',
  'MID': 'Mittelfeld',
  'ATT': 'Angriff',
}

/**
 * Team with detailed statistics
 */
export interface BalancedTeam {
  players: Player[]
  stats: TeamStats
}

/**
 * Detailed team statistics
 */
export interface TeamStats {
  playerCount: number
  totalStrength: number
  avgTechnik: number
  avgFitness: number
  avgSpielverstaendnis: number
  positionCounts: Record<PositionEnum, number>
  hasGoalkeeper: boolean
}

/**
 * Balance metrics between two teams
 */
export interface BalanceScoreCard {
  teamA: TeamStats
  teamB: TeamStats
  imbalance: {
    playerCountDiff: number
    technikDiff: number
    fitnessDiff: number
    spielverstaendnisDiff: number
    totalVariance: number
    positionImbalance: number
  }
  isPerfect: boolean
  score: number // Lower is better (0 = perfect balance)
}

/**
 * Configuration for the algorithm
 */
interface GeneratorConfig {
  maxSwapIterations: number
  varianceThreshold: number
  positionWeight: number
  attributeWeight: Record<'technik' | 'fitness' | 'spielverstaendnis', number>
  // NEW: Position depth requirements
  positionDepthWeight: number
  // NEW: Strength level distribution weight
  strengthLevelWeight: number
  // NEW: Position preference weight (prefer players on their primary position)
  positionPreferenceWeight: number
}

const DEFAULT_CONFIG: GeneratorConfig = {
  maxSwapIterations: 1000,
  varianceThreshold: 0.5, // Stop if variance < 0.5
  positionWeight: 2.0,
  attributeWeight: {
    technik: 1.0,
    fitness: 1.0,
    spielverstaendnis: 1.0,
  },
  positionDepthWeight: 3.0, // High priority for position coverage
  strengthLevelWeight: 2.5, // Balance star distribution
  positionPreferenceWeight: 1.5, // Prefer primary positions
}

/**
 * Calculate detailed statistics for a team
 */
function calculateTeamStats(team: Player[]): TeamStats {
  if (team.length === 0) {
    return {
      playerCount: 0,
      totalStrength: 0,
      avgTechnik: 0,
      avgFitness: 0,
      avgSpielverstaendnis: 0,
      positionCounts: { GK: 0, DEF: 0, MID: 0, ATT: 0 },
      hasGoalkeeper: false,
    }
  }

  const totalStrength = team.reduce((sum, p) => sum + p.total, 0)
  const avgTechnik = team.reduce((sum, p) => sum + p.technik, 0) / team.length
  const avgFitness = team.reduce((sum, p) => sum + p.fitness, 0) / team.length
  const avgSpielverstaendnis =
    team.reduce((sum, p) => sum + p.spielverstaendnis, 0) / team.length

  // Count positions
  const positionCounts: Record<PositionEnum, number> = {
    GK: 0,
    DEF: 0,
    MID: 0,
    ATT: 0,
  }

  team.forEach((player) => {
    if (player.positions && player.positions.length > 0) {
      player.positions.forEach((pos) => {
        const enumPos = POSITION_MAP[pos]
        if (enumPos) {
          positionCounts[enumPos]++
        }
      })
    }
  })

  return {
    playerCount: team.length,
    totalStrength,
    avgTechnik,
    avgFitness,
    avgSpielverstaendnis,
    positionCounts,
    hasGoalkeeper: positionCounts.GK > 0,
  }
}

/**
 * IMPROVEMENT 1: Position Depth Requirements
 * Ensures each team has enough players for each position
 */
const POSITION_REQUIREMENTS = {
  GK: { min: 1, ideal: 1 },
  DEF: { min: 2, ideal: 4 },
  MID: { min: 2, ideal: 5 },
  ATT: { min: 1, ideal: 3 },
} as const

function calculatePositionDepthPenalty(team: Player[]): number {
  const stats = calculateTeamStats(team)
  let penalty = 0

  Object.entries(POSITION_REQUIREMENTS).forEach(([pos, req]) => {
    const position = pos as PositionEnum
    const count = stats.positionCounts[position]

    if (count < req.min) {
      // Critical: Missing minimum position coverage
      penalty += (req.min - count) * 50
    } else if (count < req.ideal) {
      // Sub-optimal: Would benefit from more depth
      penalty += (req.ideal - count) * 2
    }
  })

  return penalty
}

/**
 * IMPROVEMENT 2: Strength Level Classification
 * Classifies players into Stars, Average, and Weak categories
 */
interface StrengthDistribution {
  stars: Player[]
  average: Player[]
  weak: Player[]
}

function classifyPlayersByStrength(players: Player[]): StrengthDistribution {
  if (players.length === 0) {
    return { stars: [], average: [], weak: [] }
  }

  const sorted = [...players].sort((a, b) => b.total - a.total)
  const third = Math.floor(sorted.length / 3)

  // If less than 3 players, all are "average"
  if (sorted.length < 3) {
    return { stars: [], average: sorted, weak: [] }
  }

  return {
    stars: sorted.slice(0, third || 1), // Top 33%
    average: sorted.slice(third, third * 2), // Middle 33%
    weak: sorted.slice(third * 2), // Bottom 33%
  }
}

function calculateStrengthLevelImbalance(
  teamA: Player[],
  teamB: Player[],
  allPlayers: Player[]
): number {
  // Classify all players first to get global thresholds
  const globalClassification = classifyPlayersByStrength(allPlayers)

  // Count how many stars/average/weak each team has
  const countInCategory = (team: Player[], category: Player[]) => {
    const categoryIds = new Set(category.map((p) => p.id))
    return team.filter((p) => categoryIds.has(p.id)).length
  }

  const teamAStars = countInCategory(teamA, globalClassification.stars)
  const teamBStars = countInCategory(teamB, globalClassification.stars)

  const teamAAverage = countInCategory(teamA, globalClassification.average)
  const teamBAverage = countInCategory(teamB, globalClassification.average)

  const teamAWeak = countInCategory(teamA, globalClassification.weak)
  const teamBWeak = countInCategory(teamB, globalClassification.weak)

  // Calculate imbalance for each category
  const starImbalance = Math.abs(teamAStars - teamBStars) * 3.0 // Stars are most important
  const avgImbalance = Math.abs(teamAAverage - teamBAverage) * 2.0
  const weakImbalance = Math.abs(teamAWeak - teamBWeak) * 1.0

  return starImbalance + avgImbalance + weakImbalance
}

/**
 * IMPROVEMENT 3: Position Preference
 * Assumes first position in array is the player's primary/best position
 */
function calculatePositionPreferencePenalty(team: Player[]): number {
  let penalty = 0

  team.forEach((player) => {
    if (!player.positions || player.positions.length === 0) {
      penalty += 5 // No position defined - penalty
      return
    }

    // Primary position is the first one in the array
    const primaryPosition = player.positions[0]
    const stats = calculateTeamStats(team)

    // Check if team has enough players for this position
    const posEnum = POSITION_MAP[primaryPosition]
    const count = stats.positionCounts[posEnum]

    // If this is the player's primary position but team has too many,
    // they might be playing out of position
    const requirements = POSITION_REQUIREMENTS[posEnum]
    if (count > requirements.ideal + 2) {
      // Team has too many players for this position
      // This player might be forced to play secondary position
      penalty += 3
    }
  })

  return penalty
}

/**
 * Calculate variance (imbalance) between two teams
 * Lower is better (0 = perfect balance)
 * UPDATED: Now includes position depth, strength levels, and position preference
 */
function calculateVariance(
  teamA: Player[],
  teamB: Player[],
  config: GeneratorConfig,
  allPlayers?: Player[] // Needed for strength level classification
): number {
  const statsA = calculateTeamStats(teamA)
  const statsB = calculateTeamStats(teamB)

  // Player count difference (heavily penalized)
  const playerCountDiff = Math.abs(statsA.playerCount - statsB.playerCount) * 10

  // Attribute differences (weighted)
  const technikDiff =
    Math.abs(statsA.avgTechnik - statsB.avgTechnik) * config.attributeWeight.technik
  const fitnessDiff =
    Math.abs(statsA.avgFitness - statsB.avgFitness) * config.attributeWeight.fitness
  const spielverstaendnisDiff =
    Math.abs(statsA.avgSpielverstaendnis - statsB.avgSpielverstaendnis) *
    config.attributeWeight.spielverstaendnis

  // Position imbalance (except GK which is handled separately)
  let positionImbalance = 0
  const positions: PositionEnum[] = ['DEF', 'MID', 'ATT']
  positions.forEach((pos) => {
    const diff = Math.abs(statsA.positionCounts[pos] - statsB.positionCounts[pos])
    positionImbalance += diff * config.positionWeight
  })

  // NEW: Position depth penalties (both teams)
  const depthPenaltyA = calculatePositionDepthPenalty(teamA)
  const depthPenaltyB = calculatePositionDepthPenalty(teamB)
  const totalDepthPenalty = (depthPenaltyA + depthPenaltyB) * config.positionDepthWeight

  // NEW: Strength level imbalance
  let strengthLevelPenalty = 0
  if (allPlayers && allPlayers.length > 0) {
    strengthLevelPenalty =
      calculateStrengthLevelImbalance(teamA, teamB, allPlayers) *
      config.strengthLevelWeight
  }

  // NEW: Position preference penalty (both teams)
  const prefPenaltyA = calculatePositionPreferencePenalty(teamA)
  const prefPenaltyB = calculatePositionPreferencePenalty(teamB)
  const totalPrefPenalty = (prefPenaltyA + prefPenaltyB) * config.positionPreferenceWeight

  // Total variance (sum of all differences and penalties)
  const totalVariance =
    playerCountDiff +
    technikDiff * 2.0 + // Weight technik higher
    fitnessDiff * 2.0 + // Weight fitness higher
    spielverstaendnisDiff * 2.0 + // Weight spielverstaendnis higher
    positionImbalance +
    totalDepthPenalty + // NEW: Position depth
    strengthLevelPenalty + // NEW: Strength level distribution
    totalPrefPenalty // NEW: Position preference

  return totalVariance
}

/**
 * Check if a swap maintains hard constraints
 */
function isValidSwap(
  teamA: Player[],
  teamB: Player[],
  playerA: Player,
  playerB: Player
): boolean {
  // Create hypothetical teams
  const newTeamA = teamA.filter((p) => p.id !== playerA.id).concat(playerB)
  const newTeamB = teamB.filter((p) => p.id !== playerB.id).concat(playerA)

  const statsA = calculateTeamStats(newTeamA)
  const statsB = calculateTeamStats(newTeamB)

  // Hard Constraint 1: Team size must be equal (+/- 1)
  const sizeDiff = Math.abs(statsA.playerCount - statsB.playerCount)
  if (sizeDiff > 1) return false

  // Hard Constraint 2: Both teams must have at least one goalkeeper
  if (!statsA.hasGoalkeeper || !statsB.hasGoalkeeper) return false

  // Hard Constraint 3: Each team must have coverage for DEF, MID, ATT
  // At least 1 player in each position (except can be 0 if no players available)
  const minCoverage = ['DEF', 'MID', 'ATT'].every((pos) => {
    const enumPos = pos as PositionEnum
    return statsA.positionCounts[enumPos] > 0 && statsB.positionCounts[enumPos] > 0
  })

  return minCoverage
}

/**
 * Phase 1: Distribute goalkeepers fairly
 */
function distributeGoalkeepers(players: Player[]): { teamA: Player[]; teamB: Player[] } {
  const goalkeepers = players.filter(
    (p) => p.positions && p.positions.includes('Torhüter')
  )
  const nonGoalkeepers = players.filter(
    (p) => !p.positions || !p.positions.includes('Torhüter')
  )

  const teamA: Player[] = []
  const teamB: Player[] = []

  if (goalkeepers.length === 0) {
    // No goalkeepers - just split players
    return { teamA: [], teamB: [] }
  }

  if (goalkeepers.length === 1) {
    // Only 1 goalkeeper - assign to Team A
    teamA.push(goalkeepers[0])
  } else if (goalkeepers.length === 2) {
    // Perfect - 1 per team
    teamA.push(goalkeepers[0])
    teamB.push(goalkeepers[1])
  } else {
    // More than 2 goalkeepers - distribute by strength
    const sortedGKs = [...goalkeepers].sort((a, b) => b.total - a.total)

    // Snake draft for goalkeepers
    sortedGKs.forEach((gk, index) => {
      if (index % 2 === 0) {
        teamA.push(gk)
      } else {
        teamB.push(gk)
      }
    })
  }

  return { teamA, teamB }
}

/**
 * Phase 2: Initial distribution of non-goalkeepers by position and strength
 */
function initialDistribution(
  nonGoalkeepers: Player[],
  teamA: Player[],
  teamB: Player[]
): { teamA: Player[]; teamB: Player[] } {
  // Sort by total strength (descending)
  const sorted = [...nonGoalkeepers].sort((a, b) => b.total - a.total)

  // Snake draft
  sorted.forEach((player, index) => {
    const round = Math.floor(index / 2)
    if (round % 2 === 0) {
      // Even round: Team A, then Team B
      if (index % 2 === 0) {
        teamA.push(player)
      } else {
        teamB.push(player)
      }
    } else {
      // Odd round: Team B, then Team A (snake)
      if (index % 2 === 0) {
        teamB.push(player)
      } else {
        teamA.push(player)
      }
    }
  })

  return { teamA, teamB }
}

/**
 * Phase 3: Optimize through swapping
 * Minimize variance across ALL attributes
 */
function optimizeThroughSwaps(
  teamA: Player[],
  teamB: Player[],
  config: GeneratorConfig,
  allPlayers: Player[]
): { teamA: Player[]; teamB: Player[] } {
  let currentTeamA = [...teamA]
  let currentTeamB = [...teamB]
  let currentVariance = calculateVariance(currentTeamA, currentTeamB, config, allPlayers)

  let iterations = 0
  let noImprovementCount = 0
  const maxNoImprovement = 50

  while (
    iterations < config.maxSwapIterations &&
    noImprovementCount < maxNoImprovement &&
    currentVariance > config.varianceThreshold
  ) {
    let improved = false

    // Try all possible swaps
    for (let i = 0; i < currentTeamA.length && !improved; i++) {
      for (let j = 0; j < currentTeamB.length && !improved; j++) {
        const playerA = currentTeamA[i]
        const playerB = currentTeamB[j]

        // Check if swap is valid (maintains hard constraints)
        if (!isValidSwap(currentTeamA, currentTeamB, playerA, playerB)) {
          continue
        }

        // Create hypothetical teams
        const newTeamA = currentTeamA
          .filter((p) => p.id !== playerA.id)
          .concat(playerB)
        const newTeamB = currentTeamB
          .filter((p) => p.id !== playerB.id)
          .concat(playerA)

        const newVariance = calculateVariance(newTeamA, newTeamB, config, allPlayers)

        // Accept swap if it improves balance
        if (newVariance < currentVariance - 0.01) {
          currentTeamA = newTeamA
          currentTeamB = newTeamB
          currentVariance = newVariance
          improved = true
          noImprovementCount = 0
        }
      }
    }

    iterations++
    if (!improved) {
      noImprovementCount++
    }
  }

  return { teamA: currentTeamA, teamB: currentTeamB }
}

/**
 * Main function: Generate balanced teams
 */
export function generateBalancedTeams(
  players: Player[],
  config: Partial<GeneratorConfig> = {}
): { teamA: BalancedTeam; teamB: BalancedTeam } {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  if (players.length < 2) {
    throw new Error('Need at least 2 players to generate teams')
  }

  // Phase 1: Distribute goalkeepers
  let { teamA, teamB } = distributeGoalkeepers(players)

  // Get non-goalkeepers
  const assignedIds = new Set([...teamA, ...teamB].map((p) => p.id))
  const nonGoalkeepers = players.filter((p) => !assignedIds.has(p.id))

  // Phase 2: Initial distribution
  const result = initialDistribution(nonGoalkeepers, teamA, teamB)
  teamA = result.teamA
  teamB = result.teamB

  // Phase 3: Optimize through swaps
  const optimized = optimizeThroughSwaps(teamA, teamB, finalConfig, players)

  return {
    teamA: {
      players: optimized.teamA,
      stats: calculateTeamStats(optimized.teamA),
    },
    teamB: {
      players: optimized.teamB,
      stats: calculateTeamStats(optimized.teamB),
    },
  }
}

/**
 * Generate Balance Score Card
 * Shows detailed comparison between teams
 */
export function generateBalanceScoreCard(
  teamA: BalancedTeam,
  teamB: BalancedTeam
): BalanceScoreCard {
  const statsA = teamA.stats
  const statsB = teamB.stats

  const playerCountDiff = Math.abs(statsA.playerCount - statsB.playerCount)
  const technikDiff = Math.abs(statsA.avgTechnik - statsB.avgTechnik)
  const fitnessDiff = Math.abs(statsA.avgFitness - statsB.avgFitness)
  const spielverstaendnisDiff = Math.abs(
    statsA.avgSpielverstaendnis - statsB.avgSpielverstaendnis
  )

  // Position imbalance
  let positionImbalance = 0
  const positions: PositionEnum[] = ['GK', 'DEF', 'MID', 'ATT']
  positions.forEach((pos) => {
    const diff = Math.abs(statsA.positionCounts[pos] - statsB.positionCounts[pos])
    positionImbalance += diff
  })

  // Total variance (weighted sum)
  const totalVariance =
    playerCountDiff * 10 +
    technikDiff * 2.0 +
    fitnessDiff * 2.0 +
    spielverstaendnisDiff * 2.0 +
    positionImbalance * 2.0

  // Perfect if all diffs are very small
  const isPerfect =
    playerCountDiff <= 1 &&
    technikDiff < 0.5 &&
    fitnessDiff < 0.5 &&
    spielverstaendnisDiff < 0.5 &&
    positionImbalance <= 2

  return {
    teamA: statsA,
    teamB: statsB,
    imbalance: {
      playerCountDiff,
      technikDiff,
      fitnessDiff,
      spielverstaendnisDiff,
      totalVariance,
      positionImbalance,
    },
    isPerfect,
    score: totalVariance,
  }
}

/**
 * Pretty-print the balance score card
 */
export function printBalanceScoreCard(scoreCard: BalanceScoreCard): string {
  const { teamA, teamB, imbalance, isPerfect, score } = scoreCard

  let output = '\n╔══════════════════════════════════════════════════════╗\n'
  output += '║          BALANCE SCORE CARD                          ║\n'
  output += '╠══════════════════════════════════════════════════════╣\n'
  output += `║  Status: ${isPerfect ? '✅ PERFECT' : '⚠️  ACCEPTABLE'}                                ║\n`
  output += `║  Score:  ${score.toFixed(2)} (lower is better)                   ║\n`
  output += '╠══════════════════════════════════════════════════════╣\n'
  output += '║  TEAM A                      TEAM B                  ║\n'
  output += '╠══════════════════════════════════════════════════════╣\n'
  output += `║  Players: ${teamA.playerCount.toString().padEnd(18)} Players: ${teamB.playerCount.toString().padEnd(10)}║\n`
  output += `║  Technik: ${teamA.avgTechnik.toFixed(2).padEnd(18)} Technik: ${teamB.avgTechnik.toFixed(2).padEnd(10)}║\n`
  output += `║  Fitness: ${teamA.avgFitness.toFixed(2).padEnd(18)} Fitness: ${teamB.avgFitness.toFixed(2).padEnd(10)}║\n`
  output += `║  Spielv.: ${teamA.avgSpielverstaendnis.toFixed(2).padEnd(18)} Spielv.: ${teamB.avgSpielverstaendnis.toFixed(2).padEnd(10)}║\n`
  output += '╠══════════════════════════════════════════════════════╣\n'
  output += '║  POSITIONS                                           ║\n'
  output += '╠══════════════════════════════════════════════════════╣\n'
  output += `║  GK:  ${teamA.positionCounts.GK.toString().padEnd(23)} GK:  ${teamB.positionCounts.GK.toString().padEnd(15)}║\n`
  output += `║  DEF: ${teamA.positionCounts.DEF.toString().padEnd(23)} DEF: ${teamB.positionCounts.DEF.toString().padEnd(15)}║\n`
  output += `║  MID: ${teamA.positionCounts.MID.toString().padEnd(23)} MID: ${teamB.positionCounts.MID.toString().padEnd(15)}║\n`
  output += `║  ATT: ${teamA.positionCounts.ATT.toString().padEnd(23)} ATT: ${teamB.positionCounts.ATT.toString().padEnd(15)}║\n`
  output += '╠══════════════════════════════════════════════════════╣\n'
  output += '║  IMBALANCE METRICS                                   ║\n'
  output += '╠══════════════════════════════════════════════════════╣\n'
  output += `║  Player Count Diff:     ${imbalance.playerCountDiff.toFixed(2).padStart(25)}║\n`
  output += `║  Technik Diff:          ${imbalance.technikDiff.toFixed(2).padStart(25)}║\n`
  output += `║  Fitness Diff:          ${imbalance.fitnessDiff.toFixed(2).padStart(25)}║\n`
  output += `║  Spielverst. Diff:      ${imbalance.spielverstaendnisDiff.toFixed(2).padStart(25)}║\n`
  output += `║  Position Imbalance:    ${imbalance.positionImbalance.toFixed(2).padStart(25)}║\n`
  output += '╚══════════════════════════════════════════════════════╝\n'

  return output
}
