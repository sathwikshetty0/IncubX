'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TokenData {
  email: string
  role: string
  org_name: string
  is_valid: boolean
}

function roleLabel(role: string): string {
  return role
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function RegisterPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [tokenLoading, setTokenLoading] = useState(true)
  const [tokenError, setTokenError] = useState('')

  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function validateToken() {
      try {
        const res = await fetch(`/api/auth/validate-token?token=${encodeURIComponent(token)}`)
        if (!res.ok) throw new Error('Network error')
        const data = await res.json()
        if (!data.is_valid) {
          setTokenError('This invitation link is invalid or has expired.')
        } else {
          setTokenData(data)
        }
      } catch {
        setTokenError('Failed to validate invitation. Please try again.')
      } finally {
        setTokenLoading(false)
      }
    }
    if (token) validateToken()
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) {
      setError('Full name is required.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      // Sign in with the token-provided email using a magic/temp approach:
      // Since the admin created the user, we update their password + metadata
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        data: {
          full_name: fullName.trim(),
          role: tokenData?.role,
          invitation_accepted: true,
        },
      })

      if (updateError) {
        // User may need to sign in first via the invite link (handled by Supabase email)
        // Attempt sign-up if user doesn't exist
        const { error: signUpError } = await supabase.auth.signUp({
          email: tokenData!.email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: tokenData?.role,
            },
          },
        })
        if (signUpError) {
          setError(signUpError.message)
          return
        }
      }

      router.push('/onboarding/disc')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (tokenLoading) {
    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl font-extrabold tracking-tight text-indigo-700">INCUBX</span>
        </div>
        <Card className="shadow-md">
          <CardContent className="py-12 flex flex-col items-center gap-3">
            <svg className="h-8 w-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-500">Validating your invitation…</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Invalid token
  if (tokenError) {
    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl font-extrabold tracking-tight text-indigo-700">INCUBX</span>
        </div>
        <Card className="shadow-md">
          <CardContent className="py-12 flex flex-col items-center gap-4 text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Invalid Invitation</h2>
              <p className="text-sm text-gray-500 mt-1">{tokenError}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <span className="text-4xl font-extrabold tracking-tight text-indigo-700">INCUBX</span>
        <p className="text-gray-500 text-sm font-medium tracking-wide uppercase mt-1">
          Where Startups Are Built
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader className="pb-2 pt-6 px-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <Badge variant="indigo">Invitation</Badge>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            You&apos;ve been invited to join INCUBX
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Set up your account to get started
          </p>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-4">
          {/* Invite details */}
          <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-4 mb-5 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 w-20 shrink-0">Email</span>
              <span className="font-medium text-gray-900">{tokenData?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 w-20 shrink-0">Role</span>
              <span className="font-medium text-gray-900">{roleLabel(tokenData?.role ?? '')}</span>
            </div>
            {tokenData?.org_name && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 w-20 shrink-0">Organization</span>
                <span className="font-medium text-gray-900">{tokenData.org_name}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Full name"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Smith"
              disabled={loading}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Password <span className="ml-1 text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  disabled={loading}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent hover:border-gray-400 disabled:bg-gray-50 disabled:opacity-60"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              disabled={loading}
              error={confirmPassword && confirmPassword !== password ? 'Passwords do not match' : undefined}
            />

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2.5 flex items-start gap-2">
                <svg className="h-4 w-4 text-red-500 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
              disabled={loading}
            >
              {loading ? 'Setting up account…' : 'Accept invitation'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
