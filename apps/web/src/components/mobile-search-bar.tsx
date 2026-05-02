'use client'

import { useState } from 'react'
import { Search, X, SlidersHorizontal, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import FilterSheet, { type FilterConfig, type FilterState } from './filter-sheet'

interface MobileSearchBarProps {
  onSearchChange: (query: string) => void
  onFilterChange?: (filters: FilterState) => void
  filterConfig?: FilterConfig[]
  placeholder?: string
}

export default function MobileSearchBar({
  onSearchChange,
  onFilterChange,
  filterConfig,
  placeholder = 'Search...',
}: MobileSearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [filterValues, setFilterValues] = useState<FilterState>({})

  const handleExpand = () => {
    setIsExpanded(true)
  }

  const handleCollapse = () => {
    setIsExpanded(false)
    setQuery('')
    onSearchChange('')
  }

  const handleClear = () => {
    setQuery('')
    onSearchChange('')
  }

  const handleFilterChange = (values: FilterState) => {
    setFilterValues(values)
    onFilterChange?.(values)
  }

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearchChange(value)
  }

  const hasFilters = filterConfig && filterConfig.some((f) => filterValues[f.key])

  if (!isExpanded) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleExpand} aria-label="Search">
          <Search className="h-5 w-5" />
        </Button>
        {filterConfig && filterConfig.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFilterSheetOpen(true)}
            aria-label="Filters"
            className={hasFilters ? 'text-primary' : ''}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        )}
        {filterConfig && filterConfig.length > 0 && (
          <FilterSheet
            isOpen={filterSheetOpen}
            onClose={() => setFilterSheetOpen(false)}
            filters={filterConfig}
            values={filterValues}
            onChange={handleFilterChange}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-1">
      <Button variant="ghost" size="icon" onClick={handleCollapse} aria-label="Back">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          autoFocus
          placeholder={placeholder}
          value={query}
          onChange={handleQueryChange}
          className="pl-9 pr-9"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      {filterConfig && filterConfig.length > 0 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFilterSheetOpen(true)}
          aria-label="Filters"
          className={hasFilters ? 'text-primary' : ''}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      )}
      {filterConfig && filterConfig.length > 0 && (
        <FilterSheet
          isOpen={filterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
          filters={filterConfig}
          values={filterValues}
          onChange={handleFilterChange}
        />
      )}
    </div>
  )
}
