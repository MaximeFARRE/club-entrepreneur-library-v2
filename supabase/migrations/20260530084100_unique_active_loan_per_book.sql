-- Enforce at most one active loan (date_retour IS NULL) per book at the DB level.
-- The previous index was non-unique, so a borrow race could create two active
-- loans for the same book, which then broke getActiveLoanForBook()'s .single().
DROP INDEX IF EXISTS idx_emprunts_id_livre_active;

CREATE UNIQUE INDEX idx_emprunts_id_livre_active
  ON emprunts(id_livre)
  WHERE date_retour IS NULL;
