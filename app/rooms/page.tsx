"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api/client";
import type { RoomSummary, RoomTypeSummary } from "@/types/catalog";

export default function RoomsPage() {
  const [roomTypes, setRoomTypes] = useState<RoomTypeSummary[]>([]);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiRequest<RoomTypeSummary[]>("/room-types"),
      apiRequest<RoomSummary[]>("/rooms?page=1&page_size=20"),
    ])
      .then(([types, list]) => {
        setRoomTypes(types);
        setRooms(list);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Le catalogue est indisponible.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <main className="min-h-screen bg-[#0b0a09] p-8 text-stone-100">Chargement du catalogue...</main>;
  }

  return (
    <main className="min-h-screen bg-[#0b0a09] px-6 py-10 text-stone-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Hotelia</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Catalogue des chambres</h1>
          </div>
          <Link href="/chambres"><Button>Réserver</Button></Link>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {roomTypes.map((type) => (
            <div key={type.id} className="rounded-3xl border border-stone-800 bg-stone-950/80 overflow-hidden">
              {/* Image */}
              {(type as any).image_url ? (
                <div className="h-48 w-full overflow-hidden">
                  <img src={(type as any).image_url} alt={type.name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-36 w-full items-center justify-center bg-stone-900 text-stone-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Type</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{type.name}</h2>
                  </div>
                  <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-sm text-amber-200">
                    {Number(type.base_price).toLocaleString("fr-MG")} Ar / nuit
                  </span>
                </div>
                <p className="mt-4 text-stone-300">{type.description ?? "Chambre premium pensée pour les séjours professionnels et privés."}</p>
                <div className="mt-5 grid gap-2 text-sm text-stone-300 sm:grid-cols-3">
                  <div className="rounded-2xl border border-stone-800 bg-stone-900 p-3">Capacité: {type.max_occupants}</div>
                  <div className="rounded-2xl border border-stone-800 bg-stone-900 p-3">Adultes: {type.max_adults}</div>
                  <div className="rounded-2xl border border-stone-800 bg-stone-900 p-3">Enfants: {type.max_children}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-white">Disponibilité actuelle</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => (
              <div key={room.id} className="rounded-3xl border border-stone-800 bg-stone-950 overflow-hidden">
                {(room as any).image_url ? (
                  <div className="h-36 w-full overflow-hidden">
                    <img src={(room as any).image_url} alt={`Chambre ${room.room_number}`} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-28 w-full items-center justify-center bg-stone-900 text-stone-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-semibold text-white">Chambre {room.room_number}</p>
                    <span className="rounded-full border border-stone-700 px-2 py-1 text-xs text-stone-300">{room.status}</span>
                  </div>
                  <p className="mt-4 text-sm text-stone-400">Étage {room.floor ?? "—"}</p>
                  <p className="mt-3 text-sm text-stone-300">{room.description ?? "Chambre aménagée pour un séjour confortable."}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
