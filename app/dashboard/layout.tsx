import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Dashboard | HOTELIA",
    template: "%s | HOTELIA",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* ─── Fixed Sidebar ─── */}
      <DashboardSidebar />

      {/* ─── Main area — offset by sidebar width ─── */}
      <div
        className="flex flex-1 flex-col"
        style={{ marginLeft: "var(--sidebar-w)" }}
      >
        {/* ─── Fixed Header ─── */}
        <DashboardHeader />

        {/* ─── Scrollable content ─── */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ paddingTop: "var(--header-h)" }}
        >
          <div className="min-h-full px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
