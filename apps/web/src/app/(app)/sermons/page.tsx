'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { listSermons, getAllCampuses, deleteSermon } from '@bible-notes/pocketbase-client'
import { SERVICE_TYPES, SERVICE_TYPE_LABELS } from '@bible-notes/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { useDebounce } from '@/hooks/use-debounce'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Search, Plus, ChevronLeft, ChevronRight, Church, Trash2 } from 'lucide-react'
import type { ServiceType } from '@bible-notes/shared'
import MobileSearchBar from '@/components/mobile-search-bar'
import DeleteDialog from '@/components/delete-dialog'
import type { FilterConfig } from '@/components/filter-sheet'

const filterConfig: FilterConfig[] = [
  { key: 'pastor', label: 'Pastor', type: 'text' },
  { key: 'campus', label: 'Campus', type: 'text' },
  { key: 'date_from', label: 'From Date', type: 'date' },
  { key: 'date_to', label: 'To Date', type: 'date' },
]

export default function SermonsPage() {
  const [search, setSearch] = useState('')
  const [pastor, setPastor] = useState('')
  const [campus, setCampus] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const debouncedPastor = useDebounce(pastor, 300)
  const [serviceType, setServiceType] = useState<ServiceType | ''>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: campuses } = useQuery({
    queryKey: ['campuses'],
    queryFn: getAllCampuses,
  })

  const { data, isLoading } = useQuery({
    queryKey: [
      'sermons',
      { search: debouncedSearch, pastor: debouncedPastor, campus, service_type: serviceType, date_from: dateFrom, date_to: dateTo, page },
    ],
    queryFn: () =>
      listSermons({
        search: debouncedSearch || undefined,
        pastor: debouncedPastor || undefined,
        campus: campus || undefined,
        service_type: (serviceType as ServiceType) || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page,
        per_page: 10,
      }),
  })

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSermon(id),
    onSuccess: () => {
      setDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ['sermons'] })
    },
  })

  const handleSearch = () => {
    setPage(1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleClear = () => {
    setSearch('')
    setPastor('')
    setCampus('')
    setServiceType('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const handleMobileSearch = (query: string) => {
    setSearch(query)
    setPage(1)
  }

  const handleMobileFilter = (filters: Record<string, string>) => {
    setPastor(filters.pastor || '')
    setCampus(filters.campus || '')
    setDateFrom(filters.date_from || '')
    setDateTo(filters.date_to || '')
    setPage(1)
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Church className="h-6 w-6" /> Sermons
          </h2>
          <p className="text-muted-foreground">Browse and manage sermon notes</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <MobileSearchBar
              onSearchChange={handleMobileSearch}
              onFilterChange={handleMobileFilter}
              filterConfig={filterConfig}
              placeholder="Search sermons..."
            />
          </div>
          <Link href="/sermons/new">
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              New Sermon
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="hidden md:block">
        <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Label className="text-xs mb-1 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sermons..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label className="text-xs mb-1 block">Pastor</Label>
              <Input
                placeholder="Filter by pastor"
                value={pastor}
                onChange={(e) => setPastor(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="w-full md:w-48">
              <Label className="text-xs mb-1 block">Campus</Label>
              <Select value={campus} onValueChange={(v) => { setCampus(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All campuses" />
                </SelectTrigger>
                <SelectContent>
                  {campuses?.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div>
              <Label className="text-xs mb-1 block">Service Type</Label>
              <ToggleGroup
                type="single"
                value={serviceType}
                onValueChange={(v) => {
                  setServiceType((v as ServiceType) || '')
                  setPage(1)
                }}
                className="grid grid-cols-3 gap-1"
              >
                {SERVICE_TYPES.map((type) => (
                  <ToggleGroupItem key={type} value={type} className="w-full rounded-lg">
                    {SERVICE_TYPE_LABELS[type]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="flex-1 flex gap-3">
              <div>
                <Label className="text-xs mb-1 block">From</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">To</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleSearch}>
                Search
              </Button>
              <Button variant="ghost" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-5 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                  <div className="h-3 bg-muted rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && data?.items.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Church className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No sermons yet.</p>
              <Link href="/sermons/new">
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first sermon
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {data?.items.map((sermon) => (
          <div key={sermon.id} className="group relative">
            <Link href={`/sermons/${sermon.id}`} className="block">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{sermon.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {sermon.pastor} · {sermon.campus}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {sermon.content.length > 200
                          ? sermon.content.slice(0, 200) + '...'
                          : sermon.content}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge variant="secondary">
                        {SERVICE_TYPE_LABELS[sermon.service_type]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {sermon.date ? format(parseISO(sermon.date), 'MMM d, yyyy') : ''}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity bg-card/80 z-10"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setDeleteId(sermon.id)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {data.totalPages} ({data.totalItems} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <DeleteDialog
        isOpen={!!deleteId}
        title="Delete Sermon"
        description="Are you sure you want to delete this sermon? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteMutation.isPending}
        error={deleteMutation.isError ? 'Failed to delete sermon. Please try again.' : null}
      />
    </div>
  )
}
