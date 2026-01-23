import type { Player, PlayerPosition } from './types'

export interface CSVParseResult {
  success: boolean
  players: Omit<Player, 'id' | 'squadId' | 'createdAt'>[]
  errors: string[]
  warnings: string[]
}

export interface CSVRow {
  name: string
  technik: number
  fitness: number
  spielverstaendnis: number
}

/**
 * Parse CSV content and validate player data
 */
export function parsePlayerCSV(csvContent: string): CSVParseResult {
  const errors: string[] = []
  const warnings: string[] = []
  const players: Omit<Player, 'id' | 'squadId' | 'createdAt'>[] = []

  // Split into lines and remove empty lines
  const lines = csvContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)

  if (lines.length === 0) {
    errors.push('CSV-Datei ist leer')
    return { success: false, players: [], errors, warnings }
  }

  // Parse header
  const header = lines[0].split(',').map(h => h.trim().toLowerCase())

  // Validate header
  const requiredColumns = ['name', 'technik', 'fitness', 'spielverstaendnis']
  const missingColumns = requiredColumns.filter(col => !header.includes(col))

  if (missingColumns.length > 0) {
    errors.push(`Fehlende Spalten: ${missingColumns.join(', ')}`)
    return { success: false, players: [], errors, warnings }
  }

  // Get column indices
  const nameIdx = header.indexOf('name')
  const technikIdx = header.indexOf('technik')
  const fitnessIdx = header.indexOf('fitness')
  const spielverstaendnisIdx = header.indexOf('spielverstaendnis')
  const positionenIdx = header.indexOf('positionen') // Optional column

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const lineNum = i + 1
    const values = lines[i].split(',').map(v => v.trim())

    // Skip empty rows
    if (values.every(v => !v)) continue

    // Validate row has enough columns
    if (values.length < requiredColumns.length) {
      errors.push(`Zeile ${lineNum}: Nicht genug Spalten`)
      continue
    }

    const name = values[nameIdx]
    const technikStr = values[technikIdx]
    const fitnessStr = values[fitnessIdx]
    const spielverstaendnisStr = values[spielverstaendnisIdx]
    const positionenStr = positionenIdx >= 0 && values[positionenIdx] ? values[positionenIdx] : ''

    // Validate name
    if (!name || name.length === 0) {
      errors.push(`Zeile ${lineNum}: Name darf nicht leer sein`)
      continue
    }

    // Parse and validate numbers
    const technik = parseInt(technikStr)
    const fitness = parseInt(fitnessStr)
    const spielverstaendnis = parseInt(spielverstaendnisStr)

    if (isNaN(technik)) {
      errors.push(`Zeile ${lineNum}: Technik muss eine Zahl sein`)
      continue
    }
    if (isNaN(fitness)) {
      errors.push(`Zeile ${lineNum}: Fitness muss eine Zahl sein`)
      continue
    }
    if (isNaN(spielverstaendnis)) {
      errors.push(`Zeile ${lineNum}: Spielverständnis muss eine Zahl sein`)
      continue
    }

    // Validate ranges (1-10)
    if (technik < 1 || technik > 10) {
      errors.push(`Zeile ${lineNum}: Technik muss zwischen 1 und 10 liegen`)
      continue
    }
    if (fitness < 1 || fitness > 10) {
      errors.push(`Zeile ${lineNum}: Fitness muss zwischen 1 und 10 liegen`)
      continue
    }
    if (spielverstaendnis < 1 || spielverstaendnis > 10) {
      errors.push(`Zeile ${lineNum}: Spielverständnis muss zwischen 1 und 10 liegen`)
      continue
    }

    // Check for duplicate names
    const isDuplicate = players.some(p => p.name.toLowerCase() === name.toLowerCase())
    if (isDuplicate) {
      warnings.push(`Zeile ${lineNum}: Spieler "${name}" existiert bereits in dieser Datei`)
    }

    // Parse positions (optional, semicolon-separated)
    let positions: PlayerPosition[] | undefined = undefined
    if (positionenStr) {
      const validPositions: PlayerPosition[] = ['Torhüter', 'Abwehr', 'Mittelfeld', 'Angriff']
      const rawPositions = positionenStr.split(';').map(p => p.trim())
      const parsedPositions = rawPositions.filter(p =>
        validPositions.includes(p as PlayerPosition)
      ) as PlayerPosition[]

      if (parsedPositions.length > 0) {
        positions = parsedPositions
      }

      if (rawPositions.length > parsedPositions.length) {
        warnings.push(`Zeile ${lineNum}: Einige Positionen wurden ignoriert (gültig: ${validPositions.join(', ')})`)
      }
    }

    // Add valid player
    players.push({
      name,
      technik,
      fitness,
      spielverstaendnis,
      total: technik + fitness + spielverstaendnis,
      positions,
    })
  }

  return {
    success: errors.length === 0 && players.length > 0,
    players,
    errors,
    warnings,
  }
}

/**
 * Generate CSV template content
 */
export function generateCSVTemplate(): string {
  const header = 'name,technik,fitness,spielverstaendnis,positionen'
  const examples = [
    'Max Mustermann,8,7,9,Angriff;Mittelfeld',
    'Lisa Schmidt,9,8,8,Torhüter',
    'Tom Weber,6,7,7,Abwehr',
  ]

  return [header, ...examples].join('\n')
}

/**
 * Download CSV template file
 */
export function downloadCSVTemplate() {
  const content = generateCSVTemplate()
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', 'spieler-vorlage.csv')
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Export players to CSV
 */
export function exportPlayersToCSV(players: Player[], squadName: string) {
  const header = 'name,technik,fitness,spielverstaendnis,positionen'
  const rows = players.map(p => {
    const positions = p.positions && p.positions.length > 0 ? p.positions.join(';') : ''
    return `${p.name},${p.technik},${p.fitness},${p.spielverstaendnis},${positions}`
  })

  const content = [header, ...rows].join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  const filename = `${squadName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_spieler.csv`

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
