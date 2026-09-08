import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dockerfile = await readFile(new URL("../Dockerfile", import.meta.url), "utf8");
const nginx = await readFile(new URL("../nginx.conf", import.meta.url), "utf8");

test("frontend image uses Nginx Alpine as the public runtime base", () => {
  assert.match(dockerfile, /FROM nginx:alpine AS runner/);
  assert.match(dockerfile, /COPY --from=builder \/workspace\/dist \/usr\/share\/nginx\/html/);
  assert.doesNotMatch(dockerfile, /NEXT_|next start|apk add --no-cache nodejs|node_modules.*runner/);
});

test("frontend runtime is static-only", () => {
  const runner = dockerfile.slice(dockerfile.indexOf("FROM nginx:alpine"));
  assert.doesNotMatch(runner, /node|next|NODE_OPTIONS|start\.sh|node_modules/);
});

test("frontend API proxy preserves the public HTTPS origin for backend CSRF checks", () => {
  assert.match(nginx, /location \/api\//);
  assert.match(nginx, /proxy_set_header X-Forwarded-Proto https;/);
  assert.doesNotMatch(nginx, /proxy_set_header X-Forwarded-Proto \$scheme;/);
});
