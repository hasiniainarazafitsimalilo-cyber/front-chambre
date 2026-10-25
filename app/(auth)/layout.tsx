import Link from "next/link";
import { BedDouble } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">

      {/* ══ PANNEAU GAUCHE — Branding ════════════════════════════ */}
      <div className="relative hidden w-[52%] flex-col overflow-hidden lg:flex"
        style={{ background: "var(--sidebar-bg)" }}>

        {/* Orbes décoratifs */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 65%)" }} />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-72 w-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, var(--earth) 0%, transparent 60%)" }} />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 65%)" }} />

        {/* Grille décorative */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(var(--sidebar-fg) 1px, transparent 1px), linear-gradient(90deg, var(--sidebar-fg) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />

        {/* Logo */}
        <div className="relative z-10 px-12 pt-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
              style={{ background: "var(--primary)" }}>
              <BedDouble size={17} className="text-[var(--sidebar-bg)]" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white">HOTELIA</span>
          </Link>
        </div>

        {/* Contenu central */}
        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 pb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em]"
            style={{ color: "var(--primary)" }}>
            Hospitality Management
          </p>
          <h1 className="mt-5 text-5xl font-light leading-[1.1] text-white">
            L'art de l'accueil,<br />
            <span style={{ color: "var(--primary)" }}>réinventé.</span>
          </h1>
          <p className="mt-6 max-w-sm text-[14px] leading-relaxed"
            style={{ color: "var(--sidebar-muted)" }}>
            Gérez vos chambres, réservations et opérations quotidiennes depuis un seul tableau de bord élégant.
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { value: "100%", label: "Temps réel" },
              { value: "360°", label: "Vue complète" },
              { value: "∞",    label: "Scalabilité" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-widest"
                  style={{ color: "var(--sidebar-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer branding */}
        <div className="relative z-10 border-t px-12 py-5"
          style={{ borderColor: "var(--sidebar-border)" }}>
          <p className="text-[11px]" style={{ color: "var(--sidebar-muted)" }}>
            © {new Date().getFullYear()} Hotelia · Tous droits réservés
          </p>
        </div>
      </div>

      {/* ══ PANNEAU DROIT — Formulaire ═══════════════════════════ */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-[48%]">

        {/* Logo mobile */}
        <Link href="/" className="mb-10 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: "var(--primary)" }}>
            <BedDouble size={15} className="text-white" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-[var(--foreground)]">HOTELIA</span>
        </Link>

        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>

    </div>
  );
}
