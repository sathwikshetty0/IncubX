'use client'

import React, { useState } from 'react'
import { Plus, Edit, Trash2, UserCog } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { ADMIN_USER } from '@/lib/mock-admin-user'
import { getInitials } from '@/lib/utils'

type ProgramType = 'pre_incubation' | 'incubation' | 'acceleration'

const MOCK_PROGRAMS = [
  { id: '1', name: 'Pre-Incubation Program', type: 'pre_incubation' as ProgramType, incharge: 'Dr. Meenakshi Rao', teams: 12, cohorts: 1, status: 'completed', description: 'A 6-month foundational program for early-stage idea validation and team formation.' },
  { id: '2', name: 'Incubation Program', type: 'incubation' as ProgramType, incharge: 'Ramesh Babu', teams: 25, cohorts: 2, status: 'active', description: 'Flagship 12-month incubation program covering product development, market validation, and go-to-market strategy.' },
  { id: '3', name: 'Acceleration Program', type: 'acceleration' as ProgramType, incharge: 'Sunita Agarwal', teams: 5, cohorts: 1, status: 'upcoming', description: 'An intensive 6-month acceleration track for revenue-generating startups seeking Series A funding.' },
]

const INCHARGE_OPTIONS = [
  'Dr. Meenakshi Rao', 'Ramesh Babu', 'Sunita Agarwal', 'Priya Sharma',
  'Kiran Reddy', 'Anand Krishnamurthy'
]

const TYPE_LABELS: Record<ProgramType, string> = {
  pre_incubation: 'Pre-Incubation',
  incubation: 'Incubation',
  acceleration: 'Acceleration',
}

function typeBadge(type: ProgramType) {
  const map: Record<ProgramType, 'blue' | 'indigo' | 'purple'> = {
    pre_incubation: 'blue',
    incubation: 'indigo',
    acceleration: 'purple',
  }
  return <Badge variant={map[type]}>{TYPE_LABELS[type]}</Badge>
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState(MOCK_PROGRAMS)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState<typeof MOCK_PROGRAMS[0] | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<{ id: string; name: string } | null>(null)
  const [showAssignModal, setShowAssignModal] = useState<{ id: string; name: string } | null>(null)
  const [selectedIncharge, setSelectedIncharge] = useState('')
  const [form, setForm] = useState({ name: '', type: 'incubation' as ProgramType, incharge: '', description: '' })

  const handleCreate = () => {
    const id = String(programs.length + 1)
    setPrograms(prev => [...prev, { id, name: form.name, type: form.type, incharge: form.incharge, teams: 0, cohorts: 0, status: 'upcoming', description: form.description }])
    setShowCreateModal(false)
    setForm({ name: '', type: 'incubation', incharge: '', description: '' })
  }

  const handleEdit = () => {
    if (!showEditModal) return
    setPrograms(prev => prev.map(p => p.id === showEditModal.id
      ? { ...p, name: showEditModal.name, type: showEditModal.type, description: showEditModal.description }
      : p))
    setShowEditModal(null)
  }

  const handleDelete = (id: string) => {
    setPrograms(prev => prev.filter(p => p.id !== id))
    setShowDeleteModal(null)
  }

  const handleAssign = (programId: string) => {
    setPrograms(prev => prev.map(p => p.id === programId ? { ...p, incharge: selectedIncharge } : p))
    setShowAssignModal(null)
    setSelectedIncharge('')
  }

  return (
    <DashboardLayout user={ADMIN_USER} title="Programs Management">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
            <p className="text-sm text-gray-500 mt-0.5">{programs.length} programs configured</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" /> Create Program
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-gray-600">Program Name</th>
                <th className="px-5 py-3 text-left font-medium text-gray-600">Type</th>
                <th className="px-5 py-3 text-left font-medium text-gray-600">Incharge</th>
                <th className="px-5 py-3 text-left font-medium text-gray-600">Teams</th>
                <th className="px-5 py-3 text-left font-medium text-gray-600">Cohorts</th>
                <th className="px-5 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-5 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {programs.map(program => (
                <tr key={program.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{program.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{program.description}</p>
                  </td>
                  <td className="px-5 py-3">{typeBadge(program.type)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar fallback={getInitials(program.incharge)} size="sm" />
                      <span className="text-gray-700">{program.incharge}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900">{program.teams}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{program.cohorts}</td>
                  <td className="px-5 py-3">
                    <Badge variant={program.status === 'active' ? 'success' : program.status === 'upcoming' ? 'indigo' : 'gray'} dot>
                      {program.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setShowEditModal(program)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm"
                        onClick={() => { setShowAssignModal({ id: program.id, name: program.name }); setSelectedIncharge(program.incharge) }}>
                        <UserCog className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setShowDeleteModal({ id: program.id, name: program.name })}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {programs.map(program => (
            <div key={program.id} className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between mb-3">
                {typeBadge(program.type)}
                <Badge variant={program.status === 'active' ? 'success' : program.status === 'upcoming' ? 'indigo' : 'gray'} dot>
                  {program.status}
                </Badge>
              </div>
              <h3 className="font-semibold text-gray-900">{program.name}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{program.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{program.teams}</p>
                  <p className="text-xs text-gray-500">Teams</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{program.cohorts}</p>
                  <p className="text-xs text-gray-500">Cohorts</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={showCreateModal} onOpenChange={setShowCreateModal}>
        <ModalContent>
          <ModalHeader><ModalTitle>Create Program</ModalTitle></ModalHeader>
          <ModalBody className="space-y-4">
            <Input label="Program Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Acceleration Program 2025" />
            <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as ProgramType }))}>
              <SelectTrigger label="Program Type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pre_incubation">Pre-Incubation</SelectItem>
                <SelectItem value="incubation">Incubation</SelectItem>
                <SelectItem value="acceleration">Acceleration</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.incharge} onValueChange={v => setForm(p => ({ ...p, incharge: v }))}>
              <SelectTrigger label="Program Incharge"><SelectValue placeholder="Select incharge" /></SelectTrigger>
              <SelectContent>
                {INCHARGE_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Brief description of the program..." />
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.name || !form.incharge}>Create Program</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      {showEditModal && (
        <Modal open={!!showEditModal} onOpenChange={() => setShowEditModal(null)}>
          <ModalContent>
            <ModalHeader><ModalTitle>Edit Program</ModalTitle></ModalHeader>
            <ModalBody className="space-y-4">
              <Input label="Program Name" value={showEditModal.name}
                onChange={e => setShowEditModal(p => p ? { ...p, name: e.target.value } : p)} />
              <Select value={showEditModal.type} onValueChange={v => setShowEditModal(p => p ? { ...p, type: v as ProgramType } : p)}>
                <SelectTrigger label="Program Type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre_incubation">Pre-Incubation</SelectItem>
                  <SelectItem value="incubation">Incubation</SelectItem>
                  <SelectItem value="acceleration">Acceleration</SelectItem>
                </SelectContent>
              </Select>
              <Textarea label="Description" value={showEditModal.description}
                onChange={e => setShowEditModal(p => p ? { ...p, description: e.target.value } : p)} rows={3} />
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={() => setShowEditModal(null)}>Cancel</Button>
              <Button onClick={handleEdit}>Save Changes</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Assign Incharge Modal */}
      <Modal open={!!showAssignModal} onOpenChange={() => setShowAssignModal(null)}>
        <ModalContent>
          <ModalHeader><ModalTitle>Assign Program Incharge</ModalTitle></ModalHeader>
          <ModalBody>
            <p className="text-sm text-gray-600 mb-4">Assign an incharge for <strong>{showAssignModal?.name}</strong></p>
            <Select value={selectedIncharge} onValueChange={setSelectedIncharge}>
              <SelectTrigger label="Select Incharge"><SelectValue placeholder="Choose..." /></SelectTrigger>
              <SelectContent>
                {INCHARGE_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowAssignModal(null)}>Cancel</Button>
            <Button onClick={() => showAssignModal && handleAssign(showAssignModal.id)} disabled={!selectedIncharge}>Assign</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!showDeleteModal} onOpenChange={() => setShowDeleteModal(null)}>
        <ModalContent>
          <ModalHeader><ModalTitle>Delete Program</ModalTitle></ModalHeader>
          <ModalBody>
            <p className="text-sm text-gray-600">Are you sure you want to delete <strong>{showDeleteModal?.name}</strong>? All associated cohorts and data will be affected.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => showDeleteModal && handleDelete(showDeleteModal.id)}>Delete Program</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  )
}
