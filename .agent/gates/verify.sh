#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"
npm --prefix shared run validate
npm --prefix frontend run typecheck
npm --prefix frontend run lint
npm --prefix frontend run test:critical
npm --prefix frontend run build
echo "Verification passed: card-credit-fe"
