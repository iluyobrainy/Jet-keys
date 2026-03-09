"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Clock3, Loader2, Search, Shield, Truck, Undo2 } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { formatDate, formatNumber } from "@/lib/formatters"
import { useBookings, useProcessRefundRequest, useRefundRequests, useUpdateBooking } from "@/lib/hooks/useApi"
import { useRealtimeInvalidation } from "@/lib/hooks/useRealtimeInvalidation"
import type { Booking } from "@/lib/services/apiService"

type BookingRecord = Booking & {
  booking_reference?: string | null
  cars?: {
    name?: string
    brand?: string
    model?: string
    images?: string[]
    primary_image_url?: string | null
    location?: string
  }
}

type RefundRecord = {
  id: string
  booking_id: string
  request_type: string
  reason: string
  bank_name?: string | null
  account_name?: string | null
  account_number?: string | null
  amount_requested?: number | null
  status: string
  admin_notes?: string | null
  bookings?: {
    booking_reference?: string | null
    status?: string
    customer_name?: string
    customer_email?: string
    total_amount?: number
  }
}

const bookingStatusLabels: Record<string, string> = {
  paid_awaiting_fulfilment: "Paid awaiting fulfilment",
  active: "In transit",
  returned: "Returned",
  completed: "Completed",
  cancel_requested: "Cancellation requested",
  cancelled: "Cancelled",
}

export default function AdminBookingsPage() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("paid_awaiting_fulfilment")
  const [notesByRefundId, setNotesByRefundId] = useState<Record<string, string>>({})
  const { data: bookings = [], isLoading, error } = useBookings("admin", { search })
  const { data: refundRequests = [] } = useRefundRequests("admin")
  const updateBookingMutation = useUpdateBooking()
  const processRefundMutation = useProcessRefundRequest()

  useRealtimeInvalidation("admin-bookings-live", ["bookings", "refund_requests", "payment_transactions"], [["bookings"], ["refundRequests"]])

  const groupedBookings = useMemo(() => {
    const queue: Record<string, BookingRecord[]> = {
      paid_awaiting_fulfilment: [],
      active: [],
      returned: [],
      completed: [],
      cancel_requested: [],
    }

    bookings.forEach((booking) => {
      if (queue[booking.status]) {
        queue[booking.status].push(booking)
      }
    })

    return queue
  }, [bookings])

  const stats = useMemo(() => ({
    fulfilment: groupedBookings.paid_awaiting_fulfilment.length,
    active: groupedBookings.active.length,
    returned: groupedBookings.returned.length,
    completed: groupedBookings.completed.length,
    refunds: refundRequests.length,
  }), [groupedBookings, refundRequests])

  const triggerBookingAction = async (bookingId: string, action: string) => {
    await updateBookingMutation.mutateAsync({
      id: bookingId,
      updates: { action },
    })
  }

  const processRefund = async (refundId: string, status: string) => {
    await processRefundMutation.mutateAsync({
      id: refundId,
      status,
      adminNotes: notesByRefundId[refundId] || "",
    })
  }

  const statItems = [
    { label: "Ready", value: stats.fulfilment, Icon: Clock3 },
    { label: "In transit", value: stats.active, Icon: Truck },
    { label: "Returned", value: stats.returned, Icon: Undo2 },
    { label: "Completed", value: stats.completed, Icon: CheckCircle2 },
    { label: "Refunds", value: stats.refunds, Icon: Shield },
  ]

  const BookingList = ({ items, emptyMessage }: { items: BookingRecord[]; emptyMessage: string }) => (
    <div className="space-y-4">
      {items.length === 0 ? (
        <Card className="rounded-[24px] border-slate-200">
          <CardContent className="p-6 text-sm text-slate-500">{emptyMessage}</CardContent>
        </Card>
      ) : null}

      {items.map((booking) => (
        <Card key={String(booking.id)} className="rounded-[28px] border-slate-200">
          <CardContent className="space-y-5 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{String(booking.booking_reference || booking.id)}</p>
                <h2 className="mt-2 text-xl font-bold text-slate-950">{booking.cars?.name || `${booking.cars?.brand || "Car"} ${booking.cars?.model || ""}`.trim()}</h2>
                <div className="mt-3 grid gap-1 text-sm text-slate-600">
                  <p>{booking.customer_name}</p>
                  <p>{booking.customer_email}</p>
                  <p>{booking.customer_phone}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                  {bookingStatusLabels[booking.status] || booking.status}
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  {String(booking.payment_status).replaceAll("_", " ")}
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[20px] bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Trip window</p>
                <p className="mt-2 text-sm font-medium text-slate-950">{formatDate(booking.pickup_date)}</p>
                <p className="text-sm text-slate-600">to {formatDate(booking.dropoff_date)}</p>
              </div>
              <div className="rounded-[20px] bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Route</p>
                <p className="mt-2 text-sm font-medium text-slate-950">{booking.pickup_location}</p>
                <p className="text-sm text-slate-600">to {booking.dropoff_location}</p>
              </div>
              <div className="rounded-[20px] bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Amount paid</p>
                <p className="mt-2 text-lg font-bold text-slate-950">NGN {formatNumber(Number(booking.total_amount || 0))}</p>
              </div>
            </div>

            {booking.special_requests ? (
              <div className="rounded-[20px] border border-slate-200 px-4 py-3 text-sm text-slate-600">
                <strong className="text-slate-900">Special requests:</strong> {booking.special_requests}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {booking.status === "paid_awaiting_fulfilment" ? (
                <Button className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800" onClick={() => triggerBookingAction(String(booking.id), "start_rental")} disabled={updateBookingMutation.isPending}>
                  Start rental
                </Button>
              ) : null}
              {booking.status === "active" ? (
                <Button className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800" onClick={() => triggerBookingAction(String(booking.id), "mark_returned")} disabled={updateBookingMutation.isPending}>
                  Mark returned
                </Button>
              ) : null}
              {booking.status === "returned" ? (
                <Button className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800" onClick={() => triggerBookingAction(String(booking.id), "complete_booking")} disabled={updateBookingMutation.isPending}>
                  Complete booking
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Bookings</h1>
            <p className="text-sm text-slate-600">Realtime operational queues for paid bookings, active rentals, returns, and refunds.</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            Draft and unpaid checkout records are excluded from admin queues until payment is verified.
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {statItems.map(({ label, value, Icon }) => (
            <Card key={label} className="rounded-[24px] border-slate-200">
              <CardContent className="flex items-center gap-3 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="text-2xl font-bold text-slate-950">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-[28px] border-slate-200">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-12 rounded-2xl border-slate-200 pl-10"
                placeholder="Search by booking ID, customer, email, phone, or car"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-[28px] border border-slate-200 bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
          </div>
        ) : null}

        {error ? (
          <Card className="rounded-[28px] border-red-200 bg-red-50">
            <CardContent className="p-6 text-sm text-red-700">{error instanceof Error ? error.message : "Unable to load bookings."}</CardContent>
          </Card>
        ) : null}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="h-auto w-full flex-wrap rounded-[20px] bg-slate-100 p-2">
            <TabsTrigger value="paid_awaiting_fulfilment">Paid awaiting fulfilment</TabsTrigger>
            <TabsTrigger value="active">In transit</TabsTrigger>
            <TabsTrigger value="returned">Returned</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancel_requested">Cancellation requests</TabsTrigger>
            <TabsTrigger value="refunds">Refunds</TabsTrigger>
          </TabsList>

          <TabsContent value="paid_awaiting_fulfilment">
            <BookingList items={groupedBookings.paid_awaiting_fulfilment} emptyMessage="No paid bookings are waiting for fulfilment." />
          </TabsContent>
          <TabsContent value="active">
            <BookingList items={groupedBookings.active} emptyMessage="No active rentals are currently in transit." />
          </TabsContent>
          <TabsContent value="returned">
            <BookingList items={groupedBookings.returned} emptyMessage="No returned rentals are waiting for completion." />
          </TabsContent>
          <TabsContent value="completed">
            <BookingList items={groupedBookings.completed} emptyMessage="No completed rentals matched the current search." />
          </TabsContent>
          <TabsContent value="cancel_requested">
            <BookingList items={groupedBookings.cancel_requested} emptyMessage="No bookings are waiting on cancellation review." />
          </TabsContent>
          <TabsContent value="refunds">
            <div className="space-y-4">
              {refundRequests.length === 0 ? (
                <Card className="rounded-[24px] border-slate-200">
                  <CardContent className="p-6 text-sm text-slate-500">No refund requests are pending.</CardContent>
                </Card>
              ) : null}

              {refundRequests.map((refundRequest: RefundRecord) => (
                <Card key={String(refundRequest.id)} className="rounded-[28px] border-slate-200">
                  <CardContent className="space-y-5 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{String(refundRequest.bookings?.booking_reference || refundRequest.booking_id)}</p>
                        <h2 className="mt-2 text-xl font-bold text-slate-950">{String(refundRequest.request_type).replaceAll("_", " ")}</h2>
                        <div className="mt-3 space-y-1 text-sm text-slate-600">
                          <p>{String(refundRequest.bookings?.customer_name || "Customer")}</p>
                          <p>{String(refundRequest.bookings?.customer_email || "")}</p>
                          <p>Requested amount: NGN {formatNumber(Number(refundRequest.amount_requested || refundRequest.bookings?.total_amount || 0))}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">{String(refundRequest.status)}</span>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">{String(refundRequest.bookings?.status || "")}</span>
                      </div>
                    </div>

                    <div className="rounded-[22px] bg-slate-50 p-4 text-sm text-slate-600">
                      <p><strong className="text-slate-900">Reason:</strong> {String(refundRequest.reason || "No reason supplied")}</p>
                      <p className="mt-2"><strong className="text-slate-900">Bank:</strong> {String(refundRequest.bank_name || "Not supplied")}</p>
                      <p><strong className="text-slate-900">Account:</strong> {String(refundRequest.account_name || "")}{refundRequest.account_number ? ` (${String(refundRequest.account_number)})` : ""}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-900">Admin notes</label>
                      <Textarea
                        className="min-h-24 rounded-2xl"
                        value={notesByRefundId[String(refundRequest.id)] || String(refundRequest.admin_notes || "")}
                        onChange={(event) => setNotesByRefundId((current) => ({ ...current, [String(refundRequest.id)]: event.target.value }))}
                        placeholder="Add internal notes before approving, processing, or rejecting."
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <Button className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800" onClick={() => processRefund(String(refundRequest.id), "approved")} disabled={processRefundMutation.isPending}>Approve</Button>
                      <Button className="rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500" onClick={() => processRefund(String(refundRequest.id), "processed")} disabled={processRefundMutation.isPending}>Mark processed</Button>
                      <Button variant="outline" className="rounded-2xl border-red-200 text-red-700 hover:bg-red-50" onClick={() => processRefund(String(refundRequest.id), "rejected")} disabled={processRefundMutation.isPending}>Reject</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}

