import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./button";

type EmptyStateProps = {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: React.ReactNode;
};

export function EmptyState({
  title = "Aucun résultat",
  description = "Il n'y a rien à afficher pour le moment.",
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--background-alt)] text-[var(--muted)]">
          {icon}
        </div>
      )}
      <p className="text-[13px] font-medium text-[var(--foreground-soft)]">{title}</p>
      <p className="mt-1 text-[12px] text-[var(--muted)] max-w-xs">{description}</p>
      {action && (
        <div className="mt-5">
          <Button size="sm" variant="secondary" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Une erreur est survenue",
  description = "Impossible de charger les données. Veuillez réessayer.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--error-soft)] text-[var(--error)]">
        <AlertTriangle size={20} />
      </div>
      <p className="text-[13px] font-medium text-[var(--foreground-soft)]">{title}</p>
      <p className="mt-1 text-[12px] text-[var(--muted)] max-w-xs">{description}</p>
      {onRetry && (
        <div className="mt-5">
          <Button size="sm" variant="secondary" onClick={onRetry}>
            <RefreshCw size={12} />
            Réessayer
          </Button>
        </div>
      )}
    </div>
  );
}
