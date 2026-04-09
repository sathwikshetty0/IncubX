'use client'

import React, { useState } from 'react'
import {
  Search, Plus, Edit, UserX, Key, Upload,
  CheckSquare, Square, Filter
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ADMIN_USER } from '@/lib/mock-admin-user'
import { getInitials, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

const MOCK_USERS: {
  id: string; name: string; email: string; role: UserRole;
  status: string; lastActive: string; team?: string
}[] = [
  { id: '1', name: 'Priya Sharma', email: 'priya.sharma@incubx.in', role: 'admin', status: 'active', lastActive: '2025-04-09T10:00:00' },
  { id: '2', name: 'Arjun Patel', email: 'arjun.patel@greenharvesttech.in', role: 'team_lead', status: 'active', lastActive: '2025-04-09T08:30:00', team: 'GreenHarvest AgriTech' },
  { id: '3', name: 'Meera Nair', email: 'meera.nair@greenharvesttech.in', role: 'team_member', status: 'active', lastActive: '2025-04-08T17:20:00', team: 'GreenHarvest AgriTech' },
  { id: '4', name: 'Dr. Suresh Iyer', email: 'suresh.iyer@incubx.in', role: 'primary_mentor', status: 'active', lastActive: '2025-04-09T09:15:00' },
  { id: '5', name: 'Neha Krishnan', email: 'neha.k@incubx.in', role: 'sector_expert', status: 'active', lastActive: '2025-04-07T14:00:00' },
  { id: '6', name: 'Ramesh Babu', email: 'ramesh.b@incubx.in', role: 'program_incharge', status: 'active', lastActive: '2025-04-09T07:45:00' },
  { id: '7', name: 'Kavita Sharma', email: 'kavita.s@incubx.in', role: 'marketing_expert', status: 'active', lastActive: '2025-04-06T11:30:00' },
  { id: '8', name: 'Ravi Prasad', email: 'ravi.p@incubx.in', role: 'finance_id', status: 'active', lastActive: '2025-04-08T16:00:00' },
  { id: '9', name: 'Siddharth Joshi', email: 'siddharth.j@greenharvesttech.in', role: 'team_member', status: 'active', lastActive: '2025-04-08T12:00:00', team: 'GreenHarvest AgriTech' },
  { id: '10', name: 'Anjali Mehta', email: 'anjali.m@eduspark.in', role: 'team_member', status: 'active', lastActive: '2025-04-09T09:00:00', team: 'EduSpark Learn' },
  { id: '11', name: 'Vikrant Singh', email: 'vikrant.s@healthsync.in', role: 'team_lead', status: 'inactive', lastActive: '2025-03-20T10:00:00', team: 'HealthSync Pro' },
  { id: '12', name: 'Pooja Agarwal', email: 'pooja.a@incubx.in', role: 'alumni', status: 'active', lastActive: '2025-04-01T15:00:00' },
]

const ROLE_LABELS: Partial<Record<UserRole, string>> = {
  admin: 'Admin', super_admin: 'Super Admin', program_incharge: 'Program Incharge',
  primary_mentor: 'Primary Mentor', sector_expert: 'Sector Expert',
  product_expert: 'Product Expert', marketing_expert: 'Marketing Expert',
  legal_finance_expert: 'Legal & Finance', general_mentor: 'General Mentor',
  team_lead: 'Team Lead', team_member: 'Team Member', alumni: 'Alumni',
  finance_id: 'Finance', investor: 'Investor', applicant: 'Applicant',
  premium_mentor: 'Premium Mentor', ceo: 'CEO',
}

function roleBadge(role: UserRole) {
  const variantMap: Partial<Record<UserRole, 'indigo' | 'purple' | 'blue' | 'success' | 'gray' | 'default'>> = {
    admin: 'indigo', super_admin: 'indigo', program_incharge: 'purple',
    primary_mentor: 'blue', sector_expert: 'blue', product_expert: 'blue',
    marketing_expert: 'success', team_lead: 'default', team_member: 'gray', alumni: 'gray',
  }
  return <Badge variant={variantMap[role] ?? 'default'}>{ROLE_LABELS[role] ?? role}</Badge>
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(iso)
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState(MOCK_USERS)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<string[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState<typeof MOCK_USERS[0] | null>(null)
  const [showBulkInvite, setShowBulkInvite] = useState(false)
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('team_member')
  const [inviteEmail, setInviteEmail] = useState('')

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchStatus = statusFilter === 'all' || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  const toggleSelect = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(u => u.id))

  const handleDeactivate = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'inactive' ? 'active' : 'inactive' } : u))
  }
  const handleRoleChange = (id: string, role: UserRole) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
    setShowEditModal(null)
  }

  return (
    <DashboardLayout user={ADMIN_USER} title="Users Management">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-500 mt-0.5">{users.length} users registered</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowBulkInvite(true)}>
              <Upload className="h-4 w-4" /> Bulk Invite
            </Button>
            <Button onClick={() => setShowInviteModal(true)}>
              <Plus className="h-4 w-4" /> Invite User
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="Search name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-44 h-10"><SelectValue placeholder="All Roles" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="program_incharge">Program Incharge</SelectItem>
              <SelectItem value="primary_mentor">Primary Mentor</SelectItem>
              <SelectItem value="sector_expert">Sector Expert</SelectItem>
              <SelectItem value="team_lead">Team Lead</SelectItem>
              <SelectItem value="team_member">Team Member</SelectItem>
              <SelectItem value="alumni">Alumni</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-10"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selected.length > 0 && (
          <div className="flex items-center gap-3 rounded-lg bg-indigo-50 border border-indigo-200 px-4 py-2.5">
            <span className="text-sm font-medium text-indigo-700">{selected.length} selected</span>
            <Button variant="outline" size="sm" onClick={() => { selected.forEach(id => handleDeactivate(id)); setSelected([]) }}>Deactivate All</Button>
            <button onClick={() => setSelected([])} className="ml-auto text-sm text-indigo-600 hover:underline">Clear</button>
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-10 px-4 py-3">
                  <button onClick={toggleAll} className="text-gray-400 hover:text-gray-600">
                    {selected.length === filtered.length && filtered.length > 0
                      ? <CheckSquare className="h-4 w-4 text-indigo-600" />
                      : <Square className="h-4 w-4" />}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">User</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Role</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Team</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Last Active</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Filter className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-400">No users found</p>
                  </td>
                </tr>
              ) : filtered.map(user => (
                <tr key={user.id} className={cn('hover:bg-gray-50 transition-colors', selected.includes(user.id) && 'bg-indigo-50')}>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(user.id)}>
                      {selected.includes(user.id)
                        ? <CheckSquare className="h-4 w-4 text-indigo-600" />
                        : <Square className="h-4 w-4 text-gray-400" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar fallback={getInitials(user.name)} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{roleBadge(user.role)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.status === 'active' ? 'success' : 'gray'} dot>{user.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{user.team ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{timeAgo(user.lastActive)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setShowEditModal(user)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeactivate(user.id)}>
                        <UserX className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm"><Key className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Single User Modal */}
      <Modal open={showInviteModal} onOpenChange={setShowInviteModal}>
        <ModalContent>
          <ModalHeader><ModalTitle>Invite User</ModalTitle></ModalHeader>
          <ModalBody className="space-y-4">
            <Input label="Email Address" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="user@example.com" />
            <Select value={inviteRole} onValueChange={v => setInviteRole(v as UserRole)}>
              <SelectTrigger label="Role"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="team_lead">Team Lead</SelectItem>
                <SelectItem value="team_member">Team Member</SelectItem>
                <SelectItem value="primary_mentor">Primary Mentor</SelectItem>
                <SelectItem value="sector_expert">Sector Expert</SelectItem>
                <SelectItem value="program_incharge">Program Incharge</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
              </SelectContent>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
            <Button disabled={!inviteEmail} onClick={() => setShowInviteModal(false)}>Send Invite</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Bulk Invite Modal */}
      <Modal open={showBulkInvite} onOpenChange={setShowBulkInvite}>
        <ModalContent className="max-w-xl">
          <ModalHeader><ModalTitle>Bulk Invite Users</ModalTitle></ModalHeader>
          <ModalBody className="space-y-4">
            <Textarea
              label="Email list (one per line)"
              value={inviteEmails}
              onChange={e => setInviteEmails(e.target.value)}
              rows={6}
              placeholder="arjun@startup.in&#10;meera@startup.in&#10;ravi@startup.in"
            />
            <Select value={inviteRole} onValueChange={v => setInviteRole(v as UserRole)}>
              <SelectTrigger label="Assign Role"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="team_member">Team Member</SelectItem>
                <SelectItem value="team_lead">Team Lead</SelectItem>
                <SelectItem value="general_mentor">General Mentor</SelectItem>
                <SelectItem value="applicant">Applicant</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400">Or upload a CSV file with columns: name, email, role</p>
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-8 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
              <div className="text-center">
                <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload CSV</p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowBulkInvite(false)}>Cancel</Button>
            <Button disabled={!inviteEmails.trim()} onClick={() => setShowBulkInvite(false)}>
              Send Invites ({inviteEmails.split('\n').filter(Boolean).length} emails)
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Role Modal */}
      {showEditModal && (
        <Modal open={!!showEditModal} onOpenChange={() => setShowEditModal(null)}>
          <ModalContent>
            <ModalHeader><ModalTitle>Edit User: {showEditModal.name}</ModalTitle></ModalHeader>
            <ModalBody className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                <Avatar fallback={getInitials(showEditModal.name)} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{showEditModal.name}</p>
                  <p className="text-xs text-gray-500">{showEditModal.email}</p>
                </div>
              </div>
              <Select value={showEditModal.role} onValueChange={v => setShowEditModal(p => p ? { ...p, role: v as UserRole } : p)}>
                <SelectTrigger label="Change Role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="team_lead">Team Lead</SelectItem>
                  <SelectItem value="team_member">Team Member</SelectItem>
                  <SelectItem value="primary_mentor">Primary Mentor</SelectItem>
                  <SelectItem value="sector_expert">Sector Expert</SelectItem>
                  <SelectItem value="program_incharge">Program Incharge</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="alumni">Alumni</SelectItem>
                </SelectContent>
              </Select>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={() => setShowEditModal(null)}>Cancel</Button>
              <Button onClick={() => handleRoleChange(showEditModal.id, showEditModal.role)}>Save Changes</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </DashboardLayout>
  )
}
