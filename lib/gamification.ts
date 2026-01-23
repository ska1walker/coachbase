import type { Achievement, LevelInfo, UserStats } from './types'

// Achievement Definitions
export const ACHIEVEMENTS: Record<string, Omit<Achievement, 'unlocked' | 'unlockedAt'>> = {
  FIRST_SQUAD: {
    id: 'FIRST_SQUAD',
    title: 'Erstes Team',
    description: 'Dein erstes Team erstellt',
    icon: '🎯',
    requirement: 1,
    category: 'squads',
  },
  SQUAD_MASTER: {
    id: 'SQUAD_MASTER',
    title: 'Team-Meister',
    description: '5 Teams erstellt',
    icon: '👑',
    requirement: 5,
    category: 'squads',
  },
  FIRST_10_PLAYERS: {
    id: 'FIRST_10_PLAYERS',
    title: 'Aufbauphase',
    description: '10 Spieler hinzugefügt',
    icon: '⚽',
    requirement: 10,
    category: 'players',
  },
  PLAYER_COLLECTOR: {
    id: 'PLAYER_COLLECTOR',
    title: 'Spieler-Sammler',
    description: '50 Spieler hinzugefügt',
    icon: '🏆',
    requirement: 50,
    category: 'players',
  },
  FIRST_GENERATION: {
    id: 'FIRST_GENERATION',
    title: 'Erste Teams',
    description: 'Erstes Mal Teams generiert',
    icon: '✨',
    requirement: 1,
    category: 'teams',
  },
  GENERATION_PRO: {
    id: 'GENERATION_PRO',
    title: 'Generations-Profi',
    icon: '🎪',
    description: '50 Teams generiert',
    requirement: 50,
    category: 'teams',
  },
  WEEK_STREAK: {
    id: 'WEEK_STREAK',
    title: 'Wochenkrieger',
    description: '7 Tage in Folge aktiv',
    icon: '🔥',
    requirement: 7,
    category: 'streak',
  },
  MONTH_STREAK: {
    id: 'MONTH_STREAK',
    title: 'Unaufhaltsam',
    description: '30 Tage in Folge aktiv',
    icon: '💪',
    requirement: 30,
    category: 'streak',
  },
  CO_TRAINER: {
    id: 'CO_TRAINER',
    title: 'Team-Builder',
    description: 'Ersten Co-Trainer eingeladen',
    icon: '🤝',
    requirement: 1,
    category: 'social',
  },
}

// Level System
export const LEVELS: LevelInfo[] = [
  { level: 1, title: 'Rookie Coach', minXP: 0, maxXP: 99, color: '#94A3B8' },
  { level: 2, title: 'Junior Coach', minXP: 100, maxXP: 299, color: '#60A5FA' },
  { level: 3, title: 'Erfahrener Coach', minXP: 300, maxXP: 599, color: '#A78BFA' },
  { level: 4, title: 'Pro Coach', minXP: 600, maxXP: 999, color: '#F472B6' },
  { level: 5, title: 'Elite Coach', minXP: 1000, maxXP: 1999, color: '#FBBF24' },
  { level: 6, title: 'Master Coach', minXP: 2000, maxXP: 9999, color: '#A3E635' },
  { level: 7, title: 'Legendary Coach', minXP: 10000, maxXP: Infinity, color: '#C7F94C' },
]

// XP Calculation
export const XP_REWARDS = {
  SQUAD_CREATED: 10,
  PLAYER_ADDED: 2,
  TEAM_GENERATED: 5,
  DAILY_LOGIN: 5,
  ACHIEVEMENT_UNLOCKED: 20,
  CO_TRAINER_INVITED: 15,
}

// Helper Functions
export function calculateLevel(xp: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      return LEVELS[i]
    }
  }
  return LEVELS[0]
}

export function getProgressToNextLevel(xp: number): number {
  const currentLevel = calculateLevel(xp)
  if (currentLevel.maxXP === Infinity) return 100

  const progress = ((xp - currentLevel.minXP) / (currentLevel.maxXP - currentLevel.minXP)) * 100
  return Math.min(Math.max(progress, 0), 100)
}

export function checkAchievements(stats: UserStats): string[] {
  const newAchievements: string[] = []

  // Check squad achievements
  if (stats.squadsCreated >= 1 && !stats.achievements.includes('FIRST_SQUAD')) {
    newAchievements.push('FIRST_SQUAD')
  }
  if (stats.squadsCreated >= 5 && !stats.achievements.includes('SQUAD_MASTER')) {
    newAchievements.push('SQUAD_MASTER')
  }

  // Check player achievements
  if (stats.playersAdded >= 10 && !stats.achievements.includes('FIRST_10_PLAYERS')) {
    newAchievements.push('FIRST_10_PLAYERS')
  }
  if (stats.playersAdded >= 50 && !stats.achievements.includes('PLAYER_COLLECTOR')) {
    newAchievements.push('PLAYER_COLLECTOR')
  }

  // Check team generation achievements
  if (stats.teamsGenerated >= 1 && !stats.achievements.includes('FIRST_GENERATION')) {
    newAchievements.push('FIRST_GENERATION')
  }
  if (stats.teamsGenerated >= 50 && !stats.achievements.includes('GENERATION_PRO')) {
    newAchievements.push('GENERATION_PRO')
  }

  // Check streak achievements
  if (stats.currentStreak >= 7 && !stats.achievements.includes('WEEK_STREAK')) {
    newAchievements.push('WEEK_STREAK')
  }
  if (stats.currentStreak >= 30 && !stats.achievements.includes('MONTH_STREAK')) {
    newAchievements.push('MONTH_STREAK')
  }

  return newAchievements
}

export function getDefaultStats(): UserStats {
  return {
    squadsCreated: 0,
    playersAdded: 0,
    teamsGenerated: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    xp: 0,
    achievements: [],
  }
}

export function updateStreak(stats: UserStats): UserStats {
  const today = new Date().toISOString().split('T')[0]
  const lastActive = stats.lastActiveDate

  if (!lastActive) {
    // First time active
    return {
      ...stats,
      currentStreak: 1,
      longestStreak: Math.max(1, stats.longestStreak),
      lastActiveDate: today,
    }
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (lastActive === today) {
    // Already active today, no change
    return stats
  } else if (lastActive === yesterdayStr) {
    // Consecutive day
    const newStreak = stats.currentStreak + 1
    return {
      ...stats,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, stats.longestStreak),
      lastActiveDate: today,
    }
  } else {
    // Streak broken
    return {
      ...stats,
      currentStreak: 1,
      lastActiveDate: today,
    }
  }
}
