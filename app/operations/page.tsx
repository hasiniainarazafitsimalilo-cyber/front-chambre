"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { listHousekeeping, listMaintenance } from "@/lib/api/operations";
import { useAuth } from "@/lib/auth/context";
import type { HousekeepingTask, MaintenanceItem } from "@/types/operations";

export default function OperationsPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>([]);
  const [housekeeping, setHousekeeping] = useState<HousekeepingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/connexion");
      return;
    }

    let cancelled = false;

    Promise.all([listMaintenance(token), listHousekeeping(token)])
      .then(([maintenanceItems, housekeepingTasks]) => {
        if (!cancelled) {
          setMaintenance(maintenanceItems);
          setHousekeeping(housekeepingTasks);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Les opérations sont indisponibles.");
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
    return <main className="min-h-screen bg-[var(--background)] p-8 text-[var(--foreground)]">Chargement des opérations...</main>;
  }

  const maintenanceOpen = maintenance.filter((item) => item.status?.toLowerCase() !== "closed").length;
  const housekeepingOpen = housekeeping.filter((task) => task.status?.toLowerCase() !== "completed").length;

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-8 text-[var(--foreground)] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-[30px] border border-[var(--line)] bg-[rgba(17,24,22,0.82)] p-6 shadow-[var(--shadow-soft)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--primary)]">Hotelia / operations</p>
            <h1 className="mt-3 text-4xl text-[var(--foreground)]">Opérations & service</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard"><Button variant="secondary">Retour dashboard</Button></Link>
            <Link href="/reports"><Button>Rapports</Button></Link>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-[24px] border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
        )}

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-[var(--line)] bg-[var(--panel)] p-5">
            <p className="text-sm text-[var(--muted)]">Maintenance active</p>
            <p className="mt-3 text-3xl text-[var(--primary)]">{maintenanceOpen}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-[var(--panel)] p-5">
            <p className="text-sm text-[var(--muted)]">Housekeeping</p>
            <p className="mt-3 text-3xl text-[var(--success)]">{housekeepingOpen}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-[var(--panel)] p-5">
            <p className="text-sm text-[var(--muted)]">Service</p>
            <p className="mt-3 text-3xl text-[var(--foreground)]">{maintenance.length + housekeeping.length}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[30px] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow-soft)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl text-[var(--foreground)]">Maintenance</h2>
              <span className="rounded-full border border-[var(--line)] bg-[var(--primary-soft)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--primary)]">
                {maintenance.length} items
              </span>
            </div>
            <div className="space-y-4">
              {maintenance.length === 0 && <p className="text-[var(--muted)]">Aucun ticket de maintenance.</p>}
              {maintenance.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-[var(--line)] bg-[#101d1b] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-[var(--foreground)]">#{String(item.id).slice(0, 8)}</p>
                    <span className="rounded-full border border-[var(--line)] bg-[var(--accent-soft)] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--accent)]">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[30px] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow-soft)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl text-[var(--foreground)]">Housekeeping</h2>
              <span className="rounded-full border border-[var(--line)] bg-[var(--primary-soft)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--primary)]">
                {housekeeping.length} tâches
              </span>
            </div>
            <div className="space-y-4">
              {housekeeping.length === 0 && <p className="text-[var(--muted)]">Aucune tâche d’entretien en cours.</p>}
              {housekeeping.map((task) => (
                <div key={task.id} className="rounded-[22px] border border-[var(--line)] bg-[#101d1b] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-[var(--foreground)]">#{String(task.id).slice(0, 8)}</p>
                    <span className="rounded-full border border-[var(--line)] bg-[var(--accent-soft)] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--accent)]">
                      {task.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{task.notes ?? "Aucune note associée."}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
