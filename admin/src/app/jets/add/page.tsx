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
  Plus,
  Plane
} from "lucide-react"
import { useState } from "react"
import { jetService } from "@/lib/admin-services"
import { uploadMultipleImages } from "@/lib/image-upload"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AddJetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [jetImages, setJetImages] = useState({
    front: "",
    back: "",
    left: "",
    right: ""
  })
  const [features, setFeatures] = useState<string[]>([])
  const [newFeature, setNewFeature] = useState("")
  
  const [formData, setFormData] = useState({
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
    location: "",
    is_available: true,
    status: "active"
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
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

  const handleJetImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, view: 'front' | 'back' | 'left' | 'right') => {
    const files = e.target.files
    if (files && files.length > 0) {
      try {
        // Upload single image to Supabase Storage
        const uploadedUrls = await uploadMultipleImages(Array.from(files))
        if (uploadedUrls.length > 0) {
          setJetImages(prev => ({
            ...prev,
            [view]: uploadedUrls[0]
          }))
        }
      } catch (error) {
        console.error('Error uploading jet image:', error)
        alert('Failed to upload image. Please try again.')
      }
    }
  }

  const handleRemoveJetImage = (view: 'front' | 'back' | 'left' | 'right') => {
    setJetImages(prev => ({
      ...prev,
      [view]: ""
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Combine jet images into the images array
      const allImages = [
        ...images,
        ...Object.values(jetImages).filter(img => img !== "")
      ]

      await jetService.createJet({
        ...formData,
        status: formData.status as any,
        features,
        images: allImages
      })
      
      router.push('/jets')
    } catch (error) {
      console.error('Error creating jet:', error)
      alert('Failed to create jet')
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
            <Link href="/jets">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jets
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Jet</h1>
            <p className="text-gray-600">Add a new private jet to your fleet</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Jet Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Gulfstream G650ER"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      placeholder="Gulfstream"
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
                      placeholder="G650ER"
                      required
                    />
                  </div>
                </div>

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
                  <Label htmlFor="location">Base Location</Label>
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
                    placeholder="Describe the jet features and amenities..."
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
                  <Label htmlFor="capacity">Passenger Capacity</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="2"
                    max="20"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="range">Range (km)</Label>
                  <Input
                    id="range"
                    name="range"
                    type="number"
                    value={formData.range}
                    onChange={handleInputChange}
                    min="1000"
                    max="20000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="max_speed">Max Speed (km/h)</Label>
                  <Input
                    id="max_speed"
                    name="max_speed"
                    type="number"
                    value={formData.max_speed}
                    onChange={handleInputChange}
                    min="400"
                    max="1000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
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
                  <Label htmlFor="is_available">Available for charter</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price_per_hour">Price per Hour (NGN)</Label>
                  <Input
                    id="price_per_hour"
                    name="price_per_hour"
                    type="number"
                    value={formData.price_per_hour}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
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
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features & Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature (e.g., WiFi, Premium Seating, Galley)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                  />
                  <Button type="button" onClick={handleAddFeature}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                        <span className="text-sm">{feature}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(feature)}
                          className="text-gray-500 hover:text-red-500"
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

          {/* Jet Detail Images */}
          <Card>
            <CardHeader>
              <CardTitle>Jet Detail Images</CardTitle>
              <p className="text-sm text-gray-600">Upload specific views of the jet for the jet-info page slider</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Front View */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Front View</Label>
                  <div className="relative">
                    {jetImages.front ? (
                      <div className="relative">
                        <img 
                          src={jetImages.front} 
                          alt="Front view"
                          className="aspect-video w-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveJetImage('front')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
                        <Plane className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Upload Front</span>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleJetImageUpload(e, 'front')}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Back View */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Back View</Label>
                  <div className="relative">
                    {jetImages.back ? (
                      <div className="relative">
                        <img 
                          src={jetImages.back} 
                          alt="Back view"
                          className="aspect-video w-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveJetImage('back')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
                        <Plane className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Upload Back</span>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleJetImageUpload(e, 'back')}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Left View */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Left Side</Label>
                  <div className="relative">
                    {jetImages.left ? (
                      <div className="relative">
                        <img 
                          src={jetImages.left} 
                          alt="Left side"
                          className="aspect-video w-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveJetImage('left')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
                        <Plane className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Upload Left</span>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleJetImageUpload(e, 'left')}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Right View */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Right Side</Label>
                  <div className="relative">
                    {jetImages.right ? (
                      <div className="relative">
                        <img 
                          src={jetImages.right} 
                          alt="Right side"
                          className="aspect-video w-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveJetImage('right')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
                        <Plane className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Upload Right</span>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleJetImageUpload(e, 'right')}
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
              <p className="text-sm text-gray-600">Upload extra images (interior, cabin, cockpit, etc.) for the jets listing page</p>
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
                    Upload additional images (interior, cabin, cockpit, galley, etc.)
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
              <Link href="/jets">Cancel</Link>
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
                  Create Jet
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

