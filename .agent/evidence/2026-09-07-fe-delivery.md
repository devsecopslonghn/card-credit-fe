# Evidence: frontend split delivery and image sizing

- task ID: 2026-09-07-multi-repo-delivery
- relevant commit/run: `card-credit-fe@b9ced09`, GitHub Actions `34119437100`
- ownership claim: FE owns frontend correctness, tests/typecheck/lint/build and the FE image.
- checks: `./.agent/gates/verify.sh`; CI quality, image publish and chart update jobs; `skopeo inspect docker://ghcr.io/devsecopslonghn/card-credit-fe:b9ced095059fb94902fb8e48da1d0ed7b5930d16`.
- result: local gate and CI passed; chart update passed; registry layer sum 96,573,826 bytes and Kubernetes pull metadata 96,586,149 bytes.
- optimization: replaced the full runner `node_modules` copy with a dedicated OpenTelemetry dependency closure; previous pull metadata was 231,099,240 bytes.
- limitations: registry metadata did not provide an independent uncompressed total.
- final result: PASS
