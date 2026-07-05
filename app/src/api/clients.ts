import { http } from "./http";
import type { Client } from "../types";

export function getClients(): Promise<Client[]> {
  return http.get<Client[]>("/clients");
}
