'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, Minus, Activity, Zap, Target } from 'lucide-react'
import type { Player, PlayerSnapshot } from '@/lib/types'
import { calculateTrend } from '@/lib/player-dashboard-utils'

interface PlayerStatsCardsProps {
  player: Player
  snapshots: PlayerSnapshot[]
}

export function PlayerStatsCards({ player, snapshots }: PlayerStatsCardsProps) {
  const technikTrend = calculateTrend(snapshots, 'technik')
  const fitnessTrend = calculateTrend(snapshots, 'fitness')
  const spielverstaendnisTrend = calculateTrend(snapshots, 'spielverstaendnis')
  const totalTrend = calculateTrend(snapshots, 'total')

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-neon-lime" />
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-mid-grey" />
  }

  const stats = [
    {
      label: 'Technik',
      value: `${player.technik}/10`,
      icon: Zap,
      trend: technikTrend,
      bgColor: 'bg-neon-lime/10',
      iconColor: 'text-neon-lime',
    },
    {
      label: 'Fitness',
      value: `${player.fitness}/10`,
      icon: Activity,
      trend: fitnessTrend,
      bgColor: 'bg-digital-orange/10',
      iconColor: 'text-digital-orange',
    },
    {
      label: 'Spielverständnis',
      value: `${player.spielverstaendnis}/10`,
      icon: Target,
      trend: spielverstaendnisTrend,
      bgColor: 'bg-neon-lime/10',
      iconColor: 'text-neon-lime',
    },
    {
      label: 'Gesamtstärke',
      value: player.total.toString(),
      icon: TrendingUp,
      trend: totalTrend,
      bgColor: 'bg-digital-orange/10',
      iconColor: 'text-digital-orange',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} strokeWidth={2} />
                </div>
                <TrendIcon trend={stat.trend} />
              </div>
              <div className="mt-4">
                <p className="text-sm text-mid-grey font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-deep-petrol dark:text-soft-mint mt-1">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
