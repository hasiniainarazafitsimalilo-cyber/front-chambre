"use client";

import { useState } from "react";
import { useMaintenance, useCreateMaintenance, useUpdateMaintenance } from "@/hooks/use-operations";
import { useRooms } from "@/hooks/use-rooms";
import { SkeletonTable } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, X, Plus, Edit2 } from "lucide-react";
import { toast } from "sonner";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-colors";

export default function MaintenancePage() {
  const { data: tickets, isLoading, isError, refetch } = useMaintenance();
  const { data: rooms = [] } = useRooms();
  
  const createMutation = useCreateMaintenance();
  const updateMutation = useUpdateMaintenance();

  const [showCreate, setShowCreate] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [description, setDescription] = useState("");

  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [editStatus, setEditStatus] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        room_id: roomId,
        description: description,
      });
      toast.success("Ticket de maintenance créé avec succès !");
      setShowCreate(false);
      setRoomId(""); setDescription("");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création.");
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTicket) return;
    try {
      await updateMutation.mutateAsync({
        id: editingTicket.id,
        status: editStatus,
      });
      toast.success("Ticket mis à jour !");
      setEditingTicket(null);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour.");
    }
  }

  function openEdit(ticket: any) {
    setEditingTicket(ticket);
    setEditStatus(ticket.status);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Maintenance</h2>
        <SkeletonTable rows={8} cols={5} />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Maintenance</h2>
          <p className="text-sm text-[var(--muted)]">Gérez les tickets techniques et indisponibilités.</p>
        </div>
        {!showCreate && (
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus size={16} /> Nouveau ticket
          </Button>
        )}
      </div>

      {showCreate && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-medium">Nouveau ticket de maintenance</h3>
            <button onClick={() => setShowCreate(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]"><X size={18} /></button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Chambre *</label>
                <select required value={roomId} onChange={(e) => setRoomId(e.target.value)} className={INPUT}>
                  <option value="">-- Sélectionner --</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>Chambre {r.room_number}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Description du problème *</label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Climatisation défectueuse..." rows={3} className={INPUT} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Annuler</Button>
              <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Création..." : "Créer le ticket"}</Button>
            </div>
          </form>
        </div>
      )}

      {(!tickets || tickets.length === 0) ? (
        <EmptyState title="Aucun ticket" description="Toutes les chambres sont opérationnelles." icon={<Wrench size={24} />} />
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-xs)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--background-alt)] text-[12px] font-medium uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="px-6 py-4">Chambre</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Date création</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {tickets.map((ticket: any) => (
                  <tr key={ticket.id} className="transition-colors hover:bg-[var(--background-alt)]">
                    <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                      {ticket.room?.room_number || "Inconnue"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={ticket.status} />
                    </td>
                    <td className="px-6 py-4 text-[var(--muted)] max-w-[200px] truncate">
                      {ticket.description}
                    </td>
                    <td className="px-6 py-4 text-[var(--muted)]">
                      {new Date(ticket.created_at).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="xs" onClick={() => openEdit(ticket)} className="gap-2">
                        <Edit2 size={14} /> Mettre à jour
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium">Mettre à jour le ticket</h3>
              <button onClick={() => setEditingTicket(null)} className="text-[var(--muted)] hover:text-[var(--foreground)]"><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Statut</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className={INPUT}>
                  <option value="OPEN">Ouvert</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="RESOLVED">Résolu</option>
                  <option value="CANCELLED">Annulé</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setEditingTicket(null)}>Annuler</Button>
                <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
