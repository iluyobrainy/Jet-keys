"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { JetForm } from "@/components/jet-form"
import { Button } from "@/components/ui/button"
import { jetService } from "@/lib/admin-services"
import type { Database } from "@/lib/supabase"

type Jet = Database["public"]["Tables"]["jets"]["Row"]
type JetPayload = Database["public"]["Tables"]["jets"]["Insert"]

export default function EditJetPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [jet, setJet] = useState<Jet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadJet = async () => {
      if (!params.id) return
      try {
        setJet(await jetService.getJetById(params.id))
      } catch (loadError) {
        console.error("Error loading jet:", loadError)
        setError("This jet could not be loaded for editing.")
      } finally {
        setLoading(false)
      }
    }
    void loadJet()
  }, [params.id])

  const handleUpdate = async (payload: JetPayload) => {
    if (!params.id) return
    await jetService.updateJet(params.id, payload)
    setTimeout(() => router.push("/jets"), 900)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild><Link href="/jets"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Jets</Link></Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Jet</h1>
            <p className="text-gray-600">Update public catalog data and aircraft availability.</p>
          </div>
        </div>
        {loading ? <div className="h-96 animate-pulse rounded-2xl bg-white shadow" /> : null}
        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">{error}</div> : null}
        {jet ? <JetForm initialJet={jet} submitLabel="Save Changes" onSubmit={handleUpdate} /> : null}
      </div>
    </AdminLayout>
  )
}

