"use client";

import { useState, useRef, useEffect } from "react";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import { useRevenue, useOccupancy, useDashboardOverview } from "@/hooks/use-dashboard";
import { TrendingUp, BarChart2, Download, FileText, Printer, ChevronDown, Activity, Users, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ══════════════════════════════════════════════════════════
   GRAPHIQUE EN COURBE SVG — Revenue
══════════════════════════════════════════════════════════ */
function LineChart({ data }: { data: { label: string; value: number }[] }) {
  if (!data.length) return null;

  const W = 500;
  const H = 130;
  const PADDING = { top: 20, right: 16, bottom: 28, left: 44 };
  const innerW = W - PADDING.left - PADDING.right;
  const innerH = H - PADDING.top - PADDING.bottom;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minVal = 0;

  const xStep = innerW / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: PADDING.left + i * xStep,
    y: PADDING.top + innerH - ((d.value - minVal) / (maxVal - minVal)) * innerH,
    ...d,
  }));

  /* Courbe de Bézier lissée */
  function smoothPath(pts: { x: number; y: number }[]) {
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cp1x = prev.x + (curr.x - prev.x) * 0.45;
      const cp2x = curr.x - (curr.x - prev.x) * 0.45;
      d += ` C ${cp1x} ${prev.y} ${cp2x} ${curr.y} ${curr.x} ${curr.y}`;
    }
    return d;
  }

  const linePath = smoothPath(points);

  /* Zone de remplissage (gradient) */
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x} ${PADDING.top + innerH}` +
    ` L ${points[0].x} ${PADDING.top + innerH} Z`;

  /* Grille Y */
  const yTicks = [0.25, 0.5, 0.75, 1].map((f) => ({
    y: PADDING.top + innerH - f * innerH,
    label:
      maxVal * f >= 1000
        ? `${((maxVal * f) / 1000).toFixed(0)}k`
        : (maxVal * f).toFixed(0),
  }));

  const maxIdx = points.findIndex((p) => p.value === maxVal);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      className="overflow-visible"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#76CDCD" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#76CDCD" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grille horizontale */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={PADDING.left}
            y1={t.y}
            x2={W - PADDING.right}
            y2={t.y}
            stroke="rgba(30,28,26,0.07)"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          <text
            x={PADDING.left - 6}
            y={t.y + 4}
            textAnchor="end"
            fontSize="8.5"
            fill="#B6B0AB"
          >
            {t.label}
          </text>
        </g>
      ))}

      {/* Ligne de base */}
      <line
        x1={PADDING.left}
        y1={PADDING.top + innerH}
        x2={W - PADDING.right}
        y2={PADDING.top + innerH}
        stroke="rgba(30,28,26,0.1)"
        strokeWidth="1"
      />

      {/* Zone remplie */}
      <path d={areaPath} fill="url(#lineGrad)" />

      {/* Courbe principale */}
      <path
        d={linePath}
        fill="none"
        stroke="#76CDCD"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
        style={{ transition: "d 0.6s ease" }}
      />

      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#FFFFFF" stroke="#76CDCD" strokeWidth="2" />
          {/* Point max mis en valeur */}
          {i === maxIdx && (
            <>
              <circle cx={p.x} cy={p.y} r="6" fill="none" stroke="#76CDCD" strokeWidth="1.5" opacity="0.5" />
              <text
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                fontSize="8"
                fill="#76CDCD"
                fontWeight="700"
              >
                {p.value >= 1000 ? `${(p.value / 1000).toFixed(1)}k` : p.value}
              </text>
            </>
          )}
          {/* Labels mois */}
          <text
            x={p.x}
            y={H - 4}
            textAnchor="middle"
            fontSize="9"
            fill="#B6B0AB"
            fontWeight="500"
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════
   DONUT SVG
══════════════════════════════════════════════════════════ */
function DonutChart({
  slices,
}: {
  slices: { label: string; value: number; color: string }[];
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = 46;
  const cx = 64;
  const cy = 64;
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
    <div className="flex items-center gap-6">
      <svg width="128" height="128" viewBox="0 0 128 128" className="shrink-0">
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--background-alt)"
          strokeWidth="14"
        />
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="14"
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            strokeLinecap="butt"
            transform={`rotate(${seg.rotation - 90} ${cx} ${cy})`}
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        ))}
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--foreground)">
          {total}
        </text>
        <text x={cx} y={cy + 11} textAnchor="middle" fontSize="7.5" fill="var(--muted)" letterSpacing="1">
          TOTAL
        </text>
      </svg>
      {/* Légende verticale */}
      <div className="flex flex-col gap-2.5 flex-1">
        {slices.map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: s.color }}
              />
              <span className="text-xs text-[var(--muted)]">{s.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-1 rounded-full"
                style={{
                  width: `${Math.round((s.value / total) * 60)}px`,
                  background: s.color,
                  opacity: 0.35,
                }}
              />
              <span className="text-xs font-semibold text-[var(--foreground)] w-5 text-right">
                {s.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   JAUGE demi-cercle
══════════════════════════════════════════════════════════ */
function GaugeChart({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const r = 52;
  const cx = 84;
  const cy = 80;
  const halfC = Math.PI * r;
  const filled = (pct / 100) * halfC;
  const empty = halfC - filled;
  const color = pct >= 80 ? "#B94040" : pct >= 50 ? "#C9973D" : "#76CDCD";

  return (
    <div className="flex flex-col items-center">
      <svg width="168" height="96" viewBox="0 0 168 96">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#76CDCD" />
            <stop offset="60%" stopColor={color} />
          </linearGradient>
        </defs>
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="var(--background-alt)"
          strokeWidth="13"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${empty}`}
          style={{ transition: "stroke-dasharray 0.9s ease" }}
        />
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="24" fontWeight="800" fill="var(--foreground)">
          {pct.toFixed(1)}%
        </text>
        <text x={cx} y={cy + 6} textAnchor="middle" fontSize="7.5" fill="var(--muted)" letterSpacing="0.8">
          D'OCCUPATION
        </text>
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   KPI CARD
══════════════════════════════════════════════════════════ */
function KpiCard({
  icon,
  label,
  value,
  sub,
  accent,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent: string;
  trend?: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ background: `radial-gradient(circle at top left, ${accent}, transparent 70%)` }}
      />
      <div className="flex items-start justify-between mb-4">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: `${accent}18`, color: accent }}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <div
            className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              background: trend >= 0 ? "rgba(96,108,90,0.1)" : "rgba(185,64,64,0.08)",
              color: trend >= 0 ? "#606C5A" : "#B94040",
            }}
          >
            <ArrowUpRight size={10} style={{ transform: trend < 0 ? "scaleY(-1)" : undefined }} />
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-[11px] font-medium uppercase tracking-widest text-[var(--muted)] mb-1">{label}</p>
      <p className="text-2xl font-bold tracking-tight text-[var(--foreground)]">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-[var(--muted-light)]">{sub}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   HOOK revenue historique (6 mois)
══════════════════════════════════════════════════════════ */
function useRevenueHistory(months = 6) {
  const ranges = Array.from({ length: months }, (_, i) => {
    const d = subMonths(new Date(), months - 1 - i);
    return {
      from: format(startOfMonth(d), "yyyy-MM-dd"),
      to: format(endOfMonth(d), "yyyy-MM-dd"),
      label: format(d, "MMM", { locale: fr }),
    };
  });

  const r0 = useRevenue(ranges[0].from, ranges[0].to);
  const r1 = useRevenue(ranges[1].from, ranges[1].to);
  const r2 = useRevenue(ranges[2].from, ranges[2].to);
  const r3 = useRevenue(ranges[3].from, ranges[3].to);
  const r4 = useRevenue(ranges[4].from, ranges[4].to);
  const r5 = useRevenue(ranges[5].from, ranges[5].to);

  const results = [r0, r1, r2, r3, r4, r5];
  const isLoading = results.some((r) => r.isLoading);
  const data = ranges.map((range, i) => ({
    label: range.label,
    value: Number(results[i].data?.revenue ?? 0),
  }));

  return { data, isLoading };
}

/* ══════════════════════════════════════════════════════════
   EXPORT — CSV & PDF
══════════════════════════════════════════════════════════ */
function exportCSV({
  fromDate,
  toDate,
  revenueData,
  occupancyData,
  overview,
  revenueHistory,
}: {
  fromDate: Date;
  toDate: Date;
  revenueData: any;
  occupancyData: any;
  overview: any;
  revenueHistory: { label: string; value: number }[];
}) {
  const rows: string[][] = [];
  const sep = ",";
  const q = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

  rows.push([q("Rapport Hotelia"), q(format(new Date(), "dd/MM/yyyy HH:mm"))]);
  rows.push([]);

  // KPI période
  rows.push([q("Période"), q(`${format(fromDate, "dd/MM/yyyy")} – ${format(toDate, "dd/MM/yyyy")}`)]);
  rows.push([q("Revenue période (Ar)"), q(Number(revenueData?.revenue ?? 0).toLocaleString("fr-MG"))]);
  rows.push([q("Taux d'occupation (%)"), q(Number(occupancyData?.occupancy_rate ?? 0).toFixed(2))]);
  rows.push([]);

  // Chambres
  rows.push([q("Chambres totales"), q(overview?.total_rooms ?? 0)]);
  rows.push([q("Chambres disponibles"), q(overview?.available_rooms ?? 0)]);
  rows.push([q("Chambres occupées"), q(overview?.occupied_rooms ?? 0)]);
  rows.push([q("Chambres maintenance"), q(overview?.maintenance_rooms ?? 0)]);
  rows.push([q("Clients enregistrés"), q(overview?.clients ?? 0)]);
  rows.push([]);

  // Activité du jour
  rows.push([q("Réservations aujourd'hui"), q(overview?.reservations_today ?? 0)]);
  rows.push([q("Check-ins aujourd'hui"), q(overview?.check_ins_today ?? 0)]);
  rows.push([q("Check-outs aujourd'hui"), q(overview?.check_outs_today ?? 0)]);
  rows.push([]);

  // Historique revenue
  rows.push([q("Mois"), q("Revenue (Ar)")]);
  revenueHistory.forEach((m) => {
    rows.push([q(m.label), q(m.value.toLocaleString("fr-MG"))]);
  });
  rows.push([q("Total 6 mois"), q(revenueHistory.reduce((s, d) => s + d.value, 0).toLocaleString("fr-MG"))]);

  const csv = rows.map((r) => r.join(sep)).join("\n");
  const bom = "\uFEFF"; // UTF-8 BOM pour Excel
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rapport_hotelia_${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPDF() {
  window.print();
}

/* ══════════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════════ */
export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("month");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  let fromDate = new Date();
  let toDate = new Date();

  if (dateRange === "week") {
    fromDate = subDays(new Date(), 7);
  } else if (dateRange === "month") {
    fromDate = startOfMonth(new Date());
    toDate = endOfMonth(new Date());
  } else if (dateRange === "year") {
    fromDate = startOfYear(new Date());
    toDate = endOfYear(new Date());
  }

  const fromDateStr = format(fromDate, "yyyy-MM-dd");
  const toDateStr = format(toDate, "yyyy-MM-dd");

  const { data: revenueData, isLoading: revLoading } = useRevenue(fromDateStr, toDateStr);
  const { data: occupancyData, isLoading: occLoading } = useOccupancy(fromDateStr, toDateStr);
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview();
  const { data: revenueHistory, isLoading: histLoading } = useRevenueHistory(6);

  const totalHistRevenue = revenueHistory.reduce((s, d) => s + d.value, 0);

  const donutSlices = overview
    ? [
        { label: "Disponibles", value: overview.available_rooms ?? 0, color: "#76CDCD" },
        { label: "Occupées", value: overview.occupied_rooms ?? 0, color: "#606C5A" },
        { label: "Maintenance", value: overview.maintenance_rooms ?? 0, color: "#C9973D" },
        {
          label: "Autres",
          value: Math.max(
            0,
            (overview.total_rooms ?? 0) -
              (overview.available_rooms ?? 0) -
              (overview.occupied_rooms ?? 0) -
              (overview.maintenance_rooms ?? 0)
          ),
          color: "#B6B0AB",
        },
      ].filter((s) => s.value > 0)
    : [];

  /* Skeleton générique */
  const Skeleton = ({ h = "h-8", w = "w-full" }: { h?: string; w?: string }) => (
    <div className={`${h} ${w} animate-pulse rounded-lg bg-[var(--background-alt)]`} />
  );

  return (
    <div className="space-y-5">

      {/* ── En-tête ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
            Rapports & Statistiques
          </h2>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            Performances et rentabilité · {format(new Date(), "MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] flex text-sm overflow-hidden shadow-[var(--shadow-xs)]">
            {[
              { key: "week", label: "7j" },
              { key: "month", label: "Mois" },
              { key: "year", label: "Année" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setDateRange(opt.key)}
                className="px-3.5 py-2 font-medium transition-colors"
                style={{
                  background: dateRange === opt.key ? "var(--primary)" : "transparent",
                  color: dateRange === opt.key ? "#fff" : "var(--muted)",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* ── Dropdown Export ── */}
          <div ref={exportRef} className="relative">
            <button
              onClick={() => setShowExportMenu((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-sm font-medium text-[var(--foreground)] shadow-[var(--shadow-xs)] transition-all hover:border-[var(--primary)] hover:shadow-[var(--shadow-sm)] active:scale-[0.98]"
            >
              <Download size={14} className="text-[var(--primary)]" />
              Exporter
              <ChevronDown
                size={13}
                className="text-[var(--muted)] transition-transform duration-200"
                style={{ transform: showExportMenu ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-md)] animate-in fade-in slide-in-from-top-1 duration-150">
                {/* CSV */}
                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    setExporting(true);
                    setTimeout(() => {
                      exportCSV({ fromDate, toDate, revenueData, occupancyData, overview, revenueHistory });
                      setExporting(false);
                    }, 100);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--background-alt)] border-b border-[var(--line)]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                    <FileText size={15} />
                  </div>
                  <div>
                    <p className="font-medium leading-tight">Exporter CSV</p>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">Données brutes · Excel</p>
                  </div>
                </button>

                {/* PDF */}
                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    exportPDF();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--background-alt)]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 shrink-0">
                    <Printer size={15} />
                  </div>
                  <div>
                    <p className="font-medium leading-tight">Imprimer / PDF</p>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">Fenêtre d'impression</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 4 KPI cards ───────────────────────────────── */}
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={<TrendingUp size={16} />}
          label="Revenus"
          value={
            revLoading
              ? "—"
              : `${Number(revenueData?.revenue ?? 0).toLocaleString("fr-MG")} Ar`
          }
          sub={`${format(fromDate, "dd MMM")} – ${format(toDate, "dd MMM")}`}
          accent="#76CDCD"
        />
        <KpiCard
          icon={<BarChart2 size={16} />}
          label="Occupation"
          value={occLoading ? "—" : `${Math.round(occupancyData?.occupancy_rate ?? 0)} %`}
          sub="Capacité utilisée"
          accent="#606C5A"
        />
        <KpiCard
          icon={<Activity size={16} />}
          label="Chambres dispo"
          value={overviewLoading ? "—" : String(overview?.available_rooms ?? 0)}
          sub={`sur ${overview?.total_rooms ?? "—"} total`}
          accent="#C9973D"
        />
        <KpiCard
          icon={<Users size={16} />}
          label="Clients"
          value={overviewLoading ? "—" : String(overview?.clients ?? 0)}
          sub="Enregistrés"
          accent="#CCAEA4"
        />
      </div>

      {/* ── Ligne 2 : Courbe revenue + Jauge ────────── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Courbe — 2/3 largeur */}
        <div className="lg:col-span-2 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)]">
                Évolution du revenue
              </p>
              <p className="text-sm font-bold text-[var(--foreground)] mt-0.5">
                6 derniers mois
              </p>
            </div>
            {!histLoading && (
              <div className="text-right">
                <p className="text-[10px] text-[var(--muted-light)]">Total cumulé</p>
                <p className="text-sm font-bold text-[var(--primary)]">
                  {totalHistRevenue.toLocaleString("fr-MG")} Ar
                </p>
              </div>
            )}
          </div>
          {histLoading ? (
            <div className="space-y-2 pt-2">
              <Skeleton h="h-28" />
              <div className="flex justify-between">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} h="h-3" w="w-8" />
                ))}
              </div>
            </div>
          ) : (
            <LineChart data={revenueHistory} />
          )}
        </div>

        {/* Jauge — 1/3 largeur */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] flex flex-col items-center justify-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-4">
            Taux d'occupation
          </p>
          {occLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Skeleton h="h-20" w="w-36" />
              <Skeleton h="h-3" w="w-24" />
            </div>
          ) : (
            <>
              <GaugeChart value={occupancyData?.occupancy_rate ?? 0} />
              <p className="text-[11px] text-[var(--muted)] mt-2 text-center">
                {format(fromDate, "dd MMM")} – {format(toDate, "dd MMM yyyy")}
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── Ligne 3 : Donut + Activité du jour ─────── */}
      <div className="grid gap-4 md:grid-cols-2">

        {/* Donut chambres */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-5">
            Répartition des chambres
          </p>
          {overviewLoading ? (
            <div className="flex items-center gap-6">
              <Skeleton h="h-28" w="w-28" />
              <div className="flex-1 space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} h="h-4" />)}
              </div>
            </div>
          ) : donutSlices.length > 0 ? (
            <DonutChart slices={donutSlices} />
          ) : (
            <p className="text-sm text-[var(--muted)]">Aucune chambre enregistrée.</p>
          )}
        </div>

        {/* Activité du jour */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-5">
            Activité du jour
          </p>
          {overviewLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton h="h-3" w="w-32" />
                  <Skeleton h="h-1.5" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: "Réservations", value: overview?.reservations_today ?? 0, color: "#76CDCD" },
                { label: "Check-ins", value: overview?.check_ins_today ?? 0, color: "#606C5A" },
                { label: "Check-outs", value: overview?.check_outs_today ?? 0, color: "#C9973D" },
                { label: "Clients total", value: overview?.clients ?? 0, color: "#CCAEA4", isAbsolute: true },
              ].map((item) => {
                const maxToday = Math.max(
                  overview?.reservations_today ?? 0,
                  overview?.check_ins_today ?? 0,
                  overview?.check_outs_today ?? 0,
                  1
                );
                const pct = item.isAbsolute
                  ? Math.min(100, ((item.value / Math.max(overview?.clients ?? 1, 1)) * 100))
                  : (item.value / maxToday) * 100;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.color }} />
                        <span className="text-xs text-[var(--muted)]">{item.label}</span>
                      </div>
                      <span className="text-xs font-bold text-[var(--foreground)]">{item.value}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--background-alt)]">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
