"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { CalendarDays, Mail, MessageCircle, Phone, Plane, RefreshCw, Search, Users } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { jetRequestService } from "@/lib/admin-services"
import type { Database } from "@/lib/supabase"

type Jet = Database["public"]["Tables"]["jets"]["Row"]
type JetRequest = Database["public"]["Tables"]["jet_requests"]["Row"] & {
  jets?: Pick<Jet, "name" | "manufacturer" | "model" | "images"> | null
}

const statuses = ["all", "new", "contacted", "quoted", "confirmed", "closed"]

export default function JetRequestsPage() {
  const [requests, setRequests] = useState<JetRequest[]>([])
  const [selected, setSelected] = useState<JetRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [notes, setNotes] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const loadRequests = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const data = await jetRequestService.getAllJetRequests() as JetRequest[]
      setRequests(data)
      setSelected((current) => current ? data.find((item) => item.id === current.id) || data[0] || null : data[0] || null)
    } catch (error) {
      console.error("Error loading jet requests:", error)
      setMessage({ type: "error", text: "Could not load jet requests." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRequests()
  }, [])

  useEffect(() => {
    setNotes(selected?.admin_notes || "")
  }, [selected])

  const filteredRequests = useMemo(() => {
    const q = search.toLowerCase()
    return requests.filter((request) => {
      const haystack = [request.request_reference, request.customer_name, request.customer_email, request.customer_phone, request.departure_location, request.destination, request.jets?.name].join(" ").toLowerCase()
      return (status === "all" || request.status === status) && haystack.includes(q)
    })
  }, [requests, search, status])

  const updateRequest = async (updates: { status?: string; admin_notes?: string | null }) => {
    if (!selected) return
    setSaving(true)
    setMessage(null)
    try {
      const updated = await jetRequestService.updateJetRequest(selected.id, updates as never) as JetRequest
      setRequests((current) => current.map((item) => item.id === updated.id ? updated : item))
      setSelected(updated)
      setMessage({ type: "success", text: "Jet request updated." })
    } catch (error) {
      console.error("Error updating jet request:", error)
      setMessage({ type: "error", text: "Unable to update this request." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jet Requests</h1>
            <p className="text-gray-600">Review charter requests created from the public website and continue follow-up on WhatsApp.</p>
          </div>
          <Button variant="outline" onClick={() => void loadRequests()}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
        </div>

        {message ? <div className={`rounded-2xl border px-4 py-3 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>{message.text}</div> : null}

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <Card>
            <CardHeader>
              <CardTitle>Request Queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reference, route, customer..." className="pl-10" />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {statuses.map((item) => <button key={item} onClick={() => setStatus(item)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${status === item ? "bg-gray-950 text-white" : "bg-gray-100 text-gray-600"}`}>{item.split("_").join(" ")}</button>)}
              </div>

              {loading ? <div className="space-y-3">{[0, 1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-gray-100" />)}</div> : null}

              {!loading && filteredRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-gray-500">
                  <Plane className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                  No jet requests match this view.
                </div>
              ) : null}

              <div className="space-y-3">
                {filteredRequests.map((request) => (
                  <button key={request.id} onClick={() => setSelected(request)} className={`w-full rounded-2xl border p-4 text-left transition ${selected?.id === request.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-950">{request.customer_name}</p>
                        <p className="text-sm text-gray-500">{request.request_reference}</p>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                    <p className="mt-3 text-sm text-gray-700">{request.departure_location} to {request.destination}</p>
                    <p className="mt-1 text-xs text-gray-500">{formatRequestDate(request)}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selected ? (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Reference</p>
                      <h2 className="text-2xl font-bold text-gray-950">{selected.request_reference}</h2>
                    </div>
                    <StatusBadge status={selected.status} />
                  </div>

                  <div className="rounded-3xl border bg-gray-50 p-4">
                    <div className="flex gap-4">
                      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-200">
                        {selected.jets?.images?.[0] ? <Image src={selected.jets.images[0]} alt={selected.jets.name || "Jet"} fill className="object-cover" /> : <Plane className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-gray-400" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-950">{selected.jets?.name || "Unspecified jet"}</p>
                        <p className="text-sm text-gray-500">{selected.jets ? `${selected.jets.manufacturer} ${selected.jets.model}` : "Client may need aircraft recommendation"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Detail icon={Users} label="Customer" value={selected.customer_name} />
                    <Detail icon={Phone} label="Phone" value={selected.customer_phone} />
                    <Detail icon={Mail} label="Email" value={selected.customer_email} />
                    <Detail icon={Users} label="Passengers" value={`${selected.passengers}`} />
                    <Detail icon={Plane} label="Route" value={`${selected.departure_location} to ${selected.destination}`} />
                    <Detail icon={CalendarDays} label="Departure" value={formatRequestDate(selected)} />
                  </div>

                  {selected.special_requests ? (
                    <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                      <p className="font-semibold">Special requests</p>
                      <p className="mt-1 leading-6">{selected.special_requests}</p>
                    </div>
                  ) : null}

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Status</label>
                    <select value={selected.status} onChange={(event) => void updateRequest({ status: event.target.value })} disabled={saving} className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm">
                      {statuses.filter((item) => item !== "all").map((item) => <option key={item} value={item}>{item.split("_").join(" ")}</option>)}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Admin notes</label>
                    <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} placeholder="Quote notes, call outcome, follow-up responsibility..." />
                    <Button disabled={saving} onClick={() => void updateRequest({ admin_notes: notes })}>{saving ? "Saving..." : "Save notes"}</Button>
                  </div>

                  <a href={buildWhatsappUrl(selected)} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center rounded-xl bg-green-600 px-5 text-sm font-semibold text-white hover:bg-green-700">
                    <MessageCircle className="mr-2 h-4 w-4" /> Continue on WhatsApp
                  </a>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed p-10 text-center text-gray-500">Select a request to view details.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

function StatusBadge({ status }: { status: string }) {
  const className = status === "new" ? "bg-blue-600" : status === "contacted" ? "bg-amber-500" : status === "quoted" ? "bg-purple-600" : status === "confirmed" ? "bg-green-600" : "bg-gray-600"
  return <Badge className={className}>{status.split("_").join(" ")}</Badge>
}

function Detail({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return <div className="rounded-2xl bg-gray-50 p-4"><Icon className="mb-2 h-4 w-4 text-blue-600" /><p className="text-xs uppercase tracking-wide text-gray-500">{label}</p><p className="mt-1 break-words font-semibold text-gray-900">{value}</p></div>
}

function formatRequestDate(request: JetRequest) {
  const departure = [request.departure_date, request.departure_time].filter(Boolean).join(" ")
  const returning = [request.return_date, request.return_time].filter(Boolean).join(" ")
  return returning ? `${departure} | Return ${returning}` : departure
}

function buildWhatsappUrl(request: JetRequest) {
  const message = [
    `Jet charter request ${request.request_reference}`,
    `Customer: ${request.customer_name}`,
    `Phone: ${request.customer_phone}`,
    `Jet: ${request.jets?.name || "Unspecified"}`,
    `Route: ${request.departure_location} to ${request.destination}`,
    `Departure: ${formatRequestDate(request)}`,
    `Passengers: ${request.passengers}`,
    request.special_requests ? `Special request: ${request.special_requests}` : "",
  ].filter(Boolean).join("\n")

  return `https://wa.me/2349075103413?text=${encodeURIComponent(message)}`
}

