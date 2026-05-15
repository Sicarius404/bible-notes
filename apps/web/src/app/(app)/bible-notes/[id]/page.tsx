'use client'

import * as React from 'react'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getBibleNote, updateBibleNote, deleteBibleNote } from '@bible-notes/pocketbase-client'
import { extractVerseRefs, bibleNoteSchema } from '@bible-notes/shared'
import VerseContent from '@/components/verse-content'
import RichTextEditor from '@/components/rich-text-editor'
import DeleteDialog from '@/components/delete-dialog'
import HtmlContent from '@/components/html-content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { X, Pencil, Trash2, Plus, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

type FormData = z.infer<typeof bibleNoteSchema>

export default function BibleNotePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { id } = React.use(params)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [verseRefs, setVerseRefs] = useState<string[]>([])
  const [verseInput, setVerseInput] = useState('')
  const [detectedVerses, setDetectedVerses] = useState<string[]>([])

  const { data: note, isLoading } = useQuery({
    queryKey: ['bible-note', id],
    queryFn: () => getBibleNote(id),
  })

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(bibleNoteSchema),
  })

  const content = watch('content')

  useEffect(() => {
    if (note) {
      reset({
        title: note.title,
        date: note.date,
        content: note.content,
      })
      setVerseRefs(note.verse_refs || [])
    }
  }, [note, reset])

  useEffect(() => {
    if (content) {
      const refs = extractVerseRefs(content)
      setDetectedVerses(refs.filter((ref) => !verseRefs.includes(ref)))
    } else {
      setDetectedVerses([])
    }
  }, [content, verseRefs])

  const updateMutation = useMutation({
    mutationFn: (data: { title: string; date: string; verse_refs: string[]; content: string }) =>
      updateBibleNote(id, data),
    onSuccess: () => {
      setIsEditing(false)
      queryClient.invalidateQueries({ queryKey: ['bible-notes'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteBibleNote(id),
    onSuccess: () => {
      router.push('/bible-notes')
    },
  })

  const onSubmit = (data: FormData) => {
    updateMutation.mutate({
      title: data.title,
      date: data.date,
      verse_refs: verseRefs,
      content: data.content,
    })
  }

  const handleAddVerse = useCallback(() => {
    const trimmed = verseInput.trim()
    if (!trimmed) return
    if (verseRefs.includes(trimmed)) {
      setVerseInput('')
      return
    }
    setVerseRefs((prev) => [...prev, trimmed])
    setVerseInput('')
  }, [verseInput, verseRefs])

  const handleRemoveVerse = useCallback((ref: string) => {
    setVerseRefs((prev) => prev.filter((r) => r !== ref))
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddVerse()
    }
  }

  const handleAddDetected = (ref: string) => {
    setVerseRefs((prev) => [...prev, ref])
  }

  const handleDelete = () => {
    deleteMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 bg-muted rounded w-48 animate-pulse" />
            <div className="h-4 bg-muted rounded w-32 animate-pulse" />
          </div>
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6 space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/bible-notes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-semibold">Note Not Found</h2>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">This note could not be found.</p>
            <Link href="/bible-notes">
              <Button variant="outline" className="mt-4">
                Back to Notes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/bible-notes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-semibold">
              {isEditing ? 'Edit Note' : note.title}
            </h2>
            {!isEditing && (
              <p className="text-muted-foreground text-sm">
                {format(new Date(note.date), 'MMMM d, yyyy')} &middot; {note.verse_refs.length} verse{note.verse_refs.length !== 1 ? 's' : ''} referenced
              </p>
            )}
          </div>
        </div>
        {!isEditing && (
          <div className="flex items-center gap-2">
            <Button variant="outline" className="hover:scale-[1.02] active:scale-95 transition-all duration-200" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" className="hover:scale-[1.02] active:scale-95 transition-all duration-200" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-primary/20 shadow-md bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Edit Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a title for your note..."
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...register('date')} />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message}</p>
                )}
              </div>

              {/* Verse References */}
              <div className="space-y-2">
                <Label htmlFor="verse_refs">Verse References</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {verseRefs.map((ref) => (
                    <Badge key={ref} variant="secondary" className="flex items-center gap-1">
                      {ref}
                      <button
                        type="button"
                        onClick={() => handleRemoveVerse(ref)}
                        className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="verse_refs"
                    placeholder="e.g. John 3:16"
                    value={verseInput}
                    onChange={(e) => setVerseInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Button type="button" variant="outline" onClick={handleAddVerse}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Press Enter to add a verse reference</p>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <RichTextEditor
                  value={content || ''}
                  onChange={(html) => setValue('content', html, { shouldValidate: true, shouldDirty: true })}
                  placeholder="Write your notes here..."
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}

                {detectedVerses.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Detected verses:</span>
                    {detectedVerses.map((ref) => (
                      <button
                        key={ref}
                        type="button"
                        onClick={() => handleAddDetected(ref)}
                        className="text-primary hover:underline cursor-pointer"
                      >
                        {ref}
                      </button>
                    ))}
                    <span className="text-xs">(click to add)</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" className="hover:scale-[1.02] active:scale-95 transition-all duration-200" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" className="hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-md shadow-primary/20" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {updateMutation.isError && (
            <p className="text-sm text-destructive">Failed to update note. Please try again.</p>
          )}
        </form>
      ) : (
        <Card className="shadow-sm border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 md:p-8 space-y-6">
            {/* Verse Badges */}
            {note.verse_refs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {note.verse_refs.map((ref) => (
                  <a
                    key={ref}
                    href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(ref)}&version=NIV`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10 transition-colors flex items-center gap-1">
                      {ref}
                      <ExternalLink className="h-3 w-3" />
                    </Badge>
                  </a>
                ))}
              </div>
            )}

            {/* Content */}
            <HtmlContent html={note.content} />
          </CardContent>
        </Card>
      )}

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Bible Note"
        description={`Are you sure you want to delete "${note.title || 'Untitled Note'}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isLoading={deleteMutation.isPending}
        error={deleteMutation.isError ? 'Failed to delete note. Please try again.' : null}
      />
    </div>
  )
}
