'use client'

import { forwardRef } from 'react'
import { Users } from 'lucide-react'
import type { Player } from '@/lib/types'
import type { PlayerMatchStats } from '@/lib/player-dashboard-utils'

interface PlayerShareCardProps {
  player: Player
  matchStats: PlayerMatchStats | null
  squadName: string
}

/**
 * 9:16 aspect ratio card for social media sharing
 * Designed for 1080x1920px export (Instagram/TikTok Stories)
 * Rendered at 1/4 size (270x480px) for preview
 */
export const PlayerShareCard = forwardRef<HTMLDivElement, PlayerShareCardProps>(
  function PlayerShareCard({ player, matchStats, squadName }, ref) {
    const hasMatchStats = matchStats && matchStats.totalMatches > 0

    return (
      <div
        ref={ref}
        className="w-[270px] h-[480px] bg-deep-petrol rounded-2xl overflow-hidden flex flex-col relative"
        style={{
          // For html2canvas export, we'll scale this up 4x
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, #DFFF00 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />

        {/* Header with Logo */}
        <div className="relative z-10 pt-6 pb-4 px-5 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-md bg-neon-lime flex items-center justify-center">
              <Users className="w-4 h-4 text-deep-petrol" strokeWidth={2.5} />
            </div>
            <span className="text-soft-mint font-bold text-sm tracking-wide">
              COACHBASE
            </span>
          </div>
        </div>

        {/* Player Name */}
        <div className="relative z-10 px-5 text-center">
          <h1 className="text-2xl font-bold text-soft-mint tracking-tight leading-tight">
            {player.name}
          </h1>

          {/* Positions */}
          {player.positions && player.positions.length > 0 && (
            <div className="flex items-center justify-center gap-1 mt-2">
              <div className="h-px w-6 bg-neon-lime/40" />
              <span className="text-neon-lime text-xs font-medium uppercase tracking-wider">
                {player.positions.join(' · ')}
              </span>
              <div className="h-px w-6 bg-neon-lime/40" />
            </div>
          )}
        </div>

        {/* Skill Stats */}
        <div className="relative z-10 px-5 mt-6">
          <div className="grid grid-cols-3 gap-3">
            <SkillCircle label="TEC" value={player.technik} color="lime" />
            <SkillCircle label="FIT" value={player.fitness} color="orange" />
            <SkillCircle label="SPV" value={player.spielverstaendnis} color="blue" />
          </div>

          {/* Total Strength */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-lime/10 border border-neon-lime/30">
              <span className="text-soft-mint/70 text-xs font-medium">GESAMT</span>
              <span className="text-neon-lime text-xl font-bold">{player.total}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative z-10 px-8 my-5">
          <div className="h-px bg-soft-mint/20" />
        </div>

        {/* Match Statistics */}
        <div className="relative z-10 px-5 flex-1">
          <h2 className="text-soft-mint/50 text-[10px] font-bold uppercase tracking-widest mb-3 text-center">
            Spiel-Statistiken
          </h2>

          {hasMatchStats ? (
            <div className="space-y-2.5">
              <StatRow
                label="Anwesenheit"
                value={`${Math.round(matchStats.attendanceRate)}%`}
                subValue={`${matchStats.attendedMatches}/${matchStats.totalMatches} Spiele`}
              />

              {matchStats.matchesWithResults > 0 && (
                <StatRow
                  label="Siegquote"
                  value={`${Math.round(matchStats.winRate)}%`}
                  subValue={`${matchStats.wins}S ${matchStats.draws}U ${matchStats.losses}N`}
                />
              )}

              <StatRow
                label="Letzter Einsatz"
                value={formatLastMatch(matchStats.lastMatchDate)}
              />
            </div>
          ) : (
            <div className="text-center text-soft-mint/40 text-xs py-4">
              Noch keine Spieldaten
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative z-10 pb-5 px-5 text-center">
          <div className="text-soft-mint/30 text-[9px] uppercase tracking-widest mb-1">
            squad-match.vercel.app
          </div>
          <div className="text-neon-lime text-xs font-medium">
            @{squadName.replace(/\s+/g, '').toLowerCase()}
          </div>
        </div>
      </div>
    )
  }
)

// Skill Circle Component
function SkillCircle({
  label,
  value,
  color
}: {
  label: string
  value: number
  color: 'lime' | 'orange' | 'blue'
}) {
  const colorClasses = {
    lime: 'border-neon-lime text-neon-lime',
    orange: 'border-digital-orange text-digital-orange',
    blue: 'border-blue-400 text-blue-400',
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`w-14 h-14 rounded-full border-2 ${colorClasses[color]} flex items-center justify-center bg-deep-petrol`}>
        <span className="text-xl font-bold">{value}</span>
      </div>
      <span className="text-soft-mint/60 text-[10px] font-medium mt-1.5 uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}

// Stat Row Component
function StatRow({
  label,
  value,
  subValue
}: {
  label: string
  value: string
  subValue?: string
}) {
  return (
    <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-soft-mint/5">
      <span className="text-soft-mint/60 text-xs">{label}</span>
      <div className="text-right">
        <span className="text-soft-mint text-sm font-semibold">{value}</span>
        {subValue && (
          <span className="text-soft-mint/40 text-[10px] ml-1.5">{subValue}</span>
        )}
      </div>
    </div>
  )
}

// Helper to format last match date
function formatLastMatch(date: Date | null): string {
  if (!date) return 'Kein Einsatz'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Heute'
  if (diffDays === 1) return 'Gestern'
  if (diffDays < 7) return `Vor ${diffDays} Tagen`

  return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })
}
