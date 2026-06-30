import { NextRequest, NextResponse } from 'next/server'
import { requireAdminContext, unauthorizedAdminResponse } from '@/lib/admin-auth-server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const quoteSelect = `
  *,
  cars(id, name, brand, model),
  service_states!quote_requests_service_state_id_fkey(id, name, code),
  origin_state:service_states!quote_requests_origin_state_id_fkey(id, name, code),
  destination_state:service_states!quote_requests_destination_state_id_fkey(id, name, code)
`

export async function GET(request: NextRequest) {
  if (!(await requireAdminContext(request))) {
    return unauthorizedAdminResponse()
  }

  const status = request.nextUrl.searchParams.get('status')
  let query = supabaseAdmin.from('quote_requests').select(quoteSelect).order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data || [])
}

export async function PATCH(request: NextRequest) {
  const context = await requireAdminContext(request)
  if (!context) {
    return unauthorizedAdminResponse()
  }

  const { id, status, quotedAmount, adminNotes } = await request.json()
  const { data, error } = await supabaseAdmin
    .from('quote_requests')
    .update({
      status,
      quoted_amount: quotedAmount === '' || quotedAmount === undefined ? null : Number(quotedAmount),
      admin_notes: adminNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(quoteSelect)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}