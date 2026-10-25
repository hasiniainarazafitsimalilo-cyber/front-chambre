import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/context";
import { apiRequest, buildQueryString } from "@/lib/api/client";
import type { ClientSummary } from "@/types/catalog";

export function useClients(page = 1, pageSize = 20) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["clients", page, pageSize],
    queryFn: () =>
      apiRequest<ClientSummary[]>(
        `/clients${buildQueryString({ page, page_size: pageSize })}`,
        { method: "GET" },
        getToken() ?? undefined,
      ),
  });
}

export function useCreateClient() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
      address?: string;
      country?: string;
      identity_document_type?: string;
      identity_document_number?: string;
    }) =>
      apiRequest<ClientSummary>(
        "/clients",
        { method: "POST", body: JSON.stringify(payload) },
        getToken() ?? undefined,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useUpdateClient() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      apiRequest<ClientSummary>(`/clients/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, getToken() ?? undefined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); },
  });
}

export function useDeleteClient() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/clients/${id}`, { method: "DELETE" }, getToken() ?? undefined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); },
  });
}
