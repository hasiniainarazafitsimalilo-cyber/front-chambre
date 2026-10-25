import { apiRequest } from "@/lib/api/client";

export async function checkInReservation(token: string, reservationId: string) {
  return apiRequest<{ id: string; checked_in_at: string }>(`/check-ins/${reservationId}`, {
    method: "POST",
  }, token);
}

export async function checkOutReservation(token: string, reservationId: string) {
  return apiRequest<{ id: string; checked_out_at: string }>(`/check-outs/${reservationId}`, {
    method: "POST",
  }, token);
}
