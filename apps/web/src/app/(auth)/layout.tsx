export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Bible Notes</h1>
          <p className="text-muted-foreground">Your personal Bible study companion</p>
        </div>
        {children}
      </div>
    </div>
  )
}