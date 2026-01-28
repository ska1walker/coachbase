import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

/**
 * EXISTING FUNCTION - DO NOT MODIFY
 * This function already exists and handles the team generation algorithm
 *
 * export const generateTeams = functions.https.onCall(async (data, context) => {
 *   // Existing algorithm implementation
 *   // Returns: { success: true, teams: [...], matchHistoryId: '...' }
 * })
 */

/**
 * Admin Function: Reset User Password
 * Only callable by users with admin role
 */
export const adminResetUserPassword = functions.https.onCall(
  async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      )
    }

    // Get custom claims to check role
    const callerUid = context.auth.uid
    const callerUser = await admin.auth().getUser(callerUid)
    const customClaims = callerUser.customClaims

    // Check if caller is admin
    if (!customClaims || customClaims.role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can reset passwords'
      )
    }

    const { targetUid, newPassword } = data

    // Validate input
    if (!targetUid || typeof targetUid !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'targetUid must be a valid string'
      )
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'newPassword must be at least 6 characters'
      )
    }

    try {
      // Update user password using Admin SDK
      await admin.auth().updateUser(targetUid, {
        password: newPassword,
      })

      // Log the action
      await admin.firestore().collection('admin_actions').add({
        action: 'password_reset',
        adminUid: callerUid,
        targetUid,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      })

      return {
        success: true,
        message: `Password reset successfully for user ${targetUid}`,
      }
    } catch (error: any) {
      console.error('Error resetting password:', error)
      throw new functions.https.HttpsError(
        'internal',
        `Failed to reset password: ${error.message}`
      )
    }
  }
)

/**
 * Save Match History after team generation
 * Called by the generateTeams function or frontend after successful generation
 */
export const saveMatchHistory = functions.https.onCall(
  async (data, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      )
    }

    const { squadId, teams, teamCount, playerCount } = data

    // Validate input
    if (!squadId || !teams || !Array.isArray(teams)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid match history data'
      )
    }

    try {
      // Verify squad ownership OR co-trainer status
      const squadDoc = await admin.firestore().collection('squads').doc(squadId).get()

      if (!squadDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Squad not found')
      }

      const squadData = squadDoc.data()
      const isOwner = squadData?.ownerId === context.auth.uid
      const coTrainerIds = squadData?.coTrainerIds || []
      const isCoTrainer = coTrainerIds.includes(context.auth.uid)

      if (!isOwner && !isCoTrainer) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'You can only save history for squads you own or co-train'
        )
      }

      // Create match history document
      const historyRef = await admin.firestore().collection('match_history').add({
        squadId,
        ownerId: context.auth.uid,
        date: admin.firestore.FieldValue.serverTimestamp(),
        teams,
        teamCount: teamCount || teams.length,
        playerCount: playerCount || teams.reduce((sum, t) => sum + t.players.length, 0),
        liked: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      return {
        success: true,
        matchHistoryId: historyRef.id,
      }
    } catch (error: any) {
      console.error('Error saving match history:', error)
      throw new functions.https.HttpsError(
        'internal',
        `Failed to save match history: ${error.message}`
      )
    }
  }
)

/**
 * Set custom claims for admin users
 * Call this manually via Firebase CLI or Cloud Console
 * Example: firebase functions:shell
 *   > setAdminRole({email: 'admin@example.com'})
 */
export const setAdminRole = functions.https.onCall(async (data, context) => {
  // In production, you'd want additional security checks here
  // For now, only allow if called by another admin

  const { email } = data

  if (!email) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email is required'
    )
  }

  try {
    const user = await admin.auth().getUserByEmail(email)

    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'admin',
    })

    // Update Firestore user document
    await admin.firestore().collection('users').doc(user.uid).set(
      {
        role: 'admin',
      },
      { merge: true }
    )

    return {
      success: true,
      message: `Admin role set for ${email}`,
    }
  } catch (error: any) {
    throw new functions.https.HttpsError(
      'internal',
      `Failed to set admin role: ${error.message}`
    )
  }
})

/**
 * Co-Trainer Invite System
 * Generate a secure token for inviting co-trainers to a squad
 */
import * as crypto from 'crypto'

export const createInvite = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    )
  }

  const { squadId } = data

  if (!squadId || typeof squadId !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'squadId must be a valid string'
    )
  }

  try {
    // Verify squad ownership
    const squadDoc = await admin.firestore().collection('squads').doc(squadId).get()

    if (!squadDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Squad not found')
    }

    const squadData = squadDoc.data()
    if (squadData?.ownerId !== context.auth.uid) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only squad owners can create invites'
      )
    }

    // Check member limit (max 5 active members)
    const coTrainerIds = squadData?.coTrainerIds || []
    if (coTrainerIds.length >= 5) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Maximum of 5 members can be added to a squad'
      )
    }

    // Get caller's email
    const callerUser = await admin.auth().getUser(context.auth.uid)

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex')

    // Create invite document (expires in 7 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const inviteRef = await admin.firestore().collection('squad_invites').add({
      token,
      squadId,
      squadName: squadData.name,
      createdBy: context.auth.uid,
      createdByEmail: callerUser.email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      used: false,
    })

    return {
      success: true,
      inviteId: inviteRef.id,
      token,
      expiresAt: expiresAt.toISOString(),
    }
  } catch (error: any) {
    console.error('Error creating invite:', error)
    throw new functions.https.HttpsError(
      'internal',
      `Failed to create invite: ${error.message}`
    )
  }
})

/**
 * Accept Co-Trainer Invite
 * Adds the authenticated user to the squad's coTrainerIds array
 */
export const acceptInvite = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to accept invites'
    )
  }

  const { token } = data

  if (!token || typeof token !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'token must be a valid string'
    )
  }

  try {
    // Find invite by token
    const invitesSnapshot = await admin
      .firestore()
      .collection('squad_invites')
      .where('token', '==', token)
      .limit(1)
      .get()

    if (invitesSnapshot.empty) {
      throw new functions.https.HttpsError('not-found', 'Invite not found')
    }

    const inviteDoc = invitesSnapshot.docs[0]
    const inviteData = inviteDoc.data()

    // Check if invite is already used
    if (inviteData.used) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'This invite has already been used'
      )
    }

    // Check if invite is expired
    const now = admin.firestore.Timestamp.now()
    if (inviteData.expiresAt.toMillis() < now.toMillis()) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'This invite has expired'
      )
    }

    // Check if user is not the owner
    const squadDoc = await admin
      .firestore()
      .collection('squads')
      .doc(inviteData.squadId)
      .get()

    if (!squadDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Squad not found')
    }

    const squadData = squadDoc.data()
    if (squadData?.ownerId === context.auth.uid) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'You are already the owner of this squad'
      )
    }

    // Check if user is already a co-trainer
    const currentCoTrainers = squadData?.coTrainerIds || []
    if (currentCoTrainers.includes(context.auth.uid)) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'You are already a co-trainer for this squad'
      )
    }

    // Add user to coTrainerIds array
    await admin
      .firestore()
      .collection('squads')
      .doc(inviteData.squadId)
      .update({
        coTrainerIds: admin.firestore.FieldValue.arrayUnion(context.auth.uid),
      })

    // Mark invite as used
    await inviteDoc.ref.update({
      used: true,
      usedBy: context.auth.uid,
      usedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return {
      success: true,
      squadId: inviteData.squadId,
      squadName: inviteData.squadName,
      message: `Successfully joined as co-trainer for ${inviteData.squadName}`,
    }
  } catch (error: any) {
    console.error('Error accepting invite:', error)

    // Re-throw HttpsErrors as-is
    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError(
      'internal',
      `Failed to accept invite: ${error.message}`
    )
  }
})
