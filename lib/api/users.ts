import { apiRequest } from "@/lib/api/client";
import type { UserProfile } from "@/types/auth";

export async function getUsers(token: string) {
  return apiRequest<UserProfile[]>("/users", { method: "GET" }, token);
}

export async function createReceptionist(token: string, payload: any) {
  return apiRequest<UserProfile>("/users/receptionist", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token);
}

export async function updateUser(token: string, userId: string, payload: any) {
  return apiRequest<UserProfile>(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }, token);
}

export async function deleteUser(token: string, userId: string) {
  return apiRequest<void>(`/users/${userId}`, {
    method: "DELETE",
  }, token);
}
