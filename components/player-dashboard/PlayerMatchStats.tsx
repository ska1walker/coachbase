'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { CalendarCheck, Trophy, Clock } from 'lucide-react'
import type { PlayerMatchStats as MatchStatsType } from '@/lib/player-dashboard-utils'
import { formatRelativeTime } from '@/lib/player-dashboard-utils'

interface PlayerMatchStatsProps {
  stats: MatchStatsType
  loading?: boolean
}

export function PlayerMatchStats({ stats, loading }: PlayerMatchStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="w-12 h-12 bg-mid-grey/20 rounded-lg mb-4" />
                <div className="h-4 bg-mid-grey/20 rounded w-24 mb-2" />
                <div className="h-8 bg-mid-grey/20 rounded w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const hasMatches = stats.totalMatches > 0
  const hasResults = stats.matchesWithResults > 0

  const matchStats = [
    {
      label: 'Anwesenheit',
      value: hasMatches ? `${Math.round(stats.attendanceRate)}%` : '-',
      subValue: hasMatches ? `${stats.attendedMatches} von ${stats.totalMatches} Spielen` : 'Keine Spiele',
      icon: CalendarCheck,
      bgColor: 'bg-neon-lime/10',
      iconColor: 'text-neon-lime',
    },
    {
      label: 'Siegquote',
      value: hasResults ? `${Math.round(stats.winRate)}%` : '-',
      subValue: hasResults
        ? `${stats.wins}S ${stats.draws}U ${stats.losses}N`
        : 'Keine Ergebnisse',
      icon: Trophy,
      bgColor: 'bg-digital-orange/10',
      iconColor: 'text-digital-orange',
    },
    {
      label: 'Letzter Einsatz',
      value: formatRelativeTime(stats.lastMatchDate),
      subValue: stats.lastMatchDate
        ? stats.lastMatchDate.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })
        : '',
      icon: Clock,
      bgColor: 'bg-soft-mint/20 dark:bg-soft-mint/10',
      iconColor: 'text-deep-petrol dark:text-soft-mint',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {matchStats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} strokeWidth={2} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-mid-grey font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-deep-petrol dark:text-soft-mint mt-1">
                  {stat.value}
                </p>
                {stat.subValue && (
                  <p className="text-xs text-mid-grey mt-1">
                    {stat.subValue}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
