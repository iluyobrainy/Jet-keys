import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Car, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  MoreHorizontal
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Mock data for cars
const cars = [
  {
    id: "1",
    name: "Toyota Camry",
    brand: "Toyota",
    model: "Camry",
    year: 2023,
    price_per_day: 25000,
    fuel_type: "petrol",
    transmission: "automatic",
    seats: 5,
    mileage: 15000,
    color: "White",
    location: "Lagos",
    images: ["/Homepageui/Brand.png"],
    is_available: true,
    status: "active"
  },
  {
    id: "2",
    name: "Honda Accord",
    brand: "Honda",
    model: "Accord",
    year: 2022,
    price_per_day: 22000,
    fuel_type: "petrol",
    transmission: "automatic",
    seats: 5,
    mileage: 25000,
    color: "Black",
    location: "Abuja",
    images: ["/Homepageui/Feature.png"],
    is_available: true,
    status: "active"
  },
  {
    id: "3",
    name: "BMW 3 Series",
    brand: "BMW",
    model: "3 Series",
    year: 2023,
    price_per_day: 45000,
    fuel_type: "petrol",
    transmission: "automatic",
    seats: 5,
    mileage: 8000,
    color: "Blue",
    location: "Lagos",
    images: ["/Homepageui/Hero.png"],
    is_available: false,
    status: "maintenance"
  },
  {
    id: "4",
    name: "Mercedes C-Class",
    brand: "Mercedes",
    model: "C-Class",
    year: 2023,
    price_per_day: 50000,
    fuel_type: "petrol",
    transmission: "automatic",
    seats: 5,
    mileage: 12000,
    color: "Silver",
    location: "Port Harcourt",
    images: ["/Homepageui/Subhero.png"],
    is_available: true,
    status: "active"
  }
]

export default function AdminCarsPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-500">Maintenance</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cars Management</h1>
            <p className="text-gray-600">Manage your fleet of vehicles</p>
          </div>
          <Button asChild>
            <Link href="/admin/cars/add">
              <Plus className="mr-2 h-4 w-4" />
              Add New Car
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search cars by name, brand, or model..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <Card key={car.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="relative">
                  <Image
                    src={car.images[0]}
                    alt={car.name}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {getStatusBadge(car.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{car.name}</h3>
                    <p className="text-gray-600 text-sm">{car.year} • {car.color}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Brand:</span>
                    <span className="font-medium">{car.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Model:</span>
                    <span className="font-medium">{car.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price/Day:</span>
                    <span className="font-medium text-blue-600">₦{car.price_per_day.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium">{car.location}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Car className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Cars</p>
                  <p className="text-xl font-bold">24</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Car className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="text-xl font-bold">18</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Car className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Maintenance</p>
                  <p className="text-xl font-bold">4</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Car className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Rented</p>
                  <p className="text-xl font-bold">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
