"use client"

import Image from "next/image"
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react"
import { ImagePlus, Loader2, Plus, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { uploadMultipleImages } from "@/lib/image-upload"
import type { Database } from "@/lib/supabase"

type Jet = Database["public"]["Tables"]["jets"]["Row"]
type JetPayload = Database["public"]["Tables"]["jets"]["Insert"]

type JetFormState = {
  name: string
  manufacturer: string
  model: string
  year: number
  price_per_hour: number
  price_per_day: number
  capacity: number
  range: number
  max_speed: number
  description: string
  location: string
  is_available: boolean
  status: "active" | "maintenance" | "inactive" | "out_of_service" | "reserved"
}

const defaultState: JetFormState = {
  name: "",
  manufacturer: "",
  model: "",
  year: new Date().getFullYear(),
  price_per_hour: 500000,
  price_per_day: 5000000,
  capacity: 8,
  range: 5000,
  max_speed: 800,
  description: "",
  location: "Lagos, Nigeria",
  is_available: true,
  status: "active",
}

export function JetForm({
  initialJet,
  submitLabel,
  onSubmit,
}: {
  initialJet?: Jet | null
  submitLabel: string
  onSubmit: (payload: JetPayload) => Promise<void>
}) {
  const uploadRef = useRef<HTMLInputElement | null>(null)
  const [formData, setFormData] = useState<JetFormState>(() => initialJet ? {
    name: initialJet.name,
    manufacturer: initialJet.manufacturer,
    model: initialJet.model,
    year: initialJet.year,
    price_per_hour: initialJet.price_per_hour,
    price_per_day: initialJet.price_per_day,
    capacity: initialJet.capacity,
    range: initialJet.range,
    max_speed: initialJet.max_speed,
    description: initialJet.description,
    location: initialJet.location,
    is_available: initialJet.is_available,
    status: initialJet.status,
  } : defaultState)
  const [images, setImages] = useState<string[]>(initialJet?.images || [])
  const [features, setFeatures] = useState<string[]>(initialJet?.features || [])
  const [newFeature, setNewFeature] = useState("")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const primaryImage = useMemo(() => images[0], [images])

  const updateField = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target
    setFormData((current) => ({
      ...current,
      [name]: type === "number" ? Number(value) : type === "checkbox" ? (event.target as HTMLInputElement).checked : value,
    }))
  }

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    setUploading(true)
    setMessage(null)
    try {
      const uploaded = await uploadMultipleImages(files, "jets")
      if (!uploaded.length) {
        throw new Error("No images were uploaded")
      }
      setImages((current) => [...current, ...uploaded])
      setMessage({ type: "success", text: `${uploaded.length} jet image${uploaded.length === 1 ? "" : "s"} uploaded.` })
    } catch (error) {
      console.error("Error uploading jet images:", error)
      setMessage({ type: "error", text: "Image upload failed. Please try again." })
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  const addFeature = () => {
    const value = newFeature.trim()
    if (!value || features.includes(value)) return
    setFeatures((current) => [...current, value])
    setNewFeature("")
  }

  const removeImage = (image: string) => {
    setImages((current) => current.filter((item) => item !== image))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      await onSubmit({
        ...formData,
        features,
        images,
      })
      setMessage({ type: "success", text: "Jet saved successfully. Returning to fleet list..." })
    } catch (error) {
      console.error("Error saving jet:", error)
      setMessage({ type: "error", text: "Unable to save this jet. Please check the details and try again." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
          {message.text}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <Card>
          <CardHeader><CardTitle>Jet Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Jet Name" name="name" value={formData.name} onChange={updateField} placeholder="Gulfstream G650ER" />
              <Field label="Manufacturer" name="manufacturer" value={formData.manufacturer} onChange={updateField} placeholder="Gulfstream" />
              <Field label="Model" name="model" value={formData.model} onChange={updateField} placeholder="G650ER" />
              <Field label="Year" name="year" type="number" value={formData.year} onChange={updateField} min={1980} />
              <Field label="Base Location" name="location" value={formData.location} onChange={updateField} placeholder="Lagos, Nigeria" />
              <Field label="Passenger Capacity" name="capacity" type="number" value={formData.capacity} onChange={updateField} min={1} />
              <Field label="Price Per Hour (NGN)" name="price_per_hour" type="number" value={formData.price_per_hour} onChange={updateField} min={0} />
              <Field label="Price Per Day (NGN)" name="price_per_day" type="number" value={formData.price_per_day} onChange={updateField} min={0} />
              <Field label="Range (km)" name="range" type="number" value={formData.range} onChange={updateField} min={0} />
              <Field label="Max Speed (km/h)" name="max_speed" type="number" value={formData.max_speed} onChange={updateField} min={0} />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={updateField} rows={5} placeholder="Cabin, comfort, range, and charter suitability..." required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" value={formData.status} onChange={updateField} className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_service">Out of Service</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
              <label className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium">
                <input type="checkbox" name="is_available" checked={formData.is_available} onChange={updateField} /> Show as available on website
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Customer-Facing Images</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <button type="button" onClick={() => uploadRef.current?.click()} className="flex min-h-48 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50">
                {primaryImage ? <Image src={primaryImage} alt="Primary jet upload" width={420} height={220} className="mb-4 h-40 w-full rounded-2xl object-cover" /> : <ImagePlus className="mb-3 h-10 w-10 text-gray-400" />}
                <span className="font-semibold text-gray-900">Click this card to upload jet images</span>
                <span className="mt-1 text-sm text-gray-500">First image becomes the public catalog cover. Multiple images are supported.</span>
              </button>
              <input ref={uploadRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
              {uploading ? <p className="flex items-center gap-2 text-sm text-blue-600"><Loader2 className="h-4 w-4 animate-spin" /> Uploading images...</p> : null}
              {images.length ? (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((image, index) => (
                    <div key={image} className="relative h-24 overflow-hidden rounded-2xl border bg-gray-100">
                      <Image src={image} alt={`Jet upload ${index + 1}`} fill className="object-cover" />
                      <button type="button" onClick={() => removeImage(image)} className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white"><X className="h-3 w-3" /></button>
                      {index === 0 ? <span className="absolute bottom-1 left-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase">Cover</span> : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Amenities and Features</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={newFeature} onChange={(event) => setNewFeature(event.target.value)} placeholder="Wi-Fi, VIP cabin, baggage capacity..." onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addFeature() } }} />
                <Button type="button" variant="outline" onClick={addFeature}><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {features.map((feature) => (
                  <span key={feature} className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                    {feature}<button type="button" onClick={() => setFeatures((current) => current.filter((item) => item !== feature))}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={saving || uploading} className="min-w-40">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

function Field(props: {
  label: string
  name: string
  value: string | number
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  type?: string
  placeholder?: string
  min?: number
}) {
  return (
    <div>
      <Label htmlFor={props.name}>{props.label}</Label>
      <Input id={props.name} name={props.name} type={props.type || "text"} value={props.value} onChange={props.onChange} placeholder={props.placeholder} min={props.min} required />
    </div>
  )
}

