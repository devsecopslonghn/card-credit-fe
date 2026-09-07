import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dockerfile = await readFile(new URL("../Dockerfile", import.meta.url), "utf8");

test("frontend image uses Nginx Alpine as the public runtime base", () => {
  assert.match(dockerfile, /FROM nginx:alpine AS runner/);
  assert.match(dockerfile, /apk add --no-cache nodejs/);
});

test("frontend runtime copies only the telemetry dependency closure", () => {
  assert.match(dockerfile, /FROM node:22-alpine AS otel-deps/);
  assert.match(dockerfile, /COPY otel\/package\.json otel\/package-lock\.json \.\//);
  assert.match(dockerfile, /RUN[\s\S]*npm ci --omit=dev/);
  assert.match(dockerfile, /COPY --chown=nextjs:nextjs --from=otel-deps \/otel\/node_modules \.\/node_modules/);
  assert.doesNotMatch(dockerfile, /COPY --chown=nextjs:nextjs --from=builder \/workspace\/frontend\/node_modules \.\/node_modules/);
});
