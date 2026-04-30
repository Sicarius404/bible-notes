'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { format } from 'date-fns'
import { listBibleNotes } from '@bible-notes/pocketbase-client'
import { listSermons } from '@bible-notes/pocketbase-client'
import { listRevelations } from '@bible-notes/pocketbase-client'
import { listReadingPlans } from '@bible-notes/pocketbase-client'
import { SERVICE_TYPE_LABELS } from '@bible-notes/shared'
import { BookOpen, Church, Lightbulb, CalendarCheck, Users, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: recentNotes, isLoading: isNotesLoading } = useQuery({
    queryKey: ['bible-notes', { page: 1, per_page: 3 }],
    queryFn: () => listBibleNotes({ page: 1, per_page: 3 }),
  })

  const { data: recentSermons, isLoading: isSermonsLoading } = useQuery({
    queryKey: ['sermons', { page: 1, per_page: 3 }],
    queryFn: () => listSermons({ page: 1, per_page: 3 }),
  })

  const { data: recentRevelations, isLoading: isRevelationsLoading } = useQuery({
    queryKey: ['revelations', { page: 1, per_page: 3 }],
    queryFn: () => listRevelations({ page: 1, per_page: 3 }),
  })

  const { data: plans, isLoading: isPlansLoading } = useQuery({
    queryKey: ['reading-plans'],
    queryFn: () => listReadingPlans(),
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Welcome back</h2>
        <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/bible-notes/new" className="group">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">New Note</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/sermons/new" className="group">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
              <Church className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">New Sermon</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/reading-plans" className="group">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
              <CalendarCheck className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Reading Plan</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/revelations" className="group">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
              <Lightbulb className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Revelation</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Reading Plan Progress */}
      {isPlansLoading && (
        <Card className="animate-pulse">
          <CardHeader className="pb-3">
            <div className="h-5 bg-muted rounded w-1/3" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </CardContent>
        </Card>
      )}
      {plans && plans.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Reading Plans</CardTitle>
              <Link href="/reading-plans" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {plans.slice(0, 2).map((plan) => (
              <Link key={plan.id} href={`/reading-plans/${plan.id}`} className="block">
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                  <div>
                    <p className="font-medium text-sm">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">Started {plan.start_date}</p>
                  </div>
                  <CalendarCheck className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Items */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent Bible Notes */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Recent Notes
              </CardTitle>
              <Link href="/bible-notes" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {isNotesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-2">
                    <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : recentNotes?.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet</p>
            ) : (
              recentNotes?.items.map((note) => (
                <Link key={note.id} href={`/bible-notes/${note.id}`} className="block">
                  <div className="p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <p className="text-sm font-medium truncate">{note.title || 'Untitled Note'}</p>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      {note.verse_refs.slice(0, 3).map((ref) => (
                        <Badge key={ref} variant="secondary" className="text-xs">
                          {ref}
                        </Badge>
                      ))}
                      <span className="text-xs text-muted-foreground">{format(new Date(note.date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Sermons */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Church className="h-4 w-4" /> Recent Sermons
              </CardTitle>
              <Link href="/sermons" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {isSermonsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-2">
                    <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : recentSermons?.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sermons yet</p>
            ) : (
              recentSermons?.items.map((sermon) => (
                <Link key={sermon.id} href={`/sermons/${sermon.id}`} className="block">
                  <div className="p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <p className="text-sm font-medium">{sermon.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {sermon.pastor} · {sermon.campus} · {SERVICE_TYPE_LABELS[sermon.service_type]}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Revelations */}
      {isRevelationsLoading && (
        <Card className="animate-pulse">
          <CardHeader className="pb-3">
            <div className="h-5 bg-muted rounded w-1/3" />
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-muted rounded w-full mb-1" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {recentRevelations && recentRevelations.items.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-4 w-4" /> Recent Revelations
              </CardTitle>
              <Link href="/revelations" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentRevelations.items.slice(0, 3).map((rev) => (
              <Link key={rev.id} href={`/revelations/${rev.id}`} className="block">
                <div className="p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <p className="text-sm">{rev.content.length > 100 ? rev.content.slice(0, 100) + '...' : rev.content}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(rev.date), 'MMM d, yyyy')}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
