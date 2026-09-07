import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = await readFile(new URL("../src/app/App.tsx", import.meta.url), "utf8");
const auth = await readFile(new URL("../src/app/auth.tsx", import.meta.url), "utf8");

test("SPA routing keeps the card detail route and protected application shell", () => {
  assert.match(app, /\["\/cards\/:id", CardDetailPage\]/);
  assert.match(app, /<ProtectedRoute>/);
  assert.match(app, /BrowserRouter/);
  assert.doesNotMatch(app, /next\/navigation|next\/link|next\/image/);
});

test("auth bootstrap uses the backend session endpoint", () => {
  assert.match(auth, /fetch\("\/api\/auth\/me"/);
  assert.match(auth, /ProtectedRoute/);
  assert.doesNotMatch(auth, /next\/navigation/);
});
