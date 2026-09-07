# Frontend system context

- Ownership: `src/app/`, `src/pages/`, `src/components/`, browser API clients, catalog assets and image build.
- Contract input: local `src/contracts`; synchronize only the serialized HTTP contract with the backend.
- Delivery: push to `master` runs quality, publishes `ghcr.io/devsecopslonghn/card-credit-fe:<sha>`, then updates the chart repository.
- Runtime decision: Vite SPA served by Nginx Alpine on port 80. Nginx provides `/health`, SPA fallback and `/api/` proxying; React Router and `/api/auth/me` handle client navigation/auth state.
- Verification authority: `./.agent/gates/verify.sh` and the repository workflow.
