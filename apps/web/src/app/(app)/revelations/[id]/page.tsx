'use client'

import * as React from 'react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getRevelation, updateRevelation, deleteRevelation } from '@bible-notes/pocketbase-client'
import { revelationSchema, getContentPreview, toDateInputValue } from '@bible-notes/shared'
import RichTextEditor from '@/components/content/rich-text-editor'
import DeleteDialog from '@/components/delete-dialog'
import HtmlContent from '@/components/content/html-content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'

type FormData = z.infer<typeof revelationSchema>

export default function RevelationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { id } = React.use(params)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: revelation, isLoading } = useQuery({
    queryKey: ['revelation', id],
    queryFn: () => getRevelation(id),
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(revelationSchema),
  })

  // Populate the form only once per revelation id, so a cache refresh after a
  // save does not wipe in-progress edits.
  const initializedIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (revelation && initializedIdRef.current !== id) {
      reset({
        date: toDateInputValue(revelation.date),
        content: revelation.content,
      })
      initializedIdRef.current = id
    }
  }, [revelation, id, reset])

  const updateMutation = useMutation({
    mutationFn: (data: { date: string; content: string }) => updateRevelation(id, data),
    onSuccess: (updated) => {
      // Update the detail cache immediately so the saved content shows at once.
      queryClient.setQueryData(['revelation', id], updated)
      queryClient.invalidateQueries({ queryKey: ['revelations'] })
      setIsEditing(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteRevelation(id),
    onSuccess: () => {
      router.push('/revelations')
    },
  })

  const onSubmit = (data: FormData) => {
    updateMutation.mutate({
      date: data.date,
      content: data.content,
    })
  }

  const handleDelete = () => {
    deleteMutation.mutate()
  }

  const handleEdit = useCallback(() => {
    if (!revelation) return
    reset({
      date: toDateInputValue(revelation.date),
      content: revelation.content,
    })
    setIsEditing(true)
  }, [revelation, reset])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    if (!revelation) return
    // Restore the persisted record so unsaved changes are fully discarded.
    reset({
      date: toDateInputValue(revelation.date),
      content: revelation.content,
    })
  }, [revelation, reset])

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

  if (!revelation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/revelations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-semibold">Revelation Not Found</h2>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">This revelation could not be found.</p>
            <Link href="/revelations">
              <Button variant="outline" className="mt-4">
                Back to Revelations
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
          <Link href="/revelations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-semibold">
              {isEditing ? 'Edit Revelation' : format(parseISO(revelation.date), 'MMMM d, yyyy')}
            </h2>
            {!isEditing && (
              <p className="text-muted-foreground text-sm">
                {getContentPreview(revelation.content, 100)}
              </p>
            )}
          </div>
        </div>
        {!isEditing && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Revelation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...register('date')} />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <RichTextEditor
                  value={watch('content') || ''}
                  onChange={(html) => setValue('content', html, { shouldValidate: true, shouldDirty: true })}
                  placeholder="Write your revelation here..."
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {updateMutation.isError && (
            <p className="text-sm text-destructive">Failed to update revelation. Please try again.</p>
          )}
        </form>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="rich-content">
              <HtmlContent html={revelation.content} linkifyVerses />
            </div>
          </CardContent>
        </Card>
      )}

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Revelation"
        description="Are you sure you want to delete this revelation? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isLoading={deleteMutation.isPending}
        error={deleteMutation.isError ? 'Failed to delete revelation. Please try again.' : null}
      />
    </div>
  )
}
