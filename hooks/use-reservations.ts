import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/context";
import { createReservation, getReservations, processCheckIn, processCheckOut } from "@/lib/api/reservations";
import type { ReservationPayload } from "@/types/reservation";

export function useReservations() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["reservations"],
    queryFn: () => getReservations(getToken() ?? ""),
  });
}

export function useCreateReservation() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReservationPayload) =>
      createReservation(getToken() ?? "", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["availability"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}

export function useCheckIn() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reservationId: string) => processCheckIn(getToken() ?? "", reservationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useCheckOut() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reservationId: string) => processCheckOut(getToken() ?? "", reservationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}
