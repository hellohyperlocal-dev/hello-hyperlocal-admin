-- ============================================================================
-- 0014_secure_profile_private_data.sql
-- Security Hardening: Isolate Sensitive Citizen PII (Phone numbers & Street addresses)
--
-- Closes P0 security vulnerability: Prevents any authenticated resident or attacker
-- from scraping neighbours' physical addresses and phone numbers.
-- ============================================================================

-- 1. Create dedicated private details table with owner-only access
create table if not exists public.profile_private_details (
  id uuid primary key references public.profiles(id) on delete cascade,
  phone_number text,
  street_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profile_private_details is
  'Sensitive personal contact details and residential addresses. Protected by owner-only RLS policies.';

-- Enable RLS
alter table public.profile_private_details enable row level security;

-- Strict owner-only policies
create policy "private_details_select_own" on public.profile_private_details
  for select using (auth.uid() = id);

create policy "private_details_insert_own" on public.profile_private_details
  for insert with check (auth.uid() = id);

create policy "private_details_update_own" on public.profile_private_details
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "private_details_delete_own" on public.profile_private_details
  for delete using (auth.uid() = id);

-- 2. Migrate existing sensitive data from public.profiles
insert into public.profile_private_details (id, phone_number, street_address)
select id, phone_number, street_address
from public.profiles
where phone_number is not null or street_address is not null
on conflict (id) do update
set phone_number = excluded.phone_number,
    street_address = excluded.street_address;

-- 3. Drop sensitive columns from public.profiles so they can never be scraped
alter table public.profiles
  drop column if exists phone_number,
  drop column if exists street_address;

-- 4. Allow users to delete their own profile (fixing the account deletion failure)
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- 5. Update the website registration claiming trigger so mobile and address
-- are routed into public.profile_private_details instead of public.profiles
create or replace function public.link_registration_on_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
  reg public.registrations%rowtype;
begin
  select lower(u.email) into user_email
  from auth.users u
  where u.id = new.id;

  if user_email is null then
    return new;
  end if;

  select * into reg
  from public.registrations r
  where r.email = user_email
    and r.claimed_at is null
  limit 1;

  if not found then
    return new;
  end if;

  new.full_name := coalesce(
    new.full_name,
    reg.full_name,
    nullif(trim(concat_ws(' ', reg.first_name, reg.last_name)), '')
  );
  new.business_name := coalesce(new.business_name, reg.business_name);

  if 'business' = any (reg.roles) and new.role = 'resident' then
    new.role := 'business';
  end if;

  -- Insert or update private contact information into profile_private_details
  if reg.mobile is not null or reg.business_address is not null then
    insert into public.profile_private_details (id, phone_number, street_address)
    values (new.id, reg.mobile, reg.business_address)
    on conflict (id) do update
    set phone_number = coalesce(public.profile_private_details.phone_number, excluded.phone_number),
        street_address = coalesce(public.profile_private_details.street_address, excluded.street_address),
        updated_at = now();
  end if;

  update public.registrations
  set claimed_profile_id = new.id,
      claimed_at = now()
  where id = reg.id;

  return new;
end;
$$;
