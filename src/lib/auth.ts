import { UserRole } from '@/types'

// ─── Role-based redirects ─────────────────────────────────────────────────────

export const ROLE_REDIRECTS: Record<string, string> = {
  super_admin: '/super-admin/dashboard',
  admin: '/admin/dashboard',
  ceo: '/ceo/dashboard',
  program_incharge: '/incharge/dashboard',
  finance_id: '/finance/dashboard',
  primary_mentor: '/mentor/dashboard',
  sector_expert: '/mentor/dashboard',
  product_expert: '/mentor/dashboard',
  marketing_expert: '/mentor/dashboard',
  legal_finance_expert: '/mentor/dashboard',
  general_mentor: '/mentor/dashboard',
  premium_mentor: '/mentor/dashboard',
  team_lead: '/team/dashboard',
  team_member: '/team/dashboard',
  alumni: '/alumni/dashboard',
  investor: '/investor/dashboard',
  applicant: '/team/dashboard',
}

export function getRoleRedirect(role: string): string {
  return ROLE_REDIRECTS[role] ?? '/team/dashboard'
}

const MENTOR_ROLES: UserRole[] = [
  'primary_mentor',
  'sector_expert',
  'product_expert',
  'marketing_expert',
  'legal_finance_expert',
  'general_mentor',
  'premium_mentor',
]

const ADMIN_ROLES: UserRole[] = ['super_admin', 'admin', 'ceo', 'program_incharge', 'finance_id']

const TEAM_ROLES: UserRole[] = ['team_lead', 'team_member', 'applicant']

export function isMentorRole(role: string): boolean {
  return MENTOR_ROLES.includes(role as UserRole)
}

export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role as UserRole)
}

export function isTeamRole(role: string): boolean {
  return TEAM_ROLES.includes(role as UserRole)
}
