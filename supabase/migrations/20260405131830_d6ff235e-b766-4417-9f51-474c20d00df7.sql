ALTER TABLE public.profiles ADD COLUMN approved boolean NOT NULL DEFAULT false;

-- Allow admins to update any profile (for approving users)
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE TO public
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));