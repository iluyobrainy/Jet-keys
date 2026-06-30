-- Controlled location pricing prerequisite tables
-- Run this first if Supabase says relation "public.service_states" does not exist.

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

select 'service location prerequisite tables created' as result;