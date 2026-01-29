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
 * Environment detection utility
 * Returns true if running in development/preview environment
 */
export const isDevelopment = (): boolean => {
  // Check if we're in development mode or Vercel Preview
  // Use typeof check to avoid SSR issues
  if (typeof window === 'undefined') {
    // Server-side: check NODE_ENV
    return process.env.NODE_ENV !== 'production'
  }

  // Client-side: check both NODE_ENV and VERCEL_ENV
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
  )
}

/**
 * Get environment-prefixed collection name
 *
 * @param baseName - Base collection name (e.g., 'squads', 'players')
 * @returns Prefixed collection name for dev/prod separation
 *
 * @example
 * // In development/preview:
 * getCollectionName('squads') // Returns 'dev_squads'
 *
 * // In production:
 * getCollectionName('squads') // Returns 'squads'
 */
export const getCollectionName = (baseName: string): string => {
  return isDevelopment() ? `dev_${baseName}` : baseName
}
