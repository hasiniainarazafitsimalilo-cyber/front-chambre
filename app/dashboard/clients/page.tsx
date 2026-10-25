"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Users, X, FileText, Pencil, Trash2 } from "lucide-react";
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from "@/hooks/use-clients";
import { useAuth } from "@/lib/auth/context";
import { SkeletonTable } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-colors";

export default function ClientsPage() {
  const { user } = useAuth();
  const { data: clients, isLoading, isError, refetch } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const [showForm, setShowForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [docType, setDocType] = useState("");
  const [docNumber, setDocNumber] = useState("");

  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [deletingClient, setDeletingClient] = useState<{ id: string; name: string } | null>(null);

  const isStaff = user?.role === "ADMIN" || user?.role === "RECEPTIONIST";

  function resetForm() {
    setFirstName(""); setLastName(""); setEmail(""); setPhone("");
    setAddress(""); setCountry(""); setDocType(""); setDocNumber("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createClient.mutateAsync({
        first_name: firstName, last_name: lastName, email,
        phone: phone || undefined, address: address || undefined,
        country: country || undefined, identity_document_type: docType || undefined,
        identity_document_number: docNumber || undefined,
      });
      toast.success("Client ajouté avec succès !");
      setShowForm(false); resetForm();
    } catch (err: any) { toast.error(err.message || "Erreur lors de l'ajout du client."); }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingClient) return;
    try {
      await updateClient.mutateAsync({
        id: editingClient,
        payload: {
          first_name: firstName, last_name: lastName, email,
          phone: phone || undefined, address: address || undefined,
          country: country || undefined, identity_document_type: docType || undefined,
          identity_document_number: docNumber || undefined,
        },
      });
      toast.success("Client mis à jour !");
      setEditingClient(null);
    } catch (err: any) { toast.error(err.message || "Erreur lors de la modification."); }
  }

  function handleDeleteClick(clientId: string, name: string) {
    setDeletingClient({ id: clientId, name });
  }

  async function confirmDelete() {
    if (!deletingClient) return;
    try {
      await deleteClient.mutateAsync(deletingClient.id);
      toast.success(`Client ${deletingClient.name} supprimé.`);
      setDeletingClient(null);
    } catch { toast.error("Impossible de supprimer ce client."); }
  }

  function openEditModal(client: any) {
    setEditingClient(client.id);
    setFirstName(client.first_name); setLastName(client.last_name); setEmail(client.email);
    setPhone(client.phone || ""); setAddress(client.address || ""); setCountry(client.country || "");
    setDocType(client.identity_document_type || ""); setDocNumber(client.identity_document_number || "");
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Clients</h2>
        <SkeletonTable rows={10} cols={5} />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Clients</h2>
          <p className="text-sm text-[var(--muted)]">
            {isStaff ? "Gérez la base de données de vos clients." : "Liste des clients enregistrés."}
          </p>
        </div>
        {isStaff && !showForm && (
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
            <Plus size={16} /> Ajouter un client
          </Button>
        )}
      </div>

      {isStaff && showForm && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-[var(--foreground)]">Nouveau client</h3>
              <p className="text-xs text-[var(--muted)] mt-0.5">Utilisez ce formulaire pour les réservations directes à l'accueil.</p>
            </div>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="text-[var(--muted)] hover:text-[var(--foreground)]"><X size={18} /></button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Same form fields as below in the modal */}
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Prénom *</label><input required value={firstName} onChange={e => setFirstName(e.target.value)} className={INPUT} /></div>
              <div><label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Nom *</label><input required value={lastName} onChange={e => setLastName(e.target.value)} className={INPUT} /></div>
              <div><label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Email *</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className={INPUT} /></div>
              <div><label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Téléphone</label><input value={phone} onChange={e => setPhone(e.target.value)} className={INPUT} /></div>
              <div><label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Pays</label><input value={country} onChange={e => setCountry(e.target.value)} className={INPUT} /></div>
              <div><label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Adresse</label><input value={address} onChange={e => setAddress(e.target.value)} className={INPUT} /></div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Pièce d'identité</label>
                <select value={docType} onChange={e => setDocType(e.target.value)} className={INPUT}>
                  <option value="">-- Optionnel --</option>
                  <option value="CNI">Carte Nationale d'Identité</option>
                  <option value="PASSPORT">Passeport</option>
                  <option value="PERMIS">Permis de conduire</option>
                </select>
              </div>
              <div><label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Numéro de pièce</label><input value={docNumber} onChange={e => setDocNumber(e.target.value)} className={INPUT} /></div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => { setShowForm(false); resetForm(); }}>Annuler</Button>
              <Button type="submit" disabled={createClient.isPending}>{createClient.isPending ? "Enregistrement..." : "Enregistrer"}</Button>
            </div>
          </form>
        </div>
      )}

      {(!clients || clients.length === 0) ? (
        <EmptyState title="Aucun client" description={isStaff ? "Cliquez sur « Ajouter un client » pour commencer." : "Aucun client enregistré."} icon={<Users size={24} />} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-xs)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--background-alt)] text-[12px] font-medium uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="px-6 py-4">Nom</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Pays</th>
                  <th className="px-6 py-4">Profil</th>
                  {isStaff && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {clients.map(client => (
                  <tr key={client.id} className="transition-colors hover:bg-[var(--background-alt)]">
                    <td className="px-6 py-4 font-medium text-[var(--foreground)]">{client.first_name} {client.last_name}</td>
                    <td className="px-6 py-4 text-[var(--foreground-soft)]">
                      <div className="flex flex-col gap-0.5">
                        <span>{client.email}</span>
                        {client.phone && <span className="text-[12px] text-[var(--muted)]">{client.phone}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--muted)]">{client.country || "—"}</td>
                    <td className="px-6 py-4 text-[var(--muted)]">
                      <div className="flex items-center gap-1.5">
                        <FileText size={14} /><span>{client.address ? "Complet" : "Basique"}</span>
                      </div>
                    </td>
                    {isStaff && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(client)} className="p-1.5 text-[var(--muted)] hover:bg-sky-100 hover:text-sky-600 rounded-md transition-colors" title="Modifier">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDeleteClick(client.id, `${client.first_name} ${client.last_name}`)} disabled={deleteClient.isPending} className="p-1.5 text-[var(--muted)] hover:bg-red-100 hover:text-red-600 rounded-md transition-colors" title="Supprimer">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium">Modifier le client</h3>
              <button onClick={() => setEditingClient(null)} className="text-[var(--muted)] hover:text-[var(--foreground)]"><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div><label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Prénom *</label><input required value={firstName} onChange={e => setFirstName(e.target.value)} className={INPUT} /></div>
                <div><label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Nom *</label><input required value={lastName} onChange={e => setLastName(e.target.value)} className={INPUT} /></div>
                <div><label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Email *</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className={INPUT} /></div>
                <div><label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Téléphone</label><input value={phone} onChange={e => setPhone(e.target.value)} className={INPUT} /></div>
                <div><label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Pays</label><input value={country} onChange={e => setCountry(e.target.value)} className={INPUT} /></div>
                <div><label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Adresse</label><input value={address} onChange={e => setAddress(e.target.value)} className={INPUT} /></div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Pièce d'identité</label>
                  <select value={docType} onChange={e => setDocType(e.target.value)} className={INPUT}>
                    <option value="">-- Optionnel --</option>
                    <option value="CNI">Carte Nationale d'Identité</option>
                    <option value="PASSPORT">Passeport</option>
                    <option value="PERMIS">Permis de conduire</option>
                  </select>
                </div>
                <div><label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Numéro de pièce</label><input value={docNumber} onChange={e => setDocNumber(e.target.value)} className={INPUT} /></div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setEditingClient(null)}>Annuler</Button>
                <Button type="submit" disabled={updateClient.isPending}>{updateClient.isPending ? "Enregistrement..." : "Enregistrer"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={confirmDelete}
        title="Supprimer ce client ?"
        description={`Voulez-vous vraiment supprimer le client ${deletingClient?.name} ? Attention: cela peut échouer si des réservations lui sont associées.`}
        confirmLabel="Supprimer"
        confirmVariant="danger"
        loading={deleteClient.isPending}
      />
    </div>
  );
}
