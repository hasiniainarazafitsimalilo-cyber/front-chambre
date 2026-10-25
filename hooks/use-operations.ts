import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/context";
import {
  listMaintenance,
  createMaintenance,
  updateMaintenance,
  listHousekeeping,
  createHousekeeping,
  updateHousekeeping,
} from "@/lib/api/operations";

export function useMaintenance() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["operations", "maintenance"],
    queryFn: () => listMaintenance(getToken() ?? ""),
  });
}

export function useCreateMaintenance() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { room_id: string; description: string }) =>
      createMaintenance(getToken() ?? "", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["operations", "maintenance"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateMaintenance() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateMaintenance(getToken() ?? "", id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["operations", "maintenance"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useHousekeeping() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["operations", "housekeeping"],
    queryFn: () => listHousekeeping(getToken() ?? ""),
  });
}

export function useCreateHousekeeping() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { room_id: string; notes?: string; scheduled_at?: string }) =>
      createHousekeeping(getToken() ?? "", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["operations", "housekeeping"] });
    },
  });
}

export function useUpdateHousekeeping() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      updateHousekeeping(getToken() ?? "", id, { status, notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["operations", "housekeeping"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
