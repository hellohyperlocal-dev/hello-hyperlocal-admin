-- Migration 0017: Email Designer Templates
-- Persistent storage for custom email designs created via the RGE Studio-style builder.

CREATE TABLE IF NOT EXISTS public.email_designer_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  subject TEXT DEFAULT '',
  preheader TEXT DEFAULT '',
  design JSONB NOT NULL DEFAULT '{}'::jsonb,
  html_content TEXT DEFAULT '',
  thumbnail_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for quick sorting by recency
CREATE INDEX IF NOT EXISTS idx_email_designer_templates_updated_at 
  ON public.email_designer_templates(updated_at DESC);

-- Enable RLS
ALTER TABLE public.email_designer_templates ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admins to view and manage templates
CREATE POLICY "Admins can view email designer templates"
  ON public.email_designer_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create email designer templates"
  ON public.email_designer_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update email designer templates"
  ON public.email_designer_templates
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete email designer templates"
  ON public.email_designer_templates
  FOR DELETE
  TO authenticated
  USING (true);
