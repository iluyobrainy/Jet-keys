"use client"

import Image from "next/image"
import Link from "next/link"
import { ThumbsUp, Star, Users, Settings } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface OthersVehicleCardProps {
  id: string
  model: string
  year: string
  brand: string
  location: string
  distance: string
  seats: string
  transmission: string
  rating: string
  reviews: string
  price: string
  imageSrc: string
}

export function OthersVehicleCard({
  id,
  model,
  year,
  brand,
  location,
  distance,
  seats,
  transmission,
  rating,
  reviews,
  price,
  imageSrc
}: OthersVehicleCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <CardContent className="p-6">
        <div className="flex space-x-6">
          {/* Image */}
          <div className="flex-shrink-0">
            <Image
              src={imageSrc}
              alt={`${year} ${brand} ${model}`}
              width={160}
              height={120}
              className="w-40 h-30 object-cover rounded-lg"
            />
          </div>
          
          {/* Details */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Top Section - Model, Location, Features */}
            <div>
              {/* Model and Year */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {year} - {brand} {model}
              </h3>
              
              {/* Location and Distance */}
              <div className="mb-4">
                <p className="text-blue-600 font-medium text-sm">{location}</p>
                <p className="text-gray-500 text-sm">{distance}</p>
              </div>
              
              {/* Features Row */}
              <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-700 font-medium">{seats}</span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-700 font-medium">{transmission}</span>
                </div>
              </div>
              
              {/* Cancellation and Rating */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <ThumbsUp className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Free cancellation</span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{rating} ({reviews} reviews)</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Section - Price and Button */}
          <div className="flex-shrink-0 flex flex-col justify-between items-end">
            <div className="text-right mb-4">
              <p className="text-sm text-gray-500 mb-1">Basic price from</p>
              <p className="text-xl font-bold text-gray-900">{price}</p>
            </div>
            
            <Link href={`/car-info/${id}`}>
              <Button className="bg-white text-black border-2 border-black hover:bg-gradient-to-r hover:from-yellow-400 hover:to-yellow-600 hover:text-white hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-200 transition-all duration-300 px-6 py-3 rounded-lg font-medium">
                Choose this car
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
