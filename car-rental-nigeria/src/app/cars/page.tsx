"use client"

import Image from "next/image"
import Link from "next/link"
import { Suspense, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Loader2, MapPin, Search, SlidersHorizontal, Users } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { FooterSection } from "@/components/footer-section"
import { DatePickerWithTime } from "@/components/date-picker-with-time"
import { LocationPicker } from "@/components/location-picker"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCarsCatalog } from "@/lib/hooks/useApi"
import { formatNumber } from "@/lib/formatters"

type SearchState = {
  pickupLocation: string
  dropoffLocation: string
  pickupDate?: Date
  dropoffDate?: Date
  pickupTime: string | null
  dropoffTime: string | null
  bodyType: string
  fuelType: string
  transmission: string
  seats: string
  minPrice: string
  maxPrice: string
}

const STORAGE_KEY = "jet-keys-cars-search"

const defaultSearchState: SearchState = {
  pickupLocation: "",
  dropoffLocation: "",
  pickupDate: undefined,
  dropoffDate: undefined,
  pickupTime: "10:00",
  dropoffTime: "10:00",
  bodyType: "",
  fuelType: "",
  transmission: "",
  seats: "",
  minPrice: "",
  maxPrice: "",
}

function mapSearchParams(searchParams: URLSearchParams): Partial<SearchState> {
  return {
    pickupLocation: searchParams.get("pickupLocation") || "",
    dropoffLocation: searchParams.get("dropoffLocation") || "",
    pickupDate: searchParams.get("pickupDate") ? new Date(searchParams.get("pickupDate") as string) : undefined,
    dropoffDate: searchParams.get("dropoffDate") ? new Date(searchParams.get("dropoffDate") as string) : undefined,
    pickupTime: searchParams.get("pickupTime") || "10:00",
    dropoffTime: searchParams.get("dropoffTime") || "10:00",
    bodyType: searchParams.get("bodyType") || "",
    fuelType: searchParams.get("fuelType") || "",
    transmission: searchParams.get("transmission") || "",
    seats: searchParams.get("seats") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  }
}

function CarsPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [hydrated, setHydrated] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchState, setSearchState] = useState<SearchState>(defaultSearchState)

  useEffect(() => {
    const queryValues = mapSearchParams(new URLSearchParams(searchParams.toString()))
    const hasQueryValues = Array.from(searchParams.keys()).length > 0

    if (hasQueryValues) {
      setSearchState((current) => ({ ...current, ...queryValues }))
      setHydrated(true)
      return
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, string | undefined>
        setSearchState({
          ...defaultSearchState,
          pickupLocation: parsed.pickupLocation || "",
          dropoffLocation: parsed.dropoffLocation || "",
          pickupDate: parsed.pickupDate ? new Date(parsed.pickupDate) : undefined,
          dropoffDate: parsed.dropoffDate ? new Date(parsed.dropoffDate) : undefined,
          pickupTime: parsed.pickupTime || "10:00",
          dropoffTime: parsed.dropoffTime || "10:00",
          bodyType: parsed.bodyType || "",
          fuelType: parsed.fuelType || "",
          transmission: parsed.transmission || "",
          seats: parsed.seats || "",
          minPrice: parsed.minPrice || "",
          maxPrice: parsed.maxPrice || "",
        })
      }
    } catch {
      // Ignore malformed local state.
    }

    setHydrated(true)
  }, [searchParams])

  useEffect(() => {
    if (!hydrated) {
      return
    }

    const payload = {
      ...searchState,
      pickupDate: searchState.pickupDate?.toISOString(),
      dropoffDate: searchState.dropoffDate?.toISOString(),
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [hydrated, searchState])

  const queryFilters = useMemo(
    () => ({
      pickupLocation: searchState.pickupLocation || undefined,
      dropoffLocation: searchState.dropoffLocation || undefined,
      pickupDate: searchState.pickupDate?.toISOString(),
      dropoffDate: searchState.dropoffDate?.toISOString(),
      bodyType: searchState.bodyType || undefined,
      fuelType: searchState.fuelType || undefined,
      transmission: searchState.transmission || undefined,
      seats: searchState.seats ? Number(searchState.seats) : undefined,
      minPrice: searchState.minPrice ? Number(searchState.minPrice) : undefined,
      maxPrice: searchState.maxPrice ? Number(searchState.maxPrice) : undefined,
    }),
    [searchState],
  )

  const { data, isLoading, error, refetch } = useCarsCatalog(queryFilters)

  const applySearchToUrl = () => {
    const params = new URLSearchParams()

    Object.entries({
      pickupLocation: searchState.pickupLocation,
      dropoffLocation: searchState.dropoffLocation,
      pickupDate: searchState.pickupDate?.toISOString(),
      dropoffDate: searchState.dropoffDate?.toISOString(),
      pickupTime: searchState.pickupTime,
      dropoffTime: searchState.dropoffTime,
      bodyType: searchState.bodyType,
      fuelType: searchState.fuelType,
      transmission: searchState.transmission,
      seats: searchState.seats,
      minPrice: searchState.minPrice,
      maxPrice: searchState.maxPrice,
    }).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value))
      }
    })

    router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname)
  }

  const resetSearch = () => {
    setSearchState(defaultSearchState)
    window.localStorage.removeItem(STORAGE_KEY)
    router.replace(pathname)
  }

  const updateState = <K extends keyof SearchState>(key: K, value: SearchState[K]) => {
    setSearchState((current) => ({ ...current, [key]: value }))
  }

  const cars = data?.cars || []
  const popularCars = data?.popularCars || []
  const activeFiltersCount = Object.values(queryFilters).filter(Boolean).length

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_36%,_#ffffff_100%)]">
      <Navigation />

      <section className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <Card className="overflow-hidden rounded-[32px] border-white/70 bg-white/90 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
            <CardContent className="p-5 sm:p-6 lg:p-8">
              <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600">Car discovery</p>
                  <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Find the right car for the exact route and dates you need.</h1>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeFiltersCount} active filter{activeFiltersCount === 1 ? "" : "s"}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pickup location</label>
                  <LocationPicker
                    value={searchState.pickupLocation}
                    onChange={(value) => updateState("pickupLocation", value)}
                    placeholder="Select pickup location"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Return location</label>
                  <LocationPicker
                    value={searchState.dropoffLocation}
                    onChange={(value) => updateState("dropoffLocation", value)}
                    placeholder="Select return location"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pickup date and time</label>
                  <DatePickerWithTime
                    value={searchState.pickupDate}
                    timeValue={searchState.pickupTime}
                    onChange={(value) => updateState("pickupDate", value)}
                    onTimeChange={(value) => updateState("pickupTime", value)}
                    placeholder="Choose pickup slot"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Return date and time</label>
                  <DatePickerWithTime
                    value={searchState.dropoffDate}
                    timeValue={searchState.dropoffTime}
                    onChange={(value) => updateState("dropoffDate", value)}
                    onTimeChange={(value) => updateState("dropoffTime", value)}
                    placeholder="Choose return slot"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 lg:grid-cols-[1fr_auto] lg:items-start">
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="h-11 rounded-2xl border-slate-200 px-4 lg:hidden"
                    onClick={() => setFiltersOpen((current) => !current)}
                  >
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    {filtersOpen ? "Hide filters" : "More filters"}
                  </Button>

                  <div className={`${filtersOpen ? "grid" : "hidden"} gap-4 md:grid-cols-2 xl:grid xl:grid-cols-3`}>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Body type</label>
                      <select
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        value={searchState.bodyType}
                        onChange={(event) => updateState("bodyType", event.target.value)}
                      >
                        <option value="">All body types</option>
                        {(data?.filters.bodyTypes || []).map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Fuel type</label>
                      <select
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        value={searchState.fuelType}
                        onChange={(event) => updateState("fuelType", event.target.value)}
                      >
                        <option value="">All fuel types</option>
                        {(data?.filters.fuelTypes || []).map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Transmission</label>
                      <select
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        value={searchState.transmission}
                        onChange={(event) => updateState("transmission", event.target.value)}
                      >
                        <option value="">All transmissions</option>
                        {(data?.filters.transmissions || []).map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Minimum seats</label>
                      <select
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        value={searchState.seats}
                        onChange={(event) => updateState("seats", event.target.value)}
                      >
                        <option value="">Any seating</option>
                        {(data?.filters.seats || []).map((option) => (
                          <option key={option} value={String(option)}>{option} seats</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Min price</label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="h-12 rounded-2xl border-slate-200"
                        value={searchState.minPrice}
                        onChange={(event) => updateState("minPrice", event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Max price</label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="500000"
                        className="h-12 rounded-2xl border-slate-200"
                        value={searchState.maxPrice}
                        onChange={(event) => updateState("maxPrice", event.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:w-[220px]">
                  <Button className="h-12 rounded-2xl bg-slate-950 text-white hover:bg-slate-800" onClick={applySearchToUrl}>
                    <Search className="mr-2 h-4 w-4" />
                    Search cars
                  </Button>
                  <Button variant="outline" className="h-12 rounded-2xl border-slate-200" onClick={resetSearch}>
                    Reset filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">Daily rotation</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">Popular vehicles</h2>
              </div>
              <p className="text-sm text-slate-500">Picks refresh automatically every day.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {popularCars.map((car) => (
                <Link key={car.id} href={`/car-info/${car.id}`} className="group block">
                  <Card className="overflow-hidden rounded-[30px] border-white/70 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.1)] transition-transform duration-300 group-hover:-translate-y-1">
                    <CardContent className="grid gap-4 p-4 sm:grid-cols-[220px_1fr] sm:p-5">
                      <div className="relative h-48 overflow-hidden rounded-[24px] bg-slate-100 sm:h-full">
                        <Image
                          src={car.primaryImage || car.images?.[0] || "/Carsectionui/toyota-innova.jpg"}
                          alt={car.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Featured today</p>
                          <h3 className="mt-2 text-xl font-bold text-slate-950">{car.year} {car.brand} {car.model}</h3>
                          <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                            <span className="rounded-full bg-slate-100 px-3 py-1">{car.transmission}</span>
                            <span className="rounded-full bg-slate-100 px-3 py-1">{car.seats} seats</span>
                            <span className="rounded-full bg-slate-100 px-3 py-1">{car.fuel_type}</span>
                          </div>
                        </div>
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <MapPin className="h-4 w-4" />
                              <span>{car.allowedLocations?.slice(0, 2).join(" • ") || car.location}</span>
                            </div>
                            <p className="mt-2 text-2xl font-bold text-amber-600">NGN {formatNumber(car.price_per_day)}<span className="text-sm font-medium text-slate-500"> / day</span></p>
                          </div>
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                            Choose car
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          <section className="space-y-4 pb-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">Live inventory</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">Available cars</h2>
              </div>
              <p className="text-sm text-slate-500">{cars.length} result{cars.length === 1 ? "" : "s"} matched your current search.</p>
            </div>

            {isLoading && !hydrated ? (
              <div className="flex min-h-[260px] items-center justify-center rounded-[32px] border border-white/70 bg-white/90 shadow-sm">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading cars...
                </div>
              </div>
            ) : null}

            {error ? (
              <Card className="rounded-[30px] border-red-200 bg-red-50">
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-red-900">Unable to load cars</h3>
                    <p className="text-sm text-red-700">{error instanceof Error ? error.message : "Something went wrong."}</p>
                  </div>
                  <Button variant="outline" className="rounded-2xl border-red-200 bg-white" onClick={() => refetch()}>
                    Try again
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {!isLoading && !error && cars.length === 0 ? (
              <Card className="rounded-[30px] border-white/70 bg-white/95 shadow-sm">
                <CardContent className="p-10 text-center">
                  <h3 className="text-2xl font-bold text-slate-950">No cars matched this search</h3>
                  <p className="mt-3 text-sm text-slate-600">Adjust the location, dates, or filters to expand the available fleet.</p>
                  <Button className="mt-6 rounded-2xl bg-slate-950 text-white hover:bg-slate-800" onClick={resetSearch}>
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {cars.map((car) => (
                <Link key={car.id} href={`/car-info/${car.id}`} className="group block">
                  <Card className="h-full overflow-hidden rounded-[30px] border-white/70 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-transform duration-300 group-hover:-translate-y-1">
                    <CardContent className="flex h-full flex-col p-4">
                      <div className="relative h-56 overflow-hidden rounded-[24px] bg-slate-100">
                        <Image
                          src={car.primaryImage || car.images?.[0] || "/Carsectionui/toyota-innova.jpg"}
                          alt={car.name}
                          fill
                          className="object-cover"
                        />
                        {car.body_type ? (
                          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900">
                            {car.body_type}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-1 flex-col gap-4 pt-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-950">{car.year} {car.brand} {car.model}</h3>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" />{car.seats} seats</span>
                            <span>{car.transmission}</span>
                            <span>{car.fuel_type}</span>
                          </div>
                        </div>

                        <div className="rounded-[22px] bg-slate-50 p-4 text-sm text-slate-600">
                          <div className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 text-slate-500" />
                            <div className="space-y-1">
                              {(car.allowedLocations?.length ? car.allowedLocations : [car.location]).slice(0, 3).map((location) => (
                                <p key={`${car.id}-${location}`}>{location}</p>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                          <div className="rounded-2xl border border-slate-200 px-3 py-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Daily rate</p>
                            <p className="mt-1 font-semibold text-slate-950">NGN {formatNumber(car.price_per_day)}</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 px-3 py-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Availability</p>
                            <p className="mt-1 font-semibold text-emerald-700">Ready to book</p>
                          </div>
                        </div>

                        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                          <p className="text-sm text-slate-500">Tap to view details and continue.</p>
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
                            Choose car
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>

      <FooterSection />
    </div>
  )
}

export default function CarsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
        </div>
      }
    >
      <CarsPageContent />
    </Suspense>
  )
}

