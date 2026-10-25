"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { createPayment } from "@/lib/api/payments";
import { useAuth } from "@/lib/auth/context";
import type { PaymentCreatePayload, PaymentMethod } from "@/types/payment";

const initialForm: PaymentCreatePayload = {
  reservation_id: "",
  amount: 0,
  payment_method: "CARD",
  transaction_reference: "",
};

export default function PaymentsPage() {
  const { getToken } = useAuth();
  const [form, setForm] = useState<PaymentCreatePayload>(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError("Connexion requise pour enregistrer un paiement.");
    }
  }, [getToken]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getToken();

    if (!token) {
      setError("Connexion requise pour enregistrer un paiement.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await createPayment(token, {
        ...form,
        amount: Number(form.amount),
        transaction_reference: form.transaction_reference?.trim() || null,
      });
      setMessage(`Paiement enregistré (${result.status}) — ${Number(result.amount).toLocaleString("fr-MG")} Ar`);
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Le paiement n’a pas pu être enregistré.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)]">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--primary)]">Hotelia</p>
            <h1 className="mt-3 text-4xl text-[var(--foreground)]">Paiements</h1>
          </div>
          <Link href="/dashboard">
            <Button variant="secondary">Retour dashboard</Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[32px] border border-[var(--line)] bg-[rgba(255,255,255,0.7)] p-6 shadow-[var(--shadow-soft)] backdrop-blur-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm text-[var(--muted)] md:col-span-2">
              <span className="mb-2 block">Réservation</span>
              <input
                type="text"
                value={form.reservation_id}
                onChange={(event) => setForm((current) => ({ ...current, reservation_id: event.target.value }))}
                placeholder="UUID de la réservation"
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                required
              />
            </label>

            <label className="block text-sm text-[var(--muted)]">
              <span className="mb-2 block">Montant</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(event) => setForm((current) => ({ ...current, amount: Number(event.target.value) }))}
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                required
              />
            </label>

            <label className="block text-sm text-[var(--muted)]">
              <span className="mb-2 block">Moyen de paiement</span>
              <select
                value={form.payment_method}
                onChange={(event) => setForm((current) => ({ ...current, payment_method: event.target.value as PaymentMethod }))}
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
              >
                <option value="CARD">CARD</option>
                <option value="CASH">CASH</option>
                <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                <option value="MOBILE_MONEY">MOBILE_MONEY</option>
              </select>
            </label>

            <label className="block text-sm text-[var(--muted)] md:col-span-2">
              <span className="mb-2 block">Référence transactionnelle</span>
              <input
                type="text"
                value={form.transaction_reference ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, transaction_reference: event.target.value }))}
                placeholder="Optionnel"
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
              />
            </label>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">{error}</div>
          )}

          {message && (
            <div className="mt-6 rounded-2xl border border-[rgba(42,125,109,0.3)] bg-[rgba(42,125,109,0.08)] p-3 text-sm text-[var(--success)]">{message}</div>
          )}

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer le paiement"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
