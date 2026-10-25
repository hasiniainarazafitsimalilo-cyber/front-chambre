import { apiRequest } from "@/lib/api/client";

export type RoomTypeSummary = {
  id: string;
  name: string;
  description?: string | null;
  base_price: number;
  max_adults: number;
  max_children: number;
  max_occupants: number;
};

export async function listRoomTypes() {
  return apiRequest<RoomTypeSummary[]>("/room-types");
}
