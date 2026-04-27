'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllCampuses } from '@bible-notes/pocketbase-client'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface CampusInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function CampusInput({ value, onChange, placeholder = 'Campus', className }: CampusInputProps) {
  const [inputValue, setInputValue] = useState(value)
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: campuses } = useQuery({
    queryKey: ['campuses'],
    queryFn: getAllCampuses,
  })

  const filteredCampuses = (campuses || []).filter((c) =>
    c.toLowerCase().includes(inputValue.toLowerCase())
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

  const selectCampus = useCallback(
    (campus: string) => {
      onChange(campus)
      setInputValue(campus)
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
        prev < filteredCampuses.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && filteredCampuses[highlightedIndex]) {
        selectCampus(filteredCampuses[highlightedIndex])
      } else if (inputValue.trim()) {
        selectCampus(inputValue.trim())
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
    // Small delay to allow click on list item to fire first
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
      {open && filteredCampuses.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-card shadow-lg max-h-60 overflow-auto">
          <div ref={listRef}>
            {filteredCampuses.map((campus, index) => (
              <div
                key={campus}
                onMouseDown={(e) => {
                  e.preventDefault()
                  selectCampus(campus)
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  'px-3 py-2 text-sm cursor-pointer focus:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                  index === highlightedIndex
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {campus}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
