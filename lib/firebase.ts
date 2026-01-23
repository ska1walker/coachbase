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
