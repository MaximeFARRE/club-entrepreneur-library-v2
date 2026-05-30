# Database Schema

PostgreSQL schema hosted on Supabase. All tables have Row Level Security (RLS) enabled.

---

## Tables

### `livres`

Stores the full book catalog.

```sql
CREATE TABLE livres (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titre              TEXT NOT NULL,
  auteur             TEXT NOT NULL,
  categorie          TEXT,
  proprietaire       TEXT NOT NULL,          -- Name of the club member who owns the book
  proprietaire_email TEXT NOT NULL,
  resume             TEXT,
  couverture         TEXT,                   -- URL of cover image (from Google Books or manual)
  disponibilite      TEXT NOT NULL DEFAULT 'Disponible'
                     CHECK (disponibilite IN ('Disponible', 'Indisponible', 'Archivé')),
  emprunte_par       TEXT,                   -- Name of current borrower, NULL if available
  date_ajout         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `emprunts`

Complete history of all borrowing activity.

```sql
CREATE TABLE emprunts (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_livre            BIGINT NOT NULL REFERENCES livres(id) ON DELETE CASCADE,
  emprunteur          TEXT NOT NULL,
  emprunteur_email    TEXT NOT NULL,
  emprunteur_telephone TEXT NOT NULL DEFAULT '',
  date_emprunt        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_retour_prevue  TIMESTAMPTZ NOT NULL,  -- date_emprunt + 30 days
  date_retour         TIMESTAMPTZ,           -- NULL = loan still active
  commentaire         TEXT DEFAULT ''
);
```

### `profiles` (optional — extends Supabase Auth)

Stores role information for authenticated users.

```sql
CREATE TABLE profiles (
  id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role  TEXT NOT NULL DEFAULT 'member'
        CHECK (role IN ('admin', 'member')),
  nom   TEXT
);

-- Automatically create a profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, nom)
  VALUES (
    NEW.id,
    'member',
    coalesce(NEW.raw_user_meta_data->>'nom', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## Indexes

```sql
-- Enforce unique active loan (at most one) per book
CREATE UNIQUE INDEX idx_emprunts_id_livre_active
  ON emprunts(id_livre)
  WHERE date_retour IS NULL;

-- Fast catalog search
CREATE INDEX idx_livres_disponibilite ON livres(disponibilite);
CREATE INDEX idx_livres_titre ON livres USING gin(to_tsvector('french', titre));
```

---

## Row Level Security (RLS)

```sql
-- livres: all authenticated users can read and insert (to share books); anyone can update (to borrow/return); admins or owners can delete
ALTER TABLE livres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "livres_select" ON livres
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "livres_insert" ON livres
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "livres_update" ON livres
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "livres_delete" ON livres
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR
    proprietaire_email = (auth.jwt() ->> 'email')
  );

-- emprunts: all authenticated users can read and insert; update is permitted for admins, the borrower, or the book owner
ALTER TABLE emprunts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "emprunts_select" ON emprunts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "emprunts_insert" ON emprunts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "emprunts_update" ON emprunts
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR
    emprunteur_email = (auth.jwt() ->> 'email')
    OR
    EXISTS (SELECT 1 FROM public.livres WHERE id = id_livre AND proprietaire_email = (auth.jwt() ->> 'email'))
  );

-- profiles: all authenticated users can read; users can update their own profile name; self-registration insert allowed for member role
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() AND role = 'member');
```

---

## Key Business Invariants

- A book can only have **one active loan** at a time (`date_retour IS NULL` on at most one `emprunts` row per `id_livre`).
- `disponibilite` must always reflect the active loan state: `Indisponible` if an active `emprunts` row exists, `Disponible` otherwise (unless `Archivé`).
- `date_retour_prevue` is always `date_emprunt + 30 days`, set at insert time.
- `emprunte_par` on `livres` mirrors the `emprunteur` of the active loan for quick display — it is derived data, kept in sync by the application layer.
