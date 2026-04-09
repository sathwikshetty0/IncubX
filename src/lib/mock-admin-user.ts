import type { User } from '@/types'

export const ADMIN_USER: Pick<User, 'id' | 'full_name' | 'role' | 'avatar_url' | 'email'> = {
  id: 'admin-001',
  full_name: 'Priya Sharma',
  role: 'admin',
  email: 'priya.sharma@incubx.in',
  avatar_url: undefined,
}
