# Frontend system context

- Ownership: root `app/`, `components/`, browser API clients, catalog assets and image build.
- Contract input: local `src/contracts`; synchronize only the serialized HTTP contract with the backend.
- Delivery: push to `master` runs quality, publishes `ghcr.io/devsecopslonghn/card-credit-fe:<sha>`, then updates the chart repository.
- Runtime decision: `NGINX_PROXY_NEXT`; Nginx listens on 3000 and proxies the standalone Next server on 3001 because proxy rewrites and middleware are server-runtime features.
- Verification authority: `./.agent/gates/verify.sh` and the repository workflow.
