# Roadmap

Features to implement for v2. All features from v1 are ported here, adapted for the new stack.

---

## Phase 1 — Foundation (implement first)

These are blockers for everything else.

- [x] **Project scaffolding**: `npx create-next-app` with TypeScript, Tailwind CSS, App Router
- [x] **Supabase setup**: apply schema from `DATABASE_SCHEMA.md`, generate TypeScript types
- [x] **Authentication**: Supabase Auth login page + middleware route protection + roles (admin/member)
- [x] **Supabase client helpers**: server client (`src/lib/supabase/server.ts`) and browser client (`src/lib/supabase/client.ts`)
- [x] **TypeScript types**: `Livre`, `Emprunt`, `Profile`, `LoanStatus` in `src/types/index.ts`
- [x] **Environment config**: `.env.local.example` committed, `.env.local` gitignored

---

## Phase 2 — Core Features

- [x] **Catalogue** (`/catalogue`): list books with quick filter buttons (Tous / Disponibles / Empruntés) and free-text search
- [x] **Emprunter** (`/emprunter`): record a loan — select available book, enter borrower info, submit
- [x] **Rendre** (`/rendre`): record a return — select borrowed book, confirm, submit
- [x] **Ajouter un livre** (`/ajouter`): add a book manually (now available to all authenticated users)
- [x] **Dashboard** (`/`): key metrics (total, available, borrowed, overdue count)

---

## Phase 3 — Enhanced Features

- [x] **ISBN auto-fill**: Google Books API integration on the add-book page (now captures and binds categories too)
- [x] **Historique** (`/historique`): full borrow history table with 🟢/🟠/🔴 color-coded status
- [x] **Gérer les livres** (`/gerer`): admin page — edit, archive, delete books; show active borrow status per book
- [-] **Notifications**: Resend email integration (deliberately paused/put aside for now)
- [x] **Dashboard — overdue list**: display late loans sorted by days overdue
- [x] **Dashboard — "Relancer les retardataires"**: admin button to trigger overdue reminders (currently logs to server console as emails are paused)
- [x] **User Account Creation**: Sign up page (`/signup`) with display name registration
- [x] **Mon Espace**: Personal user dashboard (`/profil`) for tracking borrowed books, shared books (and who holds them), borrow history, stats, and updating name

---

## Phase 4 — Production Polish

- [x] **Vercel Cron**: daily overdue reminder triggers via `/api/notifications` (logs late loans since email is paused)
- [x] **Vercel deployment**: connect GitHub repo, set env vars, confirm auto-deploy
- [x] **RLS audit**: verify Supabase Row Level Security policies are correct
- [x] **Error handling**: user-facing error messages for failed actions (form validation, API errors)
- [/] **Loading states**: skeleton loaders or spinners for async operations (in progress)
- [/] **Mobile responsiveness**: test and fix layout on small screens (in progress)
- [x] **Unit tests**: core business logic & services unit tested using Vitest (39 tests running)

---

## Nice to Have (post-launch)

- [ ] Cover image upload to Supabase Storage (instead of relying on external URLs)
- [ ] Barcode scanner support on mobile for ISBN input
- [ ] Statistics page: most borrowed books, most active borrowers, average return time
- [ ] Dark mode
