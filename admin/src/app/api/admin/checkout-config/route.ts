import { NextRequest, NextResponse } from 'next/server'
import { requireAdminContext, unauthorizedAdminResponse } from '@/lib/admin-auth-server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const defaultCheckoutConfig = {
  vat_rate: 7.5,
  service_fee_rate: 2.5,
  insurance_fee: 5000,
  delivery_fee: 10000,
  late_return_fee: 25000,
  cancellation_fee_rate: 10,
  minimum_rental_hours: 4,
  maximum_rental_days: 30,
  advance_booking_days: 7,
  payment_methods: ['card', 'bank_transfer', 'cash'],
  currency: 'NGN',
  terms_and_conditions: '',
  privacy_policy: '',
  refund_policy: '',
  contact_email: '',
  contact_phone: '',
  business_address: '',
}

export async function GET(request: NextRequest) {
  if (!(await requireAdminContext(request))) {
    return unauthorizedAdminResponse()
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('checkout_settings')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json(data || defaultCheckoutConfig)
  } catch (error) {
    console.error('Error fetching checkout config:', error)
    return NextResponse.json(defaultCheckoutConfig)
  }
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdminContext(request))) {
    return unauthorizedAdminResponse()
  }

  try {
    const payload = await request.json()
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('checkout_settings')
      .select('id')
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      throw existingError
    }

    if (existing?.id) {
      const { data, error } = await supabaseAdmin
        .from('checkout_settings')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select('*')
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json(data)
    }

    const { data, error } = await supabaseAdmin
      .from('checkout_settings')
      .insert({
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error updating checkout config:', error)
    return NextResponse.json({ error: 'Failed to update checkout config' }, { status: 500 })
  }
}
