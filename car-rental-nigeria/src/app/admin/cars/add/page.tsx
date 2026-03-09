"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { AdminCarForm } from "@/components/admin/car-form"
import { Button } from "@/components/ui/button"

export default function AddCarPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Add car</h1>
            <p className="text-sm text-slate-600">Create a real fleet entry with uploadable cover and gallery images.</p>
          </div>
          <Button variant="outline" className="rounded-2xl" asChild>
            <Link href="/admin/cars">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to cars
            </Link>
          </Button>
        </div>

        <AdminCarForm mode="create" />
      </div>
    </AdminLayout>
  )
}

