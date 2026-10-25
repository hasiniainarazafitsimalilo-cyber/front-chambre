"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, User as UserIcon, Phone, MapPin, Globe, ArrowRight, CreditCard, AlertCircle } from "lucide-react";

import { apiRequest } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const registerSchema = z.object({
  first_name: z.string().min(2, "Prénom requis (2 min)"),
  last_name: z.string().min(2, "Nom requis (2 min)"),
  email: z.string().email("Adresse email invalide"),
  password: z
    .string()
    .min(8, "Mot de passe trop court (8 min)")
    .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Doit contenir au moins un chiffre"),
  phone: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  id_document_type: z.string().optional(),
  id_document_number: z.string().optional(),
});

const SELECT_CLASS =
  "h-9 w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-3 text-[13px] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary-border)] transition-colors";

export default function InscriptionPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    setError("");
    setIsLoading(true);
    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      await login({ email: data.email, password: data.password });
      toast.success("Compte créé avec succès !");
      router.push("/");
    } catch (err: any) {
      setError(
        err.message ||
          "Erreur lors de l'inscription. L'email est peut-être déjà utilisé."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em]"
          style={{ background: "var(--primary-soft)", color: "var(--primary-dark)" }}
        >
          Nouveau compte
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
          Créer un compte
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Rejoignez-nous pour gérer vos séjours plus facilement.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ─── Identité ─── */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Prénom *"
            leftIcon={<UserIcon size={15} />}
            error={errors.first_name?.message}
            {...register("first_name")}
          />
          <Input
            label="Nom *"
            leftIcon={<UserIcon size={15} />}
            error={errors.last_name?.message}
            {...register("last_name")}
          />
        </div>

        {/* ─── Email + Mot de passe ─── */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="email"
            label="Email *"
            placeholder="nom@exemple.com"
            leftIcon={<Mail size={15} />}
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            type="password"
            label="Mot de passe *"
            placeholder="••••••••"
            leftIcon={<Lock size={15} />}
            showPasswordToggle
            hint="8 car. min, 1 majuscule, 1 chiffre"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        {/* ─── Contact ─── */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Téléphone"
            placeholder="+261 XX XX XXX XX"
            leftIcon={<Phone size={15} />}
            {...register("phone")}
          />
          <Input
            label="Pays"
            placeholder="Madagascar"
            leftIcon={<Globe size={15} />}
            {...register("country")}
          />
        </div>

        <Input
          label="Adresse"
          placeholder="Rue, Ville, Code postal"
          leftIcon={<MapPin size={15} />}
          {...register("address")}
        />

        {/* ─── Pièce d'identité ─── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--muted)]">
              Type de pièce
            </label>
            <select className={SELECT_CLASS} {...register("id_document_type")}>
              <option value="">-- Sélectionner --</option>
              <option value="CNI">Carte Nationale d'Identité</option>
              <option value="PASSPORT">Passeport</option>
              <option value="PERMIS">Permis de conduire</option>
            </select>
          </div>
          <Input
            label="N° de pièce"
            placeholder="123456789"
            leftIcon={<CreditCard size={15} />}
            {...register("id_document_number")}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm"
            style={{ background: "var(--error-soft)", borderColor: "rgba(185,64,64,0.2)", color: "var(--error)" }}>
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "var(--primary-dark)" }}
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/10 transition-transform duration-700 group-hover:translate-x-[200%]" />
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Création en cours…
              </>
            ) : (
              <>
                Créer mon compte
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--line)]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[var(--background)] px-3 text-[11px] text-[var(--muted)]">Déjà un compte ?</span>
        </div>
      </div>

      <Link
        href="/connexion"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] py-3 text-sm font-medium text-[var(--foreground)] transition-all hover:border-[var(--primary)] hover:shadow-[var(--shadow-sm)]"
      >
        Se connecter
        <ArrowRight size={14} className="text-[var(--muted)]" />
      </Link>
    </div>
  );
}
