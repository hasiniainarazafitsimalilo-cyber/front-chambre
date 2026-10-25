"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export default function ConnexionPageRoute() {
  return (
    <Suspense fallback={
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-[var(--background-alt)]" />
        <div className="h-12 w-full rounded-xl bg-[var(--background-alt)]" />
        <div className="h-12 w-full rounded-xl bg-[var(--background-alt)]" />
        <div className="h-12 w-full rounded-xl bg-[var(--background-alt)]" />
      </div>
    }>
      <ConnexionPage />
    </Suspense>
  );
}

function ConnexionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setError("");
    setIsLoading(true);
    try {
      await login(data);
      const redirect = searchParams.get("from") || "/dashboard";
      router.push(redirect);
    } catch {
      setError("Identifiants incorrects. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="mb-8">
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em]"
          style={{ background: "var(--primary-soft)", color: "var(--primary-dark)" }}
        >
          Espace sécurisé
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
          Bon retour 👋
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Connectez-vous pour accéder à votre espace Hotelia.
        </p>
      </div>

      {/* ── Formulaire ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
            Adresse email
          </label>
          <div className="relative">
            <Mail
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="email"
              placeholder="nom@exemple.com"
              autoComplete="email"
              {...register("email")}
              className="w-full rounded-xl border bg-[var(--surface)] py-3 pl-10 pr-4 text-sm text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--muted-light)]"
              style={{
                borderColor: errors.email ? "var(--error)" : "var(--line)",
                boxShadow: errors.email ? "0 0 0 3px rgba(185,64,64,0.08)" : undefined,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--primary-soft)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = errors.email ? "var(--error)" : "var(--line)"; e.currentTarget.style.boxShadow = errors.email ? "0 0 0 3px rgba(185,64,64,0.08)" : "none"; }}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--error)]">
              <AlertCircle size={11} /> {errors.email.message}
            </p>
          )}
        </div>

        {/* Mot de passe */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
              Mot de passe
            </label>
            <Link
              href="#"
              className="text-[11px] font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--primary-dark)" }}
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <Lock
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
              className="w-full rounded-xl border bg-[var(--surface)] py-3 pl-10 pr-11 text-sm text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--muted-light)]"
              style={{
                borderColor: errors.password ? "var(--error)" : "var(--line)",
                boxShadow: errors.password ? "0 0 0 3px rgba(185,64,64,0.08)" : undefined,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--primary-soft)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = errors.password ? "var(--error)" : "var(--line)"; e.currentTarget.style.boxShadow = errors.password ? "0 0 0 3px rgba(185,64,64,0.08)" : "none"; }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--error)]">
              <AlertCircle size={11} /> {errors.password.message}
            </p>
          )}
        </div>

        {/* Erreur globale */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm"
            style={{
              background: "var(--error-soft)",
              borderColor: "rgba(185,64,64,0.2)",
              color: "var(--error)",
            }}>
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Bouton */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "var(--primary-dark)" }}
          >
            {/* Shimmer */}
            <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/10 transition-transform duration-700 group-hover:translate-x-[200%]" />
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Connexion en cours…
              </>
            ) : (
              <>
                Se connecter
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── Séparateur ── */}
      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--line)]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[var(--background)] px-3 text-[11px] text-[var(--muted)]">
            Pas encore de compte ?
          </span>
        </div>
      </div>

      {/* ── Lien inscription ── */}
      <Link
        href="/inscription"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] py-3 text-sm font-medium text-[var(--foreground)] transition-all hover:border-[var(--primary)] hover:shadow-[var(--shadow-sm)]"
      >
        Créer un compte
        <ArrowRight size={14} className="text-[var(--muted)]" />
      </Link>
    </div>
  );
}
