# Development Guide

## Prerequisites

- Node.js 20+
- npm 10+
- A [Supabase](https://supabase.com/) project (free tier is fine)
- A [Brevo](https://www.brevo.com/) account for transactional emails
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

# Email (Brevo)
BREVO_API_KEY=xkeysib-your_api_key_here
BREVO_SENDER_EMAIL=bibliotheque@club-entrepreneur.example
BREVO_SENDER_NAME=Club Entrepreneur

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

## Testing

We use **Vitest** for unit testing. The test suites are located in `src/services/__tests__/`.

### Running Tests

- Run all tests once:
  ```bash
  npm test
  ```
- Run tests in watch mode (interactive):
  ```bash
  npx vitest
  ```

### Test Strategy
- **Path Resolution**: We resolve `@/*` import paths in tests using the `vite-tsconfig-paths` plugin configured in `vitest.config.ts`.
- **Global Fetch**: Global `fetch` is mocked using `vi.stubGlobal('fetch', mockFn)` to isolate API network calls (such as Google Books).
- **Mocking Repositories**: Repository files (`livre.repository.ts`, `historique.repository.ts`, etc.) are mocked using `vi.mock()` to isolate service business logic and prevent actual database queries.

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

Email delivery relies on the Brevo Transactional API. In local development:
- If `BREVO_API_KEY` and `BREVO_SENDER_EMAIL` are not provided in `.env.local`, the application logs a warning to the console and skips email dispatch without throwing errors.
- If the keys are provided, emails are delivered immediately. Make sure to test using safe, valid emails.

---

## Deployment

Deployment is automatic on push to `main` via Vercel's GitHub integration.

Manual deploy:
```bash
npx vercel --prod
```
