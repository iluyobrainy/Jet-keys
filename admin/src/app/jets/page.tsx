"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plane, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  MapPin,
  Users,
  Gauge
} from "lucide-react"
import { useEffect, useState } from "react"
import { jetService } from "@/lib/admin-services"
import Link from "next/link"
import Image from "next/image"

interface JetData {
  id: string
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
  features: string[]
  images: string[]
  is_available: boolean
  location: string
  status: string
  created_at: string
}

export default function JetsPage() {
  const [jets, setJets] = useState<JetData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchJets = async () => {
      try {
        const data = await jetService.getAllJets()
        setJets(data)
      } catch (error) {
        console.error('Error fetching jets:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJets()
  }, [])

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

  const filteredJets = jets.filter(jet => {
    const matchesSearch = jet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jet.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jet.model.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || jet.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleDeleteJet = async (jetId: string) => {
    if (confirm('Are you sure you want to delete this jet?')) {
      try {
        await jetService.deleteJet(jetId)
        setJets(jets.filter(jet => jet.id !== jetId))
      } catch (error) {
        console.error('Error deleting jet:', error)
        alert('Failed to delete jet')
      }
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading jets...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jet Management</h1>
            <p className="text-gray-600">Manage your private jet fleet</p>
          </div>
          <Button asChild>
            <Link href="/jets/add">
              <Plus className="h-4 w-4 mr-2" />
              Add New Jet
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search jets by name, manufacturer, or model..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJets.map((jet) => (
            <Card key={jet.id} className="overflow-hidden">
              <div className="relative">
                {jet.images && jet.images.length > 0 ? (
                  <Image
                    src={jet.images[0]}
                    alt={jet.name}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <Plane className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(jet.status)}
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{jet.name}</h3>
                    <p className="text-sm text-gray-600">{jet.manufacturer} {jet.model} ({jet.year})</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {jet.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="text-lg font-bold mr-2">₦</span>
                      {formatCurrency(jet.price_per_hour)}/hour
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {jet.capacity} passengers
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Gauge className="h-4 w-4 mr-2" />
                      {jet.max_speed} km/h • {jet.range} km range
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/jets/${jet.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/jets/${jet.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteJet(jet.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJets.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jets found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search criteria" 
                  : "Get started by adding your first jet"
                }
              </p>
              <Button asChild>
                <Link href="/jets/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Jet
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Jets</p>
                  <p className="text-2xl font-bold">{jets.length}</p>
                </div>
                <Plane className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{jets.filter(j => j.status === 'active').length}</p>
                </div>
                <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-white rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Maintenance</p>
                  <p className="text-2xl font-bold">{jets.filter(j => j.status === 'maintenance').length}</p>
                </div>
                <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-white rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold">{jets.filter(j => j.status === 'inactive').length}</p>
                </div>
                <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-white rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

