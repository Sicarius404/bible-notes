'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createSermon } from '@bible-notes/pocketbase-client'
import { SERVICE_TYPES, SERVICE_TYPE_LABELS } from '@bible-notes/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { CampusInput } from '@/components/campus-input'
import { PastorInput } from '@/components/pastor-input'
import { ArrowLeft, Save } from 'lucide-react'
import type { ServiceType } from '@bible-notes/shared'
import { cn } from '@/lib/utils'

const serviceTypeSchema = z.custom<ServiceType>(
  (value): value is ServiceType =>
    typeof value === 'string' && SERVICE_TYPES.includes(value as ServiceType),
  {
    message: 'Choose Morning, Evening, or Special.',
  }
)

const sermonSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  title: z.string().min(1, 'Title is required'),
  pastor: z.string().min(1, 'Pastor is required'),
  campus: z.string().min(1, 'Campus is required'),
  service_type: serviceTypeSchema,
  content: z.string().min(1, 'Content is required'),
})

type SermonFormData = z.infer<typeof sermonSchema>

export default function NewSermonPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SermonFormData>({
    resolver: zodResolver(sermonSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
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

  const createMutation = useMutation({
    mutationFn: createSermon,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sermons'] })
      router.push(`/sermons/${data.id}`)
    },
  })

  const onSubmit = useCallback(
    (data: SermonFormData) => {
      createMutation.mutate(data)
    },
    [createMutation]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/sermons')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">New Sermon</h2>
          <p className="text-muted-foreground">Record a new sermon note</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sermon Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date')}
                />
                {errors.date && (
                  <p className="text-xs text-destructive">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Sermon title"
                  {...register('title')}
                />
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
              <div
                className={cn(
                  'rounded-xl border bg-muted/30 p-1',
                  errors.service_type && 'border-destructive'
                )}
              >
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
              <Button type="submit" disabled={createMutation.isPending}>
                <Save className="h-4 w-4 mr-1" />
                {createMutation.isPending ? 'Saving...' : 'Save Sermon'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/sermons')}
              >
                Cancel
              </Button>
            </div>

            {createMutation.isError && (
              <p className="text-sm text-destructive">
                Failed to save sermon. Please try again.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
