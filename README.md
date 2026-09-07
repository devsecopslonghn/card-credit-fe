# card-credit-fe

React/Vite SPA frontend for Card Credit. The repository is self-contained and
keeps the shared runtime contracts under `src/contracts/`.

## Local verification

```bash
npm ci --include=optional
npm run validate-contracts
npm run typecheck
npm run lint
npm test
npm run build
```

The production image is an Nginx Alpine static server and is published as
`ghcr.io/devsecopslonghn/card-credit-fe:<commit-sha>`.
