CREATE TABLE livres (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titre              TEXT NOT NULL,
  auteur             TEXT NOT NULL,
  categorie          TEXT,
  proprietaire       TEXT NOT NULL,
  proprietaire_email TEXT NOT NULL,
  resume             TEXT,
  couverture         TEXT,
  disponibilite      TEXT NOT NULL DEFAULT 'Disponible'
                     CHECK (disponibilite IN ('Disponible', 'Indisponible', 'Archivé')),
  emprunte_par       TEXT,
  date_ajout         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_livres_disponibilite ON livres(disponibilite);
CREATE INDEX idx_livres_titre ON livres USING gin(to_tsvector('french', titre));

ALTER TABLE livres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "livres_select" ON livres
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "livres_insert" ON livres
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "livres_update" ON livres
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "livres_delete" ON livres
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
