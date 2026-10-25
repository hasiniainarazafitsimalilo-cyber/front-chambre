import { apiRequest } from "@/lib/api/client";
import type { LoginPayload, RegisterPayload, TokenResponse, UserProfile } from "@/types/auth";

export async function registerUser(payload: RegisterPayload) {
  return apiRequest<UserProfile>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: LoginPayload) {
  return apiRequest<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function refreshToken(refreshToken: string) {
  return apiRequest<TokenResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function getCurrentUser(token: string) {
  return apiRequest<UserProfile>("/auth/me", {
    method: "GET",
  }, token);
}

export async function logoutUser(token: string) {
  return apiRequest<void>("/auth/logout", {
    method: "POST",
  }, token);
}
