import { http } from "./http";
import type { ModelPortfolios, RmProfile } from "../types";

export function getRmProfile(): Promise<RmProfile> {
  return http.get<RmProfile>("/rm-profile");
}

export function getUnderlyings(): Promise<string[]> {
  return http.get<string[]>("/underlyings");
}

export function getModelPortfolios(): Promise<ModelPortfolios> {
  return http.get<ModelPortfolios>("/model-portfolios");
}
