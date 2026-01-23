'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/Button'
import { PageLayout } from '@/components/PageLayout'
import { LandingFooter } from '@/components/LandingFooter'
import {
  Users,
  User,
  Shield,
  LogOut,
  Zap,
  Clock,
  Scale,
  FileX2,
  Smartphone,
  History,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Target,
  Dumbbell,
  Trophy,
  Gamepad2,
  Check,
} from 'lucide-react'

// Abstract Balance Graphic Component
function BalanceGraphic() {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center">
      {/* Hologram glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-neon-lime/10 via-transparent to-transparent animate-pulse" />

      {/* Left Team - Circles */}
      <div className="absolute left-[15%] top-[30%] space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={`left-${i}`}
            className="w-12 h-12 rounded-full border-2 border-neon-lime/60 bg-neon-lime/5 animate-float"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>

      {/* Right Team - Circles */}
      <div className="absolute right-[15%] top-[30%] space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={`right-${i}`}
            className="w-12 h-12 rounded-full border-2 border-neon-lime/60 bg-neon-lime/5 animate-float"
            style={{ animationDelay: `${i * 0.2 + 0.1}s` }}
          />
        ))}
      </div>

      {/* Center Balance Point */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          {/* Balance scale */}
          <div className="w-48 h-1 bg-neon-lime/80 rounded-full" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-12 bg-neon-lime/80 rounded-full" />

          {/* Glowing arrow pointing down */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <div className="w-8 h-8 border-4 border-neon-lime border-t-transparent rounded-full animate-spin-slow" />
          </div>
        </div>
      </div>

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <line
          x1="25%"
          y1="50%"
          x2="50%"
          y2="50%"
          stroke="rgb(190, 242, 100)"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.3"
        />
        <line
          x1="75%"
          y1="50%"
          x2="50%"
          y2="50%"
          stroke="rgb(190, 242, 100)"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.3"
        />
      </svg>
    </div>
  )
}

// UI Mockup: Balanced Lists
function BalancedListsMockup() {
  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      <div className="grid grid-cols-2 gap-8 w-full max-w-md">
        {/* Team A */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-neon-lime/20">
          <div className="text-sm font-bold text-neon-lime mb-4">Team A</div>
          {['Max', 'Lisa', 'Tom', 'Anna', 'Ben'].map((name, i) => (
            <div key={i} className="flex items-center gap-2 mb-2 text-soft-mint/80 text-sm">
              <div className="w-2 h-2 rounded-full bg-neon-lime" />
              {name}
            </div>
          ))}
          <div className="mt-4 pt-4 border-t border-neon-lime/20 text-neon-lime font-bold">
            Σ 145
          </div>
        </div>

        {/* Team B */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-digital-purple/20">
          <div className="text-sm font-bold text-digital-purple mb-4">Team B</div>
          {['Julia', 'Chris', 'Nina', 'Paul', 'Sara'].map((name, i) => (
            <div key={i} className="flex items-center gap-2 mb-2 text-soft-mint/80 text-sm">
              <div className="w-2 h-2 rounded-full bg-digital-purple" />
              {name}
            </div>
          ))}
          <div className="mt-4 pt-4 border-t border-digital-purple/20 text-digital-purple font-bold">
            Σ 147
          </div>
        </div>
      </div>

      {/* Match symbol in center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-16 h-16 rounded-full bg-neon-lime/20 border-2 border-neon-lime flex items-center justify-center">
          <Check className="w-8 h-8 text-neon-lime" strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}

// Smartphone Mockup
function SmartphoneMockup() {
  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      {/* Phone frame */}
      <div className="w-64 h-[400px] bg-deep-petrol border-4 border-neon-lime/30 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Screen */}
        <div className="absolute inset-4 bg-gradient-to-b from-deep-petrol to-deep-petrol/80 rounded-2xl p-4">
          {/* Header */}
          <div className="text-neon-lime text-sm font-bold mb-4">Meine Spieler</div>

          {/* Player list with checkboxes */}
          {['Max Mustermann', 'Lisa Schmidt', 'Tom Weber', 'Anna Müller', 'Ben Koch'].map((name, i) => (
            <div key={i} className="flex items-center gap-3 mb-3 text-soft-mint text-sm">
              <div className="w-5 h-5 rounded border-2 border-neon-lime/60 flex items-center justify-center">
                {i < 3 && <Check className="w-3 h-3 text-neon-lime" strokeWidth={3} />}
              </div>
              <span className={i < 3 ? 'text-soft-mint' : 'text-soft-mint/40'}>{name}</span>
            </div>
          ))}
        </div>

        {/* Finger tap indicator */}
        <div className="absolute bottom-24 right-8 animate-bounce">
          <div className="w-12 h-12 rounded-full bg-neon-lime/20 border-2 border-neon-lime flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-neon-lime" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Timeline Mockup
function TimelineMockup() {
  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      <div className="relative w-full max-w-lg">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-neon-lime/20" />

        {/* Timeline items */}
        {[
          { date: 'Heute', result: '5:3', winner: 'Team A' },
          { date: 'Gestern', result: '4:4', winner: 'Unentschieden' },
          { date: 'Vor 3 Tagen', result: '6:2', winner: 'Team B' },
        ].map((item, i) => (
          <div key={i} className="relative flex items-start gap-6 mb-12">
            {/* Timeline dot */}
            <div className="w-16 h-16 rounded-full bg-neon-lime/20 border-4 border-neon-lime flex items-center justify-center flex-shrink-0">
              <History className="w-6 h-6 text-neon-lime" strokeWidth={1.5} />
            </div>

            {/* Content card */}
            <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-neon-lime/20">
              <div className="text-xs text-mid-grey mb-1">{item.date}</div>
              <div className="text-lg font-bold text-neon-lime mb-1">{item.result}</div>
              <div className="text-sm text-soft-mint/80">{item.winner}</div>
            </div>
          </div>
        ))}

        {/* Arrow pointing backward */}
        <div className="absolute -left-4 top-0">
          <div className="w-8 h-8 border-l-2 border-t-2 border-neon-lime transform rotate-[-45deg] animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// FAQ Item Component
interface FAQItemProps {
  question: string
  answer: string
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-mid-grey/20 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left transition-smooth hover:text-neon-lime"
      >
        <span className="text-lg font-medium text-deep-petrol dark:text-soft-mint pr-4">
          {question}
        </span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-neon-lime flex-shrink-0" strokeWidth={2} />
        ) : (
          <ChevronDown className="w-5 h-5 text-mid-grey flex-shrink-0" strokeWidth={2} />
        )}
      </button>
      {isOpen && (
        <div className="pb-6 text-mid-grey leading-relaxed animate-fade-in">
          {answer}
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [displayName, setDisplayName] = useState<string>('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        setUserEmail(currentUser.email || '')

        // Load displayName from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
          if (userDoc.exists()) {
            setDisplayName(userDoc.data().displayName || '')
          }
        } catch (error) {
          console.error('Error loading display name:', error)
        }

        currentUser.getIdTokenResult().then((idTokenResult) => {
          setIsAdmin(idTokenResult.claims.role === 'admin')
        })
      } else {
        setUser(null)
        setUserEmail('')
        setDisplayName('')
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setShowMenu(false)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-soft-mint dark:bg-deep-petrol">
      {/* Header/Navigation */}
      <header className="border-b border-mid-grey/20 backdrop-blur-md bg-white/80 dark:bg-card-dark/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between min-h-[72px] py-3">
            <Link href={user ? "/squads" : "/"} className="flex items-center gap-3 hover:opacity-80 transition-smooth">
              <div className="w-10 h-10 rounded-xl bg-neon-lime flex items-center justify-center">
                <Users className="w-6 h-6 text-deep-petrol" strokeWidth={2} />
              </div>
              <h1 className="text-xl md:text-2xl font-headline font-bold text-deep-petrol dark:text-soft-mint">
                CoachBase
              </h1>
            </Link>

            {!loading && (
              <>
                {user ? (
                  // User Menu (logged in)
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-deep-petrol transition-smooth"
                    >
                      <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-medium text-deep-petrol dark:text-soft-mint">
                          {displayName || userEmail.split('@')[0]}
                        </span>
                        {isAdmin && (
                          <span className="text-xs text-neon-lime font-bold uppercase">Admin</span>
                        )}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-neon-lime/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-neon-lime" strokeWidth={2} />
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowMenu(false)}
                        />

                        {/* Menu */}
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-card-dark rounded-lg shadow-lg border border-mid-grey/20 z-50">
                          <div className="p-4 border-b border-mid-grey/20">
                            {displayName && (
                              <p className="text-sm font-bold text-deep-petrol dark:text-soft-mint">
                                {displayName}
                              </p>
                            )}
                            <p className={`text-sm ${displayName ? 'text-mid-grey' : 'font-medium text-deep-petrol dark:text-soft-mint'}`}>
                              {userEmail}
                            </p>
                            {isAdmin && (
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 rounded bg-neon-lime/20 text-neon-lime text-xs font-bold">
                                <Shield className="w-3 h-3" strokeWidth={2} />
                                ADMIN
                              </span>
                            )}
                          </div>

                          <div className="p-2">
                            {isAdmin && (
                              <Link
                                href="/admin"
                                onClick={() => setShowMenu(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-deep-petrol transition-smooth"
                              >
                                <Shield className="w-5 h-5 text-digital-purple" strokeWidth={2} />
                                <span className="text-sm font-medium text-deep-petrol dark:text-soft-mint">
                                  Admin Dashboard
                                </span>
                              </Link>
                            )}

                            <Link
                              href="/squads"
                              onClick={() => setShowMenu(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-deep-petrol transition-smooth"
                            >
                              <Users className="w-5 h-5 text-mid-grey" strokeWidth={2} />
                              <span className="text-sm font-medium text-deep-petrol dark:text-soft-mint">
                                Meine Teams
                              </span>
                            </Link>

                            <Link
                              href="/profile"
                              onClick={() => setShowMenu(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-deep-petrol transition-smooth"
                            >
                              <User className="w-5 h-5 text-mid-grey" strokeWidth={2} />
                              <span className="text-sm font-medium text-deep-petrol dark:text-soft-mint">
                                Profil
                              </span>
                            </Link>
                          </div>

                          <div className="p-2 border-t border-mid-grey/20">
                            <button
                              onClick={() => {
                                setShowMenu(false)
                                handleLogout()
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-smooth text-red-600 dark:text-red-400"
                            >
                              <LogOut className="w-5 h-5" strokeWidth={2} />
                              <span className="text-sm font-medium">Abmelden</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  // Login Button (not logged in)
                  <Link href="/login">
                    <Button
                      variant="secondary"
                      size="md"
                      className="gap-2"
                    >
                      Anmelden
                      <ArrowRight className="w-4 h-4" strokeWidth={2} />
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-deep-petrol overflow-hidden">
        {/* Halftone pattern background */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #BEF264 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <PageLayout className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
            {/* Text content */}
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-headline font-bold text-soft-mint mb-6 leading-tight">
                Schluss mit{' '}
                <span className="text-neon-lime">10:0</span>
                <br />
                und endlosem Wählen
              </h1>

              <p className="text-xl md:text-2xl text-soft-mint/80 mb-8 leading-relaxed">
                CoachBase sorgt für faire, ausgeglichene Teams – in Sekunden.
                Datenbasiert. Transparent. Ohne Drama.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto gap-3"
                  >
                    Jetzt loslegen
                    <ArrowRight className="w-5 h-5" strokeWidth={2} />
                  </Button>
                </Link>

                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto bg-white/10 border-white/20 hover:bg-white/20 text-soft-mint dark:border-white/20 dark:text-soft-mint dark:hover:bg-white/20"
                >
                  Wie es funktioniert
                </Button>
              </div>

              <p className="text-sm text-soft-mint/60 mt-6">
                100% kostenlos • Keine Anmeldung erforderlich zum Testen
              </p>
            </div>

            {/* Balance Graphic */}
            <div className="hidden lg:block">
              <BalanceGraphic />
            </div>
          </div>
        </PageLayout>
      </section>

      {/* Problem Section */}
      <section className="bg-gradient-to-b from-deep-petrol via-deep-petrol/95 to-deep-petrol/90">
        <PageLayout>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-soft-mint mb-4">
              Kennst du das Problem?
            </h2>
            <p className="text-xl text-soft-mint/70">
              Jede Trainingseinheit, das gleiche Theater
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pain Point 1 */}
            <div className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-neon-lime/10 hover:border-neon-lime/30 transition-smooth">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-neon-lime/20 mb-6">
                <Clock className="w-12 h-12 text-neon-lime" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-headline font-bold text-soft-mint mb-4">
                Ewiges Wählen
              </h3>
              <p className="text-soft-mint/70 leading-relaxed">
                10 Minuten warten, bis die Kapitäne endlich fertig sind.
                Die Stimmung kippt schon vor dem Anpfiff.
              </p>
            </div>

            {/* Pain Point 2 */}
            <div className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-neon-lime/10 hover:border-neon-lime/30 transition-smooth">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-neon-lime/20 mb-6">
                <Scale className="w-12 h-12 text-neon-lime" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-headline font-bold text-soft-mint mb-4">
                Unfaire Teams
              </h3>
              <p className="text-soft-mint/70 leading-relaxed">
                Ein Team gewinnt 8:1. Kein Flow, keine Spannung.
                Die Schwächeren verlieren die Lust.
              </p>
            </div>

            {/* Pain Point 3 */}
            <div className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-neon-lime/10 hover:border-neon-lime/30 transition-smooth">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-neon-lime/20 mb-6">
                <FileX2 className="w-12 h-12 text-neon-lime" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-headline font-bold text-soft-mint mb-4">
                Zettelwirtschaft
              </h3>
              <p className="text-soft-mint/70 leading-relaxed">
                Spielerlisten, Ergebnisse, wer war wann dabei?
                Alles verloren oder unleserlich.
              </p>
            </div>
          </div>
        </PageLayout>
      </section>

      {/* Solution Section - Zig Zag */}
      <section className="bg-soft-mint dark:bg-deep-petrol/80">
        <PageLayout>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-4">
              Die Lösung
            </h2>
            <p className="text-xl text-mid-grey">
              Technologie trifft Fairness
            </p>
          </div>

          {/* Feature 1: Balanced Teams */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <div className="order-2 lg:order-1">
              <div className="inline-block px-4 py-2 bg-neon-lime/20 rounded-full text-sm font-bold text-deep-petrol dark:text-neon-lime mb-4">
                Smart Algorithm
              </div>
              <h3 className="text-3xl md:text-4xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-4">
                Perfekt ausgeglichene Teams
              </h3>
              <p className="text-lg text-mid-grey leading-relaxed mb-6">
                Unser Algorithmus analysiert Technik, Fitness und Spielverständnis jedes Spielers.
                Das Ergebnis: Teams mit minimalem Skill-Gap. Jedes Match wird spannend.
              </p>
              <ul className="space-y-3">
                {['Datenbasierte Aufteilung', 'Berücksichtigt 3 Dimensionen', 'In unter 3 Sekunden'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-mid-grey">
                    <Check className="w-5 h-5 text-neon-lime flex-shrink-0" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="order-1 lg:order-2">
              <BalancedListsMockup />
            </div>
          </div>

          {/* Feature 2: Digital Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <SmartphoneMockup />
            </div>

            <div>
              <div className="inline-block px-4 py-2 bg-digital-purple/20 rounded-full text-sm font-bold text-digital-purple mb-4">
                Always Ready
              </div>
              <h3 className="text-3xl md:text-4xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-4">
                Dein digitales Clipboard
              </h3>
              <p className="text-lg text-mid-grey leading-relaxed mb-6">
                Alle Spieler, alle Daten, immer dabei. Schnell checken wer dabei ist,
                Teams generieren, fertig. Kein Zettel, kein Stress.
              </p>
              <ul className="space-y-3">
                {['CSV-Import für schnelles Setup', 'Spieler-Profile mit Skills', 'Offline verfügbar'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-mid-grey">
                    <Check className="w-5 h-5 text-digital-purple flex-shrink-0" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature 3: History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-block px-4 py-2 bg-neon-lime/20 rounded-full text-sm font-bold text-deep-petrol dark:text-neon-lime mb-4">
                Track Progress
              </div>
              <h3 className="text-3xl md:text-4xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-4">
                Vollständige Match History
              </h3>
              <p className="text-lg text-mid-grey leading-relaxed mb-6">
                Jedes Ergebnis wird gespeichert. Statistiken, Trends, Erfolge –
                alles auf einen Blick. Perfekt für Turniere oder Liga-Betrieb.
              </p>
              <ul className="space-y-3">
                {['Automatisches Speichern', 'Statistiken & Rankings', 'Export als PDF'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-mid-grey">
                    <Check className="w-5 h-5 text-neon-lime flex-shrink-0" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="order-1 lg:order-2">
              <TimelineMockup />
            </div>
          </div>
        </PageLayout>
      </section>

      {/* Use Cases */}
      <section className="bg-white dark:bg-card-dark">
        <PageLayout>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-4">
              Für jede Sportart
            </h2>
            <p className="text-xl text-mid-grey">
              Egal ob Verein oder Freizeitgruppe
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Football */}
            <div className="p-8 rounded-2xl border-2 border-transparent hover:border-neon-lime transition-smooth text-center bg-soft-mint/50 dark:bg-deep-petrol">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-deep-petrol/10 dark:bg-neon-lime/10 mb-4">
                <Target className="w-8 h-8 text-deep-petrol dark:text-neon-lime" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-2">
                Fußball
              </h3>
              <p className="text-sm text-mid-grey">
                Trainings, Turniere, Ligabetrieb
              </p>
            </div>

            {/* Basketball */}
            <div className="p-8 rounded-2xl border-2 border-transparent hover:border-digital-purple transition-smooth text-center bg-soft-mint/50 dark:bg-deep-petrol">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-deep-petrol/10 dark:bg-digital-purple/10 mb-4">
                <Dumbbell className="w-8 h-8 text-deep-petrol dark:text-digital-purple" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-2">
                Basketball
              </h3>
              <p className="text-sm text-mid-grey">
                Street Games, 3on3, Scrimmages
              </p>
            </div>

            {/* Volleyball */}
            <div className="p-8 rounded-2xl border-2 border-transparent hover:border-neon-lime transition-smooth text-center bg-soft-mint/50 dark:bg-deep-petrol">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-deep-petrol/10 dark:bg-neon-lime/10 mb-4">
                <Trophy className="w-8 h-8 text-deep-petrol dark:text-neon-lime" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-2">
                Volleyball
              </h3>
              <p className="text-sm text-mid-grey">
                Beach, Halle, Freizeitsport
              </p>
            </div>

            {/* E-Sports */}
            <div className="p-8 rounded-2xl border-2 border-transparent hover:border-digital-purple transition-smooth text-center bg-soft-mint/50 dark:bg-deep-petrol">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-deep-petrol/10 dark:bg-digital-purple/10 mb-4">
                <Gamepad2 className="w-8 h-8 text-deep-petrol dark:text-digital-purple" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-2">
                E-Sports
              </h3>
              <p className="text-sm text-mid-grey">
                Team-Games, LAN-Partys, Turniere
              </p>
            </div>
          </div>
        </PageLayout>
      </section>

      {/* FAQ Section */}
      <section className="bg-soft-mint dark:bg-deep-petrol/80">
        <PageLayout>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-4">
                Häufige Fragen
              </h2>
            </div>

            <div className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-card">
              <FAQItem
                question="Wie funktioniert der Fairness-Algorithmus?"
                answer="Unser Algorithmus bewertet jeden Spieler in 3 Kategorien: Technik, Fitness und Spielverständnis. Dann verteilt er die Spieler so auf Teams, dass die Gesamtstärke beider Teams möglichst ausgeglichen ist."
              />
              <FAQItem
                question="Kann ich auch zufällig Teams generieren?"
                answer="Ja! Du kannst zwischen 'Fair (Skill-basiert)' und 'Zufällig' wählen. Beide Optionen sind mit einem Klick verfügbar."
              />
              <FAQItem
                question="Wie viele Spieler kann ich verwalten?"
                answer="Unbegrenzt! Du kannst beliebig viele Teams (Mannschaften) anlegen und jedes Team kann beliebig viele Spieler haben."
              />
              <FAQItem
                question="Kann ich Spieler per CSV importieren?"
                answer="Absolut! Du kannst eine CSV-Datei mit allen Spielern und ihren Werten hochladen. Perfekt für große Gruppen oder Vereine."
              />
              <FAQItem
                question="Was kostet CoachBase?"
                answer="CoachBase ist komplett kostenlos nutzbar. Keine versteckten Kosten, keine Premium-Features, keine Kreditkarte erforderlich."
              />
            </div>
          </div>
        </PageLayout>
      </section>

      {/* Final CTA */}
      <section className="relative bg-deep-petrol overflow-hidden">
        {/* Dynamic background lines */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 bg-gradient-to-r from-transparent via-neon-lime/30 to-transparent animate-slide-right"
              style={{
                top: `${15 + i * 15}%`,
                left: '-100%',
                width: '200%',
                animationDelay: `${i * 0.3}s`,
                animationDuration: '3s',
              }}
            />
          ))}
        </div>

        <PageLayout className="relative z-10 text-center">
          <h2 className="text-5xl md:text-6xl font-headline font-bold text-soft-mint mb-6 leading-tight">
            Bereit für faire Teams?
          </h2>
          <p className="text-xl text-soft-mint/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Keine Diskussionen mehr. Keine unfairen Spiele.
            Nur noch Spaß am Sport.
          </p>

          <Link href="/login">
            <Button
              variant="primary"
              size="lg"
              className="gap-3 shadow-2xl shadow-neon-lime/20 text-xl px-12 py-6"
            >
              Account erstellen
              <ArrowRight className="w-6 h-6" strokeWidth={2} />
            </Button>
          </Link>

          <p className="text-sm text-soft-mint/60 mt-8">
            In unter 2 Minuten einsatzbereit • Keine Installation nötig
          </p>
        </PageLayout>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}
