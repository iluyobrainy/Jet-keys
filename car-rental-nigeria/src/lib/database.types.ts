export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type BookingStatus =
  | "checkout_draft"
  | "payment_pending"
  | "paid_awaiting_fulfilment"
  | "active"
  | "returned"
  | "completed"
  | "cancel_requested"
  | "cancelled"
  | "pending"
  | "approved"

export type PaymentStatus =
  | "unpaid"
  | "pending"
  | "pending_verification"
  | "paid"
  | "refund_pending"
  | "refunded"
  | "failed"

export type UserRole = "customer" | "admin" | "staff"

type Timestamp = string

export interface Database {
  public: {
    Tables: {
      cars: {
        Row: {
          id: string
          name: string
          brand: string
          model: string
          year: number
          price_per_day: number
          price_per_week: number | null
          price_per_month: number | null
          fuel_type: string
          transmission: string
          seats: number
          doors: number
          mileage: number
          color: string
          description: string
          location: string
          pickup_location: string | null
          images: string[] | null
          features: string[] | null
          is_available: boolean
          status: string
          body_type: string | null
          supports_delivery: boolean | null
          supports_pickup_by_host: boolean | null
          supports_one_way_trip: boolean | null
          unlimited_mileage: boolean | null
          instant_book: boolean | null
          primary_image_url: string | null
          created_at: Timestamp
          updated_at: Timestamp
        }
        Insert: Partial<Database["public"]["Tables"]["cars"]["Row"]>
        Update: Partial<Database["public"]["Tables"]["cars"]["Row"]>
      }
      jets: {
        Row: {
          id: string
          name: string
          manufacturer: string
          model: string
          year: number
          price_per_hour: number
          price_per_day: number
          capacity: number
          range: number
          max_speed: number
          description: string
          features: string[] | null
          images: string[] | null
          is_available: boolean
          location: string
          status: string
          created_at: Timestamp
          updated_at: Timestamp
        }
        Insert: Partial<Database["public"]["Tables"]["jets"]["Row"]>
        Update: Partial<Database["public"]["Tables"]["jets"]["Row"]>
      }
      locations: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          state: string
          is_active: boolean
          created_at: Timestamp
          updated_at: Timestamp
        }
        Insert: Partial<Database["public"]["Tables"]["locations"]["Row"]>
        Update: Partial<Database["public"]["Tables"]["locations"]["Row"]>
      }
      car_locations: {
        Row: {
          id: string
          car_id: string
          location_id: string
          is_primary: boolean | null
          created_at: Timestamp
        }
        Insert: Partial<Database["public"]["Tables"]["car_locations"]["Row"]>
        Update: Partial<Database["public"]["Tables"]["car_locations"]["Row"]>
      }
      bookings: {
        Row: {
          id: string
          booking_reference: string | null
          user_id: string | null
          car_id: string | null
          jet_id: string | null
          booking_type: string
          pickup_date: Timestamp
          dropoff_date: Timestamp
          pickup_time: string | null
          dropoff_time: string | null
          pickup_location: string
          dropoff_location: string
          total_amount: number
          delivery_fee: number | null
          vat_amount: number | null
          service_fee: number | null
          status: BookingStatus
          payment_status: PaymentStatus
          payment_reference: string | null
          customer_name: string
          customer_email: string
          customer_phone: string
          special_requests: string | null
          cancellation_reason: string | null
          cancellation_date: Timestamp | null
          refund_amount: number | null
          refund_status: string | null
          bank_name: string | null
          account_name: string | null
          account_number: string | null
          refund_processed_date: Timestamp | null
          refund_processed_by: string | null
          refund_reference: string | null
          actual_dropoff_date: Timestamp | null
          actual_dropoff_time: string | null
          late_return_fee: number | null
          late_return_hours: number | null
          late_return_reason: string | null
          late_return_processed_date: Timestamp | null
          late_return_processed_by: string | null
          late_return_notification_sent: boolean | null
          late_return_notification_date: Timestamp | null
          rental_started_at: Timestamp | null
          rental_returned_at: Timestamp | null
          completed_at: Timestamp | null
          created_at: Timestamp
          updated_at: Timestamp
        }
        Insert: Partial<Database["public"]["Tables"]["bookings"]["Row"]>
        Update: Partial<Database["public"]["Tables"]["bookings"]["Row"]>
      }
      users: {
        Row: {
          id: string
          auth_user_id: string | null
          email: string
          name: string
          phone: string | null
          role: UserRole | null
          is_active: boolean | null
          created_at: Timestamp | null
          updated_at: Timestamp | null
        }
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]>
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>
      }
      checkout_settings: {
        Row: {
          id: string
          delivery_fee: number | null
          vat_percentage: number | null
          vat_rate: number | null
          service_fee: number | null
          service_fee_rate: number | null
          insurance_fee: number | null
          late_return_fee: number | null
          cancellation_fee_rate: number | null
          minimum_rental_hours: number | null
          maximum_rental_days: number | null
          advance_booking_days: number | null
          payment_methods: string[] | null
          currency: string | null
          terms_and_conditions: string | null
          privacy_policy: string | null
          refund_policy: string | null
          contact_email: string | null
          contact_phone: string | null
          business_address: string | null
          created_at: Timestamp | null
          updated_at: Timestamp | null
        }
        Insert: Partial<Database["public"]["Tables"]["checkout_settings"]["Row"]>
        Update: Partial<Database["public"]["Tables"]["checkout_settings"]["Row"]>
      }
      website_settings: {
        Row: {
          id: string
          key: string
          value: string
          type: string
          description: string | null
          created_at: Timestamp | null
          updated_at: Timestamp | null
        }
        Insert: Partial<Database["public"]["Tables"]["website_settings"]["Row"]>
        Update: Partial<Database["public"]["Tables"]["website_settings"]["Row"]>
      }
      payment_transactions: {
        Row: {
          id: string
          booking_id: string
          user_id: string | null
          provider: string
          provider_reference: string
          amount: number
          currency: string
          status: PaymentStatus
          channel: string | null
          authorization_url: string | null
          access_code: string | null
          raw_initialize_response: Json | null
          raw_verify_response: Json | null
          created_at: Timestamp
          updated_at: Timestamp
        }
        Insert: Partial<Database["public"]["Tables"]["payment_transactions"]["Row"]>
        Update: Partial<Database["public"]["Tables"]["payment_transactions"]["Row"]>
      }
      refund_requests: {
        Row: {
          id: string
          booking_id: string
          user_id: string | null
          request_type: string
          reason: string
          bank_name: string | null
          account_name: string | null
          account_number: string | null
          amount_requested: number | null
          status: string
          admin_notes: string | null
          processed_by_user_id: string | null
          processed_at: Timestamp | null
          created_at: Timestamp
          updated_at: Timestamp
        }
        Insert: Partial<Database["public"]["Tables"]["refund_requests"]["Row"]>
        Update: Partial<Database["public"]["Tables"]["refund_requests"]["Row"]>
      }
      reviews: {
        Row: {
          id: string
          car_id: string
          booking_id: string
          user_id: string
          rating: number
          title: string | null
          content: string
          status: string
          created_at: Timestamp
          updated_at: Timestamp
        }
        Insert: Partial<Database["public"]["Tables"]["reviews"]["Row"]>
        Update: Partial<Database["public"]["Tables"]["reviews"]["Row"]>
      }
    }
  }
}
