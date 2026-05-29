# Development Guide

## Prerequisites

- Node.js 20+
- npm 10+
- A [Supabase](https://supabase.com/) project (free tier is fine)
- A [Resend](https://resend.com/) account for email (free tier: 3000 emails/month)
- A [Vercel](https://vercel.com/) account for deployment

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/MaximeFARRE/club-entrepreneur-library-v2.git
cd club-entrepreneur-library-v2
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxx

# Cron protection (generate any random string)
CRON_SECRET=your-random-secret
```

Find your Supabase keys at: `Supabase Dashboard > Project Settings > API`.

### 3. Apply the database schema

In Supabase Dashboard > SQL Editor, run the contents of `docs/DATABASE_SCHEMA.md` in order:
1. Create tables (`livres`, `emprunts`, `profiles`)
2. Create indexes
3. Enable RLS and create policies

Or use the Supabase CLI:

```bash
npx supabase db push
```

### 4. Generate TypeScript types from Supabase

```bash
npx supabase gen types typescript --project-id your-project-id > src/types/supabase.ts
```

Re-run this command every time you modify the database schema.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Start production server locally |
| `npx tsc --noEmit` | Type check without emitting files |
| `npm test` | Run unit tests |
| `npm run lint` | Lint with ESLint |

---

## Adding a New Page

1. Create a folder under `app/(app)/your-page/`.
2. Add `page.tsx` (Server Component by default).
3. If the page needs mutations, add `actions.ts` next to it for Server Actions.
4. Add the route to the navigation in `app/(app)/layout.tsx`.

## Adding a New Feature

Follow the architecture strictly:

1. **Types**: add/update types in `src/types/index.ts`.
2. **Repository**: write the Supabase query in `src/repositories/`.
3. **Service**: write the business logic in `src/services/` — call the repository, not Supabase directly.
4. **Server Action**: call the service from `actions.ts` in the relevant page folder.
5. **UI**: display data in the page component.

## Environment Variables in Production

Set all env vars in Vercel Dashboard > Project Settings > Environment Variables.
Never commit `.env.local`. Only `.env.local.example` (with placeholder values) is committed.

---

## Email Testing

Use [Resend's test mode](https://resend.com/docs/send-with-nodejs) locally.
Emails in dev will appear in the Resend dashboard without actually being delivered.

---

## Deployment

Deployment is automatic on push to `main` via Vercel's GitHub integration.

Manual deploy:
```bash
npx vercel --prod
```
