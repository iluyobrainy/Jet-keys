import { NextResponse, type NextRequest } from "next/server"
import { getAuthContext, requireRole } from "@/lib/auth-server"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"

const bookingSelect = `
  *,
  cars(id, name, brand, model, images, primary_image_url, location)
`

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const context = await getAuthContext(request)

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const adminSupabase = getAdminSupabaseClient()
  const { data: booking, error } = await adminSupabase
    .from("bookings")
    .select(bookingSelect)
    .eq("id", id)
    .single()

  if (error || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  const canAccess =
    requireRole(context, ["admin", "staff"]) ||
    (context.profile?.id && booking.user_id === context.profile.id)

  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json({ booking })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const context = await getAuthContext(request)

  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const adminSupabase = getAdminSupabaseClient()
  const body = await request.json()
  const { action, ...updates } = body
  const { data: booking } = await adminSupabase.from("bookings").select("*").eq("id", id).single()

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  const isAdmin = requireRole(context, ["admin", "staff"])
  const isOwner = Boolean(context.profile?.id && booking.user_id === context.profile.id)

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const patch: Record<string, unknown> = {
    ...updates,
    updated_at: new Date().toISOString(),
  }

  if (action) {
    if (!isAdmin) {
      return NextResponse.json({ error: "Only admins can perform booking actions" }, { status: 403 })
    }

    if (action === "start_rental") {
      if (!["approved", "paid_awaiting_fulfilment"].includes(booking.status)) {
        return NextResponse.json({ error: "This booking cannot be started again" }, { status: 400 })
      }
      patch.status = "active"
      patch.rental_started_at = new Date().toISOString()
    }

    if (action === "mark_returned") {
      if (booking.status !== "active") {
        return NextResponse.json({ error: "Only active rentals can be marked as returned" }, { status: 400 })
      }
      patch.status = "returned"
      patch.rental_returned_at = new Date().toISOString()
    }

    if (action === "complete_booking") {
      if (booking.status !== "returned") {
        return NextResponse.json({ error: "Only returned rentals can be completed" }, { status: 400 })
      }
      patch.status = "completed"
      patch.completed_at = new Date().toISOString()
    }
  }

  const { data: updatedBooking, error } = await adminSupabase
    .from("bookings")
    .update(patch)
    .eq("id", id)
    .select(bookingSelect)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ booking: updatedBooking })
}
