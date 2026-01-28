'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X, Users, User, Shield, LogOut, FileText, Lock, Heart } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  displayName: string
  userEmail: string
  isAdmin: boolean
}

export function MobileMenu({ isOpen, onClose, displayName, userEmail, isAdmin }: MobileMenuProps) {
  const router = useRouter()

  // Close menu on escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      onClose()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleLinkClick = () => {
    onClose()
  }

  if (!isOpen) return null

  const menuContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Menu */}
      <div
        className="fixed top-0 right-0 bottom-0 w-[300px] max-w-[85vw] bg-white dark:bg-card-dark shadow-2xl z-[101] overflow-y-auto"
        style={{
          animation: 'slideInRight 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-card-dark border-b border-mid-grey/20 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-deep-petrol dark:text-soft-mint">
              Menü
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-deep-petrol transition-smooth"
            aria-label="Menü schließen"
          >
            <X className="w-6 h-6 text-deep-petrol dark:text-soft-mint" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-mid-grey/20 bg-soft-mint/30 dark:bg-deep-petrol/30">
          {displayName && (
            <p className="text-sm font-bold text-deep-petrol dark:text-soft-mint mb-1">
              {displayName}
            </p>
          )}
          <p className="text-sm text-mid-grey">
            {userEmail}
          </p>
          {isAdmin && (
            <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded bg-neon-lime/20 text-neon-lime text-xs font-bold">
              <Shield className="w-3 h-3" />
              ADMIN
            </span>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-2">
          {isAdmin && (
            <Link
              href="/admin"
              onClick={handleLinkClick}
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
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-deep-petrol transition-smooth"
          >
            <Users className="w-5 h-5 text-mid-grey" />
            <span className="text-sm font-medium text-deep-petrol dark:text-soft-mint">
              Meine Teams
            </span>
          </Link>

          <Link
            href="/profile"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-deep-petrol transition-smooth"
          >
            <User className="w-5 h-5 text-mid-grey" />
            <span className="text-sm font-medium text-deep-petrol dark:text-soft-mint">
              Profil
            </span>
          </Link>
        </nav>

        {/* Legal Links */}
        <div className="p-2 border-t border-mid-grey/20 mt-2">
          <Link
            href="/impressum"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-deep-petrol transition-smooth"
          >
            <FileText className="w-5 h-5 text-mid-grey" />
            <span className="text-sm font-medium text-deep-petrol dark:text-soft-mint">
              Impressum
            </span>
          </Link>

          <Link
            href="/datenschutz"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-deep-petrol transition-smooth"
          >
            <Lock className="w-5 h-5 text-mid-grey" />
            <span className="text-sm font-medium text-deep-petrol dark:text-soft-mint">
              Datenschutz
            </span>
          </Link>

          <Link
            href="/credits"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-deep-petrol transition-smooth"
          >
            <Heart className="w-5 h-5 text-mid-grey" />
            <span className="text-sm font-medium text-deep-petrol dark:text-soft-mint">
              Credits
            </span>
          </Link>
        </div>

        {/* Logout Button */}
        <div className="p-2 border-t border-mid-grey/20 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-smooth text-red-600 dark:text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Abmelden</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  )

  // Use portal to render outside of parent DOM hierarchy
  return typeof document !== 'undefined' ? createPortal(menuContent, document.body) : null
}
