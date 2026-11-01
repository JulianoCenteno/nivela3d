import { CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[1.75rem] font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Flash({ ok, erro }: { ok?: string; erro?: string }) {
  if (!ok && !erro) return null;
  return (
    <div
      role="status"
      className={`mb-6 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
        erro ? "bg-negative-soft text-negative" : "bg-primary-soft text-primary"
      }`}
    >
      {erro ? <AlertCircle size={18} className="mt-px shrink-0" /> : <CheckCircle2 size={18} className="mt-px shrink-0" />}
      {erro ?? ok}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="card p-5">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p
        className={`tnum mt-2 text-[1.65rem] font-extrabold tracking-tight ${
          tone === "negative" ? "text-negative" : tone === "positive" ? "text-positive" : ""
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Empty({
  icon,
  title,
  text,
  href,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 rounded-2xl bg-primary-soft p-4 text-primary">{icon}</div>
      <p className="text-lg font-bold">{title}</p>
      <p className="mt-1 max-w-sm text-muted">{text}</p>
      {href && cta && (
        <Link href={href} className="btn-primary mt-6">
          {cta}
        </Link>
      )}
    </div>
  );
}

export function Field({
  label,
  name,
  hint,
  suffix,
  prefix,
  className = "",
  ...props
}: {
  label: string;
  name: string;
  hint?: string;
  suffix?: string;
  prefix?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-muted">
            {prefix}
          </span>
        )}
        <input
          id={name}
          name={name}
          className={`input tnum ${prefix ? "pl-10" : ""} ${suffix ? "pr-14" : ""}`}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-muted">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

/** Formata número para valor inicial de input pt-BR. */
export const dv = (v: number | null | undefined) =>
  v == null ? "" : String(Math.round(Number(v) * 10000) / 10000).replace(".", ",");
