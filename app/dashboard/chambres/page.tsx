"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, BedDouble, X, Pencil, Trash2 } from "lucide-react";
import { useRooms, useRoomTypes, useAmenities, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/hooks/use-rooms";
import { useAuth } from "@/lib/auth/context";
import { SkeletonTable } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-colors";

export default function ChambresPage() {
  const { user, getToken } = useAuth();
  const { data: rooms, isLoading, isError, refetch } = useRooms();
  const { data: roomTypes = [] } = useRoomTypes();
  const { data: amenities = [] } = useAmenities();
  
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  const [showForm, setShowForm] = useState(false);
  const [roomNumber, setRoomNumber] = useState("");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [floor, setFloor] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Edit modal state
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [editNumber, setEditNumber] = useState("");
  const [editTypeId, setEditTypeId] = useState("");
  const [editFloor, setEditFloor] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editAmenities, setEditAmenities] = useState<string[]>([]);

  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const isStaff = user?.role === "ADMIN" || user?.role === "RECEPTIONIST";

  function resetForm() {
    setRoomNumber(""); setRoomTypeId(""); setFloor("");
    setDescription(""); setImageUrl(""); setSelectedAmenities([]); setImages([]);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, isEdit = false) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/upload` : "http://localhost:8000/api/v1/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken() || ""}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace("/api/v1", "") : "http://localhost:8000";
      const newUrl = `${baseUrl}${data.url}`;
      if (isEdit) {
        setEditImages(prev => [...prev, newUrl]);
      } else {
        setImages(prev => [...prev, newUrl]);
      }
      toast.success("Image importée avec succès !");
    } catch (err: any) {
      toast.error("Erreur lors de l'import de l'image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!roomTypeId) { toast.error("Sélectionnez un type de chambre."); return; }
    try {
      await createRoom.mutateAsync({
        room_number: roomNumber,
        room_type_id: roomTypeId,
        floor: floor !== "" ? Number(floor) : null,
        description: description || null,
        image_url: imageUrl || (images.length > 0 ? images[0] : null),
        images: images,
        amenity_ids: selectedAmenities,
      });
      toast.success("Chambre ajoutée avec succès !");
      setShowForm(false); resetForm();
    } catch (err: any) { toast.error(err.message || "Erreur lors de l'ajout."); }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingRoom) return;
    try {
      await updateRoom.mutateAsync({
        roomId: editingRoom,
        payload: {
          room_number: editNumber || undefined,
          room_type_id: editTypeId || undefined,
          floor: editFloor !== "" ? Number(editFloor) : null,
          status: editStatus || undefined,
          description: editDescription || undefined,
          image_url: editImageUrl || (editImages.length > 0 ? editImages[0] : undefined),
          images: editImages,
          amenity_ids: editAmenities,
        },
      });
      toast.success("Chambre mise à jour !");
      setEditingRoom(null);
    } catch (err: any) { toast.error(err.message || "Erreur lors de la modification."); }
  }

  const [deletingRoom, setDeletingRoom] = useState<{ id: string; number: string } | null>(null);

  function handleDeleteClick(roomId: string, number: string) {
    setDeletingRoom({ id: roomId, number });
  }

  async function confirmDelete() {
    if (!deletingRoom) return;
    try {
      await deleteRoom.mutateAsync(deletingRoom.id);
      toast.success(`Chambre ${deletingRoom.number} supprimée.`);
      setDeletingRoom(null);
    } catch { toast.error("Erreur lors de la suppression."); }
  }

  function toggleAmenity(id: string, isEdit = false) {
    if (isEdit) {
      setEditAmenities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
    } else {
      setSelectedAmenities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
    }
  }

  function openEditModal(room: any) {
    setEditingRoom(room.id);
    setEditNumber(room.room_number);
    setEditTypeId(room.room_type?.id || "");
    setEditFloor(room.floor !== null ? String(room.floor) : "");
    setEditStatus(room.status);
    setEditDescription(room.description || "");
    setEditImageUrl(room.image_url || "");
    setEditImages(room.images || (room.image_url ? [room.image_url] : []));
    setEditAmenities(room.amenities?.map((a: any) => a.id) || []);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Chambres</h2>
        <SkeletonTable rows={8} cols={5} />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Chambres</h2>
          <p className="text-sm text-[var(--muted)]">
            {isStaff ? "Gérez le statut et la configuration de vos chambres." : "Consultez les chambres disponibles."}
          </p>
        </div>
        {isStaff && !showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus size={16} /> Ajouter une chambre
          </Button>
        )}
      </div>

      {/* Formulaire d'ajout */}
      {isStaff && showForm && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-medium text-[var(--foreground)]">Nouvelle chambre</h3>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="text-[var(--muted)] hover:text-[var(--foreground)]"><X size={18} /></button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Numéro de chambre *</label>
                <input required value={roomNumber} onChange={e => setRoomNumber(e.target.value)} placeholder="Ex: 101" className={INPUT} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Type de chambre *</label>
                <select required value={roomTypeId} onChange={e => setRoomTypeId(e.target.value)} className={INPUT}>
                  <option value="">-- Sélectionner --</option>
                  {roomTypes.map(rt => (
                    <option key={rt.id} value={rt.id}>{rt.name} — {Number(rt.base_price).toLocaleString("fr-MG")} Ar/nuit</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Étage</label>
                <input type="number" value={floor} onChange={e => setFloor(e.target.value)} placeholder="Ex: 2" className={INPUT} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">URL de l'image (Optionnel)</label>
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className={INPUT} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Ou importer des images locales (Plusieurs possibles)</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, false)} className={INPUT} disabled={uploading} />
                {uploading && <p className="text-xs text-[var(--muted)] mt-1">Upload en cours...</p>}
              </div>
              {(images.length > 0 || imageUrl) && (
                <div className="col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Images de la chambre</label>
                  <div className="flex gap-2 flex-wrap">
                    {imageUrl && (
                       <div className="h-24 w-32 overflow-hidden rounded-xl border border-[var(--line)]">
                         <img src={imageUrl} alt="Aperçu" className="h-full w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                       </div>
                    )}
                    {images.map((img, i) => (
                      <div key={i} className="relative h-24 w-32 overflow-hidden rounded-xl border border-[var(--line)]">
                        <img src={img} alt="Aperçu" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full hover:bg-white text-red-500"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Description</label>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optionnel" className={INPUT} />
              </div>
            </div>

            {amenities.length > 0 && (
              <div>
                <label className="mb-2 block text-xs font-medium text-[var(--muted)]">Équipements inclus</label>
                <div className="flex flex-wrap gap-2">
                  {amenities.map(a => (
                    <button key={a.id} type="button" onClick={() => toggleAmenity(a.id)} className={`rounded-full border px-3 py-1 text-xs transition-colors ${selectedAmenities.includes(a.id) ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--primary)]"}`}>
                      {a.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => { setShowForm(false); resetForm(); }}>Annuler</Button>
              <Button type="submit" disabled={createRoom.isPending}>{createRoom.isPending ? "Création..." : "Créer la chambre"}</Button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau */}
      {(!rooms || rooms.length === 0) ? (
        <EmptyState title="Aucune chambre" description={isStaff ? "Cliquez sur « Ajouter une chambre » pour commencer." : "Aucune chambre disponible."} icon={<BedDouble size={24} />} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-xs)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--background-alt)] text-[12px] font-medium uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-4 w-16">Photo</th>
                  <th className="px-6 py-4">Numéro</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Prix / nuit</th>
                  <th className="px-6 py-4">Étage</th>
                  <th className="px-6 py-4">Statut</th>
                  {isStaff && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {rooms.map(room => (
                  <tr key={room.id} className="transition-colors hover:bg-[var(--background-alt)]">
                    <td className="px-4 py-3">
                      {room.image_url ? (
                        <div className="h-12 w-16 overflow-hidden rounded-lg border border-[var(--line)]">
                          <img src={room.image_url} alt={room.room_number} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-16 items-center justify-center rounded-lg border border-dashed border-[var(--line)] bg-[var(--background-alt)] text-[var(--muted)]">
                          <BedDouble size={18} opacity={0.4} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-[var(--foreground)]">{room.room_number}</td>
                    <td className="px-6 py-4 text-[var(--foreground-soft)]">
                      {room.room_type?.name || "—"}
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="mt-1 flex gap-1 flex-wrap">
                          {room.amenities.slice(0, 2).map((a: any) => <span key={a.id} className="text-[10px] bg-[var(--line)] px-1.5 py-0.5 rounded text-[var(--muted)]">{a.name}</span>)}
                          {room.amenities.length > 2 && <span className="text-[10px] bg-[var(--line)] px-1.5 py-0.5 rounded text-[var(--muted)]">+{room.amenities.length - 2}</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[var(--foreground-soft)]">
                      {room.room_type?.base_price ? `${Number(room.room_type.base_price).toLocaleString("fr-MG")} Ar` : "—"}
                    </td>
                    <td className="px-6 py-4 text-[var(--muted)]">
                      {room.floor !== null && room.floor !== undefined ? `Étage ${room.floor}` : "—"}
                    </td>
                    <td className="px-6 py-4"><Badge status={room.status} /></td>
                    {isStaff && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(room)} className="p-1.5 text-[var(--muted)] hover:bg-sky-100 hover:text-sky-600 rounded-md transition-colors" title="Modifier">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDeleteClick(room.id, room.room_number)} disabled={deleteRoom.isPending} className="p-1.5 text-[var(--muted)] hover:bg-red-100 hover:text-red-600 rounded-md transition-colors" title="Supprimer">
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

      {/* Modal modification */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-medium">Modifier la chambre</h3>
              <button onClick={() => setEditingRoom(null)} className="text-[var(--muted)] hover:text-[var(--foreground)]"><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Numéro</label>
                  <input required value={editNumber} onChange={e => setEditNumber(e.target.value)} className={INPUT} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Type</label>
                  <select required value={editTypeId} onChange={e => setEditTypeId(e.target.value)} className={INPUT}>
                    <option value="">-- Sélectionner --</option>
                    {roomTypes.map(rt => (
                      <option key={rt.id} value={rt.id}>{rt.name} — {Number(rt.base_price).toLocaleString("fr-MG")} Ar/nuit</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Statut</label>
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className={INPUT}>
                    <option value="AVAILABLE">Disponible</option>
                    <option value="OCCUPIED">Occupée</option>
                    <option value="CLEANING">Nettoyage</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OUT_OF_SERVICE">Hors service</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Étage</label>
                  <input type="number" value={editFloor} onChange={e => setEditFloor(e.target.value)} className={INPUT} />
                </div>
                <div className="col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Description</label>
                  <input value={editDescription} onChange={e => setEditDescription(e.target.value)} className={INPUT} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">URL de l'image (Optionnel)</label>
                  <input value={editImageUrl} onChange={e => setEditImageUrl(e.target.value)} placeholder="https://..." className={INPUT} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Ou importer des images locales (Plusieurs possibles)</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, true)} className={INPUT} disabled={uploading} />
                  {uploading && <p className="text-xs text-[var(--muted)] mt-1">Upload en cours...</p>}
                </div>
                {(editImages.length > 0 || editImageUrl) && (
                  <div className="col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Images de la chambre</label>
                    <div className="flex gap-2 flex-wrap">
                      {editImageUrl && !editImages.includes(editImageUrl) && (
                         <div className="h-24 w-32 overflow-hidden rounded-xl border border-[var(--line)]">
                           <img src={editImageUrl} alt="Aperçu" className="h-full w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                         </div>
                      )}
                      {editImages.map((img, i) => (
                        <div key={i} className="relative h-24 w-32 overflow-hidden rounded-xl border border-[var(--line)]">
                          <img src={img} alt="Aperçu" className="h-full w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          <button type="button" onClick={() => setEditImages(editImages.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full hover:bg-white text-red-500"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {amenities.length > 0 && (
                <div>
                  <label className="mb-2 block text-xs font-medium text-[var(--muted)]">Équipements inclus</label>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map(a => (
                      <button key={a.id} type="button" onClick={() => toggleAmenity(a.id, true)} className={`rounded-full border px-2 py-1 text-[11px] transition-colors ${editAmenities.includes(a.id) ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--primary)]"}`}>
                        {a.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setEditingRoom(null)}>Annuler</Button>
                <Button type="submit" disabled={updateRoom.isPending}>{updateRoom.isPending ? "Enregistrement..." : "Enregistrer"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deletingRoom}
        onClose={() => setDeletingRoom(null)}
        onConfirm={confirmDelete}
        title="Supprimer cette chambre ?"
        description={`Voulez-vous vraiment supprimer la chambre ${deletingRoom?.number} ?`}
        confirmLabel="Supprimer"
        confirmVariant="danger"
        loading={deleteRoom.isPending}
      />
    </div>
  );
}
