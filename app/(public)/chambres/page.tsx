"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRooms, useRoomTypes } from "@/hooks/use-rooms";
import { useAvailability } from "@/hooks/use-availability";
import type { AvailabilityFilters } from "@/lib/api/availability";
import { Button } from "@/components/ui/button";
import {
  BedDouble,
  Users,
  Star,
  Calendar,
  Search,
  X,
  ChevronDown,
  Baby,
  Filter,
} from "lucide-react";
import { format, addDays } from "date-fns";

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: "Disponible", color: "#22c55e" },
  OCCUPIED: { label: "Occupée", color: "#ef4444" },
  CLEANING: { label: "En nettoyage", color: "#f97316" },
  MAINTENANCE: { label: "Maintenance", color: "#9ca3af" },
  OUT_OF_SERVICE: { label: "Hors service", color: "#6b7280" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "#9ca3af" };
  return (
    <span
      style={{ color: cfg.color, borderColor: cfg.color + "33", backgroundColor: cfg.color + "12" }}
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em]"
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--surface)]">
      <div className="h-44 bg-[var(--background-alt)]" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-2/3 rounded bg-[var(--background-alt)]" />
        <div className="h-3 w-1/3 rounded bg-[var(--background-alt)]" />
        <div className="h-3 w-full rounded bg-[var(--background-alt)]" />
        <div className="h-8 w-full rounded-xl bg-[var(--background-alt)]" />
      </div>
    </div>
  );
}

// ─── Placeholder ──────────────────────────────────────────────────────────────

function RoomImagePlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[var(--muted)]">
      <BedDouble size={32} strokeWidth={1} />
      <span className="text-[10px] uppercase tracking-[0.22em]">Hotelia</span>
    </div>
  );
}

// ─── Input style ──────────────────────────────────────────────────────────────

const INPUT = "w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-colors";

// ─── Room card (shared) ───────────────────────────────────────────────────────

function RoomCard({
  room,
  searchParams,
}: {
  room: { id: string; room_number: string; status: string; floor?: number | null; description?: string | null; image_url?: string | null; images?: string[]; room_type?: { name: string; base_price: number; max_adults: number; max_children: number; max_occupants: number } };
  searchParams?: string;
}) {
  const href = `/chambres/${room.id}${searchParams ? `?${searchParams}` : ""}`;
  const imgSrc = room.images?.[0] || room.image_url;

  return (
    <article className="group flex flex-col overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-xs)] transition-all hover:shadow-[var(--shadow-sm)] hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative h-44 bg-[var(--background-alt)] overflow-hidden">
        {imgSrc ? (
          <img src={imgSrc} alt={`Chambre ${room.room_number}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <RoomImagePlaceholder />
        )}
        <div className="absolute top-3 right-3">
          <StatusBadge status={room.status} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Chambre</p>
            <p className="mt-1 text-xl font-medium text-[var(--foreground)]">{room.room_number}</p>
          </div>
          {room.room_type && (
            <div className="text-right">
              <p className="text-lg font-semibold text-[var(--primary)]">
                {Number(room.room_type.base_price).toLocaleString("fr-MG")} Ar
              </p>
              <p className="text-[10px] text-[var(--muted)]">/ nuit</p>
            </div>
          )}
        </div>

        {room.floor != null && (
          <p className="mt-1 text-[11px] text-[var(--muted)]">Étage {room.floor}</p>
        )}
        {room.room_type && (
          <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--primary-soft,var(--primary))] font-medium">
            {room.room_type.name}
          </p>
        )}
        {room.room_type && (
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-[var(--muted)]">
            <span className="flex items-center gap-1 rounded-full border border-[var(--line)] px-2 py-0.5">
              <Users size={10} /> {room.room_type.max_adults} adulte(s)
            </span>
            {room.room_type.max_children > 0 && (
              <span className="flex items-center gap-1 rounded-full border border-[var(--line)] px-2 py-0.5">
                <Baby size={10} /> {room.room_type.max_children} enfant(s)
              </span>
            )}
          </div>
        )}
        {room.description && (
          <p className="mt-3 text-xs leading-5 text-[var(--muted)] line-clamp-2">{room.description}</p>
        )}
        <div className="mt-auto pt-4">
          <Link href={href}>
            <Button className="w-full" size="sm">Voir & Réserver</Button>
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ChambresPage() {
  const { data: roomTypes } = useRoomTypes();
  const { data: allRooms, isLoading: loadingRooms } = useRooms(1, 200);

  // Search form state
  const [checkIn, setCheckIn] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [checkOut, setCheckOut] = useState(format(addDays(new Date(), 3), "yyyy-MM-dd"));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [roomTypeId, setRoomTypeId] = useState("");
  const [filters, setFilters] = useState<AvailabilityFilters | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  const { data: availableRooms, isLoading: loadingAvail } = useAvailability(filters);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!checkIn || !checkOut) return;
    setFilters({
      check_in_date: checkIn,
      check_out_date: checkOut,
      adults,
      children,
      room_type_id: roomTypeId || undefined,
    });
    setHasSearched(true);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  function clearSearch() {
    setFilters(null);
    setHasSearched(false);
    setRoomTypeId("");
    setAdults(2);
    setChildren(0);
    setCheckIn(format(addDays(new Date(), 1), "yyyy-MM-dd"));
    setCheckOut(format(addDays(new Date(), 3), "yyyy-MM-dd"));
  }

  // Build query string to pass to room detail
  const searchQuery = filters
    ? new URLSearchParams({
        checkIn: filters.check_in_date,
        checkOut: filters.check_out_date,
        adults: filters.adults.toString(),
        ...(filters.children ? { children: filters.children.toString() } : {}),
      }).toString()
    : "";

  // Filter all rooms by room type if selected (for catalogue mode)
  const filteredCatalogue = allRooms?.filter((r) =>
    roomTypeId ? r.room_type_id === roomTypeId : true
  );

  return (
    <>
      {/* ── Hero ── */}
      <section className="mx-auto max-w-7xl px-6 pb-6 pt-12 lg:px-10 lg:pt-16">
        <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">Nos chambres</p>
        <h1 className="mt-4 max-w-2xl text-5xl leading-none text-[var(--foreground)] md:text-6xl">
          Des espaces faits pour vivre.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--muted)]">
          Chaque chambre d&apos;Hôtelia est pensée pour offrir confort, calme et élégance au cœur d&apos;Antananarivo.
          Entrez vos dates pour vérifier la disponibilité, ou parcourez notre catalogue.
        </p>
      </section>

      {/* ── Search Form ── */}
      <section className="mx-auto max-w-7xl px-6 pb-10 lg:px-10">
        <form
          onSubmit={handleSearch}
          className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]"
        >
          <div className="mb-4 flex items-center gap-2">
            <Filter size={16} className="text-[var(--primary)]" />
            <p className="text-sm font-medium text-[var(--foreground)]">Vérifier la disponibilité</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {/* Check-in */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">
                <Calendar size={11} className="mr-1 inline" />Arrivée
              </label>
              <input
                type="date"
                value={checkIn}
                min={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => setCheckIn(e.target.value)}
                required
                className={INPUT}
              />
            </div>
            {/* Check-out */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">
                <Calendar size={11} className="mr-1 inline" />Départ
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || format(addDays(new Date(), 1), "yyyy-MM-dd")}
                onChange={(e) => setCheckOut(e.target.value)}
                required
                className={INPUT}
              />
            </div>
            {/* Adults */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">
                <Users size={11} className="mr-1 inline" />Adultes
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className={INPUT}
              />
            </div>
            {/* Children */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">
                <Baby size={11} className="mr-1 inline" />Enfants
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className={INPUT}
              />
            </div>
            {/* Room type */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">
                <BedDouble size={11} className="mr-1 inline" />Type de chambre
              </label>
              <select
                value={roomTypeId}
                onChange={(e) => setRoomTypeId(e.target.value)}
                className={INPUT}
              >
                <option value="">Tous les types</option>
                {roomTypes?.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button type="submit" disabled={loadingAvail} className="gap-2 px-6">
              <Search size={15} />
              {loadingAvail ? "Recherche en cours..." : "Rechercher les disponibilités"}
            </Button>
            {hasSearched && (
              <button
                type="button"
                onClick={clearSearch}
                className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <X size={14} /> Effacer le filtre
              </button>
            )}
          </div>
        </form>
      </section>

      {/* ── Results or Catalogue ── */}
      <div ref={resultsRef}>
        {hasSearched ? (
          /* ── Availability Results ── */
          <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-10">
            <div className="mb-8 border-t border-[var(--line)] pt-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">Disponibilité</p>
                <h2 className="mt-3 text-3xl text-[var(--foreground)]">
                  {loadingAvail
                    ? "Recherche en cours..."
                    : availableRooms?.length
                    ? `${availableRooms.length} chambre${availableRooms.length > 1 ? "s" : ""} disponible${availableRooms.length > 1 ? "s" : ""}`
                    : "Aucune chambre disponible"}
                </h2>
                {filters && (
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Du {new Date(filters.check_in_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })} au{" "}
                    {new Date(filters.check_out_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })} — {filters.adults} adulte(s){filters.children ? `, ${filters.children} enfant(s)` : ""}
                  </p>
                )}
              </div>
            </div>

            {loadingAvail ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : !availableRooms?.length ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <BedDouble size={48} strokeWidth={1} className="mb-4 text-[var(--muted)]" opacity={0.4} />
                <p className="text-lg font-medium text-[var(--foreground)]">Aucune chambre disponible</p>
                <p className="mt-2 text-sm text-[var(--muted)]">Essayez d&apos;autres dates ou modifiez vos critères.</p>
                <button onClick={clearSearch} className="mt-6 text-sm text-[var(--primary)] underline underline-offset-4 hover:opacity-80">
                  Voir tout le catalogue
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {availableRooms.map((room) => (
                  <RoomCard key={room.id} room={room as Parameters<typeof RoomCard>[0]["room"]} searchParams={searchQuery} />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* ── Full Catalogue ── */
          <>
            {/* Room Types section */}
            <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-10">
              <div className="mb-8 border-t border-[var(--line)] pt-10">
                <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">Catégories</p>
                <h2 className="mt-4 text-4xl text-[var(--foreground)]">Types de chambres</h2>
              </div>
              {!roomTypes?.length ? (
                <p className="text-[var(--muted)]">Aucun type de chambre disponible pour le moment.</p>
              ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                  {roomTypes.map((rt) => (
                    <article
                      key={rt.id}
                      className="flex flex-col rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-xs)] transition-shadow hover:shadow-[var(--shadow-sm)]"
                    >
                      <div className="relative mb-6 h-44 overflow-hidden rounded-[20px] bg-[var(--background-alt)]">
                        {rt.image_url ? (
                          <img src={rt.image_url} alt={rt.name} className="h-full w-full object-cover" />
                        ) : (
                          <RoomImagePlaceholder />
                        )}
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-2xl leading-tight text-[var(--foreground)]">{rt.name}</h3>
                        <span className="whitespace-nowrap text-lg font-medium text-[var(--primary)]">
                          {(rt.base_price ?? 0).toLocaleString("fr-MG")} Ar
                        </span>
                      </div>
                      {rt.description && (
                        <p className="mt-3 flex-1 text-sm leading-7 text-[var(--muted)] line-clamp-3">{rt.description}</p>
                      )}
                      <div className="mt-5 flex flex-wrap gap-4 border-t border-[var(--line)] pt-4 text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                        <span className="flex items-center gap-1.5">
                          <Users size={13} strokeWidth={1.5} />
                          {rt.max_adults} adulte{rt.max_adults > 1 ? "s" : ""}
                        </span>
                        {rt.max_children > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Baby size={13} strokeWidth={1.5} />
                            {rt.max_children} enfant{rt.max_children > 1 ? "s" : ""}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <BedDouble size={13} strokeWidth={1.5} />
                          {rt.max_occupants} max
                        </span>
                      </div>
                      {/* Clicking "Réserver" pre-selects this room type and scrolls to search */}
                      <button
                        onClick={() => {
                          setRoomTypeId(rt.id);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="mt-6 w-full rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                      >
                        Réserver ce type
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* All rooms */}
            <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-10">
              <div className="mb-8 border-t border-[var(--line)] pt-10">
                <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">Inventaire</p>
                <h2 className="mt-4 text-4xl text-[var(--foreground)]">Toutes nos chambres</h2>
              </div>

              {/* Room type filter pills */}
              {roomTypes && roomTypes.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  <button
                    onClick={() => setRoomTypeId("")}
                    className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                      !roomTypeId
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                        : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    }`}
                  >
                    Tous
                  </button>
                  {roomTypes.map((rt) => (
                    <button
                      key={rt.id}
                      onClick={() => setRoomTypeId(rt.id)}
                      className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                        roomTypeId === rt.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                          : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                      }`}
                    >
                      {rt.name}
                    </button>
                  ))}
                </div>
              )}

              {loadingRooms ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
                </div>
              ) : !filteredCatalogue?.length ? (
                <p className="py-12 text-center text-[var(--muted)]">Aucune chambre correspondante.</p>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredCatalogue.map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
