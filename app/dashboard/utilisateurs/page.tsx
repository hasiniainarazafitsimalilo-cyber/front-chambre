"use client";

import { useEffect, useState } from "react";
import { Plus, User as UserIcon, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/context";
import { getUsers, createReceptionist, updateUser, deleteUser } from "@/lib/api/users";
import type { UserProfile } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";

export default function UtilisateursPage() {
  const { getToken, user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state for Create
  const [showForm, setShowForm] = useState(false);
  
  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  
  // Edit State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await getUsers(getToken()!);
      setUsers(data);
    } catch (err) {
      toast.error("Erreur lors du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setIsActive(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createReceptionist(getToken()!, {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });
      toast.success("Responsable (Réceptionniste) créé avec succès !");
      setShowForm(false);
      resetForm();
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Erreur de création.");
    } finally {
      setSubmitting(false);
    }
  }
  
  const [deletingUser, setDeletingUser] = useState<{ id: string; name: string } | null>(null);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    
    try {
      const payload: any = {
        first_name: firstName,
        last_name: lastName,
        is_active: isActive,
      };
      if (password) {
        payload.password = password;
      }
      
      await updateUser(getToken()!, editingUser.id, payload);
      toast.success("Utilisateur mis à jour !");
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  }
  
  function handleDeleteClick(userId: string, name: string) {
    setDeletingUser({ id: userId, name });
  }

  async function confirmDelete() {
    if (!deletingUser) return;
    try {
      await deleteUser(getToken()!, deletingUser.id);
      toast.success(`Utilisateur ${deletingUser.name} supprimé.`);
      setDeletingUser(null);
      loadUsers();
    } catch {
      toast.error("Impossible de supprimer cet utilisateur.");
    }
  }
  
  function openEditModal(u: UserProfile) {
    setEditingUser(u);
    setFirstName(u.first_name);
    setLastName(u.last_name);
    setEmail(u.email);
    setIsActive(u.is_active);
    setPassword(""); // Keep blank so they don't have to enter it again unless changing
  }

  if (user?.role !== "ADMIN") {
    return <div className="p-8">Accès refusé. Réservé aux administrateurs.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Utilisateurs</h1>
          <p className="text-sm text-[var(--muted)]">Gérez les comptes d'accès à l'application.</p>
        </div>
        {!showForm && (
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
            <Plus size={16} />
            Ajouter un Responsable
          </Button>
        )}
      </div>

      {showForm && (
        <div className="rounded-[24px] border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Nouveau Responsable (Réceptionniste)</h2>
            <button onClick={() => setShowForm(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]"><X size={18} /></button>
          </div>
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-[var(--muted)]">Prénom</label>
              <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-md border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[var(--muted)]">Nom</label>
              <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-md border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[var(--muted)]">Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[var(--muted)]">Mot de passe provisoire</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-[var(--line)] bg-[var(--background)] px-3 py-2 pr-10 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Annuler</Button>
              <Button type="submit" disabled={submitting}>Créer</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-[var(--muted)]">Chargement...</div>
      ) : (
        <div className="overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--panel)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--background)]">
                <th className="px-6 py-4 font-medium text-[var(--muted)]">Nom</th>
                <th className="px-6 py-4 font-medium text-[var(--muted)]">Email</th>
                <th className="px-6 py-4 font-medium text-[var(--muted)]">Rôle</th>
                <th className="px-6 py-4 font-medium text-[var(--muted)]">Date de création</th>
                <th className="px-6 py-4 font-medium text-[var(--muted)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[var(--line)] last:border-0 hover:bg-[rgba(0,0,0,0.02)]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                        <UserIcon size={14} />
                      </div>
                      <span className="font-medium text-[var(--foreground)]">{u.first_name} {u.last_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--foreground)]">{u.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800">
                        {u.role}
                      </span>
                      {!u.is_active && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-800">
                          Inactif
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--muted)]">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {u.role !== "CLIENT" && (
                        <button onClick={() => openEditModal(u)} className="p-1.5 text-[var(--muted)] hover:bg-sky-100 hover:text-sky-600 rounded-md transition-colors" title="Modifier">
                          <Pencil size={15} />
                        </button>
                      )}
                      <button onClick={() => handleDeleteClick(u.id, `${u.first_name} ${u.last_name}`)} className="p-1.5 text-[var(--muted)] hover:bg-red-100 hover:text-red-600 rounded-md transition-colors" title="Supprimer">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--muted)]">Aucun utilisateur trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium">Modifier l'utilisateur</h3>
              <button onClick={() => setEditingUser(null)} className="text-[var(--muted)] hover:text-[var(--foreground)]"><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-[var(--muted)]">Prénom</label>
                  <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-md border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[var(--muted)]">Nom</label>
                  <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-md border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[var(--muted)]">Email</label>
                  <input disabled type="email" value={email} className="w-full rounded-md border border-[var(--line)] bg-[var(--background-alt)] px-3 py-2 text-sm text-[var(--muted)] outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[var(--muted)]">Mot de passe (optionnel)</label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? "text" : "password"}
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Laisser vide pour ne pas modifier"
                      className="w-full rounded-md border border-[var(--line)] bg-[var(--background)] px-3 py-2 pr-10 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                      tabIndex={-1}
                      aria-label={showEditPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded text-[var(--primary)] focus:ring-[var(--primary)] h-4 w-4" />
                  <label htmlFor="isActive" className="text-sm text-[var(--foreground)]">Compte actif</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setEditingUser(null)}>Annuler</Button>
                <Button type="submit" disabled={submitting}>{submitting ? "Enregistrement..." : "Enregistrer"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={confirmDelete}
        title="Supprimer cet utilisateur ?"
        description={`Voulez-vous vraiment supprimer l'utilisateur ${deletingUser?.name} ?`}
        confirmLabel="Supprimer"
        confirmVariant="danger"
        loading={submitting}
      />
    </div>
  );
}
