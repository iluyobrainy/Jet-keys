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
import { useState } from "react"
import { carService } from "@/lib/admin-services"
import { uploadMultipleImages } from "@/lib/image-upload"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CarFeatureSelector } from "@/components/car-feature-selector"
import { LocationSelector } from "@/components/location-selector"

export default function AddCarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [carImages, setCarImages] = useState({
    front: "",
    back: "",
    left: "",
    right: ""
  })
  const [features, setFeatures] = useState<string[]>([])
  const [newFeature, setNewFeature] = useState("")
  const [carFeatures, setCarFeatures] = useState<any[]>([])
  const [showFeatureSelector, setShowFeatureSelector] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  
  const [formData, setFormData] = useState<Record<string, any>>({
    name: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    price_per_day: 150000,
    price_per_week: 1000000,
    price_per_month: 4000000,
    color: "",
    description: "",
    location: "",
    pickup_location: null, // UUID of specific pickup location, null means any location
    is_available: true,
    status: "active" as "active" | "maintenance" | "inactive" | "out_of_service" | "reserved"
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : 
               type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               name === 'status' ? value as "active" | "maintenance" | "inactive" | "out_of_service" | "reserved" :
               value
    }))
  }

  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()])
      setNewFeature("")
    }
  }

  const handleRemoveFeature = (feature: string) => {
    setFeatures(features.filter(f => f !== feature))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      try {
        // Upload images to Supabase Storage
        const uploadedUrls = await uploadMultipleImages(Array.from(files))
        setImages([...images, ...uploadedUrls])
      } catch (error) {
        console.error('Error uploading images:', error)
        alert('Failed to upload images. Please try again.')
      }
    }
  }

  const handleRemoveImage = (image: string) => {
    setImages(images.filter(img => img !== image))
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
    const updatedFormData = { ...formData }
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
    setLoading(true)

    try {
      // Combine car images into the images array
      const allImages = [
        ...images,
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

      await carService.createCar({
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        price_per_day: formData.price_per_day,
        price_per_week: formData.price_per_week,
        price_per_month: formData.price_per_month,
        fuel_type: 'petrol' as const,
        transmission: 'automatic' as const,
        seats: 5,
        doors: 4,
        mileage: 0,
        color: formData.color,
        description: formData.description,
        location: formData.location,
        is_available: formData.is_available,
        status: formData.status,
        features: [...features, ...featureStrings],
        images: allImages
      })
      
      setSaveMessage({type: 'success', text: 'Car created successfully!'})
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error creating car:', error)
      setSaveMessage({type: 'error', text: 'Failed to create car. Please try again.'})
      // Clear message after 5 seconds
      setTimeout(() => setSaveMessage(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link href="/cars">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cars
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Car</h1>
            <p className="text-gray-600">Add a new car to your inventory</p>
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
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Toyota Camry 2023"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="Toyota"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      placeholder="Camry"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      value={formData.year}
                      onChange={handleInputChange}
                      min="2000"
                      max={new Date().getFullYear() + 1}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="White"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Lagos, Nigeria"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the car features and condition..."
                    rows={4}
                    required
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
              name="status"
              value={formData.status}
              onChange={handleInputChange}
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
              name="is_available"
              checked={formData.is_available}
              onChange={handleInputChange}
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

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price_per_day">Price per Day (NGN)</Label>
                  <Input
                    id="price_per_day"
                    name="price_per_day"
                    type="number"
                    value={formData.price_per_day}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price_per_week">Price per Week (NGN)</Label>
                  <Input
                    id="price_per_week"
                    name="price_per_week"
                    type="number"
                    value={formData.price_per_week}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price_per_month">Price per Month (NGN)</Label>
                  <Input
                    id="price_per_month"
                    name="price_per_month"
                    type="number"
                    value={formData.price_per_month}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="images">Upload Additional Images</Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Upload additional images (interior, engine, dashboard, etc.)
                  </p>
                </div>
                
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={image} 
                          alt={`Additional image ${index + 1}`}
                          className="aspect-video w-full object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                            if (nextElement) {
                              nextElement.style.display = 'flex'
                            }
                          }}
                        />
                        <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center hidden">
                          <span className="text-sm text-gray-600">Failed to load image</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(image)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/cars">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Car
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
