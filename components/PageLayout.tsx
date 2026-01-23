import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl'
  noPadding?: boolean
}

/**
 * PageLayout - Global container component following 8-Point Grid System
 *
 * Spacing Scale (8px base):
 * - 4px (0.5) - Micro spacing
 * - 8px (1) - Small spacing
 * - 16px (2) - Medium spacing
 * - 24px (3) - Large spacing (default card padding)
 * - 32px (4) - X-Large spacing
 * - 48px (6) - 2X-Large spacing
 * - 64px (8) - Section spacing
 *
 * Usage:
 * <PageLayout>
 *   <h1>Your content</h1>
 * </PageLayout>
 */
export function PageLayout({
  children,
  className,
  maxWidth = '7xl',
  noPadding = false,
}: PageLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
  }

  return (
    <div
      className={cn(
        // Container
        'w-full mx-auto',
        maxWidthClasses[maxWidth],

        // Horizontal Padding (follows 8-point grid)
        !noPadding && [
          'px-4',      // Mobile: 16px
          'md:px-8',   // Tablet: 32px
          'lg:px-12',  // Desktop: 48px
        ],

        // Vertical Padding
        !noPadding && [
          'py-8',      // Mobile: 32px
          'md:py-12',  // Desktop: 48px
        ],

        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Section - Component for major content sections with proper vertical spacing
 */
interface SectionProps {
  children: ReactNode
  className?: string
  spacing?: 'small' | 'medium' | 'large'
}

export function Section({
  children,
  className,
  spacing = 'large',
}: SectionProps) {
  const spacingClasses = {
    small: 'mb-6',       // 24px
    medium: 'mb-8',      // 32px
    large: 'mb-12',      // 48px
  }

  return (
    <section className={cn(spacingClasses[spacing], className)}>
      {children}
    </section>
  )
}
