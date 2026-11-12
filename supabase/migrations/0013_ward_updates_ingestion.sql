-- Migration: 0013_ward_updates_ingestion.sql
-- Description: Add fields for automated WhatsApp/Channel ingestion, push summaries, and deduplication

alter table ward_updates
  add column if not exists summary text,
  add column if not exists dedup_hash text unique,
  add column if not exists source_name text default 'Admin',
  add column if not exists is_auto_ingested boolean default false,
  add column if not exists is_political boolean default false;

create index if not exists idx_ward_updates_dedup_hash on ward_updates(dedup_hash);
create index if not exists idx_ward_updates_auto_ingested on ward_updates(is_auto_ingested);
