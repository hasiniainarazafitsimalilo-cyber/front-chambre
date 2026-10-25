"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { differenceInDays } from "date-fns";
import {
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "@/lib/auth/context";
import { useCreateReservation } from "@/hooks/use-reservations";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";

/* ─── Payment preferences (informational only — payment is at the hotel) ─── */
const PAYMENT_OPTIONS = [
  { value: "CASH",          label: "Espèces",        icon: <Banknote size={18} /> },
  { value: "CARD",          label: "Carte bancaire", icon: <CreditCard size={18} /> },
  { value: "MOBILE_MONEY",  label: "Mobile Money",   icon: <Smartphone size={18} /> },
  { value: "BANK_TRANSFER", label: "Virement",       icon: <Building2 size={18} /> },
];

/* ─── Wrapper for Suspense ─── */
export default function CheckoutPageRoute() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-6 py-20 text-[var(--muted)] text-sm">
          Chargement de votre réservation…
        </div>
      }
    >
      <CheckoutPage />
    </Suspense>
  );
}

/* ─── Main page ─── */
function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const roomId   = searchParams.get("roomId");
  const checkIn  = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const adults   = searchParams.get("adults");

  const [isSuccess, setIsSuccess] = useState(false);
  const [reference, setReference] = useState("");
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [preferredPayment, setPreferredPayment] = useState("CASH");

  const specialRef = useRef<HTMLTextAreaElement>(null);
  const createReservation = useCreateReservation();

  /* ── Guard ── */
  if (!roomId || !checkIn || !checkOut || !adults) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20">
        <ErrorState
          title="Informations manquantes"
          description="Veuillez repasser par la recherche de disponibilité."
          onRetry={() => router.push("/chambres")}
        />
      </div>
    );
  }

  const nights = differenceInDays(new Date(checkOut), new Date(checkIn)) || 1;

  /* ── Confirm handler ── */
  const handleConfirm = () => {
    if (!user?.client_id) return;

    const specialNote = [
      specialRef.current?.value || "",
      `Paiement souhaité : ${PAYMENT_OPTIONS.find((p) => p.value === preferredPayment)?.label ?? preferredPayment}`,
    ]
      .filter(Boolean)
      .join(" | ");

    createReservation.mutate(
      {
        client_id: user.client_id,
        room_ids: [roomId],
        check_in_date: checkIn,
        check_out_date: checkOut,
        adults: parseInt(adults),
        children: 0,
        special_requests: specialNote,
      },
      {
        onSuccess: (data) => {
          setReference(data.reference);
          setTotalAmount(data.total_amount);
          setIsSuccess(true);
        },
      }
    );
  };

  /* ─── Success screen ─── */
  if (isSuccess) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="mb-6 flex justify-center text-[var(--success)]">
          <CheckCircle2 size={72} strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-medium text-[var(--foreground)]">Réservation confirmée !</h1>
        <p className="mt-4 text-[var(--muted)]">
          Merci de votre confiance. Votre réservation a bien été enregistrée.
        </p>

        <div className="mt-8 space-y-3 rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-xs)] text-left">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">Référence</span>
            <span className="font-semibold tracking-wider text-[var(--primary-dark)]">{reference}</span>
          </div>
          {totalAmount !== null && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted)]">Montant total</span>
              <span className="font-semibold text-[var(--foreground)]">
                {Number(totalAmount).toLocaleString("fr-MG")} Ar
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">Mode de paiement</span>
            <span className="font-medium text-[var(--foreground)]">
              {PAYMENT_OPTIONS.find((p) => p.value === preferredPayment)?.label}
            </span>
          </div>
          <div className="mt-2 rounded-[10px] bg-[var(--background-alt)] px-3 py-2 text-[12px] text-[var(--muted)]">
            💳 Le paiement s'effectuera à la réception lors de votre arrivée.
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => router.push("/account")}>
            Voir mes réservations
            <ArrowRight size={15} className="ml-2" />
          </Button>
          <Button variant="secondary" onClick={() => router.push("/")}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  /* ─── Main form ─── */
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-10">
      <h1 className="text-3xl font-medium text-[var(--foreground)] md:text-4xl">
        Finaliser la réservation
      </h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">

        {/* ─── Left ─── */}
        <div className="space-y-6">

          {/* Vos informations */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-xs)]">
            <h2 className="text-lg font-medium text-[var(--foreground)]">Vos informations</h2>

            {isAuthLoading ? (
              <div className="mt-6 flex h-16 items-center justify-center text-[var(--muted)] text-sm animate-pulse">
                Chargement…
              </div>
            ) : isAuthenticated && user ? (
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-4 rounded-[12px] bg-[var(--background-alt)] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary-dark)] font-semibold">
                    {user.first_name[0]}{user.last_name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-[var(--muted)]">{user.email}</p>
                  </div>
                </div>

                {!user.client_id && (
                  <div className="flex items-start gap-3 rounded-[12px] border border-amber-300/30 bg-amber-50 p-4 text-[13px] text-amber-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <p>
                      Votre profil client est incomplet. Contactez la réception ou{" "}
                      <a href="/mes-reservations" className="underline">complétez votre profil</a>.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-5">
                <p className="mb-4 text-sm text-[var(--muted)]">
                  Vous devez être connecté pour finaliser une réservation.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() =>
                      router.push(
                        `/connexion?from=/booking/checkout?${searchParams.toString()}`
                      )
                    }
                  >
                    Se connecter
                  </Button>
                  <Button variant="secondary" onClick={() => router.push("/inscription")}>
                    Créer un compte
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Mode de paiement (préférence) */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-xs)]">
            <h2 className="text-lg font-medium text-[var(--foreground)]">Mode de paiement souhaité</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Le règlement s'effectue à la réception lors de votre arrivée.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PAYMENT_OPTIONS.map((opt) => {
                const isDisabled = opt.value !== "CASH";
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => !isDisabled && setPreferredPayment(opt.value)}
                    disabled={isDisabled}
                    className={`flex flex-col items-center gap-2 rounded-[14px] border p-4 text-[12px] font-medium transition-all ${
                      isDisabled
                        ? "border-[var(--line)] bg-[var(--background-alt)] text-[var(--muted-light)] cursor-not-allowed opacity-50"
                        : preferredPayment === opt.value
                        ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-dark)] shadow-sm"
                        : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--primary-border)] hover:text-[var(--foreground)] cursor-pointer"
                    }`}
                    title={isDisabled ? "Bientôt disponible" : ""}
                  >
                    {opt.icon}
                    {opt.label}
                    {isDisabled && <span className="text-[9px] mt-1 text-[var(--muted)]">Bientôt</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Demandes spéciales */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-xs)]">
            <h2 className="text-lg font-medium text-[var(--foreground)]">Demandes spéciales</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Allergie, préférence d'étage, lit bébé… Laissez-nous un message.
            </p>
            <textarea
              ref={specialRef}
              className="mt-4 w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-3 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-border)] resize-none"
              rows={3}
              placeholder="Ex : Chambre non-fumeur, loin de l'ascenseur…"
            />
          </div>
        </div>

        {/* ─── Sidebar ─── */}
        <div>
          <div className="sticky top-24 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
            <h2 className="text-lg font-medium text-[var(--foreground)]">Détail du séjour</h2>

            <div className="mt-6 space-y-3 border-b border-[var(--line)] pb-6 text-sm">
              {[
                ["Arrivée",   new Date(checkIn).toLocaleDateString("fr-FR")],
                ["Départ",    new Date(checkOut).toLocaleDateString("fr-FR")],
                ["Durée",     `${nights} nuit${nights > 1 ? "s" : ""}`],
                ["Voyageurs", `${adults} adulte${parseInt(adults) > 1 ? "s" : ""}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-[var(--muted)]">{k}</span>
                  <span className="font-medium text-[var(--foreground)]">{v}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-[13px]">
              <span className="text-[var(--muted)]">Paiement</span>
              <span className="rounded-full bg-[var(--success-soft)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--success)]">
                À la réception
              </span>
            </div>

            {/* Reservation error */}
            {createReservation.isError && (
              <div className="mt-4 rounded-[10px] border border-[rgba(185,64,64,0.2)] bg-[var(--error-soft)] p-3 text-[13px] text-[var(--error)]">
                {(createReservation.error as any)?.message ?? "Erreur lors de la réservation."}
              </div>
            )}

            <div className="mt-8">
              <Button
                size="lg"
                className="w-full"
                onClick={handleConfirm}
                disabled={
                  !isAuthenticated ||
                  !user?.client_id ||
                  createReservation.isPending
                }
                loading={createReservation.isPending}
              >
                Confirmer la réservation
                <ArrowRight size={15} className="ml-2" />
              </Button>
              {!isAuthenticated && (
                <p className="mt-3 text-center text-[11px] text-[var(--muted)]">
                  Connectez-vous pour valider
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
