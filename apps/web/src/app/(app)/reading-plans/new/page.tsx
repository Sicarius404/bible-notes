'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createReadingPlan } from '@bible-notes/pocketbase-client'
import type { ReadingPlanDay } from '@bible-notes/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Minus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  total_days: z.coerce.number().min(1, 'Must be at least 1 day'),
  start_date: z.string().min(1, 'Start date is required'),
  days: z.array(
    z.object({
      passages: z.string(),
    })
  ),
})

type FormData = z.infer<typeof schema>

export default function NewReadingPlanPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      total_days: 30,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      days: Array.from({ length: 30 }, () => ({ passages: '' })),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'days',
  })

  const totalDays = watch('total_days')

  useEffect(() => {
    const target = Math.max(1, Number(totalDays) || 1)
    const current = getValues('days').length
    if (target === current) return
    if (target > current) {
      for (let i = 0; i < target - current; i++) {
        append({ passages: '' })
      }
    } else {
      for (let i = current - 1; i >= target; i--) {
        remove(i)
      }
    }
  }, [totalDays, append, remove, getValues])

  const mutation = useMutation({
    mutationFn: (data: {
      name: string
      total_days: number
      start_date: string
      plan_data: ReadingPlanDay[]
    }) => createReadingPlan(data),
    onSuccess: (plan) => {
      queryClient.invalidateQueries({ queryKey: ['reading-plans'] })
      router.push(`/reading-plans/${plan.id}`)
    },
  })

  const onSubmit = (data: FormData) => {
    const planData: ReadingPlanDay[] = data.days.map((day, index) => ({
      day: index + 1,
      passages: day.passages
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0),
    }))

    mutation.mutate({
      name: data.name,
      total_days: data.days.length,
      start_date: data.start_date,
      plan_data: planData,
    })
  }

  const handleAddDay = () => {
    append({ passages: '' })
    const newLength = getValues('days').length
    setValue('total_days', newLength, { shouldValidate: false })
  }

  const handleRemoveDay = (index: number) => {
    if (getValues('days').length <= 1) return
    remove(index)
    const newLength = getValues('days').length
    setValue('total_days', newLength, { shouldValidate: false })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/reading-plans">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-semibold">New Reading Plan</h2>
          <p className="text-muted-foreground">
            Create a custom Bible reading plan
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                placeholder="e.g., My Custom Plan"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_days">Total Days</Label>
                <Input
                  id="total_days"
                  type="number"
                  min={1}
                  {...register('total_days')}
                />
                {errors.total_days && (
                  <p className="text-sm text-destructive">
                    {errors.total_days.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" type="date" {...register('start_date')} />
                {errors.start_date && (
                  <p className="text-sm text-destructive">
                    {errors.start_date.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daily Passages</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddDay}>
              <Plus className="h-4 w-4 mr-1" />
              Add Day
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-muted shrink-0">
                  <span className="text-sm font-medium">{index + 1}</span>
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor={`days.${index}.passages`} className="text-xs">
                    Passages (comma-separated)
                  </Label>
                  <Input
                    id={`days.${index}.passages`}
                    placeholder="e.g., Genesis 1-3, Matthew 1"
                    {...register(`days.${index}.passages`)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 mt-5"
                  onClick={() => handleRemoveDay(index)}
                  disabled={fields.length <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {errors.days && (
              <p className="text-sm text-destructive">
                {errors.days.message}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link href="/reading-plans">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Plan'}
          </Button>
        </div>

        {mutation.isError && (
          <p className="text-sm text-destructive">
            Failed to save plan. Please try again.
          </p>
        )}
      </form>
    </div>
  )
}
