/**
 * Centralized Firestore collection names with environment prefixing
 *
 * This module provides type-safe collection names that automatically
 * switch between dev and production environments.
 */

import { getCollectionName } from './firebase'

/**
 * Main collection names
 * These are automatically prefixed with 'dev_' in development/preview
 */
export const COLLECTIONS = {
  // Top-level collections
  SQUADS: getCollectionName('squads'),
  PLAYERS: getCollectionName('players'),
  USERS: 'users', // Users are NOT prefixed (shared across environments)
  SQUAD_INVITES: getCollectionName('squadInvites'),

  // Subcollections (use with parent ID)
  MATCHES: 'matches', // Subcollection under squads/{id}/matches
} as const

/**
 * Get subcollection path for matches
 * @param squadId - Parent squad ID
 * @returns Full path to matches subcollection
 */
export const getMatchesPath = (squadId: string) => {
  return `${COLLECTIONS.SQUADS}/${squadId}/${COLLECTIONS.MATCHES}`
}
