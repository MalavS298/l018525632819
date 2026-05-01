CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  email text,
  total_hours numeric,
  sync_hours numeric,
  async_hours numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id AS user_id,
    p.full_name,
    p.email,
    COALESCE(SUM(CASE WHEN s.status = 'approved' THEN s.hours ELSE 0 END), 0) AS total_hours,
    COALESCE(SUM(CASE WHEN s.status = 'approved' AND s.service_type = 'synchronous' THEN s.hours ELSE 0 END), 0) AS sync_hours,
    COALESCE(SUM(CASE WHEN s.status = 'approved' AND s.service_type = 'asynchronous' THEN s.hours ELSE 0 END), 0) AS async_hours
  FROM public.profiles p
  LEFT JOIN public.submissions s
    ON s.user_id = p.id
  WHERE p.approved = true
    AND auth.uid() IS NOT NULL
  GROUP BY p.id, p.full_name, p.email
  ORDER BY total_hours DESC, p.full_name ASC NULLS LAST, p.email ASC NULLS LAST;
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated;