# card-credit-fe working agreement

This repository owns the Next.js frontend, browser clients, static catalog
assets and the frontend container image. The local `shared/` directory is the
frontend copy of the canonical contracts and must stay compatible with the BE
copy when contract changes span repositories.

Run the lightweight gate before handoff:

```bash
./.agent/gates/verify.sh
```

The gate covers shared-contract validation, frontend typecheck, lint, critical
tests and production build. Do not put backend/domain persistence logic here.
Image publishing and chart tag propagation are performed by `.github/workflows/ci.yml`.
