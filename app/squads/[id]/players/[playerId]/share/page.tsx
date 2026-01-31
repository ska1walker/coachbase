'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import html2canvas from 'html2canvas'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/collections'
import { doc, getDoc } from 'firebase/firestore'
import { AuthGuard } from '@/components/AuthGuard'
import { AppHeader } from '@/components/AppHeader'
import { PageLayout } from '@/components/PageLayout'
import { BottomNav } from '@/components/BottomNav'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Download, Share2, Loader2 } from 'lucide-react'
import type { Player, Squad } from '@/lib/types'
import { PlayerShareCard } from '@/components/player-dashboard/PlayerShareCard'
import {
  fetchPlayerMatchStats,
  type PlayerMatchStats as MatchStatsType
} from '@/lib/player-dashboard-utils'

function PlayerShareContent() {
  const router = useRouter()
  const params = useParams()
  const squadId = params.id as string
  const playerId = params.playerId as string
  const cardRef = useRef<HTMLDivElement>(null)

  const [squad, setSquad] = useState<Squad | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [matchStats, setMatchStats] = useState<MatchStatsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  // Load squad info
  useEffect(() => {
    if (!squadId) return

    const loadSquad = async () => {
      try {
        const squadDoc = await getDoc(doc(db, COLLECTIONS.SQUADS, squadId))
        if (squadDoc.exists()) {
          setSquad({
            id: squadDoc.id,
            ...squadDoc.data(),
          } as Squad)
        } else {
          router.push('/squads')
        }
      } catch (error) {
        console.error('Error loading squad:', error)
        router.push('/squads')
      }
    }

    loadSquad()
  }, [squadId, router])

  // Load player data
  useEffect(() => {
    if (!playerId) return

    const loadPlayer = async () => {
      try {
        const playerDoc = await getDoc(doc(db, COLLECTIONS.PLAYERS, playerId))
        if (playerDoc.exists()) {
          setPlayer({
            id: playerDoc.id,
            ...playerDoc.data(),
          } as Player)
        } else {
          router.push(`/squads/${squadId}`)
        }
      } catch (error) {
        console.error('Error loading player:', error)
        router.push(`/squads/${squadId}`)
      } finally {
        setLoading(false)
      }
    }

    loadPlayer()
  }, [playerId, squadId, router])

  // Load match stats
  useEffect(() => {
    if (!playerId || !squadId) return

    const loadMatchStats = async () => {
      try {
        const stats = await fetchPlayerMatchStats(squadId, playerId)
        setMatchStats(stats)
      } catch (error) {
        console.error('Error loading match stats:', error)
      }
    }

    loadMatchStats()
  }, [playerId, squadId])

  // Generate and download image
  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return

    setGenerating(true)
    try {
      // Generate canvas at 4x scale for high resolution (1080x1920)
      const canvas = await html2canvas(cardRef.current, {
        scale: 4,
        backgroundColor: '#0A1F1D',
        logging: false,
        useCORS: true,
      })

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${player?.name.replace(/\s+/g, '_').toLowerCase()}_spielerkarte.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 'image/png')
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      setGenerating(false)
    }
  }, [player?.name])

  // Share via Web Share API
  const handleShare = useCallback(async () => {
    if (!cardRef.current || !navigator.share) return

    setGenerating(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 4,
        backgroundColor: '#0A1F1D',
        logging: false,
        useCORS: true,
      })

      canvas.toBlob(async (blob) => {
        if (!blob) return

        const file = new File([blob], `${player?.name}_spielerkarte.png`, {
          type: 'image/png',
        })

        try {
          await navigator.share({
            title: `${player?.name} - Spielerkarte`,
            text: `Check die Stats von ${player?.name}! #CoachBase`,
            files: [file],
          })
        } catch (shareError) {
          // User cancelled or share failed - fall back to download
          console.log('Share cancelled, falling back to download')
          handleDownload()
        }
      }, 'image/png')
    } catch (error) {
      console.error('Error sharing:', error)
    } finally {
      setGenerating(false)
    }
  }, [player?.name, handleDownload])

  // Check if Web Share API is available
  const canShare = typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-mint dark:bg-deep-petrol flex items-center justify-center">
        <p className="text-mid-grey">Lädt...</p>
      </div>
    )
  }

  if (!player || !squad) {
    return null
  }

  return (
    <div className="min-h-screen bg-soft-mint dark:bg-deep-petrol pb-20 md:pb-8">
      <AppHeader />
      <PageLayout>
        {/* Back Button */}
        <div className="mb-6">
          <BackButton
            href={`/squads/${squadId}/players/${playerId}/dashboard`}
            label="Zurück zum Dashboard"
          />
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-headline font-bold text-deep-petrol dark:text-soft-mint">
            Spielerkarte teilen
          </h1>
          <p className="text-mid-grey mt-2">
            Teile die Statistiken von {player.name} als Bild
          </p>
        </div>

        {/* Card Preview */}
        <div className="flex justify-center mb-8">
          <div className="shadow-xl rounded-2xl overflow-hidden">
            <PlayerShareCard
              ref={cardRef}
              player={player}
              matchStats={matchStats}
              squadName={squad.name}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Button
            variant="primary"
            size="lg"
            className="flex-1 gap-2"
            onClick={handleDownload}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            Herunterladen
          </Button>

          {canShare && (
            <Button
              variant="secondary"
              size="lg"
              className="flex-1 gap-2"
              onClick={handleShare}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
              Teilen
            </Button>
          )}
        </div>

        {/* Info Text */}
        <p className="text-center text-mid-grey text-sm mt-6">
          Das Bild wird im Format 1080 × 1920 px (9:16) erstellt – perfekt für Instagram & TikTok Stories.
        </p>
      </PageLayout>

      <BottomNav />
    </div>
  )
}

export default function PlayerSharePage() {
  return (
    <AuthGuard>
      <PlayerShareContent />
    </AuthGuard>
  )
}
