import { randomUUID } from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"
import { getAuthContext, requireRole } from "@/lib/auth-server"
import { env } from "@/lib/env"
import { getAdminSupabaseClient } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  const context = await getAuthContext(request, { requireAdmin: true })

  if (!requireRole(context, ["admin", "staff"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const files = formData.getAll("files").filter((value): value is File => value instanceof File)

  if (!files.length) {
    return NextResponse.json({ error: "No files selected" }, { status: 400 })
  }

  const adminSupabase = getAdminSupabaseClient()
  const uploadedImages: string[] = []

  for (const file of files) {
    const extension = file.name.split(".").pop() || "jpg"
    const filePath = `cars/${Date.now()}-${randomUUID()}.${extension}`
    const arrayBuffer = await file.arrayBuffer()
    const uploadResult = await adminSupabase.storage
      .from(env.carImagesBucket)
      .upload(filePath, Buffer.from(arrayBuffer), {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      })

    if (uploadResult.error) {
      return NextResponse.json({ error: uploadResult.error.message }, { status: 500 })
    }

    const { data } = adminSupabase.storage.from(env.carImagesBucket).getPublicUrl(filePath)
    uploadedImages.push(data.publicUrl)
  }

  return NextResponse.json({ images: uploadedImages })
}
