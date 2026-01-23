'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { X, Copy, Check, UserPlus, Clock } from 'lucide-react'
import { getFunctions, httpsCallable } from 'firebase/functions'

interface InviteCoTrainerProps {
  squadId: string
  squadName: string
  onClose: () => void
}

export function InviteCoTrainer({ squadId, squadName, onClose }: InviteCoTrainerProps) {
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateInvite = async () => {
    setLoading(true)
    setError(null)

    try {
      const functions = getFunctions()
      const createInvite = httpsCallable(functions, 'createInvite')

      const result = await createInvite({ squadId })
      const data = result.data as any

      if (data.success && data.token) {
        // Generate full invite link
        const baseUrl = window.location.origin
        const link = `${baseUrl}/accept-invite/${data.token}`
        setInviteLink(link)
        setExpiresAt(data.expiresAt)
      } else {
        setError('Fehler beim Erstellen des Einladungs-Links')
      }
    } catch (err: any) {
      console.error('Error creating invite:', err)
      setError(err.message || 'Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!inviteLink) return

    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-neon-lime" strokeWidth={2} />
            Co-Trainer einladen
          </CardTitle>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-card-dark transition-smooth"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </CardHeader>

        <CardContent>
          {!inviteLink ? (
            // Step 1: Create Invite
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-soft-mint/50 dark:bg-card-dark border border-mid-grey/20">
                <h3 className="font-bold text-lg text-deep-petrol dark:text-soft-mint mb-2">
                  {squadName}
                </h3>
                <p className="text-sm text-mid-grey leading-relaxed">
                  Erstelle einen Einladungs-Link für einen Co-Trainer.
                  Der Co-Trainer kann Teams generieren und Match-Ergebnisse speichern,
                  aber keine Spieler bearbeiten oder löschen.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-mid-grey">
                  <Check className="w-4 h-4 text-neon-lime" strokeWidth={2} />
                  Teams generieren
                </div>
                <div className="flex items-center gap-2 text-sm text-mid-grey">
                  <Check className="w-4 h-4 text-neon-lime" strokeWidth={2} />
                  Match-Ergebnisse speichern
                </div>
                <div className="flex items-center gap-2 text-sm text-mid-grey">
                  <Check className="w-4 h-4 text-neon-lime" strokeWidth={2} />
                  Spieler und Statistiken einsehen
                </div>
                <div className="flex items-center gap-2 text-sm text-mid-grey">
                  <X className="w-4 h-4 text-red-500" strokeWidth={2} />
                  Spieler bearbeiten/löschen
                </div>
                <div className="flex items-center gap-2 text-sm text-mid-grey">
                  <X className="w-4 h-4 text-red-500" strokeWidth={2} />
                  Team löschen
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={handleCreateInvite}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Erstelle Link...' : 'Einladungs-Link erstellen'}
                </Button>
                <Button variant="secondary" onClick={onClose}>
                  Abbrechen
                </Button>
              </div>
            </div>
          ) : (
            // Step 2: Show Invite Link
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-2">
                  <Check className="w-6 h-6 text-green-600 dark:text-green-400" strokeWidth={2} />
                  <h3 className="font-bold text-lg text-green-800 dark:text-green-300">
                    Link erfolgreich erstellt!
                  </h3>
                </div>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Teile diesen Link mit deinem Co-Trainer. Der Link ist 7 Tage gültig.
                </p>
              </div>

              {expiresAt && (
                <div className="flex items-center gap-2 text-sm text-mid-grey">
                  <Clock className="w-4 h-4" strokeWidth={2} />
                  Gültig bis: {formatDate(expiresAt)}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-deep-petrol dark:text-soft-mint">
                  Einladungs-Link
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant={copied ? 'primary' : 'secondary'}
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" strokeWidth={2} />
                        Kopiert!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" strokeWidth={2} />
                        Kopieren
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-soft-mint/50 dark:bg-card-dark border border-mid-grey/20">
                <p className="text-sm text-mid-grey leading-relaxed">
                  <strong>Wichtig:</strong> Der Link kann nur einmal verwendet werden.
                  Nach der Annahme wird der Co-Trainer automatisch hinzugefügt.
                </p>
              </div>

              <Button variant="secondary" onClick={onClose} fullWidth>
                Fertig
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
