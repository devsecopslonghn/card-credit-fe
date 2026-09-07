import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dockerfile = await readFile(new URL("../Dockerfile", import.meta.url), "utf8");

test("frontend image installs linked shared runtime dependencies in the clean build context", () => {
  assert.match(dockerfile, /COPY shared\/package\.json shared\/package-lock\.json \/workspace\/shared\//);
  assert.match(dockerfile, /npm --prefix \/workspace\/shared ci --omit=dev/);
  assert.match(dockerfile, /COPY --from=deps \/workspace\/shared \/workspace\/shared/);
});

test("frontend runtime copies only the telemetry dependency closure", () => {
  assert.match(dockerfile, /FROM node:22-alpine AS otel-deps/);
  assert.match(dockerfile, /COPY frontend\/otel\/package\.json frontend\/otel\/package-lock\.json \.\//);
  assert.match(dockerfile, /RUN[\s\S]*npm ci --omit=dev/);
  assert.match(dockerfile, /COPY --chown=nextjs:nextjs --from=otel-deps \/otel\/node_modules \.\/node_modules/);
  assert.doesNotMatch(dockerfile, /COPY --chown=nextjs:nextjs --from=builder \/workspace\/frontend\/node_modules \.\/node_modules/);
});
