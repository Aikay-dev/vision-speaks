"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import NIGERIA from "@/data/nigeria-states-lgas.json";
import { cx, Select } from "./ui";

export type LgaPick = { state: string; name: string };

/** State dropdown → LGA checkboxes. `locked` LGAs are shown ticked and can't be unticked (already in the election). */
export default function LgaPicker({
  value,
  onChange,
  locked = [],
}: {
  value: LgaPick[];
  onChange: (v: LgaPick[]) => void;
  locked?: LgaPick[];
}) {
  const [state, setState] = useState(value[0]?.state ?? locked[0]?.state ?? "");
  const lgas = NIGERIA.find((s) => s.name === state)?.lgas ?? [];
  const key = (l: LgaPick) => `${l.state}|${l.name}`;
  const picked = new Set(value.map(key));
  const lockedSet = new Set(locked.map(key));
  const inState = lgas.filter((n) => !lockedSet.has(`${state}|${n}`));
  const allPicked = inState.length > 0 && inState.every((n) => picked.has(`${state}|${n}`));

  const toggle = (name: string) => {
    const k = `${state}|${name}`;
    onChange(picked.has(k) ? value.filter((l) => key(l) !== k) : [...value, { state, name }]);
  };

  const countFor = (s: string) => value.filter((l) => l.state === s).length + locked.filter((l) => l.state === s).length;

  return (
    <div className="space-y-4">
      <Select value={state} onChange={(e) => setState(e.target.value)} aria-label="State">
        <option value="">Choose a state…</option>
        {NIGERIA.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name === "FCT" ? "FCT (Abuja)" : s.name}
            {countFor(s.name) ? ` · ${countFor(s.name)} selected` : ""}
          </option>
        ))}
      </Select>

      {state && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[13px] font-medium">
              {state} · {lgas.length} LGAs
            </p>
            {inState.length > 0 && (
              <button
                type="button"
                className="text-xs font-semibold text-el-brand hover:underline"
                onClick={() =>
                  onChange(
                    allPicked
                      ? value.filter((l) => l.state !== state)
                      : [...value.filter((l) => l.state !== state), ...inState.map((name) => ({ state, name }))],
                  )
                }
              >
                {allPicked ? "Clear all" : "Select all"}
              </button>
            )}
          </div>
          <div className="grid max-h-80 grid-cols-1 gap-1.5 overflow-y-auto rounded-lg border border-el-border bg-el-surface p-2 sm:grid-cols-2 lg:grid-cols-3">
            {lgas.map((name) => {
              const isLocked = lockedSet.has(`${state}|${name}`);
              const on = isLocked || picked.has(`${state}|${name}`);
              return (
                <button
                  key={name}
                  type="button"
                  disabled={isLocked}
                  onClick={() => toggle(name)}
                  className={cx(
                    "flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition",
                    on ? "bg-el-brand/10 font-medium text-el-text" : "hover:bg-el-surface-2",
                    isLocked && "opacity-60",
                  )}
                >
                  <span className={cx("grid size-4 shrink-0 place-items-center rounded border", on ? "border-el-brand bg-el-brand text-white" : "border-el-border")}>
                    {on && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {value.length > 0 && (
        <p className="text-xs text-el-muted">
          {value.length} LGA{value.length === 1 ? "" : "s"} selected across {new Set(value.map((l) => l.state)).size} state(s)
        </p>
      )}
    </div>
  );
}
