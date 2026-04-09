'use client'

import React, { useState } from 'react'
import { Plus, Megaphone, Clock, Users, Send, Trash2, Eye } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ADMIN_USER } from '@/lib/mock-admin-user'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const MOCK_ANNOUNCEMENTS = [
  { id: '1', subject: 'Demo Day Registration Open – Cohort 2', body: 'We are excited to announce that Demo Day registrations for Cohort 2 are now open. All teams must submit their pitch decks by April 20.', target: 'all', targetLabel: 'All Users', status: 'sent', sentAt: '2025-04-01T10:00:00', scheduledAt: null, author: 'Priya Sharma' },
  { id: '2', subject: 'New Mentor Added: Dr. Lakshmi Prasad', body: 'We welcome Dr. Lakshmi Prasad as our new HealthTech sector expert. Teams in the healthcare domain can now book sessions with her.', target: 'teams', targetLabel: 'Teams Only', status: 'sent', sentAt: '2025-03-28T14:00:00', scheduledAt: null, author: 'Priya Sharma' },
  { id: '3', subject: 'Monthly Mentor Honorarium – March 2025', body: 'Please note that March 2025 honorarium payments will be processed by April 10. Please verify your bank details in the portal.', target: 'mentors', targetLabel: 'Mentors Only', status: 'sent', sentAt: '2025-03-25T09:00:00', scheduledAt: null, author: 'Ravi Prasad' },
  { id: '4', subject: 'Cohort 4 Applications Now Open', body: 'Applications for Cohort 4 (Acceleration Track) are now open. Share with your networks and refer promising startups.', target: 'all', targetLabel: 'All Users', status: 'scheduled', sentAt: null, scheduledAt: '2025-04-15T09:00:00', author: 'Priya Sharma' },
  { id: '5', subject: 'Alumni Spotlight – GreenHarvest AgriTech Fundraise', body: 'Congratulations to GreenHarvest AgriTech for closing their seed round of ₹2.5Cr! Read their founder story.', target: 'alumni', targetLabel: 'Alumni Only', status: 'draft', sentAt: null, scheduledAt: null, author: 'Priya Sharma' },
]

const TARGET_OPTIONS = [
  { value: 'all', label: 'All Users' },
  { value: 'teams', label: 'Teams Only' },
  { value: 'mentors', label: 'Mentors Only' },
  { value: 'cohort_3', label: 'Cohort 3 Teams' },
  { value: 'alumni', label: 'Alumni Only' },
]

function statusBadge(status: string) {
  const map: Record<string, 'success' | 'indigo' | 'gray'> = { sent: 'success', scheduled: 'indigo', draft: 'gray' }
  return <Badge variant={map[status] ?? 'default'} dot>{status}</Badge>
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState<typeof MOCK_ANNOUNCEMENTS[0] | null>(null)
  const [form, setForm] = useState({ subject: '', body: '', target: 'all', schedule: 'now', scheduledAt: '' })

  const handleCreate = (sendNow: boolean) => {
    const id = String(announcements.length + 1)
    const targetLabel = TARGET_OPTIONS.find(t => t.value === form.target)?.label ?? 'All Users'
    const now = new Date().toISOString()
    setAnnouncements(prev => [...prev, {
      id, subject: form.subject, body: form.body,
      target: form.target, targetLabel,
      status: sendNow ? 'sent' : form.scheduledAt ? 'scheduled' : 'draft',
      sentAt: sendNow ? now : null,
      scheduledAt: !sendNow && form.scheduledAt ? form.scheduledAt : null,
      author: 'Priya Sharma'
    }])
    setShowCreateModal(false)
    setForm({ subject: '', body: '', target: 'all', schedule: 'now', scheduledAt: '' })
  }

  const handleDelete = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  return (
    <DashboardLayout user={ADMIN_USER} title="Announcements">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
            <p className="text-sm text-gray-500 mt-0.5">{announcements.filter(a => a.status === 'sent').length} sent · {announcements.filter(a => a.status === 'scheduled').length} scheduled</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" /> Create Announcement
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Sent', value: announcements.filter(a => a.status === 'sent').length, icon: Send, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Scheduled', value: announcements.filter(a => a.status === 'scheduled').length, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Drafts', value: announcements.filter(a => a.status === 'draft').length, icon: Megaphone, color: 'text-gray-600', bg: 'bg-gray-50' },
          ].map(s => (
            <div key={s.label} className={cn('rounded-lg border border-gray-200 p-4 flex items-center gap-3', s.bg)}>
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-white', s.color)}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className="rounded-lg border border-gray-200 bg-white p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-4">
                <div className={cn(
                  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  a.status === 'sent' ? 'bg-green-100' : a.status === 'scheduled' ? 'bg-indigo-100' : 'bg-gray-100'
                )}>
                  <Megaphone className={cn('h-3.5 w-3.5', a.status === 'sent' ? 'text-green-600' : a.status === 'scheduled' ? 'text-indigo-600' : 'text-gray-500')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{a.subject}</h3>
                    {statusBadge(a.status)}
                    <Badge variant="gray" className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {a.targetLabel}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{a.body}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    <span>By {a.author}</span>
                    {a.sentAt && <span className="flex items-center gap-1"><Send className="h-3 w-3" /> Sent {formatDate(a.sentAt)}</span>}
                    {a.scheduledAt && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Scheduled {formatDate(a.scheduledAt)}</span>}
                    {!a.sentAt && !a.scheduledAt && <span>Draft — not scheduled</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => setShowPreviewModal(a)}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  {a.status !== 'sent' && (
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50"
                      onClick={() => handleDelete(a.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Announcement Modal */}
      <Modal open={showCreateModal} onOpenChange={setShowCreateModal}>
        <ModalContent className="max-w-2xl">
          <ModalHeader><ModalTitle>Create Announcement</ModalTitle></ModalHeader>
          <ModalBody className="space-y-4">
            <Input
              label="Subject"
              value={form.subject}
              onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
              placeholder="e.g. Important update for all teams"
            />
            <Textarea
              label="Message"
              value={form.body}
              onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
              rows={5}
              placeholder="Write your announcement message here..."
            />
            <Select value={form.target} onValueChange={v => setForm(p => ({ ...p, target: v }))}>
              <SelectTrigger label="Target Audience"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TARGET_OPTIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">Schedule</p>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={form.schedule === 'now'} onChange={() => setForm(p => ({ ...p, schedule: 'now' }))} className="accent-indigo-600" />
                  <span className="text-sm text-gray-700">Send Immediately</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={form.schedule === 'later'} onChange={() => setForm(p => ({ ...p, schedule: 'later' }))} className="accent-indigo-600" />
                  <span className="text-sm text-gray-700">Schedule for Later</span>
                </label>
              </div>
              {form.schedule === 'later' && (
                <Input
                  className="mt-3"
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))}
                />
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="secondary" onClick={() => handleCreate(false)}>Save as Draft</Button>
            <Button onClick={() => handleCreate(form.schedule === 'now')} disabled={!form.subject || !form.body}>
              {form.schedule === 'now' ? 'Send Now' : 'Schedule'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Preview Modal */}
      {showPreviewModal && (
        <Modal open={!!showPreviewModal} onOpenChange={() => setShowPreviewModal(null)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{showPreviewModal.subject}</ModalTitle>
            </ModalHeader>
            <ModalBody className="space-y-3">
              <div className="flex items-center gap-2">
                {statusBadge(showPreviewModal.status)}
                <Badge variant="gray">{showPreviewModal.targetLabel}</Badge>
                <span className="text-xs text-gray-400">By {showPreviewModal.author}</span>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{showPreviewModal.body}</p>
              </div>
              {showPreviewModal.sentAt && (
                <p className="text-xs text-gray-400">Sent on {formatDate(showPreviewModal.sentAt)}</p>
              )}
              {showPreviewModal.scheduledAt && (
                <p className="text-xs text-gray-400">Scheduled for {formatDate(showPreviewModal.scheduledAt)}</p>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={() => setShowPreviewModal(null)}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </DashboardLayout>
  )
}
