import { apiRequest } from "@/lib/api/client";
import type { ReservationPayload, ReservationSummary } from "@/types/reservation";

export async function createReservation(token: string, payload: ReservationPayload) {
  return apiRequest<{ id: string; reference: string; total_amount: number }>("/reservations", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token);
}

export async function getReservations(token: string) {
  return apiRequest<ReservationSummary[]>("/reservations", {
    method: "GET",
  }, token);
}

export async function getReservationById(token: string, reservationId: string) {
  return apiRequest<ReservationSummary>(`/reservations/${reservationId}`, {
    method: "GET",
  }, token);
}

export async function processCheckIn(token: string, reservationId: string) {
  return apiRequest<{ id: string; checked_in_at: string }>(`/check-ins/${reservationId}`, {
    method: "POST",
  }, token);
}

export async function processCheckOut(token: string, reservationId: string) {
  return apiRequest<{ id: string; checked_out_at: string }>(`/check-outs/${reservationId}`, {
    method: "POST",
  }, token);
}
