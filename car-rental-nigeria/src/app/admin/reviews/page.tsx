"use client"

import { useMemo, useState } from "react"
import { Eye, EyeOff, Loader2, Search, Trash2 } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useDeleteReview, useModerateReview, useReviews } from "@/lib/hooks/useApi"
import { useRealtimeInvalidation } from "@/lib/hooks/useRealtimeInvalidation"
import { formatDate } from "@/lib/formatters"

export default function AdminReviewsPage() {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("recent")
  const { data: reviews = [], isLoading, error } = useReviews(undefined, "admin")
  const moderateReviewMutation = useModerateReview()
  const deleteReviewMutation = useDeleteReview()

  useRealtimeInvalidation("admin-reviews-live", ["reviews"], [["reviews"]])

  const filteredReviews = useMemo(() => {
    const term = search.trim().toLowerCase()
    const items = reviews.filter((review) => {
      if (!term) {
        return true
      }

      return [
        review.title,
        review.content,
        review.cars?.name,
        review.cars?.brand,
        review.cars?.model,
        review.bookings?.customer_name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    })

    return items.sort((left, right) => {
      const leftTime = new Date(String(left.created_at)).getTime()
      const rightTime = new Date(String(right.created_at)).getTime()
      return sort === "recent" ? rightTime - leftTime : leftTime - rightTime
    })
  }, [reviews, search, sort])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Reviews</h1>
          <p className="text-sm text-slate-600">Moderate verified vehicle reviews by car, customer, and publish state.</p>
        </div>

        <Card className="rounded-[28px] border-slate-200">
          <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="h-12 rounded-2xl border-slate-200 pl-10" placeholder="Search by customer, car, title, or content" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <select className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="recent">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-[28px] border border-slate-200 bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
          </div>
        ) : null}

        {error ? (
          <Card className="rounded-[28px] border-red-200 bg-red-50">
            <CardContent className="p-6 text-sm text-red-700">{error instanceof Error ? error.message : "Unable to load reviews."}</CardContent>
          </Card>
        ) : null}

        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={String(review.id)} className="rounded-[28px] border-slate-200">
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle className="text-xl">{String(review.title || "Untitled review")}</CardTitle>
                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                      <p>{String(review.bookings?.customer_name || "Jet & Keys Customer")}</p>
                      <p>{String(review.cars?.name || `${review.cars?.brand || "Car"} ${review.cars?.model || ""}`.trim())}</p>
                      <p>{formatDate(String(review.created_at))}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${review.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                    {String(review.status)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-slate-600">{String(review.content || "")}</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800" onClick={() => moderateReviewMutation.mutate({ id: String(review.id), status: "published" })} disabled={moderateReviewMutation.isPending}>
                    <Eye className="mr-2 h-4 w-4" />
                    Publish
                  </Button>
                  <Button variant="outline" className="rounded-2xl" onClick={() => moderateReviewMutation.mutate({ id: String(review.id), status: "hidden" })} disabled={moderateReviewMutation.isPending}>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Hide
                  </Button>
                  <Button variant="outline" className="rounded-2xl border-red-200 text-red-700 hover:bg-red-50" onClick={() => deleteReviewMutation.mutate(String(review.id))} disabled={deleteReviewMutation.isPending}>
                    <Trash2 className="mr-2 h-4 w-4" />
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

