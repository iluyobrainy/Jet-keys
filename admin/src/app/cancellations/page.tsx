"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  Eye,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { adminApiFetch } from "@/lib/admin-api-client"

type CancellationRequest = {
  id: string
  booking_id: string
  request_type: string
  reason: string
  bank_name: string | null
  account_name: string | null
  account_number: string | null
  amount_requested: number | null
  status: string
  admin_notes: string | null
  processed_at: string | null
  created_at: string
  processed_by_user?: {
    id: string
    name: string | null
    email: string | null
  } | null
  booking?: {
    id: string
    booking_reference?: string | null
    status: string
    payment_status: string | null
    customer_name?: string | null
    customer_email?: string | null
    customer_phone?: string | null
    pickup_location?: string | null
    dropoff_location?: string | null
    pickup_date?: string | null
    dropoff_date?: string | null
    total_amount?: number | null
    refund_amount?: number | null
    refund_status?: string | null
    cancellation_reason?: string | null
    cancellation_date?: string | null
    bank_name?: string | null
    account_name?: string | null
    account_number?: string | null
    refund_processed_by?: string | null
    refund_processed_date?: string | null
    refund_reference?: string | null
    cars?: {
      id: string
      name?: string | null
      brand?: string | null
      model?: string | null
      primary_image_url?: string | null
      location?: string | null
    } | null
  } | null
}

type CancellationsResponse = {
  requests: CancellationRequest[]
  stats: {
    pendingRequests: number
    approvedRequests: number
    processedRequests: number
    rejectedRequests: number
    totalRequestedAmount: number
  }
}

type ActionType = "approved" | "processed" | "rejected"

const initialStats = {
  pendingRequests: 0,
  approvedRequests: 0,
  processedRequests: 0,
  rejectedRequests: 0,
  totalRequestedAmount: 0,
}

function formatDateTime(dateString?: string | null) {
  if (!dateString) {
    return "N/A"
  }

  return new Date(dateString).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatCurrency(amount?: number | null) {
  return `NGN ${Number(amount || 0).toLocaleString()}`
}

function getStatusBadge(status: string) {
  const normalized = status.split("_").join(" ")

  if (status === "pending") {
    return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{normalized}</Badge>
  }

  if (status === "approved") {
    return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{normalized}</Badge>
  }

  if (status === "processed") {
    return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{normalized}</Badge>
  }

  if (status === "rejected") {
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{normalized}</Badge>
  }

  return <Badge variant="outline">{normalized}</Badge>
}

function getRequestTypeBadge(requestType: string) {
  if (requestType === "refund_review") {
    return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">refund review</Badge>
  }

  return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">cancellation</Badge>
}

export default function CancellationsPage() {
  const [data, setData] = useState<CancellationsResponse>({ requests: [], stats: initialStats })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<CancellationRequest | null>(null)
  const [detailRequest, setDetailRequest] = useState<CancellationRequest | null>(null)
  const [actionType, setActionType] = useState<ActionType | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [refundReference, setRefundReference] = useState("")
  const [busyId, setBusyId] = useState("")
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fetchCancellations = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const response = await adminApiFetch<CancellationsResponse>("/api/admin/cancellations")
      setData(response)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load cancellation requests")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchCancellations()
  }, [fetchCancellations])

  const filteredRequests = useMemo(() => {
    return data.requests.filter((request) => {
      if (statusFilter !== "all" && request.status !== statusFilter) {
        return false
      }

      if (typeFilter !== "all" && request.request_type !== typeFilter) {
        return false
      }

      if (!searchTerm.trim()) {
        return true
      }

      const haystack = [
        request.booking?.booking_reference || "",
        request.booking?.customer_name || "",
        request.booking?.customer_email || "",
        request.booking?.customer_phone || "",
        request.booking?.cars?.name || "",
        request.booking?.cars?.brand || "",
        request.booking?.cars?.model || "",
        request.reason,
      ]
        .join(" ")
        .toLowerCase()

      return haystack.includes(searchTerm.toLowerCase())
    })
  }, [data.requests, searchTerm, statusFilter, typeFilter])

  const openActionModal = (request: CancellationRequest, nextAction: ActionType) => {
    setSelectedRequest(request)
    setActionType(nextAction)
    setAdminNotes(request.admin_notes || "")
    setRefundReference(request.booking?.refund_reference || "")
  }

  const closeActionModal = () => {
    setSelectedRequest(null)
    setActionType(null)
    setAdminNotes("")
    setRefundReference("")
  }

  const handleAction = async () => {
    if (!selectedRequest || !actionType) {
      return
    }

    try {
      setBusyId(selectedRequest.id)
      setFeedback(null)

      const updatedRequest = await adminApiFetch<CancellationRequest>(`/api/admin/cancellations/${selectedRequest.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: actionType,
          adminNotes,
          refundReference,
        }),
      })

      closeActionModal()
      setFeedback({
        type: "success",
        text:
          actionType === "approved"
            ? "Cancellation approved. The booking is now queued for refund."
            : actionType === "processed"
              ? "Refund marked as processed successfully."
              : "Cancellation request rejected.",
      })

      setData((current) => {
        const nextRequests = current.requests.map((request) =>
          request.id === updatedRequest.id ? updatedRequest : request,
        )

        return {
          requests: nextRequests,
          stats: nextRequests.reduce(
            (summary, request) => {
              if (request.status === "pending") {
                summary.pendingRequests += 1
              }
              if (request.status === "approved") {
                summary.approvedRequests += 1
              }
              if (request.status === "processed") {
                summary.processedRequests += 1
              }
              if (request.status === "rejected") {
                summary.rejectedRequests += 1
              }
              summary.totalRequestedAmount += Number(request.amount_requested || 0)
              return summary
            },
            { ...initialStats },
          ),
        }
      })
    } catch (actionError) {
      setFeedback({
        type: "error",
        text: actionError instanceof Error ? actionError.message : "Failed to update request",
      })
    } finally {
      setBusyId("")
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cancellations & Refunds</h1>
            <p className="text-gray-600">Review cancellation requests, approve them, and mark refunds as completed.</p>
          </div>
          <Button variant="outline" onClick={() => void fetchCancellations()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {feedback ? (
          <Card className={feedback.type === "success" ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}>
            <CardContent className={`p-4 text-sm ${feedback.type === "success" ? "text-emerald-700" : "text-red-700"}`}>
              {feedback.text}
            </CardContent>
          </Card>
        ) : null}

        {error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card className="rounded-3xl">
            <CardContent className="flex items-center gap-3 p-5">
              <Clock3 className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.pendingRequests}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl">
            <CardContent className="flex items-center gap-3 p-5">
              <AlertCircle className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.approvedRequests}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl">
            <CardContent className="flex items-center gap-3 p-5">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-sm text-gray-500">Refunded</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.processedRequests}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl">
            <CardContent className="flex items-center gap-3 p-5">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.rejectedRequests}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl">
            <CardContent className="flex items-center gap-3 p-5">
              <CreditCard className="h-8 w-8 text-slate-700" />
              <div>
                <p className="text-sm text-gray-500">Amount requested</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.stats.totalRequestedAmount)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl">
          <CardContent className="grid gap-4 p-6 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by booking ref, customer, email, phone, or car"
                className="pl-10"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">All request types</option>
              <option value="cancellation">Cancellation</option>
              <option value="refund_review">Refund review</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="processed">Processed</option>
              <option value="rejected">Rejected</option>
            </select>
          </CardContent>
        </Card>

        {loading ? (
          <Card className="rounded-3xl">
            <CardContent className="flex h-48 items-center justify-center text-gray-500">
              <RefreshCw className="mr-3 h-5 w-5 animate-spin" />
              Loading cancellation requests...
            </CardContent>
          </Card>
        ) : null}

        {!loading && filteredRequests.length === 0 ? (
          <Card className="rounded-3xl">
            <CardContent className="py-12 text-center text-gray-500">
              No cancellation or refund requests matched the current filters.
            </CardContent>
          </Card>
        ) : null}

        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="rounded-3xl">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-gray-400">
                      {request.booking?.booking_reference || request.id}
                    </p>
                    <CardTitle className="mt-2 text-xl text-gray-900">
                      {[request.booking?.cars?.brand, request.booking?.cars?.model].filter(Boolean).join(" ") ||
                        request.booking?.cars?.name ||
                        "Vehicle request"}
                    </CardTitle>
                    <p className="mt-2 text-sm text-gray-600">
                      {request.booking?.customer_name || "Customer"}
                      {request.booking?.customer_email ? ` | ${request.booking.customer_email}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {getRequestTypeBadge(request.request_type)}
                    {getStatusBadge(request.status)}
                    {request.booking?.status ? getStatusBadge(request.booking.status) : null}
                    {request.booking?.payment_status ? getStatusBadge(request.booking.payment_status) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Requested amount</p>
                    <p className="mt-2 text-xl font-semibold text-slate-950">{formatCurrency(request.amount_requested)}</p>
                    <p className="mt-2 text-sm text-slate-600">Submitted {formatDateTime(request.created_at)}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Route</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {request.booking?.pickup_location || "N/A"} <ArrowRight className="mx-1 inline h-3 w-3" />
                      {request.booking?.dropoff_location || "N/A"}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {formatDateTime(request.booking?.pickup_date)} to {formatDateTime(request.booking?.dropoff_date)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Refund destination</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {request.bank_name || request.booking?.bank_name || "Bank pending"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {request.account_name || request.booking?.account_name || "Account name pending"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {request.account_number || request.booking?.account_number || "Account number pending"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Customer reason</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{request.reason}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => setDetailRequest(request)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View details
                  </Button>
                  {request.status === "pending" ? (
                    <>
                      <Button onClick={() => openActionModal(request, "approved")} disabled={busyId === request.id}>
                        Approve request
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => openActionModal(request, "rejected")}
                        disabled={busyId === request.id}
                      >
                        Reject
                      </Button>
                    </>
                  ) : null}
                  {request.status === "approved" ? (
                    <Button onClick={() => openActionModal(request, "processed")} disabled={busyId === request.id}>
                      Mark refunded
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {detailRequest ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl">
              <CardHeader className="border-b">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">Cancellation request details</CardTitle>
                    <p className="mt-2 text-sm text-gray-600">
                      {detailRequest.booking?.booking_reference || detailRequest.id}
                    </p>
                  </div>
                  <Button variant="ghost" onClick={() => setDetailRequest(null)}>
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 overflow-y-auto p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Customer</p>
                    <p className="mt-2 font-semibold text-slate-950">{detailRequest.booking?.customer_name || "Customer"}</p>
                    <p className="mt-1 text-sm text-slate-600">{detailRequest.booking?.customer_email || "No email"}</p>
                    <p className="mt-1 text-sm text-slate-600">{detailRequest.booking?.customer_phone || "No phone"}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Vehicle</p>
                    <p className="mt-2 font-semibold text-slate-950">
                      {[detailRequest.booking?.cars?.brand, detailRequest.booking?.cars?.model].filter(Boolean).join(" ") ||
                        detailRequest.booking?.cars?.name ||
                        "Vehicle"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{detailRequest.booking?.cars?.location || "Location not set"}</p>
                    <p className="mt-1 text-sm text-slate-600">{formatCurrency(detailRequest.booking?.total_amount)}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Request timeline</p>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <p>Requested: {formatDateTime(detailRequest.created_at)}</p>
                      <p>Processed: {formatDateTime(detailRequest.processed_at)}</p>
                      <p>Status: {detailRequest.status.split("_").join(" ")}</p>
                      <p>Type: {detailRequest.request_type.split("_").join(" ")}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Stored refund account</p>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <p>Bank: {detailRequest.bank_name || detailRequest.booking?.bank_name || "Not supplied"}</p>
                      <p>Account name: {detailRequest.account_name || detailRequest.booking?.account_name || "Not supplied"}</p>
                      <div className="flex items-center gap-2">
                        <span>Account number: {detailRequest.account_number || detailRequest.booking?.account_number || "Not supplied"}</span>
                        {(detailRequest.account_number || detailRequest.booking?.account_number) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              void navigator.clipboard.writeText(
                                detailRequest.account_number || detailRequest.booking?.account_number || "",
                              )
                            }
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Customer reason</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{detailRequest.reason}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin processing</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <p>
                      Processed by: {detailRequest.processed_by_user?.name || detailRequest.processed_by_user?.email || detailRequest.booking?.refund_processed_by || "Not processed yet"}
                    </p>
                    <p>Refund reference: {detailRequest.booking?.refund_reference || "Not added yet"}</p>
                    <p>Admin notes: {detailRequest.admin_notes || "No notes recorded yet"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {selectedRequest && actionType ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-2xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {actionType === "approved"
                    ? "Approve cancellation request"
                    : actionType === "processed"
                      ? "Mark refund as processed"
                      : "Reject cancellation request"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p><strong>Booking:</strong> {selectedRequest.booking?.booking_reference || selectedRequest.id}</p>
                  <p><strong>Customer:</strong> {selectedRequest.booking?.customer_name || "Customer"}</p>
                  <p><strong>Amount:</strong> {formatCurrency(selectedRequest.amount_requested)}</p>
                  <p><strong>Destination account:</strong> {selectedRequest.account_name || selectedRequest.booking?.account_name || "Not supplied"} ({selectedRequest.account_number || selectedRequest.booking?.account_number || "Not supplied"})</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Admin notes</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(event) => setAdminNotes(event.target.value)}
                    placeholder="Add any internal note for this decision."
                    className="min-h-28"
                  />
                </div>

                {actionType === "processed" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Refund reference</label>
                    <Input
                      value={refundReference}
                      onChange={(event) => setRefundReference(event.target.value)}
                      placeholder="Bank transfer reference or transaction ID"
                    />
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button variant="outline" className="flex-1" onClick={closeActionModal} disabled={busyId === selectedRequest.id}>
                    Close
                  </Button>
                  <Button
                    className="flex-1"
                    variant={actionType === "rejected" ? "destructive" : "default"}
                    onClick={() => void handleAction()}
                    disabled={busyId === selectedRequest.id}
                  >
                    {busyId === selectedRequest.id ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {actionType === "approved"
                      ? "Approve request"
                      : actionType === "processed"
                        ? "Mark refunded"
                        : "Reject request"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  )
}
