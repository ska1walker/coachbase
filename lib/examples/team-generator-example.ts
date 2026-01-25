/**
 * Example Usage: Advanced Team Generator
 *
 * This example demonstrates how to use the advanced team generator
 * with various scenarios.
 */

import type { Player } from '../types'
import {
  generateBalancedTeams,
  generateBalanceScoreCard,
  printBalanceScoreCard,
} from '../advanced-team-generator'

/**
 * Helper: Create test player
 */
function createPlayer(
  id: string,
  name: string,
  technik: number,
  fitness: number,
  spielverstaendnis: number,
  positions: ('Torhüter' | 'Abwehr' | 'Mittelfeld' | 'Angriff')[]
): Player {
  return {
    id,
    squadId: 'example-squad',
    name,
    technik,
    fitness,
    spielverstaendnis,
    total: technik + fitness + spielverstaendnis,
    positions,
    createdAt: new Date().toISOString(),
  }
}

/**
 * Example 1: Balanced 11 vs 11
 */
export function example1_BalancedTeams() {
  console.log('\n' + '='.repeat(60))
  console.log('EXAMPLE 1: Balanced 11 vs 11 Teams')
  console.log('='.repeat(60))

  const players: Player[] = [
    // Goalkeepers
    createPlayer('gk1', 'Manuel Neuer', 7, 6, 9, ['Torhüter']),
    createPlayer('gk2', 'Marc-André ter Stegen', 7, 7, 8, ['Torhüter']),

    // Defenders
    createPlayer('def1', 'Joshua Kimmich', 8, 8, 9, ['Abwehr', 'Mittelfeld']),
    createPlayer('def2', 'Antonio Rüdiger', 6, 9, 7, ['Abwehr']),
    createPlayer('def3', 'Niklas Süle', 6, 7, 7, ['Abwehr']),
    createPlayer('def4', 'Robin Gosens', 7, 8, 7, ['Abwehr', 'Mittelfeld']),
    createPlayer('def5', 'Matthias Ginter', 6, 7, 8, ['Abwehr']),
    createPlayer('def6', 'David Raum', 7, 9, 6, ['Abwehr']),

    // Midfielders
    createPlayer('mid1', 'İlkay Gündoğan', 9, 6, 9, ['Mittelfeld']),
    createPlayer('mid2', 'Leon Goretzka', 7, 9, 8, ['Mittelfeld']),
    createPlayer('mid3', 'Jamal Musiala', 9, 7, 8, ['Mittelfeld', 'Angriff']),
    createPlayer('mid4', 'Florian Wirtz', 8, 7, 8, ['Mittelfeld', 'Angriff']),
    createPlayer('mid5', 'Joshua Kimmich', 8, 8, 9, ['Mittelfeld']),
    createPlayer('mid6', 'Jonas Hofmann', 7, 7, 7, ['Mittelfeld']),

    // Attackers
    createPlayer('att1', 'Thomas Müller', 8, 7, 10, ['Angriff', 'Mittelfeld']),
    createPlayer('att2', 'Serge Gnabry', 8, 8, 7, ['Angriff']),
    createPlayer('att3', 'Leroy Sané', 9, 8, 7, ['Angriff']),
    createPlayer('att4', 'Kai Havertz', 8, 7, 8, ['Angriff', 'Mittelfeld']),
    createPlayer('att5', 'Timo Werner', 6, 9, 6, ['Angriff']),
    createPlayer('att6', 'Niclas Füllkrug', 7, 6, 7, ['Angriff']),
    createPlayer('att7', 'Kevin Volland', 7, 8, 7, ['Angriff']),
    createPlayer('att8', 'Marco Reus', 8, 6, 9, ['Angriff', 'Mittelfeld']),
  ]

  const result = generateBalancedTeams(players)
  const scoreCard = generateBalanceScoreCard(result.teamA, result.teamB)

  console.log('\nTeam A Players:')
  result.teamA.players.forEach((p) => {
    console.log(`  - ${p.name.padEnd(25)} (${p.positions?.join(', ') || 'Keine Position'})`)
  })

  console.log('\nTeam B Players:')
  result.teamB.players.forEach((p) => {
    console.log(`  - ${p.name.padEnd(25)} (${p.positions?.join(', ') || 'Keine Position'})`)
  })

  console.log(printBalanceScoreCard(scoreCard))
}

/**
 * Example 2: Outlier Player (Messi-like)
 */
export function example2_OutlierPlayer() {
  console.log('\n' + '='.repeat(60))
  console.log('EXAMPLE 2: Team with Outlier (Superstar)')
  console.log('='.repeat(60))

  const players: Player[] = [
    createPlayer('gk1', 'Goalkeeper 1', 7, 7, 7, ['Torhüter']),
    createPlayer('gk2', 'Goalkeeper 2', 7, 7, 7, ['Torhüter']),
    createPlayer('superstar', 'Lionel Messi', 10, 10, 10, ['Angriff', 'Mittelfeld']), // OUTLIER!
    createPlayer('def1', 'Defender 1', 5, 5, 5, ['Abwehr']),
    createPlayer('def2', 'Defender 2', 5, 5, 5, ['Abwehr']),
    createPlayer('mid1', 'Midfielder 1', 5, 5, 5, ['Mittelfeld']),
    createPlayer('mid2', 'Midfielder 2', 5, 5, 5, ['Mittelfeld']),
    createPlayer('att1', 'Attacker 1', 5, 5, 5, ['Angriff']),
    createPlayer('att2', 'Attacker 2', 5, 5, 5, ['Angriff']),
    createPlayer('att3', 'Attacker 3', 5, 5, 5, ['Angriff']),
  ]

  const result = generateBalancedTeams(players)
  const scoreCard = generateBalanceScoreCard(result.teamA, result.teamB)

  const messiTeam = result.teamA.players.find((p) => p.id === 'superstar')
    ? 'Team A'
    : 'Team B'

  console.log(`\n⭐ Messi is in: ${messiTeam}`)
  console.log(printBalanceScoreCard(scoreCard))
}

/**
 * Example 3: Odd Number of Players
 */
export function example3_OddPlayers() {
  console.log('\n' + '='.repeat(60))
  console.log('EXAMPLE 3: Odd Number of Players (7 total)')
  console.log('='.repeat(60))

  const players: Player[] = [
    createPlayer('gk1', 'GK', 7, 7, 7, ['Torhüter']),
    createPlayer('def1', 'Defender 1', 6, 6, 6, ['Abwehr']),
    createPlayer('def2', 'Defender 2', 6, 6, 6, ['Abwehr']),
    createPlayer('mid1', 'Midfielder 1', 5, 5, 5, ['Mittelfeld']),
    createPlayer('mid2', 'Midfielder 2', 5, 5, 5, ['Mittelfeld']),
    createPlayer('att1', 'Attacker 1', 7, 7, 7, ['Angriff']),
    createPlayer('att2', 'Attacker 2', 7, 7, 7, ['Angriff']),
  ]

  const result = generateBalancedTeams(players)
  const scoreCard = generateBalanceScoreCard(result.teamA, result.teamB)

  console.log(`\nTeam A: ${result.teamA.players.length} players`)
  console.log(`Team B: ${result.teamB.players.length} players`)
  console.log(`Difference: ${Math.abs(result.teamA.players.length - result.teamB.players.length)} (acceptable: ≤1)`)
  console.log(printBalanceScoreCard(scoreCard))
}

/**
 * Example 4: Players with Multiple Positions
 */
export function example4_VersatilePlayers() {
  console.log('\n' + '='.repeat(60))
  console.log('EXAMPLE 4: Versatile Players (Multiple Positions)')
  console.log('='.repeat(60))

  const players: Player[] = [
    createPlayer('gk1', 'GK 1', 7, 7, 7, ['Torhüter']),
    createPlayer('gk2', 'GK 2', 7, 7, 7, ['Torhüter']),
    createPlayer('versatile1', 'Joshua Kimmich', 8, 8, 9, [
      'Abwehr',
      'Mittelfeld',
    ]), // DEF+MID
    createPlayer('versatile2', 'Serge Gnabry', 8, 8, 7, [
      'Mittelfeld',
      'Angriff',
    ]), // MID+ATT
    createPlayer('versatile3', 'Thomas Müller', 8, 7, 10, [
      'Mittelfeld',
      'Angriff',
    ]), // MID+ATT
    createPlayer('def1', 'Pure Defender', 6, 7, 6, ['Abwehr']),
    createPlayer('mid1', 'Pure Midfielder', 6, 6, 7, ['Mittelfeld']),
    createPlayer('att1', 'Pure Attacker', 7, 8, 6, ['Angriff']),
  ]

  const result = generateBalancedTeams(players)
  const scoreCard = generateBalanceScoreCard(result.teamA, result.teamB)

  console.log('\nVersatile players distribution:')
  console.log('Team A:')
  result.teamA.players
    .filter((p) => p.positions && p.positions.length > 1)
    .forEach((p) => console.log(`  - ${p.name} (${p.positions?.join(', ') || 'Keine Position'})`))

  console.log('Team B:')
  result.teamB.players
    .filter((p) => p.positions && p.positions.length > 1)
    .forEach((p) => console.log(`  - ${p.name} (${p.positions?.join(', ') || 'Keine Position'})`))

  console.log(printBalanceScoreCard(scoreCard))
}

/**
 * Example 5: Custom Configuration
 */
export function example5_CustomConfig() {
  console.log('\n' + '='.repeat(60))
  console.log('EXAMPLE 5: Custom Configuration (High Iterations)')
  console.log('='.repeat(60))

  const players: Player[] = [
    createPlayer('gk1', 'GK 1', 7, 7, 7, ['Torhüter']),
    createPlayer('gk2', 'GK 2', 7, 7, 7, ['Torhüter']),
    createPlayer('p1', 'Player 1', 8, 4, 6, ['Abwehr']),
    createPlayer('p2', 'Player 2', 4, 8, 6, ['Abwehr']),
    createPlayer('p3', 'Player 3', 6, 6, 8, ['Mittelfeld']),
    createPlayer('p4', 'Player 4', 6, 6, 4, ['Mittelfeld']),
    createPlayer('p5', 'Player 5', 7, 5, 6, ['Angriff']),
    createPlayer('p6', 'Player 6', 5, 7, 6, ['Angriff']),
  ]

  // Default config (1000 iterations)
  const resultDefault = generateBalancedTeams(players)
  const scoreCardDefault = generateBalanceScoreCard(
    resultDefault.teamA,
    resultDefault.teamB
  )

  // Custom config (2000 iterations, stricter threshold)
  const resultCustom = generateBalancedTeams(players, {
    maxSwapIterations: 2000,
    varianceThreshold: 0.1, // Very strict!
    attributeWeight: {
      technik: 2.0, // Weight technik higher
      fitness: 2.0,
      spielverstaendnis: 2.0,
    },
  })
  const scoreCardCustom = generateBalanceScoreCard(
    resultCustom.teamA,
    resultCustom.teamB
  )

  console.log('\nDefault Configuration:')
  console.log(printBalanceScoreCard(scoreCardDefault))

  console.log('\nCustom Configuration (2000 iterations, strict):')
  console.log(printBalanceScoreCard(scoreCardCustom))

  console.log('\nImprovement:')
  console.log(
    `Score: ${scoreCardDefault.score.toFixed(2)} → ${scoreCardCustom.score.toFixed(2)} (${((scoreCardCustom.score / scoreCardDefault.score - 1) * 100).toFixed(1)}%)`
  )
}

/**
 * Run all examples
 */
export function runAllExamples() {
  example1_BalancedTeams()
  example2_OutlierPlayer()
  example3_OddPlayers()
  example4_VersatilePlayers()
  example5_CustomConfig()

  console.log('\n' + '='.repeat(60))
  console.log('ALL EXAMPLES COMPLETED')
  console.log('='.repeat(60))
}

// Run if executed directly
if (require.main === module) {
  runAllExamples()
}
