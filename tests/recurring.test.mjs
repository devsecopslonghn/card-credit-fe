import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("recurring UI uses the canonical lifecycle client and monthly contract", () => {
  const client = readFileSync(new URL("../src/lib/api/recurringExpensesClient.ts", import.meta.url), "utf8");
  const page = readFileSync(new URL("../src/pages/recurring/page.tsx", import.meta.url), "utf8");
  const navigation = readFileSync(new URL("../src/components/layout/NavigationBar.tsx", import.meta.url), "utf8");
  assert.match(client, /recurringExpenseListSchema/);
  assert.match(client, /saveRecurringExpense/);
  assert.match(client, /deactivateRecurringExpense/);
  assert.match(page, /recurring-category-options/);
  assert.match(page, /không tự ghi financial transaction/);
  assert.match(page, /Khoản chi định kỳ/);
  assert.match(page, /Cập nhật/);
  assert.match(page, /Tắt/);
  assert.match(page, /frequency: "MONTHLY"/);
  assert.match(navigation, /href: "\/recurring"/);
});
