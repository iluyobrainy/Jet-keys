"use client"

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { useAdminAuth } from '@/lib/admin-auth-client'

const publicPaths = new Set(['/login', '/reset-password'])

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { loading, isAuthenticated, isAdmin, signOut } = useAdminAuth()
  const isPublicPath = publicPaths.has(pathname || '')

  useEffect(() => {
    if (loading) {
      return
    }

    if (!isPublicPath && (!isAuthenticated || !isAdmin)) {
      const nextPath = `${pathname || '/'}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`)
      return
    }

    if (isPublicPath && isAuthenticated && isAdmin) {
      const nextPath = searchParams?.get('next') || '/'
      router.replace(nextPath)
      return
    }

    if (isPublicPath && isAuthenticated && !isAdmin) {
      void signOut()
    }
  }, [isAdmin, isAuthenticated, isPublicPath, loading, pathname, router, searchParams, signOut])

  if (isPublicPath) {
    return <>{children}</>
  }

  if (loading || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-300" />
          <p className="text-sm text-white/70">Checking admin session...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
