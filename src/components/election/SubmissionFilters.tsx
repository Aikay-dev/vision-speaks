"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input, Select } from "./ui";

export default function SubmissionFilters({ lgas }: { lgas: { id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");

  const push = (patch: Record<string, string>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    router.replace(`${pathname}?${next}`, { scroll: false });
  };

  // Debounced search.
  useEffect(() => {
    if (q === (sp.get("q") ?? "")) return;
    const t = setTimeout(() => push({ q }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="flex flex-col gap-2 border-b border-el-border p-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-el-muted" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search polling unit or agent…" className="pl-9" />
      </div>
      <Select value={sp.get("lga") ?? ""} onChange={(e) => push({ lga: e.target.value })} className="sm:w-48" aria-label="Filter by LGA">
        <option value="">All LGAs</option>
        {lgas.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
      </Select>
      <label className="flex items-center gap-2 whitespace-nowrap px-1 text-sm text-el-muted">
        <input type="checkbox" checked={sp.get("comments") === "1"} onChange={(e) => push({ comments: e.target.checked ? "1" : "" })} className="size-4 accent-[var(--el-brand)]" />
        Has comment
      </label>
    </div>
  );
}
