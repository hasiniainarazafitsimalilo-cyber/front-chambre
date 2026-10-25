import { apiRequest, buildQueryString } from "@/lib/api/client";
import type { AvailabilityRoom } from "@/types/reservation";

export type AvailabilityFilters = {
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children?: number;
  room_type_id?: string;
};

export async function fetchAvailability(filters: AvailabilityFilters) {
  return apiRequest<AvailabilityRoom[]>(
    `/availability${buildQueryString({
      check_in_date: filters.check_in_date,
      check_out_date: filters.check_out_date,
      adults: filters.adults,
      children: filters.children ?? 0,
      room_type_id: filters.room_type_id,
    })}`,
  );
}
