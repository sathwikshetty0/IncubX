'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

      const { error: updateError } = await supabase.auth.updateUser({
        password,
        data: {
          full_name: fullName.trim(),
          role: tokenData?.role,
          invitation_accepted: true,
        },
      })

      if (updateError) {
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

  if (tokenLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <svg className="h-8 w-8 animate-spin text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-gray-500 font-light">Validating your invitation…</p>
      </div>
    )
  }

  if (tokenError) {
    return (
      <div className="w-full text-center py-12">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
        <p className="text-gray-500 mb-8 font-light max-w-sm mx-auto">{tokenError}</p>
        <Button variant="outline" asChild>
          <Link href="/login">Back to Sign In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center lg:text-left">
        <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
          <Badge variant="indigo">Official Invitation</Badge>
          <span className="text-xs text-gray-400 uppercase tracking-widest">Cohort 4</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create your account</h1>
        <p className="text-gray-500 mt-2 font-light">Join the INCUBX ecosystem as a <span className="text-indigo-600 font-medium">{roleLabel(tokenData?.role ?? '')}</span>.</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl bg-indigo-50/50 border border-indigo-100 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 w-24 shrink-0">Email</span>
            <span className="font-medium text-gray-900 truncate">{tokenData?.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 w-24 shrink-0">Role</span>
            <span className="font-medium text-gray-900">{roleLabel(tokenData?.role ?? '')}</span>
          </div>
          {tokenData?.org_name && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 w-24 shrink-0">Organization</span>
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

        <div className="mt-8 pt-6 border-t border-gray-100">
           <p className="text-xs text-gray-400 text-center font-light">
             By accepting this invitation, you agree to the INCUBX Founder Code of Conduct and Terms of Service.
           </p>
        </div>
      </div>
    </div>
  )
}
