import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/context";
import {
  getDashboardOverview,
  getRevenueSummary,
  getOccupancySummary,
} from "@/lib/api/dashboard";

export function useDashboardOverview() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => getDashboardOverview(getToken() ?? ""),
    staleTime: 60 * 1000, // 1 min
    refetchInterval: 2 * 60 * 1000, // auto-refresh every 2 min
  });
}

export function useRevenue(fromDate: string, toDate: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["dashboard", "revenue", fromDate, toDate],
    queryFn: () => getRevenueSummary(getToken() ?? "", fromDate, toDate),
    enabled: Boolean(fromDate && toDate),
  });
}

export function useOccupancy(fromDate: string, toDate: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["dashboard", "occupancy", fromDate, toDate],
    queryFn: () => getOccupancySummary(getToken() ?? "", fromDate, toDate),
    enabled: Boolean(fromDate && toDate),
  });
}
