import { NextResponse } from "next/server"
import { SIMPLE_ADMIN_COOKIE } from "@/lib/simple-admin-auth"

export async function POST() {
  const response = NextResponse.json({ ok: true })

  response.cookies.set({
    name: SIMPLE_ADMIN_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })

  return response
}
