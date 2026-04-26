'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { parseVerseReference } from '@bible-notes/shared'

interface VerseInputProps {
  value: string[]
  onChange: (refs: string[]) => void
}

export function VerseInput({ value, onChange }: VerseInputProps) {
  const [input, setInput] = useState('')

  const isValid = input.trim() === '' || parseVerseReference(input.trim()) !== null

  const handleAdd = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) return
    if (value.includes(trimmed)) {
      setInput('')
      return
    }
    if (parseVerseReference(trimmed) === null) return
    onChange([...value, trimmed])
    setInput('')
  }, [input, value, onChange])

  const handleRemove = useCallback(
    (ref: string) => {
      onChange(value.filter((r) => r !== ref))
    },
    [value, onChange]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((ref) => (
          <Badge key={ref} variant="secondary" className="flex items-center gap-1">
            {ref}
            <button
              type="button"
              onClick={() => handleRemove(ref)}
              className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        placeholder="e.g. John 3:16"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className={!isValid ? 'border-destructive focus-visible:ring-destructive' : undefined}
      />
      {!isValid && (
        <p className="text-xs text-destructive">Please enter a valid verse reference</p>
      )}
      <p className="text-xs text-muted-foreground">Press Enter to add a verse reference</p>
    </div>
  )
}
