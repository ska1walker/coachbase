'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface AuthGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login')
        return
      }

      if (requireAdmin) {
        const idTokenResult = await user.getIdTokenResult()
        if (idTokenResult.claims.role !== 'admin') {
          router.push('/squads')
          return
        }
      }

      setAuthorized(true)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router, requireAdmin])

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-mint dark:bg-deep-petrol flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-lime border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mid-grey">Lädt...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return <>{children}</>
}
