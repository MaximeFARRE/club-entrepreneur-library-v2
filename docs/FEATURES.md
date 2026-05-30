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
- Button "Relancer les retardataires" (admin only): triggers active overdue reminder emails via Brevo to all overdue borrowers in one click

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

**Purpose**: Add a new book to the catalog (to lend to other members).

**ISBN auto-fill flow:**
1. User enters an ISBN.
2. App calls the [Google Books API](https://www.googleapis.com/books/v1/volumes?q=isbn:{ISBN}).
3. Fields pre-filled: title, author, category, summary, cover image URL.
4. User's own name and email are pre-filled as default owner name/email.
5. User can override any pre-filled or default field before saving.

**Manual entry**: all fields filled by hand if no ISBN.

**Required fields**: titre, auteur, proprietaire, proprietaire_email.
**Optional fields**: categorie, resume, couverture.

**Access**: all authenticated users (members and admins).

---

## 4. Emprunter (`/emprunter`)

**Purpose**: Record a new loan.

**Flow:**
1. User selects a book (only available books shown).
2. User enters borrower's phone number (name and email are resolved automatically from the authenticated user's session).
3. User optionally adds a comment.
4. On submit:
   - Validate book is still available (race condition guard).
   - Set `disponibilite = 'Indisponible'` and `emprunte_par = borrowerName` on `livres`.
   - Insert a row in `emprunts` with `emprunteur_telephone` and `date_retour_prevue = NOW() + 30 days`.
   - Send handoff email notifications via Brevo to the **borrower** and **owner** (failures are silent — do not block the borrow).

**Email to borrower**: confirms loan, gives due date, gives owner's contact info (name and email).
**Email to owner**: notifies their book was borrowed, gives borrower's contact info (name, email, and telephone) and due date.

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

**Access**: all authenticated users.

---

## 6. Historique (`/historique`)

**Purpose**: Full ledger of all past and active loans.

**Display**: table sorted by `date_emprunt DESC`.

**Columns**: book title, borrower, borrow date, expected return date, actual return date, status indicator.

**Status color coding** (applied to each row):
- 🟢 Green: loan closed (returned on time), or active with more than 7 days remaining
- 🟠 Orange: active loan with 7 days or fewer remaining
- 🔴 Red: active loan past the due date (overdue), or returned late

**Logic** (`determineStatusColor`):
```
if date_retour is not null:
  if date_retour <= date_retour_prevue → GREEN
  else → RED
if date_retour_prevue < NOW() → RED (overdue)
if (date_retour_prevue - NOW()) <= 7 days → ORANGE (due soon)
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

**Login page (`/login`)**: email + password via Supabase Auth. Allows navigation to signup.

**Signup page (`/signup`)**: full name, email, and password via Supabase Auth. Registers the user and triggers automatic creation of a default profile mapping the user's name.

**Route protection**: Next.js `middleware.ts` redirects unauthenticated users to `/login`.

**Roles**:
- `member`: read catalog, borrow, return, view history, dashboard, register books, and access personal space.
- `admin`: everything above + edit, archive, delete books + access manage books page + "Relancer" button.

Role stored in `profiles.role`. Checked server-side in Server Actions and Server Components.

---

## 9. Notifications (Overdue Reminders)

**Trigger**: daily Vercel Cron job → `GET /api/notifications` (sends actual overdue email reminders via Brevo using service-role access).

**Logic**: fetch all active loans where `date_retour_prevue < NOW()`. For each, send an email reminder to the borrower.

**Manual trigger**: "Relancer les retardataires" button on the dashboard (admin only) — triggers email reminders to late borrowers via Brevo.

**Monthly Recap**: monthly Vercel Cron job → `GET /api/notifications/monthly` aggregates all active shared books by owner and sends a monthly recap email thanking members for their contributions.

**Failures are silent**: email errors must never break the borrowing or return flow.

---

## 10. ISBN Lookup

**API**: Google Books — `https://www.googleapis.com/books/v1/volumes?q=isbn:{ISBN}`

**Fields extracted**:
- `volumeInfo.title` → titre
- `volumeInfo.authors` (joined with comma) → auteur
- `volumeInfo.categories` (joined with comma) → categorie
- `volumeInfo.description` → resume
- `volumeInfo.imageLinks.thumbnail` (http replaced with https) → couverture

**Error handling**: if ISBN not found or API unreachable, show a message and let the user fill fields manually. Never block the form.

---

## 11. Mon Espace (`/profil`)

**Purpose**: Personal user dashboard and settings.

**Features:**
- **Stats Card Grid**: displays active borrows count, total history borrows count, count of books owned by user currently lent to others, and total books owned.
- **Mes emprunts en cours**: displays grid of currently borrowed books by the user, with title, author, cover, return due date, and relative delay color status (🟢/🟠/🔴).
- **Mes livres partagés**: displays a list of books owned by the user. If a book is lent out, shows **who holds it** (borrower's name and email) and the return due date. Also allows the book owner to delete their book (along with its borrow history).
- **Mon Historique d'emprunts**: list of past completed borrowings.
- **Modifier mes infos**: side form allowing users to update their full name.
- **Supprimer un livre**: book owners can delete their own shared books (which deletes the history too), while admins can delete any book.

**Access**: all authenticated users.


---

## 12. Origine & Crédits (`/credits`)

**Purpose**: Present the history and creators of the project.

**Features:**
- A detailed timeline outlining the evolution of the application from the V1 prototype (Python/Streamlit) to the current version.
- Contributor profiles (such as the Lead Developer, Maxime FARRE) highlighting their specific roles and contributions.
- Clear details regarding the supervising Mandate and the Club.

**Access**: all authenticated users via a discreet footer link.
