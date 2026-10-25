"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

const roomCategories = [
  {
    name: "Suite Signature",
    description: "Des volumes généreux, une lumière douce et un confort discret pour les longs séjours professionnels.",
    price: "420 000 Ar",
  },
  {
    name: "Deluxe Garden",
    description: "Un cadre paisible, des textiles naturels et un service attentionné à chaque instant.",
    price: "360 000 Ar",
  },
  {
    name: "Executive Loft",
    description: "Un lieu de réflexion et de repos, pensé pour les voyageurs exigeants en déplacement.",
    price: "540 000 Ar",
  },
];

const details = [
  "Conciergerie privée",
  "Wellness & spa",
  "Cuisine locale",
  "Transfers sur mesure",
];

export default function PublicHomePage() {
  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:pb-24"
      >
        <div className="flex flex-col justify-center">
          <p className="mb-5 text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">Un séjour pensé pour voyager mieux</p>

          <h1 className="max-w-xl text-5xl leading-[0.92] text-[var(--foreground)] md:text-7xl">
            Le calme d’un hôtel de caractère.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-[var(--muted)]">
            Hôtelia associe confort discret, service attentif et atmosphère premium pour des séjours aussi réussis que professionnels.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/chambres">
              <Button size="lg">Vérifier la disponibilité</Button>
            </Link>
            <Link href="#rooms">
              <Button variant="secondary" size="lg">Explorer</Button>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-[var(--muted)]">
            <span>18 suites boutique</span>
            <span>4.9 / 5 expérience</span>
            <span>12 min de l’aéroport</span>
          </div>
        </div>

        <div className="relative flex min-h-[540px] items-end overflow-hidden rounded-[30px] border border-[var(--line)] bg-[var(--background-alt)] p-6 shadow-[var(--shadow-sm)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(118,205,205,0.12),transparent_38%)]" />

          <div className="relative w-full rounded-[26px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)]">
            <div className="mb-5 flex items-center justify-between text-sm text-[var(--muted)]">
              <span>Réservation</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--success)]">Disponible</span>
            </div>

            <div className="space-y-4">
              <div className="border-b border-[var(--line)] pb-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Arrivée</p>
                <p className="mt-2 text-4xl text-[var(--foreground)]">17 Oct</p>
              </div>

              <div className="border-b border-[var(--line)] pb-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Départ</p>
                <p className="mt-2 text-4xl text-[var(--foreground)]">20 Oct</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[var(--line)] pt-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Suite Signature</p>
                <p className="mt-2 text-2xl text-[var(--foreground)]">420 000 Ar</p>
              </div>
              <Link href="/chambres" className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-dark)]">Réserver</Link>
            </div>
          </div>
        </div>
      </motion.section>

      <section id="about" className="mx-auto grid max-w-7xl gap-8 px-6 py-4 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-12">
        <div className="pt-4">
          <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">Notre maison</p>
          <h2 className="mt-4 max-w-md text-5xl leading-none text-[var(--foreground)]">Une expérience d’hôtel pensée autour du calme.</h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-[var(--muted)]">
            Hôtelia a été pensé pour les voyageurs qui recherchent un cadre calme, un service discret et une organisation sans friction. Chaque détail est pensé pour permettre un séjour fluide, confortable et élégant.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border-t border-[var(--line)] pt-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Service</p>
            <p className="mt-6 text-3xl text-[var(--foreground)]">Hospitality</p>
          </div>
          <div className="border-t border-[var(--line)] pt-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Cadre</p>
            <p className="mt-6 text-3xl text-[var(--foreground)]">Calme</p>
          </div>
        </div>
      </section>

      <section id="rooms" className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">Chambres</p>
            <h2 className="mt-4 text-5xl text-[var(--foreground)]">Des espaces faits pour vivre.</h2>
          </div>
          <Link href="/rooms" className="hidden text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-dark)] md:inline-block">Voir le catalogue</Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {roomCategories.map((room) => (
            <article key={room.name} className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-xs)]">
              <div className="mb-6 h-32 rounded-[20px] bg-[var(--background-alt)]" />
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-3xl text-[var(--foreground)]">{room.name}</h3>
                <span className="text-lg text-[var(--primary-dark)]">{room.price}</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{room.description}</p>
              <Link href="/chambres" className="mt-6 inline-flex text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)]">
                Réserver cette chambre
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="experience" className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="border-t border-[var(--line)] pt-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">Expérience</p>
              <h2 className="mt-4 text-5xl text-[var(--foreground)]">Une hospitalité qui respire.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {details.map((item, index) => (
                <div key={item} className="border-t border-[var(--line)] pt-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">0{index + 1}</p>
                  <p className="mt-4 text-xl text-[var(--foreground)]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-4 lg:px-10">
        <div className="rounded-[28px] border border-[var(--line)] bg-[var(--primary)] p-8 text-[var(--surface)] shadow-[var(--shadow-md)] lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[10px] uppercase tracking-[0.26em] text-[rgba(255,255,255,0.7)]">Disponibilité</p>
              <h2 className="mt-4 text-5xl font-medium">Planifiez votre prochain séjour.</h2>
            </div>
            <Link href="/chambres">
              <Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                Réserver maintenant
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
