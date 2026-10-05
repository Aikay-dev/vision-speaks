"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LogOut, Moon, Sun } from "lucide-react";
import { logout } from "@/app/election/actions";
import type { PublicTenant } from "@/lib/election/tenants";

export default function AdminHeader({ tenant, initialTheme }: { tenant: PublicTenant; initialTheme: "light" | "dark" }) {
  const [theme, setTheme] = useState(initialTheme);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.cookie = `vs_el_theme=${next}; path=/election; max-age=31536000; samesite=lax`;
    document.querySelector(".el-root")?.setAttribute("data-theme", next);
  }

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-el-ink text-white">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6">
          <Link href="/election/admin" className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-white p-0.5">
              <Image src={tenant.logo} alt={`${tenant.name} logo`} width={40} height={40} className="h-full w-full object-contain" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-extrabold tracking-wide sm:text-base">
                {tenant.headerTitle}
              </span>
              <span className="hidden text-[11px] text-white/55 sm:block">{tenant.name} · Coordinator</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="grid size-9 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to Situation Room (dark) mode"}
              title={theme === "dark" ? "Light mode" : "Situation Room mode"}
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <form action={logout}>
              <button className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-white/70 hover:bg-white/10 hover:text-white">
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* Party flag stripe */}
      <div className="flex h-1">
        {tenant.stripe.map((c) => (
          <span key={c} className="flex-1" style={{ background: c }} />
        ))}
      </div>
    </header>
  );
}
