"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Edit, Gauge, MapPin, Plane, Users } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { jetService } from "@/lib/admin-services"
import type { Database } from "@/lib/supabase"

type Jet = Database["public"]["Tables"]["jets"]["Row"]

export default function JetDetailPage() {
  const params = useParams<{ id: string }>()
  const [jet, setJet] = useState<Jet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadJet = async () => {
      if (!params.id) return
      try {
        setJet(await jetService.getJetById(params.id))
      } catch (loadError) {
        console.error("Error loading jet:", loadError)
        setError("This jet could not be loaded.")
      } finally {
        setLoading(false)
      }
    }
    void loadJet()
  }, [params.id])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild><Link href="/jets"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link></Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Jet Details</h1>
              <p className="text-gray-600">Review aircraft data as it appears in the fleet.</p>
            </div>
          </div>
          {jet ? <Button asChild><Link href={`/jets/${jet.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit Jet</Link></Button> : null}
        </div>

        {loading ? <div className="h-96 animate-pulse rounded-2xl bg-white shadow" /> : null}
        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">{error}</div> : null}

        {jet ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
            <Card className="overflow-hidden">
              <div className="relative h-96 bg-gray-100">
                {jet.images?.[0] ? <Image src={jet.images[0]} alt={jet.name} fill className="object-cover" /> : <Plane className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 text-gray-400" />}
              </div>
              {jet.images?.length > 1 ? (
                <CardContent className="grid grid-cols-4 gap-3 p-4">
                  {jet.images.slice(1).map((image, index) => <div key={image} className="relative h-24 overflow-hidden rounded-xl bg-gray-100"><Image src={image} alt={`${jet.name} ${index + 2}`} fill className="object-cover" /></div>)}
                </CardContent>
              ) : null}
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle>{jet.name}</CardTitle>
                    <Badge>{jet.status.split("_").join(" ")}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{jet.manufacturer} {jet.model} ({jet.year})</p>
                  <p className="leading-7 text-gray-700">{jet.description}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Info icon={Users} label="Capacity" value={`${jet.capacity} passengers`} />
                    <Info icon={Gauge} label="Range" value={`${jet.range} km`} />
                    <Info icon={Plane} label="Speed" value={`${jet.max_speed} km/h`} />
                    <Info icon={MapPin} label="Base" value={jet.location} />
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Pricing</p>
                    <p className="text-2xl font-bold text-gray-950">NGN {jet.price_per_hour.toLocaleString()}/hr</p>
                    <p className="text-sm text-gray-500">NGN {jet.price_per_day.toLocaleString()}/day</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Amenities</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {(jet.features?.length ? jet.features : ["No amenities listed"]).map((feature) => <Badge key={feature} variant="outline">{feature}</Badge>)}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  )
}

function Info({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return <div className="rounded-2xl bg-gray-50 p-4"><Icon className="mb-2 h-4 w-4 text-blue-600" /><p className="text-xs uppercase text-gray-500">{label}</p><p className="font-semibold text-gray-900">{value}</p></div>
}

