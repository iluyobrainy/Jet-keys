"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowRight, Gauge, Loader2, MapPin, Plane, Search, ShieldCheck, Users } from "lucide-react"
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
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,_#f8fafc_0%,_#fff7ed_42%,_#ffffff_100%)] text-slate-950">
      <Navigation />

      <main className="px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <section className="mx-auto grid max-w-7xl gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-14" aria-label="Private jet charter">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-700 shadow-sm backdrop-blur">
              Private aviation
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Charter aircraft with the same calm precision as a private concierge.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Browse available aircraft, choose the cabin that fits your journey, and send a charter request directly to the Jet & Keys operations team.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["24/7", "charter desk"],
                ["NG", "domestic routing"],
                ["Private", "flight follow-up"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                  <p className="text-2xl font-bold text-slate-950">{value}</p>
                  <p className="mt-1 text-sm text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-[38px] border border-white/70 bg-slate-950 shadow-[0_30px_90px_rgba(15,23,42,0.22)]">
            <Image src={fallbackJetImage} alt="Private jet cabin" fill priority className="object-cover opacity-90" sizes="(max-width: 1024px) 100vw, 48vw" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(15,23,42,0.8),_rgba(15,23,42,0.18)_58%,_rgba(245,158,11,0.2))]" />
            <div className="absolute bottom-5 left-5 right-5 rounded-[28px] border border-white/10 bg-white/10 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">Request-first booking</p>
              <p className="mt-2 text-xl font-semibold">Every charter request is stored for admin follow-up and continued on WhatsApp.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-6" aria-label="Jet search">
          <div className="rounded-[34px] border border-white/70 bg-white/90 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_220px_auto] lg:items-end">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Search aircraft</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by jet, manufacturer, model, or base" className="h-12 rounded-2xl border-slate-200 pl-11" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Passengers</label>
                <Input type="number" min="1" value={passengers} onChange={(event) => setPassengers(event.target.value)} placeholder="Any" className="h-12 rounded-2xl border-slate-200" />
              </div>
              <Button className="h-12 rounded-2xl bg-slate-950 px-6 text-white hover:bg-slate-800" onClick={() => void refetch()}>
                Search jets
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">Live inventory</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Available private jets</h2>
            </div>
            <p className="text-sm text-slate-500">{jets.length} aircraft currently matched.</p>
          </div>

          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-2">
              {[0, 1].map((item) => (
                <div key={item} className="h-[420px] animate-pulse rounded-[34px] border border-white/70 bg-white/80 shadow-sm" />
              ))}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[30px] border border-red-200 bg-red-50 p-6 text-red-900">
              <h3 className="font-semibold">Jet inventory could not load.</h3>
              <p className="mt-2 text-sm">Please refresh the page or try again shortly.</p>
            </div>
          ) : null}

          {!isLoading && !error && jets.length === 0 ? (
            <div className="overflow-hidden rounded-[36px] border border-dashed border-amber-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10">
              <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                <div className="relative min-h-[260px] overflow-hidden rounded-[30px] bg-slate-950">
                  <Image src={fallbackJetImage} alt="Private jet waiting for charter setup" fill className="object-cover opacity-75" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600">Concierge inventory</p>
                  <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">No active jets are published yet.</h3>
                  <p className="mt-4 max-w-2xl leading-7 text-slate-600">
                    Once the admin team uploads aircraft and marks them active, they will appear here automatically. Until then, clients can still contact operations for a tailored charter search.
                  </p>
                  <a className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]" href="https://wa.me/2349075103413" target="_blank" rel="noreferrer">
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
                <article className="overflow-hidden rounded-[34px] border border-white/70 bg-white/95 shadow-[0_22px_70px_rgba(15,23,42,0.1)] transition duration-300 group-hover:-translate-y-1">
                  <div className="relative h-64 bg-slate-100">
                    <Image src={jet.primaryImage || jet.images?.[0] || fallbackJetImage} alt={jet.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 backdrop-blur">Available</div>
                  </div>
                  <div className="space-y-5 p-5 sm:p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">{jet.manufacturer}</p>
                        <h3 className="mt-2 text-2xl font-bold text-slate-950">{jet.name || `${jet.manufacturer} ${jet.model}`}</h3>
                        <p className="mt-1 text-sm text-slate-500">{jet.model} - {jet.year}</p>
                      </div>
                      <p className="text-right text-lg font-bold text-amber-600">NGN {formatNumber(Number(jet.price_per_hour || 0))}<span className="text-sm font-medium text-slate-500"> / hour</span></p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-4">
                      <span className="rounded-2xl bg-slate-50 px-3 py-2"><Users className="mb-1 h-4 w-4" />{jet.capacity} pax</span>
                      <span className="rounded-2xl bg-slate-50 px-3 py-2"><Gauge className="mb-1 h-4 w-4" />{formatNumber(jet.range)} km</span>
                      <span className="rounded-2xl bg-slate-50 px-3 py-2"><Plane className="mb-1 h-4 w-4" />{formatNumber(jet.max_speed)} km/h</span>
                      <span className="rounded-2xl bg-slate-50 px-3 py-2"><MapPin className="mb-1 h-4 w-4" />{jet.location}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Admin-managed aircraft</div>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">View charter details <ArrowRight className="h-4 w-4" /></span>
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
