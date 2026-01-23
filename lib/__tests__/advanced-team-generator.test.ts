/**
 * Unit Tests for Advanced Team Generator
 *
 * Test Scenarios:
 * 1. Odd number of players
 * 2. Player with very high values (outlier)
 * 3. Players with multiple positions
 * 4. Only one goalkeeper
 * 5. No goalkeepers
 * 6. Perfect balance scenario
 * 7. Edge cases
 */

import { describe, it, expect } from '@jest/globals'
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
    squadId: 'test-squad',
    name,
    technik,
    fitness,
    spielverstaendnis,
    total: technik + fitness + spielverstaendnis,
    positions,
    createdAt: new Date().toISOString(),
  }
}

describe('Advanced Team Generator', () => {
  describe('Basic Functionality', () => {
    it('should generate two teams from a list of players', () => {
      const players: Player[] = [
        createPlayer('1', 'Player 1', 7, 7, 7, ['Torhüter']),
        createPlayer('2', 'Player 2', 6, 6, 6, ['Torhüter']),
        createPlayer('3', 'Player 3', 5, 5, 5, ['Abwehr']),
        createPlayer('4', 'Player 4', 5, 5, 5, ['Abwehr']),
        createPlayer('5', 'Player 5', 5, 5, 5, ['Mittelfeld']),
        createPlayer('6', 'Player 6', 5, 5, 5, ['Mittelfeld']),
        createPlayer('7', 'Player 7', 5, 5, 5, ['Angriff']),
        createPlayer('8', 'Player 8', 5, 5, 5, ['Angriff']),
      ]

      const result = generateBalancedTeams(players)

      expect(result.teamA.players).toHaveLength(4)
      expect(result.teamB.players).toHaveLength(4)
      expect(result.teamA.stats.hasGoalkeeper).toBe(true)
      expect(result.teamB.stats.hasGoalkeeper).toBe(true)
    })

    it('should throw error with less than 2 players', () => {
      const players: Player[] = [createPlayer('1', 'Player 1', 5, 5, 5, ['Abwehr'])]

      expect(() => generateBalancedTeams(players)).toThrow(
        'Need at least 2 players to generate teams'
      )
    })
  })

  describe('Scenario 1: Odd Number of Players', () => {
    it('should handle 11 players (5 vs 6)', () => {
      const players: Player[] = [
        createPlayer('1', 'GK1', 7, 7, 7, ['Torhüter']),
        createPlayer('2', 'GK2', 7, 7, 7, ['Torhüter']),
        createPlayer('3', 'DEF1', 6, 6, 6, ['Abwehr']),
        createPlayer('4', 'DEF2', 6, 6, 6, ['Abwehr']),
        createPlayer('5', 'DEF3', 6, 6, 6, ['Abwehr']),
        createPlayer('6', 'MID1', 5, 5, 5, ['Mittelfeld']),
        createPlayer('7', 'MID2', 5, 5, 5, ['Mittelfeld']),
        createPlayer('8', 'MID3', 5, 5, 5, ['Mittelfeld']),
        createPlayer('9', 'ATT1', 7, 7, 7, ['Angriff']),
        createPlayer('10', 'ATT2', 7, 7, 7, ['Angriff']),
        createPlayer('11', 'ATT3', 7, 7, 7, ['Angriff']),
      ]

      const result = generateBalancedTeams(players)
      const scoreCard = generateBalanceScoreCard(result.teamA, result.teamB)

      // Team size: 5 vs 6 (difference = 1, acceptable)
      expect(Math.abs(result.teamA.players.length - result.teamB.players.length)).toBeLessThanOrEqual(
        1
      )

      // Both teams must have goalkeeper
      expect(result.teamA.stats.hasGoalkeeper).toBe(true)
      expect(result.teamB.stats.hasGoalkeeper).toBe(true)

      // Check balance
      expect(scoreCard.imbalance.playerCountDiff).toBeLessThanOrEqual(1)

      console.log('Scenario 1 (Odd Players):')
      console.log(printBalanceScoreCard(scoreCard))
    })
  })

  describe('Scenario 2: Player with Very High Values (Outlier)', () => {
    it('should balance teams despite outlier', () => {
      const players: Player[] = [
        createPlayer('1', 'GK1', 7, 7, 7, ['Torhüter']),
        createPlayer('2', 'GK2', 7, 7, 7, ['Torhüter']),
        createPlayer('superstar', 'Messi', 10, 10, 10, ['Angriff', 'Mittelfeld']), // Outlier!
        createPlayer('4', 'DEF1', 5, 5, 5, ['Abwehr']),
        createPlayer('5', 'DEF2', 5, 5, 5, ['Abwehr']),
        createPlayer('6', 'MID1', 5, 5, 5, ['Mittelfeld']),
        createPlayer('7', 'MID2', 5, 5, 5, ['Mittelfeld']),
        createPlayer('8', 'ATT1', 5, 5, 5, ['Angriff']),
      ]

      const result = generateBalancedTeams(players)
      const scoreCard = generateBalanceScoreCard(result.teamA, result.teamB)

      // Check that outlier is balanced by other players
      // The team with Messi should have lower average on other players
      const messiTeam = result.teamA.players.find((p) => p.id === 'superstar')
        ? result.teamA
        : result.teamB

      expect(messiTeam.players).toContainEqual(
        expect.objectContaining({ id: 'superstar' })
      )

      // Despite outlier, average should be reasonably balanced
      expect(scoreCard.imbalance.technikDiff).toBeLessThan(2.0)
      expect(scoreCard.imbalance.fitnessDiff).toBeLessThan(2.0)
      expect(scoreCard.imbalance.spielverstaendnisDiff).toBeLessThan(2.0)

      console.log('Scenario 2 (Outlier):')
      console.log(printBalanceScoreCard(scoreCard))
    })
  })

  describe('Scenario 3: Players with Multiple Positions', () => {
    it('should handle players with dual positions', () => {
      const players: Player[] = [
        createPlayer('1', 'GK1', 7, 7, 7, ['Torhüter']),
        createPlayer('2', 'GK2', 7, 7, 7, ['Torhüter']),
        createPlayer('3', 'Versatile1', 6, 6, 6, ['Abwehr', 'Mittelfeld']), // Dual
        createPlayer('4', 'Versatile2', 6, 6, 6, ['Mittelfeld', 'Angriff']), // Dual
        createPlayer('5', 'DEF1', 5, 5, 5, ['Abwehr']),
        createPlayer('6', 'MID1', 5, 5, 5, ['Mittelfeld']),
        createPlayer('7', 'ATT1', 5, 5, 5, ['Angriff']),
        createPlayer('8', 'ATT2', 5, 5, 5, ['Angriff']),
      ]

      const result = generateBalancedTeams(players)
      const scoreCard = generateBalanceScoreCard(result.teamA, result.teamB)

      // Both teams must have position coverage
      expect(result.teamA.stats.positionCounts.DEF).toBeGreaterThan(0)
      expect(result.teamA.stats.positionCounts.MID).toBeGreaterThan(0)
      expect(result.teamA.stats.positionCounts.ATT).toBeGreaterThan(0)

      expect(result.teamB.stats.positionCounts.DEF).toBeGreaterThan(0)
      expect(result.teamB.stats.positionCounts.MID).toBeGreaterThan(0)
      expect(result.teamB.stats.positionCounts.ATT).toBeGreaterThan(0)

      console.log('Scenario 3 (Dual Positions):')
      console.log(printBalanceScoreCard(scoreCard))
    })
  })

  describe('Scenario 4: Only One Goalkeeper', () => {
    it('should assign single goalkeeper to one team', () => {
      const players: Player[] = [
        createPlayer('1', 'GK1', 7, 7, 7, ['Torhüter']), // Only 1 GK!
        createPlayer('2', 'DEF1', 6, 6, 6, ['Abwehr']),
        createPlayer('3', 'DEF2', 6, 6, 6, ['Abwehr']),
        createPlayer('4', 'MID1', 5, 5, 5, ['Mittelfeld']),
        createPlayer('5', 'MID2', 5, 5, 5, ['Mittelfeld']),
        createPlayer('6', 'ATT1', 5, 5, 5, ['Angriff']),
      ]

      const result = generateBalancedTeams(players)

      // One team has GK, other doesn't
      const teamWithGK = result.teamA.stats.hasGoalkeeper ? result.teamA : result.teamB
      const teamWithoutGK = result.teamA.stats.hasGoalkeeper ? result.teamB : result.teamA

      expect(teamWithGK.stats.hasGoalkeeper).toBe(true)
      expect(teamWithGK.stats.positionCounts.GK).toBe(1)

      // Algorithm should still balance other attributes
      const scoreCard = generateBalanceScoreCard(result.teamA, result.teamB)
      console.log('Scenario 4 (Single GK):')
      console.log(printBalanceScoreCard(scoreCard))
    })
  })

  describe('Scenario 5: No Goalkeepers', () => {
    it('should generate balanced teams without goalkeepers', () => {
      const players: Player[] = [
        createPlayer('1', 'DEF1', 6, 6, 6, ['Abwehr']),
        createPlayer('2', 'DEF2', 6, 6, 6, ['Abwehr']),
        createPlayer('3', 'MID1', 5, 5, 5, ['Mittelfeld']),
        createPlayer('4', 'MID2', 5, 5, 5, ['Mittelfeld']),
        createPlayer('5', 'ATT1', 7, 7, 7, ['Angriff']),
        createPlayer('6', 'ATT2', 7, 7, 7, ['Angriff']),
      ]

      const result = generateBalancedTeams(players)
      const scoreCard = generateBalanceScoreCard(result.teamA, result.teamB)

      // Both teams should have no goalkeeper
      expect(result.teamA.stats.hasGoalkeeper).toBe(false)
      expect(result.teamB.stats.hasGoalkeeper).toBe(false)

      // Teams should still be balanced
      expect(result.teamA.players).toHaveLength(3)
      expect(result.teamB.players).toHaveLength(3)

      console.log('Scenario 5 (No GK):')
      console.log(printBalanceScoreCard(scoreCard))
    })
  })

  describe('Scenario 6: Perfect Balance', () => {
    it('should achieve near-perfect balance with identical players', () => {
      const players: Player[] = [
        createPlayer('1', 'GK1', 7, 7, 7, ['Torhüter']),
        createPlayer('2', 'GK2', 7, 7, 7, ['Torhüter']),
        createPlayer('3', 'DEF1', 5, 5, 5, ['Abwehr']),
        createPlayer('4', 'DEF2', 5, 5, 5, ['Abwehr']),
        createPlayer('5', 'MID1', 5, 5, 5, ['Mittelfeld']),
        createPlayer('6', 'MID2', 5, 5, 5, ['Mittelfeld']),
        createPlayer('7', 'ATT1', 5, 5, 5, ['Angriff']),
        createPlayer('8', 'ATT2', 5, 5, 5, ['Angriff']),
      ]

      const result = generateBalancedTeams(players)
      const scoreCard = generateBalanceScoreCard(result.teamA, result.teamB)

      // Should be PERFECT
      expect(scoreCard.isPerfect).toBe(true)

      // All attributes should be identical
      expect(scoreCard.imbalance.technikDiff).toBeLessThan(0.1)
      expect(scoreCard.imbalance.fitnessDiff).toBeLessThan(0.1)
      expect(scoreCard.imbalance.spielverstaendnisDiff).toBeLessThan(0.1)

      console.log('Scenario 6 (Perfect Balance):')
      console.log(printBalanceScoreCard(scoreCard))
    })
  })

  describe('Edge Cases', () => {
    it('should handle 2 players (minimum)', () => {
      const players: Player[] = [
        createPlayer('1', 'Player1', 7, 7, 7, ['Torhüter']),
        createPlayer('2', 'Player2', 5, 5, 5, ['Angriff']),
      ]

      const result = generateBalancedTeams(players)

      expect(result.teamA.players).toHaveLength(1)
      expect(result.teamB.players).toHaveLength(1)
    })

    it('should handle large teams (22 players)', () => {
      const players: Player[] = []

      // 2 Goalkeepers
      players.push(createPlayer('gk1', 'GK1', 7, 7, 7, ['Torhüter']))
      players.push(createPlayer('gk2', 'GK2', 7, 7, 7, ['Torhüter']))

      // 20 field players with varying attributes
      for (let i = 1; i <= 20; i++) {
        const positions: ('Abwehr' | 'Mittelfeld' | 'Angriff')[] =
          i <= 7 ? ['Abwehr'] : i <= 14 ? ['Mittelfeld'] : ['Angriff']

        players.push(
          createPlayer(
            `player${i}`,
            `Player ${i}`,
            Math.floor(Math.random() * 5) + 3, // 3-8
            Math.floor(Math.random() * 5) + 3,
            Math.floor(Math.random() * 5) + 3,
            positions
          )
        )
      }

      const result = generateBalancedTeams(players)
      const scoreCard = generateBalanceScoreCard(result.teamA, result.teamB)

      expect(result.teamA.players).toHaveLength(11)
      expect(result.teamB.players).toHaveLength(11)

      expect(result.teamA.stats.hasGoalkeeper).toBe(true)
      expect(result.teamB.stats.hasGoalkeeper).toBe(true)

      console.log('Edge Case (22 Players):')
      console.log(printBalanceScoreCard(scoreCard))
    })

    it('should handle all players with same position', () => {
      const players: Player[] = [
        createPlayer('1', 'GK1', 7, 7, 7, ['Torhüter']),
        createPlayer('2', 'GK2', 6, 6, 6, ['Torhüter']),
        createPlayer('3', 'Striker1', 8, 8, 8, ['Angriff']),
        createPlayer('4', 'Striker2', 7, 7, 7, ['Angriff']),
        createPlayer('5', 'Striker3', 6, 6, 6, ['Angriff']),
        createPlayer('6', 'Striker4', 5, 5, 5, ['Angriff']),
      ]

      const result = generateBalancedTeams(players)
      const scoreCard = generateBalanceScoreCard(result.teamA, result.teamB)

      // Should still balance despite position imbalance
      expect(result.teamA.players).toHaveLength(3)
      expect(result.teamB.players).toHaveLength(3)

      console.log('Edge Case (All Strikers):')
      console.log(printBalanceScoreCard(scoreCard))
    })
  })

  describe('Balance Score Card', () => {
    it('should generate readable score card', () => {
      const players: Player[] = [
        createPlayer('1', 'GK1', 7, 7, 7, ['Torhüter']),
        createPlayer('2', 'GK2', 7, 7, 7, ['Torhüter']),
        createPlayer('3', 'DEF1', 6, 6, 6, ['Abwehr']),
        createPlayer('4', 'DEF2', 5, 5, 5, ['Abwehr']),
        createPlayer('5', 'MID1', 6, 6, 6, ['Mittelfeld']),
        createPlayer('6', 'MID2', 5, 5, 5, ['Mittelfeld']),
        createPlayer('7', 'ATT1', 7, 7, 7, ['Angriff']),
        createPlayer('8', 'ATT2', 5, 5, 5, ['Angriff']),
      ]

      const result = generateBalancedTeams(players)
      const scoreCard = generateBalanceScoreCard(result.teamA, result.teamB)
      const printedCard = printBalanceScoreCard(scoreCard)

      expect(printedCard).toContain('BALANCE SCORE CARD')
      expect(printedCard).toContain('TEAM A')
      expect(printedCard).toContain('TEAM B')
      expect(printedCard).toContain('IMBALANCE METRICS')
      expect(scoreCard.score).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Custom Configuration', () => {
    it('should accept custom config for swap iterations', () => {
      const players: Player[] = [
        createPlayer('1', 'GK1', 7, 7, 7, ['Torhüter']),
        createPlayer('2', 'GK2', 7, 7, 7, ['Torhüter']),
        createPlayer('3', 'Player3', 8, 4, 6, ['Abwehr']),
        createPlayer('4', 'Player4', 4, 8, 6, ['Abwehr']),
        createPlayer('5', 'Player5', 6, 6, 8, ['Mittelfeld']),
        createPlayer('6', 'Player6', 6, 6, 4, ['Mittelfeld']),
        createPlayer('7', 'Player7', 7, 5, 6, ['Angriff']),
        createPlayer('8', 'Player8', 5, 7, 6, ['Angriff']),
      ]

      // Test with limited iterations
      const resultLimited = generateBalancedTeams(players, {
        maxSwapIterations: 10,
      })

      // Test with many iterations
      const resultExtended = generateBalancedTeams(players, {
        maxSwapIterations: 500,
      })

      const scoreCardLimited = generateBalanceScoreCard(
        resultLimited.teamA,
        resultLimited.teamB
      )
      const scoreCardExtended = generateBalanceScoreCard(
        resultExtended.teamA,
        resultExtended.teamB
      )

      // Extended iterations should produce equal or better balance
      expect(scoreCardExtended.score).toBeLessThanOrEqual(scoreCardLimited.score * 1.1)

      console.log('Limited Iterations (10):')
      console.log(printBalanceScoreCard(scoreCardLimited))
      console.log('Extended Iterations (500):')
      console.log(printBalanceScoreCard(scoreCardExtended))
    })
  })
})
