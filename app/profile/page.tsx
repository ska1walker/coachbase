'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AuthGuard } from '@/components/AuthGuard'
import { AppHeader } from '@/components/AppHeader'
import { PageLayout } from '@/components/PageLayout'
import { User, Mail, LogOut, Shield, TrendingUp, Award, Flame, Zap, Target, Edit, MapPin, Building2 } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { useUserStats } from '@/hooks/useUserStats'
import { calculateLevel, getProgressToNextLevel, ACHIEVEMENTS, LEVELS } from '@/lib/gamification'
import { EditProfile } from '@/components/EditProfile'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

function ProfileContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [profile, setProfile] = useState<{
    displayName?: string
    clubName?: string
    location?: string
    bio?: string
    showInLeaderboard?: boolean
  }>({})
  const { stats, loading: statsLoading } = useUserStats()

  const loadProfile = async () => {
    const user = auth.currentUser
    if (!user) return

    setUserEmail(user.email || '')

    // Check admin status
    const idTokenResult = await user.getIdTokenResult()
    setIsAdmin(idTokenResult.claims.role === 'admin')

    // Load profile data
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        setProfile({
          displayName: data.displayName,
          clubName: data.clubName,
          location: data.location,
          bio: data.bio,
          showInLeaderboard: data.showInLeaderboard,
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadProfile()
  }, [router])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-mint dark:bg-deep-petrol flex items-center justify-center">
        <p className="text-mid-grey">Lädt...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-soft-mint dark:bg-deep-petrol pb-20 md:pb-8">
      <AppHeader />
      <PageLayout maxWidth="2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-2">
            Profil
          </h1>
          <p className="text-mid-grey">
            Deine Account-Einstellungen
          </p>
        </div>

        {/* Profile Info */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Mein Profil</CardTitle>
            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-card-dark transition-smooth"
              title="Profil bearbeiten"
            >
              <Edit className="w-5 h-5 text-neon-lime" />
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar & Display Name */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-neon-lime/20 flex items-center justify-center">
                <User className="w-10 h-10 text-neon-lime" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-deep-petrol dark:text-soft-mint">
                  {profile.displayName || userEmail.split('@')[0]}
                </h3>
                {profile.clubName && (
                  <div className="flex items-center gap-2 text-sm text-mid-grey mt-1">
                    <Building2 className="w-4 h-4" />
                    {profile.clubName}
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-2 text-sm text-mid-grey mt-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="p-4 rounded-lg bg-soft-mint/50 dark:bg-card-dark">
                <p className="text-sm text-deep-petrol dark:text-soft-mint leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Email */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-soft-mint/50 dark:bg-card-dark">
              <Mail className="w-5 h-5 text-mid-grey" />
              <div>
                <p className="text-xs text-mid-grey uppercase tracking-label">Email</p>
                <p className="text-deep-petrol dark:text-soft-mint">{userEmail}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-soft-mint/50 dark:bg-card-dark">
              <Shield className="w-5 h-5 text-mid-grey" />
              <div>
                <p className="text-xs text-mid-grey uppercase tracking-label">Rolle</p>
                <p className="text-deep-petrol dark:text-soft-mint">
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-neon-lime"></span>
                      Administrator
                    </span>
                  ) : (
                    'Coach'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        {statsLoading && (
          <Card className="mb-6">
            <CardContent className="py-8 text-center text-mid-grey">
              Lade Statistiken...
            </CardContent>
          </Card>
        )}

        {!statsLoading && !stats && (
          <Card className="mb-6">
            <CardContent className="py-8 text-center text-mid-grey">
              Keine Statistiken gefunden. Erstelle dein erstes Team!
            </CardContent>
          </Card>
        )}

        {/* Gamification Dashboard */}
        {!statsLoading && stats && (
          <>
            {/* Level & XP Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-neon-lime" />
                  Level & Fortschritt
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const currentLevel = calculateLevel(stats.xp)
                  const progress = getProgressToNextLevel(stats.xp)
                  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1)

                  return (
                    <div className="space-y-4">
                      {/* Level Badge */}
                      <div className="flex items-center gap-4">
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                          style={{ backgroundColor: currentLevel.color }}
                        >
                          {stats.level}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-deep-petrol dark:text-soft-mint">
                            {currentLevel.title}
                          </h3>
                          <p className="text-sm text-mid-grey">{stats.xp} XP</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {nextLevel && (
                        <div>
                          <div className="flex justify-between text-xs text-mid-grey mb-1">
                            <span>Level {currentLevel.level}</span>
                            <span>Level {nextLevel.level}</span>
                          </div>
                          <div className="w-full h-3 bg-mid-grey/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-neon-lime to-digital-orange transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-mid-grey mt-1 text-center">
                            {nextLevel.minXP - stats.xp} XP bis zum nächsten Level
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Streak */}
              <Card>
                <CardContent className="p-4 text-center">
                  <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold text-deep-petrol dark:text-soft-mint">
                    {stats.currentStreak}
                  </p>
                  <p className="text-xs text-mid-grey">Tage Streak</p>
                </CardContent>
              </Card>

              {/* Teams */}
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="w-8 h-8 mx-auto mb-2 text-neon-lime" />
                  <p className="text-2xl font-bold text-deep-petrol dark:text-soft-mint">
                    {stats.squadsCreated}
                  </p>
                  <p className="text-xs text-mid-grey">Teams</p>
                </CardContent>
              </Card>

              {/* Players */}
              <Card>
                <CardContent className="p-4 text-center">
                  <User className="w-8 h-8 mx-auto mb-2 text-digital-orange" />
                  <p className="text-2xl font-bold text-deep-petrol dark:text-soft-mint">
                    {stats.playersAdded}
                  </p>
                  <p className="text-xs text-mid-grey">Spieler</p>
                </CardContent>
              </Card>

              {/* Generations */}
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-neon-lime" />
                  <p className="text-2xl font-bold text-deep-petrol dark:text-soft-mint">
                    {stats.teamsGenerated}
                  </p>
                  <p className="text-xs text-mid-grey">Generiert</p>
                </CardContent>
              </Card>
            </div>

            {/* Achievements */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-neon-lime" />
                  Achievements ({stats.achievements.length}/{Object.keys(ACHIEVEMENTS).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.values(ACHIEVEMENTS).map((achievement) => {
                    const unlocked = stats.achievements.includes(achievement.id)
                    return (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-lg border-2 transition-smooth ${
                          unlocked
                            ? 'bg-neon-lime/10 border-neon-lime'
                            : 'bg-mid-grey/5 border-mid-grey/20 opacity-50'
                        }`}
                      >
                        <div className="text-3xl mb-2">{achievement.icon}</div>
                        <h4 className="font-bold text-sm text-deep-petrol dark:text-soft-mint mb-1">
                          {achievement.title}
                        </h4>
                        <p className="text-xs text-mid-grey">{achievement.description}</p>
                        {!unlocked && (
                          <p className="text-xs text-neon-lime mt-2">
                            {achievement.requirement} {achievement.category === 'squads' && 'Teams'}
                            {achievement.category === 'players' && 'Spieler'}
                            {achievement.category === 'teams' && 'generiert'}
                            {achievement.category === 'streak' && 'Tage'}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Quick Links */}
        {isAdmin && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Admin-Bereich</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => router.push('/admin')}
              >
                Zum Admin Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Logout */}
        <Card>
          <CardContent className="p-6">
            <Button
              variant="danger"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Abmelden
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="mt-8 text-center text-sm text-mid-grey">
          <p>CoachBase v1.0</p>
          <p className="mt-1">Faire Teams auf Knopfdruck</p>
        </div>
      </PageLayout>

      <BottomNav />

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfile
          currentProfile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={loadProfile}
        />
      )}
    </div>
  )
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  )
}
