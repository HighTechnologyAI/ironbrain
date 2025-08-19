import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// UAV System Status Chip - unified design
const statusChipVariants = cva(
  "inline-flex items-center justify-center px-3 py-1 text-xs font-semibold font-ui rounded-full h-7 min-w-16_08 transition-all duration-200",
  {
    variants: {
      variant: {
        armed: "bg-primary/20 text-primary border border-primary/30",
        ready: "bg-success/20 text-success border border-success/30",
        warning: "bg-warning/20 text-warning border border-warning/30",
        critical: "bg-destructive/20 text-destructive border border-destructive/30",
        info: "bg-info/20 text-info border border-info/30",
        pending: "bg-muted/30 text-muted-foreground border border-muted/40",
        completed: "bg-success/20 text-success border border-success/30",
        in_progress: "bg-primary/20 text-primary border border-primary/30",
        cancelled: "bg-destructive/20 text-destructive border border-destructive/30",
        on_hold: "bg-warning/20 text-warning border border-warning/30",
      },
      priority: {
        low: "bg-muted/20 text-muted-foreground border border-muted/30",
        medium: "bg-info/20 text-info border border-info/30",
        high: "bg-warning/20 text-warning border border-warning/30",
        critical: "bg-destructive/20 text-destructive border border-destructive/30",
        urgent: "bg-destructive/30 text-destructive border border-destructive/50",
      },
    },
  }
)

export interface StatusChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusChipVariants> {
  variant?: "armed" | "ready" | "warning" | "critical" | "info" | "pending" | "completed" | "in_progress" | "cancelled" | "on_hold"
  priority?: "low" | "medium" | "high" | "critical" | "urgent"
}

const StatusChip = React.forwardRef<HTMLSpanElement, StatusChipProps>(
  ({ className, variant, priority, children, ...props }, ref) => {
    return (
      <span
        className={cn(statusChipVariants({ variant, priority, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </span>
    )
  }
)
StatusChip.displayName = "StatusChip"

export { StatusChip, statusChipVariants }