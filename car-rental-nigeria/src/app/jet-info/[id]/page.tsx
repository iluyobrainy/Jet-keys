"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { FormEvent, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Gauge, Loader2, MapPin, MessageCircle, Plane, ShieldCheck, Users } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { FooterSection } from "@/components/footer-section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCreateJetRequest, useJetDetails } from "@/lib/hooks/useApi"
import { formatNumber } from "@/lib/formatters"

const fallbackJetImage = "/Aboutusui/Airbus-int.png"

const initialForm = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  departureLocation: "",
  destination: "",
  departureDate: "",
  departureTime: "",
  returnDate: "",
  returnTime: "",
  passengers: "1",
  tripType: "one_way",
  specialRequests: "",
}

export default function JetInfoPage() {
  const params = useParams<{ id: string }>()
  const jetId = params?.id
  const { data, isLoading, error } = useJetDetails(jetId)
  const createRequest = useCreateJetRequest()
  const [form, setForm] = useState(initialForm)
  const [formError, setFormError] = useState("")
  const [success, setSuccess] = useState<{ reference: string; whatsappUrl: string } | null>(null)

  const jet = data?.jet
  const gallery = useMemo(() => {
    const images = jet?.images?.filter(Boolean) || []
    return images.length ? images : [fallbackJetImage]
  }, [jet?.images])

  const updateForm = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError("")

    if (!jetId) {
      setFormError("This aircraft could not be identified. Please return to the jet catalog and try again.")
      return
    }

    try {
      const response = await createRequest.mutateAsync({
        jetId,
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim(),
        departureLocation: form.departureLocation.trim(),
        destination: form.destination.trim(),
        departureDate: form.departureDate,
        departureTime: form.departureTime || undefined,
        returnDate: form.returnDate || undefined,
        returnTime: form.returnTime || undefined,
        passengers: Number(form.passengers),
        tripType: form.tripType,
        specialRequests: form.specialRequests.trim() || undefined,
      })

      setSuccess({
        reference: response.jetRequest.request_reference,
        whatsappUrl: response.whatsappUrl,
      })

      window.open(response.whatsappUrl, "_blank", "noopener,noreferrer")
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to submit this charter request. Please check the form and try again."
      setFormError(message)
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,_#f8fafc_0%,_#fff7ed_44%,_#ffffff_100%)] text-slate-950">
      <Navigation />

      <main className="px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/jets" className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:text-slate-950">
            <ArrowLeft className="h-4 w-4" /> Back to jets
          </Link>

          {isLoading ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="h-[520px] animate-pulse rounded-[38px] bg-white/80" />
              <div className="h-[520px] animate-pulse rounded-[38px] bg-white/80" />
            </div>
          ) : null}

          {error || (!isLoading && !jet) ? (
            <section className="mt-8 rounded-[36px] border border-amber-200 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <Plane className="mx-auto h-12 w-12 text-amber-600" />
              <h1 className="mt-4 text-3xl font-bold text-slate-950">Aircraft unavailable</h1>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">This jet may be inactive, unavailable, or no longer published. Please choose another aircraft from the live catalog.</p>
              <Button asChild className="mt-6 rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
                <Link href="/jets">View available jets</Link>
              </Button>
            </section>
          ) : null}

          {jet ? (
            <div className="mt-8 space-y-8">
              <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
                <div className="overflow-hidden rounded-[38px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
                  <div className="relative h-[360px] bg-slate-950 sm:h-[520px]">
                    <Image src={gallery[0]} alt={jet.name} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 58vw" />
                    <div className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-700 backdrop-blur">Available</div>
                  </div>
                  {gallery.length > 1 ? (
                    <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-4">
                      {gallery.slice(1, 5).map((image, index) => (
                        <div key={`${image}-${index}`} className="relative h-24 overflow-hidden rounded-2xl bg-slate-100">
                          <Image src={image} alt={`${jet.name} gallery ${index + 2}`} fill className="object-cover" sizes="25vw" />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-[38px] border border-white/70 bg-white/95 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.1)] sm:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600">Private charter</p>
                  <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{jet.name}</h1>
                  <p className="mt-2 text-slate-500">{jet.manufacturer} {jet.model} - {jet.year}</p>
                  <p className="mt-6 text-lg leading-8 text-slate-600">{jet.description}</p>

                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <Spec icon={Users} label="Passengers" value={`${jet.capacity} pax`} />
                    <Spec icon={Gauge} label="Range" value={`${formatNumber(jet.range)} km`} />
                    <Spec icon={Plane} label="Max speed" value={`${formatNumber(jet.max_speed)} km/h`} />
                    <Spec icon={MapPin} label="Base" value={jet.location} />
                  </div>

                  <div className="mt-7 rounded-[28px] bg-slate-950 p-5 text-white">
                    <p className="text-sm text-white/60">Guide rate</p>
                    <p className="mt-1 text-3xl font-bold">NGN {formatNumber(Number(jet.price_per_hour || 0))}<span className="text-base font-medium text-white/50"> / hour</span></p>
                    <p className="mt-3 text-sm leading-6 text-white/60">Jet charter pricing is request-only in this version. Operations will confirm routing, permits, aircraft readiness, and final quote.</p>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="rounded-[34px] border border-white/70 bg-white/90 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.08)]">
                  <h2 className="text-2xl font-bold text-slate-950">Amenities and notes</h2>
                  <div className="mt-5 grid gap-3">
                    {(jet.features?.length ? jet.features : ["Private cabin", "Concierge coordination", "Admin-managed availability"]).map((feature) => (
                      <div key={feature} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" /> {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[34px] border border-white/70 bg-white p-6 shadow-[0_22px_70px_rgba(15,23,42,0.1)] sm:p-7">
                  {success ? (
                    <div className="flex min-h-[520px] flex-col justify-center text-center">
                      <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
                      <h2 className="mt-4 text-3xl font-bold text-slate-950">Request received</h2>
                      <p className="mt-3 text-slate-600">Your charter reference is <span className="font-bold text-slate-950">{success.reference}</span>. Continue on WhatsApp so the operations team can follow up immediately.</p>
                      <a href={success.whatsappUrl} target="_blank" rel="noreferrer" className="mx-auto mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-emerald-600 px-6 text-sm font-semibold text-white transition hover:bg-emerald-700">
                        <MessageCircle className="mr-2 h-4 w-4" /> Continue on WhatsApp
                      </a>
                      <Button variant="outline" className="mx-auto mt-3 rounded-2xl" onClick={() => setSuccess(null)}>Send another request</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">Request charter</p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-950">Tell us the route and timing</h2>
                        <p className="mt-2 text-sm text-slate-500">No payment is taken for jets. Your request is stored in admin and handed off to WhatsApp.</p>
                      </div>

                      {formError ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{formError}</div> : null}

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input required placeholder="Customer name" value={form.customerName} onChange={(e) => updateForm("customerName", e.target.value)} className="h-12 rounded-2xl" />
                        <Input required type="email" placeholder="Email address" value={form.customerEmail} onChange={(e) => updateForm("customerEmail", e.target.value)} className="h-12 rounded-2xl" />
                        <Input required placeholder="Phone number" value={form.customerPhone} onChange={(e) => updateForm("customerPhone", e.target.value)} className="h-12 rounded-2xl" />
                        <Input required type="number" min="1" placeholder="Passengers" value={form.passengers} onChange={(e) => updateForm("passengers", e.target.value)} className="h-12 rounded-2xl" />
                        <Input required placeholder="Departure location" value={form.departureLocation} onChange={(e) => updateForm("departureLocation", e.target.value)} className="h-12 rounded-2xl" />
                        <Input required placeholder="Destination" value={form.destination} onChange={(e) => updateForm("destination", e.target.value)} className="h-12 rounded-2xl" />
                        <Input required type="date" value={form.departureDate} onChange={(e) => updateForm("departureDate", e.target.value)} className="h-12 rounded-2xl" />
                        <Input type="time" value={form.departureTime} onChange={(e) => updateForm("departureTime", e.target.value)} className="h-12 rounded-2xl" />
                        <Input type="date" value={form.returnDate} onChange={(e) => updateForm("returnDate", e.target.value)} className="h-12 rounded-2xl" />
                        <Input type="time" value={form.returnTime} onChange={(e) => updateForm("returnTime", e.target.value)} className="h-12 rounded-2xl" />
                      </div>

                      <select value={form.tripType} onChange={(e) => updateForm("tripType", e.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-900">
                        <option value="one_way">One way</option>
                        <option value="round_trip">Round trip</option>
                        <option value="multi_city">Multi-city</option>
                      </select>

                      <Textarea placeholder="Special requests, luggage notes, timing flexibility, or VIP handling details" value={form.specialRequests} onChange={(e) => updateForm("specialRequests", e.target.value)} rows={4} className="rounded-2xl" />

                      <Button type="submit" disabled={createRequest.isPending} className="h-12 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
                        {createRequest.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarDays className="mr-2 h-4 w-4" />}
                        Submit charter request
                      </Button>
                    </form>
                  )}
                </div>
              </section>

              {data?.relatedJets?.length ? (
                <section className="space-y-4">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">Nearby fleet</p>
                      <h2 className="mt-1 text-2xl font-bold text-slate-950">Other aircraft to consider</h2>
                    </div>
                    <Link href="/jets" className="hidden items-center gap-2 text-sm font-semibold text-slate-700 sm:inline-flex">View all <ArrowRight className="h-4 w-4" /></Link>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {data.relatedJets.map((related) => (
                      <Link key={related.id} href={`/jet-info/${related.id}`} className="rounded-[28px] border border-white/70 bg-white p-4 shadow-sm transition hover:-translate-y-1">
                        <div className="relative h-44 overflow-hidden rounded-2xl bg-slate-100">
                          <Image src={related.primaryImage || related.images?.[0] || fallbackJetImage} alt={related.name} fill className="object-cover" />
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-slate-950">{related.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">{related.capacity} pax - {related.location}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}
        </div>
      </main>

      <FooterSection />
    </div>
  )
}

function Spec({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-slate-50 p-4">
      <Icon className="h-5 w-5 text-amber-600" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}

