'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllPastors } from '@bible-notes/pocketbase-client'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PastorInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function PastorInput({ value, onChange, placeholder = 'Pastor', className }: PastorInputProps) {
  const [inputValue, setInputValue] = useState(value)
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: pastors } = useQuery({
    queryKey: ['pastors'],
    queryFn: getAllPastors,
  })

  const filteredPastors = (pastors || []).filter((p) =>
    p.toLowerCase().includes(inputValue.toLowerCase())
  )

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectPastor = useCallback(
    (pastor: string) => {
      onChange(pastor)
      setInputValue(pastor)
      setOpen(false)
      setHighlightedIndex(-1)
      inputRef.current?.blur()
    },
    [onChange]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setHighlightedIndex((prev) =>
        prev < filteredPastors.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && filteredPastors[highlightedIndex]) {
        selectPastor(filteredPastors[highlightedIndex])
      } else if (inputValue.trim()) {
        selectPastor(inputValue.trim())
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setHighlightedIndex(-1)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setOpen(true)
    setHighlightedIndex(-1)
    if (newValue.trim() === '') {
      onChange('')
    }
  }

  const handleBlur = () => {
    setTimeout(() => {
      if (inputValue.trim() && inputValue !== value) {
        onChange(inputValue.trim())
      }
      setOpen(false)
      setHighlightedIndex(-1)
    }, 150)
  }

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement
      if (item) {
        item.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && filteredPastors.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-card shadow-lg max-h-60 overflow-auto">
          <div ref={listRef}>
            {filteredPastors.map((pastor, index) => (
              <div
                key={pastor}
                onMouseDown={(e) => {
                  e.preventDefault()
                  selectPastor(pastor)
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  'px-3 py-2 text-sm cursor-pointer',
                  index === highlightedIndex
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {pastor}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
