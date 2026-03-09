"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Fuel,
  Heart,
  Loader2,
  MapPin,
  Shield,
  Star,
  Users,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { FooterSection } from "@/components/footer-section"
import { CarFeaturesDisplay } from "@/components/car-features-display"
import { DatePickerWithTime } from "@/components/date-picker-with-time"
import { LocationPicker } from "@/components/location-picker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RentalValidation } from "@/components/ui/rental-validation"
import { formatDate, formatNumber } from "@/lib/formatters"
import { useBookingPersistence } from "@/lib/hooks/useBookingPersistence"
import {
  useBookings,
  useCarDetails,
  useCheckoutSettings,
  useCreateReview,
  usePricing,
  useReviews,
} from "@/lib/hooks/useApi"
import { useRentalValidation } from "@/lib/hooks/useRentalValidation"
import { useAuth } from "@/lib/providers/AuthProvider"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function CarInfoPage() {
  const params = useParams()
  const router = useRouter()
  const carId = String(params.id)
  const { isAuthenticated } = useAuth()
  const { data: carDetails, isLoading, error } = useCarDetails(carId)
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(carId)
  const { data: checkoutSettings } = useCheckoutSettings()
  const { data: userBookings = [] } = useBookings("user", { enabled: isAuthenticated })
  const createReviewMutation = useCreateReview()
  const { formData, updateField } = useBookingPersistence(carId)

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewContent, setReviewContent] = useState("")
  const [reviewError, setReviewError] = useState("")

  const car = carDetails?.car
  const allowedLocations = carDetails?.allowedLocations || []
  const nearbyCars = carDetails?.nearbyCars || []

  const gallery = useMemo(() => {
    if (!car) {
      return ["/Carsectionui/toyota-innova.jpg"]
    }

    const images = [car.primaryImage, ...(car.images || [])].filter(Boolean) as string[]
    return images.length ? Array.from(new Set(images)) : ["/Carsectionui/toyota-innova.jpg"]
  }, [car])

  const rentalValidation = useRentalValidation(
    formData.pickupDate ?? null,
    formData.dropoffDate ?? null,
    formData.pickupTime ?? undefined,
    formData.dropoffTime ?? undefined,
  )

  const billableDays = Math.max(1, Math.ceil(Math.max(rentalValidation.hours, 0) / 24))
  const { data: pricing } = usePricing(car || null, billableDays)

  const featureCards = useMemo(() => {
    if (!car) {
      return []
    }

    const baseFeatures = [
      { id: "seats", value: car.seats, label: "Seats", icon: "seats", type: "number" as const },
      { id: "doors", value: car.doors, label: "Doors", icon: "doors", type: "number" as const },
      { id: "mileage", value: car.mileage, label: "Mileage", icon: "mileage", type: "number" as const, suffix: "km" },
      { id: "fuel_type", value: car.fuel_type, label: "Fuel Type", icon: "fuel_type", type: "text" as const },
      { id: "transmission", value: car.transmission, label: "Transmission", icon: "transmission", type: "text" as const },
      { id: "year", value: car.year, label: "Year", icon: "year", type: "number" as const },
      { id: "color", value: car.color, label: "Color", icon: "color", type: "text" as const },
    ]

    const parsedExtras = (car.features || [])
      .map((feature) => {
        if (!feature) {
          return null
        }

        if (feature.includes(":")) {
          const [label, value] = feature.split(":").map((item) => item.trim())
          return {
            id: label.toLowerCase().replace(/\s+/g, "_"),
            value,
            label,
            icon: label.toLowerCase().replace(/\s+/g, "_"),
            type: "text" as const,
          }
        }

        return {
          id: feature.toLowerCase().replace(/\s+/g, "_"),
          value: true,
          label: feature,
          icon: feature.toLowerCase().replace(/\s+/g, "_"),
          type: "boolean" as const,
        }
      })
      .filter(Boolean)

    return [...baseFeatures, ...parsedExtras]
  }, [car])

  const eligibleReviewBookings = useMemo(
    () =>
      userBookings.filter((booking) => booking.car_id === carId && booking.status === "completed"),
    [carId, userBookings],
  )

  const alreadyReviewedBookingIds = new Set((reviews || []).map((review) => String((review as { booking_id?: string }).booking_id || "")))
  const nextReviewBooking = eligibleReviewBookings.find((booking) => !alreadyReviewedBookingIds.has(String(booking.id)))

  const handleBooking = () => {
    if (!formData.pickupLocation || !formData.dropoffLocation || !formData.pickupDate || !formData.dropoffDate) {
      window.alert("Complete the pickup and return details before continuing.")
      return
    }

    if (!rentalValidation.canBook) {
      window.alert(rentalValidation.errors.join("\n"))
      return
    }

    const nextPath = `/checkout?carId=${carId}`

    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(nextPath)}`)
      return
    }

    router.push(nextPath)
  }

  const handleReviewSubmit = async () => {
    if (!nextReviewBooking) {
      setReviewError("A completed booking is required before a review can be submitted.")
      return
    }

    if (!reviewContent.trim()) {
      setReviewError("Write a short review before submitting.")
      return
    }

    try {
      setReviewError("")
      await createReviewMutation.mutateAsync({
        carId,
        bookingId: nextReviewBooking.id,
        rating: reviewRating,
        title: reviewTitle,
        content: reviewContent,
      })
      setReviewTitle("")
      setReviewContent("")
      setReviewRating(5)
    } catch (submissionError) {
      setReviewError(submissionError instanceof Error ? submissionError.message : "Failed to submit review.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-slate-900" />
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-24">
          <Card className="w-full rounded-[32px] border-white/70 bg-white/95 text-center shadow-sm">
            <CardContent className="space-y-5 p-10">
              <h1 className="text-3xl font-bold text-slate-950">Car not found</h1>
              <p className="text-sm text-slate-600">The selected car is unavailable or no longer exists in the fleet.</p>
              <Button asChild className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
                <Link href="/cars">Back to cars</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <FooterSection />
      </div>
    )
  }

  const selectedImage = gallery[Math.min(selectedImageIndex, gallery.length - 1)]

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_30%,_#ffffff_100%)]">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Button variant="outline" className="rounded-2xl border-slate-200" onClick={() => router.push("/cars")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to cars
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200"
            onClick={() => setIsLiked((current) => !current)}
          >
            <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : "text-slate-700"}`} />
            Save
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <Card className="overflow-hidden rounded-[32px] border-white/70 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.1)]">
              <CardContent className="space-y-5 p-4 sm:p-6">
                <div className="relative h-[260px] overflow-hidden rounded-[26px] bg-slate-100 sm:h-[420px]">
                  <Image src={selectedImage} alt={car.name} fill className="object-cover" />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {gallery.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`relative h-20 overflow-hidden rounded-[18px] border ${selectedImageIndex === index ? "border-slate-950" : "border-slate-200"}`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <Image src={image} alt={`${car.name} ${index + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-white/70 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <CardContent className="space-y-6 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">Car details</p>
                      <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">{car.year} {car.brand} {car.model}</h1>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5"><MapPin className="h-4 w-4" />{car.location}</span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5"><Users className="h-4 w-4" />{car.seats} seats</span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5"><Fuel className="h-4 w-4" />{car.fuel_type}</span>
                    </div>
                  </div>
                  <div className="rounded-[24px] bg-slate-950 px-5 py-4 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Daily rate</p>
                    <p className="mt-2 text-3xl font-bold">NGN {formatNumber(car.price_per_day)}</p>
                  </div>
                </div>

                <p className="text-base leading-7 text-slate-600">{car.description}</p>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[24px] bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Transmission</p>
                    <p className="mt-2 font-semibold text-slate-950">{car.transmission}</p>
                  </div>
                  <div className="rounded-[24px] bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Mileage</p>
                    <p className="mt-2 font-semibold text-slate-950">{formatNumber(car.mileage)} km</p>
                  </div>
                  <div className="rounded-[24px] bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Doors</p>
                    <p className="mt-2 font-semibold text-slate-950">{car.doors}</p>
                  </div>
                  <div className="rounded-[24px] bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Status</p>
                    <p className="mt-2 font-semibold text-emerald-700">Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-white/70 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-950">Features</CardTitle>
              </CardHeader>
              <CardContent>
                <CarFeaturesDisplay features={featureCards} />
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-white/70 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-950">Customer reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {reviewsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="rounded-[24px] border border-slate-200 p-5">
                        <div className="mb-3 h-4 w-40 animate-pulse rounded bg-slate-200"></div>
                        <div className="space-y-2">
                          <div className="h-3 w-full animate-pulse rounded bg-slate-100"></div>
                          <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {!reviewsLoading && reviews.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-slate-200 p-6 text-sm text-slate-600">
                    No reviews yet. Completed bookings for this car can leave the first review.
                  </div>
                ) : null}

                {!reviewsLoading && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => {
                      const reviewName = String((review as { bookings?: { customer_name?: string } }).bookings?.customer_name || "Jet & Keys Customer")
                      return (
                        <div key={String((review as { id?: string }).id || reviewName)} className="rounded-[26px] border border-slate-200 bg-white p-5">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                              {getInitials(reviewName)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <h3 className="font-semibold text-slate-950">{reviewName}</h3>
                                  <p className="text-sm text-slate-500">{formatDate(String((review as { created_at?: string }).created_at || new Date().toISOString()))}</p>
                                </div>
                                <div className="flex items-center gap-1 text-amber-500">
                                  {Array.from({ length: 5 }).map((_, index) => (
                                    <Star
                                      key={index}
                                      className={`h-4 w-4 ${index < Number((review as { rating?: number }).rating || 0) ? "fill-current" : "text-slate-200"}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              {(review as { title?: string }).title ? (
                                <p className="mt-3 font-semibold text-slate-900">{String((review as { title?: string }).title)}</p>
                              ) : null}
                              <p className="mt-2 text-sm leading-6 text-slate-600">{String((review as { content?: string }).content || "")}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : null}

                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">Write a review</h3>
                      <p className="text-sm text-slate-600">Reviews are available to customers with completed bookings for this car.</p>
                    </div>
                    <Shield className="h-5 w-5 shrink-0 text-slate-500" />
                  </div>

                  {isAuthenticated && nextReviewBooking ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="reviewTitle">Review title</Label>
                          <Input id="reviewTitle" value={reviewTitle} onChange={(event) => setReviewTitle(event.target.value)} placeholder="Short headline" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reviewRating">Rating</Label>
                          <select
                            id="reviewRating"
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            value={reviewRating}
                            onChange={(event) => setReviewRating(Number(event.target.value))}
                          >
                            {[5, 4, 3, 2, 1].map((value) => (
                              <option key={value} value={value}>{value} star{value === 1 ? "" : "s"}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reviewContent">Your review</Label>
                        <Textarea
                          id="reviewContent"
                          value={reviewContent}
                          onChange={(event) => setReviewContent(event.target.value)}
                          placeholder="Tell future renters how the car and service were."
                          className="min-h-28 rounded-2xl"
                        />
                      </div>
                      {reviewError ? <p className="text-sm text-red-600">{reviewError}</p> : null}
                      <Button className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800" onClick={handleReviewSubmit} disabled={createReviewMutation.isPending}>
                        {createReviewMutation.isPending ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting review...</>
                        ) : (
                          "Submit review"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-600">
                      {isAuthenticated
                        ? "Your next completed booking for this car will unlock the review form here."
                        : "Sign in after completing a rental to post a verified review."}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-white/70 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-950">Other cars nearby</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {nearbyCars.map((nearbyCar) => (
                    <Link key={nearbyCar.id} href={`/car-info/${nearbyCar.id}`} className="group block">
                      <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white transition-transform duration-300 group-hover:-translate-y-1">
                        <div className="relative h-44 bg-slate-100">
                          <Image
                            src={nearbyCar.primaryImage || nearbyCar.images?.[0] || "/Carsectionui/toyota-innova.jpg"}
                            alt={nearbyCar.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-3 p-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-950">{nearbyCar.year} {nearbyCar.brand} {nearbyCar.model}</h3>
                            <p className="text-sm text-slate-500">{nearbyCar.location}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                            <span className="rounded-full bg-slate-100 px-3 py-1">{nearbyCar.seats} seats</span>
                            <span className="rounded-full bg-slate-100 px-3 py-1">{nearbyCar.transmission}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-amber-600">NGN {formatNumber(Number(nearbyCar.price_per_day || 0))}</p>
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">View car <ArrowRight className="h-4 w-4" /></span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card className="rounded-[32px] border-white/70 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.1)]">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-950">Reserve this car</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pickup location</label>
                    <LocationPicker
                      value={formData.pickupLocation}
                      onChange={(value) => updateField("pickupLocation", value)}
                      placeholder="Select pickup location"
                      allowedLocations={allowedLocations.map((location) => location.label)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Return location</label>
                    <LocationPicker
                      value={formData.dropoffLocation}
                      onChange={(value) => updateField("dropoffLocation", value)}
                      placeholder="Select return location"
                      allowedLocations={allowedLocations.map((location) => location.label)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pickup date and time</label>
                    <DatePickerWithTime
                      value={formData.pickupDate}
                      timeValue={formData.pickupTime}
                      onChange={(value) => updateField("pickupDate", value)}
                      onTimeChange={(value) => updateField("pickupTime", value)}
                      placeholder="Select pickup date"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Return date and time</label>
                    <DatePickerWithTime
                      value={formData.dropoffDate}
                      timeValue={formData.dropoffTime}
                      onChange={(value) => updateField("dropoffDate", value)}
                      onTimeChange={(value) => updateField("dropoffTime", value)}
                      placeholder="Select return date"
                    />
                  </div>
                </div>

                <RentalValidation
                  isValid={rentalValidation.isValid}
                  errors={rentalValidation.errors}
                  warnings={rentalValidation.warnings}
                  days={billableDays}
                  hours={rentalValidation.hours}
                  canBook={rentalValidation.canBook}
                  checkoutSettings={{
                    minimum_rental_hours: checkoutSettings?.minimum_rental_hours || 4,
                    maximum_rental_days: checkoutSettings?.maximum_rental_days || 30,
                    advance_booking_days: checkoutSettings?.advance_booking_days || 7,
                  }}
                />

                <div className="rounded-[26px] bg-slate-950 p-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Estimated total</p>
                  <p className="mt-2 text-3xl font-bold">NGN {formatNumber(pricing?.grandTotal || 0)}</p>
                  <div className="mt-4 grid gap-3 text-sm text-white/80">
                    <div className="flex items-center justify-between">
                      <span>Billable days</span>
                      <span>{billableDays}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Base price</span>
                      <span>NGN {formatNumber(pricing?.basePrice || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Delivery fee</span>
                      <span>NGN {formatNumber(pricing?.deliveryFee || 0)}</span>
                    </div>
                  </div>
                </div>

                <Button className="h-14 w-full rounded-2xl bg-amber-400 font-semibold text-slate-950 hover:bg-amber-300" onClick={handleBooking}>
                  Continue to checkout
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-white/70 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-950">Fleet support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[24px] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Assigned team</p>
                  <p className="mt-2 font-semibold text-slate-950">Jet & Keys Operations</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Once payment is verified, the booking moves to the fulfilment queue and the operations team prepares pickup and delivery logistics.</p>
                </div>
                <div className="rounded-[24px] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Allowed locations</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {allowedLocations.length > 0 ? allowedLocations.map((location) => (
                      <span key={location.id} className="rounded-full bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm">{location.label}</span>
                    )) : <span className="text-sm text-slate-600">{car.location}</span>}
                  </div>
                </div>
                <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <div className="mb-2 flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    Payment and booking flow
                  </div>
                  Choose dates, continue to checkout, pay with Paystack, and receive the completion screen. Admin fulfilment starts only after payment verification.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  )
}

