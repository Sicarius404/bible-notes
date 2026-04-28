'use client'

import { useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getSermon, updateSermon, deleteSermon } from '@bible-notes/pocketbase-client'
import { SERVICE_TYPES, SERVICE_TYPE_LABELS, sermonSchema } from '@bible-notes/shared'
import VerseContent from '@/components/verse-content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CampusInput } from '@/components/campus-input'
import { PastorInput } from '@/components/pastor-input'
import { ArrowLeft, Pencil, Trash2, Save, X, Church } from 'lucide-react'
import type { ServiceType } from '@bible-notes/shared'

type SermonFormData = z.infer<typeof sermonSchema>

export default function SermonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params.id as string
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { data: sermon, isLoading } = useQuery({
    queryKey: ['sermon', id],
    queryFn: () => getSermon(id),
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SermonFormData>({
    resolver: zodResolver(sermonSchema),
    defaultValues: {
      date: '',
      title: '',
      pastor: '',
      campus: '',
      service_type: 'morning',
      content: '',
    },
  })

  const serviceType = watch('service_type')
  const campus = watch('campus')
  const pastor = watch('pastor')

  const updateMutation = useMutation({
    mutationFn: (data: SermonFormData) => updateSermon(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['sermon', id], updated)
      queryClient.invalidateQueries({ queryKey: ['sermons'] })
      setIsEditing(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteSermon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermons'] })
      router.push('/sermons')
    },
  })

  const handleEdit = useCallback(() => {
    if (sermon) {
      reset({
        date: sermon.date,
        title: sermon.title,
        pastor: sermon.pastor,
        campus: sermon.campus,
        service_type: sermon.service_type,
        content: sermon.content,
      })
      setIsEditing(true)
    }
  }, [sermon, reset])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    if (sermon) {
      reset({
        date: sermon.date,
        title: sermon.title,
        pastor: sermon.pastor,
        campus: sermon.campus,
        service_type: sermon.service_type,
        content: sermon.content,
      })
    }
  }, [sermon, reset])

  const onSubmit = useCallback(
    (data: SermonFormData) => {
      updateMutation.mutate(data)
    },
    [updateMutation]
  )

  const handleDelete = useCallback(() => {
    deleteMutation.mutate()
  }, [deleteMutation])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/sermons')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    )
  }

  if (!sermon) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/sermons')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-semibold">Sermon not found</h2>
        </div>
        <p className="text-muted-foreground">
          The sermon you are looking for does not exist or has been deleted.
        </p>
        <Button onClick={() => router.push('/sermons')}>Back to Sermons</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/sermons')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Church className="h-6 w-6" />
              {isEditing ? 'Edit Sermon' : sermon.title}
            </h2>
            {!isEditing && (
              <p className="text-muted-foreground">
                {sermon.pastor} · {sermon.campus} ·{' '}
                {sermon.date ? format(parseISO(sermon.date), 'MMMM d, yyyy') : ''}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={handleEdit}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Sermon</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this sermon? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
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
            </>
          ) : (
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" {...register('date')} />
                  {errors.date && (
                    <p className="text-xs text-destructive">{errors.date.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Sermon title" {...register('title')} />
                  {errors.title && (
                    <p className="text-xs text-destructive">{errors.title.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pastor">Pastor</Label>
                  <PastorInput
                    value={pastor}
                    onChange={(value) => setValue('pastor', value, { shouldValidate: true })}
                    placeholder="Pastor name"
                  />
                  {errors.pastor && (
                    <p className="text-xs text-destructive">{errors.pastor.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campus">Campus</Label>
                  <CampusInput
                    value={campus}
                    onChange={(value) => setValue('campus', value, { shouldValidate: true })}
                    placeholder="Campus name"
                  />
                  {errors.campus && (
                    <p className="text-xs text-destructive">{errors.campus.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Service Type</Label>
                <div className="rounded-xl border bg-muted/30 p-1">
                  <ToggleGroup
                    type="single"
                    value={serviceType}
                    onValueChange={(value) => {
                      if (!value) return
                      setValue('service_type', value as ServiceType, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      })
                    }}
                    className="grid w-full grid-cols-3 gap-1"
                  >
                    {SERVICE_TYPES.map((type) => (
                      <ToggleGroupItem key={type} value={type} className="w-full rounded-lg">
                        {SERVICE_TYPE_LABELS[type]}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
                {errors.service_type && (
                  <p className="text-xs text-destructive">{errors.service_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Sermon notes and content..."
                  className="min-h-[300px]"
                  {...register('content')}
                />
                {errors.content && (
                  <p className="text-xs text-destructive">{errors.content.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={updateMutation.isPending}>
                  <Save className="h-4 w-4 mr-1" />
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>

              {updateMutation.isError && (
                <p className="text-sm text-destructive">
                  Failed to update sermon. Please try again.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {SERVICE_TYPE_LABELS[sermon.service_type]}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {sermon.date ? format(parseISO(sermon.date), 'EEEE, MMMM d, yyyy') : ''}
            </span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sermon Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                <VerseContent text={sermon.content} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
