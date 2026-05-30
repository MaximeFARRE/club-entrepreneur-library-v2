DROP POLICY IF EXISTS "livres_insert" ON public.livres;

CREATE POLICY "livres_insert" ON public.livres
  FOR INSERT TO authenticated
  WITH CHECK (true);
