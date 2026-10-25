import { cn } from "@/lib/utils/cn";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "muted";

const STATUS_MAP: Record<string, BadgeVariant> = {
  // Room status
  AVAILABLE: "success",
  RESERVED: "info",
  OCCUPIED: "primary",
  CLEANING: "warning",
  MAINTENANCE: "error",
  OUT_OF_SERVICE: "muted",
  // Reservation status
  PENDING: "warning",
  CONFIRMED: "info",
  CANCELLED: "muted",
  COMPLETED: "success",
  NO_SHOW: "error",
  // Payment status
  PAID: "success",
  FAILED: "error",
  REFUNDED: "muted",
  PARTIALLY_REFUNDED: "warning",
  // Task status
  IN_PROGRESS: "primary",
  // Maintenance status
  OPEN: "error",
  RESOLVED: "success",
};

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default: "bg-[var(--background-alt)] text-[var(--foreground-soft)]",
  primary: "bg-[var(--primary-soft)] text-[var(--primary-dark)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  error: "bg-[var(--error-soft)] text-[var(--error)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
  muted: "bg-[var(--background-alt)] text-[var(--muted)]",
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Réservée",
  OCCUPIED: "Occupée",
  CLEANING: "Nettoyage",
  MAINTENANCE: "Maintenance",
  OUT_OF_SERVICE: "Hors service",
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
  NO_SHOW: "Non présenté",
  PAID: "Payé",
  FAILED: "Échoué",
  REFUNDED: "Remboursé",
  PARTIALLY_REFUNDED: "Part. remboursé",
  IN_PROGRESS: "En cours",
  OPEN: "Ouvert",
  RESOLVED: "Résolu",
};

type BadgeProps = {
  children?: React.ReactNode;
  status?: string;
  variant?: BadgeVariant;
  className?: string;
};

export function Badge({ children, status, variant, className }: BadgeProps) {
  const resolvedVariant = variant ?? (status ? STATUS_MAP[status] ?? "default" : "default");
  const label = children ?? (status ? STATUS_LABELS[status] ?? status : "");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5",
        "text-[11px] font-medium uppercase tracking-[0.05em]",
        "whitespace-nowrap",
        VARIANT_STYLES[resolvedVariant],
        className,
      )}
    >
      {label}
    </span>
  );
}
