"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { Car, Edit, Loader2, Plus, Search } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAdminCars } from "@/lib/hooks/useApi"
import { useRealtimeInvalidation } from "@/lib/hooks/useRealtimeInvalidation"
import { formatNumber } from "@/lib/formatters"

export default function AdminCarsPage() {
  const [search, setSearch] = useState("")
  const { data: cars = [], isLoading, error } = useAdminCars(search)

  useRealtimeInvalidation("admin-cars-live", ["cars", "car_locations"], [["adminCars"], ["cars"]])

  const stats = useMemo(() => {
    const active = cars.filter((car) => car.status === "active").length
    const available = cars.filter((car) => car.is_available).length
    const maintenance = cars.filter((car) => car.status === "maintenance").length

    return { total: cars.length, active, available, maintenance }
  }, [cars])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Cars</h1>
            <p className="text-sm text-slate-600">Live fleet data from Supabase. Search, edit, and monitor availability without using mock records.</p>
          </div>
          <Button asChild className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
            <Link href="/admin/cars/add">
              <Plus className="mr-2 h-4 w-4" />
              Add car
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Total cars", stats.total],
            ["Active", stats.active],
            ["Available", stats.available],
            ["Maintenance", stats.maintenance],
          ].map(([label, value]) => (
            <Card key={String(label)} className="rounded-[24px] border-slate-200">
              <CardContent className="flex items-center gap-3 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Car className="h-5 w-5" />
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
                placeholder="Search by name, brand, model, location, or status"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-[28px] border border-slate-200 bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
          </div>
        ) : null}

        {error ? (
          <Card className="rounded-[28px] border-red-200 bg-red-50">
            <CardContent className="p-6 text-sm text-red-700">
              {error instanceof Error ? error.message : "Unable to load cars."}
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cars.map((car) => (
            <Card key={car.id} className="overflow-hidden rounded-[28px] border-slate-200">
              <div className="relative h-56 bg-slate-100">
                <Image
                  src={car.primaryImage || car.images?.[0] || "/Carsectionui/toyota-innova.jpg"}
                  alt={car.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute left-3 top-3 flex gap-2">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900">{car.status}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${car.is_available ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {car.is_available ? "Available" : "Blocked"}
                  </span>
                </div>
              </div>
              <CardContent className="space-y-4 p-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">{car.year} {car.brand} {car.model}</h2>
                  <p className="text-sm text-slate-500">{car.location}</p>
                </div>
                <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <div className="rounded-[18px] bg-slate-50 px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Daily rate</p>
                    <p className="mt-1 font-semibold text-slate-950">NGN {formatNumber(car.price_per_day)}</p>
                  </div>
                  <div className="rounded-[18px] bg-slate-50 px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Specs</p>
                    <p className="mt-1 font-semibold text-slate-950">{car.seats} seats • {car.transmission}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button asChild variant="outline" className="flex-1 rounded-2xl">
                    <Link href={`/car-info/${car.id}`}>View live</Link>
                  </Button>
                  <Button asChild className="flex-1 rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
                    <Link href={`/admin/cars/${car.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}

