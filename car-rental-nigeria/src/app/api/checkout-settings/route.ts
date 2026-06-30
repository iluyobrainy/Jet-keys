import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

const defaultCheckoutSettings = {
  delivery_fee: 20000,
  vat_rate: 0,
  service_fee_rate: 0,
  insurance_fee: 0,
  late_return_fee: 0,
  cancellation_fee_rate: 0,
  minimum_rental_hours: 4,
  maximum_rental_days: 30,
  advance_booking_days: 7,
  payment_methods: ["card", "bank_transfer", "cash"],
  currency: "NGN",
  terms_and_conditions: "",
  privacy_policy: "",
  refund_policy: "",
  contact_email: "",
  contact_phone: "",
  business_address: "",
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("checkout_settings")
      .select("*")
      .single()

    if (error) {
      console.warn("Checkout settings not found, using defaults:", error.message)
      return NextResponse.json(defaultCheckoutSettings)
    }

    const settingsRow = (data || {}) as {
      delivery_fee?: number | null
      vat_rate?: number | null
      vat_percentage?: number | null
      service_fee_rate?: number | null
      service_fee?: number | null
      insurance_fee?: number | null
      late_return_fee?: number | null
      cancellation_fee_rate?: number | null
      minimum_rental_hours?: number | null
      maximum_rental_days?: number | null
      advance_booking_days?: number | null
      payment_methods?: string[] | null
      currency?: string | null
      terms_and_conditions?: string | null
      privacy_policy?: string | null
      refund_policy?: string | null
      contact_email?: string | null
      contact_phone?: string | null
      business_address?: string | null
    }

    const settings = {
      delivery_fee: settingsRow.delivery_fee || 20000,
      vat_rate: settingsRow.vat_rate || settingsRow.vat_percentage || 0,
      service_fee_rate: settingsRow.service_fee_rate || settingsRow.service_fee || 0,
      insurance_fee: settingsRow.insurance_fee || 0,
      late_return_fee: settingsRow.late_return_fee || 0,
      cancellation_fee_rate: settingsRow.cancellation_fee_rate || 0,
      minimum_rental_hours: settingsRow.minimum_rental_hours || 4,
      maximum_rental_days: settingsRow.maximum_rental_days || 30,
      advance_booking_days: settingsRow.advance_booking_days || 7,
      payment_methods: settingsRow.payment_methods || ["card", "bank_transfer", "cash"],
      currency: settingsRow.currency || "NGN",
      terms_and_conditions: settingsRow.terms_and_conditions || "",
      privacy_policy: settingsRow.privacy_policy || "",
      refund_policy: settingsRow.refund_policy || "",
      contact_email: settingsRow.contact_email || "",
      contact_phone: settingsRow.contact_phone || "",
      business_address: settingsRow.business_address || "",
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.warn("Error fetching checkout settings, using defaults:", error)
    return NextResponse.json(defaultCheckoutSettings)
  }
}
