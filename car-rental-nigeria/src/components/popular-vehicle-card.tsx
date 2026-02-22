"use client"

import Image from "next/image"
import Link from "next/link"
import { ThumbsUp, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface PopularVehicleCardProps {
  id: string
  model: string
  location: string
  distance: string
  price: string
  imageSrc: string
  rating: string
  trips: string
}

export function PopularVehicleCard({
  id,
  model,
  location,
  distance,
  price,
  imageSrc,
  rating,
  trips
}: PopularVehicleCardProps) {
  return (
    <Link href={`/car-info/${id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <CardContent className="p-0">
        <div className="relative">
          <Image
            src={imageSrc}
            alt={model}
            width={400}
            height={250}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          {/* Overlay */}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-3 py-1 rounded-md">
            <div className="flex items-center space-x-4 text-white text-sm">
              <div className="flex items-center space-x-1">
                <ThumbsUp className="h-3 w-3" />
                <span>Free cancellation</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span>{rating} ({trips} trips)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{model}</h3>
              <p className="text-sm text-gray-600">{location}</p>
              <p className="text-sm text-gray-600">{distance}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{price}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  )
}
