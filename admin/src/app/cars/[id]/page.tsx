"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Car, 
  Edit, 
  ArrowLeft,
  MapPin,
  Calendar,
  Fuel,
  Settings,
  Users,
  Gauge
} from "lucide-react"
import { useEffect, useState } from "react"
import { carService } from "@/lib/admin-services"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"

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
  images: string[]
  is_available: boolean
  status: string
  created_at: string
  description?: string
  features?: string[]
}

export default function CarViewPage() {
  const params = useParams()
  const carId = params.id as string
  const [car, setCar] = useState<CarData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const data = await carService.getCarById(carId)
        setCar(data)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-500">Maintenance</Badge>
      case "inactive":
        return <Badge variant="destructive">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Car not found</h3>
            <p className="text-gray-600 mb-4">The car you're looking for doesn't exist.</p>
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
              <Link href="/cars">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cars
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{car.name}</h1>
              <p className="text-gray-600">{car.brand} {car.model} ({car.year})</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(car.status)}
            <Button asChild>
              <Link href={`/cars/${car.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Car
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent>
                {car.images && car.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {car.images.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={image}
                          alt={`${car.name} - Image ${index + 1}`}
                          width={400}
                          height={300}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Car className="h-12 w-12 text-gray-400" />
                    <p className="text-gray-500 ml-2">No images available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            {car.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{car.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {car.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-xl font-bold text-gray-400">₦</span>
                  <div>
                    <p className="text-sm text-gray-600">Price per day</p>
                    <p className="font-semibold">{formatCurrency(car.price_per_day)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold">{car.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Seats</p>
                    <p className="font-semibold">{car.seats}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Fuel className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Fuel Type</p>
                    <p className="font-semibold">{car.fuel_type}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Transmission</p>
                    <p className="font-semibold">{car.transmission}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Gauge className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Mileage</p>
                    <p className="font-semibold">{car.mileage.toLocaleString()} km</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Car className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Color</p>
                    <p className="font-semibold">{car.color}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status & Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  {getStatusBadge(car.status)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Available</span>
                  <Badge variant={car.is_available ? "default" : "destructive"}>
                    {car.is_available ? "Yes" : "No"}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Added on</p>
                    <p className="font-semibold">{formatDate(car.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
