import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  buildCardSummary,
  buildCreateCardPayload,
  filterCardsByOwner,
  formatAnnualFee,
  formatDateDisplay,
  getDisplayName,
  getNetwork,
  getProviderName,
  groupCardsByProvider,
  normalizeOwnerInput,
  validateOwnerInput,
} from "../src/lib/cards/uiCore.mjs";

test("groups canonical cards by provider", () => {
  const groups = groupCardsByProvider([
    {
      _id: "2",
      providerCode: "STB",
      providerName: "Sacombank",
      displayName: "JCB Ultimate",
      network: "JCB",
    },
    {
      _id: "1",
      providerCode: "VCB",
      providerName: "Vietcombank",
      displayName: "Visa",
      network: "Visa",
    },
    {
      _id: "3",
      providerCode: "STB",
      providerName: "Sacombank",
      displayName: "Visa Platinum Cashback",
      network: "Visa",
    },
  ]);

  assert.equal(groups.length, 2);
  assert.equal(groups[0].providerName, "Sacombank");
  assert.equal(groups[0].cards.length, 2);
  assert.equal(groups[1].providerName, "Vietcombank");
});

test("canonical display fields are stable", () => {
  const card = { providerName: "Sacombank", displayName: "Visa", network: "Visa" };

  assert.equal(getProviderName(card), "Sacombank");
  assert.equal(getDisplayName(card), "Visa");
  assert.equal(getNetwork(card), "Visa");
});

test("annual fee formatter handles number zero null and undefined", () => {
  assert.equal(formatAnnualFee(100000), "100.000 ₫");
  assert.equal(formatAnnualFee(0), "0 ₫");
  assert.equal(formatAnnualFee(null), "Chưa xác định");
  assert.equal(formatAnnualFee(undefined), "Chưa xác định");
});

test("date formatter preserves supported Vietnamese dates", () => {
  assert.equal(formatDateDisplay("14/08/2026"), "14/08/2026");
});

test("card summary uses selected statement month and real payment due date", () => {
  const summary = buildCardSummary(
    { statementDay: 25, paymentDueDays: 10 },
    [
      {
        statementDate: "2026-12-25",
        paymentStatus: "STATEMENT_CLOSED",
        effectivePaymentStatus: "STATEMENT_CLOSED",
        summary: { statementAmount: 1_200_000 },
      },
      {
        statementDate: "2027-01-25",
        paymentStatus: "OPEN",
        effectivePaymentStatus: "OPEN",
        summary: { statementAmount: 500_000 },
      },
      {
        statementDate: "2026-11-25",
        paymentStatus: "PAID",
        effectivePaymentStatus: "PAID",
        summary: { statementAmount: 300_000 },
      },
    ],
    { year: 2026, month: 12 },
  );

  assert.equal(summary.statementDate, "2026-12-25");
  assert.equal(summary.paymentDueDate, "2027-01-04");
  assert.equal(summary.currentOutstandingBalance, 1_700_000);
  assert.equal(summary.totalGrossDebt, 2_000_000);
  assert.equal(summary.totalPaidDebt, 300_000);
  assert.equal(summary.statementAmountDue, 1_200_000);
});

test("card summary clamps statement day to the last day of selected month", () => {
  const summary = buildCardSummary(
    { statementDay: 31, paymentDueDays: 1 },
    [{ statementDate: "2028-02-29", summary: { statementAmount: 900_000 } }],
    { year: 2028, month: 2 },
  );

  assert.equal(summary.statementDate, "2028-02-29");
  assert.equal(summary.paymentDueDate, "2028-03-01");
  assert.equal(summary.statementAmountDue, 900_000);
});

test("card summary exposes only the remaining persisted statement amount", () => {
  const partial = buildCardSummary(
    { statementDay: 1, paymentDueDays: 15 },
    [{ statementDate: "2026-08-01", paymentStatus: "OPEN", paidAmount: 250_000, summary: { statementAmount: 1_000_000 } }],
    { year: 2026, month: 8 },
  );
  const empty = buildCardSummary({ statementDay: 1, paymentDueDays: 15 }, [], { year: 2026, month: 8 });

  assert.equal(partial.statementAmountDue, 750_000);
  assert.equal(empty.statementAmountDue, 0);
});

test("owner validation trims collapses whitespace and rejects invalid values", () => {
  assert.equal(normalizeOwnerInput(" Long   Ho "), "Long Ho");
  assert.deepEqual(validateOwnerInput("   ").valid, false);
  assert.deepEqual(validateOwnerInput("Long Ho").valid, true);
  assert.deepEqual(validateOwnerInput("x".repeat(121)).valid, false);
});

test("owner filter uses normalized owner values", () => {
  const cards = [{ _id: "1", owner: " Long   Ho " }, { _id: "2", owner: "Tôi" }];
  const filtered = filterCardsByOwner(cards, "Long Ho");

  assert.deepEqual(filtered.map((card) => card._id), ["1"]);
});

test("provider and card sort are stable", () => {
  const groups = groupCardsByProvider([
    { _id: "2", providerCode: "B", providerName: "B", displayName: "Zulu", network: "Visa" },
    { _id: "1", providerCode: "A", providerName: "A", displayName: "Alpha", network: "Visa" },
    { _id: "3", providerCode: "A", providerName: "A", displayName: "Beta", network: "Visa" },
  ]);

  assert.deepEqual(groups.map((group) => group.providerName), ["A", "B"]);
  assert.deepEqual(groups[0].cards.map((card) => card.displayName), ["Alpha", "Beta"]);
});

test("create card payload only contains presetId and owner", () => {
  const payload = buildCreateCardPayload("sacombank-visa-platinum-cashback", " Long  Ho ");

  assert.deepEqual(payload, {
    presetId: "sacombank-visa-platinum-cashback",
    owner: "Long Ho",
  });
  assert.equal("annualFee" in payload, false);
  assert.equal("imageUrl" in payload, false);
  assert.equal("network" in payload, false);
});

test("remote card images bypass the server optimizer and retain client fallback", () => {
  const source = readFileSync(new URL("../src/components/cards/CardImage.tsx", import.meta.url), "utf8");

  assert.match(source, /unoptimized=\{remote\}/);
  assert.match(source, /setFailed\(true\)/);
  assert.match(source, /CATALOG_IMAGE_HOSTS/);
});

test("cards dashboard scopes all card widgets to the selected card id", () => {
  const source = readFileSync(new URL("../src/pages/cards/page.tsx", import.meta.url), "utf8");

  assert.match(source, /selectedCardId/);
  assert.match(source, /card\._id === selectedCardId/);
  assert.match(source, /filteredCardIds\.has\(item\.cardId\)/);
  assert.match(source, /cardId=\$\{encodeURIComponent\(selectedCardId\)\}/);
});
