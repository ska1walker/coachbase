'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { MapPin } from 'lucide-react'
import type { PlayerPosition } from '@/lib/types'

interface PlayerPositionChartProps {
  positionDistribution: Record<PlayerPosition, number>
  totalMatches: number
}

const POSITION_COLORS: Record<PlayerPosition, string> = {
  'Torhüter': '#60A5FA',     // Blue
  'Abwehr': '#C7FF5C',       // Neon Lime
  'Mittelfeld': '#FF6B35',   // Digital Orange
  'Angriff': '#F472B6',      // Pink
}

const POSITION_SHORT: Record<PlayerPosition, string> = {
  'Torhüter': 'TW',
  'Abwehr': 'ABW',
  'Mittelfeld': 'MF',
  'Angriff': 'ANG',
}

export function PlayerPositionChart({ positionDistribution, totalMatches }: PlayerPositionChartProps) {
  // Check if player has any position data
  const hasData = Object.values(positionDistribution).some(count => count > 0)

  if (!hasData || totalMatches === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-neon-lime" strokeWidth={2} />
            Positions-Verteilung
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-center text-mid-grey">
            <p className="mb-2">Noch keine Daten verfügbar</p>
            <p className="text-sm">Wird nach dem ersten Spiel angezeigt</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform data for chart
  const totalPositionMatches = Object.values(positionDistribution).reduce((a, b) => a + b, 0)

  const chartData = (Object.entries(positionDistribution) as [PlayerPosition, number][])
    .map(([position, count]) => ({
      position,
      shortName: POSITION_SHORT[position],
      count,
      percentage: totalPositionMatches > 0 ? Math.round((count / totalPositionMatches) * 100) : 0,
      color: POSITION_COLORS[position],
    }))
    .filter(item => item.count > 0) // Only show positions with data

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-neon-lime" strokeWidth={2} />
          Positions-Verteilung
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} horizontal={false} />
            <XAxis
              type="number"
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              domain={[0, 'auto']}
              tickFormatter={(value) => `${value}x`}
            />
            <YAxis
              type="category"
              dataKey="position"
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F5F5F5',
              }}
              formatter={(value, _name, props) => {
                const payload = props?.payload as { percentage?: number } | undefined
                const percentage = payload?.percentage ?? 0
                return [`${value}x (${percentage}%)`, 'Einsätze']
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {chartData.map((item) => (
            <div key={item.position} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-mid-grey">
                {item.position}: {item.count}x ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
