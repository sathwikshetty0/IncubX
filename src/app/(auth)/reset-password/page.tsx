'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    // Supabase sets auth tokens via URL hash on redirect — listen for session
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })
    // Also check if already in a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

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
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full animate-fade-in">
        <div className="mb-10 text-center lg:text-left">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Password updated</h1>
          <p className="text-gray-500 mt-2 font-light">Redirecting you to sign in…</p>
        </div>

        <div className="rounded-2xl bg-green-50/50 border border-green-100 p-8 flex flex-col items-center text-center gap-4 animate-slide-up">
          <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Success!</h2>
            <p className="text-sm text-gray-600 leading-relaxed font-light">
              Your password has been changed successfully. You can now use your new password to sign in.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Set new password</h1>
        <p className="text-gray-500 mt-2 font-light">Make it strong — at least 8 characters.</p>
      </div>

      <div className="space-y-6">
        {!sessionReady && (
          <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 flex items-start gap-3 animate-fade-in">
            <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800 leading-tight font-medium">
              Invalid or expired session. Please open this link directly from your reset email.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Input
            label="New password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 characters"
            disabled={loading || !sessionReady}
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
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            disabled={loading || !sessionReady}
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
            disabled={loading || !sessionReady}
          >
            {loading ? 'Updating…' : (
              <>
                Update password <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
