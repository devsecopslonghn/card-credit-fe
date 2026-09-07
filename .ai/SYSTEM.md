# Frontend system context

- Ownership: `frontend/` UI, browser API clients, catalog assets and image build.
- Contract input: local `shared/`; keep DTO and error-shape changes synchronized with `card-credit-be/shared`.
- Delivery: push to `master` runs quality, publishes `ghcr.io/devsecopslonghn/card-credit-fe:<sha>`, then updates the chart repository.
- Verification authority: `./.agent/gates/verify.sh` and the repository workflow.
