-- Allow a user to create their own profile row.
-- Normally the SECURITY DEFINER trigger handle_new_user() inserts it at signup,
-- but the application fallback in getUserProfile() was silently blocked by RLS
-- (no INSERT policy existed). Restrict role to 'member' to prevent privilege
-- escalation via a forged insert.
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() AND role = 'member');
