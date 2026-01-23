/**
 * Security: Input Validation & Sanitization
 * Prevents XSS, Injection, and other input-based attacks
 */

// Sanitize string: Remove dangerous characters
export function sanitizeString(input: string, maxLength: number = 100): string {
  if (!input) return ''

  // Remove control characters, null bytes, and trim
  let sanitized = input
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control chars
    .replace(/\0/g, '') // Remove null bytes
    .trim()

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  return sanitized
}

// Validate display name (alphanumeric + spaces, hyphens, dots)
export function validateDisplayName(name: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeString(name, 50)

  if (sanitized.length === 0) {
    return { valid: true } // Optional field
  }

  if (sanitized.length < 2) {
    return { valid: false, error: 'Name muss mindestens 2 Zeichen lang sein' }
  }

  if (sanitized.length > 50) {
    return { valid: false, error: 'Name darf maximal 50 Zeichen lang sein' }
  }

  // Allow letters, numbers, spaces, hyphens, dots, umlauts
  const nameRegex = /^[a-zA-ZäöüÄÖÜß0-9\s\-\.]+$/
  if (!nameRegex.test(sanitized)) {
    return { valid: false, error: 'Name enthält ungültige Zeichen' }
  }

  return { valid: true }
}

// Validate club/location name
export function validateClubOrLocation(value: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeString(value, 100)

  if (sanitized.length === 0) {
    return { valid: true } // Optional field
  }

  if (sanitized.length > 100) {
    return { valid: false, error: 'Maximal 100 Zeichen erlaubt' }
  }

  // Allow letters, numbers, spaces, common punctuation
  const regex = /^[a-zA-ZäöüÄÖÜß0-9\s\-\.\,\/]+$/
  if (!regex.test(sanitized)) {
    return { valid: false, error: 'Enthält ungültige Zeichen' }
  }

  return { valid: true }
}

// Validate bio (multiline, more permissive)
export function validateBio(bio: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeString(bio, 500)

  if (sanitized.length === 0) {
    return { valid: true } // Optional field
  }

  if (sanitized.length > 500) {
    return { valid: false, error: 'Bio darf maximal 500 Zeichen lang sein' }
  }

  // No script tags, no dangerous HTML
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i,
    /onload=/i,
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(bio)) {
      return { valid: false, error: 'Bio enthält nicht erlaubte Inhalte' }
    }
  }

  return { valid: true }
}

// Validate email format
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email ist erforderlich' }
  }

  // RFC 5322 simplified email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Ungültige Email-Adresse' }
  }

  if (email.length > 254) {
    return { valid: false, error: 'Email zu lang' }
  }

  return { valid: true }
}

// Sanitize all profile fields at once
export function sanitizeProfileData(data: {
  displayName?: string
  clubName?: string
  location?: string
  bio?: string
}) {
  return {
    displayName: data.displayName ? sanitizeString(data.displayName, 50) : '',
    clubName: data.clubName ? sanitizeString(data.clubName, 100) : '',
    location: data.location ? sanitizeString(data.location, 100) : '',
    bio: data.bio ? sanitizeString(data.bio, 500) : '',
  }
}
