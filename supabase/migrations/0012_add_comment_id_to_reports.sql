-- ============================================================================
-- 0012_add_comment_id_to_reports.sql
-- Add comment_id to reports table to enable full comment moderation and reporting.
-- ============================================================================

alter table public.reports
  add column if not exists comment_id uuid references public.post_comments(id) on delete cascade;

create index if not exists reports_comment_id_idx on public.reports(comment_id);

comment on column public.reports.comment_id is 'Optional reference to a reported comment. If null, the report targets the post itself.';
