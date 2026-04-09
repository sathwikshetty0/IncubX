'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getRoleRedirect } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    if (!password) {
      setError('Password is required.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (signInError) {
        setError(signInError.message === 'Invalid login credentials'
          ? 'Invalid email or password. Please try again.'
          : signInError.message)
        return
      }

      // Fetch user profile
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Authentication failed. Please try again.')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role, disc_results, profile_completed')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        // New user without profile — go to DISC
        router.push('/onboarding/disc')
        return
      }

      // Check onboarding state
      if (!profile.disc_results) {
        router.push('/onboarding/disc')
        return
      }

      if (!profile.profile_completed) {
        router.push('/onboarding/profile')
        return
      }

      router.push(getRoleRedirect(profile.role))
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
        <p className="text-gray-500 mt-2 font-light">Sign in to your INCUBX account to continue building.</p>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
          />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Password <span className="ml-1 text-red-500">*</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
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
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account? <span className="text-indigo-600 font-medium cursor-help" title="Contact your program manager for an invitation.">How to join</span>
          </p>
        </div>
      </div>
    </div>
  )
}
