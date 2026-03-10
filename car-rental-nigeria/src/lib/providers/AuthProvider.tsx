"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js"
import { apiFetch } from "@/lib/api-client"
import { getBrowserSupabaseClient } from "@/lib/supabase"
import type { Database, UserRole } from "@/lib/database.types"

type UserProfile = Database["public"]["Tables"]["users"]["Row"]

const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000
const SESSION_STARTED_AT_STORAGE_KEY = "jetandkeys-session-started-at"

interface AuthContextValue {
  loading: boolean
  session: Session | null
  user: User | null
  profile: UserProfile | null
  role: UserRole
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function getFallbackSessionStart(session: Session | null) {
  const fallbackSource = session?.user.last_sign_in_at

  if (!fallbackSource) {
    return Date.now()
  }

  const timestamp = new Date(fallbackSource).getTime()
  return Number.isNaN(timestamp) ? Date.now() : timestamp
}

function readStoredSessionStart(session: Session | null) {
  if (typeof window === "undefined") {
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
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(SESSION_STARTED_AT_STORAGE_KEY, String(timestamp))
}

function clearStoredSessionStart() {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(SESSION_STARTED_AT_STORAGE_KEY)
}

function inferRole(profile: UserProfile | null, user: User | null): UserRole {
  if (profile?.role) {
    return profile.role
  }

  if (user?.email?.toLowerCase() === "admin@jetandkeys.com") {
    return "admin"
  }

  return "customer"
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getBrowserSupabaseClient()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)

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

    if (!activeSession?.user) {
      setProfile(null)
      return
    }

    try {
      const response = await apiFetch<{ profile: UserProfile }>("/api/auth/profile", {
        method: "POST",
      })
      setProfile(response.profile)
    } catch (_error) {
      setProfile(null)
    }
  }

  const sessionExpired = (activeSession: Session | null) => {
    if (!activeSession?.user) {
      return false
    }

    const startedAt = readStoredSessionStart(activeSession)
    return Date.now() - startedAt >= SESSION_MAX_AGE_MS
  }

  const syncSession = async (activeSession: Session | null, event?: AuthChangeEvent) => {
    if (!activeSession?.user) {
      clearStoredSessionStart()
      setSession(null)
      setProfile(null)
      return
    }

    if (event === "SIGNED_IN" || event === "PASSWORD_RECOVERY" || event === "USER_UPDATED") {
      setStoredSessionStart(getFallbackSessionStart(activeSession))
    } else {
      readStoredSessionStart(activeSession)
    }

    if (sessionExpired(activeSession)) {
      await signOutAndClear()
      return
    }

    setSession(activeSession)
    await refreshProfile()
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

      await syncSession(currentSession)

      if (mounted) {
        setLoading(false)
      }
    }

    void initialize()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      void (async () => {
        await syncSession(nextSession, event)
        setLoading(false)
      })()
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

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

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null
    const role = inferRole(profile, user)

    return {
      loading,
      session,
      user,
      profile,
      role,
      isAuthenticated: Boolean(user),
      signOut: async () => {
        await signOutAndClear()
      },
      refreshProfile,
    }
  }, [loading, profile, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)

  if (!value) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return value
}
