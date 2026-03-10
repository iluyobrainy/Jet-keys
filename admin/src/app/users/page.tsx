"use client"

import { useEffect, useMemo, useState } from "react"
import { Calendar, Mail, Phone, Search, ShieldCheck, UserCheck, Users } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { adminApiFetch } from "@/lib/admin-api-client"

type AdminUser = {
  id: string
  email: string
  name: string
  phone?: string | null
  role: "customer" | "admin" | "staff"
  is_active: boolean
  created_at: string
  updated_at: string
  booking_count: number
  paid_booking_count: number
  total_spend: number
  last_booking_at?: string | null
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString?: string | null) {
  if (!dateString) {
    return "No activity yet"
  }

  return new Date(dateString).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<"all" | "customer" | "admin" | "staff">("all")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminApiFetch<AdminUser[]>("/api/admin/users")
        setUsers(data)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load users")
      } finally {
        setLoading(false)
      }
    }

    void fetchUsers()
  }, [])

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesSearch = [user.name, user.email, user.phone || ""]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())

        const matchesRole = filterRole === "all" || user.role === filterRole
        return matchesSearch && matchesRole
      }),
    [filterRole, searchTerm, users],
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center text-gray-600">Loading users...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Live customer accounts synced from the website booking flow.</p>
        </div>

        {error ? (
          <Card className="rounded-3xl border-red-200 bg-red-50">
            <CardContent className="p-6 text-sm text-red-700">{error}</CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="rounded-3xl">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </CardContent>
          </Card>
          <Card className="rounded-3xl">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-gray-500">Customers</p>
                <p className="text-3xl font-bold text-gray-900">{users.filter((user) => user.role === "customer").length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-emerald-600" />
            </CardContent>
          </Card>
          <Card className="rounded-3xl">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-gray-500">Staff + Admin</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.filter((user) => user.role === "staff" || user.role === "admin").length}
                </p>
              </div>
              <ShieldCheck className="h-8 w-8 text-purple-600" />
            </CardContent>
          </Card>
          <Card className="rounded-3xl">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-gray-500">Customer Spend</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(users.reduce((sum, user) => sum + Number(user.total_spend || 0), 0))}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name, email, or phone"
                  className="pl-10"
                />
              </div>
              <select
                value={filterRole}
                onChange={(event) => setFilterRole(event.target.value as "all" | "customer" | "admin" | "staff")}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">All roles</option>
                <option value="customer">Customers</option>
                <option value="staff">Staff</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>User List</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-gray-500">No users matched the current filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px]">
                  <thead>
                    <tr className="border-b text-left text-sm text-gray-500">
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Contact</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Bookings</th>
                      <th className="px-4 py-3 font-medium">Paid Trips</th>
                      <th className="px-4 py-3 font-medium">Total Spend</th>
                      <th className="px-4 py-3 font-medium">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b align-top">
                        <td className="px-4 py-4">
                          <p className="font-semibold text-gray-900">{user.name || "Unnamed user"}</p>
                          <p className="mt-1 text-xs text-gray-500">{user.id}</p>
                        </td>
                        <td className="space-y-2 px-4 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{user.phone || "No phone"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={user.role === "customer" ? "secondary" : "default"}>{user.role}</Badge>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{user.booking_count}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{user.paid_booking_count}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(Number(user.total_spend || 0))}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          <p>{formatDate(user.last_booking_at || user.updated_at)}</p>
                          <p className="mt-1 text-xs text-gray-400">Joined {formatDate(user.created_at)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
