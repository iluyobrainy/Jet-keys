"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowRight, Gauge, MapPin, Plane, Search, ShieldCheck, Users } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { FooterSection } from "@/components/footer-section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useJetsCatalog } from "@/lib/hooks/useApi"
import { formatNumber } from "@/lib/formatters"

const fallbackJetImage = "/Aboutusui/Airbus-int.png"

export default function JetsPage() {
  const [search, setSearch] = useState("")
  const [passengers, setPassengers] = useState("")
  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      passengers: passengers ? Number(passengers) : undefined,
    }),
    [search, passengers],
  )
  const { data, isLoading, error, refetch } = useJetsCatalog(filters)
  const jets = data?.jets || []

  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-zinc-950">
      <Navigation />

      <main className="px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <section className="mx-auto grid max-w-7xl gap-8 border-b border-zinc-200 pb-10 pt-4 lg:grid-cols-[0.92fr_1.08fr] lg:items-end lg:pb-14" aria-label="Private jet charter">
          <div className="max-w-2xl space-y-5">
            <h1 className="text-[2.35rem] font-medium leading-[1.05] tracking-[-0.045em] text-zinc-950 sm:text-5xl lg:text-[3.6rem]">
              Private jet charter, handled with clear human follow-up.
            </h1>
            <p className="max-w-xl text-base font-normal leading-7 text-zinc-600 sm:text-lg">
              Choose an available aircraft, send your route and timing, then continue the request with the Jet & Keys team on WhatsApp.
            </p>
            <div className="grid max-w-xl grid-cols-3 divide-x divide-zinc-200 border-y border-zinc-200 py-4">
              {[
                ["24/7", "Charter desk"],
                ["Live", "Admin fleet"],
                ["WA", "Fast handoff"],
              ].map(([value, label]) => (
                <div key={label} className="px-3 first:pl-0 last:pr-0">
                  <p className="text-xl font-medium tracking-tight text-zinc-950">{value}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[300px] overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-100 sm:min-h-[420px] lg:min-h-[500px]">
            <Image src={fallbackJetImage} alt="Private jet cabin" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 56vw" />
            <div className="absolute inset-x-4 bottom-4 rounded-[1.5rem] border border-white/45 bg-white/88 p-4 shadow-[0_18px_45px_-30px_rgba(24,24,27,0.45)] backdrop-blur-md sm:inset-x-6 sm:bottom-6 sm:p-5">
              <p className="text-sm font-medium text-zinc-950">Request-only booking for jets</p>
              <p className="mt-1 text-sm leading-6 text-zinc-600">No Paystack charge is taken for aircraft. Every request lands in admin with a reference and WhatsApp follow-up.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-7 pt-8" aria-label="Jet search">
          <div className="rounded-[1.75rem] border border-zinc-200 bg-white p-4 shadow-[0_20px_50px_-35px_rgba(24,24,27,0.45)] sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_200px_auto] lg:items-end">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Search aircraft</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Jet, manufacturer, model, or base" className="h-12 rounded-2xl border-zinc-200 bg-white pl-11 text-zinc-900" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Passengers</label>
                <Input type="number" min="1" value={passengers} onChange={(event) => setPassengers(event.target.value)} placeholder="Any" className="h-12 rounded-2xl border-zinc-200 bg-white" />
              </div>
              <Button className="h-12 rounded-2xl bg-zinc-950 px-6 font-medium text-white hover:bg-zinc-800 active:scale-[0.98]" onClick={() => void refetch()}>
                Search jets
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-medium tracking-[-0.025em] text-zinc-950 sm:text-3xl">Available private jets</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">Published aircraft from the admin fleet, filtered by active availability.</p>
            </div>
            <p className="text-sm text-zinc-500">{jets.length} aircraft matched</p>
          </div>

          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-2">
              {[0, 1].map((item) => (
                <div key={item} className="h-[390px] animate-pulse rounded-[1.75rem] border border-zinc-200 bg-zinc-50" />
              ))}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-6 text-red-900">
              <h3 className="font-semibold">Jet inventory could not load.</h3>
              <p className="mt-2 text-sm">Please refresh the page or try again shortly.</p>
            </div>
          ) : null}

          {!isLoading && !error && jets.length === 0 ? (
            <div className="overflow-hidden rounded-[2rem] border border-dashed border-zinc-300 bg-white p-6 sm:p-8">
              <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                <div className="relative min-h-[240px] overflow-hidden rounded-[1.5rem] bg-zinc-100">
                  <Image src={fallbackJetImage} alt="Private jet waiting for charter setup" fill className="object-cover opacity-90" />
                </div>
                <div>
                  <h3 className="text-2xl font-medium tracking-tight text-zinc-950">No active jets are published yet.</h3>
                  <p className="mt-3 max-w-2xl leading-7 text-zinc-600">
                    Once the admin team uploads aircraft and marks them active, they will appear here automatically. Until then, clients can contact operations for a tailored charter search.
                  </p>
                  <a className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-[0.98]" href="https://wa.me/2349075103413" target="_blank" rel="noreferrer">
                    Contact charter desk
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            {jets.map((jet) => (
              <Link key={jet.id} href={`/jet-info/${jet.id}`} className="group block">
                <article className="overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white transition duration-300 hover:border-zinc-300 hover:shadow-[0_24px_60px_-42px_rgba(24,24,27,0.55)] active:scale-[0.99]">
                  <div className="relative h-60 bg-zinc-100 sm:h-72">
                    <Image src={jet.primaryImage || jet.images?.[0] || fallbackJetImage} alt={jet.name} fill className="object-cover transition duration-500 group-hover:scale-[1.025]" sizes="(max-width: 768px) 100vw, 50vw" />
                    <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-700 backdrop-blur">Available</div>
                  </div>
                  <div className="space-y-5 p-5 sm:p-6">
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{jet.manufacturer}</p>
                        <h3 className="mt-1 text-xl font-medium tracking-tight text-zinc-950 sm:text-2xl">{jet.name || `${jet.manufacturer} ${jet.model}`}</h3>
                        <p className="mt-1 text-sm text-zinc-500">{jet.model} - {jet.year}</p>
                      </div>
                      <p className="text-left text-base font-medium text-zinc-950 sm:text-right">NGN {formatNumber(Number(jet.price_per_hour || 0))}<span className="block text-sm font-normal text-zinc-500">per hour</span></p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-zinc-600 sm:grid-cols-4">
                      <SpecChip icon={Users} value={`${jet.capacity} pax`} />
                      <SpecChip icon={Gauge} value={`${formatNumber(jet.range)} km`} />
                      <SpecChip icon={Plane} value={`${formatNumber(jet.max_speed)} km/h`} />
                      <SpecChip icon={MapPin} value={jet.location} />
                    </div>
                    <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                      <div className="flex items-center gap-2 text-sm text-zinc-500"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Admin-managed aircraft</div>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-950">View details <ArrowRight className="h-4 w-4" /></span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  )
}

function SpecChip({ icon: Icon, value }: { icon: typeof Users; value: string }) {
  return (
    <span className="min-w-0 rounded-2xl bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
      <Icon className="mb-1 h-4 w-4 text-zinc-500" />
      <span className="block truncate">{value}</span>
    </span>
  )
}
