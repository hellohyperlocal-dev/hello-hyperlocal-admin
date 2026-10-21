-- ============================================================================
-- 0015_account_deletion_rpc.sql
-- Complete Self-Service Account Deletion (POPIA Section 24 & App Store Guideline 5.1.1(v))
--
-- Enables authenticated users to permanently wipe their account, authored content,
-- private personal data, and auth.users identity in a single transaction.
-- ============================================================================

-- 1. Loosen foreign key constraints on reference tables to prevent deletion blocks
alter table if exists public.registrations
  drop constraint if exists registrations_claimed_profile_id_fkey,
  add constraint registrations_claimed_profile_id_fkey
    foreign key (claimed_profile_id) references public.profiles(id) on delete set null;

alter table if exists public.invites
  drop constraint if exists invites_invited_by_fkey,
  add constraint invites_invited_by_fkey
    foreign key (invited_by) references public.profiles(id) on delete set null;

alter table if exists public.reports
  drop constraint if exists reports_resolved_by_fkey,
  add constraint reports_resolved_by_fkey
    foreign key (resolved_by) references public.profiles(id) on delete set null;

-- 2. Define the security definer deletion function
create or replace function public.delete_current_user()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Disassociate non-cascade reference pointers
  update public.registrations
  set claimed_profile_id = null,
      claimed_at = null
  where claimed_profile_id = current_user_id;

  update public.invites
  set invited_by = null
  where invited_by = current_user_id;

  update public.reports
  set resolved_by = null
  where resolved_by = current_user_id;

  -- Delete connections and messages
  delete from public.connections
  where requester_id = current_user_id or recipient_id = current_user_id;

  delete from public.messages
  where sender_id = current_user_id;

  -- Delete authored listings and content
  delete from public.marketplace_listings where author_id = current_user_id;
  delete from public.love_local_offers where author_id = current_user_id;
  delete from public.whats_on_events where author_id = current_user_id;
  delete from public.local_businesses where owner_id = current_user_id;
  delete from public.ward_updates where councillor_id = current_user_id;

  -- Delete authored comments and posts
  delete from public.post_comments where author_id = current_user_id;
  delete from public.community_posts where author_id = current_user_id;

  -- Delete reports filed by this user
  delete from public.reports where reporter_id = current_user_id;

  -- Delete private contact details and profile record
  delete from public.profile_private_details where id = current_user_id;
  delete from public.profiles where id = current_user_id;

  -- Permanently purge authentication record from auth.users
  delete from auth.users where id = current_user_id;
end;
$$;

-- 3. Execution permissions: authenticated users only
revoke all on function public.delete_current_user() from public, anon;
grant execute on function public.delete_current_user() to authenticated;

comment on function public.delete_current_user() is
  'Transactional self-service account deletion. Purges user content, private PII, and the auth.users authentication record.';
