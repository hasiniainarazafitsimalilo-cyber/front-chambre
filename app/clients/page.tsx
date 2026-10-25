"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { listClients } from "@/lib/api/clients";
import { useAuth } from "@/lib/auth/context";
import type { ClientSummary } from "@/types/catalog";

export default function ClientsPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/connexion");
      return;
    }

    let cancelled = false;

    listClients(token)
      .then((items) => {
        if (!cancelled) setClients(items);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "La liste des clients est indisponible.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return <main className="min-h-screen bg-[var(--background)] p-8 text-[var(--foreground)]">Chargement des clients...</main>;
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--primary)]">Hotelia</p>
            <h1 className="mt-3 text-4xl text-[var(--foreground)]">Clients</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard"><Button variant="secondary">Dashboard</Button></Link>
            <Link href="/chambres"><Button>Réserver</Button></Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-[24px] border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700">{error}</div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <article key={client.id} className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.7)] p-5 shadow-[var(--shadow-soft)] backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-soft)] text-lg font-semibold text-[var(--primary)]">
                  {client.first_name[0]}{client.last_name[0]}
                </div>
                <div>
                  <h2 className="text-xl text-[var(--foreground)]">{client.first_name} {client.last_name}</h2>
                  <p className="text-sm text-[var(--muted)]">{client.email}</p>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-sm text-[var(--muted)]">
                <p>Phone: {client.phone ?? "—"}</p>
                <p>Adresse: {client.address ?? "—"}</p>
                <p>Pays: {client.country ?? "—"}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
