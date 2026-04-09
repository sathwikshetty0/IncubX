'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getRoleRedirect } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { getInitials } from '@/lib/utils'

const MAX_BIO_LENGTH = 200

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Form fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [github, setGithub] = useState('')
  const [twitter, setTwitter] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [userId, setUserId] = useState('')
  const [userRole, setUserRole] = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)
      setUserEmail(user.email ?? '')

      // Pre-fill from auth metadata
      const metaName = user.user_metadata?.full_name ?? ''
      setFullName(metaName)

      // Try to load existing profile
      const { data: profile } = await supabase
        .from('users')
        .select('full_name, phone, bio, linkedin_url, github_url, twitter_url, avatar_url, role')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name || metaName)
        setPhone(profile.phone || '')
        setBio(profile.bio || '')
        setLinkedin(profile.linkedin_url || '')
        setGithub(profile.github_url || '')
        setTwitter(profile.twitter_url || '')
        setAvatarUrl(profile.avatar_url || null)
        setUserRole(profile.role || '')
      }

      setLoading(false)
    }
    loadUser()
  }, [router])

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.')
      return
    }

    setUploadingPhoto(true)
    setError('')
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `avatars/${userId}-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(publicUrl)

      // Update users table
      await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', userId)
    } catch (err) {
      console.error('Photo upload error:', err)
      setError('Failed to upload photo. Please try again.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}

    if (!fullName.trim()) errs.fullName = 'Full name is required.'

    if (phone.trim()) {
      const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
      if (!phoneRegex.test(phone.trim())) errs.phone = 'Enter a valid phone number.'
    }

    if (bio.length > MAX_BIO_LENGTH) errs.bio = `Bio must be ${MAX_BIO_LENGTH} characters or less.`

    if (linkedin.trim() && !linkedin.trim().startsWith('http')) {
      errs.linkedin = 'Enter a valid URL (start with http).'
    }
    if (github.trim() && !github.trim().startsWith('http')) {
      errs.github = 'Enter a valid URL (start with http).'
    }
    if (twitter.trim() && !twitter.trim().startsWith('http')) {
      errs.twitter = 'Enter a valid URL (start with http).'
    }

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!validate()) return

    setSaving(true)
    try {
      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim() || undefined,
          bio: bio.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
          github: github.trim() || undefined,
          twitter: twitter.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save profile.')
        return
      }

      // Redirect to role-based dashboard
      router.push(getRoleRedirect(userRole))
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-4xl font-extrabold tracking-tight text-indigo-700">INCUBX</span>
          <p className="text-gray-500 text-sm font-medium tracking-wide uppercase mt-1">
            Complete Your Profile
          </p>
        </div>

        <Card className="shadow-md">
          <CardHeader className="pb-2 pt-6 px-6">
            <h1 className="text-xl font-semibold text-gray-900">Set up your profile</h1>
            <p className="text-sm text-gray-500 mt-1">
              Tell the community about yourself. Fields marked * are required.
            </p>
          </CardHeader>

          <CardContent className="px-6 pb-8 pt-4">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Avatar upload */}
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="Profile photo"
                      className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-bold border-2 border-gray-200">
                      {fullName ? getInitials(fullName) : userEmail.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                      <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Profile photo</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto || saving}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto || saving}
                    isLoading={uploadingPhoto}
                  >
                    {uploadingPhoto ? 'Uploading…' : avatarUrl ? 'Change photo' : 'Upload photo'}
                  </Button>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF up to 5 MB</p>
                </div>
              </div>

              <Input
                label="Full name"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                disabled={saving}
                error={fieldErrors.fullName}
              />

              <Input
                label="Phone number"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                disabled={saving}
                error={fieldErrors.phone}
              />

              <div className="flex flex-col gap-1.5">
                <Textarea
                  label="Bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your team about yourself, your background, and what you're working on…"
                  disabled={saving}
                  maxLength={MAX_BIO_LENGTH + 10}
                  rows={3}
                  error={fieldErrors.bio}
                  helperText={`${bio.length} / ${MAX_BIO_LENGTH} characters`}
                />
              </div>

              <Input
                label="LinkedIn URL"
                type="url"
                autoComplete="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
                disabled={saving}
                error={fieldErrors.linkedin}
                leftIcon={
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                }
              />

              <Input
                label="GitHub URL"
                type="url"
                autoComplete="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/yourname"
                disabled={saving}
                error={fieldErrors.github}
                leftIcon={
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                }
              />

              <Input
                label="Twitter / X URL"
                type="url"
                autoComplete="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://twitter.com/yourhandle"
                disabled={saving}
                error={fieldErrors.twitter}
                leftIcon={
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                }
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
                isLoading={saving}
                disabled={saving || uploadingPhoto}
              >
                {saving ? 'Saving…' : 'Save Profile & Continue'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
