import { NextRequest, NextResponse } from 'next/server'
import { requireAdminContext, unauthorizedAdminResponse } from '@/lib/admin-auth-server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const allowedStatuses = new Set(['new', 'contacted', 'quoted', 'confirmed', 'closed'])

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdminContext(request))) {
    return unauthorizedAdminResponse()
  }

  try {
    const payload = await request.json()
    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (payload.status !== undefined) {
      if (!allowedStatuses.has(String(payload.status))) {
        return NextResponse.json({ error: 'Invalid jet request status' }, { status: 400 })
      }
      update.status = payload.status
    }

    if (payload.admin_notes !== undefined) {
      update.admin_notes = String(payload.admin_notes || '').trim() || null
    }

    const { data, error } = await supabaseAdmin
      .from('jet_requests')
      .update(update)
      .eq('id', params.id)
      .select('*, jets(name, manufacturer, model, images)')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error updating jet request ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to update jet request' }, { status: 500 })
  }
}

