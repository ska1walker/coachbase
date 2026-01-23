'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { AppHeader } from '@/components/AppHeader'
import { PageLayout } from '@/components/PageLayout'
import { LandingFooter } from '@/components/LandingFooter'
import { BottomNav } from '@/components/BottomNav'
import { ArrowLeft, Shield, Database, Lock, Eye, Server } from 'lucide-react'

export default function DatenschutzPage() {
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
            Datenschutzerklärung
          </h1>
          <p className="text-mid-grey">
            Informationen über die Verarbeitung personenbezogener Daten
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Grundsätzliches */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-digital-purple" />
                <CardTitle>1. Verantwortlicher</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-deep-petrol dark:text-soft-mint">
              <p className="mb-4">
                Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              </p>
              <p className="font-semibold">Kai Böhm</p>
              <p>Am Sportplatz 14</p>
              <p>29633 Munster</p>
              <p className="mt-2">
                E-Mail:{' '}
                <a href="mailto:support@coachbase.eu" className="text-digital-purple hover:underline">
                  support@coachbase.eu
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Datenerfassung */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-digital-purple" />
                <CardTitle>2. Welche Daten erfassen wir?</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-deep-petrol dark:text-soft-mint space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account-Daten</h3>
                <p className="text-sm text-mid-grey">
                  Bei der Registrierung erfassen wir Ihre E-Mail-Adresse zur Authentifizierung.
                  Optional können Sie weitere Profildaten angeben (Anzeigename, Verein, Ort, Bio).
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Nutzungsdaten</h3>
                <p className="text-sm text-mid-grey">
                  Wir speichern Ihre Teams, Spieler und Statistiken (XP, Level, Achievements) zur
                  Bereitstellung der Gamification-Features. Sie können in den Datenschutz-Einstellungen
                  steuern, ob Sie in der öffentlichen Hall of Fame erscheinen möchten.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Technische Daten</h3>
                <p className="text-sm text-mid-grey">
                  Automatisch erfasste Daten: IP-Adresse, Browser-Typ, Betriebssystem, Zugriffszeitpunkt
                  (für technische Bereitstellung und Sicherheit).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Firebase */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Server className="w-6 h-6 text-digital-purple" />
                <CardTitle>3. Firebase & Google Cloud</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-deep-petrol dark:text-soft-mint space-y-4">
              <p className="text-sm text-mid-grey">
                Diese App nutzt <strong>Firebase</strong> (Google LLC) für:
              </p>
              <ul className="list-disc list-inside text-sm text-mid-grey space-y-2">
                <li><strong>Firebase Authentication:</strong> Sichere Benutzeranmeldung und -verwaltung</li>
                <li><strong>Cloud Firestore:</strong> Speicherung Ihrer Teams, Spieler und Profildaten</li>
                <li><strong>Firebase Hosting:</strong> Bereitstellung der Anwendung</li>
              </ul>
              <p className="text-sm text-mid-grey">
                Ihre Daten werden auf Servern von Google Cloud in Europa (europe-west3, Frankfurt) gespeichert.
                Firebase ist DSGVO-konform und Google hat mit uns einen Auftragsverarbeitungsvertrag (AVV) geschlossen.
              </p>
              <p className="text-sm text-mid-grey">
                Weitere Informationen:{' '}
                <a
                  href="https://firebase.google.com/support/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-digital-purple hover:underline"
                >
                  Firebase Datenschutz
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Rechtsgrundlage */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-digital-purple" />
                <CardTitle>4. Rechtsgrundlage</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-deep-petrol dark:text-soft-mint">
              <p className="text-sm text-mid-grey mb-4">
                Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf Grundlage von:
              </p>
              <ul className="list-disc list-inside text-sm text-mid-grey space-y-2">
                <li><strong>Art. 6 Abs. 1 lit. b DSGVO:</strong> Vertragserfüllung (Bereitstellung der App-Funktionen)</li>
                <li><strong>Art. 6 Abs. 1 lit. f DSGVO:</strong> Berechtigtes Interesse (technische Bereitstellung, Sicherheit)</li>
                <li><strong>Art. 6 Abs. 1 lit. a DSGVO:</strong> Einwilligung (optionale Profilfelder, Hall of Fame)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Ihre Rechte */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-digital-purple" />
                <CardTitle>5. Ihre Rechte</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-deep-petrol dark:text-soft-mint">
              <p className="text-sm text-mid-grey mb-4">
                Sie haben jederzeit das Recht auf:
              </p>
              <ul className="list-disc list-inside text-sm text-mid-grey space-y-2">
                <li><strong>Auskunft:</strong> Welche Daten wir über Sie speichern</li>
                <li><strong>Berichtigung:</strong> Korrektur falscher Daten</li>
                <li><strong>Löschung:</strong> Löschung Ihrer Daten ("Recht auf Vergessenwerden")</li>
                <li><strong>Einschränkung:</strong> Einschränkung der Verarbeitung</li>
                <li><strong>Datenübertragbarkeit:</strong> Erhalt Ihrer Daten in maschinenlesbarem Format</li>
                <li><strong>Widerspruch:</strong> Widerspruch gegen die Verarbeitung</li>
                <li><strong>Beschwerde:</strong> Beschwerde bei einer Datenschutzbehörde</li>
              </ul>
              <p className="text-sm text-mid-grey mt-4">
                Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter:{' '}
                <a href="mailto:support@coachbase.eu" className="text-digital-purple hover:underline">
                  support@coachbase.eu
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Datensicherheit */}
          <Card>
            <CardContent className="text-deep-petrol dark:text-soft-mint">
              <h3 className="font-semibold mb-2">6. Datensicherheit</h3>
              <p className="text-sm text-mid-grey">
                Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre Daten gegen
                Manipulation, Verlust, Zerstörung oder Zugriff unberechtigter Personen zu schützen.
                Dazu gehören verschlüsselte Übertragung (HTTPS/TLS), Firestore Security Rules und
                regelmäßige Sicherheitsupdates.
              </p>
            </CardContent>
          </Card>

          {/* Datenlöschung */}
          <Card>
            <CardContent className="text-deep-petrol dark:text-soft-mint">
              <h3 className="font-semibold mb-2">7. Löschung von Daten</h3>
              <p className="text-sm text-mid-grey">
                Wir speichern Ihre personenbezogenen Daten nur so lange, wie es für die Bereitstellung
                der App-Funktionen erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen.
                Bei Löschung Ihres Accounts werden alle personenbezogenen Daten entfernt.
              </p>
            </CardContent>
          </Card>

          {/* Stand */}
          <Card>
            <CardContent className="text-deep-petrol dark:text-soft-mint">
              <p className="text-sm text-mid-grey">
                <strong>Stand dieser Datenschutzerklärung:</strong> Januar 2026
              </p>
              <p className="text-sm text-mid-grey mt-2">
                Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte
                Rechtslagen oder Änderungen unserer Dienste anzupassen.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>

      {isLoggedIn ? <BottomNav /> : <LandingFooter />}
    </div>
  )
}
