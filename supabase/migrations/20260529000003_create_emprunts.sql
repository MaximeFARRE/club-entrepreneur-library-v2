CREATE TABLE emprunts (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_livre           BIGINT NOT NULL REFERENCES livres(id) ON DELETE CASCADE,
  emprunteur         TEXT NOT NULL,
  emprunteur_email   TEXT NOT NULL,
  date_emprunt       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_retour_prevue TIMESTAMPTZ NOT NULL,
  date_retour        TIMESTAMPTZ,
  commentaire        TEXT DEFAULT ''
);

CREATE INDEX idx_emprunts_id_livre_active
  ON emprunts(id_livre)
  WHERE date_retour IS NULL;

ALTER TABLE emprunts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "emprunts_select" ON emprunts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "emprunts_insert" ON emprunts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "emprunts_update" ON emprunts
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "emprunts_delete" ON emprunts
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
