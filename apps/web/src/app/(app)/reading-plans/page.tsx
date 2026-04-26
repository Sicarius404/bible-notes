'use client'

import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  listReadingPlans,
  importReadingPlan,
  getAllProgressRecords,
} from '@bible-notes/pocketbase-client'
import { READING_PLAN_PRESETS } from '@bible-notes/shared'
import type { ReadingPlan, ReadingPlanProgress } from '@bible-notes/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, BookOpen } from 'lucide-react'

async function loadSeedPlan(key: string) {
  const response = await fetch(`/seed/reading-plans/${key}.json`)
  if (!response.ok) throw new Error('Failed to load preset plan')
  return response.json()
}

const PlanProgressCard = React.memo(function PlanProgressCard({
  plan,
  completedCount,
}: {
  plan: ReadingPlan
  completedCount: number
}) {
  const percentage = React.useMemo(
    () => Math.round((completedCount / plan.total_days) * 100),
    [completedCount, plan.total_days]
  )

  return (
    <Link href={`/reading-plans/${plan.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{plan.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Started {format(new Date(plan.start_date), 'MMMM d, yyyy')}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{plan.total_days} days</span>
            <span className="font-medium">{percentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-primary h-2.5 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
})

export default function ReadingPlansPage() {
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customDays, setCustomDays] = useState('30')
  const [customStartDate, setCustomStartDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  )

  const { data: plans, isLoading } = useQuery({
    queryKey: ['reading-plans'],
    queryFn: listReadingPlans,
  })

  const { data: allProgress } = useQuery({
    queryKey: ['reading-plans-progress'],
    queryFn: getAllProgressRecords,
  })

  const progressByPlanId = React.useMemo(() => {
    const map = new Map<string, number>()
    if (!allProgress) return map
    allProgress.forEach((p: ReadingPlanProgress) => {
      if (p.completed) {
        map.set(p.plan_id, (map.get(p.plan_id) ?? 0) + 1)
      }
    })
    return map
  }, [allProgress])

  const importMutation = useMutation({
    mutationFn: async (key: string) => {
      const seed = await loadSeedPlan(key)
      return importReadingPlan(seed)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-plans'] })
      queryClient.invalidateQueries({ queryKey: ['reading-plans-progress'] })
      setIsDialogOpen(false)
    },
  })

  const createCustomMutation = useMutation({
    mutationFn: () => {
      const totalDays = parseInt(customDays, 10)
      if (!customName.trim() || isNaN(totalDays) || totalDays < 1) {
        throw new Error('Invalid plan details')
      }
      const planData = Array.from({ length: totalDays }, (_, i) => ({
        day: i + 1,
        passages: [] as string[],
      }))
      return importReadingPlan(
        {
          name: customName.trim(),
          total_days: totalDays,
          days: planData,
        },
        customStartDate
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-plans'] })
      queryClient.invalidateQueries({ queryKey: ['reading-plans-progress'] })
      setIsDialogOpen(false)
      setCustomName('')
      setCustomDays('30')
      setCustomStartDate(format(new Date(), 'yyyy-MM-dd'))
    },
  })

  const handlePresetSelect = (key: string) => {
    importMutation.mutate(key)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createCustomMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Reading Plans</h2>
          <p className="text-muted-foreground">Track your Bible reading progress</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Start a Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="h-2.5 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : plans && plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <PlanProgressCard
              key={plan.id}
              plan={plan}
              completedCount={progressByPlanId.get(plan.id) ?? 0}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No reading plans yet.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Start your first plan
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Start a Reading Plan</DialogTitle>
            <DialogDescription>
              Choose a preset plan or create your own custom plan.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="presets">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            <TabsContent value="presets" className="space-y-3 mt-3">
              <p className="text-sm text-muted-foreground">
                Select a plan to import:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {READING_PLAN_PRESETS.map((preset) => (
                  <Button
                    key={preset.key}
                    variant="outline"
                    className="justify-start h-auto py-3 px-4"
                    onClick={() => handlePresetSelect(preset.key)}
                    disabled={importMutation.isPending}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{preset.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {preset.totalDays} days
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
              {importMutation.isError && (
                <p className="text-sm text-destructive">
                  Failed to import plan. Please try again.
                </p>
              )}
            </TabsContent>
            <TabsContent value="custom" className="mt-3">
              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plan-name">Plan Name</Label>
                  <Input
                    id="plan-name"
                    placeholder="e.g., My Custom Plan"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total-days">Total Days</Label>
                  <Input
                    id="total-days"
                    type="number"
                    min={1}
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    required
                  />
                </div>
                {createCustomMutation.isError && (
                  <p className="text-sm text-destructive">
                    Failed to create plan. Please try again.
                  </p>
                )}
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createCustomMutation.isPending || !customName.trim()}
                  >
                    {createCustomMutation.isPending
                      ? 'Creating...'
                      : 'Create Plan'}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
