import { env, requireServerEnv } from "@/lib/env"

interface PaystackInitializePayload {
  email: string
  amount: number
  reference: string
  callback_url: string
  metadata?: Record<string, unknown>
}

async function paystackFetch<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${env.paystackBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${requireServerEnv("paystackSecretKey")}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  })

  const payload = await response.json()

  if (!response.ok || !payload.status) {
    throw new Error(payload.message || "Paystack request failed")
  }

  return payload.data as T
}

export async function initializePaystackTransaction(payload: PaystackInitializePayload) {
  return paystackFetch<{
    authorization_url: string
    access_code: string
    reference: string
  }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function verifyPaystackTransaction(reference: string) {
  return paystackFetch<{
    reference: string
    amount: number
    status: string
    gateway_response: string
    paid_at: string | null
    channel: string | null
    customer: {
      email: string
    }
    metadata: Record<string, unknown> | null
  }>(`/transaction/verify/${reference}`)
}
