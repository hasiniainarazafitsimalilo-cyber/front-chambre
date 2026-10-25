import { PublicHeader } from "@/components/layout/public-header";
import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <PublicHeader />
      <main className="flex-1 pt-[var(--header-h)]">
        {children}
      </main>
      <footer id="contact" className="border-t border-[var(--line)] bg-[var(--background-alt)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 text-sm text-[var(--muted)] lg:grid-cols-[1fr_auto_auto] lg:px-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--primary)]">Hotelia</p>
            <p className="mt-4 max-w-md leading-7">Un séjour pensé pour les voyageurs exigeants, les séjours d'affaires et les expériences de vie au rythme doux d'Antananarivo.</p>
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)]">Navigation</p>
            <ul className="mt-4 space-y-2">
              <li><Link href="/chambres">Chambres</Link></li>
              <li><Link href="/services">Services</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/dashboard">Dashboard (Admin)</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)]">Contact</p>
            <ul className="mt-4 space-y-2">
              <li>contact@hotelia.mg</li>
              <li>+261 34 00 000 00</li>
              <li>Antananarivo, Madagascar</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
