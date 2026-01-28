'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { auth, db } from '@/lib/firebase'
import { Users, Share2, Menu } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { MobileMenu } from './MobileMenu'

export function AppHeader() {
  const [userEmail, setUserEmail] = useState<string>('')
  const [displayName, setDisplayName] = useState<string>('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser
      if (user) {
        setUserEmail(user.email || '')

        // Load display name from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setDisplayName(userData.displayName || '')
          }
        } catch (error) {
          console.error('Error loading user data:', error)
        }

        user.getIdTokenResult().then((idTokenResult) => {
          setIsAdmin(idTokenResult.claims.role === 'admin')
        })
      }
    }

    loadUserData()
  }, [])

  const handleShare = async () => {
    const shareData = {
      title: 'CoachBase - Faire Teams in Sekunden',
      text: '⚽ Ich nutze CoachBase für ausgeglichene Teams. Automatisch. Fair. Transparent.\n\n✨ 100% kostenlos - Probier es aus!',
      url: window.location.origin
    }

    try {
      if (navigator.share) {
        // Native share dialog on mobile/modern browsers
        await navigator.share(shareData)
      } else {
        // Fallback: Copy to clipboard
        const textToCopy = `${shareData.text}\n\n${shareData.url}`
        await navigator.clipboard.writeText(textToCopy)
        alert('Link kopiert! Teile ihn jetzt mit anderen Coaches.')
      }
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error)
      }
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-mid-grey/20 backdrop-blur-md bg-white/80 dark:bg-card-dark/80">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between min-h-[64px]">
            {/* Logo */}
            <Link href="/squads" className="flex items-center gap-2 hover:opacity-80 transition-smooth">
              <div className="w-8 h-8 rounded-lg bg-neon-lime flex items-center justify-center">
                <Users className="w-5 h-5 text-deep-petrol" />
              </div>
              <span className="text-xl font-headline font-bold text-deep-petrol dark:text-soft-mint">
                CoachBase
              </span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Share Button */}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-lime/10 hover:bg-neon-lime/20 transition-smooth border border-neon-lime/30"
                title="CoachBase empfehlen"
              >
                <Share2 className="w-4 h-4 text-neon-lime" strokeWidth={2} />
                <span className="hidden md:inline text-sm font-medium text-deep-petrol dark:text-soft-mint">
                  Teilen
                </span>
              </button>

              {/* Burger Menu Button */}
              <button
                onClick={() => setShowMenu(true)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-deep-petrol transition-smooth"
                aria-label="Menü öffnen"
              >
                <Menu className="w-6 h-6 text-deep-petrol dark:text-soft-mint" strokeWidth={2} />
                <span className="hidden md:inline text-sm font-medium text-deep-petrol dark:text-soft-mint">
                  Menü
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Portal */}
      <MobileMenu
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        displayName={displayName}
        userEmail={userEmail}
        isAdmin={isAdmin}
      />
    </>
  )
}
