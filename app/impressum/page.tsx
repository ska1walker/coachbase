'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { AppHeader } from '@/components/AppHeader'
import { PageLayout } from '@/components/PageLayout'
import { LandingFooter } from '@/components/LandingFooter'
import { BottomNav } from '@/components/BottomNav'
import { ArrowLeft, Mail, MapPin } from 'lucide-react'

export default function ImpressumPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user)
    })
    return () => unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-soft-mint dark:bg-deep-petrol pb-20 md:pb-8">
      {isLoggedIn && <AppHeader />}

      <PageLayout maxWidth="2xl">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-digital-purple hover:text-digital-purple/80 transition-smooth mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Zurück</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h1-mobile md:text-h1-desktop font-headline text-deep-petrol dark:text-soft-mint mb-2">
            Impressum
          </h1>
          <p className="text-mid-grey">
            Angaben gemäß § 5 TMG
          </p>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h2 className="text-h2-mobile md:text-h2-desktop font-headline text-deep-petrol dark:text-soft-mint mb-4">
              Verantwortlich für den Inhalt
            </h2>

            <div className="space-y-6 text-deep-petrol dark:text-soft-mint">
              <div>
                <p className="font-semibold text-lg">Kai Böhm</p>
                <div className="flex items-start gap-2 mt-2">
                  <MapPin className="w-5 h-5 text-digital-purple mt-0.5 flex-shrink-0" />
                  <div>
                    <p>Am Sportplatz 14</p>
                    <p>29633 Munster</p>
                    <p>Deutschland</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Kontakt</h3>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-digital-purple" />
                  <a
                    href="mailto:support@coachbase.eu"
                    className="text-digital-purple hover:underline"
                  >
                    support@coachbase.eu
                  </a>
                </div>
              </div>

              <div className="pt-6 border-t border-mid-grey/20">
                <h3 className="font-semibold text-lg mb-2">Haftungsausschluss</h3>
                <p className="text-mid-grey text-sm">
                  Die Inhalte dieser App wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
                  Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
                </p>
              </div>

              <div className="pt-6 border-t border-mid-grey/20">
                <h3 className="font-semibold text-lg mb-2">Urheberrecht</h3>
                <p className="text-mid-grey text-sm">
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf dieser App unterliegen
                  dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
                  der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
                  Zustimmung des jeweiligen Autors bzw. Erstellers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>

      {isLoggedIn ? <BottomNav /> : <LandingFooter />}
    </div>
  )
}
