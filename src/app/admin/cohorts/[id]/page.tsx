'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProgressRing } from '@/components/shared/progress-ring'
import { Badge } from '@/components/ui/badge'
import { ADMIN_USER } from '@/lib/mock-admin-user'
import { formatDate, formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const COHORT_DATA: Record<string, { id: string; name: string; program: string; startDate: string; endDate: string; status: string; teams: number; budget: number }> = {
  '1': { id: '1', name: 'Cohort 1 – 2023', program: 'Pre-Incubation Program', startDate: '2023-06-01', endDate: '2023-12-15', status: 'completed', teams: 12, budget: 600000 },
  '2': { id: '2', name: 'Cohort 2 – 2024', program: 'Incubation Program', startDate: '2024-01-10', endDate: '2024-08-31', status: 'completed', teams: 15, budget: 900000 },
  '3': { id: '3', name: 'Cohort 3 – 2025', program: 'Incubation Program', startDate: '2025-02-01', endDate: '2025-08-30', status: 'active', teams: 10, budget: 750000 },
}

const COHORT_TEAMS = [
  { id: '1', name: 'GreenHarvest AgriTech', sector: 'AgriTech', progress: 68, allocated: 75000, used: 45000, status: 'active' },
  { id: '2', name: 'HealthSync Pro', sector: 'HealthTech', progress: 45, allocated: 75000, used: 28000, status: 'active' },
  { id: '3', name: 'EduSpark Learn', sector: 'EdTech', progress: 72, allocated: 75000, used: 52000, status: 'active' },
  { id: '4', name: 'CropAI Solutions', sector: 'AgriTech', progress: 22, allocated: 75000, used: 12000, status: 'active' },
  { id: '5', name: 'CleanWater IoT', sector: 'CleanTech', progress: 55, allocated: 75000, used: 35000, status: 'active' },
  { id: '6', name: 'InsureMe Smart', sector: 'InsurTech', progress: 18, allocated: 75000, used: 8000, status: 'active' },
  { id: '7', name: 'VoiceBot Commerce', sector: 'AI/ML', progress: 57, allocated: 75000, used: 41000, status: 'active' },
  { id: '8', name: 'SolarGrid Rural', sector: 'CleanTech', progress: 33, allocated: 75000, used: 22000, status: 'active' },
  { id: '9', name: 'TalentBridge HR', sector: 'HRTech', progress: 63, allocated: 75000, used: 48000, status: 'active' },
  { id: '10', name: 'BuildTech 3D', sector: 'ConTech', progress: 41, allocated: 75000, used: 31000, status: 'suspended' },
]

const ASSIGNMENTS = [
  { id: '1', title: 'Business Model Canvas', dueDate: '2025-03-01', submitted: 9, total: 10, status: 'completed' },
  { id: '2', title: 'Customer Discovery Report', dueDate: '2025-03-15', submitted: 8, total: 10, status: 'completed' },
  { id: '3', title: 'Financial Projections Q1', dueDate: '2025-04-01', submitted: 6, total: 10, status: 'active' },
  { id: '4', title: 'MVP Demo Presentation', dueDate: '2025-04-20', submitted: 3, total: 10, status: 'active' },
  { id: '5', title: 'Go-to-Market Strategy', dueDate: '2025-05-10', submitted: 0, total: 10, status: 'upcoming' },
]

export default function CohortDetailPage() {
  const params = useParams()
  const cohortId = String(params.id)
  const cohort = COHORT_DATA[cohortId] ?? COHORT_DATA['3']

  const [activeTab, setActiveTab] = useState<'teams' | 'budget' | 'assignments'>('teams')

  const totalAllocated = COHORT_TEAMS.reduce((a, t) => a + t.allocated, 0)
  const totalUsed = COHORT_TEAMS.reduce((a, t) => a + t.used, 0)

  return (
    <DashboardLayout user={ADMIN_USER} title={cohort.name}>
      <div className="space-y-5">
        {/* Back + Header */}
        <div className="flex items-start gap-4">
          <Link href="/admin/cohorts" className="mt-1 rounded-md p-1.5 text-gray-400 hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{cohort.name}</h1>
              <Badge variant={cohort.status === 'active' ? 'success' : cohort.status === 'upcoming' ? 'indigo' : 'gray'} dot>
                {cohort.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {cohort.program} · {formatDate(cohort.startDate)} – {formatDate(cohort.endDate)} · {cohort.teams} teams
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200">
          {(['teams', 'budget', 'assignments'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 capitalize transition-colors',
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {COHORT_TEAMS.map(team => (
              <div key={team.id} className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/admin/teams/${team.id}`} className="font-medium text-gray-900 hover:text-indigo-700 text-sm">
                      {team.name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">{team.sector}</p>
                  </div>
                  <Badge variant={team.status === 'active' ? 'success' : 'warning'} dot>{team.status}</Badge>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <ProgressRing value={team.progress} size={48} strokeWidth={5} />
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Budget Used</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(team.used)}</p>
                    <p className="text-xs text-gray-400">of {formatCurrency(team.allocated)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Allocated', value: totalAllocated, color: 'text-indigo-600' },
                { label: 'Total Used', value: totalUsed, color: 'text-amber-600' },
                { label: 'Total Remaining', value: totalAllocated - totalUsed, color: 'text-green-600' },
              ].map(item => (
                <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-5">
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className={cn('text-2xl font-bold mt-1', item.color)}>{formatCurrency(item.value)}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Per-Team Budget Breakdown</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium text-gray-600">Team</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-600">Allocated</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-600">Used</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-600">Remaining</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-600">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {COHORT_TEAMS.map(team => {
                    const pct = Math.round((team.used / team.allocated) * 100)
                    return (
                      <tr key={team.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-900">{team.name}</td>
                        <td className="px-5 py-3 text-gray-600">{formatCurrency(team.allocated)}</td>
                        <td className="px-5 py-3 text-amber-600 font-medium">{formatCurrency(team.used)}</td>
                        <td className="px-5 py-3 text-green-600 font-medium">{formatCurrency(team.allocated - team.used)}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-24">
                              <div className={cn('h-full rounded-full', pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-amber-400' : 'bg-green-500')}
                                style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-600">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Assignments ({ASSIGNMENTS.length})</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Assignment</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Due Date</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Submissions</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Completion</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ASSIGNMENTS.map(a => {
                  const pct = Math.round((a.submitted / a.total) * 100)
                  return (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{a.title}</td>
                      <td className="px-5 py-3 text-gray-600">{formatDate(a.dueDate)}</td>
                      <td className="px-5 py-3 text-gray-600">{a.submitted}/{a.total}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={cn('h-full rounded-full', pct === 100 ? 'bg-green-500' : pct > 50 ? 'bg-indigo-500' : 'bg-amber-400')}
                              style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-600">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={a.status === 'completed' ? 'success' : a.status === 'active' ? 'indigo' : 'default'}>
                          {a.status}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
