"use client";

import { useEffect, useState } from "react";
import { FileText, ReceiptText, FileSignature, Download, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { listInvoices } from "@/lib/api/invoices";
import { useAuth } from "@/lib/auth/context";
import { SkeletonTable } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/ui/states";
import type { InvoiceSummary } from "@/lib/api/invoices";

function formatMGA(amount: number | string | null | undefined) {
  if (amount == null) return "—";
  return `${Number(amount).toLocaleString("fr-MG")} Ar`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function DashboardInvoicesPage() {
  const { getToken } = useAuth();
  
  const { data: invoices, isLoading, isError, refetch } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => listInvoices(getToken() ?? ""),
  });

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceSummary | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Facturation</h2>
        <SkeletonTable rows={8} cols={6} />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6 relative">
      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">HOTELIA / factures</p>
            <h2 className="mt-3 font-display text-4xl text-[var(--foreground)] md:text-5xl">Facturation</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--background-alt)] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
            <ReceiptText size={12} className="text-[var(--primary)]" />
            Audit complet
          </div>
        </div>
      </div>

      {!invoices || invoices.length === 0 ? (
        <EmptyState
          title="Aucune facture"
          description="Aucune facture n'a encore été émise."
          icon={<FileSignature size={24} />}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-xs)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--background-alt)] text-[12px] font-medium uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="px-6 py-4">N° Facture</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-[var(--background-alt)]">
                    <td className="px-6 py-4 font-mono font-medium text-[var(--primary-dark)]">
                      {inv.number}
                    </td>
                    <td className="px-6 py-4 text-[var(--muted)]">
                      {formatDate(inv.issue_date)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        inv.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        inv.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                        inv.status === 'ISSUED' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[var(--foreground)]">
                      {formatMGA(inv.total)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="secondary" size="xs" onClick={() => setSelectedInvoice(inv)}>
                        <Eye size={13} className="mr-1" />
                        Voir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--surface)] p-6 shadow-xl relative">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-[var(--muted)] hover:bg-[var(--background-alt)]"
            >
              ✕
            </button>
            
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">Facture</p>
                <h3 className="mt-2 text-3xl text-[var(--foreground)]">{selectedInvoice.number}</h3>
              </div>
              <span className={`rounded-full border border-[var(--line)] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] ${
                selectedInvoice.status === 'PAID' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-[var(--background-alt)] text-[var(--muted)]'
              }`}>
                {selectedInvoice.status}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-8">
              <InfoCard label="Réservation" value={selectedInvoice.reservation_id} />
              <InfoCard label="Date d'émission" value={formatDate(selectedInvoice.issue_date)} />
            </div>

            <div className="rounded-[24px] border border-[var(--line)] bg-[var(--background-alt)] p-4 mb-8">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] mb-4">Détails</p>
              <div className="space-y-3">
                {selectedInvoice.items.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-3 text-sm last:border-none last:pb-0">
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-[var(--foreground)] font-medium">{item.description}</p>
                      <p className="text-[var(--muted)] mt-1">{item.quantity} x {formatMGA(item.unit_price)}</p>
                    </div>
                    <span className="font-semibold text-[var(--foreground)]">{formatMGA(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-[24px] border border-[var(--line)] bg-[var(--panel)] p-4 text-sm ml-auto max-w-sm">
              <Row label="Sous-total" value={formatMGA(selectedInvoice.subtotal)} />
              {Number(selectedInvoice.discount) > 0 && <Row label="Réduction" value={`-${formatMGA(selectedInvoice.discount)}`} />}
              {Number(selectedInvoice.tax) > 0 && <Row label="Taxe" value={formatMGA(selectedInvoice.tax)} />}
              <div className="border-t border-[var(--line)] pt-3 mt-3">
                <Row label="Total" value={formatMGA(selectedInvoice.total)} strong />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button variant="secondary" onClick={() => window.print()}>
                <Download size={16} className="mr-2" />
                Télécharger PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[var(--line)] bg-[var(--background-alt)] p-4">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-sm font-mono text-[var(--foreground)] break-all">{value}</p>
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[var(--muted)]">{label}</span>
      <span className={strong ? "text-lg font-bold text-[var(--primary-dark)]" : "text-[var(--foreground)] font-medium"}>{value}</span>
    </div>
  );
}
