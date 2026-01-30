'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { TrendingUp } from 'lucide-react'
import type { SquadSnapshot } from '@/lib/types'

interface SquadDevelopmentChartProps {
  snapshots: SquadSnapshot[]
}

export function SquadDevelopmentChart({ snapshots }: SquadDevelopmentChartProps) {
  // Transform snapshots to chart data
  const chartData = snapshots.map(snap => ({
    date: formatDate(snap.date),
    strength: snap.averageStrength,
    players: snap.playerCount,
  }))

  // Empty state
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-digital-orange" />
            Squad-Entwicklung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-mid-grey">
            <p className="text-center">
              Noch keine Daten verfügbar.<br />
              Kehre morgen zurück für Trends!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-digital-orange" />
          Squad-Entwicklung
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              domain={[0, 30]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F0F4F0',
              }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Line
              type="monotone"
              dataKey="strength"
              stroke="#C7FF5C"
              strokeWidth={2}
              dot={{ fill: '#C7FF5C', r: 4 }}
              activeDot={{ r: 6, fill: '#FF6B35' }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 text-xs text-mid-grey text-center">
          Zeigt die durchschnittliche Mannschaftsstärke über die letzten {chartData.length} Tage
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Format YYYY-MM-DD to DD.MM
 */
function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}.${month}`
}
