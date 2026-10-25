import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  PhoneCall,
  UtensilsCrossed,
  Sparkles,
  Car,
  Wifi,
  Clock,
  Shirt,
  MonitorPlay,
  ArrowRight,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    icon: PhoneCall,
    title: "Conciergerie & Accueil",
    description:
      "Un service de conciergerie disponible à toute heure pour organiser vos déplacements, réservations de restaurants et excursions à Antananarivo.",
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurant & Cuisine malgache",
    description:
      "Savourez une cuisine authentique malgache et internationale, préparée avec des produits frais et locaux au sein de notre restaurant.",
  },
  {
    icon: Sparkles,
    title: "Spa & Bien-être",
    description:
      "Ressourcez-vous dans notre espace spa avec massages traditionnels malgaches, soins du corps et zone de relaxation.",
  },
  {
    icon: MonitorPlay,
    title: "Salle de réunion",
    description:
      "Des espaces de travail modulables et entièrement équipés pour vos séminaires, formations et réunions professionnelles.",
  },
  {
    icon: Car,
    title: "Navette & Transferts",
    description:
      "Service de transfert depuis et vers l'aéroport d'Ivato, ainsi que des navettes privées vers les principaux sites de la ville.",
  },
  {
    icon: Wifi,
    title: "WiFi haut débit",
    description:
      "Connexion fibre optique haut débit dans l'ensemble de l'établissement — chambres, espaces communs et salles de réunion.",
  },
  {
    icon: Clock,
    title: "Room service 24h/24",
    description:
      "Notre équipe est à votre disposition à toute heure pour vous apporter repas, boissons et toute demande en chambre.",
  },
  {
    icon: Shirt,
    title: "Blanchisserie",
    description:
      "Service de lavage, repassage et pressing disponible chaque jour. Délai express disponible sur demande.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-12 lg:px-10 lg:pt-16">
        <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">Ce que nous offrons</p>
        <h1 className="mt-4 max-w-2xl text-5xl leading-none text-[var(--foreground)] md:text-7xl">
          Nos services.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
          Hôtelia met tout en œuvre pour que votre séjour à Antananarivo soit une expérience sans friction, confortable et mémorable — du premier sourire au dernier au revoir.
        </p>
      </section>

      {/* ── Services grid ── */}
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-4 lg:px-10">
        <div className="mb-10 border-t border-[var(--line)] pt-10">
          <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">Services principaux</p>
          <h2 className="mt-4 text-4xl text-[var(--foreground)]">Une hospitalité complète.</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-5 rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-xs)] transition-shadow hover:shadow-[var(--shadow-sm)]"
            >
              {/* Icon container */}
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[var(--line)] bg-[var(--background-alt)] text-[var(--primary)]">
                <Icon size={20} strokeWidth={1.5} />
              </div>

              <div>
                <h3 className="text-xl text-[var(--foreground)]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Details strip ── */}
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-10">
        <div className="grid gap-0 border-t border-[var(--line)] sm:grid-cols-3">
          {[
            { label: "Réception", value: "24h / 24" },
            { label: "Langues parlées", value: "FR · EN · MG" },
            { label: "À l'aéroport", value: "15 min" },
          ].map((item) => (
            <div key={item.label} className="border-b border-[var(--line)] py-8 sm:border-b-0 sm:border-r sm:px-8 sm:first:pl-0 sm:last:border-r-0">
              <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">{item.label}</p>
              <p className="mt-4 text-3xl text-[var(--foreground)]">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-4 lg:px-10">
        <div className="rounded-[28px] border border-[var(--line)] bg-[var(--primary)] p-8 text-[var(--surface)] shadow-[var(--shadow-md)] lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[10px] uppercase tracking-[0.26em] text-[rgba(255,255,255,0.7)]">Réservation</p>
              <h2 className="mt-4 text-4xl font-medium">Prêt pour votre séjour ?</h2>
              <p className="mt-3 text-sm text-[rgba(255,255,255,0.7)]">
                Réservez votre chambre et profitez de tous nos services dès votre arrivée à Antananarivo.
              </p>
            </div>
            <Link href="/chambres">
              <Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                Réserver maintenant
                <ArrowRight size={15} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
