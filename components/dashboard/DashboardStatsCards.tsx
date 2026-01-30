'use client'

import { Users, TrendingUp, Activity, Target } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import type { Player } from '@/lib/types'

interface DashboardStatsCardsProps {
  players: Player[]
}

export function DashboardStatsCards({ players }: DashboardStatsCardsProps) {
  // Calculate total players
  const totalPlayers = players.length

  // Calculate average strength
  const averageStrength = totalPlayers > 0
    ? (players.reduce((sum, p) => sum + p.total, 0) / totalPlayers).toFixed(1)
    : '0.0'

  // Find most used positions
  const positionCounts: Record<string, number> = {}
  players.forEach(player => {
    player.positions.forEach(pos => {
      positionCounts[pos] = (positionCounts[pos] || 0) + 1
    })
  })
  const topPosition = Object.entries(positionCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || '-'

  // Placeholder for attendance rate (will implement later with match history)
  const attendanceRate = '-'

  const stats = [
    {
      label: 'Spieler',
      value: totalPlayers.toString(),
      icon: Users,
      bgColor: 'bg-neon-lime/10',
      iconColor: 'text-neon-lime'
    },
    {
      label: 'Ø Stärke',
      value: averageStrength,
      icon: TrendingUp,
      bgColor: 'bg-digital-orange/10',
      iconColor: 'text-digital-orange'
    },
    {
      label: 'Anwesenheit',
      value: attendanceRate,
      icon: Activity,
      bgColor: 'bg-neon-lime/10',
      iconColor: 'text-neon-lime'
    },
    {
      label: 'Top Position',
      value: topPosition,
      icon: Target,
      bgColor: 'bg-digital-orange/10',
      iconColor: 'text-digital-orange'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-mid-grey mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-deep-petrol dark:text-soft-mint">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
