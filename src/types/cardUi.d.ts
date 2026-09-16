declare module "@/lib/cards/uiCore.mjs" {
  export const CARD_IMAGE_PLACEHOLDER_URL: string;
  export const MAX_OWNER_LENGTH: number;
  export const normalizeOwnerInput: (owner: unknown) => string;
  export const validateOwnerInput: (owner: unknown) => { valid: boolean; owner: string; message: string };
  export const buildCreateCardPayload: (presetId: string, owner: string) => { presetId: string; owner: string };
  export const formatVnd: (value: unknown) => string;
  export const formatAnnualFee: (value: unknown) => string;
  export const formatDateDisplay: (dateStr: unknown) => string;
  export const formatRateBps: (value: unknown) => string;
  export const buildCardSummary: (
    card: Record<string, unknown>,
    statements?: Array<
      Record<string, unknown> & {
        statementDate?: string;
        paymentStatus?: string;
        effectivePaymentStatus?: string;
        summary?: { statementAmount?: number };
      }
    >,
    selectedPeriod?: { year?: number; month?: number },
  ) => {
    statementDate: string;
    paymentDueDate: string;
    currentOutstandingBalance: number;
    totalGrossDebt: number;
    totalPaidDebt: number;
    statementAmountDue: number;
  };
  export const getProviderName: (card: Record<string, unknown>) => string;
  export const getProviderKey: (card: Record<string, unknown>) => string;
  export const getDisplayName: (card: Record<string, unknown>) => string;
  export const getNetwork: (card: Record<string, unknown>) => string;
  export const compareCards: (left: Record<string, unknown>, right: Record<string, unknown>) => number;
  export const groupCardsByProvider: <T extends Record<string, unknown>>(
    cards: T[],
  ) => Array<{ providerKey: string; providerName: string; cards: T[] }>;
  export const getUniqueOwners: (cards: Array<Record<string, unknown>>) => string[];
  export const filterCardsByOwner: <T extends Record<string, unknown>>(cards: T[], owner: string) => T[];
  export const numberOrZero: (value: unknown) => number;
  export const buildOperationalUpdatePayload: (input: Record<string, unknown>) => Record<string, unknown>;
}

declare module "@/lib/cards/dueStatementsCore.mjs" {
  export type DueStatementStatus = "UPCOMING" | "DUE_TODAY" | "OVERDUE" | "PAID";
  export type DueStatementRow = {
    key: string;
    statement: (Record<string, unknown> & {
      id: string;
      cardId: string;
      statementDate: string;
      paymentDueDate: string;
      paymentStatus?: string;
      effectivePaymentStatus?: string;
      summary?: { statementAmount?: number; outstandingAmount?: number };
      paidAmount?: number | null;
    }) | null;
    card: Record<string, unknown> & {
      _id: string;
      providerName?: string;
      displayName?: string;
      owner?: string;
    };
    amountDue: number;
    remainingAmountDue: number;
    statementDate: string | null;
    dueDate: string;
    status: DueStatementStatus;
  };
  export const getStatementDueStatus: (statement: Record<string, unknown>, today?: string) => DueStatementStatus;
  export const buildDueStatementGroups: (input: {
    statements?: Array<Record<string, unknown>>;
    cards?: Array<Record<string, unknown>>;
    today?: string;
  }) => Array<{
    monthKey: string;
    monthLabel: string;
    dueCount: number;
    dueAmount: number;
    rows: DueStatementRow[];
  }>;
  export const buildOverdueStatementRows: (input: {
    statements?: Array<Record<string, unknown>>;
    cards?: Array<Record<string, unknown>>;
    today?: string;
  }) => DueStatementRow[];
}

declare module "@/lib/cards/cardDebtCore.mjs" {
  export const isOutstandingDebtStatement: (statement: Record<string, unknown>, today?: string) => boolean;
  export const summarizeCardDebt: (
    statements?: Array<
      Record<string, unknown> & {
        statementDate?: string;
        paymentDueDate?: string;
        paymentStatus?: string;
        effectivePaymentStatus?: string;
        summary?: { statementAmount?: number };
      }
    >,
    today?: string,
  ) => {
    totalOutstanding: number;
    outstandingCount: number;
    currentMonthDue: number;
    currentMonthDueCount: number;
    nextMonthDue: number;
    nextMonthDueCount: number;
    currentMonthKey: string;
    nextMonthKey: string;
  };
}
