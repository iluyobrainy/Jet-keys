-- Controlled Location Pricing SAFE REPAIR
-- Run this whole file in Supabase SQL Editor if any relation is missing.
-- It is idempotent: safe to run more than once.

create extension if not exists pgcrypto;

create table if not exists public.service_states (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  is_auto_priced boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.service_zones (
  id uuid primary key default gen_random_uuid(),
  state_id uuid not null references public.service_states(id) on delete cascade,
  name text not null,
  code text not null,
  description text,
  is_extension boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(state_id, code)
);

create table if not exists public.service_areas (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references public.service_zones(id) on delete cascade,
  name text not null,
  code text not null,
  surcharge_amount numeric(12,2) not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(zone_id, code)
);

create table if not exists public.car_service_coverage (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  state_id uuid not null references public.service_states(id) on delete cascade,
  rental_mode text not null default 'within_state',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(car_id, state_id, rental_mode)
);

alter table public.car_service_coverage drop constraint if exists car_service_coverage_rental_mode_check;
alter table public.car_service_coverage
  add constraint car_service_coverage_rental_mode_check check (rental_mode in ('within_state', 'interstate'));

create table if not exists public.car_pricing_rates (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  state_id uuid not null references public.service_states(id) on delete cascade,
  zone_id uuid references public.service_zones(id) on delete cascade,
  timing_package text not null,
  base_price numeric(12,2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists car_pricing_rates_unique_zone_rate
  on public.car_pricing_rates(car_id, state_id, coalesce(zone_id, '00000000-0000-0000-0000-000000000000'::uuid), timing_package);

alter table public.car_pricing_rates drop constraint if exists car_pricing_rates_timing_package_check;
alter table public.car_pricing_rates
  add constraint car_pricing_rates_timing_package_check check (timing_package in ('12h', '24h'));

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  quote_reference text not null unique,
  user_id uuid references public.users(id) on delete set null,
  car_id uuid references public.cars(id) on delete set null,
  rental_mode text not null,
  origin_state_id uuid references public.service_states(id) on delete set null,
  destination_state_id uuid references public.service_states(id) on delete set null,
  service_state_id uuid references public.service_states(id) on delete set null,
  timing_package text,
  pickup_date timestamptz not null,
  dropoff_date timestamptz not null,
  pickup_time text,
  dropoff_time text,
  pickup_address text not null,
  dropoff_address text not null,
  area_of_use text,
  trip_type text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  special_requests text,
  status text not null default 'new',
  quoted_amount numeric(12,2),
  admin_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.quote_requests drop constraint if exists quote_requests_rental_mode_check;
alter table public.quote_requests
  add constraint quote_requests_rental_mode_check check (rental_mode in ('within_state', 'interstate'));

alter table public.quote_requests drop constraint if exists quote_requests_status_check;
alter table public.quote_requests
  add constraint quote_requests_status_check check (status in ('new', 'reviewing', 'quoted', 'closed', 'converted'));

alter table public.bookings
  add column if not exists rental_mode text,
  add column if not exists service_state_id uuid references public.service_states(id) on delete set null,
  add column if not exists origin_state_id uuid references public.service_states(id) on delete set null,
  add column if not exists destination_state_id uuid references public.service_states(id) on delete set null,
  add column if not exists service_zone_id uuid references public.service_zones(id) on delete set null,
  add column if not exists service_area_id uuid references public.service_areas(id) on delete set null,
  add column if not exists pickup_address text,
  add column if not exists dropoff_address text,
  add column if not exists area_of_use text,
  add column if not exists timing_package text,
  add column if not exists billable_units integer,
  add column if not exists location_surcharge numeric(12,2) default 0,
  add column if not exists pricing_breakdown jsonb;

create index if not exists service_states_active_idx on public.service_states(is_active);
create index if not exists service_zones_state_id_idx on public.service_zones(state_id);
create index if not exists service_areas_zone_id_idx on public.service_areas(zone_id);
create index if not exists car_service_coverage_car_id_idx on public.car_service_coverage(car_id);
create index if not exists car_service_coverage_state_id_idx on public.car_service_coverage(state_id);
create index if not exists car_pricing_rates_car_id_idx on public.car_pricing_rates(car_id);
create index if not exists quote_requests_status_idx on public.quote_requests(status);
create index if not exists quote_requests_user_id_idx on public.quote_requests(user_id);
create index if not exists quote_requests_car_id_idx on public.quote_requests(car_id);

alter table public.service_states enable row level security;
alter table public.service_zones enable row level security;
alter table public.service_areas enable row level security;
alter table public.car_service_coverage enable row level security;
alter table public.car_pricing_rates enable row level security;
alter table public.quote_requests enable row level security;

drop policy if exists service_states_public_read on public.service_states;
create policy service_states_public_read on public.service_states for select using (is_active = true);

drop policy if exists service_zones_public_read on public.service_zones;
create policy service_zones_public_read on public.service_zones for select using (is_active = true);

drop policy if exists service_areas_public_read on public.service_areas;
create policy service_areas_public_read on public.service_areas for select using (is_active = true);

drop policy if exists car_service_coverage_public_read on public.car_service_coverage;
create policy car_service_coverage_public_read on public.car_service_coverage for select using (is_active = true);

drop policy if exists car_pricing_rates_public_read on public.car_pricing_rates;
create policy car_pricing_rates_public_read on public.car_pricing_rates for select using (is_active = true);

drop policy if exists quote_requests_self_read on public.quote_requests;
create policy quote_requests_self_read on public.quote_requests
  for select using (
    exists (
      select 1 from public.users
      where users.id = quote_requests.user_id
        and users.auth_user_id = auth.uid()
    )
  );

drop policy if exists quote_requests_self_insert on public.quote_requests;
create policy quote_requests_self_insert on public.quote_requests
  for insert with check (
    exists (
      select 1 from public.users
      where users.id = quote_requests.user_id
        and users.auth_user_id = auth.uid()
    )
  );

insert into public.service_states (name, code, is_auto_priced, sort_order)
values
  ('Lagos', 'lagos', true, 1),
  ('Abuja', 'abuja', true, 2),
  ('Other State', 'other', false, 999)
on conflict (code) do update set
  name = excluded.name,
  is_auto_priced = excluded.is_auto_priced,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

with lagos as (select id from public.service_states where code = 'lagos'),
     abuja as (select id from public.service_states where code = 'abuja')
insert into public.service_zones (state_id, name, code, description, is_extension, sort_order)
select lagos.id, 'Within Island', 'lagos_island_standard', 'Lekki, VI, Ikoyi and standard island movement', false, 1 from lagos
union all select lagos.id, 'Island Extension', 'lagos_island_extension', 'Ajah, Sangotedo, Ibeju Lekki, Epe and beyond', true, 2 from lagos
union all select lagos.id, 'Within Mainland', 'lagos_mainland_standard', 'Ikeja, Gbagada, Yaba and standard mainland movement', false, 3 from lagos
union all select lagos.id, 'Mainland Extension', 'lagos_mainland_extension', 'Ikorodu, Festac, Satellite, LASU, Isheri, Ojo and beyond', true, 4 from lagos
union all select abuja.id, 'Abuja Central', 'abuja_central', 'Central Abuja movement', false, 1 from abuja
union all select abuja.id, 'Abuja Extension', 'abuja_extension', 'Katampe Extension, Apo and outer Abuja movement', true, 2 from abuja
on conflict (state_id, code) do update set
  name = excluded.name,
  description = excluded.description,
  is_extension = excluded.is_extension,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

with zone_rows as (select id, code from public.service_zones)
insert into public.service_areas (zone_id, name, code, surcharge_amount, sort_order)
select z.id, area.name, area.code, area.surcharge, area.sort_order
from zone_rows z
join (values
  ('lagos_island_standard', 'Lekki Phase 1', 'lekki_phase_1', 0::numeric, 1),
  ('lagos_island_standard', 'Victoria Island', 'victoria_island', 0::numeric, 2),
  ('lagos_island_standard', 'Ikoyi', 'ikoyi', 0::numeric, 3),
  ('lagos_island_extension', 'Ajah', 'ajah', 0::numeric, 1),
  ('lagos_island_extension', 'Sangotedo', 'sangotedo', 0::numeric, 2),
  ('lagos_island_extension', 'Ibeju Lekki', 'ibeju_lekki', 0::numeric, 3),
  ('lagos_island_extension', 'Epe', 'epe', 0::numeric, 4),
  ('lagos_mainland_standard', 'Ikeja', 'ikeja', 0::numeric, 1),
  ('lagos_mainland_standard', 'Gbagada', 'gbagada', 0::numeric, 2),
  ('lagos_mainland_standard', 'Yaba', 'yaba', 0::numeric, 3),
  ('lagos_mainland_extension', 'Ikorodu', 'ikorodu', 0::numeric, 1),
  ('lagos_mainland_extension', 'Festac', 'festac', 0::numeric, 2),
  ('lagos_mainland_extension', 'Satellite', 'satellite', 0::numeric, 3),
  ('lagos_mainland_extension', 'LASU', 'lasu', 0::numeric, 4),
  ('lagos_mainland_extension', 'Isheri', 'isheri', 0::numeric, 5),
  ('lagos_mainland_extension', 'Ojo', 'ojo', 0::numeric, 6),
  ('abuja_central', 'Central Area', 'central_area', 0::numeric, 1),
  ('abuja_central', 'Wuse', 'wuse', 0::numeric, 2),
  ('abuja_central', 'Garki', 'garki', 0::numeric, 3),
  ('abuja_extension', 'Katampe Extension', 'katampe_extension', 0::numeric, 1),
  ('abuja_extension', 'Apo', 'apo', 0::numeric, 2)
) as area(zone_code, name, code, surcharge, sort_order) on area.zone_code = z.code
on conflict (zone_id, code) do update set
  name = excluded.name,
  surcharge_amount = public.service_areas.surcharge_amount,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

insert into public.car_service_coverage (car_id, state_id, rental_mode, is_active)
select cars.id, service_states.id, 'within_state', true
from public.cars
cross join public.service_states
where service_states.code in ('lagos', 'abuja')
on conflict (car_id, state_id, rental_mode) do nothing;

insert into public.car_pricing_rates (car_id, state_id, zone_id, timing_package, base_price, is_active)
select cars.id, service_states.id, service_zones.id, timing.package,
  case when timing.package = '12h' then round(cars.price_per_day * 0.75) else cars.price_per_day end,
  true
from public.cars
join public.service_states on service_states.code in ('lagos', 'abuja')
join public.service_zones on service_zones.state_id = service_states.id
cross join (values ('12h'), ('24h')) as timing(package)
on conflict do nothing;

select 'controlled location pricing safe repair completed' as result;