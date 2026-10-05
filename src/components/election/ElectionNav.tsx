"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ClipboardCheck, Download, LayoutDashboard, Settings2, Users } from "lucide-react";
import { cx } from "./ui";

export default function ElectionNav({ electionId, flagged }: { electionId: string; flagged: number }) {
  const pathname = usePathname();
  const base = `/election/admin/${electionId}`;
  const items = [
    { href: base, label: "Overview", icon: LayoutDashboard, exact: true },
    { href: `${base}/results`, label: "Results", icon: BarChart3 },
    { href: `${base}/submissions`, label: "Submissions", icon: ClipboardCheck, badge: flagged },
    { href: `${base}/agents`, label: "Agents", icon: Users },
    { href: `${base}/setup`, label: "Setup", icon: Settings2 },
  ];
  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="sticky top-24 hidden h-fit space-y-0.5 lg:block">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={cx(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
              active(it.href, it.exact) ? "bg-el-brand/10 text-el-brand" : "text-el-muted hover:bg-el-surface hover:text-el-text",
            )}
          >
            <it.icon className="size-4" />
            {it.label}
            {!!it.badge && (
              <span className="num ml-auto rounded-full bg-el-warn px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {it.badge}
              </span>
            )}
          </Link>
        ))}
        <a
          href={`${base}/export`}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-el-muted transition hover:bg-el-surface hover:text-el-text"
        >
          <Download className="size-4" />
          Export CSV
        </a>
      </nav>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-el-border bg-el-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={cx(
              "relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
              active(it.href, it.exact) ? "text-el-brand" : "text-el-muted",
            )}
          >
            <it.icon className="size-5" />
            {it.label}
            {!!it.badge && <span className="absolute right-1/4 top-1.5 size-2 rounded-full bg-el-warn" />}
          </Link>
        ))}
      </nav>
    </>
  );
}
