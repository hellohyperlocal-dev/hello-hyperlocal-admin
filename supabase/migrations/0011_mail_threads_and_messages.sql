-- ============================================================================
-- 0011_mail_threads_and_messages.sql
-- Unified mail threads, messages timeline, and initial registrations backfill.
-- ============================================================================

-- 1. Create mail_threads table
create table if not exists public.mail_threads (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid references public.registrations(id) on delete set null,
  subject text not null,
  sender_name text not null,
  sender_email text not null check (sender_email = lower(sender_email)),
  category text not null default 'general_enquiry',
  status text not null default 'unread' check (status in ('unread', 'read', 'replied', 'closed')),
  is_starred boolean not null default false,
  is_archived boolean not null default false,
  is_trashed boolean not null default false,
  snoozed_until timestamptz,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.mail_threads is 'Top-level conversation threads for the Mail app, linking to registrations or general inquiries.';

create index if not exists mail_threads_registration_id_idx on public.mail_threads(registration_id);
create index if not exists mail_threads_category_idx on public.mail_threads(category);
create index if not exists mail_threads_status_idx on public.mail_threads(status);
create index if not exists mail_threads_last_message_at_idx on public.mail_threads(last_message_at desc);
create index if not exists mail_threads_flags_idx on public.mail_threads(is_archived, is_trashed, is_starred);

-- RLS: Service role only (same security posture as registrations, invites, admin_activity_log)
alter table public.mail_threads enable row level security;

-- 2. Touch updated_at trigger for mail_threads
create or replace function public.touch_mail_threads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists mail_threads_touch_updated_at on public.mail_threads;
create trigger mail_threads_touch_updated_at
  before update on public.mail_threads
  for each row
  execute function public.touch_mail_threads_updated_at();

-- 3. Create mail_messages table
create table if not exists public.mail_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.mail_threads(id) on delete cascade,
  direction text not null default 'inbound' check (direction in ('inbound', 'outbound')),
  from_email text not null check (from_email = lower(from_email)),
  from_name text not null,
  to_email text not null check (to_email = lower(to_email)),
  to_name text not null,
  subject text not null,
  body_text text not null,
  body_html text,
  template_id text,
  sent_by_admin_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.mail_messages is 'Thread messages timeline, storing inbound submissions and outbound admin replies.';

create index if not exists mail_messages_thread_id_idx on public.mail_messages(thread_id, created_at asc);
create index if not exists mail_messages_direction_idx on public.mail_messages(direction);

alter table public.mail_messages enable row level security;

-- 4. Automatic Backfill: Populate existing registrations into mail_threads & initial inbound mail_messages
do $$
declare
  r record;
  new_thread_id uuid;
  role_label text;
  thread_subj text;
  thread_name text;
  info_text text;
begin
  for r in (
    select * from public.registrations
    order by created_at asc
  ) loop
    -- Skip if thread already exists for this registration
    if not exists (select 1 from public.mail_threads where registration_id = r.id) then
      -- Derive name
      thread_name := coalesce(r.full_name, nullif(trim(concat_ws(' ', r.first_name, r.last_name)), ''), r.business_name, r.email);

      -- Derive role label and subject
      if 'founding_business' = any(r.roles) or r.business_name is not null then
        role_label := 'Founding Business';
        thread_subj := 'Founding Business Application: ' || coalesce(r.business_name, thread_name);
      elsif 'founding_neighbour' = any(r.roles) then
        role_label := 'Founding Neighbour';
        thread_subj := 'Founding Neighbour Sign-up: ' || thread_name;
      elsif 'partner_interest' = any(r.roles) then
        role_label := 'Partner Interest';
        thread_subj := 'Partner Interest Enquiry: ' || thread_name;
      else
        role_label := 'General Enquiry';
        thread_subj := 'General Enquiry from ' || thread_name;
      end if;

      -- Build summary body
      info_text := 'New ' || lower(role_label) || ' registration submitted on Hello Linden.' || chr(10) || chr(10);
      if r.details is not null and r.details->>'message' is not null then
        info_text := r.details->>'message' || chr(10) || chr(10) || '--------------------------------------------------' || chr(10) || 'REGISTRATION SUMMARY' || chr(10);
      end if;

      info_text := info_text || 'Applicant: ' || thread_name || chr(10);
      info_text := info_text || 'Email: ' || r.email || chr(10);
      if r.mobile is not null then info_text := info_text || 'Mobile: ' || r.mobile || chr(10); end if;
      info_text := info_text || 'Category: ' || role_label || chr(10);
      if r.suburb is not null then info_text := info_text || 'Suburb: ' || r.suburb || chr(10); end if;
      if r.business_name is not null then info_text := info_text || 'Business: ' || r.business_name || chr(10); end if;
      if r.business_address is not null then info_text := info_text || 'Address: ' || r.business_address || chr(10); end if;
      if r.claimed_at is not null then
        info_text := info_text || 'Status: Claimed (' || to_char(r.claimed_at, 'YYYY-MM-DD') || ')' || chr(10);
      else
        info_text := info_text || 'Status: Unclaimed / Pending' || chr(10);
      end if;
      info_text := info_text || 'Submitted: ' || to_char(r.created_at, 'YYYY-MM-DD HH24:MI:SS');

      -- Insert thread
      insert into public.mail_threads (
        registration_id,
        subject,
        sender_name,
        sender_email,
        category,
        status,
        created_at,
        last_message_at
      ) values (
        r.id,
        thread_subj,
        thread_name,
        lower(r.email),
        coalesce(r.roles[1], 'general_enquiry'),
        case when r.claimed_at is not null then 'read' else 'unread' end,
        r.created_at,
        r.created_at
      ) returning id into new_thread_id;

      -- Insert initial message
      insert into public.mail_messages (
        thread_id,
        direction,
        from_email,
        from_name,
        to_email,
        to_name,
        subject,
        body_text,
        created_at
      ) values (
        new_thread_id,
        'inbound',
        lower(r.email),
        thread_name,
        'registrations@hellohyperlocal.co.za',
        'Hello Linden Desk',
        thread_subj,
        info_text,
        r.created_at
      );
    end if;
  end loop;
end $$;
