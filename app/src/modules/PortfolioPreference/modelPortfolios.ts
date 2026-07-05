import type { AumBreakdown, RiskProfile } from "../../types";

export type AssetKey = keyof AumBreakdown;

export const ASSET_KEYS: AssetKey[] = ["equities", "fixedIncome", "structuredProducts", "funds", "cash"];

// Target model allocation weights (%) per risk preference — house model portfolios.
export const MODEL_PORTFOLIOS: Record<RiskProfile, Record<AssetKey, number>> = {
  Conservative: { equities: 15, fixedIncome: 45, structuredProducts: 5, funds: 20, cash: 15 },
  Balanced: { equities: 30, fixedIncome: 30, structuredProducts: 10, funds: 22, cash: 8 },
  Growth: { equities: 45, fixedIncome: 15, structuredProducts: 15, funds: 20, cash: 5 },
  Aggressive: { equities: 55, fixedIncome: 8, structuredProducts: 20, funds: 14, cash: 3 },
};

export const RISK_PROFILES: RiskProfile[] = ["Conservative", "Balanced", "Growth", "Aggressive"];
