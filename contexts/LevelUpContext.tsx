'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface LevelUpContextType {
  showConfetti: boolean
  newLevel: number | null
  triggerLevelUp: (level: number) => void
  reset: () => void
}

const LevelUpContext = createContext<LevelUpContextType | undefined>(undefined)

export function LevelUpProvider({ children }: { children: ReactNode }) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [newLevel, setNewLevel] = useState<number | null>(null)

  const triggerLevelUp = (level: number) => {
    // Edge case validation
    if (!Number.isInteger(level) || level < 1 || level > 100) {
      console.error('Invalid level:', level)
      return
    }
    setShowConfetti(true)
    setNewLevel(level)
  }

  const reset = () => {
    setShowConfetti(false)
    setNewLevel(null)
  }

  return (
    <LevelUpContext.Provider value={{ showConfetti, newLevel, triggerLevelUp, reset }}>
      {children}
    </LevelUpContext.Provider>
  )
}

export function useLevelUp() {
  const context = useContext(LevelUpContext)
  if (context === undefined) {
    throw new Error('useLevelUp must be used within a LevelUpProvider')
  }
  return context
}
