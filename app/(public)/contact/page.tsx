"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Input class ─────────────────────────────────────────────────────────────

const INPUT =
  "w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-colors";

const LABEL = "block text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] mb-1.5";

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [form, setForm] = useState(INITIAL);
  const [sending, setSending] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);

    // Simulate a short delay
    await new Promise((r) => setTimeout(r, 800));

    toast.success("Merci, nous vous contacterons bientôt !", {
      description: "Votre message a bien été envoyé à l'équipe Hôtelia.",
    });

    setForm(INITIAL);
    setSending(false);
  }

  return (
    <>
      {/* ── Hero ── */}
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-12 lg:px-10 lg:pt-16">
        <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">Nous écrire</p>
        <h1 className="mt-4 max-w-2xl text-5xl leading-none text-[var(--foreground)] md:text-7xl">
          Contactez-nous.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
          Notre équipe est disponible pour répondre à toutes vos questions — réservations, informations, partenariats ou réclamations.
        </p>
      </section>

      {/* ── Main grid ── */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-4 lg:px-10">
        <div className="border-t border-[var(--line)] pt-10" />

        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">

          {/* ── Form ── */}
          <div>
            <p className="mb-6 text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">Formulaire</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className={LABEL}>Prénom</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    placeholder="Jean"
                    value={form.firstName}
                    onChange={handleChange}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className={LABEL}>Nom</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    placeholder="Rakoto"
                    value={form.lastName}
                    onChange={handleChange}
                    className={INPUT}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className={LABEL}>Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="jean@exemple.mg"
                  value={form.email}
                  onChange={handleChange}
                  className={INPUT}
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className={LABEL}>Téléphone <span className="normal-case tracking-normal">(optionnel)</span></label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+261 34 00 000 00"
                  value={form.phone}
                  onChange={handleChange}
                  className={INPUT}
                />
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className={LABEL}>Sujet</label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={form.subject}
                  onChange={handleChange}
                  className={INPUT}
                >
                  <option value="" disabled>Sélectionnez un sujet</option>
                  <option value="reservation">Réservation</option>
                  <option value="informations">Informations</option>
                  <option value="reclamation">Réclamation</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className={LABEL}>Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Votre message..."
                  value={form.message}
                  onChange={handleChange}
                  className={`${INPUT} resize-none`}
                />
              </div>

              {/* Submit */}
              <Button type="submit" size="lg" disabled={sending} className="w-full sm:w-auto">
                {sending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Envoi en cours…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send size={15} />
                    Envoyer le message
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* ── Info & Map ── */}
          <div className="space-y-8">
            <div>
              <p className="mb-6 text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">Informations</p>

              <ul className="space-y-5">
                <li className="flex items-start gap-4 border-t border-[var(--line)] pt-5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--background-alt)] text-[var(--primary)]">
                    <MapPin size={15} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Adresse</p>
                    <p className="mt-1 text-sm text-[var(--foreground)]">Antananarivo, Madagascar</p>
                  </div>
                </li>

                <li className="flex items-start gap-4 border-t border-[var(--line)] pt-5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--background-alt)] text-[var(--primary)]">
                    <Phone size={15} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Téléphone</p>
                    <p className="mt-1 text-sm text-[var(--foreground)]">+261 34 00 000 00</p>
                  </div>
                </li>

                <li className="flex items-start gap-4 border-t border-[var(--line)] pt-5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--background-alt)] text-[var(--primary)]">
                    <Mail size={15} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Email</p>
                    <a
                      href="mailto:contact@hotelia.mg"
                      className="mt-1 block text-sm text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                    >
                      contact@hotelia.mg
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-4 border-t border-[var(--line)] pt-5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--background-alt)] text-[var(--primary)]">
                    <Clock size={15} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Horaires</p>
                    <p className="mt-1 text-sm text-[var(--foreground)]">Réception ouverte 24h/24</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Map placeholder */}
            <div className="overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--background-alt)]">
              <div className="flex h-56 flex-col items-center justify-center gap-3 text-[var(--muted)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-[var(--line)] bg-[var(--surface)] text-[var(--primary)]">
                  <MapPin size={22} strokeWidth={1.5} />
                </div>
                <p className="text-sm text-[var(--foreground)]">Antananarivo, Madagascar</p>
                <p className="text-[10px] uppercase tracking-[0.2em]">Hôtelia</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
