"use client"

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type AdminProfile = {
  id: string
  auth_user_id?: string | null
  email: string
  name: string
  phone?: string | null
  role?: string | null
  is_active?: boolean | null
}

type AdminAuthContextValue = {
  loading: boolean
  session: Session | null
  user: User | null
  profile: AdminProfile | null
  isAuthenticated: boolean
  isAdmin: boolean
  refreshProfile: () => Promise<AdminProfile | null>
  signOut: () => Promise<void>
}

const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000
const SESSION_STARTED_AT_STORAGE_KEY = 'jetandkeys-admin-session-started-at'

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined)

function inferAdmin(user: User | null, profile: AdminProfile | null) {
  const profileRole = String(profile?.role || '').toLowerCase()
  const email = String(user?.email || '').toLowerCase()
  return profileRole === 'admin' || profileRole === 'staff' || email === 'admin@jetandkeys.com'
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

async function fetchProfile(accessToken: string) {
  const response = await fetch('/api/auth/profile', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error((await response.json())?.error || 'Admin authentication required')
  }

  const payload = await response.json()
  return (payload?.profile as AdminProfile | null) ?? null
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<AdminProfile | null>(null)

  const signOutAndClear = async () => {
    clearStoredSessionStart()
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    const {
      data: { session: activeSession },
    } = await supabase.auth.getSession()

    if (!activeSession?.access_token) {
      setProfile(null)
      return null
    }

    const nextProfile = await fetchProfile(activeSession.access_token)
    setProfile(nextProfile)
    return nextProfile
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
        } else {
          setSession(currentSession)
          try {
            await refreshProfile()
          } catch (_error) {
            await signOutAndClear()
          }
        }
      } else {
        setSession(null)
        setProfile(null)
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

        if (!nextSession?.user) {
          clearStoredSessionStart()
          setSession(null)
          setProfile(null)
          setLoading(false)
          return
        }

        if (sessionExpired(nextSession)) {
          await signOutAndClear()
          setLoading(false)
          return
        }

        setSession(nextSession)

        try {
          const nextProfile = await fetchProfile(nextSession.access_token)
          setProfile(nextProfile)
        } catch (_error) {
          await signOutAndClear()
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
    user: session?.user ?? null,
    profile,
    isAuthenticated: Boolean(session?.user),
    isAdmin: inferAdmin(session?.user ?? null, profile),
    refreshProfile,
    signOut: signOutAndClear,
  }), [loading, profile, session])

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const value = useContext(AdminAuthContext)

  if (!value) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }

  return value
}
