import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Orbis base styles
        "w-full px-4 py-2.5 rounded-lg border-2 border-border bg-secondary",
        // Text and placeholder
        "text-foreground placeholder:text-muted-foreground/50 font-nunito",
        // Focus state with Orbis primary color
        "focus:border-primary focus:outline-none focus:ring-0",
        // Transitions
        "transition-colors duration-200",
        // File input
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Selection
        "selection:bg-primary selection:text-primary-foreground",
        // Invalid state
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
