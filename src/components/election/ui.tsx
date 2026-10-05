import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { STATUS_LABELS } from "@/lib/election/constants";

/** clsx + tailwind-merge, so a className passed in overrides the component default (e.g. w-28 over w-full). */
export const cx = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-el-brand text-white hover:brightness-110 shadow-sm",
  secondary: "bg-el-surface text-el-text border border-el-border hover:bg-el-surface-2",
  ghost: "text-el-muted hover:text-el-text hover:bg-el-surface-2",
  danger: "bg-el-surface text-el-danger border border-el-border hover:border-el-danger",
};

export function buttonClass(variant: ButtonVariant = "primary", size: "sm" | "md" | "lg" = "md") {
  return cx(
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-el-brand",
    "disabled:opacity-50 disabled:pointer-events-none",
    size === "sm" && "h-8 px-3 text-sm",
    size === "md" && "h-10 px-4 text-sm",
    size === "lg" && "h-14 px-6 text-base",
    buttonStyles[variant],
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: "sm" | "md" | "lg" }) {
  return <button className={cx(buttonClass(variant, size), className)} {...props} />;
}

const fieldBase =
  "w-full rounded-lg border border-el-border bg-el-surface px-3 text-el-text placeholder:text-el-muted/70 " +
  "focus:outline-none focus:ring-2 focus:ring-el-brand/40 focus:border-el-brand transition";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(fieldBase, "h-10 text-sm", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(fieldBase, "py-2 text-sm min-h-24", className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx(fieldBase, "h-10 text-sm pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cx("block space-y-1.5", className)}>
      <span className="text-[13px] font-medium text-el-text">{label}</span>
      {children}
      {hint && <span className="block text-xs text-el-muted">{hint}</span>}
    </label>
  );
}

export function Card({ children, className, title, action }: { children: ReactNode; className?: string; title?: ReactNode; action?: ReactNode }) {
  return (
    <section className={cx("rounded-xl border border-el-border bg-el-surface", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-el-border px-5 py-3.5">
          <h2 className="text-sm font-semibold">{title}</h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

const statusTone: Record<string, string> = {
  setup: "bg-el-surface-2 text-el-muted border-el-border",
  live: "bg-el-ok/10 text-el-ok border-el-ok/30",
  closed: "bg-el-surface-2 text-el-muted border-el-border",
  submitted: "bg-el-surface-2 text-el-text border-el-border",
  flagged: "bg-el-warn/10 text-el-warn border-el-warn/30",
  verified: "bg-el-ok/10 text-el-ok border-el-ok/30",
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        statusTone[status] ?? statusTone.submitted,
        className,
      )}
    >
      {status === "live" && <span className="el-live-dot size-1.5 rounded-full bg-current" />}
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function PartyChip({ code, color, className }: { code: string; color: string; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 text-xs font-semibold", className)}>
      <span className="size-2.5 rounded-sm" style={{ background: color }} />
      {code}
    </span>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <p className="font-semibold">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-el-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-el-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function fmt(n: number) {
  return n.toLocaleString("en-NG");
}

export function pct(n: number, digits = 1) {
  return `${(n * 100).toFixed(digits)}%`;
}

export function timeAgo(iso: string | Date) {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}
