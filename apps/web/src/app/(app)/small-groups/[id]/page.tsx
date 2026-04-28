'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, parseISO } from 'date-fns'
import {
  getSmallGroupNote,
  updateSmallGroupNote,
  deleteSmallGroupNote,
} from '@bible-notes/pocketbase-client'
import { smallGroupNoteSchema } from '@bible-notes/shared'
import VerseContent from '@/components/verse-content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'

type FormData = z.infer<typeof smallGroupNoteSchema>

export default function SmallGroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params.id as string
  const [isEditing, setIsEditing] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: note, isLoading } = useQuery({
    queryKey: ['small-group-note', id],
    queryFn: () => getSmallGroupNote(id),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(smallGroupNoteSchema),
    values: note
      ? {
          date: note.date,
          topic: note.topic,
          attendees: note.attendees,
          content: note.content,
        }
      : undefined,
  })

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => updateSmallGroupNote(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['small-group-note', id], updated)
      queryClient.invalidateQueries({ queryKey: ['small-group-notes'] })
      setIsEditing(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteSmallGroupNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['small-group-notes'] })
      router.push('/small-groups')
    },
  })

  const onSubmit = (data: FormData) => {
    updateMutation.mutate(data)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (note) {
      reset({
        date: note.date,
        topic: note.topic,
        attendees: note.attendees,
        content: note.content,
      })
    }
  }

  const handleDelete = () => {
    deleteMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/small-groups')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/small-groups')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-semibold">Note not found</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/small-groups')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-semibold">{note.topic}</h2>
        </div>
        {!isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Note</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this small group note? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
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
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...register('date')} />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input id="topic" {...register('topic')} />
                {errors.topic && (
                  <p className="text-sm text-destructive">{errors.topic.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendees">Attendees</Label>
                <Input id="attendees" {...register('attendees')} />
                {errors.attendees && (
                  <p className="text-sm text-destructive">{errors.attendees.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" rows={12} {...register('content')} />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>

              {updateMutation.isError && (
                <p className="text-sm text-destructive">Failed to update note. Please try again.</p>
              )}
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {format(parseISO(note.date), 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Attendees</h3>
                <p className="text-sm">{note.attendees}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Content</h3>
                <div className="prose prose-sm max-w-none text-sm leading-relaxed">
                  <VerseContent text={note.content} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
