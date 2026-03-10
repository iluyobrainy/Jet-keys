import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const carId = request.nextUrl.searchParams.get('carId')
    const status = request.nextUrl.searchParams.get('status')

    let query = supabaseAdmin
      .from('reviews')
      .select('id, car_id, booking_id, user_id, rating, title, content, status, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (carId && carId !== 'all') {
      query = query.eq('car_id', carId)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: reviews, error } = await query

    if (error) {
      throw error
    }

    const carIds = Array.from(new Set((reviews || []).map((review) => review.car_id).filter(Boolean)))
    const bookingIds = Array.from(new Set((reviews || []).map((review) => review.booking_id).filter(Boolean)))
    const userIds = Array.from(new Set((reviews || []).map((review) => review.user_id).filter(Boolean)))

    const [carsResult, bookingsResult, usersResult, allCarsResult] = await Promise.all([
      carIds.length > 0
        ? supabaseAdmin.from('cars').select('id, name, brand, model').in('id', carIds)
        : Promise.resolve({ data: [], error: null }),
      bookingIds.length > 0
        ? supabaseAdmin.from('bookings').select('id, booking_reference').in('id', bookingIds)
        : Promise.resolve({ data: [], error: null }),
      userIds.length > 0
        ? supabaseAdmin.from('users').select('id, name, email').in('id', userIds)
        : Promise.resolve({ data: [], error: null }),
      supabaseAdmin.from('cars').select('id, name, brand, model').order('created_at', { ascending: false }),
    ])

    const carsById = new Map((carsResult.data || []).map((car) => [car.id, car]))
    const bookingsById = new Map((bookingsResult.data || []).map((booking) => [booking.id, booking]))
    const usersById = new Map((usersResult.data || []).map((user) => [user.id, user]))

    return NextResponse.json({
      cars: allCarsResult.data || [],
      reviews: (reviews || []).map((review) => ({
        ...review,
        car: carsById.get(review.car_id) || null,
        booking: bookingsById.get(review.booking_id) || null,
        user: usersById.get(review.user_id) || null,
      })),
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
