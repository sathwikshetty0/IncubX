'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn, getInitials } from '@/lib/utils'

const AVATAR_COLORS = [
  'bg-indigo-500',
  'bg-violet-500',
  'bg-blue-500',
  'bg-cyan-500',
  'bg-teal-500',
  'bg-green-500',
  'bg-amber-500',
  'bg-orange-500',
  'bg-rose-500',
  'bg-pink-500',
]

function getColorFromName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const avatarSizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

export interface AvatarProps {
  src?: string | null
  name?: string
  size?: keyof typeof avatarSizes
  className?: string
  showStatus?: boolean
  status?: 'online' | 'offline' | 'away'
}

function Avatar({ src, name = '', size = 'md', className, showStatus, status = 'offline' }: AvatarProps) {
  const initials = getInitials(name || 'U')
  const colorClass = getColorFromName(name || 'U')
  const sizeClass = avatarSizes[size]

  return (
    <div className="relative inline-flex">
      <AvatarPrimitive.Root
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full',
          sizeClass,
          className
        )}
      >
        {src && (
          <AvatarPrimitive.Image
            src={src}
            alt={name}
            className="aspect-square h-full w-full object-cover"
          />
        )}
        <AvatarPrimitive.Fallback
          className={cn(
            'flex h-full w-full items-center justify-center rounded-full font-semibold text-white',
            colorClass
          )}
        >
          {initials}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
            size === 'xs' || size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5',
            status === 'online' && 'bg-green-500',
            status === 'away' && 'bg-amber-500',
            status === 'offline' && 'bg-gray-400'
          )}
        />
      )}
    </div>
  )
}

export { Avatar }
