export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export type ApiErrorShape = {
  detail?: string | { msg?: string } | Array<{ msg?: string }>;
};

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(init.headers ?? {});

  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((entry) => entry?.msg ?? "Unknown error").join(", ")
          : typeof detail === "object" && detail && "msg" in detail
            ? String(detail.msg)
            : "Request failed";

    throw new Error(message || "Request failed");
  }

  return (data as T) ?? (undefined as T);
}

export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });

  const result = query.toString();
  return result ? `?${result}` : "";
}
