import * as React from "react"
import { cn } from "@/lib/utils"

export type BadgeVariant = "default" | "joined" | "confirmed" | "shipped" | "delivered" | "cancelled"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-ink-100 text-ink-900",
    joined: "bg-info/10 text-info",
    confirmed: "bg-warning/10 text-warning",
    shipped: "bg-brand-primary-100 text-brand-primary-700",
    delivered: "bg-success/10 text-success",
    cancelled: "bg-danger/10 text-danger",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
