import { http } from "./http";
import type { Currency, Order } from "../types";

export interface QuoteRequestInput {
  underlyingsCount: number;
  barrier: number;
  notional: number;
  couponType: string;
}

export interface QuoteResult {
  indicativeCoupon: number;
  indicativePrice: number;
}

export interface BookOrderInput {
  clientId: string;
  clientName: string;
  underlyings: string[];
  tenor: string;
  barrier: number;
  couponType: string;
  notional: number;
  currency: Currency;
  quote: QuoteResult;
}

export function getOrders(): Promise<Order[]> {
  return http.get<Order[]>("/orders");
}

export function requestQuote(input: QuoteRequestInput): Promise<QuoteResult> {
  return http.post<QuoteResult>("/orders/quote", input);
}

export function bookOrder(input: BookOrderInput): Promise<Order> {
  return http.post<Order>("/orders", input);
}
