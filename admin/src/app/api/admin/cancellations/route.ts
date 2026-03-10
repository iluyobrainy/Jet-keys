import { NextRequest, NextResponse } from "next/server"
import { requireAdminContext, unauthorizedAdminResponse } from "@/lib/admin-auth-server"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

type RawRefundRequest = {
  id: string
  booking_id: string
  user_id: string | null
  request_type: string
  reason: string
  bank_name: string | null
  account_name: string | null
  account_number: string | null
  amount_requested: number | null
  status: string
  admin_notes: string | null
  processed_by_user_id: string | null
  processed_at: string | null
  created_at: string
  updated_at: string
  bookings?: unknown
}

type ProcessedByUser = {
  id: string
  name: string | null
  email: string | null
}

function normalizeBooking(booking: unknown) {
  if (Array.isArray(booking)) {
    return booking[0] ?? null
  }

  return booking ?? null
}

export async function GET(request: NextRequest) {
  if (!(await requireAdminContext(request))) {
    return unauthorizedAdminResponse()
  }

  try {
    const status = request.nextUrl.searchParams.get("status")
    const requestType = request.nextUrl.searchParams.get("requestType")

    let query = supabaseAdmin
      .from("refund_requests")
      .select(`
        *,
        bookings(
          id,
          booking_reference,
          status,
          payment_status,
          customer_name,
          customer_email,
          customer_phone,
          pickup_location,
          dropoff_location,
          pickup_date,
          dropoff_date,
          total_amount,
          refund_amount,
          refund_status,
          cancellation_reason,
          cancellation_date,
          bank_name,
          account_name,
          account_number,
          cars(id, name, brand, model, primary_image_url, location)
        )
      `)
      .order("created_at", { ascending: false })

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    if (requestType && requestType !== "all") {
      query = query.eq("request_type", requestType)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    const processedByIds = Array.from(
      new Set(
        (data || [])
          .map((row) => row.processed_by_user_id)
          .filter((value): value is string => Boolean(value)),
      ),
    )

    let processedByMap = new Map<string, ProcessedByUser>()

    if (processedByIds.length > 0) {
      const { data: processedByUsers, error: processedByError } = await supabaseAdmin
        .from("users")
        .select("id, name, email")
        .in("id", processedByIds)

      if (processedByError) {
        throw processedByError
      }

      processedByMap = new Map((processedByUsers || []).map((user) => [user.id, user]))
    }

    const requests = ((data || []) as RawRefundRequest[]).map((row) => ({
      ...row,
      booking: normalizeBooking(row.bookings),
      processed_by_user: row.processed_by_user_id ? processedByMap.get(row.processed_by_user_id) || null : null,
    }))

    const stats = requests.reduce(
      (summary, row) => {
        if (row.status === "pending") {
          summary.pendingRequests += 1
        }

        if (row.status === "approved") {
          summary.approvedRequests += 1
        }

        if (row.status === "processed") {
          summary.processedRequests += 1
        }

        if (row.status === "rejected") {
          summary.rejectedRequests += 1
        }

        summary.totalRequestedAmount += Number(row.amount_requested || 0)
        return summary
      },
      {
        pendingRequests: 0,
        approvedRequests: 0,
        processedRequests: 0,
        rejectedRequests: 0,
        totalRequestedAmount: 0,
      },
    )

    return NextResponse.json({ requests, stats })
  } catch (error) {
    console.error("Error fetching cancellations:", error)
    return NextResponse.json({ error: "Failed to fetch cancellations" }, { status: 500 })
  }
}
