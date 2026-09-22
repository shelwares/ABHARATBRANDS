"use client"
import * as React from "react"
import { motion, useInView, useSpring, useTransform } from "framer-motion"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  color?: "primary" | "warning" | "success" | "ink";
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  prefix = "", 
  suffix = "", 
  icon, 
  trend,
  color = "ink",
  className 
}: StatCardProps) {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  const springValue = useSpring(0, {
    bounce: 0,
    duration: 2000,
  })

  React.useEffect(() => {
    if (isInView) {
      springValue.set(value)
    }
  }, [isInView, springValue, value])

  const displayValue = useTransform(springValue, (current) => {
    return `${prefix}${Math.round(current).toLocaleString()}${suffix}`
  })

  const colorStyles = {
    primary: "text-brand-primary-500 bg-brand-primary-50",
    warning: "text-warning bg-warning/10",
    success: "text-success bg-success/10",
    ink: "text-ink-600 bg-ink-100",
  }

  return (
    <Card ref={ref} className={cn("p-6", className)}>
      <div className="flex items-center justify-between pb-4">
        <h3 className="text-sm font-medium text-ink-600">{title}</h3>
        {icon && (
          <div className={cn("p-2 rounded-lg", colorStyles[color])}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-1">
        <motion.div className="font-display text-3xl font-bold tracking-tight text-ink-900">
          {displayValue}
        </motion.div>
        
        {trend && (
          <div className="flex items-center gap-2 mt-1">
            <span 
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full",
                trend.isPositive ? "text-success bg-success/10" : "text-danger bg-danger/10"
              )}
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
            <span className="text-xs text-ink-500">{trend.label}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
