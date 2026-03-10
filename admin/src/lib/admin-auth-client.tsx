"use client"

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type AdminUser = {
  id: string
  email?: string | null
}

type AdminProfile = {
  id: string
  auth_user_id?: string | null
  email: string
  name: string
  phone?: string | null
  role?: string | null
  is_active?: boolean | null
}

type ProfilePayload = {
  profile: AdminProfile | null
  role?: string | null
  provider?: 'supabase' | 'simple'
  user?: AdminUser | null
}

type AdminAuthContextValue = {
  loading: boolean
  session: Session | null
  user: AdminUser | null
  profile: AdminProfile | null
  isAuthenticated: boolean
  isAdmin: boolean
  refreshProfile: () => Promise<AdminProfile | null>
  signOut: () => Promise<void>
}

const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000
const SESSION_STARTED_AT_STORAGE_KEY = 'jetandkeys-admin-session-started-at'

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined)

function inferAdmin(user: AdminUser | null, profile: AdminProfile | null) {
  const profileRole = String(profile?.role || '').toLowerCase()
  const email = String(user?.email || '').toLowerCase()
  return profileRole === 'admin' || profileRole === 'staff' || email === 'admin@com'
}

function getFallbackSessionStart(session: Session | null) {
  const fallbackSource = session?.user.last_sign_in_at

  if (!fallbackSource) {
    return Date.now()
  }

  const timestamp = new Date(fallbackSource).getTime()
  return Number.isNaN(timestamp) ? Date.now() : timestamp
}

function readStoredSessionStart(session: Session | null) {
  if (typeof window === 'undefined') {
    return getFallbackSessionStart(session)
  }

  const storedValue = window.localStorage.getItem(SESSION_STARTED_AT_STORAGE_KEY)
  const parsedValue = storedValue ? Number(storedValue) : 0

  if (parsedValue && !Number.isNaN(parsedValue)) {
    return parsedValue
  }

  const fallbackValue = getFallbackSessionStart(session)
  window.localStorage.setItem(SESSION_STARTED_AT_STORAGE_KEY, String(fallbackValue))
  return fallbackValue
}

function setStoredSessionStart(timestamp: number) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(SESSION_STARTED_AT_STORAGE_KEY, String(timestamp))
}

function clearStoredSessionStart() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(SESSION_STARTED_AT_STORAGE_KEY)
}

async function fetchProfile(accessToken?: string) {
  const headers = new Headers()

  if (accessToken) {
    headers.set('authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch('/api/auth/profile', {
    method: 'GET',
    headers,
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error((await response.json())?.error || 'Admin authentication required')
  }

  return (await response.json()) as ProfilePayload
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [profile, setProfile] = useState<AdminProfile | null>(null)

  const applyPayload = (payload: ProfilePayload | null, activeSession: Session | null) => {
    setSession(payload?.provider === 'supabase' ? activeSession : null)
    setProfile(payload?.profile ?? null)
    setUser(
      payload?.user ??
        (activeSession?.user
          ? {
              id: activeSession.user.id,
              email: activeSession.user.email ?? null,
            }
          : payload?.profile
            ? {
                id: payload.profile.auth_user_id || payload.profile.id,
                email: payload.profile.email,
              }
            : null),
    )
  }

  const signOutAndClear = async () => {
    clearStoredSessionStart()
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null)
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    const {
      data: { session: activeSession },
    } = await supabase.auth.getSession()

    try {
      const payload = await fetchProfile(activeSession?.access_token)
      applyPayload(payload, activeSession ?? null)
      return payload.profile ?? null
    } catch (_error) {
      if (activeSession?.access_token) {
        setSession(activeSession)
      } else {
        setSession(null)
      }
      setUser(null)
      setProfile(null)
      return null
    }
  }

  const sessionExpired = (activeSession: Session | null) => {
    if (!activeSession?.user) {
      return false
    }

    const startedAt = readStoredSessionStart(activeSession)
    return Date.now() - startedAt >= SESSION_MAX_AGE_MS
  }

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()

      if (!mounted) {
        return
      }

      if (currentSession?.user) {
        readStoredSessionStart(currentSession)

        if (sessionExpired(currentSession)) {
          await signOutAndClear()
          if (mounted) {
            setLoading(false)
          }
          return
        }
      }

      try {
        const payload = await fetchProfile(currentSession?.access_token)
        if (!mounted) {
          return
        }
        applyPayload(payload, currentSession ?? null)
      } catch (_error) {
        if (currentSession?.user) {
          await supabase.auth.signOut()
        }
        if (!mounted) {
          return
        }
        applyPayload(null, null)
      }

      if (mounted) {
        setLoading(false)
      }
    }

    void initialize()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      void (async () => {
        if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY' || event === 'USER_UPDATED') {
          setStoredSessionStart(getFallbackSessionStart(nextSession))
        }

        if (nextSession?.user && sessionExpired(nextSession)) {
          await signOutAndClear()
          setLoading(false)
          return
        }

        try {
          const payload = await fetchProfile(nextSession?.access_token)
          applyPayload(payload, nextSession ?? null)
        } catch (_error) {
          if (!nextSession?.user) {
            applyPayload(null, null)
          }
        }

        setLoading(false)
      })()
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session?.user) {
      return
    }

    const interval = window.setInterval(() => {
      if (sessionExpired(session)) {
        void signOutAndClear()
      }
    }, 60 * 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [session])

  const value = useMemo<AdminAuthContextValue>(() => ({
    loading,
    session,
    user,
    profile,
    isAuthenticated: Boolean(profile || user),
    isAdmin: inferAdmin(user, profile),
    refreshProfile,
    signOut: signOutAndClear,
  }), [loading, profile, session, user])

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const value = useContext(AdminAuthContext)

  if (!value) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }

  return value
}
