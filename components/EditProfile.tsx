'use client'

import { useState } from 'react'
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { X, Save } from 'lucide-react'

interface EditProfileProps {
  currentProfile: {
    displayName?: string
    clubName?: string
    location?: string
    bio?: string
    showInLeaderboard?: boolean
  }
  onClose: () => void
  onSave: () => void
}

export function EditProfile({ currentProfile, onClose, onSave }: EditProfileProps) {
  const [displayName, setDisplayName] = useState(currentProfile.displayName || '')
  const [clubName, setClubName] = useState(currentProfile.clubName || '')
  const [location, setLocation] = useState(currentProfile.location || '')
  const [bio, setBio] = useState(currentProfile.bio || '')
  const [showInLeaderboard, setShowInLeaderboard] = useState(
    currentProfile.showInLeaderboard !== false // Default true
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const user = auth.currentUser
    if (!user) return

    setSaving(true)
    try {
      const userRef = doc(db, 'users', user.uid)

      // Check if document exists first
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        // Create the document if it doesn't exist
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          role: 'user',
          createdAt: new Date(),
          displayName: displayName.trim() || null,
          clubName: clubName.trim() || null,
          location: location.trim() || null,
          bio: bio.trim() || null,
          showInLeaderboard: showInLeaderboard,
        })
      } else {
        // Update existing document
        await updateDoc(userRef, {
          displayName: displayName.trim() || null,
          clubName: clubName.trim() || null,
          location: location.trim() || null,
          bio: bio.trim() || null,
          showInLeaderboard: showInLeaderboard,
        })
      }

      onSave()
      onClose()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      alert(`Fehler beim Speichern: ${error.message || 'Unbekannter Fehler'}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profil bearbeiten</CardTitle>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-card-dark transition-smooth"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Display Name */}
            <Input
              label="Anzeigename"
              type="text"
              placeholder="z.B. Max Mustermann"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              helpText="Dein öffentlicher Name in der App"
            />

            {/* Club Name */}
            <Input
              label="Verein / Club"
              type="text"
              placeholder="z.B. FC Musterstadt"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              helpText="Name deines Vereins oder Clubs"
            />

            {/* Location */}
            <Input
              label="Ort"
              type="text"
              placeholder="z.B. München"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              helpText="Stadt oder Region"
            />

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-deep-petrol dark:text-soft-mint mb-2">
                Bio / Über mich
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-card-dark border-2 border-mid-grey/30 focus:border-neon-lime focus:outline-none transition-smooth resize-none"
                rows={4}
                placeholder="Erzähle etwas über dich..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-mid-grey mt-1">
                {bio.length}/500 Zeichen
              </p>
            </div>

            {/* Privacy Settings */}
            <div className="pt-4 border-t border-mid-grey/20">
              <h3 className="text-sm font-medium text-deep-petrol dark:text-soft-mint mb-3">
                Datenschutz-Einstellungen
              </h3>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInLeaderboard}
                  onChange={(e) => setShowInLeaderboard(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-2 border-mid-grey/30 text-neon-lime focus:ring-neon-lime focus:ring-2 cursor-pointer"
                />
                <div>
                  <div className="text-sm font-medium text-deep-petrol dark:text-soft-mint">
                    In der Hall of Fame anzeigen
                  </div>
                  <p className="text-xs text-mid-grey mt-1">
                    Wenn aktiviert, erscheinst du in der öffentlichen Rangliste mit deinem Namen, Level und Statistiken.
                  </p>
                </div>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                fullWidth
                className="flex items-center gap-2 justify-center"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Speichert...' : 'Speichern'}
              </Button>
              <Button variant="secondary" onClick={onClose} fullWidth>
                Abbrechen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
