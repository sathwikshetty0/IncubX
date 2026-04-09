import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number
  label?: string
  showValue?: boolean
  color?: 'indigo' | 'green' | 'amber' | 'red' | 'auto'
  size?: 'sm' | 'md' | 'lg'
}

function getAutoColor(value: number): string {
  if (value >= 70) return 'bg-green-500'
  if (value >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, label, showValue = false, color = 'indigo', size = 'md', ...props }, ref) => {
  const colorClass =
    color === 'auto'
      ? getAutoColor(value)
      : {
          indigo: 'bg-indigo-600',
          green: 'bg-green-500',
          amber: 'bg-amber-500',
          red: 'bg-red-500',
        }[color]

  const sizeClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size]

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && <span className="text-sm text-gray-600">{label}</span>}
          {showValue && (
            <span className="text-sm font-medium text-gray-700">{Math.round(value)}%</span>
          )}
        </div>
      )}
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-gray-100',
          sizeClass,
          className
        )}
        {...props}
        value={value}
      >
        <ProgressPrimitive.Indicator
          className={cn('h-full w-full flex-1 rounded-full transition-all duration-500', colorClass)}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
})

Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
