'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageLayout } from '@/components/PageLayout'
import { UserPlus, Check, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AcceptInvitePage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [squadName, setSquadName] = useState<string | null>(null)
  const [squadId, setSquadId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  // Check authentication status
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [])

  const handleAcceptInvite = async () => {
    if (!user) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/accept-invite/${token}`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const functions = getFunctions()
      const acceptInvite = httpsCallable(functions, 'acceptInvite')

      const result = await acceptInvite({ token })
      const data = result.data as any

      if (data.success) {
        setSuccess(true)
        setSquadName(data.squadName)
        setSquadId(data.squadId)

        // Redirect to squad page after 2 seconds
        setTimeout(() => {
          router.push(`/squads/${data.squadId}`)
        }, 2000)
      } else {
        setError(data.error || 'Fehler beim Annehmen der Einladung')
      }
    } catch (err: any) {
      console.error('Error accepting invite:', err)

      // Parse Firebase error message
      let errorMessage = 'Ein Fehler ist aufgetreten'
      if (err.code === 'not-found') {
        errorMessage = 'Einladung nicht gefunden. Der Link ist möglicherweise abgelaufen oder ungültig.'
      } else if (err.code === 'failed-precondition') {
        errorMessage = err.message || 'Diese Einladung kann nicht angenommen werden.'
      } else if (err.code === 'unauthenticated') {
        errorMessage = 'Bitte melde dich an, um die Einladung anzunehmen.'
        router.push(`/login?redirect=/accept-invite/${token}`)
        return
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-soft-mint dark:bg-deep-petrol flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" strokeWidth={1.5} />
            <p className="text-mid-grey">
              Ungültiger Einladungs-Link
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-soft-mint dark:bg-deep-petrol">
      <PageLayout>
        <div className="max-w-2xl mx-auto pt-12">
          {success ? (
            // Success State
            <Card>
              <CardContent className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 mb-6">
                  <Check className="w-12 h-12 text-green-600 dark:text-green-400" strokeWidth={2} />
                </div>
                <h1 className="text-3xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-4">
                  Erfolgreich beigetreten!
                </h1>
                <p className="text-lg text-mid-grey mb-6">
                  Du bist jetzt Co-Trainer für <strong>{squadName}</strong>
                </p>
                <p className="text-sm text-mid-grey mb-8">
                  Du wirst in wenigen Sekunden weitergeleitet...
                </p>
                {squadId && (
                  <Link href={`/squads/${squadId}`}>
                    <Button variant="primary" className="flex items-center gap-2 mx-auto">
                      Zum Team
                      <ArrowRight className="w-5 h-5" strokeWidth={2} />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            // Accept Invite Card
            <Card>
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-lime/20 mb-4 mx-auto">
                  <UserPlus className="w-8 h-8 text-neon-lime" strokeWidth={2} />
                </div>
                <CardTitle>Co-Trainer Einladung</CardTitle>
              </CardHeader>

              <CardContent>
                {!user ? (
                  // Not Logged In
                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-soft-mint/50 dark:bg-card-dark border border-mid-grey/20">
                      <p className="text-center text-mid-grey leading-relaxed">
                        Du wurdest eingeladen, Co-Trainer für ein Team zu werden.
                        Bitte melde dich an oder erstelle einen Account, um fortzufahren.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Link href={`/login?redirect=/accept-invite/${token}`}>
                        <Button variant="primary" fullWidth>
                          Anmelden
                        </Button>
                      </Link>
                      <Link href={`/login?redirect=/accept-invite/${token}`}>
                        <Button variant="secondary" fullWidth>
                          Neuen Account erstellen
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  // Logged In - Show Accept UI
                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-soft-mint/50 dark:bg-card-dark border border-mid-grey/20">
                      <p className="text-center text-mid-grey leading-relaxed mb-4">
                        Du wurdest eingeladen, Co-Trainer zu werden.
                      </p>
                      <p className="text-sm text-center text-mid-grey">
                        Als Co-Trainer kannst du:
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Check className="w-5 h-5 text-neon-lime flex-shrink-0" strokeWidth={2} />
                        <span className="text-mid-grey">Teams generieren</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Check className="w-5 h-5 text-neon-lime flex-shrink-0" strokeWidth={2} />
                        <span className="text-mid-grey">Match-Ergebnisse speichern</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Check className="w-5 h-5 text-neon-lime flex-shrink-0" strokeWidth={2} />
                        <span className="text-mid-grey">Spieler und Statistiken einsehen</span>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                        </div>
                      </div>
                    )}

                    <Button
                      variant="primary"
                      onClick={handleAcceptInvite}
                      disabled={loading}
                      fullWidth
                      className="text-lg py-6"
                    >
                      {loading ? 'Trete bei...' : 'Einladung annehmen'}
                    </Button>

                    <p className="text-xs text-center text-mid-grey">
                      Angemeldet als: <strong>{user.email}</strong>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </PageLayout>
    </div>
  )
}
