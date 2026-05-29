# Feature Specifications

Complete specification of all features, including business rules extracted from v1.
This document is the source of truth for implementation.

---

## 1. Dashboard (`/`)

**Purpose**: Instant overview of the library's health.

**Metrics to display:**
- Total number of books (excluding archived)
- Number of available books (`disponibilite = 'Disponible'`)
- Number of books currently borrowed (`disponibilite = 'Indisponible'`)
- Number of overdue loans (active loans where `date_retour_prevue < NOW()`)

**Additional elements:**
- List of overdue loans: borrower name, book title, days overdue (sorted by most overdue first)
- Button "Relancer les retardataires" (admin only): triggers overdue reminder emails to all overdue borrowers in one click

**Access**: all authenticated users (read); "Relancer" button admin only.

---

## 2. Catalogue (`/catalogue`)

**Purpose**: Browse the full book collection.

**Display**: Card or table view per book — cover image, title, author, category, owner, availability status.

**Filters (quick buttons, not a dropdown):**
- `Tous` — all non-archived books
- `Disponibles` — `disponibilite = 'Disponible'`
- `Empruntés` — `disponibilite = 'Indisponible'`

**Search**: free-text search on title and author.

**Access**: all authenticated users.

---

## 3. Ajouter un livre (`/ajouter`)

**Purpose**: Add a new book to the catalog.

**ISBN auto-fill flow:**
1. User enters or scans an ISBN.
2. App calls the [Google Books API](https://www.googleapis.com/books/v1/volumes?q=isbn:{ISBN}).
3. Fields pre-filled: title, author, summary, cover image URL.
4. User fills in the remaining fields manually: category, owner name, owner email.
5. User can override any pre-filled field before saving.

**Manual entry**: all fields filled by hand if no ISBN.

**Required fields**: titre, auteur, proprietaire, proprietaire_email.
**Optional fields**: categorie, resume, couverture.

**Access**: admin only.

---

## 4. Emprunter (`/emprunter`)

**Purpose**: Record a new loan.

**Flow:**
1. User selects a book (only available books shown).
2. User enters borrower name and email.
3. User optionally adds a comment.
4. On submit:
   - Validate book is still available (race condition guard).
   - Set `disponibilite = 'Indisponible'` and `emprunte_par = borrowerName` on `livres`.
   - Insert a row in `emprunts` with `date_retour_prevue = NOW() + 30 days`.
   - Send confirmation email to **borrower** and **owner** (failures are silent — do not block the borrow).

**Email to borrower**: confirms loan, gives due date, gives owner's contact info.
**Email to owner**: notifies their book was borrowed, gives borrower's contact info and due date.

**Access**: all authenticated users.

---

## 5. Rendre (`/rendre`)

**Purpose**: Record a book return.

**Flow:**
1. User selects a book from the currently borrowed books list.
2. User optionally adds a comment.
3. On submit:
   - Set `disponibilite = 'Disponible'` and `emprunte_par = NULL` on `livres`.
   - Close the active loan: set `date_retour = NOW()` and save comment on `emprunts`.
   - Send confirmation email to **borrower** and **owner** (failures are silent).

**Email to owner**: confirms return, gives actual return date, flags if returned late.
**Email to borrower**: confirms return registered, thanks them.

**Access**: all authenticated users.

---

## 6. Historique (`/historique`)

**Purpose**: Full ledger of all past and active loans.

**Display**: table sorted by `date_emprunt DESC`.

**Columns**: book title, borrower, borrow date, expected return date, actual return date, status indicator.

**Status color coding** (applied to each row):
- 🟢 Green: loan closed (returned), or active with more than 3 days remaining
- 🟠 Orange: active loan with 3 days or fewer remaining
- 🔴 Red: active loan past the due date (overdue)

**Logic** (`determineStatusColor`):
```
if date_retour is not null → GREEN (returned)
if date_retour_prevue < NOW() → RED (overdue)
if (date_retour_prevue - NOW()) <= 3 days → ORANGE (due soon)
else → GREEN
```

**Access**: all authenticated users.

---

## 7. Gérer les livres (`/gerer`)

**Purpose**: Admin interface for full book management.

**Features:**
- View all books including archived ones
- For each book: show active borrow status (borrower name, due date, days remaining/overdue)
- Edit any book field (title, author, category, owner, cover, summary, availability)
- Archive a book (sets `disponibilite = 'Archivé'`, clears `emprunte_par`)
- Delete a book and its full borrow history (requires confirmation)

**Color coding on due dates**: same rules as Historique (🟢/🟠/🔴).

**Access**: admin only.

---

## 8. Authentication

**Login page (`/login`)**: email + password via Supabase Auth.

**Route protection**: Next.js `middleware.ts` redirects unauthenticated users to `/login`.

**Roles**:
- `member`: read catalog, borrow, return, view history and dashboard.
- `admin`: everything above + add, edit, archive, delete books + "Relancer" button.

Role stored in `profiles.role`. Checked server-side in Server Actions and Server Components.

---

## 9. Notifications (Overdue Reminders)

**Trigger**: daily Vercel Cron job → `POST /api/notifications`.

**Logic**: fetch all active loans where `date_retour_prevue < NOW()`. For each, send a reminder email to the borrower.

**Email content**: book title, owner, borrow date, due date, number of days overdue.

**Manual trigger**: "Relancer les retardataires" button on the dashboard (admin only) — calls the same logic on demand.

**Failures are silent**: email errors must never break the borrowing or return flow.

---

## 10. ISBN Lookup

**API**: Google Books — `https://www.googleapis.com/books/v1/volumes?q=isbn:{ISBN}`

**Fields extracted**:
- `volumeInfo.title` → titre
- `volumeInfo.authors[0]` → auteur
- `volumeInfo.description` → resume
- `volumeInfo.imageLinks.thumbnail` → couverture

**Error handling**: if ISBN not found or API unreachable, show a message and let the user fill fields manually. Never block the form.
