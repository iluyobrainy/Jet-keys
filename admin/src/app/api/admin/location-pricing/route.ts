import { NextRequest, NextResponse } from 'next/server'
import { requireAdminContext, unauthorizedAdminResponse } from '@/lib/admin-auth-server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!(await requireAdminContext(request))) {
    return unauthorizedAdminResponse()
  }

  const [statesResult, zonesResult, carsResult, coverageResult, ratesResult] = await Promise.all([
    supabaseAdmin.from('service_states').select('*').order('sort_order', { ascending: true }),
    supabaseAdmin.from('service_zones').select('*, service_areas(*)').order('sort_order', { ascending: true }),
    supabaseAdmin.from('cars').select('id, name, brand, model, price_per_day, status').order('name', { ascending: true }),
    supabaseAdmin.from('car_service_coverage').select('*'),
    supabaseAdmin.from('car_pricing_rates').select('*'),
  ])

  const error = statesResult.error || zonesResult.error || carsResult.error || coverageResult.error || ratesResult.error
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    states: statesResult.data || [],
    zones: zonesResult.data || [],
    cars: carsResult.data || [],
    coverage: coverageResult.data || [],
    rates: ratesResult.data || [],
  })
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdminContext(request))) {
    return unauthorizedAdminResponse()
  }

  const body = await request.json()
  const { action } = body

  if (action === 'update-area') {
    const { id, surchargeAmount, isActive } = body
    const { data, error } = await supabaseAdmin
      .from('service_areas')
      .update({ surcharge_amount: Number(surchargeAmount || 0), is_active: isActive !== false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (action === 'upsert-rate') {
    const { carId, stateId, zoneId, timingPackage, basePrice, isActive } = body
    const { data, error } = await supabaseAdmin
      .from('car_pricing_rates')
      .upsert({
        car_id: carId,
        state_id: stateId,
        zone_id: zoneId || null,
        timing_package: timingPackage,
        base_price: Number(basePrice || 0),
        is_active: isActive !== false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'car_id,state_id,zone_id,timing_package', ignoreDuplicates: false })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (action === 'toggle-coverage') {
    const { carId, stateId, rentalMode, isActive } = body
    const { data, error } = await supabaseAdmin
      .from('car_service_coverage')
      .upsert({
        car_id: carId,
        state_id: stateId,
        rental_mode: rentalMode || 'within_state',
        is_active: isActive !== false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'car_id,state_id,rental_mode', ignoreDuplicates: false })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: 'Unknown location pricing action' }, { status: 400 })
}