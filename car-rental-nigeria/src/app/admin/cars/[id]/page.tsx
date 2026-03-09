"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { AdminCarForm } from "@/components/admin/car-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCarDetails } from "@/lib/hooks/useApi"

export default function EditCarPage() {
  const params = useParams()
  const carId = String(params.id)
  const { data, isLoading, error } = useCarDetails(carId)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Edit car</h1>
            <p className="text-sm text-slate-600">Update pricing, locations, images, and operational settings.</p>
          </div>
          <Button variant="outline" className="rounded-2xl" asChild>
            <Link href="/admin/cars">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to cars
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-[28px] border border-slate-200 bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
          </div>
        ) : null}

        {error || !data?.car ? (
          <Card className="rounded-[28px] border-red-200 bg-red-50">
            <CardContent className="p-6 text-sm text-red-700">
              Unable to load this car for editing.
            </CardContent>
          </Card>
        ) : null}

        {data?.car ? (
          <AdminCarForm
            mode="edit"
            carId={carId}
            initialCar={data.car as Record<string, unknown>}
            initialLocationIds={(data.allowedLocations || []).map((location) => location.id)}
          />
        ) : null}
      </div>
    </AdminLayout>
  )
}

