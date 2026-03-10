-- Harden customer usernames and enable browser-based admin auth policies.

create extension if not exists pgcrypto;

update public.users
set
  name = split_part(lower(email), '@', 1),
  updated_at = timezone('utc', now())
where coalesce(trim(name), '') = ''
  and coalesce(email, '') <> '';

with ranked_names as (
  select
    id,
    row_number() over (
      partition by lower(trim(name))
      order by created_at nulls first, id
    ) as duplicate_rank
  from public.users
  where coalesce(trim(name), '') <> ''
)
update public.users as users
set
  name = concat(
    regexp_replace(lower(trim(users.name)), '[^a-z0-9_.-]+', '_', 'g'),
    '_',
    substr(users.id::text, 1, 4)
  ),
  updated_at = timezone('utc', now())
from ranked_names
where ranked_names.id = users.id
  and ranked_names.duplicate_rank > 1;

create unique index if not exists users_name_lower_key
  on public.users ((lower(trim(name))));

create index if not exists users_name_lookup_idx
  on public.users ((lower(trim(name))));

update public.users
set
  role = 'admin',
  updated_at = timezone('utc', now())
where lower(email) = 'admin@jetandkeys.com'
  and coalesce(role, 'customer') not in ('admin', 'staff');

create or replace function public.is_admin_or_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where auth_user_id = auth.uid()
      and role in ('admin', 'staff')
      and coalesce(is_active, true) = true
  );
$$;

revoke all on function public.is_admin_or_staff() from public;
grant execute on function public.is_admin_or_staff() to anon, authenticated, service_role;

alter table public.jets enable row level security;
alter table public.locations enable row level security;
alter table public.checkout_settings enable row level security;
alter table public.website_settings enable row level security;

drop policy if exists users_admin_read on public.users;
create policy users_admin_read on public.users
  for select
  using (public.is_admin_or_staff());

drop policy if exists users_admin_update on public.users;
create policy users_admin_update on public.users
  for update
  using (public.is_admin_or_staff())
  with check (public.is_admin_or_staff());

drop policy if exists cars_admin_manage on public.cars;
create policy cars_admin_manage on public.cars
  for all
  using (public.is_admin_or_staff())
  with check (public.is_admin_or_staff());

drop policy if exists jets_admin_manage on public.jets;
create policy jets_admin_manage on public.jets
  for all
  using (public.is_admin_or_staff())
  with check (public.is_admin_or_staff());

drop policy if exists locations_admin_manage on public.locations;
create policy locations_admin_manage on public.locations
  for all
  using (public.is_admin_or_staff())
  with check (public.is_admin_or_staff());

drop policy if exists car_locations_admin_manage on public.car_locations;
create policy car_locations_admin_manage on public.car_locations
  for all
  using (public.is_admin_or_staff())
  with check (public.is_admin_or_staff());

drop policy if exists bookings_admin_manage on public.bookings;
create policy bookings_admin_manage on public.bookings
  for all
  using (public.is_admin_or_staff())
  with check (public.is_admin_or_staff());

drop policy if exists refund_requests_admin_manage on public.refund_requests;
create policy refund_requests_admin_manage on public.refund_requests
  for all
  using (public.is_admin_or_staff())
  with check (public.is_admin_or_staff());

drop policy if exists reviews_admin_manage on public.reviews;
create policy reviews_admin_manage on public.reviews
  for all
  using (public.is_admin_or_staff())
  with check (public.is_admin_or_staff());

drop policy if exists payment_transactions_admin_manage on public.payment_transactions;
create policy payment_transactions_admin_manage on public.payment_transactions
  for all
  using (public.is_admin_or_staff())
  with check (public.is_admin_or_staff());

drop policy if exists checkout_settings_admin_manage on public.checkout_settings;
create policy checkout_settings_admin_manage on public.checkout_settings
  for all
  using (public.is_admin_or_staff())
  with check (public.is_admin_or_staff());

drop policy if exists website_settings_admin_manage on public.website_settings;
create policy website_settings_admin_manage on public.website_settings
  for all
  using (public.is_admin_or_staff())
  with check (public.is_admin_or_staff());

drop policy if exists car_images_public_read on storage.objects;
create policy car_images_public_read on storage.objects
  for select
  using (bucket_id = 'car-images');

drop policy if exists car_images_admin_manage on storage.objects;
create policy car_images_admin_manage on storage.objects
  for all
  using (bucket_id = 'car-images' and public.is_admin_or_staff())
  with check (bucket_id = 'car-images' and public.is_admin_or_staff());
