'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { createSmallGroupNote } from '@bible-notes/pocketbase-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

const schema = z.object({
  date: z.string().min(1, 'Date is required'),
  topic: z.string().min(1, 'Topic is required'),
  attendees: z.string().min(1, 'Attendees are required'),
  content: z.string().min(1, 'Content is required'),
})

type FormData = z.infer<typeof schema>

export default function NewSmallGroupPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      topic: '',
      attendees: '',
      content: '',
    },
  })

  const mutation = useMutation({
    mutationFn: createSmallGroupNote,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['small-groups'] })
      router.push(`/small-groups/${data.id}`)
    },
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/small-groups')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-semibold">New Small Group Note</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Note Details</CardTitle>
        </CardHeader>
        <CardContent>
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
              <Input id="topic" placeholder="e.g. Romans 8 Study" {...register('topic')} />
              {errors.topic && (
                <p className="text-sm text-destructive">{errors.topic.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendees">Attendees</Label>
              <Input id="attendees" placeholder="John, Mary, Peter, Sarah" {...register('attendees')} />
              {errors.attendees && (
                <p className="text-sm text-destructive">{errors.attendees.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write the note content here..."
                rows={12}
                {...register('content')}
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/small-groups')}>
                Cancel
              </Button>
            </div>

            {mutation.isError && (
              <p className="text-sm text-destructive">Failed to save note. Please try again.</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
