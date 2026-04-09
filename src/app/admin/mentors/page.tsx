'use client'

import React, { useState } from 'react'
import {
  Grid, List, Search, Plus, CheckCircle, XCircle, Edit,
  UserMinus, AlertTriangle, Linkedin, Mail
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ADMIN_USER } from '@/lib/mock-admin-user'
import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'

const MENTORS = [
  { id: '1', name: 'Dr. Suresh Iyer', type: 'primary_mentor', sectors: ['AgriTech', 'CleanTech'], status: 'active', teams: 3, expertise: 'Deep Tech, IoT', location: 'Pune', email: 'suresh.iyer@incubx.in', pending: false },
  { id: '2', name: 'Neha Krishnan', type: 'sector_expert', sectors: ['HealthTech', 'BioTech'], status: 'active', teams: 2, expertise: 'Healthcare, Medical Devices', location: 'Bengaluru', email: 'neha.k@incubx.in', pending: false },
  { id: '3', name: 'Rajesh Gupta', type: 'primary_mentor', sectors: ['FinTech', 'LogiTech'], status: 'active', teams: 4, expertise: 'Finance, Supply Chain', location: 'Mumbai', email: 'rajesh.g@incubx.in', pending: false },
  { id: '4', name: 'Priya Menon', type: 'general_mentor', sectors: ['EdTech', 'HRTech'], status: 'active', teams: 3, expertise: 'Product, Go-to-Market', location: 'Hyderabad', email: 'priya.m@incubx.in', pending: false },
  { id: '5', name: 'Anita Rao', type: 'legal_finance_expert', sectors: ['LegalTech', 'FinTech'], status: 'active', teams: 2, expertise: 'Legal, Corporate Law', location: 'Delhi', email: 'anita.rao@incubx.in', pending: false },
  { id: '6', name: 'Vikram Nair', type: 'product_expert', sectors: ['HealthTech', 'SaaS'], status: 'inactive', teams: 1, expertise: 'Product Design, UX', location: 'Chennai', email: 'vikram.nair@incubx.in', pending: false },
  { id: '7', name: 'Kavita Sharma', type: 'marketing_expert', sectors: ['D2C', 'EdTech'], status: 'active', teams: 2, expertise: 'Digital Marketing, Brand', location: 'Jaipur', email: 'kavita.s@incubx.in', pending: false },
  { id: '8', name: 'Amit Desai', type: 'sector_expert', sectors: ['CleanTech', 'AgriTech'], status: 'active', teams: 3, expertise: 'Sustainability, Solar Energy', location: 'Ahmedabad', email: 'amit.d@incubx.in', pending: false },
  // Pending approvals
  { id: '9', name: 'Sanjay Kapoor', type: 'primary_mentor', sectors: ['FinTech', 'InsurTech'], status: 'pending', teams: 0, expertise: 'Venture Capital, Fundraising', location: 'Mumbai', email: 'sanjay.k@gmail.com', pending: true },
  { id: '10', name: 'Dr. Lakshmi Prasad', type: 'sector_expert', sectors: ['HealthTech', 'PharmaTech'], status: 'pending', teams: 0, expertise: 'Clinical Trials, Medical AI', location: 'Bengaluru', email: 'lakshmi.p@gmail.com', pending: true },
]

const TYPE_LABELS: Record<string, string> = {
  primary_mentor: 'Primary Mentor',
  sector_expert: 'Sector Expert',
  product_expert: 'Product Expert',
  marketing_expert: 'Marketing Expert',
  legal_finance_expert: 'Legal & Finance',
  general_mentor: 'General Mentor',
  premium_mentor: 'Premium Mentor',
}

function typeBadge(type: string) {
  const map: Record<string, 'indigo' | 'purple' | 'blue' | 'success' | 'default'> = {
    primary_mentor: 'indigo',
    sector_expert: 'purple',
    product_expert: 'blue',
    marketing_expert: 'success',
    legal_finance_expert: 'default',
    general_mentor: 'default',
  }
  return <Badge variant={map[type] ?? 'default'}>{TYPE_LABELS[type] ?? type}</Badge>
}

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState(MENTORS)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [expertiseFilter, setExpertiseFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState<{ id: string; name: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'general_mentor' })

  const pending = mentors.filter(m => m.pending)
  const active = mentors.filter(m => !m.pending)

  const filtered = active.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.sectors.some(s => s.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = statusFilter === 'all' || m.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleApprove = (id: string) => {
    setMentors(prev => prev.map(m => m.id === id ? { ...m, status: 'active', pending: false } : m))
  }
  const handleReject = (id: string) => {
    setMentors(prev => prev.filter(m => m.id !== id))
    setShowRejectModal(null)
    setRejectReason('')
  }
  const handleDeactivate = (id: string) => {
    setMentors(prev => prev.map(m => m.id === id ? { ...m, status: m.status === 'inactive' ? 'active' : 'inactive' } : m))
  }

  return (
    <DashboardLayout user={ADMIN_USER} title="Mentors Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mentors</h1>
            <p className="text-sm text-gray-500 mt-0.5">{active.length} active mentors · {pending.length} pending approval</p>
          </div>
          <Button onClick={() => setShowInviteModal(true)}>
            <Plus className="h-4 w-4" /> Invite Mentor
          </Button>
        </div>

        {/* Pending Approvals */}
        {pending.length > 0 && (
          <div className="rounded-lg border-2 border-amber-200 bg-amber-50">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h2 className="text-sm font-semibold text-amber-800">Pending Approvals ({pending.length})</h2>
            </div>
            <div className="p-4 space-y-3">
              {pending.map(mentor => (
                <div key={mentor.id} className="flex flex-wrap items-center gap-4 rounded-lg bg-white border border-amber-100 p-4">
                  <Avatar fallback={getInitials(mentor.name)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{mentor.name}</p>
                    <p className="text-sm text-gray-500">{mentor.expertise} · {mentor.location}</p>
                    <p className="text-xs text-gray-400">{mentor.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {typeBadge(mentor.type)}
                    <Button size="sm" onClick={() => handleApprove(mentor.id)}>
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => setShowRejectModal({ id: mentor.id, name: mentor.name })}>
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters + View Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="Search mentors, sectors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-10"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white p-0.5">
            <button onClick={() => setView('grid')} className={cn('rounded p-1.5', view === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700')}>
              <Grid className="h-4 w-4" />
            </button>
            <button onClick={() => setView('list')} className={cn('rounded p-1.5', view === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700')}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Grid View */}
        {view === 'grid' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(mentor => (
              <div key={mentor.id} className="rounded-lg border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <Avatar fallback={getInitials(mentor.name)} size="lg" />
                  <Badge variant={mentor.status === 'active' ? 'success' : 'gray'} dot>{mentor.status}</Badge>
                </div>
                <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{mentor.expertise}</p>
                <p className="text-xs text-gray-400 mt-0.5">{mentor.location}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {typeBadge(mentor.type)}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {mentor.sectors.map(s => (
                    <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s}</span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>{mentor.teams} teams assigned</span>
                </div>
                <div className="mt-3 flex items-center gap-1.5 pt-3 border-t border-gray-100">
                  <Button variant="ghost" size="sm" className="flex-1 justify-center"><Edit className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="flex-1 justify-center" onClick={() => handleDeactivate(mentor.id)}>
                    <UserMinus className="h-3.5 w-3.5" />
                  </Button>
                  <a href={`mailto:${mentor.email}`} className="flex-1 flex justify-center rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
                    <Mail className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Mentor</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Type</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Sectors</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Teams</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Status</th>
                  <th className="px-5 py-3 text-right font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(mentor => (
                  <tr key={mentor.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar fallback={getInitials(mentor.name)} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900">{mentor.name}</p>
                          <p className="text-xs text-gray-400">{mentor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">{typeBadge(mentor.type)}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {mentor.sectors.map(s => (
                          <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{mentor.teams}</td>
                    <td className="px-5 py-3">
                      <Badge variant={mentor.status === 'active' ? 'success' : 'gray'} dot>{mentor.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm"><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeactivate(mentor.id)}>
                          <UserMinus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center">
            <p className="text-gray-400">No mentors found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <Modal open={showInviteModal} onOpenChange={setShowInviteModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Invite Mentor</ModalTitle>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <Input label="Email Address" type="email" value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))} placeholder="mentor@example.com" />
            <Select value={inviteForm.role} onValueChange={v => setInviteForm(p => ({ ...p, role: v }))}>
              <SelectTrigger label="Mentor Role"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="primary_mentor">Primary Mentor</SelectItem>
                <SelectItem value="sector_expert">Sector Expert</SelectItem>
                <SelectItem value="product_expert">Product Expert</SelectItem>
                <SelectItem value="marketing_expert">Marketing Expert</SelectItem>
                <SelectItem value="legal_finance_expert">Legal &amp; Finance Expert</SelectItem>
                <SelectItem value="general_mentor">General Mentor</SelectItem>
                <SelectItem value="premium_mentor">Premium Mentor</SelectItem>
              </SelectContent>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
            <Button onClick={() => setShowInviteModal(false)} disabled={!inviteForm.email}>Send Invite</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reject Modal */}
      <Modal open={!!showRejectModal} onOpenChange={() => setShowRejectModal(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Reject Mentor Application</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <Textarea
              label={`Reason for rejecting ${showRejectModal?.name}`}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Provide feedback on why this application is being rejected..."
              rows={3}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => showRejectModal && handleReject(showRejectModal.id)}>Reject Application</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  )
}
