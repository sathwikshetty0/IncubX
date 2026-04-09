import * as React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    direction: 'up' | 'down'
    percentage: number
    label?: string
  }
  iconColor?: string
  iconBg?: string
  className?: string
  onClick?: () => void
}

function StatCard({
  label,
  value,
  icon,
  trend,
  iconColor = 'text-indigo-600',
  iconBg = 'bg-indigo-50',
  className,
  onClick,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-5 shadow-sm',
        onClick && 'cursor-pointer transition-shadow duration-200 hover:shadow-md',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', iconBg)}>
          <div className={cn('h-5 w-5', iconColor)}>{icon}</div>
        </div>

        {/* Trend */}
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              trend.direction === 'up'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            )}
          >
            {trend.direction === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend.percentage}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="mt-1 text-sm text-gray-500">{label}</p>
      </div>

      {/* Trend label */}
      {trend?.label && (
        <p className="mt-2 text-xs text-gray-400">{trend.label}</p>
      )}
    </div>
  )
}

export { StatCard }
