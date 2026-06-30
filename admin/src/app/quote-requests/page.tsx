"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { adminApiFetch } from "@/lib/admin-api-client"
import { Loader2, RefreshCw } from "lucide-react"

type QuoteRequest = Record<string, any>

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })
}

function statusBadge(status: string) {
  if (status === "quoted") return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">quoted</Badge>
  if (status === "reviewing") return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">reviewing</Badge>
  if (status === "closed") return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">closed</Badge>
  return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">new</Badge>
}

export default function QuoteRequestsPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [drafts, setDrafts] = useState<Record<string, { quotedAmount?: string; adminNotes?: string; status?: string }>>({})
  const [updatingId, setUpdatingId] = useState("")

  const fetchQuotes = async () => {
    setLoading(true)
    try {
      const params = statusFilter === "all" ? "" : `?status=${statusFilter}`
      setQuotes(await adminApiFetch<QuoteRequest[]>(`/api/admin/quote-requests${params}`))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchQuotes()
  }, [statusFilter])

  const stats = useMemo(() => ({
    total: quotes.length,
    new: quotes.filter((quote) => quote.status === "new").length,
    quoted: quotes.filter((quote) => quote.status === "quoted").length,
  }), [quotes])

  const saveQuote = async (quote: QuoteRequest) => {
    const draft = drafts[quote.id] || {}
    setUpdatingId(quote.id)
    try {
      const updated = await adminApiFetch<QuoteRequest>("/api/admin/quote-requests", {
        method: "PATCH",
        body: JSON.stringify({
          id: quote.id,
          status: draft.status || quote.status,
          quotedAmount: draft.quotedAmount ?? quote.quoted_amount ?? "",
          adminNotes: draft.adminNotes ?? quote.admin_notes ?? "",
        }),
      })
      setQuotes((current) => current.map((item) => (item.id === quote.id ? updated : item)))
    } finally {
      setUpdatingId("")
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quote Requests</h1>
            <p className="text-gray-600">Manual pricing queue for interstate and non-auto-priced location bookings.</p>
          </div>
          <select className="h-11 rounded-md border border-gray-300 px-3 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="reviewing">Reviewing</option>
            <option value="quoted">Quoted</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-3xl"><CardContent className="p-5"><p className="text-sm text-gray-500">Visible</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card className="rounded-3xl"><CardContent className="p-5"><p className="text-sm text-gray-500">New</p><p className="text-2xl font-bold">{stats.new}</p></CardContent></Card>
          <Card className="rounded-3xl"><CardContent className="p-5"><p className="text-sm text-gray-500">Quoted</p><p className="text-2xl font-bold">{stats.quoted}</p></CardContent></Card>
        </div>

        {loading ? (
          <Card className="rounded-3xl"><CardContent className="flex h-52 items-center justify-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Loading quote requests...</CardContent></Card>
        ) : null}

        {!loading && quotes.length === 0 ? <Card className="rounded-3xl"><CardContent className="py-12 text-center text-gray-500">No quote requests found.</CardContent></Card> : null}

        <div className="space-y-4">
          {quotes.map((quote) => {
            const carName = quote.cars ? [quote.cars.brand, quote.cars.model].filter(Boolean).join(" ") || quote.cars.name : "Car request"
            const draft = drafts[quote.id] || {}
            return (
              <Card key={String(quote.id)} className="rounded-3xl">
                <CardContent className="space-y-5 p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{String(quote.quote_reference)}</p>
                      <h2 className="mt-2 text-xl font-semibold text-gray-900">{carName}</h2>
                      <p className="text-sm text-gray-600">{String(quote.customer_name)} - {String(quote.customer_email)} - {String(quote.customer_phone)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {statusBadge(String(quote.status))}
                      <Badge variant="outline">{String(quote.rental_mode).replace("_", " ")}</Badge>
                      <Badge variant="outline">{String(quote.timing_package || "timing not set")}</Badge>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                      <p><strong>Pickup:</strong> {formatDate(String(quote.pickup_date))}</p>
                      <p><strong>Return:</strong> {formatDate(String(quote.dropoff_date))}</p>
                      <p><strong>Pickup address:</strong> {String(quote.pickup_address)}</p>
                      <p><strong>Dropoff address:</strong> {String(quote.dropoff_address)}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                      <p><strong>State:</strong> {String(quote.service_states?.name || quote.origin_state?.name || "Manual")}</p>
                      <p><strong>Destination:</strong> {String(quote.destination_state?.name || "Within state/manual")}</p>
                      <p><strong>Area of use:</strong> {String(quote.area_of_use || "Not provided")}</p>
                      <p><strong>Trip type:</strong> {String(quote.trip_type || "Not provided")}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[160px_1fr_180px_auto] md:items-end">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <select className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm" value={draft.status ?? quote.status} onChange={(event) => setDrafts((current) => ({ ...current, [quote.id]: { ...current[quote.id], status: event.target.value } }))}>
                        <option value="new">New</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="quoted">Quoted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Admin notes</label>
                      <Textarea className="mt-1 min-h-10" value={draft.adminNotes ?? String(quote.admin_notes || "")} onChange={(event) => setDrafts((current) => ({ ...current, [quote.id]: { ...current[quote.id], adminNotes: event.target.value } }))} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Quoted amount</label>
                      <Input className="mt-1" type="number" value={draft.quotedAmount ?? String(quote.quoted_amount || "")} onChange={(event) => setDrafts((current) => ({ ...current, [quote.id]: { ...current[quote.id], quotedAmount: event.target.value } }))} />
                    </div>
                    <Button onClick={() => saveQuote(quote)} disabled={updatingId === quote.id}>{updatingId === quote.id ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}Save</Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </AdminLayout>
  )
}