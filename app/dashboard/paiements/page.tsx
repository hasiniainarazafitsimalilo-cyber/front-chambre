"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, TrendingUp, Wallet, Receipt } from "lucide-react";
import { listPayments } from "@/lib/api/payments";
import { useAuth } from "@/lib/auth/context";
import { SkeletonTable } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/ui/states";

function formatMGA(amount: number | string | null | undefined) {
  if (amount == null) return "—";
  return `${Number(amount).toLocaleString("fr-MG")} Ar`;
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("fr-FR", { 
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function getMethodLabel(method: string) {
  switch(method) {
    case "CARD": return "Carte bancaire";
    case "CASH": return "Espèces";
    case "BANK_TRANSFER": return "Virement";
    case "MOBILE_MONEY": return "Mobile Money";
    default: return method;
  }
}

export default function DashboardPaymentsPage() {
  const { getToken } = useAuth();
  
  const { data: payments, isLoading, isError, refetch } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => listPayments(getToken() ?? ""),
  });

  const totalEncaisse = payments?.filter(p => p.status === 'PAID').reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Encaissements</h2>
        <SkeletonTable rows={8} cols={6} />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">HOTELIA / paiements</p>
            <h2 className="mt-3 font-display text-4xl text-[var(--foreground)] md:text-5xl">Historique des Encaissements</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--background-alt)] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
            <CheckCircle2 size={12} className="text-[var(--success)]" />
            En temps réel
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard icon={CreditCard} label="Total encaissé" value={formatMGA(totalEncaisse)} detail={`${payments?.length || 0} opérations`} />
          <StatCard icon={TrendingUp} label="Statut" value="En ligne" detail="Synchronisé" />
          <StatCard icon={Wallet} label="Sécurité" value="OK" detail="Transactions chiffrées" />
        </div>
      </div>

      {!payments || payments.length === 0 ? (
        <EmptyState
          title="Aucun paiement"
          description="Aucun paiement n'a encore été enregistré."
          icon={<Receipt size={24} />}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-xs)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--background-alt)] text-[12px] font-medium uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="px-6 py-4">Date & Heure</th>
                  <th className="px-6 py-4">Réservation</th>
                  <th className="px-6 py-4">Mode</th>
                  <th className="px-6 py-4">Référence Tx</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {payments.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-[var(--background-alt)]">
                    <td className="px-6 py-4 text-[var(--muted)]">
                      {p.paid_at ? formatDateTime(p.paid_at) : "—"}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-[var(--primary-dark)]">
                      {p.reservation_reference || "—"}
                    </td>
                    <td className="px-6 py-4 text-[var(--foreground)]">
                      {getMethodLabel(p.payment_method)}
                    </td>
                    <td className="px-6 py-4 text-[var(--muted)] text-xs">
                      {p.transaction_reference || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        p.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[var(--foreground)] text-right">
                      {formatMGA(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[22px] border border-[var(--line)] bg-[var(--background-alt)] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
          <p className="mt-3 text-2xl text-[var(--foreground)]">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--primary)]">
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-4 border-t border-[var(--line)] pt-3 text-[12px] text-[var(--muted)]">{detail}</p>
    </div>
  );
}
