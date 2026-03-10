import { supabase } from '@/lib/supabase'

export async function adminApiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  const isFormData = init?.body instanceof FormData

  if (!isFormData && !headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.access_token) {
    headers.set('authorization', `Bearer ${session.access_token}`)
  }

  const response = await fetch(input, {
    ...init,
    headers,
  })

  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload?.error || 'Request failed')
  }

  return payload as T
}
