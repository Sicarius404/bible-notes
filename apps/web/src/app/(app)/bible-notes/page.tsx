'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { listBibleNotes, deleteBibleNote } from '@bible-notes/pocketbase-client'
import type { BibleNote } from '@bible-notes/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Trash2, BookOpen } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import MobileSearchBar from '@/components/mobile-search-bar'
import DeleteDialog from '@/components/delete-dialog'
import HtmlContent from '@/components/html-content'
import type { FilterConfig } from '@/components/filter-sheet'

const filterConfig: FilterConfig[] = [
  { key: 'verse_ref', label: 'Verse Reference', type: 'text' },
  { key: 'date_from', label: 'From Date', type: 'date' },
  { key: 'date_to', label: 'To Date', type: 'date' },
]

export default function BibleNotesPage() {
  const [page, setPage] = useState(1)
  const [verseRef, setVerseRef] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const debouncedSearch = useDebounce(search, 300)

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['bible-notes', { page, verse_ref: verseRef || undefined, date_from: dateFrom || undefined, date_to: dateTo || undefined, search: debouncedSearch || undefined }],
    queryFn: () => listBibleNotes({
      page,
      per_page: 10,
      verse_ref: verseRef || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      search: debouncedSearch || undefined,
    }),
  })

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBibleNote(id),
    onSuccess: () => {
      setDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ['bible-notes'] })
    },
  })

  const handleSearchChange = (query: string) => {
    setSearch(query)
    setPage(1)
  }

  const handleFilterChange = (filters: Record<string, string>) => {
    setVerseRef(filters.verse_ref || '')
    setDateFrom(filters.date_from || '')
    setDateTo(filters.date_to || '')
    setPage(1)
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Bible Notes</h2>
          <p className="text-muted-foreground">Your personal Bible study notes</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <MobileSearchBar
              onSearchChange={handleSearchChange}
              onFilterChange={handleFilterChange}
              filterConfig={filterConfig}
              placeholder="Search notes..."
            />
          </div>
          <Link href="/bible-notes/new">
            <Button className="hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-sm shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="hidden md:block">
        <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search verse refs..."
                value={verseRef}
                onChange={(e) => setVerseRef(e.target.value)}
                className="pl-9"
              />
            </div>
            <div>
              <Input
                type="date"
                placeholder="From date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="date"
                placeholder="To date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </form>
        </CardContent>
      </Card>
      </div>

      {/* Notes List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-3 bg-muted rounded w-1/4 mb-3" />
                <div className="h-3 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <Card className="border-dashed border-2 border-border/80 bg-gradient-to-b from-card/40 to-transparent shadow-sm backdrop-blur-sm">
          <CardContent className="p-12 text-center flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 ring-8 ring-primary/5 animate-in zoom-in-75 duration-500">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No notes recorded yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Start documenting your spiritual journey, study insights, and personal revelations.
            </p>
            <Link href="/bible-notes/new">
              <Button className="hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-md shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" />
                Create your first note
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data?.items.map((note: BibleNote, index: number) => {
            const isExpanded = expandedId === note.id
            return (
              <div
                key={note.id}
                className="group relative animate-in fade-in slide-in-from-bottom-3 duration-500"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity bg-card/80 z-10"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteId(note.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Card
                  className="hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer bg-card/60 backdrop-blur-sm"
                  onClick={() => toggleExpand(note.id)}
                >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">
                        {note.title || 'Untitled Note'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {note.verse_refs.map((ref) => (
                          <Badge key={ref} variant="secondary">
                            {ref}
                          </Badge>
                        ))}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(note.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
                    )}
                  </div>
                  {isExpanded && (
                    <div className="mt-4 space-y-3 pt-4 border-t border-border/50">
                      <div className="text-sm text-muted-foreground line-clamp-4">
                        <HtmlContent html={note.content} />
                      </div>
                      <Link href={`/bible-notes/${note.id}`} onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          View Full Note
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
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

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={!!deleteId}
        title="Delete Bible Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteMutation.isPending}
        error={deleteMutation.isError ? 'Failed to delete note. Please try again.' : null}
      />
    </div>
  )
}
