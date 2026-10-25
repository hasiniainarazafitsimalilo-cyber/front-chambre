"use client";

import { useRoom } from "@/hooks/use-rooms";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BedDouble, Users, Star, Check } from "lucide-react";
import Link from "next/link";
import { useState, Suspense } from "react";

function RoomDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.id as string;
  const { data: room, isLoading, isError } = useRoom(roomId);
  const router = useRouter();

  const [activeImage, setActiveImage] = useState(0);

  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const adults = searchParams.get("adults");

  const checkoutUrl = `/booking/checkout?roomId=${roomId}${checkIn ? `&checkIn=${checkIn}` : ""}${checkOut ? `&checkOut=${checkOut}` : ""}${adults ? `&adults=${adults}` : ""}`;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-20 text-center text-[var(--muted)]">
        Chargement des détails de la chambre...
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-20 text-center text-[var(--muted)]">
        Chambre introuvable.
        <div className="mt-4">
          <Button variant="secondary" onClick={() => router.back()}>Retour</Button>
        </div>
      </div>
    );
  }

  const allImages = [
    ...(room.image_url ? [room.image_url] : []),
    ...(room.images || [])
  ];
  // Deduplicate
  const uniqueImages = Array.from(new Set(allImages));

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-20">
      <button onClick={() => router.back()} className="mb-8 flex items-center text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]">
        <ArrowLeft size={16} className="mr-2" /> Retour
      </button>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Images Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-[var(--background-alt)]">
            {uniqueImages.length > 0 ? (
              <img src={uniqueImages[activeImage]} alt={`Chambre ${room.room_number}`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-[var(--muted)]">
                <BedDouble size={48} strokeWidth={1} />
                <span className="ml-4 text-sm tracking-widest uppercase">Hotelia par défaut</span>
              </div>
            )}
          </div>
          {uniqueImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {uniqueImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${activeImage === i ? "border-[var(--primary)]" : "border-transparent hover:opacity-80"}`}
                >
                  <img src={img} alt={`Miniature ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
            {room.room_type?.name}
          </span>
          <h1 className="mt-2 text-4xl font-medium text-[var(--foreground)]">
            Chambre {room.room_number}
          </h1>
          {room.floor !== null && (
            <p className="mt-2 text-sm text-[var(--muted)]">Étage {room.floor}</p>
          )}

          <div className="my-6 text-2xl font-semibold text-[var(--foreground)]">
            {room.room_type?.base_price ? `${Number(room.room_type.base_price).toLocaleString("fr-MG")} Ar` : "—"}
            <span className="text-sm font-normal text-[var(--muted)]"> / nuit</span>
          </div>

          <div className="mb-8 flex flex-wrap gap-4 rounded-2xl bg-[var(--background-alt)] p-4 text-[11px] uppercase tracking-[0.15em] text-[var(--foreground)]">
             {room.room_type && (
               <>
                 <span className="flex items-center gap-1.5"><Users size={14} className="text-[var(--primary)]" /> {room.room_type.max_adults} adulte(s)</span>
                 {room.room_type.max_children > 0 && <span className="flex items-center gap-1.5"><Star size={14} className="text-[var(--primary)]" /> {room.room_type.max_children} enfant(s)</span>}
                 <span className="flex items-center gap-1.5"><BedDouble size={14} className="text-[var(--primary)]" /> {room.room_type.max_occupants} max</span>
               </>
             )}
          </div>

          <h3 className="text-lg font-medium text-[var(--foreground)]">Description</h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            {room.description || room.room_type?.description || "Aucune description disponible pour cette chambre."}
          </p>

          {room.amenities && room.amenities.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-medium text-[var(--foreground)]">Équipements</h3>
              <ul className="grid grid-cols-2 gap-3">
                {room.amenities.map(a => (
                  <li key={a.id} className="flex items-center text-sm text-[var(--muted)]">
                    <Check size={16} className="mr-2 text-[var(--primary)]" />
                    {a.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-auto pt-10">
            <Link href={checkoutUrl}>
              <Button size="lg" className="w-full text-base">Finaliser la réservation</Button>
            </Link>
            <p className="mt-3 text-center text-xs text-[var(--muted)]">Redirection vers la page de paiement sécurisé.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoomDetailPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Chargement...</div>}>
      <RoomDetailContent />
    </Suspense>
  );
}
