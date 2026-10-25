import { apiRequest } from "@/lib/api/client";
import type { PaymentCreatePayload, PaymentResult } from "@/types/payment";

export async function createPayment(token: string, payload: PaymentCreatePayload) {
  return apiRequest<PaymentResult>("/payments", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token);
}

export async function listPayments(token: string) {
  return apiRequest<any[]>("/payments", { method: "GET" }, token);
}

