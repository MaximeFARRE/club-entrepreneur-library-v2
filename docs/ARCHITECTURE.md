# Architecture Overview

This application follows a strict 3-tier architecture adapted for Next.js 15 (App Router) and Supabase.

---

## High-Level Stack

```
Browser
   ↓
Vercel (Next.js 15 — App Router)
   ↓
Supabase (PostgreSQL + Auth + Storage)
```

---

## Layer Breakdown

### 1. Presentation Layer — `app/`

Next.js App Router pages and layouts.

- **Server Components** (default): fetch data directly from services, render HTML on the server. No client-side state.
- **Client Components** (`"use client"`): interactive elements only (search input, modals, dropdowns).
- **Server Actions**: handle all mutations (add book, record borrow, record return). They call services — never repositories directly.

```text
app/
├── (auth)/
│   ├── login/page.tsx          # Login page (public)
│   └── signup/page.tsx         # Signup page (public)
├── (app)/
│   ├── layout.tsx              # Auth guard + nav
│   ├── page.tsx                # Dashboard
│   ├── catalogue/page.tsx      # Book catalog
│   ├── ajouter/page.tsx        # Add book (ISBN + manual)
│   ├── emprunter/page.tsx      # Record a borrow
│   ├── rendre/page.tsx         # Record a return
│   ├── historique/page.tsx     # Borrow history
│   ├── profil/page.tsx         # Personal Space dashboard
│   └── gerer/page.tsx          # Admin — manage books
└── api/
    └── notifications/route.ts  # Cron webhook for overdue reminders (emails paused)
```

### 2. Business Logic Layer — `src/services/`

Pure TypeScript functions. No Supabase client. No UI imports.

- `livre.service.ts` — catalog operations, ISBN lookup orchestration
- `emprunt.service.ts` — borrow/return processing, overdue detection, status color
- `profile.service.ts` — user profile operations (name validations)
- `notification.service.ts` — email composition and dispatch rules (emails currently paused)
- `isbn.service.ts` — Google Books API integration

Business rules centralized here:
- Loan period: **30 days**
- Status color logic: green (returned or >7 days left), orange (≤7 days), red (overdue)
- Overdue: `date_retour IS NULL AND date_retour_prevue < NOW()`
- Emails sent on (paused): borrow (→ borrower + owner), return (→ borrower + owner), overdue reminder (→ borrower)

### 3. Data Access Layer — `src/repositories/`

All Supabase queries. No business logic. No email calls.

- `livre.repository.ts` — CRUD on `livres` table + query books owned by user
- `historique.repository.ts` — CRUD on `emprunts` table + query borrows and shared book loans
- `profile.repository.ts` — updates on `profiles` table

### 4. Shared — `src/`

```text
src/
├── lib/
│   └── supabase/
│       ├── client.ts           # Browser client (Client Components)
│       └── server.ts           # Server client (Server Components + Server Actions)
└── types/
    └── index.ts                # Livre, Emprunt, LoanStatus, etc.
```

---

## Authentication

Handled entirely by **Supabase Auth**.

- Login and Sign Up via email/password.
- `middleware.ts` at the root protects all `(app)/` routes — unauthenticated users are redirected to `/login`.
- Role discrimination: a `role` field in the database `profiles` table (`"admin"` or `"member"`).
  - **Member**: can browse catalog, borrow, return, add books, and access their personal space ("Mon Espace").
  - **Admin**: everything above + edit, archive, and delete books; access the manage page.

---

## Data Flow — Example: Recording a Borrow

```
User submits form (Client Component)
        ↓
Server Action: borrowBook(formData)  [app/emprunter/actions.ts]
        ↓
empruntService.processBorrow(livreId, borrowerName, borrowerEmail)  [src/services/emprunt.service.ts]
  → validates: book exists, book is available
  → calculates: dueDate = today + 30 days
        ↓
livreRepository.updateAvailability(livreId, 'Indisponible', borrowerName)  [src/repositories/livre.repository.ts]
historiqueRepository.addBorrow(...)                                          [src/repositories/historique.repository.ts]
        ↓
notificationService.sendBorrowEmails(...)  [src/services/notification.service.ts]
  → sends email to borrower
  → sends email to owner
        ↓
redirect('/catalogue')
```

---

## Email Provider

[Resend](https://resend.com/) — simple REST API, no SMTP configuration needed. Configured via `RESEND_API_KEY` env var.

---

## Deployment

- **Vercel**: connected to GitHub `main` branch. Push → automatic deploy.
- **Environment variables**: set in Vercel dashboard (not committed to git).
- **Supabase**: managed PostgreSQL. Row Level Security (RLS) enabled on all tables.
- **Cron job**: Vercel Cron triggers `/api/notifications` daily to send overdue reminders.
