"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { JetForm } from "@/components/jet-form"
import { Button } from "@/components/ui/button"
import { jetService } from "@/lib/admin-services"
import type { Database } from "@/lib/supabase"

type JetPayload = Database["public"]["Tables"]["jets"]["Insert"]

export default function AddJetPage() {
  const router = useRouter()

  const handleCreate = async (payload: JetPayload) => {
    await jetService.createJet(payload)
    setTimeout(() => router.push("/jets"), 900)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/jets"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Jets</Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Jet</h1>
            <p className="text-gray-600">Publish a real aircraft into the public jet catalog.</p>
          </div>
        </div>
        <JetForm submitLabel="Create Jet" onSubmit={handleCreate} />
      </div>
    </AdminLayout>
  )
}

