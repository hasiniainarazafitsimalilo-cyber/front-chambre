"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getDashboardOverview, getOccupancySummary, getRevenueSummary } from "@/lib/api/dashboard";
import { useAuth } from "@/lib/auth/context";
import type { DashboardOverview, OccupancySummary, RevenueSummary } from "@/types/reservation";

/* ──────────────────────────────────────────────────
   Calcul de dates dynamiques
────────────────────────────────────────────────── */
function getMonthRange(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const fmt = (x: Date) => x.toISOString().slice(0, 10);
  const label = start.toLocaleString("fr-FR", { month: "short", year: "2-digit" });
  return { from: fmt(start), to: fmt(end), label };
}

/* ──────────────────────────────────────────────────
   Graphique Donut SVG
────────────────────────────────────────────────── */
function DonutChart({
  slices,
}: {
  slices: { label: string; value: number; color: string }[];
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = 52;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const segments = slices.map((s) => {
    const fraction = s.value / total;
    const dash = fraction * circumference;
    const gap = circumference - dash;
    const rotation = offset * 360;
    offset += fraction;
    return { ...s, dash, gap, rotation };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Fond */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="18" />
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="18"
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            strokeLinecap="butt"
            transform={`rotate(${seg.rotation - 90} ${cx} ${cy})`}
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        ))}
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize="20" fontWeight="700" fill="#1a1a2e">
          {total}
        </text>
        <text x={cx} y={cy + 13} textAnchor="middle" fontSize="9" fill="#94a3b8" letterSpacing="1">
          CHAMBRES
        </text>
      </svg>
      {/* Légende */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {slices.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            {s.label}
            <span className="font-semibold text-[var(--foreground)]">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────
   Jauge demi-cercle SVG
────────────────────────────────────────────────── */
function GaugeChart({ value, label }: { value: number; label: string }) {
  const pct = Math.min(100, Math.max(0, value));
  const r = 52;
  const cx = 80;
  const cy = 80;
  // demi-cercle : arc de 180°
  const halfCircumference = Math.PI * r; // ~163
  const filled = (pct / 100) * halfCircumference;
  const empty = halfCircumference - filled;

  const color =
    pct >= 80 ? "#ef4444" : pct >= 60 ? "#f59e0b" : "#2a7d6d";

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="90" viewBox="0 0 160 90">
        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${empty}`}
          style={{ transition: "stroke-dasharray 0.7s ease" }}
        />
        {/* Valeur */}
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="22" fontWeight="800" fill="#1a1a2e">
          {pct.toFixed(1)}%
        </text>
        <text x={cx} y={cy + 6} textAnchor="middle" fontSize="9" fill="#94a3b8" letterSpacing="0.8">
          {label.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}

/* ──────────────────────────────────────────────────
   Graphique en barres SVG (revenue multi-mois)
────────────────────────────────────────────────── */
function BarChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const W = 320;
  const H = 110;
  const barW = Math.floor(W / data.length) - 6;
  const barColor = "#2a7d6d";
  const barHighlight = "#38b2a0";

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 24}`} className="overflow-visible">
      {data.map((d, i) => {
        const barH = Math.max(4, (d.value / maxVal) * H);
        const x = i * (W / data.length) + (W / data.length - barW) / 2;
        const y = H - barH;
        const isMax = d.value === maxVal;
        return (
          <g key={d.label}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx="5"
              ry="5"
              fill={isMax ? barHighlight : barColor}
              opacity={isMax ? 1 : 0.65}
              style={{ transition: "height 0.6s ease, y 0.6s ease" }}
            />
            {/* Montant au-dessus */}
            {d.value > 0 && (
              <text
                x={x + barW / 2}
                y={y - 4}
                textAnchor="middle"
                fontSize="8"
                fill="#64748b"
                fontWeight={isMax ? "700" : "400"}
              >
                {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value.toFixed(0)}€
              </text>
            )}
            {/* Label mois */}
            <text
              x={x + barW / 2}
              y={H + 16}
              textAnchor="middle"
              fontSize="9"
              fill="#94a3b8"
            >
              {d.label}
            </text>
          </g>
        );
      })}
      {/* Ligne de base */}
      <line x1="0" y1={H} x2={W} y2={H} stroke="#e2e8f0" strokeWidth="1" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────
   Carte métrique
────────────────────────────────────────────────── */
function MetricCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-[26px] border border-[var(--line)] bg-[rgba(255,255,255,0.7)] p-5 shadow-[var(--shadow-soft)]">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{value}</p>
      {sub && <p className="mt-1 text-xs text-[var(--muted)]">{sub}</p>}
    </div>
  );
}

/* ──────────────────────────────────────────────────
   Page principale
────────────────────────────────────────────────── */
const MONTHS_BACK = 5; // nombre de mois passés à charger pour les barres

export default function ReportsPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [occupancy, setOccupancy] = useState<OccupancySummary | null>(null);
  const [revenueHistory, setRevenueHistory] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/connexion");
      return;
    }

    let cancelled = false;
    const currentMonth = getMonthRange(0);

    // Construire les plages pour les 6 derniers mois (barres)
    const monthRanges = Array.from({ length: MONTHS_BACK + 1 }, (_, i) =>
      getMonthRange(-(MONTHS_BACK - i))
    );

    Promise.all([
      getDashboardOverview(token),
      getRevenueSummary(token, currentMonth.from, currentMonth.to),
      getOccupancySummary(token, currentMonth.from, currentMonth.to),
      ...monthRanges.map((m) => getRevenueSummary(token, m.from, m.to)),
    ])
      .then(([dash, rev, occ, ...historicalRevenues]) => {
        if (cancelled) return;
        setOverview(dash as DashboardOverview);
        setRevenue(rev as RevenueSummary);
        setOccupancy(occ as OccupancySummary);
        setRevenueHistory(
          (historicalRevenues as RevenueSummary[]).map((r, i) => ({
            label: monthRanges[i].label,
            value: Number(r.revenue) || 0,
          }))
        );
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Les rapports sont indisponibles.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [getToken, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] p-8 text-[var(--foreground)]">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 text-[var(--muted)]">
            <svg className="animate-spin h-5 w-5 text-[var(--primary)]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Chargement des rapports…
          </div>
        </div>
      </main>
    );
  }

  const donutSlices = overview
    ? [
        { label: "Disponibles", value: overview.available_rooms, color: "#2a7d6d" },
        { label: "Occupées", value: overview.occupied_rooms, color: "#7c3aed" },
        { label: "Maintenance", value: overview.maintenance_rooms, color: "#f59e0b" },
        {
          label: "Autres",
          value: Math.max(
            0,
            overview.total_rooms - overview.available_rooms - overview.occupied_rooms - overview.maintenance_rooms
          ),
          color: "#94a3b8",
        },
      ].filter((s) => s.value > 0)
    : [];

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)]">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--primary)]">Hotelia</p>
            <h1 className="mt-3 text-4xl text-[var(--foreground)]">Rapports & performance</h1>
          </div>
          <Link href="/dashboard">
            <Button variant="secondary">Retour dashboard</Button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-[24px] border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* KPI row */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Chambres totales" value={overview?.total_rooms ?? "—"} />
          <MetricCard label="Disponibles" value={overview?.available_rooms ?? "—"} />
          <MetricCard label="Occupées" value={overview?.occupied_rooms ?? "—"} />
          <MetricCard
            label="Revenue (mois en cours)"
            value={revenue ? `${Number(revenue.revenue).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €` : "—"}
            sub={revenue ? `${revenue.from_date} → ${revenue.to_date}` : undefined}
          />
        </div>

        {/* Graphiques principaux */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">

          {/* Donut — répartition chambres */}
          <div className="rounded-[30px] border border-[var(--line)] bg-[rgba(255,255,255,0.7)] p-6 shadow-[var(--shadow-soft)]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-5">
              Répartition des chambres
            </p>
            {donutSlices.length > 0 ? (
              <DonutChart slices={donutSlices} />
            ) : (
              <p className="text-sm text-[var(--muted)]">Aucune donnée</p>
            )}
          </div>

          {/* Jauge — taux d'occupation */}
          <div className="rounded-[30px] border border-[var(--line)] bg-[rgba(255,255,255,0.7)] p-6 shadow-[var(--shadow-soft)]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-5">
              Taux d'occupation
            </p>
            {occupancy ? (
              <>
                <GaugeChart
                  value={Number(occupancy.occupancy_rate)}
                  label="occupation"
                />
                <p className="mt-3 text-center text-xs text-[var(--muted)]">
                  {occupancy.from_date} → {occupancy.to_date}
                </p>
              </>
            ) : (
              <p className="text-sm text-[var(--muted)]">Aucune donnée</p>
            )}
          </div>

          {/* Activité du jour */}
          <div className="rounded-[30px] border border-[var(--line)] bg-[rgba(255,255,255,0.7)] p-6 shadow-[var(--shadow-soft)]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-5">
              Activité du jour
            </p>
            <div className="space-y-4 text-sm text-[var(--muted)]">
              {[
                { label: "Réservations", value: overview?.reservations_today ?? 0, color: "#2a7d6d" },
                { label: "Check-ins", value: overview?.check_ins_today ?? 0, color: "#7c3aed" },
                { label: "Check-outs", value: overview?.check_outs_today ?? 0, color: "#f59e0b" },
                { label: "Clients", value: overview?.clients ?? 0, color: "#3b82f6" },
              ].map((item) => {
                const max = Math.max(
                  overview?.reservations_today ?? 0,
                  overview?.check_ins_today ?? 0,
                  overview?.check_outs_today ?? 0,
                  1
                );
                const pct = (item.value / max) * 100;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span>{item.label}</span>
                      <strong className="text-[var(--foreground)]">{item.value}</strong>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Revenue historique — barres */}
        <div className="mt-6 rounded-[30px] border border-[var(--line)] bg-[rgba(255,255,255,0.7)] p-6 shadow-[var(--shadow-soft)]">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Revenue mensuel — 6 derniers mois
            </p>
            {revenueHistory.length > 0 && (
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Total:{" "}
                {revenueHistory
                  .reduce((s, d) => s + d.value, 0)
                  .toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                {" "}€
              </p>
            )}
          </div>
          {revenueHistory.length > 0 ? (
            <BarChart data={revenueHistory} />
          ) : (
            <p className="text-sm text-[var(--muted)]">Aucune donnée disponible.</p>
          )}
        </div>

      </div>
    </main>
  );
}
