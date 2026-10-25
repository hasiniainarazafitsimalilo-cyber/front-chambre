"use client";

import { motion } from "motion/react";
import {
  BedDouble,
  CalendarRange,
  CreditCard,
  Users,
  LogIn,
  LogOut,
  Wrench,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import { ErrorState } from "@/components/ui/states";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/context";
import { useDashboardOverview } from "@/hooks/use-dashboard";
import { useRooms } from "@/hooks/use-rooms";
import { useReservations } from "@/hooks/use-reservations";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/* ── Statut badge chambre ── */
const ROOM_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  AVAILABLE:    { label: "Disponible",  color: "#606C5A", bg: "rgba(96,108,90,0.10)",  dot: "#606C5A" },
  OCCUPIED:     { label: "Occupée",     color: "#76CDCD", bg: "rgba(118,205,205,0.12)", dot: "#76CDCD" },
  CLEANING:     { label: "Nettoyage",   color: "#C9973D", bg: "rgba(201,151,61,0.10)",  dot: "#C9973D" },
  MAINTENANCE:  { label: "Maintenance", color: "#B94040", bg: "rgba(185,64,64,0.08)",   dot: "#B94040" },
  RESERVED:     { label: "Réservée",    color: "#CCAEA4", bg: "rgba(204,174,164,0.12)", dot: "#CCAEA4" },
  OUT_OF_SERVICE:{ label: "Hors service", color: "#7F7A74", bg: "rgba(127,122,116,0.08)", dot: "#7F7A74" },
};

const STATUS_FR: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "En attente", color: "#C9973D", bg: "rgba(201,151,61,0.10)"  },
  CONFIRMED: { label: "Confirmée",  color: "#606C5A", bg: "rgba(96,108,90,0.10)"   },
  CANCELLED: { label: "Annulée",    color: "#B94040", bg: "rgba(185,64,64,0.08)"   },
  COMPLETED: { label: "Terminée",   color: "#76CDCD", bg: "rgba(118,205,205,0.12)" },
  NO_SHOW:   { label: "No-show",    color: "#7F7A74", bg: "rgba(127,122,116,0.08)" },
};

/* ── Animation variants ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.42, ease: "easeOut", delay },
});

/* ── KPI Card ── */
function KpiCard({
  label, value, sub, icon: Icon, accent, delay = 0, href,
}: {
  label: string; value: string; sub: string;
  icon: React.ElementType; accent: string; delay?: number; href?: string;
}) {
  const inner = (
    <motion.div
      {...fadeUp(delay)}
      className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 cursor-pointer"
    >
      {/* Accent radial */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ background: `radial-gradient(ellipse at top left, ${accent} 0%, transparent 65%)` }}
      />
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
          style={{ background: `${accent}18`, color: accent }}
        >
          <Icon size={17} />
        </div>
        <ArrowRight size={13} className="text-[var(--muted-light)] opacity-0 transition-opacity group-hover:opacity-100 mt-1" />
      </div>
      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-[var(--foreground)]">{value}</p>
      <p className="mt-1 text-[11px] text-[var(--muted-light)]">{sub}</p>
    </motion.div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

/* ── Stat pill (arrivées / départs) ── */
function StatPill({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-xs)]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}15`, color }}>
        <Icon size={15} />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">{label}</p>
        <p className="text-xl font-bold text-[var(--foreground)]">{String(value).padStart(2, "0")}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   PAGE PRINCIPALE
───────────────────────────────────────────────────── */
export default function DashboardOverviewPage() {
  const { data: overview, isLoading, isError, refetch } = useDashboardOverview();
  const { data: rooms = [] } = useRooms();
  const { data: reservations = [] } = useReservations();
  const { user } = useAuth();

  const occupancyRate =
    overview && overview.total_rooms > 0
      ? Math.round((overview.occupied_rooms / overview.total_rooms) * 100)
      : 0;

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Bonjour" : now.getHours() < 18 ? "Bon après-midi" : "Bonsoir";
  const dateLabel = format(now, "EEEE d MMMM yyyy", { locale: fr });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (isError || !overview) return <ErrorState onRetry={() => refetch()} />;

  /* Données réservations */
  const recentReservations = [...(reservations as any[])].slice(0, 6);

  /* Répartition chambres pour la mini-barre */
  const roomStats = [
    { key: "AVAILABLE",   label: "Dispo",    count: overview.available_rooms,   color: "#606C5A" },
    { key: "OCCUPIED",    label: "Occupées", count: overview.occupied_rooms,     color: "#76CDCD" },
    { key: "MAINTENANCE", label: "Maint.",   count: overview.maintenance_rooms,  color: "#B94040" },
    {
      key: "OTHER", label: "Autres",
      count: Math.max(0, overview.total_rooms - overview.available_rooms - overview.occupied_rooms - overview.maintenance_rooms),
      color: "#B6B0AB",
    },
  ].filter((s) => s.count > 0);

  return (
    <div className="space-y-6">

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <motion.div {...fadeUp(0)}
        className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-6 md:p-8 shadow-[var(--shadow-sm)]"
      >
        {/* Fond décoratif */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }} />
        <div className="pointer-events-none absolute -bottom-10 right-40 h-32 w-32 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, var(--earth) 0%, transparent 70%)" }} />

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Salutation */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)] capitalize">{dateLabel}</p>
            <h2 className="mt-2 font-display text-4xl font-light leading-tight text-[var(--foreground)] md:text-5xl">
              {greeting},{" "}
              <span className="text-[var(--primary)]">{user?.first_name ?? ""}.</span>
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {overview.reservations_today} réservation{overview.reservations_today !== 1 ? "s" : ""} aujourd'hui
              {" · "}
              {overview.available_rooms} chambre{overview.available_rooms !== 1 ? "s" : ""} disponible{overview.available_rooms !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Pills arrivées / départs */}
          <div className="flex flex-wrap gap-3">
            <StatPill icon={LogIn}  label="Arrivées"  value={overview.check_ins_today}  color="#606C5A" />
            <StatPill icon={LogOut} label="Départs"   value={overview.check_outs_today} color="#C9973D" />
            <StatPill icon={Wrench} label="Maint."    value={overview.maintenance_rooms} color="#B94040" />
          </div>
        </div>

        {/* Barre de répartition des chambres */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">Répartition des chambres</p>
            <p className="text-[10px] text-[var(--muted-light)]">{overview.total_rooms} chambres au total</p>
          </div>
          <div className="flex h-2 w-full overflow-hidden rounded-full gap-0.5">
            {roomStats.map((s) => (
              <div
                key={s.key}
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(s.count / overview.total_rooms) * 100}%`, background: s.color }}
                title={`${s.label}: ${s.count}`}
              />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {roomStats.map((s) => (
              <div key={s.key} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                <span className="text-[10px] text-[var(--muted)]">{s.label} <strong className="text-[var(--foreground)]">{s.count}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ══ KPI CARDS ════════════════════════════════════════ */}
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Occupation"
          value={`${occupancyRate}%`}
          sub={`${overview.occupied_rooms} / ${overview.total_rooms} chambres`}
          icon={BedDouble}
          accent="#76CDCD"
          delay={0.05}
          href="/dashboard/chambres"
        />
        <KpiCard
          label="Réservations"
          value={String(overview.reservations_today)}
          sub="Aujourd'hui"
          icon={CalendarRange}
          accent="#606C5A"
          delay={0.1}
          href="/dashboard/reservations"
        />
        <KpiCard
          label="Revenus"
          value={`${Number(overview.revenue).toLocaleString("fr-MG")} Ar`}
          sub="Période en cours"
          icon={CreditCard}
          accent="#C9973D"
          delay={0.15}
          href="/dashboard/paiements"
        />
        <KpiCard
          label="Clients"
          value={String(overview.clients)}
          sub="Enregistrés"
          icon={Users}
          accent="#CCAEA4"
          delay={0.2}
          href="/dashboard/clients"
        />
      </div>

      {/* ══ GRILLE PRINCIPALE ════════════════════════════════ */}
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">

        {/* ── Réservations récentes ── */}
        <motion.div {...fadeUp(0.25)}
          className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-sm)] overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">Réservations récentes</p>
              <p className="text-base font-semibold text-[var(--foreground)] mt-0.5">Séjours à venir</p>
            </div>
            <Link
              href="/dashboard/reservations"
              className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--primary)] hover:opacity-80 transition-opacity"
            >
              Tout voir <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-[var(--line)]">
            {recentReservations.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-[var(--muted)]">Aucune réservation récente.</div>
            ) : (
              recentReservations.map((stay: any, i) => {
                const guestName = stay.client?.first_name
                  ? `${stay.client.first_name} ${stay.client.last_name}`
                  : "Client inconnu";
                const initials = stay.client?.first_name
                  ? `${stay.client.first_name[0]}${stay.client.last_name[0]}`
                  : "?";
                const nights = Math.max(1, Math.ceil(
                  (new Date(stay.check_out_date).getTime() - new Date(stay.check_in_date).getTime()) / 86400000
                ));
                const badge = STATUS_FR[stay.status] ?? { label: stay.status, color: "#7F7A74", bg: "rgba(127,122,116,0.08)" };

                return (
                  <motion.div
                    key={stay.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.04, duration: 0.3 }}
                    className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-[var(--background-alt)] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                        style={{ background: "var(--primary-soft)", color: "var(--primary-dark)" }}>
                        {initials.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--foreground)]">{guestName}</p>
                        <p className="text-[11px] text-[var(--muted)]">
                          {stay.check_in_date} → {stay.check_out_date}
                          <span className="mx-1.5 text-[var(--line-strong)]">·</span>
                          {nights} nuit{nights > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="hidden sm:inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                        style={{ background: badge.bg, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                      <span className="text-sm font-semibold text-[var(--foreground)]">
                        {stay.total_amount ? `${Number(stay.total_amount).toLocaleString("fr-MG")} Ar` : "—"}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* ── Panneau droit : statut chambres + actions rapides ── */}
        <div className="flex flex-col gap-5">

          {/* Chambres — statut */}
          <motion.div {...fadeUp(0.3)}
            className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-sm)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--line)]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">Statut chambres</p>
              <span className="flex items-center gap-1 rounded-full border border-[var(--line)] px-2 py-0.5 text-[9px] uppercase tracking-wide text-[var(--muted)]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                En direct
              </span>
            </div>
            <div className="px-4 py-3 space-y-1.5 max-h-[260px] overflow-y-auto">
              {(rooms as any[]).slice(0, 12).map((room: any) => {
                const cfg = ROOM_STATUS_CONFIG[room.status] ?? ROOM_STATUS_CONFIG["AVAILABLE"];
                return (
                  <div key={room.id}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-[var(--background-alt)]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: cfg.dot }} />
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        Chambre {room.room_number}
                      </span>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
              {(rooms as any[]).length > 12 && (
                <Link href="/dashboard/chambres"
                  className="block pt-1 text-center text-[11px] text-[var(--primary)] hover:opacity-80">
                  + {(rooms as any[]).length - 12} autres chambres
                </Link>
              )}
            </div>
          </motion.div>

          {/* Actions rapides */}
          <motion.div {...fadeUp(0.35)}
            className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]"
          >
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">Actions rapides</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/dashboard/check-in",     icon: LogIn,         label: "Check-in",     color: "#606C5A" },
                { href: "/dashboard/check-out",    icon: LogOut,        label: "Check-out",    color: "#C9973D" },
                { href: "/dashboard/housekeeping", icon: Sparkles,      label: "Housekeeping", color: "#76CDCD" },
                { href: "/dashboard/reports",      icon: TrendingUp,    label: "Rapports",     color: "#CCAEA4" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--background-alt)] py-3.5 text-center transition-all hover:border-transparent hover:shadow-[var(--shadow-sm)] hover:-translate-y-0.5"
                  style={{ "--hover-bg": `${action.color}10` } as React.CSSProperties}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
                    style={{ background: `${action.color}15`, color: action.color }}
                  >
                    <action.icon size={15} />
                  </div>
                  <span className="text-[11px] font-medium text-[var(--foreground-soft)]">{action.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

    </div>
  );
}
