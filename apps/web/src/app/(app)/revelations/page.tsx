'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { listRevelations, createRevelation, updateRevelation, deleteRevelation } from '@bible-notes/pocketbase-client'
import type { Revelation } from '@bible-notes/shared'
import { linkifyVerses } from '@bible-notes/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search, Plus, ChevronLeft, ChevronRight, Pencil, Trash2, X, Check } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

export default function RevelationsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [jotContent, setJotContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editDate, setEditDate] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['revelations', { page, date_from: dateFrom || undefined, date_to: dateTo || undefined, search: debouncedSearch || undefined }],
    queryFn: () => listRevelations({
      page,
      per_page: 10,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      search: debouncedSearch || undefined,
    }),
  })

  const createMutation = useMutation({
    mutationFn: (content: string) => createRevelation({ content }),
    onSuccess: () => {
      setJotContent('')
      queryClient.invalidateQueries({ queryKey: ['revelations'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, content, date }: { id: string; content: string; date: string }) =>
      updateRevelation(id, { content, date }),
    onSuccess: () => {
      setEditingId(null)
      setEditContent('')
      setEditDate('')
      queryClient.invalidateQueries({ queryKey: ['revelations'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRevelation(id),
    onSuccess: () => {
      setDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ['revelations'] })
    },
  })

  const handleJotSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = jotContent.trim()
    if (!trimmed) return
    createMutation.mutate(trimmed)
  }

  const handleJotKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = jotContent.trim()
      if (!trimmed) return
      createMutation.mutate(trimmed)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  const startEdit = (revelation: Revelation) => {
    setEditingId(revelation.id)
    setEditContent(revelation.content)
    setEditDate(revelation.date)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent('')
    setEditDate('')
  }

  const saveEdit = (id: string) => {
    const trimmed = editContent.trim()
    if (!trimmed) return
    updateMutation.mutate({ id, content: trimmed, date: editDate })
  }

  const confirmDelete = (id: string) => {
    setDeleteId(id)
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
          <h2 className="text-2xl font-semibold">Revelations</h2>
          <p className="text-muted-foreground">Quick thoughts and spiritual insights</p>
        </div>
      </div>

      {/* Quick Jot */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleJotSubmit} className="flex gap-3">
            <Input
              placeholder="Jot down a revelation..."
              value={jotContent}
              onChange={(e) => setJotContent(e.target.value)}
              onKeyDown={handleJotKeyDown}
              disabled={createMutation.isPending}
              className="flex-1"
            />
            <Button type="submit" disabled={createMutation.isPending || !jotContent.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </form>
          {createMutation.isError && (
            <p className="text-sm text-destructive mt-2">Failed to save. Please try again.</p>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                <div className="h-3 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No revelations found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data?.items.map((revelation: Revelation) => (
            <Card key={revelation.id} className="group">
              <CardContent className="p-4">
                {editingId === revelation.id ? (
                  <div className="space-y-3">
                    <Input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => saveEdit(revelation.id)}
                        disabled={updateMutation.isPending || !editContent.trim()}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                    {updateMutation.isError && (
                      <p className="text-sm text-destructive">Failed to update. Please try again.</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <Link href={`/revelations/${revelation.id}`} className="flex-1 min-w-0">
                        <div
                          className="text-sm prose prose-sm max-w-none dark:prose-invert line-clamp-3"
                          dangerouslySetInnerHTML={{ __html: linkifyVerses(revelation.content) }}
                        />
                      </Link>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => startEdit(revelation)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => confirmDelete(revelation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(revelation.date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
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

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Revelation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this revelation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
