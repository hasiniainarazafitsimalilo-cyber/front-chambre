"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getInvoice } from "@/lib/api/invoices";
import { useAuth } from "@/lib/auth/context";
import type { InvoiceSummary } from "@/lib/api/invoices";

export default function InvoicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getToken } = useAuth();
  const [invoice, setInvoice] = useState<InvoiceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/connexion");
      return;
    }

    let cancelled = false;

    getInvoice(token, params.id)
      .then((result) => {
        if (!cancelled) setInvoice(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Facture introuvable.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params.id, router]);

  if (loading) {
    return <main className="min-h-screen bg-[#0b0a09] p-8 text-stone-100">Chargement de la facture...</main>;
  }

  if (error || !invoice) {
    return (
      <main className="min-h-screen bg-[#0b0a09] p-8 text-stone-100">
        <div className="mx-auto max-w-xl rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <h1 className="text-3xl font-semibold text-white">Facture</h1>
          <p className="mt-4 text-stone-300">{error ?? "Cette facture est introuvable."}</p>
          <div className="mt-6 flex justify-center">
            <Link href="/dashboard"><Button>Retour dashboard</Button></Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0a09] px-6 py-10 text-stone-100">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-stone-800 bg-stone-950/80 p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Hotelia</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Facture {invoice.number}</h1>
          </div>
          <span className="rounded-full border border-stone-700 px-3 py-1 text-sm text-stone-300">{invoice.status}</span>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-4">
            <p className="text-sm text-stone-400">Réservation</p>
            <p className="mt-2 text-lg font-semibold text-white">{invoice.reservation_id}</p>
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-4">
            <p className="text-sm text-stone-400">Date d’émission</p>
            <p className="mt-2 text-lg font-semibold text-white">{invoice.issue_date}</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-stone-800 bg-stone-900 p-4">
          <p className="text-sm uppercase tracking-[0.2em] text-stone-400">Détails</p>
          <div className="mt-4 space-y-3">
            {invoice.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-stone-800 pb-3 text-sm text-stone-300 last:border-none last:pb-0">
                <span>{item.description}</span>
                <span>{Number(item.total).toLocaleString("fr-MG")} Ar</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-stone-200">
          <div className="flex items-center justify-between"><span>Sous-total</span><span>{Number(invoice.subtotal).toLocaleString("fr-MG")} Ar</span></div>
          <div className="flex items-center justify-between"><span>Taxe</span><span>{Number(invoice.tax).toLocaleString("fr-MG")} Ar</span></div>
          <div className="flex items-center justify-between"><span>Réduction</span><span>{Number(invoice.discount).toLocaleString("fr-MG")} Ar</span></div>
          <div className="flex items-center justify-between text-lg font-semibold text-white"><span>Total</span><span>{Number(invoice.total).toLocaleString("fr-MG")} Ar</span></div>
        </div>
      </div>
    </main>
  );
}
