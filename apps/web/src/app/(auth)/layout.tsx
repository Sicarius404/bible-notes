export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/[0.07] via-background to-background p-4 sm:p-6 overflow-hidden">
      {/* Subtle atmospheric glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2563eb_0%,transparent_65%)] opacity-[0.04]"
      />
      <div className="relative w-full max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Bible Notes</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Your personal Bible study companion</p>
        </div>
        {children}
      </div>
    </div>
  )
}
