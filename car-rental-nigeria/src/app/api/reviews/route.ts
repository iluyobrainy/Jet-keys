import { NextResponse, type NextRequest } from "next/server"
import { getAuthContext } from "@/lib/auth-server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  const carId = request.nextUrl.searchParams.get("carId")
  const adminMode = request.nextUrl.searchParams.get("admin") === "true"
  const supabase = createServerSupabaseClient()
  let query = supabase
    .from("reviews")
    .select(`
      *,
      bookings(booking_reference, customer_name),
      cars(name, brand, model)
    `)
    .order("created_at", { ascending: false })

  if (carId) {
    query = query.eq("car_id", carId)
  }

  if (!adminMode) {
    query = query.eq("status", "published")
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ reviews: data || [] })
}

export async function POST(request: NextRequest) {
  const context = await getAuthContext(request)

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const adminSupabase = getAdminSupabaseClient()
  const body = await request.json()
  const { carId, bookingId, rating, title, content } = body

  if (!carId || !bookingId || !rating || !content) {
    return NextResponse.json({ error: "Missing review details" }, { status: 400 })
  }

  const { data: booking } = await adminSupabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("user_id", context.profile?.id || "")
    .maybeSingle()

  if (!booking || booking.status !== "completed") {
    return NextResponse.json(
      { error: "Only completed bookings can leave reviews for this car" },
      { status: 400 },
    )
  }

  const { data: review, error } = await adminSupabase
    .from("reviews")
    .insert({
      car_id: carId,
      booking_id: bookingId,
      user_id: context.profile?.id || context.user.id,
      rating: Number(rating),
      title: title || null,
      content,
      status: "published",
    })
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ review })
}
