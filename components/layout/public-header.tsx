"use client";

import Link from "next/link";
import { BedDouble, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";

export function PublicHeader() {
  const { user } = useAuth();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--line)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-[var(--header-h)] max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-[6px]"
            style={{ background: "var(--primary)" }}
          >
            <BedDouble size={14} className="text-[var(--foreground)]" />
          </div>
          <div>
            <p className="text-[14px] font-semibold tracking-tight text-[var(--foreground)]">HOTELIA</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/chambres" className="text-[13px] font-medium text-[var(--foreground-soft)] hover:text-[var(--primary)] transition-colors">
            Chambres
          </Link>
          <Link href="/services" className="text-[13px] font-medium text-[var(--foreground-soft)] hover:text-[var(--primary)] transition-colors">
            Services
          </Link>
          <Link href="/contact" className="text-[13px] font-medium text-[var(--foreground-soft)] hover:text-[var(--primary)] transition-colors">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden sm:flex items-center gap-4">
              <span className="text-[13px] text-[var(--muted)]">{user.email}</span>
              <Link href="/mes-reservations">
                <Button variant="ghost" size="sm" className="hidden sm:flex border border-[var(--line)]">
                  Mes réservations
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/connexion">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <User size={14} className="mr-2" />
                Espace Client
              </Button>
            </Link>
          )}
          <Link href="/chambres">
            <Button size="sm">Réserver</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
