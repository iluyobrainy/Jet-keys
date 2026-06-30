create table if not exists public.jet_requests (
  id uuid primary key default gen_random_uuid(),
  request_reference text not null unique,
  user_id uuid null references public.users(id) on delete set null,
  jet_id uuid null references public.jets(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  departure_location text not null,
  destination text not null,
  departure_date timestamptz not null,
  departure_time text null,
  return_date timestamptz null,
  return_time text null,
  passengers integer not null default 1,
  trip_type text not null default 'one_way',
  special_requests text null,
  status text not null default 'new',
  admin_notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jet_requests_status_check check (status in ('new', 'contacted', 'quoted', 'confirmed', 'closed')),
  constraint jet_requests_trip_type_check check (trip_type in ('one_way', 'round_trip', 'multi_city')),
  constraint jet_requests_passengers_check check (passengers > 0)
);

create index if not exists idx_jet_requests_user_id on public.jet_requests(user_id);
create index if not exists idx_jet_requests_jet_id on public.jet_requests(jet_id);
create index if not exists idx_jet_requests_status on public.jet_requests(status);
create index if not exists idx_jet_requests_created_at on public.jet_requests(created_at desc);

drop trigger if exists update_jet_requests_updated_at on public.jet_requests;
create trigger update_jet_requests_updated_at
before update on public.jet_requests
for each row execute function public.update_updated_at_column();

alter table public.jet_requests enable row level security;

drop policy if exists jet_requests_customer_insert on public.jet_requests;
create policy jet_requests_customer_insert on public.jet_requests
for insert
to public
with check (true);

drop policy if exists jet_requests_customer_read_own on public.jet_requests;
create policy jet_requests_customer_read_own on public.jet_requests
for select
to authenticated
using (
  user_id in (
    select id from public.users where auth_user_id = auth.uid()
  )
);

drop policy if exists jet_requests_admin_manage on public.jet_requests;
create policy jet_requests_admin_manage on public.jet_requests
for all
to authenticated
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

drop policy if exists jets_public_read_active on public.jets;
create policy jets_public_read_active on public.jets
for select
to public
using (is_available = true and status = 'active');

drop policy if exists jets_admin_manage on public.jets;
create policy jets_admin_manage on public.jets
for all
to authenticated
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());
