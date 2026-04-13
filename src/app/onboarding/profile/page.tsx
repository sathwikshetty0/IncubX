'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getRoleRedirect } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { User, Phone, Linkedin, Github, Twitter, Camera, ArrowRight, AlertCircle } from 'lucide-react'
import { getInitials, cn } from '@/lib/utils'

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
    <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center p-4 py-16 animate-fade-in">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-[0.2em]">Phase 2: Digital Identity</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter text-gray-900 mb-4">
            Complete Your Profile
          </h1>
          <p className="text-gray-500 font-light max-w-md mx-auto leading-relaxed">
            Your digital identity is how mentors and peers will interact with you. Make it count.
          </p>
        </div>

        <Card className="shadow-premium border-none bg-white/80 backdrop-blur-xl overflow-hidden">
          <CardHeader className="pb-4 pt-10 px-8 flex flex-col items-center">
             <div className="relative h-24 w-24 mb-6">
                <div className={cn(
                  "h-24 w-24 rounded-3xl shrink-0 overflow-hidden ring-4 ring-indigo-50 border-2 border-white shadow-premium transition-all duration-300",
                  uploadingPhoto ? "opacity-50 scale-95" : "opacity-100 scale-100"
                )}>
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="Profile photo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-3xl font-black">
                      {fullName ? getInitials(fullName) : userEmail.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/40">
                      <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-white shadow-lg border border-gray-100 flex items-center justify-center text-indigo-600 hover:text-indigo-700 hover:scale-110 active:scale-90 transition-all"
                  disabled={uploadingPhoto || saving}
                >
                  <Camera className="h-5 w-5" />
                </button>
             </div>
             <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto || saving}
              />
              <h2 className="text-xl font-bold text-gray-900">Personalize your profile</h2>
              <p className="text-sm text-gray-500 font-light mt-1 text-center">
                Fields marked <span className="text-red-500">*</span> are essential for verification.
              </p>
          </CardHeader>

          <CardContent className="px-6 pb-8 pt-4">
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  leftIcon={<User className="h-4 w-4" />}
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
                  leftIcon={<Phone className="h-4 w-4" />}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Textarea
                  label="Professional Bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your team about yourself, your background, and what you're working on…"
                  disabled={saving}
                  maxLength={MAX_BIO_LENGTH + 10}
                  rows={4}
                  error={fieldErrors.bio}
                  helperText={`${bio.length} / ${MAX_BIO_LENGTH} characters`}
                />
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Professional Presence</h3>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="LinkedIn URL"
                    type="url"
                    autoComplete="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/yourname"
                    disabled={saving}
                    error={fieldErrors.linkedin}
                    leftIcon={<Linkedin className="h-4 w-4" />}
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
                    leftIcon={<Github className="h-4 w-4" />}
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
                    leftIcon={<Twitter className="h-4 w-4" />}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 flex items-start gap-3 animate-slide-up">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-800 leading-tight">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg font-bold shadow-xl shadow-indigo-200/50 group mt-4"
                isLoading={saving}
                disabled={saving || uploadingPhoto}
              >
                {saving ? 'Saving Identity…' : (
                  <>
                    Complete & Enter Ecosystem <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
