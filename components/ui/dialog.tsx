"use client";

import * as React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
}: DialogProps) {
  // Trap focus and close on Escape
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden
          />
          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "dialog-title" : undefined}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "relative z-10 w-full rounded-[var(--radius-lg)] bg-[var(--surface)] shadow-[var(--shadow-lg)]",
              "border border-[var(--line)] overflow-hidden",
              size === "sm" && "max-w-sm",
              size === "md" && "max-w-lg",
              size === "lg" && "max-w-2xl",
              className,
            )}
          >
            {/* Header */}
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-6 py-5">
                <div>
                  {title && (
                    <h2
                      id="dialog-title"
                      className="text-[15px] font-semibold text-[var(--foreground)]"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-[13px] text-[var(--muted)]">{description}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Fermer"
                  className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--muted)] hover:bg-[var(--background-alt)] hover:text-[var(--foreground)] transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            )}
            {/* Body */}
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger";
  loading?: boolean;
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmer",
  confirmVariant = "primary",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description} size="sm">
      <div className="flex items-center justify-end gap-2 mt-2">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button variant={confirmVariant} size="sm" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
