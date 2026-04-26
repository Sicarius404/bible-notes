'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { listBibleNotes } from '@bible-notes/pocketbase-client'
import type { BibleNote } from '@bible-notes/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

export default function BibleNotesPage() {
  const [page, setPage] = useState(1)
  const [verseRef, setVerseRef] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

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
        <Link href="/bible-notes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </Link>
      </div>

      {/* Filters */}
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
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No Bible notes found.</p>
            <Link href="/bible-notes/new">
              <Button variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create your first note
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data?.items.map((note: BibleNote) => (
            <Link key={note.id} href={`/bible-notes/${note.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {note.verse_refs.map((ref) => (
                      <Badge key={ref} variant="secondary">
                        {ref}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {format(new Date(note.date), 'MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {note.content.length > 200 ? note.content.slice(0, 200) + '...' : note.content}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
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
    </div>
  )
}
