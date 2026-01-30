'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp } from 'lucide-react'
import type { PlayerSnapshot } from '@/lib/types'

interface PlayerDevelopmentChartProps {
  snapshots: PlayerSnapshot[]
}

export function PlayerDevelopmentChart({ snapshots }: PlayerDevelopmentChartProps) {
  if (snapshots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-digital-orange" />
            Skill-Entwicklung
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-center text-mid-grey">
            <p className="mb-2">Noch keine Daten verfügbar</p>
            <p className="text-sm">Kehre morgen zurück, um deine Entwicklung zu sehen!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform data for chart
  const chartData = snapshots.map((snap) => ({
    date: formatDate(snap.date),
    Technik: snap.technik,
    Fitness: snap.fitness,
    Spielverständnis: snap.spielverstaendnis,
  }))

  function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-')
    return `${day}.${month}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-digital-orange" strokeWidth={2} />
          Skill-Entwicklung
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
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
              domain={[0, 10]}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F5F5F5',
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
            />

            {/* Technik Line - Neon Lime */}
            <Line
              type="monotone"
              dataKey="Technik"
              stroke="#C7FF5C"
              strokeWidth={2}
              dot={{ fill: '#C7FF5C', r: 3 }}
              activeDot={{ r: 5 }}
            />

            {/* Fitness Line - Digital Orange */}
            <Line
              type="monotone"
              dataKey="Fitness"
              stroke="#FF6B35"
              strokeWidth={2}
              dot={{ fill: '#FF6B35', r: 3 }}
              activeDot={{ r: 5 }}
            />

            {/* Spielverständnis Line - Blue */}
            <Line
              type="monotone"
              dataKey="Spielverständnis"
              stroke="#60A5FA"
              strokeWidth={2}
              dot={{ fill: '#60A5FA', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
