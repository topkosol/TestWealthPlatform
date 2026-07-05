import { http } from "./http";
import type { Transaction } from "../types";

export function getTransactions(): Promise<Transaction[]> {
  return http.get<Transaction[]>("/transactions");
}
