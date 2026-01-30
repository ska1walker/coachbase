'use client'

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Target } from 'lucide-react'
import type { Player } from '@/lib/types'

interface PositionBalanceChartProps {
  players: Player[]
}

export function PositionBalanceChart({ players }: PositionBalanceChartProps) {
  // Count players per position (only primary position - first in array)
  const positionCounts: Record<string, number> = {
    'Torhüter': 0,
    'Abwehr': 0,
    'Mittelfeld': 0,
    'Angriff': 0,
  }

  players.forEach(player => {
    if (player.positions && player.positions.length > 0) {
      const primaryPosition = player.positions[0]
      if (primaryPosition in positionCounts) {
        positionCounts[primaryPosition]++
      }
    }
  })

  // Transform to chart data
  const chartData = [
    { position: 'Torhüter', count: positionCounts['Torhüter'], fullMark: 10 },
    { position: 'Abwehr', count: positionCounts['Abwehr'], fullMark: 10 },
    { position: 'Mittelfeld', count: positionCounts['Mittelfeld'], fullMark: 10 },
    { position: 'Angriff', count: positionCounts['Angriff'], fullMark: 10 },
  ]

  // Calculate balance score (0-100)
  const totalPlayers = players.length
  const idealDistribution = totalPlayers / 4 // Ideal: equally distributed
  const deviations = Object.values(positionCounts).map(count =>
    Math.abs(count - idealDistribution)
  )
  const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / 4
  const balanceScore = totalPlayers > 0
    ? Math.max(0, Math.round(100 - (avgDeviation / idealDistribution) * 100))
    : 0

  // Empty state
  if (totalPlayers === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-digital-orange" />
            Positions-Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-mid-grey">
            <p className="text-center">
              Noch keine Spieler mit Positionen.<br />
              Füge Spieler hinzu und weise Positionen zu!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-digital-orange" />
            Positions-Balance
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-mid-grey">Balance-Score:</span>
            <span className={`text-lg font-bold ${
              balanceScore >= 80 ? 'text-neon-lime' :
              balanceScore >= 60 ? 'text-digital-orange' :
              'text-red-500'
            }`}>
              {balanceScore}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="#374151" strokeOpacity={0.3} />
            <PolarAngleAxis
              dataKey="position"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
            />
            <Radar
              name="Spieler"
              dataKey="count"
              stroke="#C7FF5C"
              fill="#C7FF5C"
              fillOpacity={0.6}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Position breakdown */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {chartData.map(({ position, count }) => (
            <div
              key={position}
              className="p-3 rounded-lg bg-soft-mint/50 dark:bg-card-dark border border-mid-grey/20"
            >
              <p className="text-xs text-mid-grey mb-1">{position}</p>
              <p className="text-2xl font-bold text-deep-petrol dark:text-soft-mint">
                {count}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-mid-grey text-center">
          Zeigt die Verteilung der Hauptpositionen (erste Position jedes Spielers)
        </div>
      </CardContent>
    </Card>
  )
}
