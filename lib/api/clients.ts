import { apiRequest } from "@/lib/api/client";
import type { ClientSummary } from "@/types/catalog";

export async function listClients(token: string, page = 1, pageSize = 20) {
  return apiRequest<ClientSummary[]>(`/clients?page=${page}&page_size=${pageSize}`, { method: "GET" }, token);
}
