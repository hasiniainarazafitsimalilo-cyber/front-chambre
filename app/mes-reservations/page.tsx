"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Mail,
  Calendar,
  BedDouble,
  LogOut,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/api/auth";
import { apiRequest } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/context";
import type { UserProfile } from "@/types/auth";
import type { ReservationSummary } from "@/types/reservation";

/* --- Helpers --- */
function statusLabel(status: string) {
  switch (status) {
    case "CONFIRMED":   return { label: "Confirmée",  color: "text-[var(--success)]", icon: <CheckCircle2 size={13} /> };
    case "PENDING":     return { label: "En attente", color: "text-[var(--warning)]",  icon: <Clock size={13} /> };
    case "CHECKED_IN":  return { label: "Arrivé",     color: "text-[var(--primary)]",  icon: <BedDouble size={13} /> };
    case "CHECKED_OUT": return { label: "Terminé",    color: "text-[var(--muted)]",    icon: <CheckCircle2 size={13} /> };
    case "CANCELLED":   return { label: "Annulée",    color: "text-[var(--error)]",    icon: <XCircle size={13} /> };
    default:            return { label: status,        color: "text-[var(--muted)]",    icon: null };
  }
}

/* --- Info card --- */
function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[16px] border border-[var(--line)] bg-[var(--panel)] p-4">
      <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-[15px] text-[var(--foreground)]">{value || <span className="text-[var(--muted-light)]">—</span>}</p>
    </div>
  );
}

/* --- Cancel Confirmation Modal --- */
function CancelModal({
  reference,
  onConfirm,
  onClose,
  loading,
}: {
  reference: string;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl" style={{ animation: "fadeInScale 0.2s ease-out" }}>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle size={22} className="text-red-600" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Annuler la réservation ?</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Vous êtes sur le point d&apos;annuler la réservation{" "}
          <span className="font-semibold text-[var(--foreground)]">{reference}</span>.
          Cette action est irréversible.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-[12px] border border-[var(--line)] py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--background-alt)] disabled:opacity-50"
          >
            Retour
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-[12px] bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Annulation…" : "Confirmer l'annulation"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { getToken, logout } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [reservations, setReservations] = useState<ReservationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "reservations">("profile");

  // Cancel modal state
  const [cancelTarget, setCancelTarget] = useState<{ id: string; reference: string } | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/connexion");
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const [profile, resv] = await Promise.all([
          getCurrentUser(token),
          apiRequest<ReservationSummary[]>("/reservations", { method: "GET" }, token).catch(() => []),
        ]);
        if (!cancelled) {
          setUser(profile);
          setReservations(resv ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Impossible de charger votre profil.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [router, getToken]);

  async function handleLogout() {
    try { await logout(); } catch { /* ignore */ }
    router.push("/connexion");
  }

  async function handleCancelConfirm() {
    if (!cancelTarget) return;
    const token = getToken();
    if (!token) return;

    setCancelling(true);
    setCancelError(null);
    try {
      await apiRequest(
        `/reservations/${cancelTarget.id}/cancel`,
        { method: "PATCH" },
        token
      );
      // Update local state immediately — no need for a full reload
      setReservations((prev) =>
        prev.map((r: any) =>
          r.id === cancelTarget.id ? { ...r, status: "CANCELLED" } : r
        )
      );
      setCancelTarget(null);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Erreur lors de l'annulation.");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-[var(--muted)] text-sm animate-pulse">Chargement du profil...</div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="min-h-screen bg-[var(--background)] p-8">
        <div className="mx-auto max-w-lg rounded-[24px] border border-red-500/30 bg-red-500/10 p-8 text-center text-red-700">
          {error ?? "Profil indisponible."}
        </div>
      </main>
    );
  }

  const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();

  return (
    <>
      <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)] mt-[var(--header-h)]">
        <div className="mx-auto max-w-4xl">
          <button onClick={() => router.back()} className="mb-6 flex items-center text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Retour
          </button>

          {/* --- Header --- */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--primary)]">Hotelia</p>
              <h1 className="mt-2 text-4xl font-light text-[var(--foreground)]">Mon espace</h1>
            </div>
            <div className="flex gap-3">
              <Link href="/chambres">
                <Button variant="secondary">
                  <BedDouble size={15} className="mr-1.5" />
                  Réserver
                </Button>
              </Link>
              <Button onClick={handleLogout}>
                <LogOut size={15} className="mr-1.5" />
                Déconnexion
              </Button>
            </div>
          </div>

          {/* --- Avatar + name --- */}
          <div className="mb-8 flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-2xl font-semibold text-[var(--primary)]">
              {initials}
            </div>
            <div>
              <p className="text-2xl font-medium text-[var(--foreground)]">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-sm text-[var(--muted)]">{user.role}</p>
            </div>
          </div>

          {/* --- Tabs --- */}
          <div className="mb-6 flex gap-1 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] p-1 w-fit">
            {(["profile", "reservations"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-[8px] px-4 py-1.5 text-[13px] font-medium transition-all ${
                  activeTab === tab
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {tab === "profile" ? "Profil" : `Réservations (${reservations.length})`}
              </button>
            ))}
          </div>

          {/* --- Profile tab --- */}
          {activeTab === "profile" && (
            <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.7)] p-6 shadow-[var(--shadow-soft)] backdrop-blur-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard label="Email" value={<span className="flex items-center gap-2"><Mail size={14} className="text-[var(--muted)]" />{user.email}</span>} />
                <InfoCard label="Statut du compte" value={user.is_active ? "● Actif" : "○ Inactif"} />
                <InfoCard label="Date d'inscription" value={new Date(user.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })} />
                <InfoCard label="Rôle" value={user.role} />
                {user.client_id ? (
                  <InfoCard label="ID Client" value={<span className="font-mono text-xs">{user.client_id}</span>} />
                ) : (
                  <div className="rounded-[16px] border border-amber-300/40 bg-amber-50 p-4 sm:col-span-2">
                    <p className="text-[13px] text-amber-700">⚠️ Votre profil client n&apos;est pas encore créé. Contactez la réception si nécessaire.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- Reservations tab --- */}
          {activeTab === "reservations" && (
            <div className="space-y-4">
              {/* Cancel error banner */}
              {cancelError && (
                <div className="rounded-[12px] border border-red-300/40 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-3">
                  <span>❌ {cancelError}</span>
                  <button onClick={() => setCancelError(null)} className="text-red-400 hover:text-red-600">✕</button>
                </div>
              )}

              {reservations.length === 0 ? (
                <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-12 text-center">
                  <BedDouble size={40} className="mx-auto mb-4 text-[var(--muted-light)]" />
                  <p className="text-lg font-medium text-[var(--foreground)]">Aucune réservation</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">Vous n&apos;avez pas encore effectué de réservation.</p>
                  <div className="mt-6">
                    <Link href="/chambres">
                      <Button>
                        Rechercher une chambre
                        <ArrowRight size={15} className="ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                reservations.map((r: any) => {
                  const { label, color, icon } = statusLabel(r.status);
                  const nights = Math.max(
                    1,
                    Math.round(
                      (new Date(r.check_out_date).getTime() - new Date(r.check_in_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  );

                  const totalPaid = r.payments?.filter((p: any) => p.status === "PAID").reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
                  const isFullyPaid = totalPaid >= Number(r.total_amount) && Number(r.total_amount) > 0;
                  const isPartiallyPaid = totalPaid > 0 && !isFullyPaid;
                  const balance = Number(r.total_amount) - totalPaid;

                  // Only PENDING and CONFIRMED can be cancelled
                  const isCancellable = r.status === "PENDING" || r.status === "CONFIRMED";

                  return (
                    <div
                      key={r.id}
                      className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">Référence</p>
                          <p className="mt-1 font-semibold tracking-wider text-[var(--foreground)]">{r.reference}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {isFullyPaid ? (
                            <span className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium bg-green-50 text-green-700 border-green-200">
                              Payé
                            </span>
                          ) : isPartiallyPaid ? (
                            <span className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium bg-yellow-50 text-yellow-700 border-yellow-200">
                              Reste : {balance.toLocaleString("fr-MG")} Ar
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium bg-red-50 text-red-700 border-red-200">
                              Non payé
                            </span>
                          )}
                          <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium ${color} border-current/20`}>
                            {icon}
                            {label}
                          </span>

                          {/* Cancel button — only for cancellable reservations */}
                          {isCancellable && (
                            <button
                              onClick={() => setCancelTarget({ id: r.id, reference: r.reference })}
                              className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[12px] font-medium text-red-700 transition-colors hover:bg-red-100 active:scale-95"
                            >
                              <XCircle size={13} />
                              Annuler
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div>
                          <p className="text-[11px] text-[var(--muted)]">Arrivée</p>
                          <p className="mt-0.5 text-[13px] font-medium text-[var(--foreground)] flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(r.check_in_date).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[var(--muted)]">Départ</p>
                          <p className="mt-0.5 text-[13px] font-medium text-[var(--foreground)] flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(r.check_out_date).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[var(--muted)]">Durée</p>
                          <p className="mt-0.5 text-[13px] font-medium text-[var(--foreground)]">
                            {nights} nuit{nights > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[var(--muted)]">Total du séjour</p>
                          <p className="mt-0.5 text-[13px] font-semibold text-[var(--primary-dark)]">
                            {Number(r.total_amount).toLocaleString("fr-MG")} Ar
                          </p>
                        </div>
                      </div>

                      {r.special_requests && (
                        <p className="mt-3 rounded-[8px] bg-[var(--background-alt)] px-3 py-2 text-[12px] text-[var(--muted)] italic">
                          &ldquo;{r.special_requests}&rdquo;
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>

      {/* --- Cancel confirmation modal --- */}
      {cancelTarget && (
        <CancelModal
          reference={cancelTarget.reference}
          onConfirm={handleCancelConfirm}
          onClose={() => { if (!cancelling) setCancelTarget(null); }}
          loading={cancelling}
        />
      )}

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </>
  );
}
