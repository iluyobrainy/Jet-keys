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
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-zinc-950">
      <Navigation />

      <main className="px-4 pb-14 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/jets" className="inline-flex h-10 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950 active:scale-[0.98]">
            <ArrowLeft className="h-4 w-4" /> Back to jets
          </Link>

          {isLoading ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="h-[500px] animate-pulse rounded-[2rem] bg-zinc-100" />
              <div className="h-[500px] animate-pulse rounded-[2rem] bg-zinc-100" />
            </div>
          ) : null}

          {error || (!isLoading && !jet) ? (
            <section className="mt-6 rounded-[2rem] border border-zinc-200 bg-white p-8 text-center">
              <Plane className="mx-auto h-10 w-10 text-zinc-500" />
              <h1 className="mt-4 text-2xl font-medium tracking-tight text-zinc-950">Aircraft unavailable</h1>
              <p className="mx-auto mt-3 max-w-xl text-zinc-600">This jet may be inactive, unavailable, or no longer published. Please choose another aircraft from the live catalog.</p>
              <Button asChild className="mt-6 rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800">
                <Link href="/jets">View available jets</Link>
              </Button>
            </section>
          ) : null}

          {jet ? (
            <div className="mt-6 space-y-8">
              <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                <div className="space-y-3">
                  <div className="relative h-[360px] overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-100 sm:h-[520px]">
                    <Image src={gallery[0]} alt={jet.name} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 58vw" />
                    <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-700 backdrop-blur">Available</div>
                  </div>
                  {gallery.length > 1 ? (
                    <div className="grid grid-cols-4 gap-3">
                      {gallery.slice(1, 5).map((image, index) => (
                        <div key={`${image}-${index}`} className="relative h-20 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 sm:h-28">
                          <Image src={image} alt={`${jet.name} gallery ${index + 2}`} fill className="object-cover" sizes="25vw" />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 sm:p-7">
                  <div className="border-b border-zinc-200 pb-6">
                    <p className="text-sm font-medium text-zinc-500">{jet.manufacturer} {jet.model} - {jet.year}</p>
                    <h1 className="mt-2 text-3xl font-medium leading-tight tracking-[-0.035em] text-zinc-950 sm:text-4xl">{jet.name}</h1>
                    <p className="mt-4 whitespace-pre-line text-base leading-7 text-zinc-600">{jet.description}</p>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Spec icon={Users} label="Passengers" value={`${jet.capacity} pax`} />
                    <Spec icon={Gauge} label="Range" value={`${formatNumber(jet.range)} km`} />
                    <Spec icon={Plane} label="Max speed" value={`${formatNumber(jet.max_speed)} km/h`} />
                    <Spec icon={MapPin} label="Base" value={jet.location} />
                  </div>

                  <div className="mt-6 rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-5">
                    <p className="text-sm font-medium text-zinc-500">Guide rate</p>
                    <p className="mt-1 text-2xl font-medium tracking-tight text-zinc-950">NGN {formatNumber(Number(jet.price_per_hour || 0))}<span className="text-base font-normal text-zinc-500"> / hour</span></p>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">Jet charter is request-only. Operations confirms routing, permits, readiness, and final quote before booking.</p>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
                <div className="rounded-[2rem] border border-zinc-200 bg-white p-6">
                  <h2 className="text-xl font-medium tracking-tight text-zinc-950">Amenities and notes</h2>
                  <div className="mt-5 grid gap-3">
                    {(jet.features?.length ? jet.features : ["Private cabin", "Concierge coordination", "Admin-managed availability"]).map((feature) => (
                      <div key={feature} className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" /> {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 sm:p-7">
                  {success ? (
                    <div className="flex min-h-[500px] flex-col justify-center text-center">
                      <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                      <h2 className="mt-4 text-2xl font-medium tracking-tight text-zinc-950">Request received</h2>
                      <p className="mx-auto mt-3 max-w-lg text-zinc-600">Your charter reference is <span className="font-semibold text-zinc-950">{success.reference}</span>. Continue on WhatsApp so operations can follow up immediately.</p>
                      <a href={success.whatsappUrl} target="_blank" rel="noreferrer" className="mx-auto mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-medium text-white transition hover:bg-emerald-700 active:scale-[0.98]">
                        <MessageCircle className="mr-2 h-4 w-4" /> Continue on WhatsApp
                      </a>
                      <Button variant="outline" className="mx-auto mt-3 rounded-2xl" onClick={() => setSuccess(null)}>Send another request</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="border-b border-zinc-200 pb-5">
                        <h2 className="text-2xl font-medium tracking-tight text-zinc-950">Request this charter</h2>
                        <p className="mt-2 text-sm leading-6 text-zinc-500">No payment is taken for jets. Your request is stored in admin and handed off to WhatsApp.</p>
                      </div>

                      {formError ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{formError}</div> : null}

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="Customer name"><Input required value={form.customerName} onChange={(e) => updateForm("customerName", e.target.value)} className="h-11 rounded-2xl border-zinc-200" /></FormField>
                        <FormField label="Email address"><Input required type="email" value={form.customerEmail} onChange={(e) => updateForm("customerEmail", e.target.value)} className="h-11 rounded-2xl border-zinc-200" /></FormField>
                        <FormField label="Phone number"><Input required value={form.customerPhone} onChange={(e) => updateForm("customerPhone", e.target.value)} className="h-11 rounded-2xl border-zinc-200" /></FormField>
                        <FormField label="Passengers"><Input required type="number" min="1" value={form.passengers} onChange={(e) => updateForm("passengers", e.target.value)} className="h-11 rounded-2xl border-zinc-200" /></FormField>
                        <FormField label="Departure location"><Input required value={form.departureLocation} onChange={(e) => updateForm("departureLocation", e.target.value)} className="h-11 rounded-2xl border-zinc-200" /></FormField>
                        <FormField label="Destination"><Input required value={form.destination} onChange={(e) => updateForm("destination", e.target.value)} className="h-11 rounded-2xl border-zinc-200" /></FormField>
                        <FormField label="Departure date"><Input required type="date" value={form.departureDate} onChange={(e) => updateForm("departureDate", e.target.value)} className="h-11 rounded-2xl border-zinc-200" /></FormField>
                        <FormField label="Departure time"><Input type="time" value={form.departureTime} onChange={(e) => updateForm("departureTime", e.target.value)} className="h-11 rounded-2xl border-zinc-200" /></FormField>
                        <FormField label="Return date"><Input type="date" value={form.returnDate} onChange={(e) => updateForm("returnDate", e.target.value)} className="h-11 rounded-2xl border-zinc-200" /></FormField>
                        <FormField label="Return time"><Input type="time" value={form.returnTime} onChange={(e) => updateForm("returnTime", e.target.value)} className="h-11 rounded-2xl border-zinc-200" /></FormField>
                      </div>

                      <FormField label="Trip type">
                        <select value={form.tripType} onChange={(e) => updateForm("tripType", e.target.value)} className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-zinc-900">
                          <option value="one_way">One way</option>
                          <option value="round_trip">Round trip</option>
                          <option value="multi_city">Multi-city</option>
                        </select>
                      </FormField>

                      <FormField label="Special requests">
                        <Textarea value={form.specialRequests} onChange={(e) => updateForm("specialRequests", e.target.value)} rows={4} className="rounded-2xl border-zinc-200" placeholder="Luggage, flexibility, VIP handling, or route notes" />
                      </FormField>

                      <Button type="submit" disabled={createRequest.isPending} className="h-12 w-full rounded-2xl bg-zinc-950 font-medium text-white hover:bg-zinc-800 active:scale-[0.98]">
                        {createRequest.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarDays className="mr-2 h-4 w-4" />}
                        Submit charter request
                      </Button>
                    </form>
                  )}
                </div>
              </section>

              {data?.relatedJets?.length ? (
                <section className="space-y-4 border-t border-zinc-200 pt-8">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-medium tracking-tight text-zinc-950">Other aircraft to consider</h2>
                      <p className="mt-1 text-sm text-zinc-500">A few more active jets from the fleet.</p>
                    </div>
                    <Link href="/jets" className="hidden items-center gap-2 text-sm font-medium text-zinc-700 sm:inline-flex">View all <ArrowRight className="h-4 w-4" /></Link>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {data.relatedJets.map((related) => (
                      <Link key={related.id} href={`/jet-info/${related.id}`} className="rounded-[1.75rem] border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-[0_20px_50px_-38px_rgba(24,24,27,0.5)] active:scale-[0.99]">
                        <div className="relative h-44 overflow-hidden rounded-[1.25rem] bg-zinc-100">
                          <Image src={related.primaryImage || related.images?.[0] || fallbackJetImage} alt={related.name} fill className="object-cover" />
                        </div>
                        <h3 className="mt-4 text-lg font-medium tracking-tight text-zinc-950">{related.name}</h3>
                        <p className="mt-1 text-sm text-zinc-500">{related.capacity} pax - {related.location}</p>
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
    <div className="rounded-[1.25rem] bg-zinc-50 p-4">
      <Icon className="h-5 w-5 text-zinc-500" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-zinc-800">{value}</p>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</span>
      {children}
    </label>
  )
}
