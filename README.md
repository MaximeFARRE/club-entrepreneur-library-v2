# Club Entrepreneur Library Manager — v2

> The official, premium library management system built by and for the members of the Club Entrepreneur student association at Pôle Léonard de Vinci.

[![Next.js 15](https://img.shields.io/badge/Next.js-15.3.2-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Unit%20Testing-76E1FE?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Production%20Ready-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## Project Purpose & Context

The **Club Entrepreneur** library (Campus Léonard de Vinci, Paris La Défense) holds a private collection of reference books on business, startup methodology, product development, design, and personal growth. 

### Why Version 2?
Version 1 was a quick prototype built using Python and Streamlit. While it proved the concept, it suffered from several technical limitations:
- **No User Isolation**: Lacked proper authenticated profiles; members entered details manually for every borrow.
- **Security Vulnerabilities**: Direct write access to database-like sheets with no access control.
- **Race Conditions**: Parallel borrows on the same book could lead to data corruption.
- **Performance**: High latency in data rendering.

**Version 2** is a complete, enterprise-grade rewrite. Built on **Next.js 15**, **TypeScript**, and **Supabase (PostgreSQL)**, it introduces a clean 3-tier architecture, robust Row Level Security (RLS), real-time search, automated ISBN metadata retrieval, and personal dashboards.

---

## Key Features

- **📚 Catalog & Real-Time Discovery**: Browse, search (full-text search on title/author), and filter books by availability (All / Available / Borrowed).
- **🔍 Smart ISBN Lookup**: Add a book instantly by scanning or entering its ISBN. Automatically fetches and binds the title, authors, genres/categories, summary, and cover image from the **Google Books API**.
- **👥 Member Account Creation**: Allows self-registration via `/signup`. The trigger automatically synchronizes newly created Auth users with the database `profiles` table.
- **👤 Personal Space ("Mon Espace")**: Each member gets a dedicated space `/profil` containing:
  - Personal reading metrics.
  - Active borrows tracking (with return due dates and color-coded status badges).
  - Borrowing history ledger.
  - Shared books manager showing which of their books are currently lent out and **who currently holds them** (name and email).
  - Inline settings to edit their display name.
- **🛡️ Secure Transactions**: Invariants enforced at the service boundary to prevent double-booking or illegal return actions.
- **📊 Administration Dashboard**: Key metrics (total books, available, borrowed, overdue count) and a late-returns tracking table with a bulk-nudge trigger (logs late notifications).
- **🔒 Role-Based Access Control**: Strict division between `member` and `admin` roles, verified on the server side in Server Actions and in the database through PostgreSQL RLS policies.

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
