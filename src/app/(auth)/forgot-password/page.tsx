'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      )

      if (resetError) {
        setError(resetError.message)
        return
      }

      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/login">
          <span className="text-4xl font-extrabold tracking-tight text-indigo-700">INCUBX</span>
        </Link>
        <p className="text-gray-500 text-sm font-medium tracking-wide uppercase mt-1">
          Where Startups Are Built
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader className="pb-2 pt-6 px-6">
          <h1 className="text-xl font-semibold text-gray-900">Reset your password</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-4">
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Check your inbox</h2>
                <p className="text-sm text-gray-500 mt-1">
                  We sent a password reset link to{' '}
                  <span className="font-medium text-gray-800">{email}</span>.
                  Check your spam folder if you don&apos;t see it.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSent(false); setEmail('') }}
              >
                Send to a different email
              </Button>
            </div>
          ) : (
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
                className="w-full"
                isLoading={loading}
                disabled={loading}
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-gray-500 mt-6">
        Remember your password?{' '}
        <Link href="/login" className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
