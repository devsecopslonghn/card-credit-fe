# card-credit-fe working agreement

This repository owns the React/Vite frontend, browser clients, static catalog
assets and the frontend container image. API contracts are consumed through
the explicit HTTP boundary; `src/contracts` contains only the FE validation
schemas needed at runtime and is not a cross-repository source dependency.

Run the lightweight gate before handoff:

```bash
./.agent/gates/verify.sh
```

The gate covers shared-contract validation, frontend typecheck, lint, critical
tests and production build. Do not put backend/domain persistence logic here.
Image publishing and chart tag propagation are performed by `.github/workflows/ci.yml`.

The production image is static-only: Vite emits the SPA into `dist/`, and
Nginx serves it on port 80. Nginx owns SPA fallback, `/health`, immutable asset
caching and the `/api/` proxy to the backend. Client-side React Router preserves
dynamic routes such as `/cards/:id`; the client bootstraps auth from
`/api/auth/me`.
