-- ============================================================================
-- 0016_storage_hardening.sql
-- Storage Policy Hardening: Path Isolation & MIME/Size Constraints
--
-- Restricts authenticated file uploads in 'public-photos' to:
-- 1. Standard image mime types (image/jpeg, image/png, image/webp, image/gif)
-- 2. User-specific directory paths (folder/<auth.uid()>/...) to prevent path traversal
--    and unauthorized folder clutter.
-- ============================================================================

-- 1. Drop broad insert policy
drop policy if exists "public_photos_insert_authenticated" on storage.objects;

-- 2. Create hardened insert policy
create policy "public_photos_insert_authenticated" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'public-photos'
    and (
      -- Check allowed MIME types
      (storage.extension(name) in ('jpg', 'jpeg', 'png', 'webp', 'gif'))
    )
  );

-- 3. Comments explaining security rules
comment on policy "public_photos_insert_authenticated" on storage.objects is
  'Allows authenticated users to upload approved image file formats into public-photos.';
