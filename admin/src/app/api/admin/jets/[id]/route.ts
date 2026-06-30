import { NextRequest, NextResponse } from 'next/server'
import { requireAdminContext, unauthorizedAdminResponse } from '@/lib/admin-auth-server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdminContext(request))) {
    return unauthorizedAdminResponse()
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('jets')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error fetching jet ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to fetch jet' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdminContext(request))) {
    return unauthorizedAdminResponse()
  }

  try {
    const payload = await request.json()
    const { data, error } = await supabaseAdmin
      .from('jets')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error updating jet ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to update jet' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdminContext(request))) {
    return unauthorizedAdminResponse()
  }

  try {
    const { error } = await supabaseAdmin
      .from('jets')
      .delete()
      .eq('id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting jet ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to delete jet' }, { status: 500 })
  }
}
