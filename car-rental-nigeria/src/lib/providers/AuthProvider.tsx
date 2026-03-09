"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { apiFetch } from "@/lib/api-client"
import { getBrowserSupabaseClient } from "@/lib/supabase"
import type { Database, UserRole } from "@/lib/database.types"

type UserProfile = Database["public"]["Tables"]["users"]["Row"]

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

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()

      if (!mounted) {
        return
      }

      setSession(currentSession)

      if (currentSession?.user) {
        await refreshProfile()
      } else {
        setProfile(null)
      }

      if (mounted) {
        setLoading(false)
      }
    }

    void initialize()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)

      if (nextSession?.user) {
        void refreshProfile()
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

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
        await supabase.auth.signOut()
      },
      refreshProfile,
    }
  }, [loading, profile, session, supabase])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)

  if (!value) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return value
}
