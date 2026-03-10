-- Align legacy schema columns that were created as varchar(20)
-- with the cars-first status model used by the application.

alter table if exists public.bookings
  alter column status type text using status::text,
  alter column payment_status type text using payment_status::text;

alter table if exists public.payment_transactions
  alter column status type text using status::text,
  alter column provider_reference type text using provider_reference::text;

alter table if exists public.refund_requests
  alter column status type text using status::text;

alter table if exists public.bookings
  drop constraint if exists bookings_status_check,
  drop constraint if exists bookings_payment_status_check;

alter table if exists public.bookings
  add constraint bookings_status_check check (
    status in (
      'checkout_draft',
      'payment_pending',
      'paid_awaiting_fulfilment',
      'active',
      'returned',
      'completed',
      'cancel_requested',
      'cancelled',
      'pending',
      'approved'
    )
  ),
  add constraint bookings_payment_status_check check (
    payment_status in (
      'unpaid',
      'pending',
      'pending_verification',
      'paid',
      'refund_pending',
      'refunded',
      'failed'
    )
  );

