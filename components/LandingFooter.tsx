'use client'

import Link from 'next/link'

export function LandingFooter() {
  return (
    <footer className="border-t border-mid-grey/20 bg-white/80 dark:bg-card-dark/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-mid-grey">
          <Link
            href="/impressum"
            className="hover:text-digital-orange transition-smooth"
          >
            Impressum
          </Link>
          <span className="hidden sm:inline">|</span>
          <Link
            href="/datenschutz"
            className="hover:text-digital-orange transition-smooth"
          >
            Datenschutz
          </Link>
          <span className="hidden sm:inline">|</span>
          <Link
            href="/credits"
            className="hover:text-digital-orange transition-smooth"
          >
            Credits
          </Link>
        </div>
        <div className="text-center text-xs text-mid-grey mt-4">
          © {new Date().getFullYear()} CoachBase - Made with ❤️ for Mats & Niclas
        </div>
      </div>
    </footer>
  )
}
