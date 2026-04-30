"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input, InputProps } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "type">>(
  ({ className, disabled, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <div className="relative">
        <Input
          className={cn("pr-10", className)}
          ref={ref}
          disabled={disabled}
          {...props}
          type={showPassword ? "text" : "password"}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowPassword((prev) => !prev)}
          className={cn(
            "absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          aria-controls={id}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
