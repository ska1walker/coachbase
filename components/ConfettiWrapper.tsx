'use client'

import { Confetti } from './Confetti'
import { useLevelUp } from '@/contexts/LevelUpContext'

export function ConfettiWrapper() {
  const { showConfetti, reset } = useLevelUp()

  return <Confetti active={showConfetti} onComplete={reset} />
}
