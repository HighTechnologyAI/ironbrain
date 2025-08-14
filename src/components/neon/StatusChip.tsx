import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusChipVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all",
  {
    variants: {
      status: {
        armed: "bg-success/10 text-success border border-success/20",
        ready: "bg-success/10 text-success border border-success/20",
        warning: "bg-warning/10 text-warning border border-warning/20",
        critical: "bg-destructive/10 text-destructive border border-destructive/20",
        info: "bg-info/10 text-info border border-info/20",
        offline: "bg-muted/10 text-muted-foreground border border-muted/20",
        online: "bg-success/10 text-success border border-success/20",
        pending: "bg-warning/10 text-warning border border-warning/20",
        error: "bg-destructive/10 text-destructive border border-destructive/20",
        ok: "bg-success/10 text-success border border-success/20",
        flying: "bg-info/10 text-info border border-info/20",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      status: "info",
      size: "default",
    },
  }
);

export interface StatusChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusChipVariants> {
  children: React.ReactNode;
}

const StatusChip = React.forwardRef<HTMLDivElement, StatusChipProps>(
  ({ className, status, size, children, ...props }, ref) => {
    return (
      <div
        className={cn(statusChipVariants({ status, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);
StatusChip.displayName = "StatusChip";

export { StatusChip, statusChipVariants };