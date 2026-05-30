DROP POLICY IF EXISTS "livres_delete" ON public.livres;

CREATE POLICY "livres_delete" ON public.livres
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR
    proprietaire_email = (auth.jwt() ->> 'email')
  );
