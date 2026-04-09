'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'
import { Header } from './header'
import type { User, Notification } from '@/types'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: Pick<User, 'id' | 'full_name' | 'role' | 'avatar_url' | 'email'>
  title?: string
  notifications?: Notification[]
  onMarkAllRead?: () => void
  onLogout?: () => void
}

function DashboardLayout({
  children,
  user,
  title,
  notifications = [],
  onMarkAllRead,
  onLogout,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Sidebar */}
      <Sidebar
        user={user}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(prev => !prev)}
      />

      {/* Main content area */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300',
          collapsed ? 'ml-16' : 'ml-60'
        )}
      >
        {/* Header */}
        <Header
          title={title}
          user={user}
          notifications={notifications}
          onMarkAllRead={onMarkAllRead}
          onLogout={onLogout}
        />

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export { DashboardLayout }
