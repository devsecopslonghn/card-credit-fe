# card-credit-fe

Next.js frontend for Card Credit. The repository is self-contained and keeps
the shared runtime contracts under `shared/`.

## Local verification

```bash
npm --prefix shared ci
npm --prefix frontend ci --include=optional
npm --prefix shared run validate
npm --prefix frontend run typecheck
npm --prefix frontend run lint
npm --prefix frontend run test:critical
npm --prefix frontend run build
```

The frontend image is published as
`ghcr.io/devsecopslonghn/card-credit-frontend:<commit-sha>`.
