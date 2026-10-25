"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { checkInReservation, checkOutReservation } from "@/lib/api/stays";
import { getReservations } from "@/lib/api/reservations";
import { useAuth } from "@/lib/auth/context";
import type { ReservationSummary } from "@/types/reservation";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
  NO_SHOW: "No-show",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-300",
  CONFIRMED: "bg-emerald-100 text-emerald-700 border-emerald-300",
  CANCELLED: "bg-red-100 text-red-600 border-red-300",
  COMPLETED: "bg-blue-100 text-blue-700 border-blue-300",
  NO_SHOW: "bg-gray-100 text-gray-600 border-gray-300",
};

function paidAmount(r: ReservationSummary): number {
  if (!("payments" in r)) return 0;
  const payments = (r as ReservationSummary & { payments?: { status: string; amount: number }[] }).payments ?? [];
  return payments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0);
}

export default function FrontDeskPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [reservations, setReservations] = useState<ReservationSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ReservationSummary | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Charger les réservations
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/connexion");
      return;
    }
    getReservations(token)
      .then((data) => setReservations(data))
      .catch(() => {/* silencieux */})
      .finally(() => setLoadingList(false));
  }, [getToken, router]);

  const filtered = reservations.filter((r) => {
    const q = query.toLowerCase();
    return (
      r.reference?.toLowerCase().includes(q) ||
      r.id?.toLowerCase().includes(q)
    );
  }).slice(0, 8);

  function selectReservation(r: ReservationSummary) {
    setSelected(r);
    setQuery(r.reference ?? r.id);
    setShowDropdown(false);
    setMessage(null);
    setError(null);
  }

  async function handleAction(type: "check-in" | "check-out") {
    const token = getToken();
    if (!token) {
      setError("Connexion requise au service d'accueil.");
      return;
    }
    if (!selected) {
      setError("Veuillez sélectionner une réservation.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (type === "check-in") {
        const result = await checkInReservation(token, selected.id);
        setMessage(`✓ Check-in enregistré le ${new Date(result.checked_in_at).toLocaleString("fr-FR")}`);
        // Mettre à jour localement le statut affiché
        setSelected((prev) => prev ? { ...prev, status: "COMPLETED" } : prev);
        return;
      }
      const result = await checkOutReservation(token, selected.id);
      setMessage(`✓ Check-out enregistré le ${new Date(result.checked_out_at).toLocaleString("fr-FR")}`);
      setSelected((prev) => prev ? { ...prev, status: "COMPLETED" } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'action d'accueil a échoué.");
    } finally {
      setLoading(false);
    }
  }

  const canCheckIn = selected?.status === "CONFIRMED";
  const canCheckOut = selected !== null && selected.status !== "CANCELLED" && selected.status !== "PENDING";

  const paid = selected ? paidAmount(selected) : 0;
  const remaining = selected ? Math.max(0, (selected.total_amount ?? 0) - paid) : 0;

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)]">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--primary)]">Hotelia</p>
            <h1 className="mt-3 text-4xl text-[var(--foreground)]">Accueil / Front desk</h1>
          </div>
          <Link href="/dashboard">
            <Button variant="secondary">Retour dashboard</Button>
          </Link>
        </div>

        <div className="rounded-[32px] border border-[var(--line)] bg-[rgba(255,255,255,0.7)] p-6 shadow-[var(--shadow-soft)] backdrop-blur-sm">

          {/* Sélecteur de réservation */}
          <div ref={dropRef} className="relative">
            <label className="block text-sm text-[var(--muted)]">
              <span className="mb-2 block font-medium">Réservation</span>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(null);
                  setShowDropdown(true);
                  setMessage(null);
                  setError(null);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder={loadingList ? "Chargement des réservations…" : "Rechercher par référence ou UUID…"}
                disabled={loadingList}
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-colors"
              />
            </label>

            {/* Dropdown */}
            {showDropdown && filtered.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-lg">
                {filtered.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => selectReservation(r)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--panel)] border-b border-[var(--line)] last:border-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{r.reference}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {r.check_in_date} → {r.check_out_date}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-600 border-gray-300"}`}
                    >
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {showDropdown && query.length > 1 && filtered.length === 0 && !loadingList && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--muted)] shadow-lg">
                Aucune réservation trouvée pour « {query} »
              </div>
            )}
          </div>

          {/* Fiche réservation sélectionnée */}
          {selected && (
            <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--foreground)]">{selected.reference}</span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${STATUS_COLORS[selected.status] ?? "bg-gray-100 text-gray-600 border-gray-300"}`}
                >
                  {STATUS_LABELS[selected.status] ?? selected.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[var(--muted)]">
                <span>Arrivée</span><span className="text-[var(--foreground)] font-medium">{selected.check_in_date}</span>
                <span>Départ</span><span className="text-[var(--foreground)] font-medium">{selected.check_out_date}</span>
                <span>Total</span><span className="text-[var(--foreground)] font-medium">{Number(selected.total_amount).toFixed(2)} €</span>
                <span>Restant dû</span>
                <span className={`font-semibold ${remaining > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {remaining > 0 ? `${remaining.toFixed(2)} € ⚠` : "Soldé ✓"}
                </span>
              </div>

              {/* Aides contextuelles */}
              {!canCheckIn && selected.status !== "CONFIRMED" && selected.status !== "COMPLETED" && (
                <p className="text-xs text-amber-600 mt-1">
                  ℹ Le check-in n'est possible que pour les réservations <strong>confirmées</strong>.
                </p>
              )}
              {canCheckOut && remaining > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠ Le check-out nécessite que le solde soit entièrement payé.
                </p>
              )}
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {message && (
            <div className="mt-5 rounded-2xl border border-[rgba(42,125,109,0.3)] bg-[rgba(42,125,109,0.08)] p-3 text-sm text-[var(--success)]">
              {message}
            </div>
          )}

          {/* Boutons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={() => handleAction("check-in")}
              disabled={loading || !canCheckIn}
              title={!selected ? "Sélectionnez une réservation" : !canCheckIn ? "La réservation doit être confirmée" : ""}
            >
              {loading ? "Traitement…" : "Check-in"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleAction("check-out")}
              disabled={loading || !canCheckOut}
              title={!selected ? "Sélectionnez une réservation" : !canCheckOut ? "Un check-in préalable est requis" : ""}
            >
              Check-out
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
