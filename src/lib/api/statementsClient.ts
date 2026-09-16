import { statementListSchema, statementPaymentExecuteInputSchema, statementPaymentInputSchema, statementPaymentPreviewSchema, statementSchema } from "@card-credit/contracts";
import type { StatementDto, StatementPaymentAction, StatementPaymentPreviewDto } from "@card-credit/contracts";

export type PaymentStatus = "OPEN" | "STATEMENT_CLOSED" | "PAID" | "OVERDUE";
export type StatementTransactionView = NonNullable<StatementDto["transactions"]>[number];
export type CardStatementView = StatementDto;
type DataResponse<T> = { data: T };
const parseError = async (response: Response, fallback: string) => { try { const body = await response.json() as { error?: { message?: string }; message?: string }; return body.error?.message || body.message || fallback; } catch { return fallback; } };
const request = async <T>(url: string, init?: RequestInit) => { const response = await fetch(url, init); if (!response.ok) throw new Error(await parseError(response, "Không thể tải dữ liệu sao kê.")); return (await response.json() as DataResponse<T>).data; };
const parseStatementList = (value: unknown) => statementListSchema.parse(value) as StatementDto[];
export const createStatementPaymentKey = () => `statement-payment-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
export const fetchAllCardStatements = async () => parseStatementList(await request<unknown>(`/api/card-statements?timestamp=${Date.now()}`, { cache: "no-store" }));
export const fetchCardStatements = async (cardId: string) => parseStatementList(await request<unknown>(`/api/cards/${encodeURIComponent(cardId)}/statements?timestamp=${Date.now()}`, { cache: "no-store" }));
export const fetchStatementDetail = async (cardId: string, statementId: string) => statementSchema.parse(await request<unknown>(`/api/cards/${encodeURIComponent(cardId)}/statements/${encodeURIComponent(statementId)}`)) as StatementDto;
export const previewStatementPayment = async (cardId: string, statementId: string, action: StatementPaymentAction, repaymentAccountId?: string): Promise<StatementPaymentPreviewDto> => {
  const payload = statementPaymentInputSchema.parse({ action, ...(repaymentAccountId ? { repaymentAccountId } : {}) });
  return statementPaymentPreviewSchema.parse(await request<unknown>(`/api/cards/${cardId}/statements/${statementId}/payment/preview`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })) as StatementPaymentPreviewDto;
};
export const updateStatementPayment = async (cardId: string, statementId: string, action: StatementPaymentAction, repaymentAccountId?: string, idempotencyKey = createStatementPaymentKey(), expectedVersion?: string, confirmation?: Pick<StatementPaymentPreviewDto, "previewId" | "confirmationToken">) => {
  const payload = statementPaymentExecuteInputSchema.parse({ action, ...(repaymentAccountId ? { repaymentAccountId } : {}), ...(expectedVersion ? { expectedVersion } : {}), previewId: confirmation?.previewId, confirmationToken: confirmation?.confirmationToken });
  return statementSchema.parse(await request<unknown>(`/api/cards/${cardId}/statements/${statementId}/payment`, { method: "PATCH", headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey }, body: JSON.stringify(payload) })) as StatementDto;
};
