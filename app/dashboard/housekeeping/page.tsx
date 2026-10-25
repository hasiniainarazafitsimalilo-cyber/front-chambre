"use client";

import { useState } from "react";
import { useHousekeeping, useCreateHousekeeping, useUpdateHousekeeping } from "@/hooks/use-operations";
import { useRooms } from "@/hooks/use-rooms";
import { SkeletonTable } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, X, Plus, Edit2 } from "lucide-react";
import { toast } from "sonner";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-colors";

export default function HousekeepingPage() {
  const { data: tasks, isLoading, isError, refetch } = useHousekeeping();
  const { data: rooms = [] } = useRooms();
  
  const createMutation = useCreateHousekeeping();
  const updateMutation = useUpdateHousekeeping();

  const [showCreate, setShowCreate] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const [editingTask, setEditingTask] = useState<any>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        room_id: roomId,
        notes: notes || undefined,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      });
      toast.success("Tâche planifiée avec succès !");
      setShowCreate(false);
      setRoomId(""); setNotes(""); setScheduledAt("");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la planification.");
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTask) return;
    try {
      await updateMutation.mutateAsync({
        id: editingTask.id,
        status: editStatus,
        notes: editNotes || undefined,
      });
      toast.success("Tâche mise à jour !");
      setEditingTask(null);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour.");
    }
  }

  function openEdit(task: any) {
    setEditingTask(task);
    setEditStatus(task.status);
    setEditNotes(task.notes || "");
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Housekeeping</h2>
        <SkeletonTable rows={8} cols={5} />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Housekeeping</h2>
          <p className="text-sm text-[var(--muted)]">Gérez le nettoyage et l'entretien courant des chambres.</p>
        </div>
        {!showCreate && (
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus size={16} /> Planifier une tâche
          </Button>
        )}
      </div>

      {showCreate && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-medium">Nouvelle tâche de ménage</h3>
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
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Date prévue</label>
                <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className={INPUT} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Notes / Instructions</label>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: Changement des draps complet..." className={INPUT} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Annuler</Button>
              <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Création..." : "Planifier"}</Button>
            </div>
          </form>
        </div>
      )}

      {(!tasks || tasks.length === 0) ? (
        <EmptyState title="Aucune tâche" description="Il n'y a pas de tâches de ménage planifiées." icon={<Sparkles size={24} />} />
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-xs)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--background-alt)] text-[12px] font-medium uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="px-6 py-4">Chambre</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Date prévue</th>
                  <th className="px-6 py-4">Notes</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {tasks.map((task: any) => (
                  <tr key={task.id} className="transition-colors hover:bg-[var(--background-alt)]">
                    <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                      {task.room?.room_number || "Inconnue"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={task.status} />
                    </td>
                    <td className="px-6 py-4 text-[var(--muted)]">
                      {task.scheduled_at ? new Date(task.scheduled_at).toLocaleString("fr-FR") : "Dès que possible"}
                    </td>
                    <td className="px-6 py-4 text-[var(--muted)] max-w-[200px] truncate">
                      {task.notes || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="xs" onClick={() => openEdit(task)} className="gap-2">
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

      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium">Mettre à jour la tâche</h3>
              <button onClick={() => setEditingTask(null)} className="text-[var(--muted)] hover:text-[var(--foreground)]"><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Statut</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className={INPUT}>
                  <option value="PENDING">En attente</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="COMPLETED">Terminé</option>
                  <option value="CANCELLED">Annulé</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Notes</label>
                <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} className={INPUT} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setEditingTask(null)}>Annuler</Button>
                <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
