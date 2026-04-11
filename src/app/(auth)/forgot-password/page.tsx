'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, AlertCircle, ArrowLeft, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
    <div className="w-full animate-fade-in">
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reset password</h1>
        <p className="text-gray-500 mt-2 font-light">
          {sent 
            ? "Check your inbox for the reset link."
            : "Enter your email and we'll send you a recovery link."}
        </p>
      </div>

      <div className="space-y-6">
        {sent ? (
          <div className="space-y-8 animate-slide-up">
            <div className="rounded-2xl bg-indigo-50/50 border border-indigo-100/50 p-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-gray-900">Check your email</h2>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  We sent a recovery link to <span className="font-semibold text-gray-900">{email}</span>.
                  Check your spam folder if you don't see it within a few minutes.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button
                variant="outline"
                className="w-full sm:w-auto rounded-full px-8"
                onClick={() => { setSent(false); setEmail('') }}
              >
                Send to different email
              </Button>
              <Button asChild variant="ghost" className="w-full sm:w-auto text-gray-500 hover:text-indigo-600">
                <Link href="/login" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back to Sign In
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              leftIcon={<Mail className="h-4 w-4" />}
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
              className="w-full group shadow-lg shadow-indigo-100"
              isLoading={loading}
            >
              {loading ? 'Sending link…' : (
                <>
                  Send recovery link <Mail className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
                </>
              )}
            </Button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors inline-flex items-center gap-2 font-medium">
                <ArrowLeft className="h-4 w-4" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
