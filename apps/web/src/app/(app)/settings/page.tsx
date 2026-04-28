'use client'

import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { exportAllData, importData } from '@bible-notes/pocketbase-client'
import type { ExportData, ImportResult } from '@bible-notes/pocketbase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const exportMutation = useMutation({
    mutationFn: exportAllData,
    onSuccess: (data) => {
      const dateStr = new Date().toISOString().split('T')[0]
      const filename = `bible-notes-export-${dateStr}.json`
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  })

  const importMutation = useMutation({
    mutationFn: importData,
    onSuccess: (result) => {
      setImportResult(result)
    },
  })

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportResult(null)

    try {
      const text = await file.text()
      const data = JSON.parse(text) as ExportData

      // Validate the data has at least one known property
      if (
        !data.bible_notes &&
        !data.small_group_notes &&
        !data.sermons &&
        !data.revelations
      ) {
        alert(
          'Invalid export file. Expected at least one of: bible_notes, small_group_notes, sermons, revelations.'
        )
        return
      }

      importMutation.mutate(data)
    } catch (err) {
      alert('Failed to parse file. Please select a valid JSON export file.')
    }

    // Reset the file input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-muted-foreground">Export or import your data</p>
      </div>

      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download all your Bible notes, small group notes, sermons, and revelations as a JSON file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? 'Exporting...' : 'Export All Data'}
          </Button>
          {exportMutation.isError && (
            <p className="text-sm text-destructive mt-2">
              Export failed. Please try again.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Import data from a previously exported JSON file. Existing data will not be overwritten.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              disabled={importMutation.isPending}
              className="max-w-sm"
            />
            {importMutation.isPending && (
              <p className="text-sm text-muted-foreground">Importing...</p>
            )}
          </div>

          {importMutation.isError && (
            <p className="text-sm text-destructive">
              Import failed. Please check the file and try again.
            </p>
          )}

          {importResult && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Import Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Bible Notes', count: importResult.bible_notes },
                  { label: 'Small Group Notes', count: importResult.small_group_notes },
                  { label: 'Sermons', count: importResult.sermons },
                  { label: 'Revelations', count: importResult.revelations },
                ].map(({ label, count }) => (
                  <Card key={label}>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>Errors ({importResult.errors.length})</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {importResult.errors.map((err, i) => (
                      <p key={i} className="text-xs text-destructive">
                        {err}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {importResult.errors.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Import completed successfully with no errors.</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
