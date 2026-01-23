'use client'

import { useEffect, useState } from 'react'

interface ConfettiProps {
  active: boolean
  onComplete?: () => void
}

export function Confetti({ active, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    color: string
    size: number
    speedX: number
    speedY: number
    rotation: number
  }>>([])

  useEffect(() => {
    if (!active) {
      setParticles([])
      return
    }

    // SSR-safe: Check if window is available
    if (typeof window === 'undefined') return

    const colors = ['#C7F94C', '#0A2F2D', '#7B4FFF', '#FF6B9D', '#FFD60A']
    const particleCount = 100
    const screenWidth = window.innerWidth

    // Create particles
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * screenWidth,
      y: -20,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 5,
      speedX: (Math.random() - 0.5) * 4,
      speedY: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
    }))

    setParticles(newParticles)

    // Remove particles after animation
    const timer = setTimeout(() => {
      setParticles([])
      onComplete?.()
    }, 4000)

    return () => clearTimeout(timer)
  }, [active, onComplete])

  if (!active || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            animation: `confetti-fall 4s ease-in forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
    </div>
  )
}
