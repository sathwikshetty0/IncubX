import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface CompleteProfileBody {
  full_name: string
  phone?: string
  bio?: string
  linkedin?: string
  github?: string
  twitter?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CompleteProfileBody = await request.json()
    const { full_name, phone, bio, linkedin, github, twitter } = body

    if (!full_name?.trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
    }

    if (bio && bio.length > 200) {
      return NextResponse.json({ error: 'Bio must be 200 characters or less' }, { status: 400 })
    }

    const updatePayload: Record<string, unknown> = {
      full_name: full_name.trim(),
      profile_completed: true,
      updated_at: new Date().toISOString(),
    }

    if (phone !== undefined) updatePayload.phone = phone.trim() || null
    if (bio !== undefined) updatePayload.bio = bio.trim() || null
    if (linkedin !== undefined) updatePayload.linkedin_url = linkedin.trim() || null
    if (github !== undefined) updatePayload.github_url = github.trim() || null
    if (twitter !== undefined) updatePayload.twitter_url = twitter.trim() || null

    const { error: updateError } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', user.id)

    if (updateError) {
      console.error('[complete-profile] update error:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // Also update auth metadata
    await supabase.auth.updateUser({
      data: { full_name: full_name.trim() },
    })

    return NextResponse.json({ success: true, message: 'Profile updated successfully' })
  } catch (err) {
    console.error('[complete-profile]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
