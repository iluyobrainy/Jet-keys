import { NextResponse, type NextRequest } from "next/server"
import { getAuthContext, requireRole } from "@/lib/auth-server"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const context = await getAuthContext(request, { requireAdmin: true })

  if (!requireRole(context, ["admin", "staff"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { status } = await request.json()
  const adminSupabase = getAdminSupabaseClient()
  const { data: review, error } = await adminSupabase
    .from("reviews")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ review })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const context = await getAuthContext(request, { requireAdmin: true })

  if (!requireRole(context, ["admin", "staff"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const adminSupabase = getAdminSupabaseClient()
  const { error } = await adminSupabase.from("reviews").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
