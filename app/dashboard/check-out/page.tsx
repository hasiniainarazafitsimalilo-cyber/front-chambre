"use client";

import { useState } from "react";
import { useReservations, useCheckOut } from "@/hooks/use-reservations";
import { SkeletonTable } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, AlertCircle, AlertTriangle } from "lucide-react";

export default function CheckOutPage() {
  const { data: reservations, isLoading, isError, refetch } = useReservations();
  const checkOut = useCheckOut();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Check-out</h2>
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  // Éligibles au check-out : CONFIRMED (check-in effectué, solde requis) ou COMPLETED
  // Le backend valide: check-in préalable + solde intégralement payé
  const eligibleReservations = reservations?.filter(
    (res: any) => res.status === "CONFIRMED"
  ) || [];

  // Détecter les soldes non réglés
  const getPaidAmount = (res: any): number =>
    (res.payments ?? [])
      .filter((p: any) => p.status === "PAID")
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

  if (eligibleReservations.length === 0) {
    return (
      <EmptyState
        title="Aucun départ"
        description="Il n'y a pas de check-out à traiter pour le moment."
        icon={<LogOut size={24} />}
      />
    );
  }

  const handleCheckOut = (id: string) => {
    setProcessingId(id);
    setErrorId(null);
    setErrorMsg(null);
    setSuccessId(null);
    checkOut.mutate(id, {
      onSuccess: () => {
        setSuccessId(id);
        setProcessingId(null);
      },
      onError: (err: any) => {
        setErrorId(id);
        setErrorMsg(err instanceof Error ? err.message : "Échec du check-out");
        setProcessingId(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Check-out</h2>
          <p className="text-sm text-[var(--muted)]">
            Enregistrez le départ des clients · solde intégralement payé requis.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)]">
          <LogOut size={14} className="text-[var(--warning)]" />
          <span>{eligibleReservations.length} départ{eligibleReservations.length > 1 ? "s" : ""} à traiter</span>
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-xs)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--background-alt)] text-[12px] font-medium uppercase tracking-wider text-[var(--muted)]">
              <tr>
                <th className="px-6 py-4">Référence</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Départ</th>
                <th className="px-6 py-4">Chambre(s)</th>
                <th className="px-6 py-4">Solde</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {eligibleReservations.map((res: any) => {
                const paid = getPaidAmount(res);
                const total = Number(res.total_amount ?? 0);
                const remaining = Math.max(0, total - paid);
                const isSolde = remaining === 0;

                return (
                  <>
                    <tr key={res.id} className="transition-colors hover:bg-[var(--background-alt)]">
                      <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                        {res.reference}
                      </td>
                      <td className="px-6 py-4 text-[var(--foreground-soft)]">
                        {res.client
                          ? `${res.client.first_name} ${res.client.last_name}`
                          : "Client inconnu"}
                      </td>
                      <td className="px-6 py-4 text-[var(--muted)]">
                        {res.check_out_date}
                      </td>
                      <td className="px-6 py-4 text-[var(--muted)]">
                        {res.rooms?.length ?? 0} chambre(s)
                      </td>
                      <td className="px-6 py-4">
                        {isSolde ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--success)]">
                            Soldé ✓
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle size={12} className="text-[var(--warning)]" />
                            <span className="text-xs font-semibold text-[var(--warning)]">
                              {remaining.toLocaleString("fr-MG")} Ar
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={res.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {successId === res.id ? (
                          <span className="text-xs font-semibold text-[var(--success)]">
                            ✓ Départ enregistré
                          </span>
                        ) : (
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() => handleCheckOut(res.id)}
                            loading={processingId === res.id}
                            disabled={processingId !== null || !isSolde}
                            title={!isSolde ? `Solde restant: ${remaining.toLocaleString("fr-MG")} Ar` : ""}
                          >
                            Enregistrer le départ
                          </Button>
                        )}
                      </td>
                    </tr>
                    {/* Erreur inline */}
                    {errorId === res.id && errorMsg && (
                      <tr key={`${res.id}-err`}>
                        <td colSpan={7} className="px-6 py-2">
                          <div className="flex items-center gap-2 rounded-lg bg-[var(--error-soft)] px-3 py-2 text-xs text-[var(--error)]">
                            <AlertCircle size={13} />
                            {errorMsg}
                          </div>
                        </td>
                      </tr>
                    )}
                    {/* Avertissement solde non soldé */}
                    {!isSolde && errorId !== res.id && (
                      <tr key={`${res.id}-warn`}>
                        <td colSpan={7} className="px-6 py-2">
                          <div className="flex items-center gap-2 rounded-lg bg-[var(--warning-soft)] px-3 py-2 text-xs text-[var(--warning)]">
                            <AlertTriangle size={13} />
                            Solde restant de <strong>{remaining.toLocaleString("fr-MG")} Ar</strong> — le check-out sera bloqué jusqu'au règlement complet.
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
