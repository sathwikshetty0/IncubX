'use client'

import React from 'react'
import Link from 'next/link'
import {
  Users, Award, BookOpen, AlertCircle, TrendingUp, CheckCircle2,
  Clock, UserPlus, FileText, Megaphone, Building2, ArrowRight,
  LayoutDashboard, Layers, GraduationCap, Settings
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatCard } from '@/components/shared/stat-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ADMIN_USER } from '@/lib/mock-admin-user'
import { formatDate } from '@/lib/utils'

const recentActivity = [
  { id: 1, type: 'application', icon: FileText, color: 'text-blue-600 bg-blue-50', desc: 'GreenHarvest AgriTech applied to Cohort 3', time: '2025-04-09T10:23:00' },
  { id: 2, type: 'mentor', icon: UserPlus, color: 'text-purple-600 bg-purple-50', desc: 'Mentor Vikram Nair pending approval', time: '2025-04-09T09:45:00' },
  { id: 3, type: 'team', icon: Users, color: 'text-indigo-600 bg-indigo-50', desc: 'HealthSync Pro submitted MVP milestone', time: '2025-04-09T09:12:00' },
  { id: 4, type: 'cohort', icon: GraduationCap, color: 'text-green-600 bg-green-50', desc: 'Cohort 2 batch marked as completed', time: '2025-04-08T18:30:00' },
  { id: 5, type: 'resource', icon: FileText, color: 'text-amber-600 bg-amber-50', desc: 'FinFlow Payments requested ₹50K resource grant', time: '2025-04-08T17:10:00' },
  { id: 6, type: 'announcement', icon: Megaphone, color: 'text-pink-600 bg-pink-50', desc: 'Announcement sent to all active cohort teams', time: '2025-04-08T14:00:00' },
  { id: 7, type: 'user', icon: UserPlus, color: 'text-teal-600 bg-teal-50', desc: 'New team member Anjali Mehta onboarded to EduSpark', time: '2025-04-08T12:45:00' },
  { id: 8, type: 'mentor', icon: Award, color: 'text-purple-600 bg-purple-50', desc: 'Dr. Suresh Iyer assigned to CropAI as primary mentor', time: '2025-04-08T11:00:00' },
  { id: 9, type: 'application', icon: FileText, color: 'text-blue-600 bg-blue-50', desc: 'LegalEase LawTech application rejected with feedback', time: '2025-04-08T10:15:00' },
  { id: 10, type: 'team', icon: Building2, color: 'text-orange-600 bg-orange-50', desc: 'NanoMed Diagnostics updated company profile', time: '2025-04-07T16:30:00' },
]

const pendingActions = [
  { id: 1, title: '5 Pending Applications', desc: 'Teams awaiting admission decisions', href: '/admin/applications', icon: FileText, color: 'border-l-blue-500', count: 5 },
  { id: 2, title: '2 Mentor Approvals', desc: 'New mentor profiles need review', href: '/admin/mentors', icon: Award, color: 'border-l-purple-500', count: 2 },
  { id: 3, title: '3 Resource Requests', desc: 'Budget requests pending approval', href: '/admin/teams', icon: AlertCircle, color: 'border-l-amber-500', count: 3 },
]

const quickLinks = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Programs', href: '/admin/programs', icon: Layers },
  { label: 'Cohorts', href: '/admin/cohorts', icon: GraduationCap },
  { label: 'Teams', href: '/admin/teams', icon: Users },
  { label: 'Mentors', href: '/admin/mentors', icon: Award },
  { label: 'Users', href: '/admin/users', icon: UserPlus },
  { label: 'Applications', href: '/admin/applications', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return formatDate(isoString)
}

export default function AdminDashboardPage() {
  return (
    <DashboardLayout user={ADMIN_USER} title="Admin Dashboard">
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Teams"
            value={42}
            icon={<Users />}
            trend={{ direction: 'up', percentage: 12, label: 'vs last cohort' }}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
          />
          <StatCard
            label="Active Mentors"
            value={18}
            icon={<Award />}
            trend={{ direction: 'up', percentage: 6, label: 'vs last quarter' }}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
          <StatCard
            label="Open Cohorts"
            value={3}
            icon={<BookOpen />}
            trend={{ direction: 'down', percentage: 0, label: 'same as before' }}
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
          <StatCard
            label="Pending Actions"
            value={7}
            icon={<AlertCircle />}
            trend={{ direction: 'up', percentage: 40, label: 'needs attention' }}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Pending Actions */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Pending Actions</h2>
              <Badge variant="warning" dot>7 total</Badge>
            </div>
            <div className="space-y-3">
              {pendingActions.map(action => (
                <Link key={action.id} href={action.href}>
                  <div className={`rounded-lg border border-gray-200 bg-white p-4 border-l-4 ${action.color} hover:shadow-md transition-shadow cursor-pointer`}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 shrink-0">
                        <action.icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">{action.title}</p>
                          <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                            {action.count}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500">{action.desc}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Links */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Quick Links</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    <link.icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="divide-y divide-gray-50">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${activity.color}`}>
                      <activity.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 leading-snug">{activity.desc}</p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400 mt-0.5">{timeAgo(activity.time)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <h3 className="text-sm font-semibold text-gray-900">Program Health</h3>
            </div>
            <div className="space-y-2">
              {[
                { label: 'On Track', value: 28, total: 42, color: 'bg-green-500' },
                { label: 'At Risk', value: 10, total: 42, color: 'bg-amber-400' },
                { label: 'Critical', value: 4, total: 42, color: 'bg-red-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="w-16 text-xs text-gray-500">{item.label}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.value / item.total) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-4 text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-gray-900">This Week</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Sessions Booked', value: 24 },
                { label: 'Submissions Reviewed', value: 31 },
                { label: 'New Team Members', value: 8 },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-gray-900">Upcoming Deadlines</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Cohort 3 Applications', date: 'Apr 15, 2025', urgent: true },
                { label: 'Q1 Budget Review', date: 'Apr 20, 2025', urgent: false },
                { label: 'Demo Day – Cohort 2', date: 'Apr 28, 2025', urgent: false },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <Badge variant={item.urgent ? 'warning' : 'default'} className="text-xs">{item.date}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
