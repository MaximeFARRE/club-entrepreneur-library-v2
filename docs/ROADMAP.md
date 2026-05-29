# Roadmap

Features to implement for v2. All features from v1 are ported here, adapted for the new stack.

---

## Phase 1 — Foundation (implement first)

These are blockers for everything else.

- [ ] **Project scaffolding**: `npx create-next-app` with TypeScript, Tailwind CSS, App Router
- [ ] **Supabase setup**: apply schema from `DATABASE_SCHEMA.md`, generate TypeScript types
- [ ] **Authentication**: Supabase Auth login page + middleware route protection + roles (admin/member)
- [ ] **Supabase client helpers**: server client (`src/lib/supabase/server.ts`) and browser client (`src/lib/supabase/client.ts`)
- [ ] **TypeScript types**: `Livre`, `Emprunt`, `Profile`, `LoanStatus` in `src/types/index.ts`
- [ ] **Environment config**: `.env.local.example` committed, `.env.local` gitignored

---

## Phase 2 — Core Features

- [ ] **Catalogue** (`/catalogue`): list books with quick filter buttons (Tous / Disponibles / Empruntés) and free-text search
- [ ] **Emprunter** (`/emprunter`): record a loan — select available book, enter borrower info, submit
- [ ] **Rendre** (`/rendre`): record a return — select borrowed book, confirm, submit
- [ ] **Ajouter un livre** (`/ajouter`): add a book manually, admin only
- [ ] **Dashboard** (`/`): key metrics (total, available, borrowed, overdue count)

---

## Phase 3 — Enhanced Features

- [ ] **ISBN auto-fill**: Google Books API integration on the add-book page
- [ ] **Historique** (`/historique`): full borrow history table with 🟢/🟠/🔴 color-coded status
- [ ] **Gérer les livres** (`/gerer`): admin page — edit, archive, delete books; show active borrow status per book
- [ ] **Notifications**: Resend email integration — send on borrow, return, and overdue events
- [ ] **Dashboard — overdue list**: display late loans sorted by days overdue
- [ ] **Dashboard — "Relancer les retardataires"**: admin button to send overdue reminders manually

---

## Phase 4 — Production Polish

- [ ] **Vercel Cron**: daily overdue reminder emails via `/api/notifications`
- [ ] **Vercel deployment**: connect GitHub repo, set env vars, confirm auto-deploy
- [ ] **RLS audit**: verify Supabase Row Level Security policies are correct
- [ ] **Error handling**: user-facing error messages for failed actions (form validation, API errors)
- [ ] **Loading states**: skeleton loaders or spinners for async operations
- [ ] **Mobile responsiveness**: test and fix layout on small screens

---

## Nice to Have (post-launch)

- [ ] Cover image upload to Supabase Storage (instead of relying on external URLs)
- [ ] Barcode scanner support on mobile for ISBN input
- [ ] Statistics page: most borrowed books, most active borrowers, average return time
- [ ] Dark mode
