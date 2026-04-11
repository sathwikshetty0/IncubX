'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
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
      <div className="w-full flex flex-col items-center justify-center py-12 animate-fade-in">
        <div className="h-10 w-10 rounded-full border-b-2 border-indigo-600 animate-spin" />
        <p className="text-sm text-gray-500 font-light mt-4">Validating your invitation…</p>
      </div>
    )
  }

  if (tokenError) {
    return (
      <div className="w-full text-center py-12 animate-fade-in">
        <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
        <p className="text-gray-500 mb-8 font-light max-w-sm mx-auto">{tokenError}</p>
        <Button variant="outline" asChild size="lg" className="rounded-full px-8">
          <Link href="/login">Back to Sign In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-8 text-center lg:text-left">
        <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
          <Badge variant="indigo" dot>Official Invitation</Badge>
          <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">Cohort 4</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create your account</h1>
        <p className="text-gray-500 mt-2 font-light leading-relaxed">Join the INCUBX ecosystem as a <span className="text-indigo-600 font-semibold">{roleLabel(tokenData?.role ?? '')}</span>.</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl bg-indigo-50/50 border border-indigo-100/50 p-6 space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500 w-24 shrink-0 font-medium">Email</span>
            <span className="font-semibold text-gray-900 truncate">{tokenData?.email}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500 w-24 shrink-0 font-medium">Role</span>
            <span className="font-semibold text-gray-900">{roleLabel(tokenData?.role ?? '')}</span>
          </div>
          {tokenData?.org_name && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500 w-24 shrink-0 font-medium">Organization</span>
              <span className="font-semibold text-gray-900">{tokenData.org_name}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
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

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 characters"
            disabled={loading}
            rightIcon={
              <button
                type="button"
                className="flex items-center p-1 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
          />

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
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 flex items-start gap-3 animate-slide-up">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-800 leading-tight">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full mt-4 group shadow-lg shadow-indigo-100"
            isLoading={loading}
          >
            {loading ? 'Setting up account…' : (
              <>
                Accept invitation <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
           <p className="text-xs text-gray-400 text-center font-light leading-loose">
             By accepting this invitation, you agree to the INCUBX <Link href="#" className="underline hover:text-indigo-600 transition-colors">Founder Code of Conduct</Link> and <Link href="#" className="underline hover:text-indigo-600 transition-colors">Terms of Service</Link>.
           </p>
        </div>
      </div>
    </div>
  )
}
