# Club Entrepreneur Library Manager — v2

> The official library management system built by and for the members of the Club Entrepreneur student association at Pôle Léonard de Vinci.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)
![License](https://img.shields.io/badge/license-MIT-green)

## Project Purpose

Built as a custom tool for the Club Entrepreneur (Campus Léonard de Vinci), this application replaces chaotic spreadsheets to manage the association's private book collection. It centralizes the catalog, tracks member loans, enforces return dates, and automatically sends email reminders to overdue borrowers.

This is a full rewrite of the original Streamlit/Python v1, migrated to a modern React/Next.js stack with a proper cloud database and authentication.

## Main Features

- **Catalog**: View, search, and filter the entire book collection (All / Available / Borrowed)
- **Inventory**: Add new books (manual or via ISBN auto-fill, capturing category too), now open to all authenticated users
- **Borrowing & Returns**: Record loans, automatically calculate due dates (30-day period), register returns
- **Personal Space ("Mon Espace")**: Users can track their active borrows, shared books (viewing who currently holds them), history, stats, and update their name
- **History**: Full ledger of all past borrowing activity with color-coded urgency indicators (🟢/🟠/🔴)
- **Dashboard**: Key metrics at a glance (total books, available, overdue) with a late-returns list
- **Notifications**: Simulated logs on borrow, return, and overdue events (email dispatch paused)
- **Authentication**: Supabase Auth — register (sign up) and log in, with admin roles for book management (edit, delete, archive)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | TypeScript 5 |
| UI | React 19 + Tailwind CSS |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) |
| Auth | Supabase Auth |
| Deployment | [Vercel](https://vercel.com/) |
| Testing | [Vitest](https://vitest.dev/) + `vite-tsconfig-paths` |

## Installation

```bash
git clone https://github.com/MaximeFARRE/club-entrepreneur-library-v2.git
cd club-entrepreneur-library-v2
npm install
```

Copy the environment file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Repository Structure

```text
.
├── src/
│   ├── app/                    # Next.js App Router — pages and layouts
│   │   ├── (auth)/             # Auth routes (login, signup)
│   │   ├── (app)/              # Protected app routes
│   │   │   ├── page.tsx        # Dashboard (accueil)
│   │   │   ├── catalogue/      # Book catalog with filters
│   │   │   ├── ajouter/        # Add a book (ISBN lookup + manual)
│   │   │   ├── emprunter/      # Record a borrow
│   │   │   ├── rendre/         # Record a return
│   │   │   ├── historique/     # Full borrow history
│   │   │   ├── profil/         # User profile and stats
│   │   │   └── gerer/          # Admin — manage books
│   │   └── api/                # API routes (webhooks, cron)
│   ├── services/               # Business logic (no DB calls here)
│   │   └── __tests__/          # Service unit tests (Vitest)
│   ├── repositories/           # Supabase queries (no business logic here)
│   ├── lib/
│   │   └── supabase/           # Supabase client helpers (browser + server)
│   └── types/                  # Shared TypeScript types
├── docs/                       # Architecture, development, roadmap, plans
└── supabase/
    └── migrations/             # SQL database migration files
```

## Contributors

- Maxime FARRE

## Limitations

- Single-tenant — designed for one book club.
- Email delivery requires a configured [Resend](https://resend.com/) API key.
