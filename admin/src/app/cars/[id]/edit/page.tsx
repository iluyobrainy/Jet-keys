"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus
} from "lucide-react"
import { useEffect, useState } from "react"
import { carService } from "@/lib/admin-services"
import { uploadMultipleImages } from "@/lib/image-upload"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { CarFeatureSelector } from "@/components/car-feature-selector"
import { LocationSelector } from "@/components/location-selector"

interface CarData {
  id: string
  name: string
  brand: string
  model: string
  year: number
  price_per_day: number
  fuel_type: string
  transmission: string
  seats: number
  mileage: number
  color: string
  location: string
  pickup_location: string | null
  images: string[]
  is_available: boolean
  status: 'active' | 'maintenance' | 'inactive' | 'out_of_service' | 'reserved'
  description?: string
  features?: string[]
}

export default function CarEditPage() {
  const params = useParams()
  const router = useRouter()
  const carId = params.id as string
  
  const [car, setCar] = useState<CarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [carFeatures, setCarFeatures] = useState<any[]>([])
  const [showFeatureSelector, setShowFeatureSelector] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price_per_day: 0,
    color: '',
    location: '',
    description: '',
    status: 'active' as 'active' | 'maintenance' | 'inactive' | 'out_of_service' | 'reserved',
    is_available: true,
    features: [] as string[],
    pickup_location: null as string | null
  })
  
  const [images, setImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [carImages, setCarImages] = useState({
    front: "",
    back: "",
    left: "",
    right: ""
  })

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const data = await carService.getCarById(carId)
        setCar(data as any)
        if (data) {
          setFormData({
            name: data.name || '',
            brand: data.brand || '',
            model: data.model || '',
            year: data.year || new Date().getFullYear(),
            price_per_day: data.price_per_day || 0,
            color: data.color || '',
            location: data.location || '',
            description: data.description || '',
            status: data.status || 'active',
            is_available: data.is_available ?? true,
            features: data.features || [],
            pickup_location: (data as any).pickup_location || null
          })
          setImages(data.images || [])
        }
        
        // Convert database features to carFeatures format for the UI
        if (data && data.features && Array.isArray(data.features)) {
          const convertedFeatures = data.features.map((feature: string) => {
            // Parse feature string (format: "label: value" or just "label")
            const parts = feature.split(': ')
            if (parts.length === 2) {
              // Text feature with value (e.g., "Doors: 4")
              return {
                label: parts[0],
                value: parts[1],
                type: 'text'
              }
            } else {
              // Boolean feature (e.g., "Air Conditioning")
              return {
                label: feature,
                value: true, // Boolean features are true when present
                type: 'boolean'
              }
            }
          })
          setCarFeatures(convertedFeatures)
        } else {
          setCarFeatures([])
        }
      } catch (error) {
        console.error('Error fetching car:', error)
      } finally {
        setLoading(false)
      }
    }

    if (carId) {
      fetchCar()
    }
  }, [carId])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'status' ? value as "active" | "maintenance" | "inactive" | "out_of_service" | "reserved" :
               value
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setNewImages(prev => [...prev, ...files])
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleCarImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, view: 'front' | 'back' | 'left' | 'right') => {
    const files = e.target.files
    if (files && files.length > 0) {
      try {
        // Upload single image to Supabase Storage
        const uploadedUrls = await uploadMultipleImages(Array.from(files))
        if (uploadedUrls.length > 0) {
          setCarImages(prev => ({
            ...prev,
            [view]: uploadedUrls[0]
          }))
        }
      } catch (error) {
        console.error('Error uploading car image:', error)
        alert('Failed to upload image. Please try again.')
      }
    }
  }

  const handleRemoveCarImage = (view: 'front' | 'back' | 'left' | 'right') => {
    setCarImages(prev => ({
      ...prev,
      [view]: ""
    }))
  }


  const handleFeatureSave = (features: any[]) => {
    setCarFeatures(features)
    setShowFeatureSelector(false)
    
    // Update form data with feature values
    const updatedFormData = { ...formData } as any
    features.forEach(feature => {
      if (['seats', 'doors', 'mileage', 'year'].includes(feature.id)) {
        updatedFormData[feature.id] = feature.value
      } else if (['fuel_type', 'transmission', 'color'].includes(feature.id)) {
        updatedFormData[feature.id] = feature.value
      }
    })
    setFormData(updatedFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let uploadedImageUrls: string[] = []
      
      // Upload new images if any
      if (newImages.length > 0) {
        uploadedImageUrls = await uploadMultipleImages(newImages, 'cars')
      }

      // Combine existing and new images with car images
      const allImages = [
        ...images, 
        ...uploadedImageUrls,
        ...Object.values(carImages).filter(img => img !== "")
      ]

      // Convert car features to the format expected by the API
      const featureStrings = carFeatures.map(f => {
        if (f.type === 'boolean' && f.value) {
          return f.label
        } else if (f.type !== 'boolean') {
          return `${f.label}: ${f.value}${f.suffix || ''}`
        }
        return null
      }).filter(Boolean)

      // Update car data
      const updatedCar = {
        ...formData,
        images: allImages,
        features: [...formData.features, ...featureStrings]
      }

      await carService.updateCar(carId, updatedCar)
      setSaveMessage({type: 'success', text: 'Car updated successfully!'})
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error updating car:', error)
      setSaveMessage({type: 'error', text: 'Failed to update car. Please try again.'})
      // Clear message after 5 seconds
      setTimeout(() => setSaveMessage(null), 5000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading car details...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!car) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Car not found</h3>
            <p className="text-gray-600 mb-4">The car you're trying to edit doesn't exist.</p>
            <Button asChild>
              <Link href="/cars">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cars
              </Link>
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href={`/cars/${carId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Car Details
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Car</h1>
              <p className="text-gray-600">{car.name}</p>
            </div>
          </div>
        </div>

        {/* Save Confirmation Message */}
        {saveMessage && (
          <div className={`p-4 rounded-lg ${
            saveMessage.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            <div className="flex items-center">
              {saveMessage.type === 'success' ? (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">{saveMessage.text}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Car Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Tesla Model Y"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="e.g., Tesla"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      placeholder="e.g., Model Y"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_per_day">Price per Day (NGN)</Label>
                    <Input
                      id="price_per_day"
                      type="number"
                      value={formData.price_per_day}
                      onChange={(e) => handleInputChange('price_per_day', parseFloat(e.target.value))}
                      min="0"
                      step="100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Lagos, Nigeria"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the car..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active - Ready and available for rental</option>
                    <option value="maintenance">Maintenance - Being serviced/repaired</option>
                    <option value="inactive">Inactive - Temporarily unavailable (not broken)</option>
                    <option value="out_of_service">Out of Service - Permanently unavailable</option>
                    <option value="reserved">Reserved - Booked for specific period</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) => handleInputChange('is_available', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="is_available">Available for rent</Label>
                </div>

                <LocationSelector
                  value={formData.pickup_location}
                  onChange={(locationId) => setFormData(prev => ({ ...prev, pickup_location: locationId }))}
                  label="Pickup Location"
                  placeholder="Select pickup location"
                />
              </CardContent>
            </Card>
          </div>

          {/* Car Features */}
          <Card>
            <CardHeader>
              <CardTitle>Car Features</CardTitle>
              <p className="text-sm text-gray-600">Select and configure features for this car</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {carFeatures.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Features ({carFeatures.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {carFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                          <span className="text-sm text-blue-800">
                            {feature.type === 'boolean' ? feature.label : `${feature.label}: ${feature.value}${feature.suffix || ''}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowFeatureSelector(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {carFeatures.length > 0 ? 'Edit Features' : 'Add Features'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Car Detail Images */}
          <Card>
            <CardHeader>
              <CardTitle>Car Detail Images</CardTitle>
              <p className="text-sm text-gray-600">Upload specific views of the car for the car-info page slider</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Front View */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Front View</Label>
                  <div className="relative">
                    {carImages.front ? (
                      <div className="relative">
                        <img 
                          src={carImages.front} 
                          alt="Front view"
                          className="aspect-video w-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCarImage('front')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Upload Front</span>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCarImageUpload(e, 'front')}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Back View */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Back View</Label>
                  <div className="relative">
                    {carImages.back ? (
                      <div className="relative">
                        <img 
                          src={carImages.back} 
                          alt="Back view"
                          className="aspect-video w-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCarImage('back')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Upload Back</span>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCarImageUpload(e, 'back')}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Left View */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Left Side</Label>
                  <div className="relative">
                    {carImages.left ? (
                      <div className="relative">
                        <img 
                          src={carImages.left} 
                          alt="Left side"
                          className="aspect-video w-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCarImage('left')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Upload Left</span>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCarImageUpload(e, 'left')}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Right View */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Right Side</Label>
                  <div className="relative">
                    {carImages.right ? (
                      <div className="relative">
                        <img 
                          src={carImages.right} 
                          alt="Right side"
                          className="aspect-video w-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCarImage('right')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Upload Right</span>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCarImageUpload(e, 'right')}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Images */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Images</CardTitle>
              <p className="text-sm text-gray-600">Upload extra images (interior, engine, etc.) for the cars listing page</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Images */}
              {images.length > 0 && (
                <div>
                  <Label>Current Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={image}
                          alt={`Car image ${index + 1}`}
                          width={200}
                          height={150}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              {newImages.length > 0 && (
                <div>
                  <Label>New Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {newImages.map((file, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`New image ${index + 1}`}
                          width={200}
                          height={150}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeNewImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              <div>
                <Label htmlFor="images">Add New Images</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  You can select multiple images at once
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href={`/cars/${carId}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Feature Selector Modal */}
        {showFeatureSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <CarFeatureSelector
                initialFeatures={carFeatures}
                onSave={handleFeatureSave}
                onCancel={() => setShowFeatureSelector(false)}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
