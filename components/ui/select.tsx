import * as React from "react";
import { cn } from "@/lib/utils/cn";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  placeholder?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, placeholder, ...props }, ref) => {
    const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--muted)]"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-9 w-full appearance-none rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)]",
            "px-3 pr-8 text-[13px] text-[var(--foreground)]",
            "transition-colors duration-150 cursor-pointer",
            "focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary-border)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-[var(--error)]",
            className,
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A847C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        {error && (
          <p className="text-[12px] text-[var(--error)]">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
