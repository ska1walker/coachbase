import * as React from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  disabled?: boolean
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  label,
  disabled = false,
}: StepperProps) {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step)
    onChange(newValue)
  }

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step)
    onChange(newValue)
  }

  const canDecrement = value > min && !disabled
  const canIncrement = value < max && !disabled

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 text-deep-petrol dark:text-soft-mint">
          {label}
        </label>
      )}

      <div className="flex items-center gap-4">
        {/* Decrement Button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={!canDecrement}
          className={cn(
            'flex items-center justify-center',
            'w-12 h-12 rounded-lg',
            'border-2 transition-smooth',
            'touch-target',

            // Enabled state
            canDecrement && [
              'border-deep-petrol dark:border-soft-mint',
              'text-deep-petrol dark:text-soft-mint',
              'hover:bg-deep-petrol/5 dark:hover:bg-soft-mint/5',
              'active:scale-95',
            ],

            // Disabled state
            !canDecrement && [
              'border-mid-grey/30',
              'text-mid-grey/50',
              'cursor-not-allowed',
            ]
          )}
        >
          <Minus className="w-5 h-5" strokeWidth={3} />
        </button>

        {/* Value Display */}
        <div className="flex-1 text-center">
          <div className="text-4xl font-bold text-deep-petrol dark:text-soft-mint font-headline">
            {value}
          </div>
          {max && (
            <div className="text-xs text-mid-grey uppercase tracking-label mt-1">
              Max: {max}
            </div>
          )}
        </div>

        {/* Increment Button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={!canIncrement}
          className={cn(
            'flex items-center justify-center',
            'w-12 h-12 rounded-lg',
            'border-2 transition-smooth',
            'touch-target',

            // Enabled state
            canIncrement && [
              'border-neon-lime bg-neon-lime',
              'text-deep-petrol',
              'hover:bg-neon-lime/90',
              'active:scale-95',
            ],

            // Disabled state
            !canIncrement && [
              'border-mid-grey/30 bg-mid-grey/10',
              'text-mid-grey/50',
              'cursor-not-allowed',
            ]
          )}
        >
          <Plus className="w-5 h-5" strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}
