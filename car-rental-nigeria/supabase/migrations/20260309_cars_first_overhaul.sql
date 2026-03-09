-- Cars-first production backend overhaul
-- Apply this migration to the project backing the cars flow before enabling the new API routes in production.

create extension if not exists pgcrypto;

alter table public.users
  add column if not exists auth_user_id uuid,
  add column if not exists role text default 'customer',
  add column if not exists is_active boolean default true,
  add column if not exists created_at timestamptz default timezone('utc', now()),
  add column if not exists updated_at timestamptz default timezone('utc', now());

alter table public.users
  alter column role set default 'customer',
  alter column is_active set default true;

alter table public.users drop constraint if exists users_role_check;
alter table public.users
  add constraint users_role_check check (role in ('customer', 'admin', 'staff'));

create unique index if not exists users_auth_user_id_key on public.users(auth_user_id);
create unique index if not exists users_email_key on public.users(email);
create index if not exists users_role_idx on public.users(role);

alter table public.cars
  add column if not exists body_type text,
  add column if not exists supports_delivery boolean default false,
  add column if not exists supports_pickup_by_host boolean default false,
  add column if not exists supports_one_way_trip boolean default false,
  add column if not exists unlimited_mileage boolean default false,
  add column if not exists instant_book boolean default false,
  add column if not exists primary_image_url text;

alter table public.bookings
  add column if not exists booking_reference text,
  add column if not exists pickup_time text,
  add column if not exists dropoff_time text,
  add column if not exists delivery_fee numeric(12,2) default 0,
  add column if not exists vat_amount numeric(12,2) default 0,
  add column if not exists service_fee numeric(12,2) default 0,
  add column if not exists payment_reference text,
  add column if not exists cancellation_reason text,
  add column if not exists cancellation_date timestamptz,
  add column if not exists refund_amount numeric(12,2),
  add column if not exists refund_status text,
  add column if not exists bank_name text,
  add column if not exists account_name text,
  add column if not exists account_number text,
  add column if not exists refund_processed_date timestamptz,
  add column if not exists refund_processed_by text,
  add column if not exists refund_reference text,
  add column if not exists actual_dropoff_date timestamptz,
  add column if not exists actual_dropoff_time text,
  add column if not exists late_return_fee numeric(12,2),
  add column if not exists late_return_hours numeric(10,2),
  add column if not exists late_return_reason text,
  add column if not exists late_return_processed_date timestamptz,
  add column if not exists late_return_processed_by text,
  add column if not exists late_return_notification_sent boolean default false,
  add column if not exists late_return_notification_date timestamptz,
  add column if not exists rental_started_at timestamptz,
  add column if not exists rental_returned_at timestamptz,
  add column if not exists completed_at timestamptz;

alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings drop constraint if exists bookings_payment_status_check;

alter table public.bookings
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

alter table public.bookings
  alter column status set default 'checkout_draft',
  alter column payment_status set default 'unpaid';

alter table public.checkout_settings
  add column if not exists vat_rate numeric(5,2),
  add column if not exists service_fee_rate numeric(12,2),
  add column if not exists late_return_fee numeric(12,2) default 0,
  add column if not exists cancellation_fee_rate numeric(5,2) default 0,
  add column if not exists minimum_rental_hours integer default 4,
  add column if not exists maximum_rental_days integer default 30,
  add column if not exists advance_booking_days integer default 30,
  add column if not exists terms_and_conditions text,
  add column if not exists privacy_policy text,
  add column if not exists refund_policy text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists business_address text;

update public.checkout_settings
set
  vat_rate = coalesce(vat_rate, vat_percentage, 0),
  service_fee_rate = coalesce(service_fee_rate, service_fee, 0);

create unique index if not exists bookings_booking_reference_key on public.bookings(booking_reference);
create index if not exists bookings_user_id_idx on public.bookings(user_id);
create index if not exists bookings_car_id_idx on public.bookings(car_id);
create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists bookings_payment_status_idx on public.bookings(payment_status);
create index if not exists bookings_payment_reference_idx on public.bookings(payment_reference);

create table if not exists public.car_locations (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  is_primary boolean default false,
  created_at timestamptz not null default timezone('utc', now()),
  unique(car_id, location_id)
);

create index if not exists car_locations_car_id_idx on public.car_locations(car_id);
create index if not exists car_locations_location_id_idx on public.car_locations(location_id);

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  provider text not null default 'paystack',
  provider_reference text not null,
  amount numeric(12,2) not null,
  currency text not null default 'NGN',
  status text not null default 'pending_verification',
  channel text,
  authorization_url text,
  access_code text,
  raw_initialize_response jsonb,
  raw_verify_response jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(provider_reference)
);

create index if not exists payment_transactions_booking_id_idx on public.payment_transactions(booking_id);
create index if not exists payment_transactions_user_id_idx on public.payment_transactions(user_id);
create index if not exists payment_transactions_status_idx on public.payment_transactions(status);

create table if not exists public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  request_type text not null,
  reason text not null,
  bank_name text,
  account_name text,
  account_number text,
  amount_requested numeric(12,2),
  status text not null default 'pending',
  admin_notes text,
  processed_by_user_id uuid references public.users(id) on delete set null,
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists refund_requests_booking_id_idx on public.refund_requests(booking_id);
create index if not exists refund_requests_user_id_idx on public.refund_requests(user_id);
create index if not exists refund_requests_status_idx on public.refund_requests(status);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text,
  content text not null,
  status text not null default 'published',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists reviews_booking_id_key on public.reviews(booking_id);
create index if not exists reviews_car_id_idx on public.reviews(car_id);
create index if not exists reviews_user_id_idx on public.reviews(user_id);
create index if not exists reviews_status_idx on public.reviews(status);

alter table public.users enable row level security;
alter table public.bookings enable row level security;
alter table public.refund_requests enable row level security;
alter table public.reviews enable row level security;
alter table public.cars enable row level security;
alter table public.car_locations enable row level security;
alter table public.payment_transactions enable row level security;

-- Public read access for active cars and allowed locations.
drop policy if exists "Allow public read access to cars" on public.cars;
drop policy if exists "Allow admin full access to cars" on public.cars;
drop policy if exists "Allow admin full access to users" on public.users;
drop policy if exists "Allow admin full access to bookings" on public.bookings;
drop policy if exists "Allow admin full access to checkout_settings" on public.checkout_settings;
drop policy if exists "Allow users to create bookings" on public.bookings;
drop policy if exists "Allow users to view their own bookings" on public.bookings;

drop policy if exists cars_public_read on public.cars;
create policy cars_public_read on public.cars
  for select
  using (is_available = true and status = 'active');

drop policy if exists car_locations_public_read on public.car_locations;
create policy car_locations_public_read on public.car_locations
  for select
  using (true);

-- Customer profile access.
drop policy if exists users_self_read on public.users;
create policy users_self_read on public.users
  for select
  using (auth.uid() = auth_user_id);

drop policy if exists users_self_update on public.users;
create policy users_self_update on public.users
  for update
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

-- Customers can see and create their own bookings; admins and staff are expected to use the service-role key server-side.
drop policy if exists bookings_self_read on public.bookings;
create policy bookings_self_read on public.bookings
  for select
  using (
    exists (
      select 1
      from public.users
      where users.id = bookings.user_id
        and users.auth_user_id = auth.uid()
    )
  );

drop policy if exists bookings_self_insert on public.bookings;
create policy bookings_self_insert on public.bookings
  for insert
  with check (
    exists (
      select 1
      from public.users
      where users.id = bookings.user_id
        and users.auth_user_id = auth.uid()
    )
  );

drop policy if exists bookings_self_update on public.bookings;
create policy bookings_self_update on public.bookings
  for update
  using (
    exists (
      select 1
      from public.users
      where users.id = bookings.user_id
        and users.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.users
      where users.id = bookings.user_id
        and users.auth_user_id = auth.uid()
    )
  );

-- Refund requests stay customer-scoped.
drop policy if exists refund_requests_self_read on public.refund_requests;
create policy refund_requests_self_read on public.refund_requests
  for select
  using (
    exists (
      select 1
      from public.users
      where users.id = refund_requests.user_id
        and users.auth_user_id = auth.uid()
    )
  );

drop policy if exists refund_requests_self_insert on public.refund_requests;
create policy refund_requests_self_insert on public.refund_requests
  for insert
  with check (
    exists (
      select 1
      from public.users
      where users.id = refund_requests.user_id
        and users.auth_user_id = auth.uid()
    )
  );

-- Reviews are public when published, but only owned users may create them.
drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read on public.reviews
  for select
  using (status = 'published');

drop policy if exists reviews_self_insert on public.reviews;
create policy reviews_self_insert on public.reviews
  for insert
  with check (
    exists (
      select 1
      from public.users
      where users.id = reviews.user_id
        and users.auth_user_id = auth.uid()
    )
  );

-- Payment transactions remain server-managed, but users can read their own records.
drop policy if exists payment_transactions_self_read on public.payment_transactions;
create policy payment_transactions_self_read on public.payment_transactions
  for select
  using (
    exists (
      select 1
      from public.users
      where users.id = payment_transactions.user_id
        and users.auth_user_id = auth.uid()
    )
  );

-- Optional storage bucket for admin uploads.
insert into storage.buckets (id, name, public)
values ('car-images', 'car-images', true)
on conflict (id) do nothing;

