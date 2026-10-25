"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useReservations, useCheckIn, useCheckOut } from "@/hooks/use-reservations";
import { useAuth } from "@/lib/auth/context";
import { SkeletonTable } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Eye, User, BedDouble, Check, X, CreditCard, Banknote, Smartphone, Building2 } from "lucide-react";
import { createPayment } from "@/lib/api/payments";
import { apiRequest } from "@/lib/api/client";
import type { PaymentMethod } from "@/types/payment";

function formatMGA(amount: number | string | null | undefined) {
  if (amount == null) return "—";
  return `${Number(amount).toLocaleString("fr-MG")} Ar`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

// Payment Methods
const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: "CASH",          label: "Espèces",        icon: <Banknote size={16} /> },
  { value: "CARD",          label: "Carte bancaire", icon: <CreditCard size={16} /> },
  { value: "MOBILE_MONEY",  label: "Mobile Money",   icon: <Smartphone size={16} /> },
  { value: "BANK_TRANSFER", label: "Virement",       icon: <Building2 size={16} /> },
];

export default function ReservationsPage() {
  const { user, getToken } = useAuth();
  const qc = useQueryClient();
  const { data: reservations, isLoading, isError, refetch } = useReservations();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();
  
  const isStaff = user?.role === "ADMIN" || user?.role === "RECEPTIONIST";

  const [selectedResId, setSelectedResId] = useState<string | null>(null);

  // Fetch full reservation details when a reservation is selected
  const { data: fullReservation, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["reservation", selectedResId],
    queryFn: async () => {
      if (!selectedResId) return null;
      return apiRequest<any>(`/reservations/${selectedResId}`, { method: "GET" }, getToken() ?? "");
    },
    enabled: !!selectedResId,
  });

  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [isPaying, setIsPaying] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Réservations</h2>
        <SkeletonTable rows={8} cols={6} />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  if (!reservations || reservations.length === 0) {
    return (
      <EmptyState
        title="Aucune réservation"
        description="Il n'y a pas encore de réservations enregistrées."
        icon={<CalendarCheck size={24} />}
      />
    );
  }

  const handlePaymentSubmit = async () => {
    if (!selectedResId || !paymentAmount) return;
    setIsPaying(true);
    try {
      await createPayment(getToken() ?? "", {
        reservation_id: selectedResId,
        amount: Number(paymentAmount),
        payment_method: paymentMethod,
      });
      toast.success("Paiement enregistré avec succès !");
      setShowPaymentForm(false);
      setPaymentAmount("");
      qc.invalidateQueries({ queryKey: ["reservation", selectedResId] });
      qc.invalidateQueries({ queryKey: ["reservations"] });
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement du paiement");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Réservations</h2>
          <p className="text-sm text-[var(--muted)]">
            {reservations.length} réservation(s) au total
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-xs)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--background-alt)] text-[12px] font-medium uppercase tracking-wider text-[var(--muted)]">
              <tr>
                <th className="px-6 py-4">Référence</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Chambre</th>
                <th className="px-6 py-4">Statut Séjour</th>
                <th className="px-6 py-4">Paiement</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {reservations.map((res: any) => {
                const totalPaid = res.payments?.filter((p: any) => p.status === "PAID").reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
                const isFullyPaid = totalPaid >= Number(res.total_amount) && Number(res.total_amount) > 0;
                const isPartiallyPaid = totalPaid > 0 && !isFullyPaid;
                
                return (
                <tr key={res.id} className="transition-colors hover:bg-[var(--background-alt)]">
                  <td className="px-6 py-4">
                    <span className="rounded-md bg-[var(--background-alt)] px-2 py-1 font-mono text-xs font-medium text-[var(--foreground)]">
                      {res.reference ?? res.id?.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                        <User size={12} />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {res.client
                            ? `${res.client.first_name} ${res.client.last_name}`
                            : res.guest_name ?? "Client inconnu"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-[var(--foreground-soft)]">
                      <BedDouble size={13} />
                      <span>{res.rooms && res.rooms.length > 0 ? res.rooms.map((r: any) => r.room?.room_number ?? "—").join(", ") : "—"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={res.status} />
                  </td>
                  <td className="px-6 py-4">
                    {isFullyPaid ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-800">Payé</span>
                    ) : isPartiallyPaid ? (
                      <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-800">Partiel</span>
                    ) : (
                      <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800">Non payé</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-[var(--foreground)]">
                    {formatMGA(res.total_amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="secondary" size="xs" onClick={() => setSelectedResId(res.id)}>
                      <Eye size={13} className="mr-1" />
                      Voir
                    </Button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedResId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--surface)] p-6 shadow-xl relative">
            <button
              onClick={() => { setSelectedResId(null); setShowPaymentForm(false); }}
              className="absolute right-4 top-4 rounded-full p-2 text-[var(--muted)] hover:bg-[var(--background-alt)]"
            >
              <X size={20} />
            </button>
            
            {isLoadingDetails ? (
              <div className="py-10 text-center text-sm text-[var(--muted)]">Chargement des détails...</div>
            ) : !fullReservation ? (
              <div className="py-10 text-center text-sm text-[var(--error)]">Erreur de chargement</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold">Réservation {fullReservation.reference}</h3>
                  <p className="text-sm text-[var(--muted)]">Client : {fullReservation.client?.first_name} {fullReservation.client?.last_name}</p>
                  <div className="mt-2"><Badge status={fullReservation.status} /></div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl border border-[var(--line)] p-4 bg-[var(--background-alt)]">
                    <p className="text-[10px] uppercase text-[var(--muted)] font-semibold">Arrivée</p>
                    <p className="mt-1 font-medium">{formatDate(fullReservation.check_in_date)}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--line)] p-4 bg-[var(--background-alt)]">
                    <p className="text-[10px] uppercase text-[var(--muted)] font-semibold">Départ</p>
                    <p className="mt-1 font-medium">{formatDate(fullReservation.check_out_date)}</p>
                  </div>
                </div>

                {fullReservation.special_requests && (
                  <div className="rounded-xl border border-[var(--line)] p-4 bg-blue-50 text-blue-800 text-sm italic">
                    <span className="font-semibold not-italic block mb-1">Notes / Demandes :</span>
                    {fullReservation.special_requests}
                  </div>
                )}

                {/* Financial Summary */}
                {(() => {
                  const totalPaid = fullReservation.payments?.filter((p: any) => p.status === "PAID").reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
                  const balance = Number(fullReservation.total_amount) - totalPaid;
                  
                  return (
                    <div className="rounded-xl border border-[var(--line)] overflow-hidden">
                      <div className="bg-[var(--background-alt)] p-4 border-b border-[var(--line)] font-medium">Finances</div>
                      <div className="p-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[var(--muted)]">Total du séjour</span>
                          <span className="font-semibold">{formatMGA(fullReservation.total_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--muted)]">Montant déjà payé</span>
                          <span className="text-green-600 font-semibold">{formatMGA(totalPaid)}</span>
                        </div>
                        <div className="flex justify-between border-t border-[var(--line)] pt-3 text-base">
                          <span className="font-semibold">Reste à payer</span>
                          <span className="font-bold text-[var(--primary)]">{formatMGA(balance)}</span>
                        </div>
                      </div>

                      {/* Payment Action */}
                      {isStaff && balance > 0 && (
                        <div className="p-4 border-t border-[var(--line)] bg-[var(--background-alt)]">
                          {!showPaymentForm ? (
                            <Button className="w-full" onClick={() => { setShowPaymentForm(true); setPaymentAmount(balance.toString()); }}>
                              <Banknote size={16} className="mr-2" />
                              Encaisser un paiement
                            </Button>
                          ) : (
                            <div className="space-y-4 bg-white p-4 rounded-lg border border-[var(--line)]">
                              <h4 className="font-semibold text-sm">Nouveau paiement</h4>
                              
                              <div>
                                <label className="text-xs font-semibold text-[var(--muted)] uppercase">Montant (Ar)</label>
                                <input type="number" className="w-full mt-1 p-2 border rounded-md" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} max={balance} />
                              </div>
                              
                              <div>
                                <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-2">Méthode</label>
                                <div className="grid grid-cols-2 gap-2">
                                  {PAYMENT_OPTIONS.map(opt => (
                                    <button 
                                      key={opt.value} 
                                      onClick={() => setPaymentMethod(opt.value)}
                                      className={`flex items-center gap-2 p-2 rounded-md border text-xs font-medium transition-colors ${paymentMethod === opt.value ? 'bg-[var(--primary-soft)] border-[var(--primary)] text-[var(--primary-dark)]' : 'bg-[var(--background)] hover:bg-[var(--background-alt)]'}`}
                                    >
                                      {opt.icon} {opt.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex gap-2 pt-2">
                                <Button variant="secondary" className="flex-1" onClick={() => setShowPaymentForm(false)}>Annuler</Button>
                                <Button className="flex-1" loading={isPaying} onClick={handlePaymentSubmit}>Valider {formatMGA(paymentAmount)}</Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
                
                {/* Check In / Out Actions */}
                {isStaff && (
                   <div className="flex gap-3 justify-end pt-4">
                      {fullReservation.status === "CONFIRMED" && (
                         <Button onClick={() => checkInMutation.mutate(fullReservation.id)} loading={checkInMutation.isPending}>
                           Valider le Check-in
                         </Button>
                      )}
                      {fullReservation.status === "CHECKED_IN" && (
                         <Button variant="secondary" onClick={() => checkOutMutation.mutate(fullReservation.id)} loading={checkOutMutation.isPending}>
                           Valider le Check-out
                         </Button>
                      )}
                   </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
