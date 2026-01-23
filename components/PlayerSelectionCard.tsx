'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Player } from '@/lib/types'

interface PlayerSelectionCardProps {
  player: Player
  selected: boolean
  onToggle: (playerId: string) => void
}

export function PlayerSelectionCard({
  player,
  selected,
  onToggle,
}: PlayerSelectionCardProps) {
  return (
    <div
      onClick={() => onToggle(player.id)}
      className={cn(
        // Base styles - Mobile First, entire card clickable
        'flex items-center gap-3 p-4 rounded-lg cursor-pointer',
        'transition-smooth touch-target',

        // Background & Border
        'bg-white dark:bg-card-dark',
        'border-2',

        // Default state
        'border-transparent',
        'shadow-card-light dark:shadow-none dark:border-mid-grey/20',

        // Selected state - Neon Lime border & subtle background
        selected && [
          'border-neon-lime',
          'bg-neon-lime/5',
          'shadow-card-hover',
        ],

        // Hover state (not on touch devices)
        '@media (hover: hover)',
        'hover:shadow-card-hover hover:scale-[1.02]',

        // Active state for touch feedback
        'active:scale-[0.98]'
      )}
    >
      {/* Avatar Placeholder */}
      <div className="flex-shrink-0">
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            'bg-mid-grey/10 dark:bg-mid-grey/20',
            'text-deep-petrol dark:text-soft-mint font-bold text-lg'
          )}
        >
          {player.name.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-base text-deep-petrol dark:text-soft-mint truncate">
          {player.name}
        </h3>
        <div className="text-sm text-mid-grey mt-0.5">
          <span>T: {player.technik}</span>
          <span className="mx-1">•</span>
          <span>F: {player.fitness}</span>
          <span className="mx-1">•</span>
          <span>S: {player.spielverstaendnis}</span>
        </div>
        <div className="text-xs font-medium text-mid-grey mt-1">
          Gesamt: {player.total}/30
        </div>
      </div>

      {/* Checkbox (Large & Clear) */}
      <div className="flex-shrink-0">
        <div
          className={cn(
            'w-7 h-7 rounded-md border-2 flex items-center justify-center',
            'transition-smooth',

            // Unselected state
            !selected && [
              'border-mid-grey/50',
              'bg-transparent',
            ],

            // Selected state - fills with neon-lime
            selected && [
              'border-neon-lime',
              'bg-neon-lime',
            ]
          )}
        >
          {selected && (
            <Check
              className="w-5 h-5 text-deep-petrol"
              strokeWidth={3}
            />
          )}
        </div>
      </div>
    </div>
  )
}
