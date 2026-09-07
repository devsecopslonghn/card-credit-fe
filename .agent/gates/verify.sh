#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"
npm run validate-contracts
npm run typecheck
npm run lint
npm run test:critical
npm run build
echo "Verification passed: card-credit-fe"
