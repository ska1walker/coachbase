import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helpText, type, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium mb-2 text-deep-petrol dark:text-soft-mint"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            // Base styles - Mobile First
            'flex w-full rounded-lg px-4 py-3',
            'text-base',
            'bg-white dark:bg-card-dark',
            'border-2 border-mid-grey/30',
            'text-deep-petrol dark:text-soft-mint',
            'placeholder:text-mid-grey',

            // Focus states
            'focus:outline-none focus:border-neon-lime focus:ring-2 focus:ring-neon-lime/20',

            // Transitions
            'transition-smooth',

            // Touch optimization
            'min-h-touch',

            // Disabled state
            'disabled:cursor-not-allowed disabled:opacity-50',

            // Error state
            error && 'border-digital-purple focus:border-digital-purple focus:ring-digital-purple/20',

            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-digital-purple">{error}</p>
        )}
        {!error && helpText && (
          <p className="mt-1 text-xs text-mid-grey">{helpText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
