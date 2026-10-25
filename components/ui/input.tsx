"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** When true and type="password", renders an eye toggle button automatically */
  showPasswordToggle?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, type, showPasswordToggle, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const [showPassword, setShowPassword] = React.useState(false);

    const isPasswordField = type === "password";
    const resolvedType = isPasswordField && showPassword ? "text" : type;
    const hasRightAddon = rightIcon || (isPasswordField && showPasswordToggle);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--muted)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={cn(
              "h-9 w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)]",
              "px-3 text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-light)]",
              "transition-colors duration-150",
              "focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary-border)]",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--background-alt)]",
              error && "border-[var(--error)] focus:border-[var(--error)] focus:ring-[rgba(185,64,64,0.2)]",
              leftIcon && "pl-9",
              hasRightAddon && "pr-9",
              className,
            )}
            {...props}
          />
          {/* Custom right icon (non-password) */}
          {rightIcon && !(isPasswordField && showPasswordToggle) && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              {rightIcon}
            </span>
          )}
          {/* Password eye toggle */}
          {isPasswordField && showPasswordToggle && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors focus:outline-none"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-[12px] text-[var(--error)]">{error}</p>
        )}
        {hint && !error && (
          <p className="text-[12px] text-[var(--muted)]">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
