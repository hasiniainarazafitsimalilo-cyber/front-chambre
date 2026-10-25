import { apiRequest } from "@/lib/api/client";
import type { HousekeepingTask, MaintenanceItem } from "@/types/operations";

export async function listMaintenance(token: string) {
  return apiRequest<MaintenanceItem[]>("/maintenance", { method: "GET" }, token);
}

export async function createMaintenance(token: string, payload: { room_id: string; description: string }) {
  return apiRequest<MaintenanceItem>("/maintenance", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token);
}

export async function updateMaintenance(token: string, maintenanceId: string, payload: { status: string }) {
  return apiRequest<MaintenanceItem>(`/maintenance/${maintenanceId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }, token);
}

export async function listHousekeeping(token: string) {
  return apiRequest<HousekeepingTask[]>("/housekeeping", { method: "GET" }, token);
}

export async function createHousekeeping(token: string, payload: { room_id: string; notes?: string; scheduled_at?: string }) {
  return apiRequest<HousekeepingTask>("/housekeeping", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token);
}

export async function updateHousekeeping(token: string, taskId: string, payload: { status: string; notes?: string }) {
  return apiRequest<HousekeepingTask>(`/housekeeping/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }, token);
}
