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
    <Link href={`/car-info/${id}`} className="block">
      <Card className="cursor-pointer overflow-hidden border border-gray-200 transition-shadow duration-200 hover:shadow-lg">
        <CardContent className="p-0">
          <div className="relative">
            <Image
              src={imageSrc}
              alt={model}
              width={400}
              height={250}
              className="h-48 w-full object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-x-2 bottom-2 rounded-xl bg-black/75 px-3 py-2">
              <div className="flex flex-col gap-1 text-xs text-white sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-1.5">
                  <ThumbsUp className="h-3 w-3 shrink-0" />
                  <span className="truncate">Free cancellation</span>
                </div>
                <div className="flex min-w-0 items-center gap-1.5">
                  <Star className="h-3 w-3 shrink-0 fill-current text-yellow-400" />
                  <span className="truncate">{rating} ({trips} trips)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="space-y-1.5">
              <h3 className="text-base font-bold leading-snug text-gray-900 sm:text-lg">{model}</h3>
              <p className="text-sm text-gray-600">{location}</p>
              <p className="text-sm text-gray-600">{distance}</p>
            </div>
            <p className="mt-3 text-base font-bold text-gray-900 sm:text-lg">{price}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
