'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Search, Plus, Filter, MoreVertical, Edit, Ban, Trash2,
  ChevronLeft, ChevronRight, CheckSquare, Square, Eye, AlertTriangle
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProgressRing } from '@/components/shared/progress-ring'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter
} from '@/components/ui/modal'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { ADMIN_USER } from '@/lib/mock-admin-user'
import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'

const MOCK_TEAMS = [
  { id: '1', name: 'GreenHarvest AgriTech', product: 'Smart Irrigation Platform', stage: 'MVP', cohort: 'Cohort 3', mentor: 'Dr. Suresh Iyer', status: 'active', progress: 68, sector: 'AgriTech', city: 'Pune' },
  { id: '2', name: 'HealthSync Pro', product: 'AI Diagnostics Assistant', stage: 'Prototype', cohort: 'Cohort 3', mentor: 'Neha Krishnan', status: 'active', progress: 45, sector: 'HealthTech', city: 'Bengaluru' },
  { id: '3', name: 'FinFlow Payments', product: 'UPI Business Suite', stage: 'Growth', cohort: 'Cohort 2', mentor: 'Rajesh Gupta', status: 'active', progress: 87, sector: 'FinTech', city: 'Mumbai' },
  { id: '4', name: 'EduSpark Learn', product: 'Adaptive Learning App', stage: 'MVP', cohort: 'Cohort 3', mentor: 'Dr. Suresh Iyer', status: 'active', progress: 72, sector: 'EdTech', city: 'Hyderabad' },
  { id: '5', name: 'CropAI Solutions', product: 'Crop Disease Detection', stage: 'Idea', cohort: 'Cohort 3', mentor: 'Priya Menon', status: 'active', progress: 22, sector: 'AgriTech', city: 'Nagpur' },
  { id: '6', name: 'NanoMed Diagnostics', product: 'Rapid Pathogen Test Kit', stage: 'Prototype', cohort: 'Cohort 2', mentor: 'Vikram Nair', status: 'suspended', progress: 38, sector: 'HealthTech', city: 'Chennai' },
  { id: '7', name: 'LegalEase LawTech', product: 'Contract Analysis AI', stage: 'MVP', cohort: 'Cohort 1', mentor: 'Anita Rao', status: 'alumni', progress: 95, sector: 'LegalTech', city: 'Delhi' },
  { id: '8', name: 'SafeRoute Logistics', product: 'Cold Chain Monitor', stage: 'Growth', cohort: 'Cohort 2', mentor: 'Rajesh Gupta', status: 'active', progress: 81, sector: 'LogiTech', city: 'Ahmedabad' },
  { id: '9', name: 'CleanWater IoT', product: 'Water Quality Sensors', stage: 'Prototype', cohort: 'Cohort 3', mentor: 'Neha Krishnan', status: 'active', progress: 55, sector: 'CleanTech', city: 'Bhopal' },
  { id: '10', name: 'TalentBridge HR', product: 'Skill Assessment Platform', stage: 'MVP', cohort: 'Cohort 2', mentor: 'Priya Menon', status: 'active', progress: 63, sector: 'HRTech', city: 'Bangalore' },
  { id: '11', name: 'InsureMe Smart', product: 'Parametric Crop Insurance', stage: 'Idea', cohort: 'Cohort 3', mentor: 'Dr. Suresh Iyer', status: 'active', progress: 18, sector: 'InsurTech', city: 'Jaipur' },
  { id: '12', name: 'BuildTech 3D', product: '3D Construction Printing', stage: 'Prototype', cohort: 'Cohort 2', mentor: 'Anita Rao', status: 'suspended', progress: 41, sector: 'ConTech', city: 'Surat' },
  { id: '13', name: 'MediChain RX', product: 'Blockchain Drug Traceability', stage: 'Growth', cohort: 'Cohort 1', mentor: 'Vikram Nair', status: 'alumni', progress: 92, sector: 'HealthTech', city: 'Pune' },
  { id: '14', name: 'VoiceBot Commerce', product: 'Regional Language Chatbot', stage: 'MVP', cohort: 'Cohort 3', mentor: 'Neha Krishnan', status: 'active', progress: 57, sector: 'AI/ML', city: 'Indore' },
  { id: '15', name: 'SolarGrid Rural', product: 'Off-Grid Solar Management', stage: 'Prototype', cohort: 'Cohort 3', mentor: 'Priya Menon', status: 'active', progress: 33, sector: 'CleanTech', city: 'Coimbatore' },
]

type TeamStatus = 'active' | 'suspended' | 'alumni'
type TeamStage = 'Idea' | 'Prototype' | 'MVP' | 'Growth'

function stageBadge(stage: string) {
  const map: Record<string, 'default' | 'blue' | 'indigo' | 'success'> = {
    'Idea': 'default', 'Prototype': 'blue', 'MVP': 'indigo', 'Growth': 'success'
  }
  return <Badge variant={map[stage] ?? 'default'}>{stage}</Badge>
}

function statusBadge(status: string) {
  const map: Record<string, 'success' | 'warning' | 'gray'> = {
    'active': 'success', 'suspended': 'warning', 'alumni': 'gray'
  }
  return <Badge variant={map[status] ?? 'default'} dot>{status}</Badge>
}

const PAGE_SIZE = 10

export default function AdminTeamsPage() {
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [cohortFilter, setCohortFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState<{ id: string; name: string } | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<{ id: string; name: string } | null>(null)
  const [blockReason, setBlockReason] = useState('')
  const [teams, setTeams] = useState(MOCK_TEAMS)
  const [newTeam, setNewTeam] = useState({ name: '', product: '', stage: 'Idea', cohort: 'Cohort 3', sector: '' })

  const filtered = teams.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.product.toLowerCase().includes(search.toLowerCase())
    const matchStage = stageFilter === 'all' || t.stage === stageFilter
    const matchCohort = cohortFilter === 'all' || t.cohort === cohortFilter
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    return matchSearch && matchStage && matchCohort && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const toggleAll = () => {
    if (selected.length === paginated.length) setSelected([])
    else setSelected(paginated.map(t => t.id))
  }

  const handleSuspend = (id: string) => {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'suspended' ? 'active' : 'suspended' } : t))
    setOpenMenuId(null)
  }
  const handleDelete = (id: string) => {
    setTeams(prev => prev.filter(t => t.id !== id))
    setShowDeleteModal(null)
  }
  const handleCreateTeam = () => {
    const id = String(teams.length + 1)
    setTeams(prev => [...prev, { id, name: newTeam.name, product: newTeam.product, stage: newTeam.stage, cohort: newTeam.cohort, mentor: 'Unassigned', status: 'active', progress: 0, sector: newTeam.sector, city: 'TBD' }])
    setShowCreateModal(false)
    setNewTeam({ name: '', product: '', stage: 'Idea', cohort: 'Cohort 3', sector: '' })
  }
  const handleBulkSuspend = () => {
    setTeams(prev => prev.map(t => selected.includes(t.id) ? { ...t, status: 'suspended' } : t))
    setSelected([])
  }
  const handleBulkDelete = () => {
    setTeams(prev => prev.filter(t => !selected.includes(t.id)))
    setSelected([])
  }

  return (
    <DashboardLayout user={ADMIN_USER} title="Teams Management">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
            <p className="text-sm text-gray-500 mt-0.5">{teams.length} teams across all cohorts</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" /> Create Team
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="Search teams or products..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <Select value={stageFilter} onValueChange={v => { setStageFilter(v); setPage(1) }}>
            <SelectTrigger className="w-36 h-10">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="Idea">Idea</SelectItem>
              <SelectItem value="Prototype">Prototype</SelectItem>
              <SelectItem value="MVP">MVP</SelectItem>
              <SelectItem value="Growth">Growth</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cohortFilter} onValueChange={v => { setCohortFilter(v); setPage(1) }}>
            <SelectTrigger className="w-36 h-10">
              <SelectValue placeholder="Cohort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cohorts</SelectItem>
              <SelectItem value="Cohort 1">Cohort 1</SelectItem>
              <SelectItem value="Cohort 2">Cohort 2</SelectItem>
              <SelectItem value="Cohort 3">Cohort 3</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="w-36 h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="alumni">Alumni</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selected.length > 0 && (
          <div className="flex items-center gap-3 rounded-lg bg-indigo-50 border border-indigo-200 px-4 py-2.5">
            <span className="text-sm font-medium text-indigo-700">{selected.length} selected</span>
            <Button variant="outline" size="sm" onClick={handleBulkSuspend}>Suspend All</Button>
            <Button variant="danger" size="sm" onClick={handleBulkDelete}>Delete All</Button>
            <button onClick={() => setSelected([])} className="ml-auto text-sm text-indigo-600 hover:underline">Clear</button>
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <button onClick={toggleAll} className="text-gray-400 hover:text-gray-600">
                      {selected.length === paginated.length && paginated.length > 0
                        ? <CheckSquare className="h-4 w-4 text-indigo-600" />
                        : <Square className="h-4 w-4" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Team</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Product</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Stage</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Cohort</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Mentor</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Progress</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                      <Filter className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No teams match your filters</p>
                    </td>
                  </tr>
                ) : paginated.map(team => (
                  <tr key={team.id} className={cn('hover:bg-gray-50 transition-colors', selected.includes(team.id) && 'bg-indigo-50')}>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(team.id)} className="text-gray-400 hover:text-indigo-600">
                        {selected.includes(team.id)
                          ? <CheckSquare className="h-4 w-4 text-indigo-600" />
                          : <Square className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar fallback={getInitials(team.name)} size="sm" />
                        <div>
                          <Link href={`/admin/teams/${team.id}`} className="font-medium text-gray-900 hover:text-indigo-700">{team.name}</Link>
                          <p className="text-xs text-gray-400">{team.sector} · {team.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{team.product}</td>
                    <td className="px-4 py-3">{stageBadge(team.stage)}</td>
                    <td className="px-4 py-3 text-gray-600">{team.cohort}</td>
                    <td className="px-4 py-3 text-gray-600">{team.mentor}</td>
                    <td className="px-4 py-3">{statusBadge(team.status)}</td>
                    <td className="px-4 py-3">
                      <ProgressRing value={team.progress} size={40} strokeWidth={4} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === team.id ? null : team.id)}
                          className="rounded-md p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenuId === team.id && (
                          <div className="absolute right-0 top-8 z-10 w-44 rounded-lg border border-gray-200 bg-white shadow-lg py-1">
                            <Link href={`/admin/teams/${team.id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Eye className="h-3.5 w-3.5" /> View Detail
                            </Link>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Edit className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button onClick={() => handleSuspend(team.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50">
                              <Ban className="h-3.5 w-3.5" /> {team.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                            </button>
                            <button
                              onClick={() => { setShowBlockModal({ id: team.id, name: team.name }); setOpenMenuId(null) }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-orange-700 hover:bg-orange-50"
                            >
                              <AlertTriangle className="h-3.5 w-3.5" /> Block
                            </button>
                            <button
                              onClick={() => { setShowDeleteModal({ id: team.id, name: team.name }); setOpenMenuId(null) }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <span className="text-sm text-gray-500">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={cn('w-8 h-8 rounded-md text-sm font-medium', p === page ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100')}>
                  {p}
                </button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Team Modal */}
      <Modal open={showCreateModal} onOpenChange={setShowCreateModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Create New Team</ModalTitle>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <Input label="Team Name" value={newTeam.name} onChange={e => setNewTeam(p => ({ ...p, name: e.target.value }))} placeholder="e.g. AgriBot Solutions" />
            <Input label="Product Name" value={newTeam.product} onChange={e => setNewTeam(p => ({ ...p, product: e.target.value }))} placeholder="e.g. Smart Greenhouse Monitor" />
            <Input label="Sector" value={newTeam.sector} onChange={e => setNewTeam(p => ({ ...p, sector: e.target.value }))} placeholder="e.g. AgriTech" />
            <div className="grid grid-cols-2 gap-3">
              <Select value={newTeam.stage} onValueChange={v => setNewTeam(p => ({ ...p, stage: v }))}>
                <SelectTrigger label="Stage"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Idea">Idea</SelectItem>
                  <SelectItem value="Prototype">Prototype</SelectItem>
                  <SelectItem value="MVP">MVP</SelectItem>
                  <SelectItem value="Growth">Growth</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newTeam.cohort} onValueChange={v => setNewTeam(p => ({ ...p, cohort: v }))}>
                <SelectTrigger label="Cohort"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cohort 1">Cohort 1</SelectItem>
                  <SelectItem value="Cohort 2">Cohort 2</SelectItem>
                  <SelectItem value="Cohort 3">Cohort 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateTeam} disabled={!newTeam.name || !newTeam.product}>Create Team</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Block Modal */}
      <Modal open={!!showBlockModal} onOpenChange={() => setShowBlockModal(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Block Team: {showBlockModal?.name}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <Textarea
              label="Reason for blocking"
              value={blockReason}
              onChange={e => setBlockReason(e.target.value)}
              placeholder="Provide a clear reason for blocking this team..."
              rows={3}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowBlockModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => { setShowBlockModal(null); setBlockReason('') }}>Block Team</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!showDeleteModal} onOpenChange={() => setShowDeleteModal(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Delete Team</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-gray-600">Are you sure you want to delete <strong>{showDeleteModal?.name}</strong>? This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => showDeleteModal && handleDelete(showDeleteModal.id)}>Delete Team</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  )
}
