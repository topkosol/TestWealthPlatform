import type { AssetKey, RiskProfile } from "../../types";

export type { AssetKey };

export const ASSET_KEYS: AssetKey[] = ["equities", "fixedIncome", "structuredProducts", "funds", "cash"];

export const RISK_PROFILES: RiskProfile[] = ["Conservative", "Balanced", "Growth", "Aggressive"];
