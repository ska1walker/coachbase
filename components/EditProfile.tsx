'use client'

import { useState } from 'react'
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { X, Save, AlertCircle } from 'lucide-react'
import {
  validateDisplayName,
  validateClubOrLocation,
  validateBio,
  sanitizeProfileData,
} from '@/lib/validation'

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
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSave = async () => {
    const user = auth.currentUser
    if (!user) return

    // Validate all inputs
    const validationErrors: Record<string, string> = {}

    const nameValidation = validateDisplayName(displayName)
    if (!nameValidation.valid && displayName) {
      validationErrors.displayName = nameValidation.error!
    }

    const clubValidation = validateClubOrLocation(clubName)
    if (!clubValidation.valid && clubName) {
      validationErrors.clubName = clubValidation.error!
    }

    const locationValidation = validateClubOrLocation(location)
    if (!locationValidation.valid && location) {
      validationErrors.location = locationValidation.error!
    }

    const bioValidation = validateBio(bio)
    if (!bioValidation.valid && bio) {
      validationErrors.bio = bioValidation.error!
    }

    // Show errors if validation failed
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({}) // Clear errors
    setSaving(true)
    try {
      const userRef = doc(db, 'users', user.uid)

      // Sanitize all inputs before saving
      const sanitized = sanitizeProfileData({
        displayName,
        clubName,
        location,
        bio,
      })

      // Check if document exists first
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        // Create the document if it doesn't exist
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          role: 'user',
          createdAt: new Date(),
          displayName: sanitized.displayName || null,
          clubName: sanitized.clubName || null,
          location: sanitized.location || null,
          bio: sanitized.bio || null,
          showInLeaderboard: showInLeaderboard,
        })
      } else {
        // Update existing document
        await updateDoc(userRef, {
          displayName: sanitized.displayName || null,
          clubName: sanitized.clubName || null,
          location: sanitized.location || null,
          bio: sanitized.bio || null,
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
            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-300 mb-2">
                      Bitte korrigiere folgende Fehler:
                    </p>
                    <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Display Name */}
            <div>
              <Input
                label="Anzeigename"
                type="text"
                placeholder="z.B. Max Mustermann"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value)
                  if (errors.displayName) {
                    setErrors((prev) => {
                      const newErrors = { ...prev }
                      delete newErrors.displayName
                      return newErrors
                    })
                  }
                }}
                helpText="Dein öffentlicher Name in der App (max. 50 Zeichen)"
              />
              {errors.displayName && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.displayName}
                </p>
              )}
            </div>

            {/* Club Name */}
            <div>
              <Input
                label="Verein / Club"
                type="text"
                placeholder="z.B. FC Musterstadt"
                value={clubName}
                onChange={(e) => {
                  setClubName(e.target.value)
                  if (errors.clubName) {
                    const newErrors = { ...errors }
                    delete newErrors.clubName
                    setErrors(newErrors)
                  }
                }}
                helpText="Name deines Vereins oder Clubs (max. 100 Zeichen)"
              />
              {errors.clubName && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.clubName}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <Input
                label="Ort"
                type="text"
                placeholder="z.B. München"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value)
                  if (errors.location) {
                    const newErrors = { ...errors }
                    delete newErrors.location
                    setErrors(newErrors)
                  }
                }}
                helpText="Stadt oder Region (max. 100 Zeichen)"
              />
              {errors.location && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.location}
                </p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-deep-petrol dark:text-soft-mint mb-2">
                Bio / Über mich
              </label>
              <textarea
                className={`w-full px-4 py-3 rounded-lg bg-white dark:bg-card-dark border-2 ${
                  errors.bio
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-mid-grey/30 focus:border-neon-lime'
                } focus:outline-none transition-smooth resize-none`}
                rows={4}
                placeholder="Erzähle etwas über dich..."
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value)
                  if (errors.bio) {
                    const newErrors = { ...errors }
                    delete newErrors.bio
                    setErrors(newErrors)
                  }
                }}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-mid-grey">
                  {bio.length}/500 Zeichen
                </p>
                {errors.bio && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.bio}
                  </p>
                )}
              </div>
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
