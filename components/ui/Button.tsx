import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles - Mobile First, Touch-optimized
          'inline-flex items-center justify-center',
          'rounded-xl font-bold uppercase tracking-label',
          'whitespace-nowrap',
          'transition-all duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-neon-lime focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-[0.98]',

          // Touch target - minimum 44px height
          'min-h-touch',

          // Variant styles
          {
            // Primary - Neon Lime (knallt!) - border-2 transparent für gleiche Höhe wie Secondary
            'bg-neon-lime text-deep-petrol hover:bg-neon-lime/90 shadow-md hover:shadow-xl border-2 border-neon-lime':
              variant === 'primary',

            // Secondary - Outline
            'border-2 border-deep-petrol text-deep-petrol bg-transparent':
              variant === 'secondary' && props.disabled !== true,
            'dark:border-soft-mint dark:text-soft-mint':
              variant === 'secondary' && props.disabled !== true,
            'hover:bg-deep-petrol/10 hover:border-deep-petrol dark:hover:bg-soft-mint/10 dark:hover:border-soft-mint':
              variant === 'secondary' && props.disabled !== true,

            // Danger - for delete actions
            'bg-digital-purple text-white hover:bg-digital-purple/90 border-2 border-digital-purple':
              variant === 'danger',
          },

          // Size variants
          {
            'text-sm px-5 py-2.5': size === 'sm',
            'text-base px-8 py-3': size === 'md',
            'text-lg px-12 py-4': size === 'lg',
          },

          // Full width
          fullWidth && 'w-full',

          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
