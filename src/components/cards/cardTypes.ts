import type { CardCatalogProduct, CardCatalogProvider } from "@/types/cardCatalog";
import {
  CARD_IMAGE_PLACEHOLDER_URL,
  MAX_OWNER_LENGTH,
  buildCreateCardPayload,
  buildCardSummary,
  buildOperationalUpdatePayload,
  filterCardsByOwner,
  formatAnnualFee,
  formatDateDisplay,
  formatRateBps,
  formatVnd,
  getDisplayName,
  getNetwork,
  getProviderKey,
  getProviderName,
  getUniqueOwners,
  groupCardsByProvider,
  normalizeOwnerInput,
  numberOrZero,
  validateOwnerInput,
} from "@/lib/cards/uiCore.mjs";

export type CreditCardView = {
  _id: string;
  presetId?: string | null;
  providerCode?: string | null;
  providerName?: string | null;
  displayName?: string | null;
  network?: string | null;
  owner?: string;
  imageUrl?: string;
  annualFee?: number | null;
  targetSpendForWaiver?: number;
  annualFeeWaiverTarget?: number | null;
  statementDay?: number;
  paymentDueDays?: number;
  cashbackCapAmount?: number | null;
  cashbackCapPeriod?: "STATEMENT" | "CALENDAR_MONTH";
  active?: boolean;
  reminderEnabled?: boolean;
  reminderDaysBefore?: number[];
  reminderTimezone?: string;
  reminderTime?: string;
};

export type CardSummaryView = {
  statementDate: string;
  paymentDueDate: string;
  totalGrossDebt: number;
  totalPaidDebt: number;
  currentOutstandingBalance: number;
  statementAmountDue: number;
};

export type ProviderGroup = {
  providerKey: string;
  providerName: string;
  cards: CreditCardView[];
};

export type CatalogProviderOption = CardCatalogProvider;
export type CatalogProductOption = CardCatalogProduct;

export {
  CARD_IMAGE_PLACEHOLDER_URL,
  MAX_OWNER_LENGTH,
  buildCreateCardPayload,
  buildCardSummary,
  buildOperationalUpdatePayload,
  filterCardsByOwner,
  formatAnnualFee,
  formatDateDisplay,
  formatRateBps,
  formatVnd,
  getDisplayName,
  getNetwork,
  getProviderKey,
  getProviderName,
  getUniqueOwners,
  groupCardsByProvider,
  normalizeOwnerInput,
  numberOrZero,
  validateOwnerInput,
};
