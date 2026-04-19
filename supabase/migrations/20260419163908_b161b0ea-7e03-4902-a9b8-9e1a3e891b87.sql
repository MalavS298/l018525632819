CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS TABLE(active_members bigint, total_hours numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*) FROM public.profiles WHERE approved = true)::bigint AS active_members,
    COALESCE(
      (SELECT COALESCE(SUM(hours), 0) FROM public.submissions WHERE status = 'approved'),
      0
    ) + COALESCE(
      (SELECT COALESCE(SUM(total_hours), 0) FROM public.year_resets),
      0
    ) AS total_hours;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_stats() TO anon, authenticated;