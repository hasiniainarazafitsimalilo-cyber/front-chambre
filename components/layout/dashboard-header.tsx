"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/context";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Vue d'ensemble",
  "/dashboard/chambres": "Chambres",
  "/dashboard/clients": "Clients",
  "/dashboard/reservations": "Réservations",
  "/dashboard/paiements": "Paiements",
  "/dashboard/factures": "Factures",
  "/dashboard/check-in": "Check-in",
  "/dashboard/check-out": "Check-out",
  "/dashboard/housekeeping": "Housekeeping",
  "/dashboard/maintenance": "Maintenance",
  "/dashboard/reports": "Rapports",
  "/dashboard/utilisateurs": "Utilisateurs",
};


export function DashboardHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

  const title = Object.entries(PAGE_TITLES).find(([key]) =>
    pathname === key || pathname.startsWith(key + "/")
  )?.[1] ?? "Dashboard";

  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header
      className="fixed left-[var(--sidebar-w)] right-0 top-0 z-20 flex h-[var(--header-h)] items-center justify-between border-b border-[var(--line)] bg-[var(--background)] px-6"
    >
      <div className="flex items-center gap-3">
        <h1 className="text-[15px] font-semibold text-[var(--foreground)]">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden text-[12px] text-[var(--muted)] capitalize md:block">
          {dateStr}
        </span>
        {user && (
          <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5">
            <div className="h-5 w-5 rounded-full bg-[var(--primary-soft)] flex items-center justify-center">
              <span className="text-[9px] font-semibold text-[var(--primary-dark)] uppercase">
                {user.first_name[0]}{user.last_name[0]}
              </span>
            </div>
            <span className="text-[12px] font-medium text-[var(--foreground-soft)]">
              {user.first_name} {user.last_name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
