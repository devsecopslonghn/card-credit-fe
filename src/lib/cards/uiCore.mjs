export const CARD_IMAGE_PLACEHOLDER_URL = "/card-images/placeholder-card.svg";
export const MAX_OWNER_LENGTH = 120;

export const normalizeOwnerInput = (owner) =>
  typeof owner === "string" ? owner.trim().replace(/\s+/g, " ") : "";

export const validateOwnerInput = (owner) => {
  const normalized = normalizeOwnerInput(owner);

  if (!normalized) {
    return {
      valid: false,
      owner: normalized,
      message: "Vui lòng nhập chủ thẻ.",
    };
  }

  if (normalized.length > MAX_OWNER_LENGTH) {
    return {
      valid: false,
      owner: normalized,
      message: `Chủ thẻ không được vượt quá ${MAX_OWNER_LENGTH} ký tự.`,
    };
  }

  return { valid: true, owner: normalized, message: "" };
};

export const buildCreateCardPayload = (presetId, owner) => ({
  presetId,
  owner: normalizeOwnerInput(owner),
});

export const formatVnd = (value) => {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(0);
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

export const formatAnnualFee = (value) => {
  if (value === null || value === undefined || value === "") return "Chưa xác định";
  return formatVnd(value);
};

export const formatRateBps = (value) => {
  const bps = Number(value ?? 0);
  if (!Number.isFinite(bps)) return "0%";
  return `${(bps / 100).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}%`;
};

export const formatDateDisplay = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return "Chưa thiết lập";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return "Chưa thiết lập";
  return `${day}/${month}/${year}`;
};

const formatDateOnly = ({ year, month, day }) =>
  `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const lastDayOfMonth = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate();

const normalizeStatementDay = (statementDay) => {
  const day = Number(statementDay ?? 1);
  return Number.isInteger(day) && day >= 1 ? Math.min(day, 31) : 1;
};

const addDaysToDateOnly = (dateOnly, days) => {
  const [year, month, day] = String(dateOnly).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + Number(days ?? 0)));
  return formatDateOnly({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  });
};

const isPaidStatement = (statement) =>
  statement?.paymentStatus === "PAID" || statement?.effectivePaymentStatus === "PAID";

const getStatementAmountDue = (statement) => {
  if (isPaidStatement(statement)) return 0;
  const total = Number(statement?.summary?.statementAmount ?? 0);
  const paid = Number(statement?.paidAmount ?? 0);
  if (!Number.isFinite(total)) return 0;
  return Math.max(0, total - (Number.isFinite(paid) ? paid : 0));
};

const getStatementGrossDebt = (statement) => Math.max(0, Number(statement?.summary?.statementAmount ?? 0));

const getStatementPaidDebt = (statement) => {
  const gross = getStatementGrossDebt(statement);
  const explicitPaid = Number(statement?.paidAmount);
  if (Number.isFinite(explicitPaid)) return Math.min(gross, Math.max(0, explicitPaid));
  if (isPaidStatement(statement)) return gross;
  const outstanding = Number(statement?.summary?.outstandingAmount);
  return Number.isFinite(outstanding) ? Math.min(gross, Math.max(0, gross - outstanding)) : 0;
};

export const buildCardSummary = (card, statements = [], selectedPeriod = {}) => {
  const year = Number(selectedPeriod.year);
  const month = Number(selectedPeriod.month);
  const selectedYear = Number.isInteger(year) && year > 0 ? year : new Date().getFullYear();
  const selectedMonth = Number.isInteger(month) && month >= 1 && month <= 12 ? month : new Date().getMonth() + 1;
  const statementDay = normalizeStatementDay(card?.statementDay);
  const statementDate = formatDateOnly({
    year: selectedYear,
    month: selectedMonth,
    day: Math.min(statementDay, lastDayOfMonth(selectedYear, selectedMonth)),
  });
  const paymentDueDate = addDaysToDateOnly(statementDate, Number(card?.paymentDueDays ?? 15));
  const selectedStatement = statements.find((statement) => statement?.statementDate === statementDate);
  const derivedOutstandingBalance = statements.reduce((sum, statement) => {
    const amountDue = getStatementAmountDue(statement);
    if (isPaidStatement(statement) || amountDue <= 0) return sum;
    return sum + amountDue;
  }, 0);
  const totalGrossDebt = statements.reduce((sum, statement) => sum + getStatementGrossDebt(statement), 0);
  const totalPaidDebt = statements.reduce((sum, statement) => sum + getStatementPaidDebt(statement), 0);
  return {
    statementDate,
    paymentDueDate,
    currentOutstandingBalance: derivedOutstandingBalance,
    totalGrossDebt,
    totalPaidDebt,
    statementAmountDue: selectedStatement ? getStatementAmountDue(selectedStatement) : 0,
  };
};

export const getProviderName = (card) => {
  const providerName = card?.providerName;
  return typeof providerName === "string" && providerName.trim() ? providerName.trim() : "Không xác định";
};

export const getProviderKey = (card) => {
  const key = card?.providerCode;
  const normalized = typeof key === "string" ? key.trim().toUpperCase() : "";
  return normalized || "UNKNOWN";
};

export const getDisplayName = (card) => {
  const displayName = card?.displayName;
  return typeof displayName === "string" && displayName.trim() ? displayName.trim() : "Thẻ chưa xác định";
};

export const getNetwork = (card) => {
  const network = card?.network;
  return typeof network === "string" && network.trim() ? network.trim() : "Không xác định";
};

export const compareCards = (left, right) =>
  getDisplayName(left).localeCompare(getDisplayName(right), "vi") ||
  getNetwork(left).localeCompare(getNetwork(right), "vi") ||
  String(left?._id ?? "").localeCompare(String(right?._id ?? ""));

export const groupCardsByProvider = (cards) => {
  const groups = new Map();

  for (const card of cards) {
    const providerKey = getProviderKey(card);
    const providerName = getProviderName(card);
    const group = groups.get(providerKey) ?? {
      providerKey,
      providerName,
      cards: [],
    };

    if (providerName !== "Không xác định" && group.providerName === "Không xác định") {
      group.providerName = providerName;
    }

    group.cards.push(card);
    groups.set(providerKey, group);
  }

  return [...groups.values()]
    .map((group) => ({ ...group, cards: [...group.cards].sort(compareCards) }))
    .sort(
      (left, right) =>
        left.providerName.localeCompare(right.providerName, "vi") ||
        left.providerKey.localeCompare(right.providerKey, "vi"),
    );
};

export const getUniqueOwners = (cards) =>
  [...new Set(cards.map((card) => normalizeOwnerInput(card?.owner)).filter(Boolean))].sort((left, right) =>
    left.localeCompare(right, "vi"),
  );

export const filterCardsByOwner = (cards, owner) => {
  const normalizedOwner = normalizeOwnerInput(owner);
  if (!normalizedOwner) return cards;
  return cards.filter((card) => normalizeOwnerInput(card?.owner) === normalizedOwner);
};

export const numberOrZero = (value) => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
};

export const buildOperationalUpdatePayload = (input) => {
  const payload = {};
  if ("owner" in input) payload.owner = normalizeOwnerInput(input.owner);
  if ("targetSpendForWaiver" in input) payload.targetSpendForWaiver = numberOrZero(input.targetSpendForWaiver);
  if ("annualFeeWaiverTarget" in input) payload.annualFeeWaiverTarget = numberOrZero(input.annualFeeWaiverTarget);
  if ("statementDay" in input) payload.statementDay = numberOrZero(input.statementDay);
  if ("paymentDueDays" in input) payload.paymentDueDays = numberOrZero(input.paymentDueDays);
  if ("cashbackCapAmount" in input) {
    payload.cashbackCapAmount = input.cashbackCapAmount === null || input.cashbackCapAmount === "" ? null : numberOrZero(input.cashbackCapAmount);
  }
  if ("cashbackCapPeriod" in input) payload.cashbackCapPeriod = input.cashbackCapPeriod === "CALENDAR_MONTH" ? "CALENDAR_MONTH" : "STATEMENT";
  if ("active" in input) payload.active = Boolean(input.active);
  if ("reminderEnabled" in input) payload.reminderEnabled = Boolean(input.reminderEnabled);
  if ("reminderDaysBefore" in input) payload.reminderDaysBefore = input.reminderDaysBefore;
  if ("reminderTimezone" in input) payload.reminderTimezone = input.reminderTimezone;
  if ("reminderTime" in input) payload.reminderTime = input.reminderTime;
  return payload;
};
