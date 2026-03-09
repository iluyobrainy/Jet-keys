"use client"

import { getBrowserSupabaseClient } from "@/lib/supabase"

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

export async function apiFetch<T>(
  input: string,
  init?: RequestInit & {
    skipAuth?: boolean
  },
): Promise<T> {
  const headers = new Headers(init?.headers)
  const isFormData = init?.body instanceof FormData

  if (!isFormData && !headers.has("content-type")) {
    headers.set("content-type", "application/json")
  }

  if (!init?.skipAuth) {
    const supabase = getBrowserSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.access_token) {
      headers.set("authorization", `Bearer ${session.access_token}`)
    }
  }

  const response = await fetch(input, {
    ...init,
    headers,
  })

  const contentType = response.headers.get("content-type") || ""
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Request failed"

    throw new ApiError(message, response.status, payload)
  }

  return payload as T
}
