"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { useState } from "react";
import { INEC_PARTIES } from "@/lib/election/constants";
import { Button, cx, Input } from "./ui";

export type PartyRow = { code: string; name: string; candidateName: string; color: string; logo: string };

/**
 * Pick parties from the INEC list (or add a custom one), set candidate names,
 * colours and ballot order. Controlled: the parent owns the list.
 */
export default function PartyEditor({ value, onChange }: { value: PartyRow[]; onChange: (rows: PartyRow[]) => void }) {
  const [custom, setCustom] = useState({ code: "", name: "" });
  const selected = new Set(value.map((p) => p.code));
  const available = INEC_PARTIES.filter((p) => !selected.has(p.code));

  const update = (i: number, patch: Partial<PartyRow>) => onChange(value.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...value];
    const [row] = next.splice(i, 1);
    next.splice(i + d, 0, row);
    onChange(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-[13px] font-medium">On the ballot ({value.length})</p>
        {value.length === 0 ? (
          <p className="rounded-lg border border-dashed border-el-border px-4 py-6 text-center text-sm text-el-muted">
            Tap parties below to add them.
          </p>
        ) : (
          <ul className="divide-y divide-el-border overflow-hidden rounded-lg border border-el-border bg-el-surface">
            {value.map((p, i) => (
              <li key={p.code} className="flex flex-wrap items-center gap-3 px-3 py-2.5 sm:flex-nowrap">
                <div className="flex flex-col">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="text-el-muted hover:text-el-text disabled:opacity-25" aria-label={`Move ${p.code} up`}>
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="text-el-muted hover:text-el-text disabled:opacity-25" aria-label={`Move ${p.code} down`}>
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>
                <PartyLogo party={p} />
                <div className="w-28 shrink-0 sm:w-40">
                  <div className="text-sm font-bold">{p.code}</div>
                  <div className="truncate text-xs text-el-muted">{p.name}</div>
                </div>
                <Input
                  value={p.candidateName}
                  onChange={(e) => update(i, { candidateName: e.target.value })}
                  placeholder="Candidate name (optional)"
                  className="min-w-40 flex-1"
                />
                <label className="flex items-center gap-1.5 text-xs text-el-muted" title="Chart colour">
                  <input
                    type="color"
                    value={p.color}
                    onChange={(e) => update(i, { color: e.target.value.toUpperCase() })}
                    className="size-8 cursor-pointer rounded border border-el-border bg-transparent"
                    aria-label={`${p.code} chart colour`}
                  />
                </label>
                <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="grid size-8 place-items-center rounded-md text-el-muted hover:bg-el-surface-2 hover:text-el-danger" aria-label={`Remove ${p.code}`}>
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="mb-2 text-[13px] font-medium">INEC-registered parties</p>
        <div className="flex flex-wrap gap-2">
          {available.map((p) => (
            <button
              key={p.code}
              type="button"
              onClick={() => onChange([...value, { ...p, candidateName: "" }])}
              className="inline-flex items-center gap-2 rounded-full border border-el-border bg-el-surface py-1 pl-1 pr-3 text-sm transition hover:border-el-brand"
              title={p.name}
            >
              <PartyLogo party={p} size={24} />
              <span className="font-semibold">{p.code}</span>
              <Plus className="size-3.5 text-el-muted" />
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <Input value={custom.code} onChange={(e) => setCustom({ ...custom, code: e.target.value })} placeholder="Code" className="w-24" maxLength={10} />
          <Input value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} placeholder="Party not listed? Full name" className="min-w-52 flex-1" />
          <Button
            type="button"
            variant="secondary"
            disabled={!custom.code.trim() || !custom.name.trim() || selected.has(custom.code.trim().toUpperCase())}
            onClick={() => {
              onChange([...value, { code: custom.code.trim().toUpperCase(), name: custom.name.trim(), candidateName: "", color: "#64748B", logo: "" }]);
              setCustom({ code: "", name: "" });
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PartyLogo({ party, size = 32, className }: { party: { code: string; color: string; logo: string }; size?: number; className?: string }) {
  if (party.logo) {
    return (
      <span className={cx("shrink-0 overflow-hidden rounded bg-white", className)} style={{ width: size, height: size }}>
        <Image src={party.logo} alt={`${party.code} logo`} width={size} height={size} className="h-full w-full object-contain" />
      </span>
    );
  }
  return (
    <span
      className={cx("grid shrink-0 place-items-center rounded text-[10px] font-bold text-white", className)}
      style={{ width: size, height: size, background: party.color }}
    >
      {party.code.slice(0, 3)}
    </span>
  );
}
