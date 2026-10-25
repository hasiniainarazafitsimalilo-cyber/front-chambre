"use client";

import { useState } from "react";
import { useReservations, useCheckIn } from "@/hooks/use-reservations";
import { SkeletonTable } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogIn, AlertCircle } from "lucide-react";

export default function CheckInPage() {
  const { data: reservations, isLoading, isError, refetch } = useReservations();
  const checkIn = useCheckIn();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Check-in</h2>
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  // Seules les réservations CONFIRMED sont éligibles au check-in
  const eligibleReservations = reservations?.filter(
    (res: any) => res.status === "CONFIRMED"
  ) || [];

  if (eligibleReservations.length === 0) {
    return (
      <EmptyState
        title="Aucune arrivée"
        description="Il n'y a pas de réservation confirmée en attente de check-in."
        icon={<LogIn size={24} />}
      />
    );
  }

  const handleCheckIn = (id: string) => {
    setProcessingId(id);
    setErrorId(null);
    setErrorMsg(null);
    setSuccessId(null);
    checkIn.mutate(id, {
      onSuccess: () => {
        setSuccessId(id);
        setProcessingId(null);
      },
      onError: (err: any) => {
        setErrorId(id);
        setErrorMsg(err instanceof Error ? err.message : "Échec du check-in");
        setProcessingId(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Check-in</h2>
          <p className="text-sm text-[var(--muted)]">
            Enregistrez l'arrivée des clients — réservations confirmées uniquement.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)]">
          <LogIn size={14} className="text-[var(--primary)]" />
          <span>{eligibleReservations.length} arrivée{eligibleReservations.length > 1 ? "s" : ""} en attente</span>
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-xs)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--background-alt)] text-[12px] font-medium uppercase tracking-wider text-[var(--muted)]">
              <tr>
                <th className="px-6 py-4">Référence</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Arrivée</th>
                <th className="px-6 py-4">Chambre(s)</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {eligibleReservations.map((res: any) => (
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
                      {res.check_in_date}
                    </td>
                    <td className="px-6 py-4 text-[var(--muted)]">
                      {res.rooms?.length ?? 0} chambre(s)
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={res.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {successId === res.id ? (
                        <span className="text-xs font-semibold text-[var(--success)]">
                          ✓ Enregistré
                        </span>
                      ) : (
                        <Button
                          size="xs"
                          onClick={() => handleCheckIn(res.id)}
                          loading={processingId === res.id}
                          disabled={processingId !== null || successId !== null}
                        >
                          Enregistrer l'arrivée
                        </Button>
                      )}
                    </td>
                  </tr>
                  {/* Ligne d'erreur inline */}
                  {errorId === res.id && errorMsg && (
                    <tr key={`${res.id}-err`}>
                      <td colSpan={6} className="px-6 py-2">
                        <div className="flex items-center gap-2 rounded-lg bg-[var(--error-soft)] px-3 py-2 text-xs text-[var(--error)]">
                          <AlertCircle size={13} />
                          {errorMsg}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
