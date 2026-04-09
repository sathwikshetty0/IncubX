import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
  label?: string
}

function getColor(value: number): string {
  if (value >= 70) return '#059669' // green
  if (value >= 40) return '#B45309' // amber
  return '#DC2626' // red
}

function ProgressRing({
  value,
  size = 64,
  strokeWidth = 5,
  className,
  showLabel = true,
  label,
}: ProgressRingProps) {
  const clampedValue = Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference
  const color = getColor(clampedValue)
  const fontSize = size <= 40 ? 9 : size <= 64 ? 12 : 14

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-label={`Progress: ${clampedValue}%`}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-semibold leading-none"
            style={{ fontSize, color }}
          >
            {Math.round(clampedValue)}%
          </span>
          {label && (
            <span
              className="text-gray-500 leading-none mt-0.5"
              style={{ fontSize: fontSize - 3 }}
            >
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export { ProgressRing }
