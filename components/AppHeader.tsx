'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { Users, User, Shield, LogOut, Share2, FileText, Lock, Heart } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
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

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

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

            {/* User Menu */}
            <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-deep-petrol transition-smooth"
            >
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-deep-petrol dark:text-soft-mint">
                  {displayName || userEmail.split('@')[0]}
                </span>
                {isAdmin && (
                  <span className="text-xs text-neon-lime font-bold uppercase">Admin</span>
                )}
              </div>
              <div className="w-10 h-10 rounded-full bg-neon-lime/20 flex items-center justify-center">
                <User className="w-5 h-5 text-neon-lime" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                {/* Backdrop - excludes bottom navigation area (64px) */}
                <div
                  className="fixed top-0 left-0 right-0 z-40"
                  style={{ bottom: '64px' }}
                  onClick={() => setShowMenu(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-card-dark rounded-lg shadow-lg border border-mid-grey/20 z-50">
                  <div className="p-4 border-b border-mid-grey/20">
                    {displayName && (
                      <p className="text-sm font-bold text-deep-petrol dark:text-soft-mint">
                        {displayName}
                      </p>
                    )}
                    <p className={`text-sm ${displayName ? 'text-mid-grey' : 'font-medium text-deep-petrol dark:text-soft-mint'}`}>
                      {userEmail}
                    </p>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 rounded bg-neon-lime/20 text-neon-lime text-xs font-bold">
                        <Shield className="w-3 h-3" />
                        ADMIN
                      </span>
                    )}
                  </div>

                  <div className="p-2">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-deep-petrol transition-smooth"
                      >
                        <Shield className="w-5 h-5 text-digital-orange" />
                        <span className="text-sm font-medium text-deep-petrol dark:text-soft-mint">
                          Admin Dashboard
                        </span>
                      </Link>
                    )}

                    <Link
                      href="/squads"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-deep-petrol transition-smooth"
                    >
                      <Users className="w-5 h-5 text-mid-grey" />
                      <span className="text-sm font-medium text-deep-petrol dark:text-soft-mint">
                        Meine Teams
                      </span>
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-deep-petrol transition-smooth"
                    >
                      <User className="w-5 h-5 text-mid-grey" />
                      <span className="text-sm font-medium text-deep-petrol dark:text-soft-mint">
                        Profil
                      </span>
                    </Link>
                  </div>

                  <div className="p-2 border-t border-mid-grey/20">
                    <Link
                      href="/impressum"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-deep-petrol transition-smooth"
                    >
                      <FileText className="w-5 h-5 text-mid-grey" />
                      <span className="text-sm font-medium text-deep-petrol dark:text-soft-mint">
                        Impressum
                      </span>
                    </Link>

                    <Link
                      href="/datenschutz"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-deep-petrol transition-smooth"
                    >
                      <Lock className="w-5 h-5 text-mid-grey" />
                      <span className="text-sm font-medium text-deep-petrol dark:text-soft-mint">
                        Datenschutz
                      </span>
                    </Link>

                    <Link
                      href="/credits"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-deep-petrol transition-smooth"
                    >
                      <Heart className="w-5 h-5 text-mid-grey" />
                      <span className="text-sm font-medium text-deep-petrol dark:text-soft-mint">
                        Credits
                      </span>
                    </Link>
                  </div>

                  <div className="p-2 border-t border-mid-grey/20">
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-smooth text-red-600 dark:text-red-400"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="text-sm font-medium">Abmelden</span>
                    </button>
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
