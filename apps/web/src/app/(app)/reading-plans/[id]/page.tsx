'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  getReadingPlan,
  getPlanProgress,
  markDayComplete,
  deleteReadingPlan,
} from '@bible-notes/pocketbase-client'
import type { ReadingPlan, ReadingPlanProgress } from '@bible-notes/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { VerseBadge } from '@/components/verse-badge'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Trash2,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'

function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
      <div
        className="bg-primary h-3 rounded-full transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

const DayCard = React.memo(function DayCard({
  day,
  passages,
  progress,
  onToggle,
  isPending,
}: {
  day: number
  passages: string[]
  progress: ReadingPlanProgress | undefined
  onToggle: () => void
  isPending: boolean
}) {
  const isCompleted = progress?.completed ?? false

  return (
    <Card
      className={isCompleted ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20' : ''}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 mt-0.5"
            onClick={onToggle}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm">Day {day}</span>
              {isCompleted && progress?.completed_at && (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(progress.completed_at), 'MMM d, yyyy')}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {passages.length > 0 ? (
                passages.map((ref) => (
                  <VerseBadge key={ref} reference={ref} />
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  No passages
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

export default function ReadingPlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: plan, isLoading: isPlanLoading } = useQuery<ReadingPlan>({
    queryKey: ['reading-plan', id],
    queryFn: () => getReadingPlan(id),
  })

  const { data: progress, isLoading: isProgressLoading } = useQuery<
    ReadingPlanProgress[]
  >({
    queryKey: ['plan-progress', id],
    queryFn: () => getPlanProgress(id),
  })

  const completionPercentage = React.useMemo(() => {
    if (!progress || !plan) return 0
    const completedDays = progress.filter((p) => p.completed).length
    return Math.round((completedDays / plan.total_days) * 100)
  }, [progress, plan])

  const toggleMutation = useMutation({
    mutationFn: (dayNumber: number) => markDayComplete(id, dayNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-progress', id] })
      queryClient.invalidateQueries({ queryKey: ['reading-plans-progress'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteReadingPlan(id),
    onSuccess: () => {
      router.push('/reading-plans')
    },
  })

  const handleToggleDay = (dayNumber: number) => {
    toggleMutation.mutate(dayNumber)
  }

  const handleDelete = () => {
    deleteMutation.mutate()
  }

  const progressMap = React.useMemo(() => {
    const map = new Map<number, ReadingPlanProgress>()
    progress?.forEach((p) => {
      map.set(p.day_number, p)
    })
    return map
  }, [progress])

  if (isPlanLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 bg-muted rounded w-48 animate-pulse" />
            <div className="h-4 bg-muted rounded w-32 animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                <div className="h-3 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/reading-plans">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-semibold">Plan Not Found</h2>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              This reading plan could not be found.
            </p>
            <Link href="/reading-plans">
              <Button variant="outline" className="mt-4">
                Back to Plans
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/reading-plans">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-semibold">{plan.name}</h2>
            <p className="text-muted-foreground text-sm">
              Started {format(new Date(plan.start_date), 'MMMM d, yyyy')} ·{' '}
              {plan.total_days} days
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {progress?.filter((p) => p.completed).length ?? 0} of{' '}
              {plan.total_days} days completed
            </span>
            <span className="font-medium">
              {completionPercentage}%
            </span>
          </div>
          <ProgressBar percentage={completionPercentage ?? 0} />
        </CardContent>
      </Card>

      {/* Days Grid */}
      {isProgressLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                <div className="h-3 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {plan.plan_data.map((day) => (
            <DayCard
              key={day.day}
              day={day.day}
              passages={day.passages}
              progress={progressMap.get(day.day)}
              onToggle={() => handleToggleDay(day.day)}
              isPending={
                toggleMutation.isPending && toggleMutation.variables === day.day
              }
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reading Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{plan.name}&quot;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
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
