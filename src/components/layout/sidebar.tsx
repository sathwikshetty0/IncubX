'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Building2,
  Award,
  CreditCard,
  MessageSquare,
  Briefcase,
  GraduationCap,
  TrendingUp,
  ClipboardList,
  ChevronRight,
  Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { UserRole, User } from '@/types'

// ─── Nav Config per Role ───────────────────────────────────────────────────────

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}

function getNavItems(role: UserRole): NavItem[] {
  const common: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  ]

  const adminItems: NavItem[] = [
    { label: 'Organizations', href: '/admin/organizations', icon: <Building2 className="h-4 w-4" /> },
    { label: 'Programs', href: '/admin/programs', icon: <Layers className="h-4 w-4" /> },
    { label: 'Cohorts', href: '/admin/cohorts', icon: <GraduationCap className="h-4 w-4" /> },
    { label: 'Teams', href: '/admin/teams', icon: <Users className="h-4 w-4" /> },
    { label: 'Users', href: '/admin/users', icon: <Users className="h-4 w-4" /> },
    { label: 'Mentors', href: '/admin/mentors', icon: <Award className="h-4 w-4" /> },
    { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { label: 'Reports', href: '/admin/reports', icon: <FileText className="h-4 w-4" /> },
    { label: 'Settings', href: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
  ]

  const programInchargeItems: NavItem[] = [
    { label: 'Cohorts', href: '/program/cohorts', icon: <GraduationCap className="h-4 w-4" /> },
    { label: 'Teams', href: '/program/teams', icon: <Users className="h-4 w-4" /> },
    { label: 'Assignments', href: '/program/assignments', icon: <ClipboardList className="h-4 w-4" /> },
    { label: 'Resources', href: '/program/resources', icon: <BookOpen className="h-4 w-4" /> },
    { label: 'Analytics', href: '/program/analytics', icon: <BarChart3 className="h-4 w-4" /> },
  ]

  const mentorItems: NavItem[] = [
    { label: 'My Schedule', href: '/mentor/schedule', icon: <Calendar className="h-4 w-4" /> },
    { label: 'Bookings', href: '/mentor/bookings', icon: <BookOpen className="h-4 w-4" /> },
    { label: 'Teams', href: '/mentor/teams', icon: <Users className="h-4 w-4" /> },
    { label: 'Messages', href: '/mentor/messages', icon: <MessageSquare className="h-4 w-4" /> },
  ]

  const teamItems: NavItem[] = [
    { label: 'My Team', href: '/team/overview', icon: <Users className="h-4 w-4" /> },
    { label: 'Assignments', href: '/team/assignments', icon: <ClipboardList className="h-4 w-4" /> },
    { label: 'Mentors', href: '/team/mentors', icon: <Award className="h-4 w-4" /> },
    { label: 'Resources', href: '/team/resources', icon: <BookOpen className="h-4 w-4" /> },
    { label: 'Credits', href: '/team/credits', icon: <CreditCard className="h-4 w-4" /> },
    { label: 'Progress', href: '/team/progress', icon: <TrendingUp className="h-4 w-4" /> },
  ]

  const investorItems: NavItem[] = [
    { label: 'Portfolio', href: '/investor/portfolio', icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Startups', href: '/investor/startups', icon: <Building2 className="h-4 w-4" /> },
    { label: 'Analytics', href: '/investor/analytics', icon: <BarChart3 className="h-4 w-4" /> },
  ]

  const roleMap: Record<UserRole, NavItem[]> = {
    super_admin: adminItems,
    admin: adminItems,
    ceo: adminItems,
    program_incharge: programInchargeItems,
    finance_id: [
      { label: 'Finance', href: '/finance/overview', icon: <CreditCard className="h-4 w-4" /> },
      { label: 'Reports', href: '/finance/reports', icon: <FileText className="h-4 w-4" /> },
    ],
    primary_mentor: mentorItems,
    sector_expert: mentorItems,
    product_expert: mentorItems,
    marketing_expert: mentorItems,
    legal_finance_expert: mentorItems,
    general_mentor: mentorItems,
    premium_mentor: mentorItems,
    team_lead: teamItems,
    team_member: teamItems,
    alumni: [
      { label: 'Community', href: '/alumni/community', icon: <Users className="h-4 w-4" /> },
      { label: 'Resources', href: '/alumni/resources', icon: <BookOpen className="h-4 w-4" /> },
    ],
    investor: investorItems,
    applicant: [
      { label: 'Application', href: '/apply', icon: <ClipboardList className="h-4 w-4" /> },
    ],
  }

  return [...common, ...(roleMap[role] || [])]
}

function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    ceo: 'CEO',
    program_incharge: 'Program Incharge',
    finance_id: 'Finance',
    primary_mentor: 'Primary Mentor',
    sector_expert: 'Sector Expert',
    product_expert: 'Product Expert',
    marketing_expert: 'Marketing Expert',
    legal_finance_expert: 'Legal & Finance',
    general_mentor: 'Mentor',
    premium_mentor: 'Premium Mentor',
    team_lead: 'Team Lead',
    team_member: 'Team Member',
    alumni: 'Alumni',
    investor: 'Investor',
    applicant: 'Applicant',
  }
  return labels[role] || role
}

// ─── Sidebar Component ─────────────────────────────────────────────────────────

interface SidebarProps {
  user: Pick<User, 'id' | 'full_name' | 'role' | 'avatar_url' | 'email'>
  collapsed?: boolean
  onToggleCollapse?: () => void
}

function Sidebar({ user, collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const navItems = getNavItems(user.role)

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-100 px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-700">
            <span className="text-sm font-bold text-white">IX</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 leading-tight">INCUBX</p>
              <p className="text-[10px] text-gray-400 leading-tight whitespace-nowrap">
                Where Startups Are Built
              </p>
            </div>
          )}
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={cn(
              'ml-auto flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors',
              collapsed && 'ml-0 mt-0'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRight className={cn('h-4 w-4 transition-transform', !collapsed && 'rotate-180')} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <span className={cn('shrink-0', isActive ? 'text-indigo-600' : 'text-gray-400')}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {!collapsed && item.badge != null && item.badge > 0 && (
                    <Badge variant="indigo" className="ml-auto text-[10px] px-1.5 py-0">
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User profile */}
      <div className="border-t border-gray-100 p-3">
        {collapsed ? (
          <div className="flex justify-center">
            <Avatar
              src={user.avatar_url}
              name={user.full_name}
              size="sm"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-gray-50 transition-colors">
            <Avatar
              src={user.avatar_url}
              name={user.full_name}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{user.full_name}</p>
              <p className="truncate text-[11px] text-gray-400">{getRoleLabel(user.role)}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

export { Sidebar }
