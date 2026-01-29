import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBz8JOGYTTzlANtuRdXDy81jPHxn1ESLcE",
  authDomain: "teamsport-46873.firebaseapp.com",
  projectId: "teamsport-46873",
  storageBucket: "teamsport-46873.firebasestorage.app",
  messagingSenderId: "124398404726",
  appId: "1:124398404726:web:ad1192146f07341f7cb57"
}

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export { app }

/**
 * Environment prefix for Firestore collections
 * Set at build time by Vercel environment variable
 *
 * - Production: '' (no prefix)
 * - Preview: 'dev_'
 * - Development: 'dev_'
 */
const ENV_PREFIX = process.env.NEXT_PUBLIC_FIRESTORE_PREFIX || ''

/**
 * Get environment-prefixed collection name
 *
 * @param baseName - Base collection name (e.g., 'squads', 'players')
 * @returns Prefixed collection name for dev/prod separation
 *
 * @example
 * // In development/preview (NEXT_PUBLIC_FIRESTORE_PREFIX='dev_'):
 * getCollectionName('squads') // Returns 'dev_squads'
 *
 * // In production (NEXT_PUBLIC_FIRESTORE_PREFIX=''):
 * getCollectionName('squads') // Returns 'squads'
 */
export const getCollectionName = (baseName: string): string => {
  return `${ENV_PREFIX}${baseName}`
}
