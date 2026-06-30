"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adminApiFetch } from "@/lib/admin-api-client"
import { Loader2, MapPin, Save } from "lucide-react"

type Row = Record<string, any>

type PricingData = {
  states: Row[]
  zones: Row[]
  cars: Row[]
  coverage: Row[]
  rates: Row[]
}

function formatMoney(value: number) {
  return `NGN ${Number(value || 0).toLocaleString("en-NG")}`
}

export default function LocationPricingPage() {
  const [data, setData] = useState<PricingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState("")
  const [selectedCarId, setSelectedCarId] = useState("")
  const [rateDrafts, setRateDrafts] = useState<Record<string, string>>({})
  const [areaDrafts, setAreaDrafts] = useState<Record<string, string>>({})

  const fetchData = async () => {
    setLoading(true)
    try {
      const nextData = await adminApiFetch<PricingData>("/api/admin/location-pricing")
      setData(nextData)
      setSelectedCarId((current) => current || String(nextData.cars[0]?.id || ""))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchData()
  }, [])

  const selectedCar = data?.cars.find((car) => String(car.id) === selectedCarId)
  const selectedRates = useMemo(() => data?.rates.filter((rate) => String(rate.car_id) === selectedCarId) || [], [data, selectedCarId])
  const selectedCoverage = useMemo(() => data?.coverage.filter((item) => String(item.car_id) === selectedCarId) || [], [data, selectedCarId])

  const getRate = (zoneId: string, timingPackage: string) =>
    selectedRates.find((rate) => String(rate.zone_id) === zoneId && String(rate.timing_package) === timingPackage)

  const saveRate = async (stateId: string, zoneId: string, timingPackage: "12h" | "24h") => {
    const key = `${zoneId}-${timingPackage}`
    const existing = getRate(zoneId, timingPackage)
    const draftValue = rateDrafts[key] ?? String(existing?.base_price || "")

    setSavingKey(key)
    try {
      await adminApiFetch("/api/admin/location-pricing", {
        method: "PATCH",
        body: JSON.stringify({ action: "upsert-rate", carId: selectedCarId, stateId, zoneId, timingPackage, basePrice: draftValue, isActive: true }),
      })
      await fetchData()
    } finally {
      setSavingKey("")
    }
  }

  const saveArea = async (area: Row) => {
    const key = String(area.id)
    setSavingKey(key)
    try {
      await adminApiFetch("/api/admin/location-pricing", {
        method: "PATCH",
        body: JSON.stringify({ action: "update-area", id: area.id, surchargeAmount: areaDrafts[key] ?? area.surcharge_amount, isActive: area.is_active !== false }),
      })
      await fetchData()
    } finally {
      setSavingKey("")
    }
  }

  const toggleCoverage = async (stateId: string, rentalMode: string, nextActive: boolean) => {
    const key = `${stateId}-${rentalMode}`
    setSavingKey(key)
    try {
      await adminApiFetch("/api/admin/location-pricing", {
        method: "PATCH",
        body: JSON.stringify({ action: "toggle-coverage", carId: selectedCarId, stateId, rentalMode, isActive: nextActive }),
      })
      await fetchData()
    } finally {
      setSavingKey("")
    }
  }

  if (loading && !data) {
    return <AdminLayout><div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div></AdminLayout>
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controlled Location Pricing</h1>
          <p className="text-gray-600">Manage Lagos/Abuja zones, surcharges, car coverage, and 12h/24h rates.</p>
        </div>

        <Card className="rounded-3xl">
          <CardContent className="grid gap-4 p-6 md:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label>Car</Label>
              <select className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm" value={selectedCarId} onChange={(event) => setSelectedCarId(event.target.value)}>
                {data?.cars.map((car) => <option key={String(car.id)} value={String(car.id)}>{String(car.name || `${car.brand} ${car.model}`)}</option>)}
              </select>
            </div>
            <div className="rounded-2xl bg-slate-50 px-5 py-3 text-sm">
              <p className="text-gray-500">Fallback daily rate</p>
              <p className="font-bold text-gray-900">{formatMoney(Number(selectedCar?.price_per_day || 0))}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader><CardTitle>Car coverage</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data?.states.map((state) => {
              const activeWithin = selectedCoverage.some((item) => item.state_id === state.id && item.rental_mode === "within_state" && item.is_active !== false)
              const activeInterstate = selectedCoverage.some((item) => item.state_id === state.id && item.rental_mode === "interstate" && item.is_active !== false)
              return (
                <div key={String(state.id)} className="rounded-2xl border p-4">
                  <div className="mb-3 flex items-center justify-between"><strong>{String(state.name)}</strong>{state.is_auto_priced ? <Badge>Auto</Badge> : <Badge variant="outline">Quote</Badge>}</div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant={activeWithin ? "default" : "outline"} onClick={() => toggleCoverage(String(state.id), "within_state", !activeWithin)} disabled={savingKey === `${state.id}-within_state`}>Within state</Button>
                    <Button size="sm" variant={activeInterstate ? "default" : "outline"} onClick={() => toggleCoverage(String(state.id), "interstate", !activeInterstate)} disabled={savingKey === `${state.id}-interstate`}>Interstate</Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {data?.states.filter((state) => state.is_auto_priced).map((state) => (
            <Card key={String(state.id)} className="rounded-3xl">
              <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />{String(state.name)} zones and rates</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {data.zones.filter((zone) => zone.state_id === state.id).map((zone) => (
                  <div key={String(zone.id)} className="rounded-2xl border border-gray-200 p-4">
                    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div><h3 className="font-semibold text-gray-900">{String(zone.name)}</h3><p className="text-sm text-gray-500">{String(zone.description || "")}</p></div>
                      {zone.is_extension ? <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Extension area</Badge> : <Badge variant="outline">Standard</Badge>}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {["12h", "24h"].map((timingPackage) => {
                        const rate = getRate(String(zone.id), timingPackage)
                        const key = `${zone.id}-${timingPackage}`
                        return (
                          <div key={key} className="flex items-end gap-2 rounded-xl bg-gray-50 p-3">
                            <div className="flex-1"><Label>{timingPackage} base price</Label><Input value={rateDrafts[key] ?? String(rate?.base_price || "")} onChange={(event) => setRateDrafts((current) => ({ ...current, [key]: event.target.value }))} /></div>
                            <Button onClick={() => saveRate(String(state.id), String(zone.id), timingPackage as "12h" | "24h")} disabled={savingKey === key}><Save className="h-4 w-4" /></Button>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {((zone.service_areas || []) as Row[]).map((area) => (
                        <div key={String(area.id)} className="flex items-end gap-2 rounded-xl border p-3">
                          <div className="flex-1"><Label>{String(area.name)} surcharge</Label><Input value={areaDrafts[String(area.id)] ?? String(area.surcharge_amount || 0)} onChange={(event) => setAreaDrafts((current) => ({ ...current, [String(area.id)]: event.target.value }))} /></div>
                          <Button variant="outline" onClick={() => saveArea(area)} disabled={savingKey === area.id}><Save className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}