'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Plus, Copy, CheckCircle2, Eye, Filter } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ADMIN_USER } from '@/lib/mock-admin-user'
import { formatDate, formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const MOCK_COHORTS = [
  { id: '1', name: 'Cohort 1 – 2023', program: 'Pre-Incubation Program', programId: '1', startDate: '2023-06-01', endDate: '2023-12-15', teams: 12, budget: 600000, status: 'completed' as const },
  { id: '2', name: 'Cohort 2 – 2024', program: 'Incubation Program', programId: '2', startDate: '2024-01-10', endDate: '2024-08-31', teams: 15, budget: 900000, status: 'completed' as const },
  { id: '3', name: 'Cohort 3 – 2025', program: 'Incubation Program', programId: '2', startDate: '2025-02-01', endDate: '2025-08-30', teams: 10, budget: 750000, status: 'active' as const },
  { id: '4', name: 'Cohort 4 – 2025 (Acc)', program: 'Acceleration Program', programId: '3', startDate: '2025-09-01', endDate: '2026-02-28', teams: 0, budget: 1200000, status: 'upcoming' as const },
]

const PROGRAMS = [
  { id: '1', name: 'Pre-Incubation Program' },
  { id: '2', name: 'Incubation Program' },
  { id: '3', name: 'Acceleration Program' },
]

function statusBadge(status: string) {
  const map: Record<string, 'success' | 'indigo' | 'gray'> = { active: 'success', upcoming: 'indigo', completed: 'gray' }
  return <Badge variant={map[status] ?? 'default'} dot>{status}</Badge>
}

function generateLink(cohortId: string): string {
  return `https://app.incubx.in/apply/${cohortId}?ref=admin`
}

export default function AdminCohortsPage() {
  const [cohorts, setCohorts] = useState(MOCK_COHORTS)
  const [programFilter, setProgramFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createdLink, setCreatedLink] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showCompleteModal, setShowCompleteModal] = useState<{ id: string; name: string } | null>(null)
  const [newCohort, setNewCohort] = useState({ name: '', programId: '2', startDate: '', endDate: '', budgetPerTeam: '' })

  const filtered = cohorts.filter(c => {
    const matchProgram = programFilter === 'all' || c.programId === programFilter
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchProgram && matchStatus
  })

  const handleCreate = () => {
    const id = String(cohorts.length + 1)
    const program = PROGRAMS.find(p => p.id === newCohort.programId)
    const link = generateLink(id)
    setCohorts(prev => [...prev, {
      id, name: newCohort.name,
      program: program?.name ?? 'Unknown',
      programId: newCohort.programId,
      startDate: newCohort.startDate, endDate: newCohort.endDate,
      teams: 0, budget: Number(newCohort.budgetPerTeam) * 10,
      status: 'upcoming' as const
    }])
    setCreatedLink(link)
    setShowCreateModal(false)
    setNewCohort({ name: '', programId: '2', startDate: '', endDate: '', budgetPerTeam: '' })
  }

  const handleCopy = (id: string, link: string) => {
    navigator.clipboard.writeText(link).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleMarkComplete = (id: string) => {
    setCohorts(prev => prev.map(c => c.id === id ? { ...c, status: 'completed' as const } : c))
    setShowCompleteModal(null)
  }

  return (
    <DashboardLayout user={ADMIN_USER} title="Cohorts Management">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cohorts</h1>
            <p className="text-sm text-gray-500 mt-0.5">{cohorts.length} cohorts across all programs</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" /> Create Cohort
          </Button>
        </div>

        {/* Enrollment Link Banner */}
        {createdLink && (
          <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            <p className="text-sm text-green-800">Cohort created! Enrollment link:</p>
            <code className="flex-1 text-xs bg-white rounded px-2 py-1 border border-green-200 text-green-700 truncate">{createdLink}</code>
            <Button size="sm" variant="outline" onClick={() => handleCopy('new', createdLink)}>
              <Copy className="h-3.5 w-3.5" /> Copy
            </Button>
            <button onClick={() => setCreatedLink(null)} className="text-green-600 hover:text-green-800 text-xs">Dismiss</button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={programFilter} onValueChange={setProgramFilter}>
            <SelectTrigger className="w-48 h-10"><SelectValue placeholder="All Programs" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {PROGRAMS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-10"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-gray-600">Cohort Name</th>
                <th className="px-5 py-3 text-left font-medium text-gray-600">Program</th>
                <th className="px-5 py-3 text-left font-medium text-gray-600">Duration</th>
                <th className="px-5 py-3 text-left font-medium text-gray-600">Teams</th>
                <th className="px-5 py-3 text-left font-medium text-gray-600">Budget</th>
                <th className="px-5 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-5 py-3 text-left font-medium text-gray-600">Enroll Link</th>
                <th className="px-5 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <Filter className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-400">No cohorts match your filters</p>
                  </td>
                </tr>
              ) : filtered.map(cohort => {
                const link = generateLink(cohort.id)
                return (
                  <tr key={cohort.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/admin/cohorts/${cohort.id}`} className="font-medium text-gray-900 hover:text-indigo-700">
                        {cohort.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{cohort.program}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs">
                      {formatDate(cohort.startDate)} – {formatDate(cohort.endDate)}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">{cohort.teams}</td>
                    <td className="px-5 py-3 text-gray-600">{formatCurrency(cohort.budget)}</td>
                    <td className="px-5 py-3">{statusBadge(cohort.status)}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleCopy(cohort.id, link)}
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        {copiedId === cohort.id ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedId === cohort.id ? 'Copied!' : 'Copy Link'}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/cohorts/${cohort.id}`}>
                          <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /></Button>
                        </Link>
                        {cohort.status === 'active' && (
                          <Button variant="outline" size="sm"
                            onClick={() => setShowCompleteModal({ id: cohort.id, name: cohort.name })}>
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Cohort Modal */}
      <Modal open={showCreateModal} onOpenChange={setShowCreateModal}>
        <ModalContent className="max-w-xl">
          <ModalHeader>
            <ModalTitle>Create New Cohort</ModalTitle>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <Input label="Cohort Name" value={newCohort.name} onChange={e => setNewCohort(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Cohort 5 – 2025 Monsoon" />
            <Select value={newCohort.programId} onValueChange={v => setNewCohort(p => ({ ...p, programId: v }))}>
              <SelectTrigger label="Program"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROGRAMS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Start Date" type="date" value={newCohort.startDate} onChange={e => setNewCohort(p => ({ ...p, startDate: e.target.value }))} />
              <Input label="End Date" type="date" value={newCohort.endDate} onChange={e => setNewCohort(p => ({ ...p, endDate: e.target.value }))} />
            </div>
            <Input label="Budget per Team (₹)" type="number" value={newCohort.budgetPerTeam} onChange={e => setNewCohort(p => ({ ...p, budgetPerTeam: e.target.value }))} placeholder="e.g. 75000" />
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newCohort.name || !newCohort.startDate || !newCohort.endDate}>
              Create &amp; Generate Link
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Mark Complete Modal */}
      <Modal open={!!showCompleteModal} onOpenChange={() => setShowCompleteModal(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Mark Cohort as Completed</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-gray-600">
              Marking <strong>{showCompleteModal?.name}</strong> as completed will graduate all active teams to alumni status. This cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowCompleteModal(null)}>Cancel</Button>
            <Button onClick={() => showCompleteModal && handleMarkComplete(showCompleteModal.id)}>Confirm & Graduate Teams</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  )
}
