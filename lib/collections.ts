/**
 * Centralized Firestore collection names with environment prefixing
 *
 * This module provides type-safe collection names that automatically
 * switch between dev and production environments.
 */

import { getCollectionName } from './firebase'

/**
 * Main collection names with lazy evaluation
 * These are computed at runtime to ensure environment detection works correctly
 */
export const COLLECTIONS = {
  // Top-level collections - use getters for lazy evaluation
  get SQUADS() { return getCollectionName('squads') },
  get PLAYERS() { return getCollectionName('players') },
  USERS: 'users', // Users are NOT prefixed (shared across environments)
  get SQUAD_INVITES() { return getCollectionName('squadInvites') },

  // Subcollections (use with parent ID)
  MATCHES: 'matches', // Subcollection under squads/{id}/matches
}

/**
 * Get subcollection path for matches
 * @param squadId - Parent squad ID
 * @returns Full path to matches subcollection
 */
export const getMatchesPath = (squadId: string) => {
  return `${COLLECTIONS.SQUADS}/${squadId}/${COLLECTIONS.MATCHES}`
}
