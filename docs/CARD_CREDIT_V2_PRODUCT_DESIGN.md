# Card Credit v2 — Product and Finance Domain Redesign

Status: **PROPOSED / design only — no runtime or database change**
Scope: `card-credit-fe` UX, `card-credit-be` financial semantics, `card-credit-helm-chart` safe rollout.
Context: The application must return to its original purpose: **know exactly how much I owe on each credit card, how much must be paid this cycle, how much cash I have, and what repayments/refunds are pending.**

## 1. Product decision

Build a small **Credit Card & Cash Tracker**, **not** an all-in-one Personal Finance suite.

Must-have:
1. See current total card liability and breakdown by card.
2. See **amount currently due**, issuer due date, and paid/unpaid statement status; do not infer this from overall card debt.
3. Record card purchases, cash movements, card payments, card refunds, spending on behalf of others, and repayments of those advances.
4. Reconcile app balances against issuer statements and current bank/cash balances.
5. Preserve a transparent, auditable correction history.

Not in primary navigation: budgeting, advanced cashback, fee center, recurring planner, card product catalog, analytics, MCP administration, banking master data. Keep existing internals behind an Advanced/Admin section only when necessary. Never delete historical data just because a screen is hidden.

Three primary pages:
- **Overview**: total card debt, real money, this-cycle due amount, pending refunds/receivables, upcoming dues, card list, latest entries.
- **Cards**: one card detail with current balance, statement-specific due balance, next due date, and itemized transactions; the card list is a flat compact view.
- **Activity**: unified chronological history, filters and one clear Add action.
Settings/Advanced is outside main daily navigation. Mobile-first UI, Vietnamese labels, currency in VND.

## 2. Non-negotiable definitions

- **Current card liability** = opening posted liability + posted purchases + posted fees/interest - posted merchant refunds - posted cashback credited to the card - posted card repayments. Never clamp at individual statement level. A negative total is an issuer **credit balance**, not silently zeroed data.
- **Statement due** = amount the issuer requires for a specific *closed* statement, less issuer-recognized subsequent payments/credits in accordance with its rules. Show *minimum payment* separately if provided. Do not simply use the card's current liability or assume a refund settles a statement.
- **Unbilled charges** = posted card charges after the latest closed statement, net of applicable credits; clearly distinct from statement due.
- **Real money** = opening account balance + posted money received - posted money paid, by actual CASH/DEBIT/E_WALLET account. Spending on credit does not reduce this value until payment.
- **Receivable from a person** = a separate claim with an agreed amount, origin, collections and remaining due. `PAID_FOR_OTHER` does not imply the full original expense remains owed today.
- **Expected merchant refund** = pending claim against a merchant/issuer, distinct from a person owing the user. Pending does not reduce posted debt or increase bank money until it posts. Make merchant refunds optionally attach to original card expense.
- **Cashback** is distinct from merchant refund and from an advance reimbursement. Cashback to CREDIT offsets liability; cashback to real money increases cash balance.
- **Cash minus card debt** is a narrow liquidity metric; **net financial position** = real money + confirmed collectible receivables - card liability. Do not count expected refunds twice when subsequently posted. Do not call this complete net worth while omitting other assets/liabilities.

Always show a balance `asOf` timestamp and a verification source/status (statement, bank, manually verified, unverified). No fabricated due dates or payments.

## 3. Canonical model / posting engine

Retain MongoDB/Fastify/React/Helm, but create **one** canonical posting engine that powers all UI and MCP commands. Projection services must not each implement their own debt arithmetic.

- **Account**: CASH, DEBIT, E_WALLET, CARD_LIABILITY. Stable workspace owner/currency, opening ledger entry at exactly one cutover boundary.
- **Card**: linked liability account; provider; closing and due rules (date actual statement due may override calculated schedule). Never create implicit duplicate cards or accounts.
- **FinancialEvent**: immutable eventId, workspaceId, kind, amountVnd integer, effectiveDate (Asia/Ho_Chi_Minh), postedDate, state (PENDING/POSTED/REVERSED), sourceAccountId/destinationAccountId where relevant, cardId, statementId when applicable, relatedEventId, merchant/counterparty, description, creationChannel (browser/MCP/import), idempotencyKey and audit metadata. A change in amount/account/type is a reversal and replacement, not an in-place rewrite. Metadata edit can be audited.
- **PostingEntry**: explicit signed deltas to accounts/receivables generated once by the event posting engine, in the same Mongo transaction. Current balances are sums of entries; no separate manually edited debt snapshot.
- **Statement**: issuer period, `closedAt`, `dueAt`, issuerProvidedStatementBalance, minimumDue if known; applied payment/credit allocations tracked distinctly, rather than interpreting all negative card ledger movements as a payment.
- **Receivable**: counterparty, originating transaction/event, original/agreed amount, collections, outstanding, status. Distinguish `PERSON_ADVANCE` and `MERCHANT_REFUND_PENDING`.
- **ReconciliationRun**: source, import time, asOfDate, expected balances, computed balances, signed differences, mismatched items, status and reviewer. No automatic repair during read queries, app startup or Helm sync.

Event posting rules:

| Event | Real money | Card liability | Receivable | Statement payment |
|---|---:|---:|---:|---|
| Card purchase 1,000,000 | 0 | +1,000,000 | 0 | 0 |
| Card purchase on behalf 1,000,000 (if agreed recoverable) | 0 | +1,000,000 | +agreed claim | 0 |
| Cash-funded card repayment 400,000 | -400,000 | -400,000 | 0 | +400,000 applied to statement |
| Merchant refund credited to card 480,000 | 0 | -480,000 | pending refund -480,000 if linked | **not** a payment |
| Merchant refund credited to bank 480,000 | +480,000 | 0 | pending refund -480,000 if linked | 0 |
| Person repays advance to bank 300,000 | +300,000 | 0 | -300,000 | 0 |
| Cashback credited to card 50,000 | 0 | -50,000 | 0 | **not** a payment |

Amounts in the table are examples of changes, not records to be imported or edited.

## 4. Input UX — choose a user action, not an accounting code

The main Add action begins with one of:
1. **Chi tiêu bằng thẻ**: card, money, date, merchant/note; optional "Chi hộ" toggle reveals counterparty + expected reimbursement.
2. **Thanh toán thẻ**: real-money source, card, amount, date and optionally specific statement. Preview must show cash -X, card debt -X, statement due -Y.
3. **Được hoàn tiền**: choose bank account or card receiving the refund, amount, status (expected vs received), optionally link original transaction. Preview money/debt/receivable deltas.
4. **Nhận tiền chi hộ**: choose original outstanding receivable, receiving cash/bank account and amount. Must not exceed remaining claim.
5. **Điều chỉnh/đối soát** (Advanced): requires selected as-of date, bank/reference evidence, signed difference, reason, review and preview. No hidden `balanceAdjustment` in basic form.

Automatic currency grouping; clear Vietnamese wording. Never show `accountType`, `ownership`, `debitCashflow`, `creditDebt`, fee percentage or technical deltas in everyday form unless genuinely relevant. Display expected before/after effects and a confirmation receipt. Writes use idempotency keys and independently validated cross-field rules.

## 5. UX page sketch

### Overview
- Header: 'Thẻ tín dụng của tôi' + as-of date + verified/unverified status.
- 4 metrics: Nợ thẻ hiện tại; Phải thanh toán kỳ này; Tiền khả dụng; Khoản phải thu/chờ hoàn (split detail by type).
- Section: 'Sắp đến hạn' with issuer, due date, amount due, payment button.
- Compact list: VIB Max / UOB One / Shinhan Supreme (balance, next due, last reconciled).
- Small recent event list + prominent 'Thêm giao dịch' button.
- A mismatched balance banner should link directly to read-only reconciliation, never silently adjust a number.

### Card detail
- Current posted card debt at top.
- Statement due, minimum due (only if issuer-supplied), due date, unbilled transactions, posted credits.
- Tabs: Activity | Statements; card settings under secondary menu.
- Show merchant refunds and payments as distinct rows.

### Activity
- Search/filter by card, event type, date/status, all transactions with server-side cursor pagination.
- Edit note/category only if financial state is immutable.
- Financial corrections use a reverse-and-replace flow with an impact preview.

## 6. Historical repair and cutover: evidence first

**Do not roll back, reset or edit production MongoDB by inference.** The original anchors below are provided by the user as an Oct 05, 2026 historical snapshot, not today's verified positions:

| Balance/claim (2026-10-05) | VND |
|---|---:|
| Available real money | 14,235,660 |
| VIB Max card current liability | 13,897,000 |
| UOB One card current liability | 17,080,000 |
| Shinhan Supreme card current liability | 0 |
| Total card liability | 30,977,000 |
| Expected merchant refund (not received) | 480,000 |
| Cash minus debt (excludes refund) | -16,741,340 |

Restore procedure:
1. Record actual running image tags, application version, current database and workspace; **fence all writers** for an agreed maintenance window (browser/API and MCP). GitOps currently configures MCP writer `write`; `read` is supported but does not fence other API writers.
2. Snapshot/export the actual MongoDB source including immutable audit/idempotency/payment history, verify checksums/record counts and ability to restore. Confirm database is `card-credit`, not historical `test`.
3. Reconcile existing accounts, transactions, statements and receivables as-of **2026-10-05**, then separately reconcile activity from Oct 06 onward. Show every discrepancy at source transaction level.
4. Import bank issuer statements (CSV/PDF operator reviewed) and cash/bank balances where available; mark unmatched records for operator review. Do not silently create missing charges/payments from an approximate difference.
5. Preferred: repair proven missing/wrong transactions via immutable compensating entries and rationale. If history is too untrustworthy to reconstruct, archive legacy as read-only and start a new *explicitly approved* cutover ledger using independently confirmed as-of balances. Do not count opening balances and old ledger history together.
6. Run the new posting engine in **shadow read mode** against exported data, compare projected balances with ledger and statements. Switch writes only after reconciliation passes and backup/rollback procedure is tested.
7. Roll back **application images** independently from **database state**; do not rerun old destructive migrations.

## 7. Acceptance / release gates

- VIB/UOB/Shinhan balances for 2026-10-05 match independently verified evidence or are explicitly flagged **UNVERIFIED**. Historical target is not used as an automatic write instruction.
- Credit purchase raises debt and leaves real money unchanged.
- Card repayment lowers money and debt exactly once, even after retries; a statement paid status requires a valid underlying payment allocation.
- Merchant refund to card lowers debt but is **not** counted as `STATEMENT_PAYMENT`; cash refund increases money instead.
- Pending refund does not change posted money or posted debt; final posting clears the pending claim exactly once.
- Linked partial repayment of an advance reduces receivable only once; retry has no additional effect.
- A negative signed statement cycle can offset the *portfolio card liability* but cannot produce a fictional historical statement payment.
- All amount-changing corrections require a reversing entry and audit trail; edits of descriptions do not change balances.
- Dashboard, card detail, account list, reporting and MCP read tools show the same canonical balance `asOf` and provenance.
- Activity is fully pageable beyond 100 items, works on mobile and uses Vietnamese local dates.
- CI unit + property/invariant + integration + E2E passes. Helm remains pinned until a manual deploy review.

## 8. Implementation order / ownership

1. **Protect** (Helm + BE): inventory and backup, verified read-only reconciliation, gate/fence writers.
2. **Define** (BE): canonical immutable event/entries and domain contract; isolate legacy projections.
3. **Reconcile** (BE): compute signed card liability, statement due allocations and distinct receivables; regression suite.
4. **Simplify** (FE): 3 pages and 5 guided workflows, no hidden financial state changes.
5. **Migrate** (BE + Helm): approved compensating events or cutover entries, shadow comparison and manual release.
6. **Retire** old menu surface only when parity passes; keep read-only historical audit/export.

## 9. Explicitly deferred
AI recommendations, automatic bank scraping, OCR extraction as source of truth, sophisticated budgets, card reward optimization, catalog management and a generic finance ERP domain. These cannot block accurate card debt tracking.

**Decision required before build:** inspect actual issuer statements and determine whether the legacy ledger is repairable or a separate reconciled cutover should be used. This is a decision on verified financial evidence, not on UI appearance.
