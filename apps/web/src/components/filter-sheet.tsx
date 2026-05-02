'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'

export type FilterFieldType = 'text' | 'date' | 'select'

export interface FilterConfig {
  key: string
  label: string
  type: FilterFieldType
  options?: { value: string; label: string }[]
}

export interface FilterState {
  [key: string]: string
}

interface FilterSheetProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterConfig[]
  values: FilterState
  onChange: (values: FilterState) => void
  title?: string
}

export default function FilterSheet({
  isOpen,
  onClose,
  filters,
  values,
  onChange,
  title = 'Filters',
}: FilterSheetProps) {
  const handleChange = (key: string, value: string) => {
    onChange({ ...values, [key]: value })
  }

  const handleClear = () => {
    const cleared: FilterState = {}
    filters.forEach((f) => {
      cleared[f.key] = ''
    })
    onChange(cleared)
  }

  const hasFilters = filters.some((f) => values[f.key])

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-auto max-h-[80vh]">
        <SheetHeader className="mb-4">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 overflow-y-auto pb-4">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-2">
              <Label htmlFor={`filter-${filter.key}`}>{filter.label}</Label>
              {filter.type === 'select' && filter.options ? (
                <select
                  id={`filter-${filter.key}`}
                  value={values[filter.key] || ''}
                  onChange={(e) => handleChange(filter.key, e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={`filter-${filter.key}`}
                  type={filter.type}
                  value={values[filter.key] || ''}
                  onChange={(e) => handleChange(filter.key, e.target.value)}
                  placeholder={filter.label}
                />
              )}
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <SheetClose asChild>
              <Button variant="outline" className="flex-1">
                Done
              </Button>
            </SheetClose>
            {hasFilters && (
              <Button variant="ghost" onClick={handleClear}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
