import { apiRequest } from "@/lib/api/client";

export type InvoiceItemSummary = {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export type InvoiceSummary = {
  id: string;
  number: string;
  reservation_id: string;
  issue_date: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: string;
  items: InvoiceItemSummary[];
};

export async function getInvoice(token: string, invoiceId: string) {
  return apiRequest<InvoiceSummary>(`/invoices/${invoiceId}`, { method: "GET" }, token);
}

export async function listInvoices(token: string) {
  return apiRequest<InvoiceSummary[]>(`/invoices`, { method: "GET" }, token);
}
