'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/squads')
    } catch (err: any) {
      setError(err.code === 'auth/invalid-credential'
        ? 'E-Mail oder Passwort falsch'
        : 'Anmeldung fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email || !password || !firstName || !lastName) {
      setError('Bitte fülle alle Felder aus')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein')
      setLoading(false)
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Create user document in Firestore with display name
      const displayName = `${firstName} ${lastName}`
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        displayName: displayName,
        firstName: firstName,
        lastName: lastName,
        role: 'user',
        createdAt: new Date(),
      })

      router.push('/squads')
    } catch (err: any) {
      setError(err.code === 'auth/email-already-in-use'
        ? 'E-Mail wird bereits verwendet'
        : 'Registrierung fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 halftone-bg">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-mid-grey hover:text-neon-lime transition-smooth mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Startseite
        </Link>

        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-h1-mobile md:text-h1-desktop font-headline mb-2">
            <span className="text-gradient">CoachBase</span>
          </h1>
          <p className="text-mid-grey text-sm uppercase tracking-label">
            {isRegister ? 'Account erstellen' : 'Anmelden'}
          </p>
        </div>

        <Card className="p-6 md:p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-digital-orange/10 border border-digital-orange text-digital-orange text-sm">
              {error}
            </div>
          )}

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
            {isRegister && (
              <>
                <Input
                  label="Vorname"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Max"
                  required
                  disabled={loading}
                />

                <Input
                  label="Nachname"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Mustermann"
                  required
                  disabled={loading}
                />
              </>
            )}

            <Input
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.com"
              required
              disabled={loading}
            />

            <Input
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mindestens 6 Zeichen"
              required
              disabled={loading}
            />

            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
              >
                {isRegister ? (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    {loading ? 'Lädt...' : 'Account erstellen'}
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    {loading ? 'Lädt...' : 'Anmelden'}
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister)
                  setError('')
                  setFirstName('')
                  setLastName('')
                }}
                className="w-full text-sm text-mid-grey hover:text-neon-lime transition-smooth"
              >
                {isRegister
                  ? 'Bereits registriert? Jetzt anmelden'
                  : 'Noch kein Account? Jetzt registrieren'}
              </button>
            </div>
          </form>
        </Card>

        {/* Footer Info */}
        <p className="text-center text-xs text-mid-grey mt-6">
          Automatisierte und faire Teamaufteilung
        </p>
      </div>
    </div>
  )
}
