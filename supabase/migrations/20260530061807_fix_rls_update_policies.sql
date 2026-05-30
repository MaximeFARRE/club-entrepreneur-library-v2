DROP POLICY IF EXISTS "livres_update" ON public.livres;

CREATE POLICY "livres_update" ON public.livres
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "emprunts_update" ON public.emprunts;

CREATE POLICY "emprunts_update" ON public.emprunts
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR
    emprunteur_email = (auth.jwt() ->> 'email')
    OR
    EXISTS (SELECT 1 FROM public.livres WHERE id = id_livre AND proprietaire_email = (auth.jwt() ->> 'email'))
  );
