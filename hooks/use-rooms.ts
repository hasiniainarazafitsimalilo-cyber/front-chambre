import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/context";
import { apiRequest, buildQueryString } from "@/lib/api/client";
import type { RoomSummary, RoomTypeSummary, AmenitySummary } from "@/types/catalog";

// ─── Rooms ──────────────────────────────────────────────────────────────────

export function useRooms(page = 1, pageSize = 50) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["rooms", page, pageSize],
    queryFn: () =>
      apiRequest<RoomSummary[]>(
        `/rooms${buildQueryString({ page, page_size: pageSize })}`,
        { method: "GET" },
        getToken() ?? undefined,
      ),
  });
}

export function useRoom(roomId: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["room", roomId],
    queryFn: () =>
      apiRequest<RoomSummary>(
        `/rooms/${roomId}`,
        { method: "GET" },
        getToken() ?? undefined,
      ),
    enabled: !!roomId,
  });
}

export function useCreateRoom() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { room_number: string; room_type_id: string; floor?: number | null; description?: string | null; image_url?: string | null; images?: string[]; amenity_ids?: string[] }) =>
      apiRequest<RoomSummary>("/rooms", { method: "POST", body: JSON.stringify(payload) }, getToken() ?? undefined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rooms"] }); },
  });
}

export function useUpdateRoom() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, payload }: { roomId: string; payload: { room_number?: string; room_type_id?: string; floor?: number | null; status?: string; description?: string; image_url?: string | null; images?: string[]; amenity_ids?: string[] } }) =>
      apiRequest<RoomSummary>(`/rooms/${roomId}`, { method: "PATCH", body: JSON.stringify(payload) }, getToken() ?? undefined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rooms"] }); },
  });
}

export function useDeleteRoom() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) =>
      apiRequest<void>(`/rooms/${roomId}`, { method: "DELETE" }, getToken() ?? undefined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rooms"] }); },
  });
}

// ─── Room Types ─────────────────────────────────────────────────────────────

export function useRoomTypes() {
  return useQuery({
    queryKey: ["room-types"],
    queryFn: () => apiRequest<RoomTypeSummary[]>("/room-types"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateRoomType() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string; base_price: number; max_adults: number; max_children: number; max_occupants: number; image_url?: string | null }) =>
      apiRequest<RoomTypeSummary>("/room-types", { method: "POST", body: JSON.stringify(payload) }, getToken() ?? undefined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["room-types"] }); },
  });
}

export function useUpdateRoomType() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; description?: string; base_price?: number; max_adults?: number; max_children?: number; max_occupants?: number; image_url?: string | null } }) =>
      apiRequest<RoomTypeSummary>(`/room-types/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, getToken() ?? undefined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["room-types"] }); },
  });
}

export function useDeleteRoomType() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/room-types/${id}`, { method: "DELETE" }, getToken() ?? undefined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["room-types"] }); },
  });
}

// ─── Amenities ───────────────────────────────────────────────────────────────

export function useAmenities() {
  return useQuery({
    queryKey: ["amenities"],
    queryFn: () => apiRequest<AmenitySummary[]>("/amenities"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAmenity() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      apiRequest<AmenitySummary>("/amenities", { method: "POST", body: JSON.stringify(payload) }, getToken() ?? undefined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["amenities"] }); },
  });
}

export function useUpdateAmenity() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string } }) =>
      apiRequest<AmenitySummary>(`/amenities/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, getToken() ?? undefined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["amenities"] }); },
  });
}

export function useDeleteAmenity() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/amenities/${id}`, { method: "DELETE" }, getToken() ?? undefined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["amenities"] }); },
  });
}
