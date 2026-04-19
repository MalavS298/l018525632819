-- Add last_reset_at to app_settings
ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS last_reset_at timestamp with time zone;

-- Table to record completed school years (snapshots taken at reset time)
CREATE TABLE IF NOT EXISTS public.year_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  period_start timestamp with time zone NOT NULL,
  period_end timestamp with time zone NOT NULL,
  total_submissions integer NOT NULL DEFAULT 0,
  total_hours numeric NOT NULL DEFAULT 0,
  sync_hours numeric NOT NULL DEFAULT 0,
  async_hours numeric NOT NULL DEFAULT 0,
  per_user_stats jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.year_resets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view year resets"
ON public.year_resets
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert year resets"
ON public.year_resets
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update year resets"
ON public.year_resets
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete year resets"
ON public.year_resets
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));