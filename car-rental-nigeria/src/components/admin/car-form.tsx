"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateCar, useLocations, useUpdateCar, useUploadCarImages } from "@/lib/hooks/useApi"

type CarFormProps = {
  mode: "create" | "edit"
  carId?: string
  initialCar?: CarFormSeed | null
  initialLocationIds?: string[]
}

type CarFormSeed = {
  name?: string
  brand?: string
  model?: string
  year?: number
  body_type?: string | null
  price_per_day?: number
  price_per_week?: number | null
  price_per_month?: number | null
  fuel_type?: string
  transmission?: string
  seats?: number
  doors?: number
  mileage?: number
  color?: string
  description?: string
  location?: string
  status?: string
  is_available?: boolean
  supports_delivery?: boolean | null
  supports_pickup_by_host?: boolean | null
  supports_one_way_trip?: boolean | null
  unlimited_mileage?: boolean | null
  instant_book?: boolean | null
  features?: string[]
  primaryImage?: string
  primary_image_url?: string | null
  images?: string[]
}

type FormState = {
  name: string
  brand: string
  model: string
  year: string
  bodyType: string
  pricePerDay: string
  pricePerWeek: string
  pricePerMonth: string
  fuelType: string
  transmission: string
  seats: string
  doors: string
  mileage: string
  color: string
  description: string
  location: string
  status: string
  isAvailable: boolean
  supportsDelivery: boolean
  supportsPickupByHost: boolean
  supportsOneWayTrip: boolean
  unlimitedMileage: boolean
  instantBook: boolean
  features: string
}

function mapCarToFormState(car?: CarFormSeed | null): FormState {
  return {
    name: car?.name || "",
    brand: car?.brand || "",
    model: car?.model || "",
    year: String(car?.year || ""),
    bodyType: car?.body_type || "",
    pricePerDay: String(car?.price_per_day || ""),
    pricePerWeek: String(car?.price_per_week || ""),
    pricePerMonth: String(car?.price_per_month || ""),
    fuelType: car?.fuel_type || "petrol",
    transmission: car?.transmission || "automatic",
    seats: String(car?.seats || ""),
    doors: String(car?.doors || ""),
    mileage: String(car?.mileage || ""),
    color: car?.color || "",
    description: car?.description || "",
    location: car?.location || "",
    status: car?.status || "active",
    isAvailable: Boolean(car?.is_available ?? true),
    supportsDelivery: Boolean(car?.supports_delivery),
    supportsPickupByHost: Boolean(car?.supports_pickup_by_host),
    supportsOneWayTrip: Boolean(car?.supports_one_way_trip),
    unlimitedMileage: Boolean(car?.unlimited_mileage),
    instantBook: Boolean(car?.instant_book),
    features: Array.isArray(car?.features) ? car.features.join("\n") : "",
  }
}

function normalizeNumber(value: string) {
  if (!value.trim()) {
    return null
  }

  return Number(value)
}

export function AdminCarForm({ mode, carId, initialCar, initialLocationIds = [] }: CarFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(() => mapCarToFormState(initialCar))
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>(initialLocationIds)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const { data: locations = [], isLoading: locationsLoading } = useLocations()
  const createCarMutation = useCreateCar()
  const updateCarMutation = useUpdateCar()
  const uploadImagesMutation = useUploadCarImages()

  const existingPrimaryImage = useMemo(
    () => initialCar?.primaryImage || initialCar?.primary_image_url || initialCar?.images?.[0] || "",
    [initialCar],
  )
  const existingGalleryImages = useMemo(() => {
    const images = Array.isArray(initialCar?.images) ? initialCar.images : []
    return existingPrimaryImage ? images.filter((image: string) => image !== existingPrimaryImage) : images
  }, [existingPrimaryImage, initialCar])

  const isSubmitting = createCarMutation.isPending || updateCarMutation.isPending || uploadImagesMutation.isPending

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const toggleLocation = (locationId: string) => {
    setSelectedLocationIds((current) =>
      current.includes(locationId) ? current.filter((item) => item !== locationId) : [...current, locationId],
    )
  }

  const parseFeatures = () =>
    form.features
      .split(/\n|,/)
      .map((feature) => feature.trim())
      .filter(Boolean)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage("")

    try {
      let primaryImageUrl = existingPrimaryImage || null
      let uploadedGalleryUrls: string[] = []

      if (coverFile) {
        const coverUpload = await uploadImagesMutation.mutateAsync([coverFile])
        primaryImageUrl = coverUpload.images[0]
      }

      if (galleryFiles.length > 0) {
        const galleryUpload = await uploadImagesMutation.mutateAsync(galleryFiles)
        uploadedGalleryUrls = galleryUpload.images
      }

      const imageSet = new Set<string>()
      if (primaryImageUrl) {
        imageSet.add(primaryImageUrl)
      }
      existingGalleryImages.forEach((image: string) => imageSet.add(image))
      uploadedGalleryUrls.forEach((image) => imageSet.add(image))

      const payload = {
        name: form.name,
        brand: form.brand,
        model: form.model,
        year: Number(form.year),
        body_type: form.bodyType || null,
        price_per_day: Number(form.pricePerDay),
        price_per_week: normalizeNumber(form.pricePerWeek),
        price_per_month: normalizeNumber(form.pricePerMonth),
        fuel_type: form.fuelType,
        transmission: form.transmission,
        seats: Number(form.seats),
        doors: Number(form.doors),
        mileage: Number(form.mileage),
        color: form.color,
        description: form.description,
        location: form.location,
        status: form.status,
        is_available: form.isAvailable,
        supports_delivery: form.supportsDelivery,
        supports_pickup_by_host: form.supportsPickupByHost,
        supports_one_way_trip: form.supportsOneWayTrip,
        unlimited_mileage: form.unlimitedMileage,
        instant_book: form.instantBook,
        features: parseFeatures(),
        primary_image_url: primaryImageUrl,
        images: Array.from(imageSet),
        locationIds: selectedLocationIds,
      }

      if (mode === "create") {
        await createCarMutation.mutateAsync(payload)
      } else if (carId) {
        await updateCarMutation.mutateAsync({ id: carId, payload })
      }

      setDialogOpen(true)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save car.")
    }
  }

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <Card className="rounded-[28px] border-slate-200">
          <CardHeader>
            <CardTitle>Frontend image and gallery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <label className="block cursor-pointer rounded-[26px] border border-dashed border-slate-300 bg-slate-50 p-5 transition-colors hover:border-slate-950 hover:bg-slate-100">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
                />
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">Frontend picture</p>
                    <p className="text-sm text-slate-600">Click the card to upload the main customer-facing image.</p>
                  </div>
                </div>
                <div className="mt-4 rounded-[20px] bg-white p-3 text-sm text-slate-600 shadow-sm">
                  {coverFile ? coverFile.name : existingPrimaryImage ? "Current primary image loaded" : "No primary image selected yet"}
                </div>
              </label>

              <label className="block cursor-pointer rounded-[26px] border border-dashed border-slate-300 bg-slate-50 p-5 transition-colors hover:border-slate-950 hover:bg-slate-100">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => setGalleryFiles(Array.from(event.target.files || []))}
                />
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">Additional details</p>
                    <p className="text-sm text-slate-600">Upload as many gallery images as you want for the car details page.</p>
                  </div>
                </div>
                <div className="mt-4 rounded-[20px] bg-white p-3 text-sm text-slate-600 shadow-sm">
                  {galleryFiles.length > 0
                    ? `${galleryFiles.length} new gallery image${galleryFiles.length === 1 ? "" : "s"} selected`
                    : existingGalleryImages.length > 0
                      ? `${existingGalleryImages.length} existing gallery image${existingGalleryImages.length === 1 ? "" : "s"}`
                      : "No additional images selected yet"}
                </div>
              </label>
            </div>

            {(existingPrimaryImage || existingGalleryImages.length > 0) && (
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {[existingPrimaryImage, ...existingGalleryImages].filter(Boolean).map((image) => (
                  <div key={image} className="relative h-32 overflow-hidden rounded-[20px] bg-slate-100">
                    <Image src={image} alt="Car image" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200">
          <CardHeader>
            <CardTitle>Basic information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2"><Label htmlFor="name">Car name</Label><Input id="name" value={form.name} onChange={(event) => updateField("name", event.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="brand">Brand</Label><Input id="brand" value={form.brand} onChange={(event) => updateField("brand", event.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="model">Model</Label><Input id="model" value={form.model} onChange={(event) => updateField("model", event.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="year">Year</Label><Input id="year" type="number" value={form.year} onChange={(event) => updateField("year", event.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="bodyType">Body type</Label><Input id="bodyType" value={form.bodyType} onChange={(event) => updateField("bodyType", event.target.value)} placeholder="SUV, Sedan, Van" /></div>
            <div className="space-y-2"><Label htmlFor="location">Base location</Label><Input id="location" value={form.location} onChange={(event) => updateField("location", event.target.value)} required /></div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(event) => updateField("status", event.target.value)}>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuelType">Fuel type</Label>
              <select id="fuelType" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.fuelType} onChange={(event) => updateField("fuelType", event.target.value)}>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transmission">Transmission</Label>
              <select id="transmission" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.transmission} onChange={(event) => updateField("transmission", event.target.value)}>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200">
          <CardHeader>
            <CardTitle>Pricing and specs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2"><Label htmlFor="pricePerDay">Price per day (NGN)</Label><Input id="pricePerDay" type="number" value={form.pricePerDay} onChange={(event) => updateField("pricePerDay", event.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="pricePerWeek">Price per week (NGN)</Label><Input id="pricePerWeek" type="number" value={form.pricePerWeek} onChange={(event) => updateField("pricePerWeek", event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="pricePerMonth">Price per month (NGN)</Label><Input id="pricePerMonth" type="number" value={form.pricePerMonth} onChange={(event) => updateField("pricePerMonth", event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="seats">Seats</Label><Input id="seats" type="number" value={form.seats} onChange={(event) => updateField("seats", event.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="doors">Doors</Label><Input id="doors" type="number" value={form.doors} onChange={(event) => updateField("doors", event.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="mileage">Mileage (km)</Label><Input id="mileage" type="number" value={form.mileage} onChange={(event) => updateField("mileage", event.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="color">Color</Label><Input id="color" value={form.color} onChange={(event) => updateField("color", event.target.value)} required /></div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200">
          <CardHeader>
            <CardTitle>Description and features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" className="min-h-32 rounded-2xl" value={form.description} onChange={(event) => updateField("description", event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">Features</Label>
              <Textarea
                id="features"
                className="min-h-36 rounded-2xl"
                value={form.features}
                onChange={(event) => updateField("features", event.target.value)}
                placeholder="GPS Navigation&#10;Air Conditioning&#10;Apple CarPlay&#10;Premium Sound System"
              />
              <p className="text-sm text-slate-500">Use one feature per line or separate features with commas.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200">
          <CardHeader>
            <CardTitle>Service configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[
                ["Available for booking", "isAvailable"],
                ["Supports delivery", "supportsDelivery"],
                ["Supports pickup by host", "supportsPickupByHost"],
                ["Supports one-way trip", "supportsOneWayTrip"],
                ["Unlimited mileage", "unlimitedMileage"],
                ["Instant book", "instantBook"],
              ].map(([label, key]) => (
                <label key={key} className="flex items-center justify-between rounded-[20px] border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={Boolean(form[key as keyof FormState])}
                    onChange={(event) => updateField(key as keyof FormState, event.target.checked as never)}
                  />
                </label>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-slate-950">Allowed locations</h3>
                <p className="text-sm text-slate-500">Only the locations checked here will appear during checkout for this car.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {locationsLoading ? (
                  <div className="text-sm text-slate-500">Loading locations...</div>
                ) : (
                  locations.map((location) => (
                    <label key={String(location.id)} className="flex items-center justify-between rounded-[20px] border border-slate-200 px-4 py-3 text-sm text-slate-700">
                      <span>{String(location.name)}, {String(location.city)}</span>
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selectedLocationIds.includes(String(location.id))}
                        onChange={() => toggleLocation(String(location.id))}
                      />
                    </label>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {errorMessage ? <p className="rounded-[20px] bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="rounded-2xl" onClick={() => router.push("/admin/cars")}>Cancel</Button>
          <Button type="submit" className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : mode === "create" ? "Create car" : "Save changes"}
          </Button>
        </div>
      </form>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) {
          router.push("/admin/cars")
        }
      }}>
        <DialogContent className="rounded-[28px] border-white/80 bg-white p-8 text-center sm:max-w-md" showCloseButton={false}>
          <DialogHeader className="items-center text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <DialogTitle className="text-2xl">{mode === "create" ? "Car created" : "Changes saved"}</DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "The car is now live in your fleet and you are being returned to the cars page."
                : "The updated car details have been saved and you are being returned to the cars page."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="justify-center">
            <Button className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800" onClick={() => router.push("/admin/cars")}>Back to cars</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

