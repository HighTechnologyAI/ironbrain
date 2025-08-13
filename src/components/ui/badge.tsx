import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center px-3 py-1 text-xs font-semibold font-ui transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 h-7 rounded-full",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border border-border hover:bg-surface-1",
        // UAV Status badges
        armed: "border-transparent bg-primary/20 text-primary border border-primary/30",
        ready: "border-transparent bg-success/20 text-success border border-success/30",
        warning: "border-transparent bg-warning/20 text-warning border border-warning/30",
        critical: "border-transparent bg-destructive/20 text-destructive border border-destructive/30",
        info: "border-transparent bg-info/20 text-info border border-info/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
