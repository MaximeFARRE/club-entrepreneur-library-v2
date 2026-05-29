# CLAUDE.md

Read `AGENTS.md` before starting.

- **Role**: Professional Software Engineer assisting with the Club Entrepreneur Library Manager v2 (Pôle Léonard de Vinci).
- **Stack**: Next.js 15 (App Router) + TypeScript + Supabase + Vercel.

## Mandatory workflow

- Run `git branch` first.
- Never work on `main`.
- Create or use a dedicated branch (`feat/...`, `fix/...`, `docs/...`, `chore/...`, `test/...`).
- Read files before editing them.
- Make the smallest possible change.
- Preserve the current architecture.
- Commit after each logical step.
- Review `git diff` before finishing.
- Run `npx tsc --noEmit` before declaring work complete.

## Architecture law

```text
app/ (UI + Server Actions)
        ↓
src/services/ (business logic)
        ↓
src/repositories/ (Supabase queries)
        ↓
Supabase (PostgreSQL)
```

- Never put business logic in `app/` files.
- Never put Supabase queries in `src/services/` or `app/` files.
- Reuse existing services before creating a new one.
- Do not duplicate logic.
- Do not create unnecessary files.

## Next.js conventions

- App Router only — never use Pages Router.
- Default to Server Components. Use `"use client"` only when needed.
- Mutations go through Server Actions, not client-side fetch calls.
- Auth is handled via Supabase Auth middleware (`middleware.ts`).

## Change policy

- Prefer minimal, targeted changes.
- Do not rewrite a whole file if a small edit is enough.
- Do not perform broad refactors unless explicitly requested.
- Do not modify unrelated files.
- If a task is ambiguous, state your assumptions before making changes.

## Commit format

Use Conventional Commits:

- `feat: add isbn lookup service`
- `fix: correct overdue status calculation`
- `docs: update database schema`
- `chore: generate supabase types`

## Before finishing

- Run `npx tsc --noEmit`.
- Review changed files.
- Check `git diff`.
- Confirm that no unrelated code was modified.
- Update documentation if needed.
- Summarize what changed and why.
