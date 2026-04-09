'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, ChevronDown, LogOut, Settings, User as UserIcon } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn, formatDate } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { User, Notification } from '@/types'

interface HeaderProps {
  title?: string
  user: Pick<User, 'id' | 'full_name' | 'role' | 'avatar_url' | 'email'>
  notifications?: Notification[]
  onMarkAllRead?: () => void
  onLogout?: () => void
}

function Header({ title = 'Dashboard', user, notifications = [], onMarkAllRead, onLogout }: HeaderProps) {
  const router = useRouter()
  const unreadCount = notifications.filter(n => !n.is_read).length
  const recentNotifications = notifications.slice(0, 5)

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
    } else {
      router.push('/login')
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Page title */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-lg focus:outline-none"
              align="end"
              sideOffset={8}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              {recentNotifications.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  {recentNotifications.map((notification) => (
                    <DropdownMenu.Item
                      key={notification.id}
                      asChild
                    >
                      <Link
                        href={notification.action_url || '#'}
                        className={cn(
                          'block px-4 py-3 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors',
                          !notification.is_read && 'bg-indigo-50/50'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {!notification.is_read && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                          )}
                          <div className={cn('flex-1', notification.is_read && 'pl-5')}>
                            <p className="text-sm font-medium text-gray-900 leading-snug">
                              {notification.title}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="mt-1 text-[11px] text-gray-400">
                              {formatDate(notification.created_at)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </DropdownMenu.Item>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <Bell className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No notifications yet</p>
                </div>
              )}

              {/* Footer */}
              {notifications.length > 5 && (
                <>
                  <DropdownMenu.Separator className="border-t border-gray-100" />
                  <DropdownMenu.Item asChild>
                    <Link
                      href="/notifications"
                      className="block px-4 py-2.5 text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
                    >
                      View all notifications
                    </Link>
                  </DropdownMenu.Item>
                </>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* User menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <Avatar
                src={user.avatar_url}
                name={user.full_name}
                size="sm"
              />
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {user.full_name.split(' ')[0]}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 w-56 rounded-xl border border-gray-200 bg-white shadow-lg focus:outline-none"
              align="end"
              sideOffset={8}
            >
              {/* User info */}
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>

              <div className="py-1">
                <DropdownMenu.Item asChild>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                  >
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    My Profile
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-gray-400" />
                    Settings
                  </Link>
                </DropdownMenu.Item>
              </div>

              <DropdownMenu.Separator className="border-t border-gray-100" />

              <div className="py-1">
                <DropdownMenu.Item asChild>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:outline-none focus:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </DropdownMenu.Item>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}

export { Header }
