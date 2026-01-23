import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import type { UserStats } from '@/lib/types'
import {
  getDefaultStats,
  updateStreak,
  checkAchievements,
  XP_REWARDS,
  calculateLevel,
} from '@/lib/gamification'
import { useLevelUp } from '@/contexts/LevelUpContext'

export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { triggerLevelUp } = useLevelUp()

  // Load stats from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStats(null)
        setLoading(false)
        return
      }

      try {
        const userRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          const userStats = userData.stats || getDefaultStats()

          // Update streak on load
          const updatedStats = updateStreak(userStats)

          // If streak changed, save it
          if (
            updatedStats.currentStreak !== userStats.currentStreak ||
            updatedStats.lastActiveDate !== userStats.lastActiveDate
          ) {
            try {
              const oldLevel = updatedStats.level

              await updateDoc(userRef, {
                stats: updatedStats,
                lastActive: new Date(),
              })

              // Add daily login XP
              const newXP = updatedStats.xp + XP_REWARDS.DAILY_LOGIN
              const newLevel = calculateLevel(newXP).level
              updatedStats.xp = newXP
              updatedStats.level = newLevel

              await updateDoc(userRef, {
                'stats.xp': newXP,
                'stats.level': newLevel,
              })

              // Trigger confetti if level changed
              if (newLevel > oldLevel) {
                triggerLevelUp(newLevel)
              }
            } catch (updateError) {
              console.error('Error updating stats:', updateError)
              // Continue with existing stats even if update fails
            }
          }

          setStats(updatedStats)
        } else {
          // Create default stats with user document
          const defaultStats = getDefaultStats()
          try {
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              role: 'user',
              createdAt: new Date(),
              stats: defaultStats,
              lastActive: new Date(),
            })
            setStats(defaultStats)
          } catch (createError) {
            console.error('Error creating user document:', createError)
            // Use default stats even if creation fails
            setStats(defaultStats)
          }
        }
      } catch (error) {
        console.error('Error loading stats:', error)
        setStats(getDefaultStats())
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  // Track squad created
  const trackSquadCreated = async () => {
    const user = auth.currentUser
    if (!user || !stats) return

    try {
      const oldLevel = stats.level
      const newXP = stats.xp + XP_REWARDS.SQUAD_CREATED
      const newLevel = calculateLevel(newXP).level
      const newSquadCount = stats.squadsCreated + 1

      const updatedStats: UserStats = {
        ...stats,
        squadsCreated: newSquadCount,
        xp: newXP,
        level: newLevel,
      }

      // Check for new achievements
      const newAchievements = checkAchievements(updatedStats)
      if (newAchievements.length > 0) {
        updatedStats.achievements = [...stats.achievements, ...newAchievements]
        updatedStats.xp += newAchievements.length * XP_REWARDS.ACHIEVEMENT_UNLOCKED
        updatedStats.level = calculateLevel(updatedStats.xp).level
      }

      await updateDoc(doc(db, 'users', user.uid), {
        stats: updatedStats,
      })

      setStats(updatedStats)

      // Trigger confetti if level changed
      if (updatedStats.level > oldLevel) {
        triggerLevelUp(updatedStats.level)
      }

      return newAchievements
    } catch (error) {
      console.error('Error tracking squad created:', error)
    }
  }

  // Track player added
  const trackPlayerAdded = async () => {
    const user = auth.currentUser
    if (!user || !stats) return

    try {
      const oldLevel = stats.level
      const newXP = stats.xp + XP_REWARDS.PLAYER_ADDED
      const newLevel = calculateLevel(newXP).level
      const newPlayerCount = stats.playersAdded + 1

      const updatedStats: UserStats = {
        ...stats,
        playersAdded: newPlayerCount,
        xp: newXP,
        level: newLevel,
      }

      // Check for new achievements
      const newAchievements = checkAchievements(updatedStats)
      if (newAchievements.length > 0) {
        updatedStats.achievements = [...stats.achievements, ...newAchievements]
        updatedStats.xp += newAchievements.length * XP_REWARDS.ACHIEVEMENT_UNLOCKED
        updatedStats.level = calculateLevel(updatedStats.xp).level
      }

      await updateDoc(doc(db, 'users', user.uid), {
        stats: updatedStats,
      })

      setStats(updatedStats)

      // Trigger confetti if level changed
      if (updatedStats.level > oldLevel) {
        triggerLevelUp(updatedStats.level)
      }

      return newAchievements
    } catch (error) {
      console.error('Error tracking player added:', error)
    }
  }

  // Track team generated
  const trackTeamGenerated = async () => {
    const user = auth.currentUser
    if (!user || !stats) return

    try {
      const oldLevel = stats.level
      const newXP = stats.xp + XP_REWARDS.TEAM_GENERATED
      const newLevel = calculateLevel(newXP).level
      const newTeamCount = stats.teamsGenerated + 1

      const updatedStats: UserStats = {
        ...stats,
        teamsGenerated: newTeamCount,
        xp: newXP,
        level: newLevel,
      }

      // Check for new achievements
      const newAchievements = checkAchievements(updatedStats)
      if (newAchievements.length > 0) {
        updatedStats.achievements = [...stats.achievements, ...newAchievements]
        updatedStats.xp += newAchievements.length * XP_REWARDS.ACHIEVEMENT_UNLOCKED
        updatedStats.level = calculateLevel(updatedStats.xp).level
      }

      await updateDoc(doc(db, 'users', user.uid), {
        stats: updatedStats,
      })

      setStats(updatedStats)

      // Trigger confetti if level changed
      if (updatedStats.level > oldLevel) {
        triggerLevelUp(updatedStats.level)
      }

      return newAchievements
    } catch (error) {
      console.error('Error tracking team generated:', error)
    }
  }

  return {
    stats,
    loading,
    trackSquadCreated,
    trackPlayerAdded,
    trackTeamGenerated,
  }
}
