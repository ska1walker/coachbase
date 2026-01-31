/**
 * Unit Tests for Team Generator
 * Tests the fix for duplicate player assignment bug in 3+ teams
 */

import { generateBalancedTeams, analyzeTeamBalance } from '@/lib/team-generator'
import type { Player } from '@/lib/types'

// Helper to create test players (moved to module scope)
const createPlayer = (id: string, total: number): Player => ({
  id,
  name: `Player ${id}`,
  total,
  technik: Math.floor(total / 3),
  fitness: Math.floor(total / 3),
  spielverstaendnis: Math.floor(total / 3),
  positions: ['Mittelfeld'],
  squadId: 'test-squad',
  createdAt: new Date(),
})

describe('Team Generator - Bug Fix: Duplicate Players', () => {
  describe('3 Teams - Even Number of Players', () => {
    test('should not create duplicate players with 12 players', () => {
      // Arrange
      const players: Player[] = Array.from({ length: 12 }, (_, i) =>
        createPlayer(`${i + 1}`, 30 - i)
      )

      // Act
      const teams = generateBalancedTeams(players, 3)

      // Assert: Collect all assigned player IDs
      const allAssignedPlayerIds = teams.flatMap(team =>
        team.players.map(p => p.id)
      )

      // 1. No duplicates
      const uniqueIds = new Set(allAssignedPlayerIds)
      expect(uniqueIds.size).toBe(allAssignedPlayerIds.length)

      // 2. All players assigned
      expect(allAssignedPlayerIds.length).toBe(players.length)

      // 3. Each player appears exactly once
      players.forEach(player => {
        const count = allAssignedPlayerIds.filter(id => id === player.id).length
        expect(count).toBe(1)
      })

      // 4. Team sizes are balanced (4, 4, 4)
      expect(teams[0].players.length).toBe(4)
      expect(teams[1].players.length).toBe(4)
      expect(teams[2].players.length).toBe(4)
    })

    test('should not lose any players during optimization', () => {
      // Arrange
      const players: Player[] = Array.from({ length: 12 }, (_, i) =>
        createPlayer(`${i + 1}`, 30 - i)
      )

      // Act
      const teams = generateBalancedTeams(players, 3)

      // Assert: Every player from input exists in output
      const assignedPlayerIds = new Set(
        teams.flatMap(team => team.players.map(p => p.id))
      )

      players.forEach(player => {
        expect(assignedPlayerIds.has(player.id)).toBe(true)
      })
    })
  })

  describe('3 Teams - Odd Number of Players', () => {
    test('should not create duplicate players with 11 players', () => {
      // Arrange
      const players: Player[] = Array.from({ length: 11 }, (_, i) =>
        createPlayer(`${i + 1}`, 30 - i)
      )

      // Act
      const teams = generateBalancedTeams(players, 3)

      // Assert
      const allAssignedPlayerIds = teams.flatMap(team =>
        team.players.map(p => p.id)
      )

      // 1. No duplicates
      const uniqueIds = new Set(allAssignedPlayerIds)
      expect(uniqueIds.size).toBe(11)

      // 2. All players assigned
      expect(allAssignedPlayerIds.length).toBe(11)

      // 3. Team sizes are balanced (4, 4, 3)
      const sizes = teams.map(t => t.players.length).sort()
      expect(sizes).toEqual([3, 4, 4])
    })

    test('should maintain correct team size parity with 13 players', () => {
      // Arrange
      const players: Player[] = Array.from({ length: 13 }, (_, i) =>
        createPlayer(`${i + 1}`, 30 - i)
      )

      // Act
      const teams = generateBalancedTeams(players, 3)

      // Assert
      const sizes = teams.map(t => t.players.length).sort()

      // With 13 players and 3 teams: 5, 4, 4 or 5, 5, 3
      const minSize = Math.min(...sizes)
      const maxSize = Math.max(...sizes)

      // Max difference should be 1
      expect(maxSize - minSize).toBeLessThanOrEqual(1)

      // Total should be 13
      expect(sizes.reduce((a, b) => a + b, 0)).toBe(13)

      // No duplicates
      const allIds = teams.flatMap(t => t.players.map(p => p.id))
      const uniqueIds = new Set(allIds)
      expect(uniqueIds.size).toBe(13)
    })
  })

  describe('4 Teams', () => {
    test('should handle 16 players with 4 teams (4-4-4-4)', () => {
      // Arrange
      const players: Player[] = Array.from({ length: 16 }, (_, i) =>
        createPlayer(`${i + 1}`, 30 - i)
      )

      // Act
      const teams = generateBalancedTeams(players, 4)

      // Assert
      const allAssignedPlayerIds = teams.flatMap(team =>
        team.players.map(p => p.id)
      )

      // No duplicates
      const uniqueIds = new Set(allAssignedPlayerIds)
      expect(uniqueIds.size).toBe(16)

      // All teams have 4 players
      teams.forEach(team => {
        expect(team.players.length).toBe(4)
      })
    })

    test('should handle 18 players with 4 teams (5-5-4-4)', () => {
      // Arrange
      const players: Player[] = Array.from({ length: 18 }, (_, i) =>
        createPlayer(`${i + 1}`, 30 - i)
      )

      // Act
      const teams = generateBalancedTeams(players, 4)

      // Assert
      const sizes = teams.map(t => t.players.length).sort()

      // Should be 4, 4, 5, 5
      expect(sizes).toEqual([4, 4, 5, 5])

      // No duplicates
      const allIds = teams.flatMap(t => t.players.map(p => p.id))
      const uniqueIds = new Set(allIds)
      expect(uniqueIds.size).toBe(18)
    })
  })

  describe('5 Teams', () => {
    test('should handle 20 players with 5 teams (4-4-4-4-4)', () => {
      // Arrange
      const players: Player[] = Array.from({ length: 20 }, (_, i) =>
        createPlayer(`${i + 1}`, 30 - i)
      )

      // Act
      const teams = generateBalancedTeams(players, 5)

      // Assert
      const allAssignedPlayerIds = teams.flatMap(team =>
        team.players.map(p => p.id)
      )

      // No duplicates
      const uniqueIds = new Set(allAssignedPlayerIds)
      expect(uniqueIds.size).toBe(20)

      // All teams have 4 players
      teams.forEach(team => {
        expect(team.players.length).toBe(4)
      })
    })
  })

  describe('Edge Cases', () => {
    test('should handle minimum case: 4 players, 2 teams', () => {
      // Arrange
      const players: Player[] = Array.from({ length: 4 }, (_, i) =>
        createPlayer(`${i + 1}`, 30 - i * 2)
      )

      // Act
      const teams = generateBalancedTeams(players, 2)

      // Assert
      const allIds = teams.flatMap(t => t.players.map(p => p.id))
      const uniqueIds = new Set(allIds)

      expect(uniqueIds.size).toBe(4)
      expect(teams[0].players.length).toBe(2)
      expect(teams[1].players.length).toBe(2)
    })

    test('should handle large case: 30 players, 3 teams', () => {
      // Arrange
      const players: Player[] = Array.from({ length: 30 }, (_, i) =>
        createPlayer(`${i + 1}`, 30 - i)
      )

      // Act
      const teams = generateBalancedTeams(players, 3)

      // Assert
      const allIds = teams.flatMap(t => t.players.map(p => p.id))
      const uniqueIds = new Set(allIds)

      // No duplicates
      expect(uniqueIds.size).toBe(30)

      // All teams have 10 players
      teams.forEach(team => {
        expect(team.players.length).toBe(10)
      })
    })
  })

  describe('Balance Quality', () => {
    test('should create reasonably balanced teams', () => {
      // Arrange
      const players: Player[] = Array.from({ length: 12 }, (_, i) =>
        createPlayer(`${i + 1}`, 30 - i)
      )

      // Act
      const teams = generateBalancedTeams(players, 3)
      const balance = analyzeTeamBalance(teams)

      // Assert
      // Player count should be exactly equal (12 / 3 = 4 each)
      expect(balance.playerCountDiff).toBe(0)

      // Total strength should be reasonably balanced
      // With our test data (30, 29, 28... 19), total = 294
      // Each team should have ~98 strength
      const totalStrengths = teams.map(t => t.totalStrength)
      const avgStrength = totalStrengths.reduce((a, b) => a + b, 0) / teams.length
      const maxDiff = Math.max(...totalStrengths) - Math.min(...totalStrengths)

      // Max difference should be reasonable (< 20% of average)
      expect(maxDiff).toBeLessThan(avgStrength * 0.2)
    })
  })

  describe('Regression: 2 Teams Should Still Work', () => {
    test('should not break 2-team generation', () => {
      // Arrange
      const players: Player[] = Array.from({ length: 10 }, (_, i) =>
        createPlayer(`${i + 1}`, 30 - i)
      )

      // Act
      const teams = generateBalancedTeams(players, 2)

      // Assert
      const allIds = teams.flatMap(t => t.players.map(p => p.id))
      const uniqueIds = new Set(allIds)

      expect(uniqueIds.size).toBe(10)
      expect(teams[0].players.length).toBe(5)
      expect(teams[1].players.length).toBe(5)
    })
  })
})

describe('Team Generator - Swap Optimization', () => {
  test('should perform swaps without creating duplicates', () => {
    // Arrange: Create players with varied strengths to trigger swaps
    const players: Player[] = [
      createPlayer('1', 30),
      createPlayer('2', 10),
      createPlayer('3', 28),
      createPlayer('4', 12),
      createPlayer('5', 26),
      createPlayer('6', 14),
      createPlayer('7', 24),
      createPlayer('8', 16),
      createPlayer('9', 22),
      createPlayer('10', 18),
      createPlayer('11', 20),
      createPlayer('12', 20),
    ]

    // Act
    const teams = generateBalancedTeams(players, 3)

    // Assert: After optimization, no duplicates
    const allIds = teams.flatMap(t => t.players.map(p => p.id))
    const uniqueIds = new Set(allIds)

    expect(uniqueIds.size).toBe(12)
    expect(allIds.length).toBe(12)

    // Each player should appear exactly once
    players.forEach(player => {
      const count = allIds.filter(id => id === player.id).length
      expect(count).toBe(1)
    })
  })
})
