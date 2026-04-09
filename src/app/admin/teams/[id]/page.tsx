'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Globe, Edit, Ban, UserPlus, ExternalLink,
  Trash2, FileText, DollarSign, StickyNote, Users
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProgressRing } from '@/components/shared/progress-ring'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Textarea } from '@/components/ui/textarea'
import { ADMIN_USER } from '@/lib/mock-admin-user'
import { getInitials, formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const TEAMS_DATA: Record<string, {
  id: string; name: string; product: string; stage: string; sector: string;
  description: string; website: string; city: string; cohort: string; mentor: string;
  status: string; progress: number; logo?: string; founded: string;
}> = {
  '1': {
    id: '1', name: 'GreenHarvest AgriTech', product: 'Smart Irrigation Platform',
    stage: 'MVP', sector: 'AgriTech', description: 'GreenHarvest is building an AI-powered irrigation platform that reduces water usage for small-scale farmers by up to 40%. The system uses soil moisture sensors, weather APIs, and ML models to automate irrigation schedules.',
    website: 'https://greenharvesttech.in', city: 'Pune', cohort: 'Cohort 3', mentor: 'Dr. Suresh Iyer',
    status: 'active', progress: 68, founded: '2024-08-15'
  },
  '2': {
    id: '2', name: 'HealthSync Pro', product: 'AI Diagnostics Assistant',
    stage: 'Prototype', sector: 'HealthTech', description: 'HealthSync Pro is developing an AI-driven diagnostics assistant that helps rural healthcare workers perform preliminary diagnoses using symptom data and low-cost point-of-care devices.',
    website: 'https://healthsyncpro.co.in', city: 'Bengaluru', cohort: 'Cohort 3', mentor: 'Neha Krishnan',
    status: 'active', progress: 45, founded: '2024-09-01'
  },
}

const MEMBERS = [
  { id: '1', name: 'Arjun Patel', email: 'arjun.patel@greenharvesttech.in', role: 'team_lead', disc: 'D', joined: '2024-08-15' },
  { id: '2', name: 'Meera Nair', email: 'meera.nair@greenharvesttech.in', role: 'team_member', disc: 'C', joined: '2024-08-20' },
  { id: '3', name: 'Siddharth Joshi', email: 'siddharth.j@greenharvesttech.in', role: 'team_member', disc: 'I', joined: '2024-09-01' },
]

const SUBMISSIONS = [
  { id: '1', tool: 'Business Model Canvas', status: 'approved', score: 85, date: '2024-10-05' },
  { id: '2', tool: 'Customer Discovery Report', status: 'reviewed', score: 72, date: '2024-11-12' },
  { id: '3', tool: 'MVP Demo Video', status: 'submitted', score: null, date: '2025-01-20' },
  { id: '4', tool: 'Financial Projections', status: 'submitted', score: null, date: '2025-02-14' },
]

const TRANSACTIONS = [
  { id: '1', desc: 'Initial cohort allocation', amount: 50000, type: 'credit', date: '2024-09-01' },
  { id: '2', desc: 'Mentor session booking – Oct', amount: -5000, type: 'debit', date: '2024-10-10' },
  { id: '3', desc: 'Resource grant approved', amount: 15000, type: 'credit', date: '2024-11-15' },
  { id: '4', desc: 'Workshop registration fee', amount: -2500, type: 'debit', date: '2024-12-01' },
  { id: '5', desc: 'Prototype equipment purchase', amount: -12000, type: 'debit', date: '2025-01-08' },
]

const MENTOR_NOTES = [
  { id: '1', author: 'Dr. Suresh Iyer', role: 'Primary Mentor', date: '2025-03-20', note: 'Team showed excellent progress in customer validation. Arjun demonstrated strong business acumen. Need to focus on unit economics before next review.' },
  { id: '2', author: 'Neha Krishnan', role: 'Sector Expert', date: '2025-02-15', note: 'The technical approach is sound. Recommend exploring partnerships with drip irrigation hardware manufacturers for faster go-to-market.' },
]

const DISC_COLOR: Record<string, string> = { D: 'bg-red-100 text-red-700', I: 'bg-yellow-100 text-yellow-700', S: 'bg-green-100 text-green-700', C: 'bg-blue-100 text-blue-700' }

function submissionStatusBadge(status: string) {
  const map: Record<string, 'success' | 'indigo' | 'blue' | 'default'> = { approved: 'success', reviewed: 'indigo', submitted: 'blue', rejected: 'default' }
  return <Badge variant={map[status] ?? 'default'}>{status}</Badge>
}

export default function TeamDetailPage() {
  const params = useParams()
  const teamId = String(params.id)
  const team = TEAMS_DATA[teamId] ?? TEAMS_DATA['1']

  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'submissions' | 'budget' | 'notes'>('overview')
  const [adminNote, setAdminNote] = useState('')
  const [savedAdminNotes, setSavedAdminNotes] = useState<{ text: string; date: string }[]>([])
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState<string | null>(null)
  const [members, setMembers] = useState(MEMBERS)

  const allocated = 65000
  const used = TRANSACTIONS.filter(t => t.type === 'debit').reduce((a, b) => a + Math.abs(b.amount), 0)
  const remaining = allocated - used

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'submissions', label: 'Submissions', icon: FileText },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'notes', label: 'Notes', icon: StickyNote },
  ] as const

  return (
    <DashboardLayout user={ADMIN_USER} title={team.name}>
      <div className="space-y-5">
        {/* Back + Header */}
        <div className="flex items-start gap-4">
          <Link href="/admin/teams" className="mt-1 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <Avatar fallback={getInitials(team.name)} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                  <Badge variant={team.status === 'active' ? 'success' : 'warning'} dot>{team.status}</Badge>
                </div>
                <p className="text-sm text-gray-500">{team.product} · {team.sector} · {team.city} · {team.cohort}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm"><Edit className="h-3.5 w-3.5" /> Edit</Button>
            <Button variant="outline" size="sm" className="text-amber-600 border-amber-200 hover:bg-amber-50"><Ban className="h-3.5 w-3.5" /> Suspend</Button>
            <Button variant="outline" size="sm"><UserPlus className="h-3.5 w-3.5" /> Assign Mentor</Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-5">
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-3">About</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{team.description}</p>
                {team.website && (
                  <a href={team.website} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
                    <Globe className="h-3.5 w-3.5" /> {team.website} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-3">AI-Generated Overview</h3>
                <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-4">
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    GreenHarvest AgriTech is a promising early-stage startup addressing critical water scarcity challenges in Indian agriculture. The team has demonstrated strong technical capabilities with IoT sensor integration and ML model development. Customer traction from pilot farms in Pune region shows 40% water reduction. Key risks include hardware distribution logistics and farmer adoption in non-English-speaking rural areas. Recommended next steps: fundraise seed round, expand pilot to 50+ farms, file provisional patent for sensor algorithm.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Progress</h3>
                <div className="flex justify-center">
                  <ProgressRing value={team.progress} size={96} strokeWidth={8} />
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Details</h3>
                <dl className="space-y-2.5">
                  {[
                    { label: 'Stage', value: team.stage },
                    { label: 'Sector', value: team.sector },
                    { label: 'City', value: team.city },
                    { label: 'Cohort', value: team.cohort },
                    { label: 'Primary Mentor', value: team.mentor },
                    { label: 'Founded', value: formatDate(team.founded) },
                    { label: 'Members', value: `${members.length} people` },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <dt className="text-gray-500">{item.label}</dt>
                      <dd className="font-medium text-gray-900">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Team Members ({members.length})</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Member</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Role</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">DISC</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Joined</th>
                  <th className="px-5 py-3 text-right font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map(member => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar fallback={getInitials(member.name)} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-400">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={member.role === 'team_lead' ? 'indigo' : 'default'}>{member.role === 'team_lead' ? 'Team Lead' : 'Member'}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn('inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold', DISC_COLOR[member.disc])}>
                        {member.disc}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{formatDate(member.joined)}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setShowRemoveMemberModal(member.id)}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Tool Submissions ({SUBMISSIONS.length})</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Tool / Assignment</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Status</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Score</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {SUBMISSIONS.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{s.tool}</td>
                    <td className="px-5 py-3">{submissionStatusBadge(s.status)}</td>
                    <td className="px-5 py-3">{s.score != null ? <span className="font-semibold text-gray-900">{s.score}/100</span> : <span className="text-gray-400">—</span>}</td>
                    <td className="px-5 py-3 text-gray-600">{formatDate(s.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Allocated', value: allocated, color: 'text-indigo-600' },
                { label: 'Used', value: used, color: 'text-amber-600' },
                { label: 'Remaining', value: remaining, color: 'text-green-600' },
              ].map(item => (
                <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-5">
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className={cn('text-2xl font-bold mt-1', item.color)}>{formatCurrency(item.value)}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Budget Utilization</h3>
              <div className="h-4 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${(used / allocated) * 100}%` }} />
              </div>
              <p className="mt-2 text-xs text-gray-500">{Math.round((used / allocated) * 100)}% utilized · {formatCurrency(remaining)} remaining</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Transaction Log</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium text-gray-600">Description</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-600">Date</th>
                    <th className="px-5 py-3 text-right font-medium text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {TRANSACTIONS.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-900">{t.desc}</td>
                      <td className="px-5 py-3 text-gray-500">{formatDate(t.date)}</td>
                      <td className={cn('px-5 py-3 text-right font-medium', t.amount > 0 ? 'text-green-600' : 'text-red-600')}>
                        {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-5">
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Mentor Notes (read-only)</h3>
              <div className="space-y-4">
                {MENTOR_NOTES.map(note => (
                  <div key={note.id} className="rounded-lg bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar fallback={getInitials(note.author)} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{note.author}</p>
                          <p className="text-xs text-gray-500">{note.role}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(note.date)}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{note.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Admin Notes</h3>
              {savedAdminNotes.length > 0 && (
                <div className="mb-4 space-y-3">
                  {savedAdminNotes.map((n, i) => (
                    <div key={i} className="rounded-lg bg-indigo-50 border border-indigo-100 p-3">
                      <p className="text-sm text-indigo-900">{n.text}</p>
                      <p className="mt-1 text-xs text-indigo-400">{n.date}</p>
                    </div>
                  ))}
                </div>
              )}
              <Textarea
                label="Add admin note"
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="Add your observation, follow-up, or action item..."
                rows={4}
              />
              <Button
                className="mt-3"
                onClick={() => {
                  if (adminNote.trim()) {
                    setSavedAdminNotes(prev => [...prev, { text: adminNote, date: new Date().toLocaleString('en-IN') }])
                    setAdminNote('')
                  }
                }}
                disabled={!adminNote.trim()}
              >
                Save Note
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Remove Member Modal */}
      <Modal open={!!showRemoveMemberModal} onOpenChange={() => setShowRemoveMemberModal(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Remove Member</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-gray-600">Are you sure you want to remove this member? This action requires mentor approval in the workflow.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowRemoveMemberModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => {
              setMembers(prev => prev.filter(m => m.id !== showRemoveMemberModal))
              setShowRemoveMemberModal(null)
            }}>Remove Member</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  )
}
