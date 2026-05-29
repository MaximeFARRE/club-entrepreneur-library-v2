# Agent Operating Manual

Read this file before making any change in the repository.

**Context**: This is v2 of the library management system for the Club Entrepreneur student association (Pôle Léonard de Vinci). Full rewrite from Python/Streamlit to Next.js 15 + TypeScript + Supabase + Vercel.

The rules below must be followed strictly.

---

## Workflow

1. Read the existing code and documentation before editing anything.
2. Check the current branch with `git branch`.
3. Never work directly on `main`.
4. Create or use a dedicated branch:
   - `feat/...`
   - `fix/...`
   - `docs/...`
   - `chore/...`
   - `test/...`
5. Make small, focused changes.
6. Commit after each logical step.
7. Review the diff before finishing.

---

## Commit rules

- Never batch unrelated changes in one commit.
- Use Conventional Commits:
  - `feat: add borrow service`
  - `fix: correct due date calculation`
  - `docs: update architecture diagram`
  - `chore: add supabase types`
- Commit frequently — a large task produces several commits.
- Never leave many modified files uncommitted.
- **MANDATORY**: At least 1 commit per file modified or created.
- **MANDATORY**: Never exceed 200 lines changed in a single commit.

---

## Architecture rules

Always preserve a strict 3-tier separation of concerns:

```text
app/ (UI — Server Components, Client Components, Server Actions)
        ↓
src/services/ (business logic — no DB calls, no UI imports)
        ↓
src/repositories/ (Supabase queries — no business logic)
        ↓
Supabase (PostgreSQL)
```

Rules:

- UI files (`app/`) only handle rendering and user interaction.
- Server Actions live in `app/` but must delegate to services — no business logic inline.
- Business logic (calculations, validation, rules) belongs in `src/services/`.
- All Supabase queries belong in `src/repositories/`.
- Never write a Supabase query inside a service or a page component.
- Never write business logic inside a repository.
- Reuse existing services before creating a new one.
- Do not duplicate logic across files.

---

## Next.js specific rules

- Use the **App Router** (`app/` directory). Never use Pages Router.
- Prefer **Server Components** by default. Add `"use client"` only when strictly necessary (event handlers, browser APIs, hooks).
- Use **Server Actions** for mutations (form submissions, borrow, return, etc.).
- Use **`next/navigation`** for redirects inside Server Actions (`redirect()`).
- Always use the **server-side Supabase client** (`createServerClient`) in Server Components and Server Actions.
- Use the **browser Supabase client** (`createBrowserClient`) only in Client Components.
- Keep `.env.local` out of git — use `.env.local.example` as the committed template.

---

## TypeScript rules

- Enable strict mode (`"strict": true` in `tsconfig.json`). No `any` without a comment explaining why.
- All shared entities must have a TypeScript type defined in `src/types/index.ts`.
- Run `npx tsc --noEmit` before declaring any task complete.
- Supabase types should be generated from the schema (`supabase gen types typescript`).

---

## File and code rules

- Prefer minimal, targeted changes.
- Do not rewrite a whole file if a small edit is enough.
- Keep functions focused and easy to read.
- Prefer explicit names over short names.
- Avoid dead imports and unused variables.
- No `// @ts-ignore` without a comment explaining the suppression.
- Add or update documentation when behavior changes.
- If tests exist, update or add tests for changed behavior.
- Never claim something was tested if it was not actually run.

---

## Documentation rules

The repository must always contain:

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `LICENSE`
- `docs/ARCHITECTURE.md`
- `docs/DEVELOPMENT.md`
- `docs/ROADMAP.md`
- `docs/FEATURES.md`
- `docs/DATABASE_SCHEMA.md`

---

## Never do

- Never commit directly to `main`
- Never use Pages Router — App Router only
- Never write SQL inside a service or a UI component
- Never write business logic inside a repository
- Never put a Supabase query directly in a page component or Server Action
- Never use `any` without justification
- Never make broad refactors unless explicitly requested
- Never create unnecessary files
- Never mix unrelated fixes in one task

---

## Definition of done

Before finishing a task:

- [ ] Correct branch used
- [ ] Small logical commits created
- [ ] Diff reviewed
- [ ] `npx tsc --noEmit` passes
- [ ] Documentation updated if needed
- [ ] No business logic in UI or repositories
- [ ] No Supabase queries in services or UI
- [ ] Tests run if relevant
- [ ] No unrelated files modified
