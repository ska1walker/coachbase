'use client'

import { useState, useRef } from 'react'
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { parsePlayerCSV, downloadCSVTemplate, type CSVParseResult } from '@/lib/csv-utils'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { cn } from '@/lib/utils'

interface CSVUploadProps {
  squadId: string
  onImportComplete: () => void
  onClose: () => void
}

export function CSVUpload({ squadId, onImportComplete, onClose }: CSVUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setParseResult({
        success: false,
        players: [],
        errors: ['Bitte eine CSV-Datei hochladen (.csv)'],
        warnings: [],
      })
      return
    }

    // Read file
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const result = parsePlayerCSV(content)
      setParseResult(result)
    }
    reader.onerror = () => {
      setParseResult({
        success: false,
        players: [],
        errors: ['Fehler beim Lesen der Datei'],
        warnings: [],
      })
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!parseResult || !parseResult.success) return

    setImporting(true)

    try {
      // Import all players
      const promises = parseResult.players.map((player) =>
        addDoc(collection(db, 'players'), {
          squadId,
          name: player.name,
          technik: player.technik,
          fitness: player.fitness,
          spielverstaendnis: player.spielverstaendnis,
          total: player.total,
          createdAt: new Date().toISOString(),
        })
      )

      await Promise.all(promises)

      onImportComplete()
      onClose()
    } catch (error) {
      console.error('Error importing players:', error)
      alert('Fehler beim Importieren der Spieler')
    } finally {
      setImporting(false)
    }
  }

  const handleReset = () => {
    setParseResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Spieler per CSV importieren</CardTitle>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-soft-mint/50 dark:hover:bg-card-dark transition-smooth"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-soft-mint/50 dark:bg-card-dark">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-digital-orange" />
              <div>
                <p className="font-medium text-sm text-deep-petrol dark:text-soft-mint">
                  CSV-Vorlage herunterladen
                </p>
                <p className="text-xs text-mid-grey">
                  Beispiel-Datei mit korrektem Format
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={downloadCSVTemplate}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>

          {/* Upload Area */}
          {!parseResult && (
            <div
              className={cn(
                'border-2 border-dashed rounded-xl p-12 text-center transition-smooth cursor-pointer',
                dragActive
                  ? 'border-neon-lime bg-neon-lime/5'
                  : 'border-mid-grey/30 hover:border-neon-lime/50'
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-mid-grey" />
              <p className="text-lg font-medium text-deep-petrol dark:text-soft-mint mb-2">
                CSV-Datei hierher ziehen
              </p>
              <p className="text-sm text-mid-grey mb-4">
                oder klicken um Datei auszuwählen
              </p>
              <p className="text-xs text-mid-grey">
                Format: name,technik,fitness,spielverstaendnis
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleChange}
                className="hidden"
              />
            </div>
          )}

          {/* Parse Result */}
          {parseResult && (
            <div className="space-y-4">
              {/* Errors */}
              {parseResult.errors.length > 0 && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-red-800 dark:text-red-300 mb-2">
                        Fehler beim Parsen der CSV
                      </p>
                      <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-400 space-y-1">
                        {parseResult.errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {parseResult.warnings.length > 0 && (
                <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-yellow-800 dark:text-yellow-300 mb-2">
                        Warnungen
                      </p>
                      <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                        {parseResult.warnings.map((warning, idx) => (
                          <li key={idx}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Preview */}
              {parseResult.success && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <p className="font-medium text-sm text-green-800 dark:text-green-300">
                        {parseResult.players.length} Spieler erfolgreich erkannt
                      </p>
                    </div>
                  </div>

                  {/* Player Preview */}
                  <div className="border border-mid-grey/20 rounded-lg overflow-hidden">
                    <div className="bg-soft-mint/50 dark:bg-card-dark px-4 py-3">
                      <p className="font-medium text-sm text-deep-petrol dark:text-soft-mint">
                        Vorschau
                      </p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-white dark:bg-deep-petrol sticky top-0">
                          <tr className="text-left text-xs text-mid-grey uppercase tracking-label">
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Technik</th>
                            <th className="px-4 py-3">Fitness</th>
                            <th className="px-4 py-3">Spielverst.</th>
                            <th className="px-4 py-3">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parseResult.players.map((player, idx) => (
                            <tr
                              key={idx}
                              className="border-t border-mid-grey/20 text-sm"
                            >
                              <td className="px-4 py-3 font-medium">{player.name}</td>
                              <td className="px-4 py-3">{player.technik}</td>
                              <td className="px-4 py-3">{player.fitness}</td>
                              <td className="px-4 py-3">{player.spielverstaendnis}</td>
                              <td className="px-4 py-3 font-bold text-neon-lime">
                                {player.total}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {parseResult.success ? (
                  <>
                    <Button
                      variant="primary"
                      onClick={handleImport}
                      disabled={importing}
                      fullWidth
                    >
                      {importing ? 'Importiere...' : `${parseResult.players.length} Spieler importieren`}
                    </Button>
                    <Button variant="secondary" onClick={handleReset}>
                      Andere Datei
                    </Button>
                  </>
                ) : (
                  <Button variant="secondary" onClick={handleReset} fullWidth>
                    Erneut versuchen
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
