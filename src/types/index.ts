// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'ceo'
  | 'program_incharge'
  | 'finance_id'
  | 'primary_mentor'
  | 'sector_expert'
  | 'product_expert'
  | 'marketing_expert'
  | 'legal_finance_expert'
  | 'general_mentor'
  | 'premium_mentor'
  | 'team_lead'
  | 'team_member'
  | 'alumni'
  | 'investor'
  | 'applicant'

export type ProgramStatus = 'draft' | 'active' | 'completed' | 'archived'
export type CohortStatus = 'upcoming' | 'active' | 'completed'
export type TeamStatus = 'active' | 'inactive' | 'graduated' | 'dropped'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type SubmissionStatus = 'submitted' | 'reviewed' | 'approved' | 'rejected'
export type ResourceRequestStatus = 'pending' | 'approved' | 'rejected' | 'fulfilled'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

// ─── Core Interfaces ──────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  phone?: string
  bio?: string
  linkedin_url?: string
  organization_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url?: string
  website?: string
  description?: string
  address?: string
  city?: string
  state?: string
  country?: string
  created_at: string
  updated_at: string
}

export interface Program {
  id: string
  organization_id: string
  name: string
  slug: string
  description?: string
  status: ProgramStatus
  start_date?: string
  end_date?: string
  max_cohorts?: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface Cohort {
  id: string
  program_id: string
  name: string
  slug: string
  description?: string
  status: CohortStatus
  start_date: string
  end_date: string
  max_teams?: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  cohort_id: string
  name: string
  slug: string
  sector?: string
  stage?: string
  description?: string
  logo_url?: string
  website?: string
  status: TeamStatus
  health_score?: number
  credits_balance: number
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: 'team_lead' | 'team_member'
  joined_at: string
  is_active: boolean
  user?: User
  team?: Team
}

export interface MentorSlot {
  id: string
  mentor_id: string
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  is_available: boolean
  credits_required: number
  meeting_link?: string
  created_at: string
  updated_at: string
  mentor?: User
}

export interface Booking {
  id: string
  slot_id: string
  team_id: string
  booked_by: string
  status: BookingStatus
  agenda?: string
  notes?: string
  rating?: number
  feedback?: string
  credits_used: number
  created_at: string
  updated_at: string
  slot?: MentorSlot
  team?: Team
  booker?: User
}

export interface Assignment {
  id: string
  cohort_id: string
  title: string
  description?: string
  due_date: string
  max_score?: number
  is_required: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface ToolSubmission {
  id: string
  assignment_id: string
  team_id: string
  submitted_by: string
  status: SubmissionStatus
  content?: Record<string, unknown>
  file_urls?: string[]
  score?: number
  feedback?: string
  reviewed_by?: string
  reviewed_at?: string
  submitted_at: string
  updated_at: string
  assignment?: Assignment
  team?: Team
  submitter?: User
}

export interface ResourceRequest {
  id: string
  team_id: string
  requested_by: string
  resource_type: string
  title: string
  description?: string
  amount?: number
  status: ResourceRequestStatus
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
  team?: Team
  requester?: User
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  priority: NotificationPriority
  is_read: boolean
  action_url?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface Credits {
  id: string
  team_id: string
  balance: number
  total_earned: number
  total_spent: number
  updated_at: string
  team?: Team
}

export interface CreditTransaction {
  id: string
  team_id: string
  amount: number
  type: 'earn' | 'spend'
  reason: string
  reference_id?: string
  reference_type?: string
  created_by: string
  created_at: string
}

export interface LmsModule {
  id: string
  cohort_id?: string
  program_id?: string
  title: string
  description?: string
  content?: Record<string, unknown>
  video_url?: string
  duration_minutes?: number
  order_index: number
  is_published: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface LmsProgress {
  id: string
  module_id: string
  user_id: string
  team_id?: string
  completed: boolean
  completed_at?: string
  time_spent_minutes?: number
  quiz_score?: number
  created_at: string
  updated_at: string
}

// ─── Utility Types ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface NavItem {
  label: string
  href: string
  icon: string
  roles: UserRole[]
  badge?: number
}

export interface DashboardStat {
  label: string
  value: string | number
  trend?: {
    direction: 'up' | 'down'
    percentage: number
  }
  icon: string
  color?: string
}
