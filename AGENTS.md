# card-credit-fe working agreement

This repository owns the Next.js frontend, browser clients, static catalog
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

The production image uses `NGINX_PROXY_NEXT`: Next middleware, App Router
dynamic route `/cards/[id]`, and server-side API rewrites require a Node server;
Nginx fronts that server for one public port and immutable `_next/static`
caching. A static-only export would not preserve these behaviors.
