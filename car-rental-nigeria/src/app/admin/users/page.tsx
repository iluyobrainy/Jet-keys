"use client"

import { Loader2, Mail, Phone, Shield, UserRound } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdminUsers } from "@/lib/hooks/useApi"
import { useRealtimeInvalidation } from "@/lib/hooks/useRealtimeInvalidation"

export default function AdminUsersPage() {
  const { data: users = [], isLoading, error } = useAdminUsers()

  useRealtimeInvalidation("admin-users-live", ["users", "bookings"], [["adminUsers"]])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Users</h1>
          <p className="text-sm text-slate-600">Authenticated customer profiles synced from Supabase Auth.</p>
        </div>

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-[28px] border border-slate-200 bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
          </div>
        ) : null}

        {error ? (
          <Card className="rounded-[28px] border-red-200 bg-red-50">
            <CardContent className="p-6 text-sm text-red-700">{error instanceof Error ? error.message : "Unable to load users."}</CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">
          {users.map((user) => (
            <Card key={String(user.id)} className="rounded-[28px] border-slate-200">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{String(user.name || "Unnamed user")}</CardTitle>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      <span>{String(user.role || "customer")}</span>
                      <span>{user.is_active === false ? "inactive" : "active"}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <div className="grid gap-2">
                  <p className="inline-flex items-center gap-2"><Mail className="h-4 w-4" />{String(user.email || "")}</p>
                  <p className="inline-flex items-center gap-2"><Phone className="h-4 w-4" />{String(user.phone || "No phone supplied")}</p>
                  <p className="inline-flex items-center gap-2"><Shield className="h-4 w-4" />Booking count: {String(user.bookingCount || 0)}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[18px] bg-slate-50 px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Bookings</p>
                    <p className="mt-1 font-semibold text-slate-950">{String(user.bookingCount || 0)}</p>
                  </div>
                  <div className="rounded-[18px] bg-slate-50 px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Active</p>
                    <p className="mt-1 font-semibold text-slate-950">{String(user.activeBookings || 0)}</p>
                  </div>
                  <div className="rounded-[18px] bg-slate-50 px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Paid</p>
                    <p className="mt-1 font-semibold text-slate-950">{String(user.paidBookings || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}

