'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Users, History, User as UserIcon, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/squads',
      label: 'Teams',
      icon: Users,
    },
    {
      href: '/hall-of-fame',
      label: 'Rangliste',
      icon: Trophy,
    },
    {
      href: '/history',
      label: 'History',
      icon: History,
    },
    {
      href: '/profile',
      label: 'Profil',
      icon: UserIcon,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card-dark border-t border-mid-grey/20 safe-area-inset-bottom z-[60] backdrop-blur-sm bg-white/95 dark:bg-card-dark/95">
      <div className="flex items-center justify-around min-h-[64px] max-w-4xl mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center',
                'flex-1 h-full',
                'transition-smooth touch-target',

                isActive
                  ? 'text-neon-lime'
                  : 'text-mid-grey hover:text-deep-petrol dark:hover:text-soft-mint'
              )}
            >
              <Icon
                className={cn(
                  'w-6 h-6 mb-1',
                  isActive && 'stroke-[2.5px]'
                )}
              />
              <span
                className={cn(
                  'text-xs uppercase tracking-label',
                  isActive && 'font-bold'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
