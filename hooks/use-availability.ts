import { useQuery } from "@tanstack/react-query";
import { fetchAvailability, type AvailabilityFilters } from "@/lib/api/availability";

export function useAvailability(filters: AvailabilityFilters | null) {
  return useQuery({
    queryKey: ["availability", filters],
    queryFn: () => fetchAvailability(filters!),
    enabled: Boolean(filters && filters.check_in_date && filters.check_out_date && filters.adults > 0),
  });
}
