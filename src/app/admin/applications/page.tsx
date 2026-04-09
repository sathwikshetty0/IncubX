'use client'

import React, { useState } from 'react'
import {
  CheckCircle, XCircle, MessageSquare, Calendar, Users, Filter
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { ADMIN_USER } from '@/lib/mock-admin-user'
import { getInitials, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const MOCK_APPLICATIONS = [
  { id: '1', teamName: 'SkyFarm Drones', product: 'Precision Agriculture Drones', cohort: 'Cohort 4 – 2025', appliedDate: '2025-04-01', members: 3, sector: 'AgriTech', city: 'Pune', status: 'pending', description: 'We are building autonomous drone systems for precision spraying, crop monitoring, and yield prediction for farms across Maharashtra.', contactEmail: 'founder@skyfarm.in' },
  { id: '2', teamName: 'DigiCare Health', product: 'Telehealth for Rural India', cohort: 'Cohort 4 – 2025', appliedDate: '2025-04-02', members: 4, sector: 'HealthTech', city: 'Nagpur', status: 'pending', description: 'DigiCare connects rural patients with doctors via a WhatsApp-based telehealth platform, supporting regional languages.', contactEmail: 'team@digicare.health' },
  { id: '3', teamName: 'GreenFuel Labs', product: 'Biogas from Agri Waste', cohort: 'Cohort 4 – 2025', appliedDate: '2025-04-03', members: 2, sector: 'CleanTech', city: 'Ahmedabad', status: 'pending', description: 'Converting agricultural waste to clean biogas using a modular, low-cost digester. Targeting small farm co-operatives.', contactEmail: 'info@greenfuellabs.in' },
  { id: '4', teamName: 'UrbanFin Solutions', product: 'BNPL for Gig Workers', cohort: 'Cohort 4 – 2025', appliedDate: '2025-04-04', members: 3, sector: 'FinTech', city: 'Bengaluru', status: 'pending', description: 'UrbanFin provides Buy Now Pay Later credit products tailored for India\'s 50M gig economy workers, using behavioral scoring.', contactEmail: 'founder@urbanfin.co' },
  { id: '5', teamName: 'EduAccess NGO', product: 'Offline Learning Tablets', cohort: 'Cohort 4 – 2025', appliedDate: '2025-04-05', members: 5, sector: 'EdTech', city: 'Bhopal', status: 'pending', description: 'Low-cost rugged tablets with pre-loaded curriculum for primary school students in areas with no internet connectivity.', contactEmail: 'apply@eduaccess.in' },
]

type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'info_requested'

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<typeof MOCK_APPLICATIONS[0][]>(MOCK_APPLICATIONS)
  const [cohortFilter, setCohortFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showRejectModal, setShowRejectModal] = useState<{ id: string; name: string } | null>(null)
  const [showApproveModal, setShowApproveModal] = useState<{ id: string; name: string } | null>(null)
  const [showInfoModal, setShowInfoModal] = useState<{ id: string; name: string } | null>(null)
  const [showDetailModal, setShowDetailModal] = useState<typeof MOCK_APPLICATIONS[0] | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [infoRequest, setInfoRequest] = useState('')
  const [assignCohort, setAssignCohort] = useState('Cohort 4 – 2025')
  const [statuses, setStatuses] = useState<Record<string, ApplicationStatus>>(() =>
    Object.fromEntries(MOCK_APPLICATIONS.map(a => [a.id, 'pending']))
  )

  const filtered = applications.filter(a => {
    const matchCohort = cohortFilter === 'all' || a.cohort === cohortFilter
    const matchStatus = statusFilter === 'all' || statuses[a.id] === statusFilter
    return matchCohort && matchStatus
  })

  const pending = applications.filter(a => statuses[a.id] === 'pending').length
  const approved = applications.filter(a => statuses[a.id] === 'approved').length
  const rejected = applications.filter(a => statuses[a.id] === 'rejected').length

  const setStatus = (id: string, status: ApplicationStatus) => {
    setStatuses(prev => ({ ...prev, [id]: status }))
  }

  return (
    <DashboardLayout user={ADMIN_USER} title="Applications">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Applications</h1>
            <p className="text-sm text-gray-500 mt-0.5">Review and manage incoming applications</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total', value: applications.length, color: 'text-gray-900', bg: 'bg-gray-50' },
            { label: 'Pending', value: pending, color: 'text-amber-700', bg: 'bg-amber-50' },
            { label: 'Approved', value: approved, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Rejected', value: rejected, color: 'text-red-700', bg: 'bg-red-50' },
          ].map(s => (
            <div key={s.label} className={cn('rounded-lg border border-gray-200 p-4', s.bg)}>
              <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={cohortFilter} onValueChange={setCohortFilter}>
            <SelectTrigger className="w-44 h-10"><SelectValue placeholder="All Cohorts" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cohorts</SelectItem>
              <SelectItem value="Cohort 4 – 2025">Cohort 4 – 2025</SelectItem>
              <SelectItem value="Cohort 3 – 2025">Cohort 3 – 2025</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 h-10"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="info_requested">Info Requested</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Application Cards */}
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center">
            <Filter className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-400">No applications match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filtered.map(app => {
              const appStatus = statuses[app.id]
              return (
                <div key={app.id} className={cn(
                  'rounded-lg border bg-white p-5 transition-shadow hover:shadow-md',
                  appStatus === 'approved' ? 'border-green-200' : appStatus === 'rejected' ? 'border-red-200' : appStatus === 'info_requested' ? 'border-amber-200' : 'border-gray-200'
                )}>
                  <div className="flex items-start gap-3">
                    <Avatar fallback={getInitials(app.teamName)} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{app.teamName}</h3>
                        <Badge
                          variant={appStatus === 'approved' ? 'success' : appStatus === 'rejected' ? 'error' : appStatus === 'info_requested' ? 'warning' : 'default'}
                          dot
                        >
                          {appStatus === 'info_requested' ? 'Info Requested' : appStatus}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{app.product}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{app.sector} · {app.city}</p>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-2">{app.description}</p>

                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Applied {formatDate(app.appliedDate)}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {app.members} members</span>
                    <Badge variant="gray">{app.cohort}</Badge>
                  </div>

                  <div className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setShowDetailModal(app)}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      View Details
                    </button>
                    <div className="flex-1" />
                    {appStatus === 'pending' && (
                      <>
                        <Button size="sm" onClick={() => setShowApproveModal({ id: app.id, name: app.teamName })}>
                          <CheckCircle className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button variant="outline" size="sm"
                          onClick={() => setShowInfoModal({ id: app.id, name: app.teamName })}>
                          <MessageSquare className="h-3.5 w-3.5" /> Request Info
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => setShowRejectModal({ id: app.id, name: app.teamName })}>
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </>
                    )}
                    {appStatus !== 'pending' && (
                      <button
                        onClick={() => setStatus(app.id, 'pending')}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        Reset to Pending
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <Modal open={!!showApproveModal} onOpenChange={() => setShowApproveModal(null)}>
        <ModalContent>
          <ModalHeader><ModalTitle>Approve Application</ModalTitle></ModalHeader>
          <ModalBody className="space-y-4">
            <p className="text-sm text-gray-600">Approving <strong>{showApproveModal?.name}</strong> will assign them to the selected cohort.</p>
            <Select value={assignCohort} onValueChange={setAssignCohort}>
              <SelectTrigger label="Assign to Cohort"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Cohort 3 – 2025">Cohort 3 – 2025</SelectItem>
                <SelectItem value="Cohort 4 – 2025">Cohort 4 – 2025</SelectItem>
              </SelectContent>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowApproveModal(null)}>Cancel</Button>
            <Button onClick={() => { if (showApproveModal) { setStatus(showApproveModal.id, 'approved'); setShowApproveModal(null) } }}>
              Approve & Assign
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reject Modal */}
      <Modal open={!!showRejectModal} onOpenChange={() => setShowRejectModal(null)}>
        <ModalContent>
          <ModalHeader><ModalTitle>Reject Application</ModalTitle></ModalHeader>
          <ModalBody>
            <Textarea
              label={`Reason for rejecting ${showRejectModal?.name}`}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Provide constructive feedback..."
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => { if (showRejectModal) { setStatus(showRejectModal.id, 'rejected'); setShowRejectModal(null); setRejectReason('') } }}>
              Reject Application
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Request Info Modal */}
      <Modal open={!!showInfoModal} onOpenChange={() => setShowInfoModal(null)}>
        <ModalContent>
          <ModalHeader><ModalTitle>Request More Information</ModalTitle></ModalHeader>
          <ModalBody>
            <Textarea
              label={`Information needed from ${showInfoModal?.name}`}
              value={infoRequest}
              onChange={e => setInfoRequest(e.target.value)}
              rows={4}
              placeholder="Specify what additional documents or information you need..."
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowInfoModal(null)}>Cancel</Button>
            <Button disabled={!infoRequest.trim()} onClick={() => { if (showInfoModal) { setStatus(showInfoModal.id, 'info_requested'); setShowInfoModal(null); setInfoRequest('') } }}>
              Send Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Detail Modal */}
      {showDetailModal && (
        <Modal open={!!showDetailModal} onOpenChange={() => setShowDetailModal(null)}>
          <ModalContent className="max-w-xl">
            <ModalHeader>
              <ModalTitle>{showDetailModal.teamName}</ModalTitle>
            </ModalHeader>
            <ModalBody className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Product:</span> <span className="font-medium text-gray-900">{showDetailModal.product}</span></div>
                <div><span className="text-gray-500">Sector:</span> <span className="font-medium text-gray-900">{showDetailModal.sector}</span></div>
                <div><span className="text-gray-500">City:</span> <span className="font-medium text-gray-900">{showDetailModal.city}</span></div>
                <div><span className="text-gray-500">Members:</span> <span className="font-medium text-gray-900">{showDetailModal.members}</span></div>
                <div><span className="text-gray-500">Cohort:</span> <span className="font-medium text-gray-900">{showDetailModal.cohort}</span></div>
                <div><span className="text-gray-500">Applied:</span> <span className="font-medium text-gray-900">{formatDate(showDetailModal.appliedDate)}</span></div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                <p className="text-sm text-gray-600">{showDetailModal.description}</p>
              </div>
              <p className="text-sm text-gray-500">Contact: <a href={`mailto:${showDetailModal.contactEmail}`} className="text-indigo-600 hover:underline">{showDetailModal.contactEmail}</a></p>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={() => setShowDetailModal(null)}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </DashboardLayout>
  )
}
