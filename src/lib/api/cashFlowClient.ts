import type { MonthlyCashFlowRowDto } from "@card-credit/contracts";
import { parseMonthlyCashFlow } from "./cashFlowCore.mjs";

export type MonthlyCashFlow = MonthlyCashFlowRowDto;
export const fetchMonthlyCashFlow = async (period: string) => {
  const response = await fetch(`/api/cash-flow/monthly?period=${encodeURIComponent(period)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Không thể tải tổng quan dòng tiền.");
  return parseMonthlyCashFlow(await response.json()).data as MonthlyCashFlow[];
};
