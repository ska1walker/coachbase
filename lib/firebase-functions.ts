import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from './firebase'
import type {
  GenerateTeamsRequest,
  GenerateTeamsResponse,
  AdminResetPasswordRequest,
  AdminResetPasswordResponse,
} from './types'

const functions = getFunctions(app)

/**
 * Call the existing Cloud Function to generate teams
 * IMPORTANT: This function already exists and must NOT be modified
 */
export async function generateTeams(
  request: GenerateTeamsRequest
): Promise<GenerateTeamsResponse> {
  const generateTeamsFunction = httpsCallable<
    GenerateTeamsRequest,
    GenerateTeamsResponse
  >(functions, 'generateTeams')

  try {
    const result = await generateTeamsFunction(request)
    return result.data
  } catch (error: any) {
    console.error('Error calling generateTeams:', error)
    return {
      success: false,
      teams: [],
      error: error.message || 'Failed to generate teams',
    }
  }
}

/**
 * Admin function to reset user password
 * Requires admin role in Firebase Auth token
 */
export async function adminResetUserPassword(
  request: AdminResetPasswordRequest
): Promise<AdminResetPasswordResponse> {
  const resetPasswordFunction = httpsCallable<
    AdminResetPasswordRequest,
    AdminResetPasswordResponse
  >(functions, 'adminResetUserPassword')

  try {
    const result = await resetPasswordFunction(request)
    return result.data
  } catch (error: any) {
    console.error('Error calling adminResetUserPassword:', error)
    return {
      success: false,
      message: 'Failed to reset password',
      error: error.message,
    }
  }
}
