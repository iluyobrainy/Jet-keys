"use client"

import { useEffect, useMemo, useState } from "react"
import { RefreshCw, Search, Star, Trash2 } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { adminApiFetch } from "@/lib/admin-api-client"

type ReviewRecord = {
  id: string
  car_id: string
  booking_id: string
  user_id: string
  rating: number
  title?: string | null
  content: string
  status: string
  created_at: string
  updated_at: string
  car?: { id: string; name?: string; brand?: string; model?: string } | null
  booking?: { id: string; booking_reference?: string | null } | null
  user?: { id: string; name?: string | null; email?: string | null } | null
}

type ReviewsResponse = {
  cars: Array<{ id: string; name?: string; brand?: string; model?: string }>
  reviews: ReviewRecord[]
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ReviewsPage() {
  const [data, setData] = useState<ReviewsResponse>({ cars: [], reviews: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [carFilter, setCarFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [busyId, setBusyId] = useState("")

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const params = new URLSearchParams()
        if (carFilter !== "all") {
          params.set("carId", carFilter)
        }
        if (statusFilter !== "all") {
          params.set("status", statusFilter)
        }

        const query = params.toString()
        const response = await adminApiFetch<ReviewsResponse>(`/api/admin/reviews${query ? `?${query}` : ""}`)
        setData(response)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load reviews")
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    void fetchReviews()
  }, [carFilter, statusFilter])

  const filteredReviews = useMemo(() => {
    const base = data.reviews.filter((review) => {
      if (!searchTerm.trim()) {
        return true
      }

      return [
        review.title || "",
        review.content,
        review.user?.name || "",
        review.user?.email || "",
        review.car?.brand || "",
        review.car?.model || "",
        review.booking?.booking_reference || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    })

    return [...base].sort((left, right) => {
      const leftTime = new Date(left.created_at).getTime()
      const rightTime = new Date(right.created_at).getTime()
      return sortOrder === "newest" ? rightTime - leftTime : leftTime - rightTime
    })
  }, [data.reviews, searchTerm, sortOrder])

  const updateReviewStatus = async (reviewId: string, status: string) => {
    try {
      setBusyId(reviewId)
      const updated = await adminApiFetch<ReviewRecord>(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })

      setData((current) => ({
        ...current,
        reviews: current.reviews.map((review) => (review.id === reviewId ? { ...review, ...updated } : review)),
      }))
    } catch (updateError) {
      alert(updateError instanceof Error ? updateError.message : "Failed to update review")
    } finally {
      setBusyId("")
    }
  }

  const deleteReview = async (reviewId: string) => {
    try {
      setBusyId(reviewId)
      await adminApiFetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" })
      setData((current) => ({
        ...current,
        reviews: current.reviews.filter((review) => review.id !== reviewId),
      }))
    } catch (deleteError) {
      alert(deleteError instanceof Error ? deleteError.message : "Failed to delete review")
    } finally {
      setBusyId("")
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600">Moderate car reviews by vehicle, status, and submission date.</p>
        </div>

        {error ? (
          <Card className="rounded-3xl border-red-200 bg-red-50">
            <CardContent className="p-6 text-sm text-red-700">{error}</CardContent>
          </Card>
        ) : null}

        <Card className="rounded-3xl">
          <CardContent className="grid gap-4 p-6 md:grid-cols-[1fr_auto_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by user, booking reference, title, or car"
                className="pl-10"
              />
            </div>
            <select
              value={carFilter}
              onChange={(event) => setCarFilter(event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">All cars</option>
              {data.cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {[car.brand, car.model].filter(Boolean).join(" ") || car.name || car.id}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as "newest" | "oldest")}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </CardContent>
        </Card>

        {loading ? (
          <Card className="rounded-3xl">
            <CardContent className="flex h-52 items-center justify-center text-gray-600">
              <RefreshCw className="mr-3 h-5 w-5 animate-spin" />
              Loading reviews...
            </CardContent>
          </Card>
        ) : null}

        {!loading && filteredReviews.length === 0 ? (
          <Card className="rounded-3xl">
            <CardContent className="py-12 text-center text-gray-500">No reviews matched the current filters.</CardContent>
          </Card>
        ) : null}

        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="rounded-3xl">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                      {review.booking?.booking_reference || review.id}
                    </p>
                    <CardTitle className="mt-2 text-xl text-gray-900">
                      {[review.car?.brand, review.car?.model].filter(Boolean).join(" ") || review.car?.name || "Car review"}
                    </CardTitle>
                    <p className="mt-2 text-sm text-gray-600">
                      {review.user?.name || "Customer"} {review.user?.email ? `• ${review.user.email}` : ""}
                    </p>
                  </div>
                  <div className="space-y-2 text-right">
                    <Badge variant={review.status === "published" ? "default" : "secondary"}>{review.status}</Badge>
                    <div className="flex items-center justify-end gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className={`h-4 w-4 ${index < review.rating ? "fill-current" : ""}`} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {review.title ? <p className="font-semibold text-gray-900">{review.title}</p> : null}
                <p className="leading-7 text-gray-600">{review.content}</p>

                <div className="flex flex-wrap gap-3">
                  {review.status !== "published" ? (
                    <Button onClick={() => updateReviewStatus(review.id, "published")} disabled={busyId === review.id}>
                      {busyId === review.id ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Publish
                    </Button>
                  ) : null}
                  {review.status !== "hidden" ? (
                    <Button variant="outline" onClick={() => updateReviewStatus(review.id, "hidden")} disabled={busyId === review.id}>
                      Hide
                    </Button>
                  ) : null}
                  <Button variant="destructive" onClick={() => deleteReview(review.id)} disabled={busyId === review.id}>
                    {busyId === review.id ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
