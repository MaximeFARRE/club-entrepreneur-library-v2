# Contributing Guidelines

We welcome contributions from all Pôle Léonard de Vinci students!

## How to Contribute

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally.
3. **Create a branch** for your feature or fix (`git checkout -b feat/my-feature`).
4. **Make your changes**, following the architecture rules in `AGENTS.md`.
5. **Run type checks**: `npx tsc --noEmit`.
6. **Run tests**: `npm test`.
7. **Commit** using Conventional Commits (`feat: add X`, `fix: resolve Y`).
8. **Push** to your fork and open a Pull Request against `main`.

## Rules

- Keep Pull Requests small and focused on a single issue.
- Never put business logic in `app/` files — it belongs in `src/services/`.
- Never write Supabase queries outside `src/repositories/`.
- Every PR must pass type checking and tests before merge.
- Follow the commit rules in `AGENTS.md`.
