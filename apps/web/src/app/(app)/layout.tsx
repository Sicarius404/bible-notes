'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/components/pocketbase-provider'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import {
  Home,
  BookOpen,
  Users,
  Church,
  CalendarCheck,
  Lightbulb,
  LogOut,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/bible-notes', label: 'Bible Notes', icon: BookOpen },
  { href: '/small-groups', label: 'Small Groups', icon: Users },
  { href: '/sermons', label: 'Sermons', icon: Church },
  { href: '/reading-plans', label: 'Reading Plans', icon: CalendarCheck },
  { href: '/revelations', label: 'Revelations', icon: Lightbulb },
]

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const pathname = usePathname()
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        pathname === href
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  )
}

function NavContent({ onClick }: { onClick?: () => void }) {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    onClick?.()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-xl font-semibold">Bible Notes</h1>
        <p className="text-sm text-muted-foreground">{user?.name || user?.email}</p>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <NavLink key={href} href={href} label={label} icon={Icon} />
        ))}
      </nav>
      <div className="pt-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar - hidden on mobile, shown on md+ */}
      <aside className="hidden md:flex w-64 border-r border-border bg-card p-4 flex-col">
        <NavContent />
      </aside>

      {/* Mobile Header - shown on mobile, hidden on md+ */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center gap-4">
        <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-6" aria-describedby={undefined}>
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <NavContent onClick={() => setIsMobileNavOpen(false)} />
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-semibold">Bible Notes</h1>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="max-w-4xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}