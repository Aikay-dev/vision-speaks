"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Download, MessageCircle, X } from "lucide-react";
import { Button, buttonClass } from "../ui";

export type Credentials = { name: string; phone: string; pu: string; username: string; password: string };

function loginUrl() {
  return typeof window === "undefined" ? "" : `${window.location.origin}/election`;
}

function message(c: Credentials) {
  return [
    `Hello ${c.name}, here are your election monitoring login details.`,
    ``,
    `Polling unit: ${c.pu}`,
    `Sign in at: ${loginUrl()}`,
    `Username: ${c.username}`,
    `Password: ${c.password}`,
    ``,
    `Keep these private. On election day, sign in, photograph the result sheet and enter the scores.`,
  ].join("\n");
}

/** Nigerian numbers → international format for wa.me (0803… → 234803…). */
function waNumber(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("234")) return d;
  if (d.startsWith("0")) return `234${d.slice(1)}`;
  return d;
}

/** Shows freshly generated passwords. They're never retrievable again, so this is the one chance to share them. */
export default function CredentialsDialog({ list, onClose }: { list: Credentials[]; onClose: () => void }) {
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const csv =
    "name,phone,polling_unit,username,password,login_url\n" +
    list.map((c) => [c.name, c.phone, c.pu, c.username, c.password, loginUrl()].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="creds-title">
      <div className="max-h-[90dvh] w-full max-w-lg overflow-hidden rounded-2xl border border-el-border bg-el-surface shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-el-border px-5 py-4">
          <div>
            <h2 id="creds-title" className="font-bold">{list.length === 1 ? "Login details" : `${list.length} agents created`}</h2>
            <p className="mt-0.5 text-xs text-el-warn">Passwords are only shown now. Share or download them before closing.</p>
          </div>
          <button onClick={onClose} aria-label="Close"><X className="size-5 text-el-muted" /></button>
        </header>

        <div className="max-h-[55dvh] divide-y divide-el-border overflow-y-auto">
          {list.map((c, i) => (
            <div key={c.username} className="space-y-2 px-5 py-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold">{c.name}</span>
                <span className="truncate text-xs text-el-muted">{c.pu}</span>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg bg-el-surface-2 px-3 py-2 font-mono text-sm">
                <dt className="text-el-muted">Username</dt><dd className="select-all">{c.username}</dd>
                <dt className="text-el-muted">Password</dt><dd className="select-all font-semibold">{c.password}</dd>
              </dl>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    await navigator.clipboard.writeText(message(c));
                    setCopied(i);
                    setTimeout(() => setCopied(null), 1500);
                  }}
                >
                  {copied === i ? <Check className="size-3.5 text-el-ok" /> : <Copy className="size-3.5" />}
                  {copied === i ? "Copied" : "Copy message"}
                </Button>
                <a
                  href={`https://wa.me/${c.phone ? waNumber(c.phone) : ""}?text=${encodeURIComponent(message(c))}`}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass("secondary", "sm")}
                >
                  <MessageCircle className="size-3.5 text-[#25D366]" /> Send on WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>

        <footer className="flex flex-wrap justify-between gap-2 border-t border-el-border px-5 py-4">
          <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`} download="agent-credentials.csv" className={buttonClass("secondary", "md")}>
            <Download className="size-4" /> Download CSV
          </a>
          <Button onClick={onClose}>Done</Button>
        </footer>
      </div>
    </div>
  );
}
