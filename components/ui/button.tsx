import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        // Base
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1",
        "disabled:pointer-events-none disabled:opacity-50",
        "select-none whitespace-nowrap",
        // Variants
        variant === "primary" &&
          "bg-[var(--primary)] text-[var(--foreground)] hover:bg-[var(--primary-dark)] rounded-[var(--radius-md)]",
        variant === "secondary" &&
          "bg-[var(--background-alt)] text-[var(--foreground)] hover:bg-[var(--line-strong)] rounded-[var(--radius-md)] border border-[var(--line)]",
        variant === "ghost" &&
          "bg-transparent text-[var(--foreground-soft)] hover:bg-[var(--background-alt)] rounded-[var(--radius-md)]",
        variant === "danger" &&
          "bg-[var(--error-soft)] text-[var(--error)] hover:bg-[rgba(185,64,64,0.14)] rounded-[var(--radius-md)] border border-[rgba(185,64,64,0.2)]",
        variant === "outline" &&
          "bg-transparent border border-[var(--line)] text-[var(--foreground-soft)] hover:border-[var(--primary)] hover:text-[var(--primary)] rounded-[var(--radius-md)]",
        // Sizes
        size === "xs" && "h-7 px-2.5 text-xs",
        size === "sm" && "h-8 px-3 text-[13px]",
        size === "md" && "h-9 px-4 text-[13px]",
        size === "lg" && "h-10 px-5 text-sm",
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="h-3.5 w-3.5 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
