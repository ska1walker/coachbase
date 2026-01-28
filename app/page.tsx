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
import { MobileMenu } from '@/components/MobileMenu'
import {
  Users,
  User,
  Shield,
  LogOut,
  Zap,
  Clock,
  Smartphone,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Target,
  Trophy,
  Check,
  XCircle,
  TrendingUp,
  MapPin,
  Timer,
  Sparkles,
  Menu,
  Heart,
} from 'lucide-react'

// Hero Graphic: Before/After Comparison
function HeroComparisonGraphic() {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      {/* Before (Left): Unfair Teams */}
      <div className="absolute left-0 w-[45%] h-full flex flex-col justify-center">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 mb-3">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs font-bold text-red-400 uppercase">Vorher</span>
          </div>
        </div>

        {/* Two unbalanced teams */}
        <div className="space-y-4">
          {/* Strong Team */}
          <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-4 border border-red-500/20">
            <div className="text-xs font-bold text-red-400 mb-2">Team A</div>
            {[9, 8, 9, 8, 9].map((skill, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-red-500/30 flex items-center justify-center text-[10px] font-bold text-red-300">
                  {skill}
                </div>
                <div className="flex-1 h-1.5 bg-red-500/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-400"
                    style={{ width: `${skill * 10}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-red-500/20 text-right">
              <span className="text-xl font-bold text-red-400">Σ 43</span>
            </div>
          </div>

          {/* Weak Team */}
          <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-4 border border-red-500/20">
            <div className="text-xs font-bold text-red-400 mb-2">Team B</div>
            {[4, 5, 3, 5, 4].map((skill, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-red-500/30 flex items-center justify-center text-[10px] font-bold text-red-300">
                  {skill}
                </div>
                <div className="flex-1 h-1.5 bg-red-500/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-400"
                    style={{ width: `${skill * 10}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-red-500/20 text-right">
              <span className="text-xl font-bold text-red-400">Σ 21</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <span className="text-2xl font-bold text-red-400">9:1</span>
          <p className="text-xs text-red-400/60 mt-1">Kein Spaß für niemanden</p>
        </div>
      </div>

      {/* Arrow in Center */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-neon-lime flex items-center justify-center mb-2 animate-pulse">
            <Sparkles className="w-6 h-6 text-deep-petrol" strokeWidth={2} />
          </div>
          <ArrowRight className="w-8 h-8 text-neon-lime" strokeWidth={3} />
        </div>
      </div>

      {/* After (Right): Balanced Teams */}
      <div className="absolute right-0 w-[45%] h-full flex flex-col justify-center">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-lime/20 border border-neon-lime/30 mb-3">
            <Check className="w-4 h-4 text-neon-lime" />
            <span className="text-xs font-bold text-neon-lime uppercase">Nachher</span>
          </div>
        </div>

        {/* Two balanced teams */}
        <div className="space-y-4">
          {/* Balanced Team 1 */}
          <div className="bg-neon-lime/10 backdrop-blur-sm rounded-xl p-4 border border-neon-lime/30">
            <div className="text-xs font-bold text-neon-lime mb-2">Team A</div>
            {[7, 6, 8, 5, 6].map((skill, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-neon-lime/30 flex items-center justify-center text-[10px] font-bold text-neon-lime">
                  {skill}
                </div>
                <div className="flex-1 h-1.5 bg-neon-lime/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neon-lime"
                    style={{ width: `${skill * 10}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-neon-lime/20 text-right">
              <span className="text-xl font-bold text-neon-lime">Σ 32</span>
            </div>
          </div>

          {/* Balanced Team 2 */}
          <div className="bg-neon-lime/10 backdrop-blur-sm rounded-xl p-4 border border-neon-lime/30">
            <div className="text-xs font-bold text-neon-lime mb-2">Team B</div>
            {[6, 7, 5, 7, 7].map((skill, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-neon-lime/30 flex items-center justify-center text-[10px] font-bold text-neon-lime">
                  {skill}
                </div>
                <div className="flex-1 h-1.5 bg-neon-lime/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neon-lime"
                    style={{ width: `${skill * 10}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-neon-lime/20 text-right">
              <span className="text-xl font-bold text-neon-lime">Σ 32</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <span className="text-2xl font-bold text-neon-lime">5:4</span>
          <p className="text-xs text-neon-lime/60 mt-1">Spannung bis zur letzten Minute</p>
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
    let isMounted = true

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!isMounted) return

      if (currentUser) {
        setUser(currentUser)
        setUserEmail(currentUser.email || '')

        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
          if (isMounted && userDoc.exists()) {
            setDisplayName(userDoc.data().displayName || '')
          }
        } catch (error) {
          if (isMounted) {
            console.error('Error loading display name:', error)
          }
        }

        currentUser.getIdTokenResult().then((idTokenResult) => {
          if (isMounted) {
            setIsAdmin(idTokenResult.claims.role === 'admin')
          }
        })
      } else {
        setUser(null)
        setUserEmail('')
        setDisplayName('')
        setIsAdmin(false)
      }

      if (isMounted) {
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
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
      {/* Header/Navigation - Mobile First with Burger Menu */}
      <header className="border-b border-mid-grey/20 backdrop-blur-md bg-white/80 dark:bg-card-dark/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between min-h-[64px]">
            {/* Logo - Left */}
            <Link href={user ? "/squads" : "/"} className="flex items-center gap-2 hover:opacity-80 transition-smooth">
              <div className="w-8 h-8 rounded-lg bg-neon-lime flex items-center justify-center">
                <Users className="w-5 h-5 text-deep-petrol" strokeWidth={2} />
              </div>
              <h1 className="text-xl font-headline font-bold text-deep-petrol dark:text-soft-mint">
                CoachBase
              </h1>
            </Link>

            {/* Right Side Actions */}
            {!loading && (
              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    {/* Burger Menu Button */}
                    <button
                      onClick={() => setShowMenu(true)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-deep-petrol transition-smooth"
                      aria-label="Menü öffnen"
                    >
                      <Menu className="w-6 h-6 text-deep-petrol dark:text-soft-mint" strokeWidth={2} />
                      <span className="hidden md:inline text-sm font-medium text-deep-petrol dark:text-soft-mint">
                        Menü
                      </span>
                    </button>

                    {/* Mobile Menu Portal */}
                    <MobileMenu
                      isOpen={showMenu}
                      onClose={() => setShowMenu(false)}
                      displayName={displayName}
                      userEmail={userEmail}
                      isAdmin={isAdmin}
                    />
                  </>
                ) : (
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
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - Clean & Minimal */}
      <section className="relative bg-deep-petrol overflow-hidden min-h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #BEF264 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <PageLayout className="relative z-10 w-full">
          <div className="text-center flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12 md:py-20">
            {/* Pre-Headline */}
            <div className="inline-block px-4 py-1.5 rounded-full border border-neon-lime/30 bg-neon-lime/10 mb-8">
              <span className="text-sm font-medium text-neon-lime uppercase tracking-wide">
                Für Trainer & Coaches
              </span>
            </div>

            {/* Icon - Shield for Fairness/Protection */}
            <div className="mb-12 flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-neon-lime/20 border-2 border-neon-lime/60 flex items-center justify-center backdrop-blur-sm">
                  <Shield className="w-12 h-12 md:w-16 md:h-16 text-neon-lime" strokeWidth={1.5} />
                </div>
                {/* Sparkle effect */}
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-neon-lime flex items-center justify-center animate-pulse">
                  <Sparkles className="w-4 h-4 text-deep-petrol" strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Main Headline - Updated */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold text-soft-mint mb-8 leading-tight max-w-5xl">
              Schluss mit der Wahl-Diskussion.<br />
              <span className="text-neon-lime">Faire Teams auf Klick.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl lg:text-2xl text-soft-mint/80 mb-12 leading-relaxed max-w-3xl mx-auto">
              Keiner will wählen. Keiner will der Letzte sein.<br className="hidden md:block" />
              Unser KI-Algorithmus macht Teams transparent, fair und in Sekunden.
            </p>

            {/* CTA */}
            <Link href="/login">
              <Button
                variant="primary"
                size="lg"
                className="gap-3 text-base md:text-lg px-8 md:px-10 py-4 md:py-6 text-deep-petrol font-bold"
              >
                Jetzt kostenlos starten
                <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
              </Button>
            </Link>
          </div>
        </PageLayout>
      </section>

      {/* How It Works - Technology Section */}
      <section className="bg-gradient-to-b from-deep-petrol to-deep-petrol/90 border-t border-neon-lime/10">
        <PageLayout>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-lime/20 border border-neon-lime/30 mb-6">
              <Zap className="w-5 h-5 text-neon-lime" />
              <span className="text-sm font-bold text-neon-lime uppercase">Fortschrittliche Technologie</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-soft-mint mb-4">
              So einfach funktionierts
            </h2>
            <p className="text-xl text-soft-mint/70 max-w-2xl mx-auto">
              Drei Schritte zu perfekt balancierten Teams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Step 1 */}
            <div className="relative z-10">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-neon-lime flex items-center justify-center z-20">
                <span className="text-2xl font-bold text-deep-petrol">1</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-neon-lime/20 h-full relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-neon-lime/20 flex items-center justify-center mb-6 mx-auto">
                  <Users className="w-8 h-8 text-neon-lime" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-headline font-bold text-soft-mint mb-3 text-center">
                  Spieler eintragen
                </h3>
                <p className="text-soft-mint/70 leading-relaxed text-center">
                  Bewerte Technik, Fitness & Spielverständnis (1-10).
                  Optional: Wähle Positionen (Torhüter, Abwehr, Mittelfeld, Angriff).
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-neon-lime flex items-center justify-center z-20">
                <span className="text-2xl font-bold text-deep-petrol">2</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-neon-lime/20 h-full relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-neon-lime/20 flex items-center justify-center mb-6 mx-auto">
                  <Sparkles className="w-8 h-8 text-neon-lime" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-headline font-bold text-soft-mint mb-3 text-center">
                  KI-Algorithmus arbeitet
                </h3>
                <p className="text-soft-mint/70 leading-relaxed text-center">
                  Unser 3-Phasen-Algorithmus analysiert alle Spieler und optimiert
                  die Teamaufteilung nach Skill, Position und Balance.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-neon-lime flex items-center justify-center z-20">
                <span className="text-2xl font-bold text-deep-petrol">3</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-neon-lime/20 h-full relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-neon-lime/20 flex items-center justify-center mb-6 mx-auto">
                  <Trophy className="w-8 h-8 text-neon-lime" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-headline font-bold text-soft-mint mb-3 text-center">
                  Fertig!
                </h3>
                <p className="text-soft-mint/70 leading-relaxed text-center">
                  Zwei perfekt ausbalancierte Teams. Minimaler Skill-Gap.
                  Jedes Match wird spannend – von der ersten bis zur letzten Minute.
                </p>
              </div>
            </div>
          </div>

          {/* Algorithm Details */}
          <div className="bg-neon-lime/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-neon-lime/30">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-headline font-bold text-neon-lime mb-3">
                Advanced Team Generator v2.1
              </h3>
              <p className="text-soft-mint/80 max-w-2xl mx-auto">
                Unser proprietärer Algorithmus berücksichtigt <strong className="text-neon-lime">8 verschiedene Faktoren</strong>
                für optimale Teambalance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Target, label: 'Skill-Balance', desc: 'Minimiert Stärke-Unterschiede' },
                { icon: MapPin, label: 'Positions-Tiefe', desc: 'Min. 2 Abwehr, 2 Mittelfeld' },
                { icon: TrendingUp, label: 'Stärke-Level', desc: 'Gleichmäßige Stars-Verteilung' },
                { icon: Users, label: 'Position-Präferenz', desc: 'Erste Pos = Hauptposition' },
              ].map((item, i) => (
                <div key={i} className="bg-deep-petrol/40 rounded-xl p-4 text-center">
                  <item.icon className="w-8 h-8 text-neon-lime mx-auto mb-2" strokeWidth={1.5} />
                  <div className="text-sm font-bold text-neon-lime mb-1">{item.label}</div>
                  <div className="text-xs text-soft-mint/60">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </PageLayout>
      </section>

      {/* Key Features - Priorisiert */}
      <section className="bg-soft-mint dark:bg-deep-petrol/80">
        <PageLayout>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-4">
              Alles was du als Trainer brauchst
            </h2>
            <p className="text-xl text-mid-grey max-w-2xl mx-auto">
              Entwickelt mit und für Trainer. Einfach, schnell, effektiv.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1: Fair Teams */}
            <div className="bg-white dark:bg-card-dark rounded-2xl p-8 border border-mid-grey/20 hover:border-neon-lime/50 transition-smooth">
              <div className="w-14 h-14 rounded-2xl bg-neon-lime/20 flex items-center justify-center mb-6">
                <Scale className="w-8 h-8 text-neon-lime" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-3">
                Garantiert faire Teams
              </h3>
              <p className="text-mid-grey leading-relaxed mb-4">
                Schluss mit 8:1 Ergebnissen. Unser Algorithmus sorgt für ausgeglichene Matches,
                bei denen alle Spaß haben – nicht nur die Gewinner.
              </p>
              <div className="flex items-center gap-2 text-neon-lime text-sm font-medium">
                <Check className="w-4 h-4" strokeWidth={2} />
                Minimaler Skill-Gap zwischen Teams
              </div>
            </div>

            {/* Feature 2: Time Saving */}
            <div className="bg-white dark:bg-card-dark rounded-2xl p-8 border border-mid-grey/20 hover:border-digital-orange/50 transition-smooth">
              <div className="w-14 h-14 rounded-2xl bg-digital-orange/20 flex items-center justify-center mb-6">
                <Timer className="w-8 h-8 text-digital-orange" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-3">
                Spart wertvolle Trainingszeit
              </h3>
              <p className="text-mid-grey leading-relaxed mb-4">
                Keine 10 Minuten mehr beim Wählen verlieren. Teams sind in 3 Sekunden fertig.
                Mehr Zeit fürs Spielen, weniger für Organisation.
              </p>
              <div className="flex items-center gap-2 text-digital-orange text-sm font-medium">
                <Check className="w-4 h-4" strokeWidth={2} />
                Von 10 Minuten auf 3 Sekunden
              </div>
            </div>

            {/* Feature 3: Position-Based */}
            <div className="bg-white dark:bg-card-dark rounded-2xl p-8 border border-mid-grey/20 hover:border-neon-lime/50 transition-smooth">
              <div className="w-14 h-14 rounded-2xl bg-neon-lime/20 flex items-center justify-center mb-6">
                <MapPin className="w-8 h-8 text-neon-lime" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-3">
                Positionsbasierte Aufteilung
              </h3>
              <p className="text-mid-grey leading-relaxed mb-4">
                Sorgt automatisch für genug Abwehrspieler, Mittelfeldspieler und Stürmer in jedem Team.
                Keine unbalancierten Formationen mehr.
              </p>
              <div className="flex items-center gap-2 text-neon-lime text-sm font-medium">
                <Check className="w-4 h-4" strokeWidth={2} />
                Min. 2 Abwehr, 2 Mittelfeld, 1 Angriff
              </div>
            </div>

            {/* Feature 4: Digital Management */}
            <div className="bg-white dark:bg-card-dark rounded-2xl p-8 border border-mid-grey/20 hover:border-digital-orange/50 transition-smooth">
              <div className="w-14 h-14 rounded-2xl bg-digital-orange/20 flex items-center justify-center mb-6">
                <Smartphone className="w-8 h-8 text-digital-orange" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-3">
                Alles digital verwalten
              </h3>
              <p className="text-mid-grey leading-relaxed mb-4">
                Keine Zettelwirtschaft mehr. Alle Spieler, Skills und Ergebnisse immer dabei.
                CSV-Import für schnelles Setup verfügbar.
              </p>
              <div className="flex items-center gap-2 text-digital-orange text-sm font-medium">
                <Check className="w-4 h-4" strokeWidth={2} />
                Spielerdaten immer griffbereit
              </div>
            </div>
          </div>
        </PageLayout>
      </section>

      {/* Social Proof / Stats */}
      <section className="bg-deep-petrol border-y border-neon-lime/10">
        <PageLayout>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-neon-lime mb-2">3 Sek</div>
              <div className="text-soft-mint/70">Durchschnittliche Generierungszeit</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-neon-lime mb-2">8+</div>
              <div className="text-soft-mint/70">Balance-Faktoren im Algorithmus</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-neon-lime mb-2">100%</div>
              <div className="text-soft-mint/70">Kostenlos • Keine versteckten Kosten</div>
            </div>
          </div>
        </PageLayout>
      </section>

      {/* FAQ Section */}
      <section className="bg-soft-mint dark:bg-deep-petrol">
        <PageLayout>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-4">
                Häufige Fragen
              </h2>
              <p className="text-xl text-mid-grey">
                Alles was du wissen musst
              </p>
            </div>

            <div className="bg-white dark:bg-card-dark rounded-2xl p-8 border border-mid-grey/20">
              <FAQItem
                question="Wie funktioniert der Algorithmus?"
                answer="Unser Advanced Team Generator v2.1 verwendet einen 3-Phasen-Ansatz: 1) Torhüter-Verteilung, 2) Snake-Draft für initiale Balance, 3) Swap-Optimierung zur Minimierung des Skill-Gaps. Er berücksichtigt 8 Faktoren: Skill-Balance, Positions-Tiefe, Stärke-Level-Verteilung, Position-Präferenz und mehr."
              />
              <FAQItem
                question="Muss ich technische Kenntnisse haben?"
                answer="Nein, überhaupt nicht. Die App ist speziell für Trainer entwickelt, die sich auf das Coaching konzentrieren wollen, nicht auf Technologie. Spieler eintragen, Bewertungen vergeben, Teams generieren – fertig."
              />
              <FAQItem
                question="Kann ich Spielerpositionen festlegen?"
                answer="Ja! Du kannst für jeden Spieler mehrere Positionen wählen (Torhüter, Abwehr, Mittelfeld, Angriff). Die erste gewählte Position gilt als Hauptposition. Der Algorithmus sorgt automatisch für ausreichend Spieler pro Position in jedem Team."
              />
              <FAQItem
                question="Kostet die App etwas?"
                answer="CoachBase ist 100% kostenlos. Keine versteckten Kosten, keine Premium-Features, keine Kreditkarte erforderlich. Wir glauben, dass faire Teams für alle Trainer zugänglich sein sollten."
              />
              <FAQItem
                question="Wie schnell kann ich starten?"
                answer="In 2 Minuten bist du startklar: Anmelden, Team erstellen, erste Spieler eintragen – fertig. Optional kannst du auch eine CSV-Datei mit all deinen Spielern hochladen für noch schnelleres Setup."
              />
              <FAQItem
                question="Werden meine Daten gespeichert?"
                answer="Ja, alle Spielerdaten, Teams und Match-Ergebnisse werden sicher in der Cloud gespeichert. Du kannst von jedem Gerät darauf zugreifen. Deine Daten gehören dir und werden niemals weitergegeben."
              />
            </div>
          </div>
        </PageLayout>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-b from-deep-petrol to-deep-petrol/90">
        <PageLayout>
          <div className="text-center py-16">
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-soft-mint mb-6">
              Bereit für faire Teams?
            </h2>
            <p className="text-xl text-soft-mint/70 mb-8 max-w-2xl mx-auto">
              Schließe dich Trainern an, die ihre Trainingszeit für das Wesentliche nutzen: <br />
              <span className="text-neon-lime font-bold">Guten Fußball spielen.</span>
            </p>
            <Link href="/login">
              <Button
                variant="primary"
                size="lg"
                className="gap-3 text-lg px-8"
              >
                Jetzt kostenlos starten
                <ArrowRight className="w-5 h-5" strokeWidth={2} />
              </Button>
            </Link>
            <p className="text-sm text-soft-mint/60 mt-6">
              Keine Anmeldung zum Testen nötig • Setup in unter 2 Minuten
            </p>
          </div>
        </PageLayout>
      </section>

      <LandingFooter />
    </div>
  )
}
