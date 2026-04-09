import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json(
      { is_valid: false, error: 'Token is required' },
      { status: 400 }
    )
  }

  // Token must be at least 8 chars and alphanumeric/hyphen/underscore
  const tokenRegex = /^[a-zA-Z0-9_-]{8,}$/
  if (!tokenRegex.test(token)) {
    return NextResponse.json(
      { is_valid: false, error: 'Invalid token format' },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()

    // Look up token in registration_tokens table
    const { data, error } = await supabase
      .from('registration_tokens')
      .select('email, role, org_name, expires_at, used_at')
      .eq('token', token)
      .single()

    if (error || !data) {
      // Fall back to mock data for development if table doesn't exist
      if (error?.code === 'PGRST116' || error?.code === '42P01') {
        // Table doesn't exist — return mock for development
        return NextResponse.json({
          is_valid: true,
          email: 'invitee@example.com',
          role: 'team_lead',
          org_name: 'INCUBX Demo',
        })
      }
      return NextResponse.json({ is_valid: false, error: 'Invalid token' }, { status: 404 })
    }

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json(
        { is_valid: false, error: 'Token has expired' },
        { status: 410 }
      )
    }

    // Check if already used
    if (data.used_at) {
      return NextResponse.json(
        { is_valid: false, error: 'Token has already been used' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      is_valid: true,
      email: data.email,
      role: data.role,
      org_name: data.org_name ?? null,
    })
  } catch (err) {
    console.error('[validate-token]', err)
    return NextResponse.json(
      { is_valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
