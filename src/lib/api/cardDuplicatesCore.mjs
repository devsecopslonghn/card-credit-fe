import { cardDuplicateGroupListSchema, cardPortfolioCardSchema } from "@card-credit/contracts";

const normalizeCard = (value) => {
  const record = value && typeof value === "object" ? value : {};
  const dto = cardPortfolioCardSchema.parse(record);
  const { id, ...fields } = dto;
  return { ...fields, _id: id };
};

export const parseDuplicateGroups = (value) => {
  const input = Array.isArray(value)
    ? value.map((item) => {
      const group = item && typeof item === "object" ? item : {};
      const cards = group.cards;
      return { ...group, cards };
    })
    : [];
  const parsed = cardDuplicateGroupListSchema.parse(input);
  return parsed.map((group) => ({ ...group, cards: group.cards.map(normalizeCard) }));
};
