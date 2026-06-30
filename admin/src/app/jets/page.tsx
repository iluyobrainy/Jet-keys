"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Edit, Eye, Gauge, MapPin, Plane, Plus, Search, Trash2, Users } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { jetService } from "@/lib/admin-services"
import type { Database } from "@/lib/supabase"

type JetData = Database["public"]["Tables"]["jets"]["Row"]

const fallbackImage = "/placeholder.jpg"

export default function JetsPage() {
  const [jets, setJets] = useState<JetData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [jetToDelete, setJetToDelete] = useState<JetData | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchJets = async () => {
    setLoading(true)
    try {
      setJets(await jetService.getAllJets())
    } catch (error) {
      console.error("Error fetching jets:", error)
      setMessage({ type: "error", text: "Could not load jets. Please refresh and try again." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchJets()
  }, [])

  const filteredJets = useMemo(() => {
    const search = searchTerm.toLowerCase()
    return jets.filter((jet) => {
      const matchesSearch = [jet.name, jet.manufacturer, jet.model, jet.location].join(" ").toLowerCase().includes(search)
      const matchesStatus = statusFilter === "all" || jet.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [jets, searchTerm, statusFilter])

  const handleDeleteJet = async () => {
    if (!jetToDelete) return
    setDeleting(true)
    setMessage(null)

    try {
      await jetService.deleteJet(jetToDelete.id)
      setJets((current) => current.filter((jet) => jet.id !== jetToDelete.id))
      setMessage({ type: "success", text: `${jetToDelete.name} was deleted safely.` })
      setJetToDelete(null)
    } catch (error) {
      console.error("Error deleting jet:", error)
      setMessage({ type: "error", text: "Failed to delete jet. Please try again." })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jet Management</h1>
            <p className="text-gray-600">Manage the live private jet fleet shown on the website.</p>
          </div>
          <Button asChild>
            <Link href="/jets/add"><Plus className="mr-2 h-4 w-4" /> Add New Jet</Link>
          </Button>
        </div>

        {message ? (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
            {message.text}
          </div>
        ) : null}

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search jets by name, manufacturer, model, or base..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-52">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_service">Out of Service</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => <div key={item} className="h-96 animate-pulse rounded-2xl bg-white shadow" />)}
          </div>
        ) : null}

        {!loading && filteredJets.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredJets.map((jet) => (
              <Card key={jet.id} className="overflow-hidden">
                <div className="relative h-48 bg-gray-100">
                  {jet.images?.[0] ? <Image src={jet.images[0]} alt={jet.name} fill className="object-cover" /> : <Plane className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-gray-400" />}
                  <div className="absolute right-3 top-3"><StatusBadge status={jet.status} /></div>
                </div>
                <CardContent className="space-y-4 p-5">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-950">{jet.name}</h3>
                    <p className="text-sm text-gray-600">{jet.manufacturer} {jet.model} ({jet.year})</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {jet.location}</span>
                    <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {jet.capacity} pax</span>
                    <span className="flex items-center gap-2"><Gauge className="h-4 w-4" /> {jet.range} km</span>
                    <span className="font-semibold text-gray-950">NGN {Number(jet.price_per_hour || 0).toLocaleString()}/hr</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <Badge variant={jet.is_available ? "default" : "outline"}>{jet.is_available ? "Available" : "Unavailable"}</Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild><Link href={`/jets/${jet.id}`}><Eye className="h-4 w-4" /></Link></Button>
                      <Button size="sm" variant="outline" asChild><Link href={`/jets/${jet.id}/edit`}><Edit className="h-4 w-4" /></Link></Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => setJetToDelete(jet)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {!loading && filteredJets.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Plane className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">No jets found</h3>
              <p className="mb-4 text-gray-600">{searchTerm || statusFilter !== "all" ? "Try adjusting your search criteria." : "Add your first jet to publish the fleet catalog."}</p>
              <Button asChild><Link href="/jets/add"><Plus className="mr-2 h-4 w-4" /> Add New Jet</Link></Button>
            </CardContent>
          </Card>
        ) : null}

        {jetToDelete ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-gray-950">Delete this jet?</h2>
              <p className="mt-2 text-sm text-gray-600">This will remove <span className="font-semibold">{jetToDelete.name}</span> from admin and the public catalog. This action cannot be undone.</p>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setJetToDelete(null)} disabled={deleting}>Cancel</Button>
                <Button className="bg-red-600 text-white hover:bg-red-700" onClick={() => void handleDeleteJet()} disabled={deleting}>{deleting ? "Deleting..." : "Delete jet"}</Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  )
}

function StatusBadge({ status }: { status: string }) {
  const className = status === "active" ? "bg-green-600" : status === "maintenance" ? "bg-yellow-500" : status === "reserved" ? "bg-blue-600" : "bg-gray-600"
  return <Badge className={className}>{status.split("_").join(" ")}</Badge>
}

