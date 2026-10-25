import { apiRequest } from "@/lib/api/client";
import type { DashboardOverview, OccupancySummary, RevenueSummary } from "@/types/reservation";

export async function getDashboardOverview(token: string) {
  return apiRequest<DashboardOverview>("/dashboard/overview", { method: "GET" }, token);
}

export async function getRevenueSummary(token: string, fromDate: string, toDate: string) {
  return apiRequest<RevenueSummary>(`/dashboard/revenue?from_date=${fromDate}&to_date=${toDate}`, { method: "GET" }, token);
}

export async function getOccupancySummary(token: string, fromDate: string, toDate: string) {
  return apiRequest<OccupancySummary>(`/dashboard/occupancy?from_date=${fromDate}&to_date=${toDate}`, { method: "GET" }, token);
}
