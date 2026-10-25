"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BookingRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/chambres");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center text-[var(--muted)] text-sm">
      Redirection vers les chambres...
    </div>
  );
}
