"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useRoomTypes, useCreateRoomType, useUpdateRoomType, useDeleteRoomType,
  useAmenities, useCreateAmenity, useUpdateAmenity, useDeleteAmenity,
} from "@/hooks/use-rooms";
import type { RoomTypeSummary, AmenitySummary } from "@/types/catalog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

const INPUT = "w-full rounded-md border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-colors";

const ROOM_TYPE_PRESETS = [
  "Chambre Simple",
  "Chambre Double",
  "Chambre Twin",
  "Chambre Triple",
  "Chambre Familiale",
  "Chambre Supérieure",
  "Chambre Deluxe",
  "Junior Suite",
  "Suite",
  "Suite Présidentielle",
  "Bungalow",
  "Studio",
];

function formatMGA(amount: number | string) {
  return `${Number(amount).toLocaleString("fr-MG")} Ar`;
}

// ─── Inline Edit Row for Room Types ─────────────────────────────────────────
function RoomTypeRow({ rt }: { rt: RoomTypeSummary }) {
  const updateRoomType = useUpdateRoomType();
  const deleteRoomType = useDeleteRoomType();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(rt.name);
  const [price, setPrice] = useState(String(rt.base_price));
  const [adults, setAdults] = useState(String(rt.max_adults));
  const [children, setChildren] = useState(String(rt.max_children));
  const [maxOcc, setMaxOcc] = useState(String(rt.max_occupants));
  const [desc, setDesc] = useState(rt.description ?? "");
  const [imageUrl, setImageUrl] = useState(rt.image_url ?? "");

  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    try {
      await updateRoomType.mutateAsync({ id: rt.id, payload: { name, base_price: Number(price), max_adults: Number(adults), max_children: Number(children), max_occupants: Number(maxOcc), description: desc || undefined, image_url: imageUrl || undefined } });
      toast.success("Type modifié !");
      setEditing(false);
    } catch { toast.error("Erreur de modification"); }
  };

  const confirmDelete = async () => {
    try {
      await deleteRoomType.mutateAsync(rt.id);
      toast.success("Type supprimé.");
    } catch { toast.error("Impossible de supprimer — des chambres l'utilisent peut-être."); }
    setDeleting(false);
  };

  if (editing) {
    return (
      <li className="p-4 bg-[var(--background-alt)] space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <label className="text-[10px] font-semibold text-[var(--muted)] uppercase">Type</label>
            <select value={name} onChange={e => setName(e.target.value)} className={INPUT}>
              {ROOM_TYPE_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-[var(--muted)] uppercase">Prix (Ar)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-[var(--muted)] uppercase">Max occupation</label>
            <input type="number" value={maxOcc} onChange={e => setMaxOcc(e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-[var(--muted)] uppercase">Adultes max</label>
            <input type="number" value={adults} onChange={e => setAdults(e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-[var(--muted)] uppercase">Enfants max</label>
            <input type="number" value={children} onChange={e => setChildren(e.target.value)} className={INPUT} />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-semibold text-[var(--muted)] uppercase">Description</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} className={INPUT} />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-semibold text-[var(--muted)] uppercase">Image URL</label>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className={INPUT} placeholder="https://..." />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => setEditing(false)}><X size={13} className="mr-1" />Annuler</Button>
          <Button size="sm" disabled={updateRoomType.isPending} onClick={handleSave}><Check size={13} className="mr-1" />Enregistrer</Button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-start justify-between gap-4 p-4 hover:bg-[var(--background-alt)] transition-colors">
      <div className="flex gap-4 min-w-0">
        {rt.image_url ? (
          <img src={rt.image_url} alt={rt.name} className="h-16 w-16 object-cover rounded-md flex-shrink-0" />
        ) : (
          <div className="h-16 w-16 bg-[var(--background-alt)] border border-[var(--line)] rounded-md flex-shrink-0 flex items-center justify-center text-[var(--muted)] text-xs">
            Pas d'image
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-[var(--foreground)]">{rt.name}</h4>
            <span className="text-sm font-semibold text-[var(--primary)]">{formatMGA(rt.base_price)}/nuit</span>
          </div>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            👤 {rt.max_adults} adultes · 👧 {rt.max_children} enfants · max {rt.max_occupants} pers.
          </p>
          {rt.description && <p className="mt-0.5 text-xs italic text-[var(--muted)]">{rt.description}</p>}
        </div>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <button onClick={() => setEditing(true)} className="rounded-md p-1.5 text-[var(--muted)] hover:bg-sky-100 hover:text-sky-600 transition-colors" title="Modifier">
          <Pencil size={14} />
        </button>
        <button onClick={() => setDeleting(true)} disabled={deleteRoomType.isPending} className="rounded-md p-1.5 text-[var(--muted)] hover:bg-red-100 hover:text-red-600 transition-colors" title="Supprimer">
          <Trash2 size={14} />
        </button>
      </div>

      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={confirmDelete}
        title="Supprimer ce type ?"
        description={`Voulez-vous vraiment supprimer le type "${rt.name}" ?`}
        confirmLabel="Supprimer"
        confirmVariant="danger"
        loading={deleteRoomType.isPending}
      />
    </li>
  );
}

// ─── Inline Edit Tag for Amenities ───────────────────────────────────────────
function AmenityTag({ a }: { a: AmenitySummary }) {
  const updateAmenity = useUpdateAmenity();
  const deleteAmenity = useDeleteAmenity();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(a.name);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    try {
      await updateAmenity.mutateAsync({ id: a.id, payload: { name } });
      toast.success("Équipement modifié !");
      setEditing(false);
    } catch { toast.error("Erreur"); }
  };

  const confirmDelete = async () => {
    try {
      await deleteAmenity.mutateAsync(a.id);
      toast.success("Équipement supprimé.");
    } catch { toast.error("Erreur de suppression"); }
    setDeleting(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input autoFocus value={name} onChange={e => setName(e.target.value)} className="rounded-md border border-[var(--primary)] bg-[var(--background)] px-2 py-1 text-xs outline-none w-32" />
        <button onClick={handleSave} className="rounded p-1 text-green-600 hover:bg-green-50" title="Valider"><Check size={12} /></button>
        <button onClick={() => { setEditing(false); setName(a.name); }} className="rounded p-1 text-red-500 hover:bg-red-50" title="Annuler"><X size={12} /></button>
      </div>
    );
  }

  return (
    <>
      <div className="group flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--background-alt)] pl-3 pr-1.5 py-1">
        <span className="text-xs font-medium">{a.name}</span>
        <button onClick={() => setEditing(true)} className="rounded-full p-0.5 text-[var(--muted)] opacity-0 group-hover:opacity-100 hover:text-sky-600 transition-all" title="Modifier">
          <Pencil size={10} />
        </button>
        <button onClick={() => setDeleting(true)} className="rounded-full p-0.5 text-[var(--muted)] opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all" title="Supprimer">
          <Trash2 size={10} />
        </button>
      </div>
      
      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={confirmDelete}
        title="Supprimer l'équipement ?"
        description={`Voulez-vous vraiment supprimer "${a.name}" ?`}
        confirmLabel="Supprimer"
        confirmVariant="danger"
        loading={deleteAmenity.isPending}
      />
    </>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────
export default function RoomConfigPage() {
  const { data: roomTypes = [], isLoading: loadingTypes } = useRoomTypes();
  const { data: amenities = [], isLoading: loadingAmenities } = useAmenities();
  const createRoomType = useCreateRoomType();
  const createAmenity = useCreateAmenity();

  const [showTypeForm, setShowTypeForm] = useState(false);
  const [tName, setTName] = useState("");
  const [tDesc, setTDesc] = useState("");
  const [tPrice, setTPrice] = useState("");
  const [tAdults, setTAdults] = useState("2");
  const [tChildren, setTChildren] = useState("0");
  const [tMax, setTMax] = useState("2");
  const [tImageUrl, setTImageUrl] = useState("");

  const [showAmenityForm, setShowAmenityForm] = useState(false);
  const [aName, setAName] = useState("");

  const resetTypeForm = () => { setTName(""); setTDesc(""); setTPrice(""); setTAdults("2"); setTChildren("0"); setTMax("2"); setTImageUrl(""); };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRoomType.mutateAsync({ name: tName, description: tDesc || undefined, base_price: Number(tPrice), max_adults: Number(tAdults), max_children: Number(tChildren), max_occupants: Number(tMax), image_url: tImageUrl || undefined });
      toast.success(`Type "${tName}" créé !`);
      setShowTypeForm(false); resetTypeForm();
    } catch (err: any) { toast.error(err.message || "Erreur"); }
  };

  const handleCreateAmenity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAmenity.mutateAsync({ name: aName });
      toast.success(`"${aName}" ajouté !`);
      setShowAmenityForm(false); setAName("");
    } catch (err: any) { toast.error(err.message || "Erreur"); }
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Configuration des Chambres</h2>
        <p className="text-sm text-[var(--muted)]">Gérez dynamiquement les types de chambres et les équipements disponibles.</p>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        {/* ─── TYPES ─── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Types de Chambres</h3>
              <p className="text-xs text-[var(--muted)]">{roomTypes.length} type(s) configuré(s)</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => { setShowTypeForm(!showTypeForm); resetTypeForm(); }}>
              {showTypeForm ? <X size={13} className="mr-1" /> : <Plus size={13} className="mr-1" />}
              {showTypeForm ? "Annuler" : "Nouveau"}
            </Button>
          </div>

          {showTypeForm && (
            <div className="mb-4 rounded-lg border border-[var(--primary)]/30 bg-[var(--surface)] p-4 shadow-sm">
              <form onSubmit={handleCreateType} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Type *</label>
                  <select required value={tName} onChange={e => setTName(e.target.value)} className={INPUT}>
                    <option value="">— Sélectionner —</option>
                    {ROOM_TYPE_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Prix / nuit (Ar) *</label>
                    <div className="relative">
                      <input required type="number" min="1000" step="500" value={tPrice} onChange={e => setTPrice(e.target.value)} placeholder="80000" className={INPUT + " pr-10"} />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--muted)]">Ar</span>
                    </div>
                    {tPrice && <p className="mt-0.5 text-[10px] text-[var(--primary)]">{formatMGA(tPrice)}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Max total</label>
                    <input required type="number" min="1" value={tMax} onChange={e => setTMax(e.target.value)} className={INPUT} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Adultes max</label>
                    <input required type="number" min="0" value={tAdults} onChange={e => setTAdults(e.target.value)} className={INPUT} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Enfants max</label>
                    <input required type="number" min="0" value={tChildren} onChange={e => setTChildren(e.target.value)} className={INPUT} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Description</label>
                  <input value={tDesc} onChange={e => setTDesc(e.target.value)} placeholder="Vue mer, balcon..." className={INPUT} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Image URL</label>
                  <input value={tImageUrl} onChange={e => setTImageUrl(e.target.value)} placeholder="https://..." className={INPUT} />
                </div>
                <Button type="submit" disabled={createRoomType.isPending} className="w-full">
                  {createRoomType.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </form>
            </div>
          )}

          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
            {loadingTypes ? (
              <p className="p-4 text-sm text-[var(--muted)]">Chargement...</p>
            ) : roomTypes.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm font-medium text-[var(--foreground)]">Aucun type configuré</p>
                <p className="mt-1 text-xs text-[var(--muted)]">Cliquez sur « Nouveau » pour commencer.</p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--line)]">
                {roomTypes.map(rt => <RoomTypeRow key={rt.id} rt={rt} />)}
              </ul>
            )}
          </div>
        </section>

        {/* ─── ÉQUIPEMENTS ─── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Équipements</h3>
              <p className="text-xs text-[var(--muted)]">{amenities.length} équipement(s) configuré(s)</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setShowAmenityForm(!showAmenityForm)}>
              {showAmenityForm ? <X size={13} className="mr-1" /> : <Plus size={13} className="mr-1" />}
              {showAmenityForm ? "Annuler" : "Nouveau"}
            </Button>
          </div>

          {showAmenityForm && (
            <div className="mb-4 rounded-lg border border-[var(--primary)]/30 bg-[var(--surface)] p-4 shadow-sm">
              <form onSubmit={handleCreateAmenity} className="flex gap-2">
                <input required value={aName} onChange={e => setAName(e.target.value)} placeholder="Ex: Wi-Fi, Piscine, Jacuzzi..." className={INPUT} />
                <Button type="submit" disabled={createAmenity.isPending}>Ajouter</Button>
              </form>
            </div>
          )}

          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 min-h-[80px]">
            {loadingAmenities ? (
              <p className="text-sm text-[var(--muted)]">Chargement...</p>
            ) : amenities.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-sm font-medium text-[var(--foreground)]">Aucun équipement</p>
                <p className="mt-1 text-xs text-[var(--muted)]">Cliquez sur « Nouveau » pour en ajouter.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {amenities.map(a => <AmenityTag key={a.id} a={a} />)}
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">Survolez un équipement pour voir les boutons ✏️ et 🗑️</p>
        </section>
      </div>
    </div>
  );
}
