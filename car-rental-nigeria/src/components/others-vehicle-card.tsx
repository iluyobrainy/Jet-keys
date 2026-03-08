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
      <CardContent className="p-4 sm:p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:gap-6">
          {/* Image */}
          <div className="w-full shrink-0 md:w-40">
            <Image
              src={imageSrc}
              alt={`${year} ${brand} ${model}`}
              width={160}
              height={120}
              className="h-48 w-full rounded-lg object-cover md:h-28 md:w-40"
            />
          </div>
          
          {/* Details */}
          <div className="flex-1">
            {/* Top Section - Model, Location, Features */}
            <div>
              {/* Model and Year */}
              <h3 className="mb-2 text-base font-bold leading-snug text-gray-900 sm:text-lg md:text-xl">
                {year} - {brand} {model}
              </h3>
              
              {/* Location and Distance */}
              <div className="mb-3">
                <p className="text-blue-600 font-medium text-sm">{location}</p>
                <p className="text-gray-500 text-sm">{distance}</p>
              </div>
              
              {/* Features Row */}
              <div className="mb-3 grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-700 font-medium">{seats}</span>
                </div>
                <div className="hidden h-4 w-px bg-gray-300 sm:block"></div>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-700 font-medium">{transmission}</span>
                </div>
              </div>
              
              {/* Cancellation and Rating */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-gray-600" />
                  <span className="text-xs text-gray-600 sm:text-sm">Free cancellation</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-gray-400"></div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600 sm:text-sm">{rating} ({reviews} reviews)</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Section - Price and Button */}
          <div className="flex shrink-0 flex-col gap-3 border-t border-gray-100 pt-3 md:min-w-[180px] md:items-end md:justify-between md:border-t-0 md:pt-0">
            <div className="md:text-right">
              <p className="mb-1 text-sm text-gray-500">Basic price from</p>
              <p className="text-lg font-bold text-gray-900 sm:text-xl">{price}</p>
            </div>
            
            <Link href={`/car-info/${id}`} className="w-full md:w-auto">
              <Button className="w-full rounded-lg border-2 border-black bg-white px-6 py-3 font-medium text-black transition-all duration-300 hover:border-yellow-500 hover:bg-gradient-to-r hover:from-yellow-400 hover:to-yellow-600 hover:text-white hover:shadow-lg hover:shadow-yellow-200 md:w-auto">
                Choose this car
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
