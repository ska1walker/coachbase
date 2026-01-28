'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { X } from 'lucide-react'
import { User } from '@/lib/types'

interface SquadMemberBadgesProps {
  squadId: string
  coTrainerIds?: string[]
  ownerId: string
  onRemoveMember?: (userId: string, userName: string) => void
}

interface MemberInfo {
  uid: string
  displayName: string
  email: string
  initials: string
  isAccepted: boolean
}

export function SquadMemberBadges({
  squadId,
  coTrainerIds = [],
  ownerId,
  onRemoveMember
}: SquadMemberBadgesProps) {
  const [members, setMembers] = useState<MemberInfo[]>([])
  const [hoveredMember, setHoveredMember] = useState<string | null>(null)
  const currentUserId = auth.currentUser?.uid

  useEffect(() => {
    const loadMembers = async () => {
      if (!coTrainerIds || coTrainerIds.length === 0) {
        setMembers([])
        return
      }

      const memberPromises = coTrainerIds.map(async (uid) => {
        try {
          const userDoc = await getDoc(doc(db, 'users', uid))
          if (userDoc.exists()) {
            const userData = userDoc.data() as User
            const displayName = userData.displayName || userData.email || 'Anonym'
            const initials = getInitials(displayName)

            return {
              uid,
              displayName,
              email: userData.email,
              initials,
              isAccepted: true // They are in coTrainerIds, so they accepted
            }
          }
          return null
        } catch (error) {
          console.error('Error loading member:', error)
          return null
        }
      })

      const loadedMembers = (await Promise.all(memberPromises)).filter(Boolean) as MemberInfo[]
      setMembers(loadedMembers)
    }

    loadMembers()
  }, [coTrainerIds])

  const getInitials = (name: string): string => {
    if (!name || name === 'Anonym') return 'AN'

    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase()
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const canRemoveMember = (memberId: string): boolean => {
    // Owner can remove anyone
    if (currentUserId === ownerId) return true
    // User can remove themselves
    if (currentUserId === memberId) return true
    return false
  }

  const handleRemoveClick = (e: React.MouseEvent, member: MemberInfo) => {
    e.stopPropagation()
    if (onRemoveMember && canRemoveMember(member.uid)) {
      onRemoveMember(member.uid, member.displayName)
    }
  }

  if (members.length === 0) return null

  return (
    <div
      className="flex items-center gap-2 flex-wrap"
      onClick={(e) => e.stopPropagation()}
    >
      {members.map((member) => {
        const isHovered = hoveredMember === member.uid
        const showRemove = canRemoveMember(member.uid) && isHovered

        return (
          <div
            key={member.uid}
            className="relative group"
            onMouseEnter={() => setHoveredMember(member.uid)}
            onMouseLeave={() => setHoveredMember(null)}
          >
            {/* Badge */}
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                text-xs font-bold transition-all duration-200
                ${member.isAccepted
                  ? 'bg-digital-orange text-white'
                  : 'bg-digital-orange/30 text-digital-orange border-2 border-digital-orange/50'
                }
                ${showRemove ? 'ring-2 ring-digital-orange/50' : ''}
              `}
              title={member.displayName}
            >
              {member.initials}
            </div>

            {/* Remove Button - shown on hover if user has permission */}
            {showRemove && (
              <button
                onClick={(e) => handleRemoveClick(e, member)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg z-10"
                title={`${member.displayName} entfernen`}
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Tooltip */}
            {isHovered && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-deep-petrol dark:bg-card-dark text-white dark:text-soft-mint px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shadow-lg z-20 pointer-events-none">
                {member.displayName}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-deep-petrol dark:bg-card-dark rotate-45"></div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
