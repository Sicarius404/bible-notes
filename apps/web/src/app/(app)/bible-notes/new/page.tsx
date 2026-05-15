'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createBibleNote } from '@bible-notes/pocketbase-client'
import { extractVerseRefs, bibleNoteSchema } from '@bible-notes/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import RichTextEditor from '@/components/rich-text-editor'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type FormData = z.infer<typeof bibleNoteSchema>

export default function NewBibleNotePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [verseRefs, setVerseRefs] = useState<string[]>([])
  const [verseInput, setVerseInput] = useState('')
  const [detectedVerses, setDetectedVerses] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(bibleNoteSchema),
    defaultValues: {
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      content: '',
    },
  })

  const content = watch('content')

  useEffect(() => {
    if (content) {
      const refs = extractVerseRefs(content)
      setDetectedVerses(refs.filter((ref) => !verseRefs.includes(ref)))
    } else {
      setDetectedVerses([])
    }
  }, [content, verseRefs])

  const mutation = useMutation({
    mutationFn: (data: { title: string; date: string; verse_refs: string[]; content: string }) => createBibleNote(data),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ['bible-notes'] })
      router.push(`/bible-notes/${note.id}`)
    },
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate({
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/bible-notes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-semibold">New Bible Note</h2>
          <p className="text-muted-foreground">Record your Bible study insights</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-primary/20 shadow-md bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Note Details</CardTitle>
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
              <Input
                id="date"
                type="date"
                {...register('date')}
              />
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

              {/* Detected verses */}
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

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/bible-notes">
            <Button type="button" variant="outline" className="hover:scale-[1.02] active:scale-95 transition-all duration-200">
              Cancel
            </Button>
          </Link>
          <Button type="submit" className="hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-md shadow-primary/20" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Note'}
          </Button>
        </div>

        {mutation.isError && (
          <p className="text-sm text-destructive">Failed to save note. Please try again.</p>
        )}
      </form>
    </div>
  )
}
