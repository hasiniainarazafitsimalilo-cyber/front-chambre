"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  BedDouble,
  Users,
  UserPlus,
  CalendarCheck,
  CreditCard,
  FileText,
  LogIn,
  LogOut,
  Sparkles,
  Wrench,
  ChevronRight,
  Power,
  User,
  ShieldCheck,
  ClipboardList,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/auth/context";
import { ConfirmDialog } from "@/components/ui/dialog";
import { toast } from "sonner";

/* ─── Menus par rôle ─── */

/** Menu ADMIN — vue complète + gestion utilisateurs */
const ADMIN_SECTIONS = [
  {
    label: "Tableau de bord",
    items: [
      { label: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard, exact: true },
      { label: "Rapports", href: "/dashboard/reports", icon: BarChart2 },
    ],
  },
  {
    label: "Gestion",
    items: [
      { label: "Chambres", href: "/dashboard/chambres", icon: BedDouble },
      { label: "Config. Chambres", href: "/dashboard/chambres/config", icon: Wrench },
      { label: "Clients", href: "/dashboard/clients", icon: Users },
      { label: "Réservations", href: "/dashboard/reservations", icon: CalendarCheck },
      { label: "Paiements", href: "/dashboard/paiements", icon: CreditCard },
      { label: "Factures", href: "/dashboard/factures", icon: FileText },
    ],
  },
  {
    label: "Opérations",
    items: [
      { label: "Check-in", href: "/dashboard/check-in", icon: LogIn },
      { label: "Check-out", href: "/dashboard/check-out", icon: LogOut },
      { label: "Housekeeping", href: "/dashboard/housekeeping", icon: Sparkles },
      { label: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Utilisateurs", href: "/dashboard/utilisateurs", icon: ShieldCheck },
    ],
  },
];

/** Menu RECEPTIONIST — centré sur les opérations quotidiennes */
const RECEPTIONIST_SECTIONS = [
  {
    label: "Accueil",
    items: [
      { label: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Gestion clients",
    items: [
      { label: "Clients", href: "/dashboard/clients", icon: Users },
      { label: "Réservations", href: "/dashboard/reservations", icon: CalendarCheck },
      { label: "Chambres", href: "/dashboard/chambres", icon: BedDouble, exact: true },
      { label: "Config. Chambres", href: "/dashboard/chambres/config", icon: Wrench },
    ],
  },
  {
    label: "Opérations du jour",
    items: [
      { label: "Check-in", href: "/dashboard/check-in", icon: LogIn },
      { label: "Check-out", href: "/dashboard/check-out", icon: LogOut },
      { label: "Paiements", href: "/dashboard/paiements", icon: CreditCard },
      { label: "Factures", href: "/dashboard/factures", icon: FileText },
    ],
  },
  {
    label: "Entretien",
    items: [
      { label: "Housekeeping", href: "/dashboard/housekeeping", icon: Sparkles },
      { label: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
    ],
  },
];

/* ─── Composants ─── */

function NavItem({
  href,
  icon: Icon,
  label,
  exact = false,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-[6px] px-3 py-2 text-[13px] text-white transition-all duration-150",
        isActive
          ? "bg-[var(--sidebar-active)] text-white font-medium"
          : "hover:bg-[var(--sidebar-hover)] hover:text-white",
      )}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-[var(--primary)]"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <Icon
        size={15}
        className={cn(
          "shrink-0 transition-colors",
          isActive ? "text-[var(--primary)]" : "text-[var(--sidebar-muted)] group-hover:text-white",
        )}
      />
      <span className="truncate">{label}</span>
      {isActive && (
        <ChevronRight
          size={12}
          className="ml-auto text-[var(--sidebar-muted)] shrink-0"
        />
      )}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 mt-5 first:mt-0 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/60">
      {children}
    </p>
  );
}

/* ─── Sidebar principale ─── */

export function DashboardSidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const sections = isAdmin ? ADMIN_SECTIONS : RECEPTIONIST_SECTIONS;

  const roleLabel = isAdmin ? "Administrateur" : "Réceptionniste";
  const roleBadgeColor = isAdmin
    ? "bg-amber-500/20 text-amber-300"
    : "bg-sky-500/20 text-sky-300";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/connexion");
    } catch {
      toast.error("Erreur lors de la déconnexion");
    } finally {
      setLoggingOut(false);
      setConfirmLogout(false);
    }
  };

  return (
    <>
      <aside
        className="fixed left-0 top-0 z-30 flex h-screen w-[var(--sidebar-w)] flex-col"
        style={{ background: "var(--sidebar-bg)" }}
        aria-label="Navigation principale"
      >
        {/* ── Logo + rôle ── */}
        <div className="flex items-center gap-3 border-b border-[var(--sidebar-border)] px-5 py-4">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-[6px]"
            style={{ background: "var(--primary)" }}
          >
            <BedDouble size={14} className="text-[var(--foreground)]" />
          </div>
          <div>
            <p className="text-[13px] font-semibold tracking-tight text-white">HOTELIA</p>
            <p className={cn("text-[9px] font-semibold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full mt-0.5 inline-block", roleBadgeColor)}>
              {roleLabel}
            </p>
          </div>
        </div>

        {/* ── Navigation par section ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Menu dashboard">
          {sections.map((section) => (
            <div key={section.label}>
              <SectionLabel>{section.label}</SectionLabel>
              {section.items.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
          ))}
        </nav>

        {/* ── Pied de page — profil utilisateur ── */}
        <div className="border-t border-[var(--sidebar-border)] px-3 py-3">
          {user && (
            <div className="mb-2 flex items-center gap-3 rounded-[6px] px-3 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                <User size={13} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-white">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-[10px] text-[var(--sidebar-muted)] truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setConfirmLogout(true)}
            className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2 text-[12px] text-[var(--sidebar-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--error)] transition-colors"
          >
            <Power size={13} />
            Déconnexion
          </button>
        </div>
      </aside>

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={handleLogout}
        title="Déconnexion"
        description="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmLabel="Déconnecter"
        confirmVariant="danger"
        loading={loggingOut}
      />
    </>
  );
}
