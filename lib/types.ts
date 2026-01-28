import { Timestamp } from 'firebase/firestore'

// User Types
export type UserRole = 'admin' | 'user'

export interface User {
  uid: string
  email: string
  role: UserRole
  createdAt: Timestamp
  stats?: UserStats
  lastActive?: Timestamp
  // Profile fields
  displayName?: string
  clubName?: string
  location?: string
  bio?: string
  avatarUrl?: string
  // Privacy settings
  showInLeaderboard?: boolean // Default true - opt-in for Hall of Fame
}

// Squad Types
export interface Squad {
  id: string
  ownerId: string
  coTrainerIds?: string[] // UIDs of co-trainers with read-only + team generation rights
  name: string
  createdAt: Timestamp
}

// Player Types (Updated with squadId reference)
export type PlayerPosition = 'Torhüter' | 'Abwehr' | 'Mittelfeld' | 'Angriff'

export interface Player {
  id: string
  squadId: string
  name: string
  technik: number
  fitness: number
  spielverstaendnis: number
  total: number
  positions?: PlayerPosition[] // Multiple positions possible
  attributes?: Record<string, any> // Optional for future extensions
  createdAt?: string
}

// Match History Types
export interface TeamResult {
  teamNumber: number
  teamName?: string // e.g. "Team A", "Team B"
  players: Player[]
  totalStrength: number
  averageStrength: number
}

export interface MatchResult {
  scores: number[] // Array of scores, index corresponds to team index
  savedAt?: Timestamp
}

export interface MatchHistory {
  id: string
  squadId: string
  ownerId: string
  date: Timestamp
  teams: TeamResult[]
  teamCount: number
  playerCount: number
  leibchenTeamIndex?: number // Which team had bibs
  result?: MatchResult // Optional: filled when user enters match result
  liked?: boolean
  createdAt: Timestamp
}

// Cloud Function Types
export interface GenerateTeamsRequest {
  squadId: string
  playerIds: string[]
  teamCount: number
}

export interface GenerateTeamsResponse {
  success: boolean
  teams: TeamResult[]
  matchHistoryId?: string
  error?: string
}

export interface AdminResetPasswordRequest {
  targetUid: string
  newPassword: string
}

export interface AdminResetPasswordResponse {
  success: boolean
  message: string
  error?: string
}

// Co-Trainer Invite Types
export interface SquadInvite {
  id: string
  token: string
  squadId: string
  squadName: string
  createdBy: string // UID of the owner who created the invite
  createdByEmail: string
  createdAt: Timestamp
  expiresAt: Timestamp
  used: boolean
  usedBy?: string // UID of the user who accepted the invite
  usedAt?: Timestamp
}

export interface AcceptInviteRequest {
  token: string
}

export interface AcceptInviteResponse {
  success: boolean
  squadId?: string
  squadName?: string
  message?: string
  error?: string
}

// Gamification Types
export interface UserStats {
  squadsCreated: number
  playersAdded: number
  teamsGenerated: number
  currentStreak: number
  longestStreak: number
  lastActiveDate?: string // YYYY-MM-DD format
  level: number
  xp: number
  achievements: string[] // Array of achievement IDs
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  requirement: number
  category: 'squads' | 'players' | 'teams' | 'social' | 'streak'
  unlocked: boolean
  unlockedAt?: Timestamp
}

export interface LevelInfo {
  level: number
  title: string
  minXP: number
  maxXP: number
  color: string
}
