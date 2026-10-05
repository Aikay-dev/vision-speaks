"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronRight, Loader2, Pencil, Plus, Trash2, Upload, X, Check } from "lucide-react";
import {
  addLgas,
  addPollingUnit,
  addWard,
  deleteLocation,
  updateLocation,
} from "@/app/election/admin/actions";
import LgaPicker, { type LgaPick } from "../LgaPicker";
import LocationImport from "./LocationImport";
import { Button, Card, cx, EmptyState, fmt, Input } from "../ui";

export type LocNode = {
  id: string;
  level: "lga" | "ward" | "pu";
  name: string;
  code: string;
  state: string;
  lgaId?: string;
  wardId?: string;
  registeredVoters: number;
  hasAgent: boolean;
};

type Totals = { wards: number; pus: number; registered: number; covered: number };

export default function LocationsManager({ electionId, nodes }: { electionId: string; nodes: LocNode[] }) {
  const [openLga, setOpenLga] = useState<string | null>(null);
  const [openWard, setOpenWard] = useState<string | null>(null);
  const [panel, setPanel] = useState<"none" | "lgas" | "import">("none");
  const [newLgas, setNewLgas] = useState<LgaPick[]>([]);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const { lgas, wardsByLga, pusByWard, lgaTotals, wardTotals } = useMemo(() => {
    const lgas = nodes.filter((n) => n.level === "lga").sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name));
    const wardsByLga = new Map<string, LocNode[]>();
    const pusByWard = new Map<string, LocNode[]>();
    const lgaTotals = new Map<string, Totals>();
    const wardTotals = new Map<string, Totals>();
    for (const n of nodes) {
      if (n.level === "ward") wardsByLga.set(n.lgaId!, [...(wardsByLga.get(n.lgaId!) ?? []), n]);
      if (n.level === "pu") {
        pusByWard.set(n.wardId!, [...(pusByWard.get(n.wardId!) ?? []), n]);
        for (const [map, key] of [[lgaTotals, n.lgaId!], [wardTotals, n.wardId!]] as const) {
          const t = map.get(key) ?? { wards: 0, pus: 0, registered: 0, covered: 0 };
          t.pus++;
          t.registered += n.registeredVoters;
          if (n.hasAgent) t.covered++;
          map.set(key, t);
        }
      }
    }
    for (const [lgaId, wards] of wardsByLga) {
      const t = lgaTotals.get(lgaId) ?? { wards: 0, pus: 0, registered: 0, covered: 0 };
      t.wards = wards.length;
      lgaTotals.set(lgaId, t);
    }
    return { lgas, wardsByLga, pusByWard, lgaTotals, wardTotals };
  }, [nodes]);

  const totals = useMemo(() => {
    const pus = nodes.filter((n) => n.level === "pu");
    return {
      lgas: lgas.length,
      wards: nodes.filter((n) => n.level === "ward").length,
      pus: pus.length,
      registered: pus.reduce((s, p) => s + p.registeredVoters, 0),
      covered: pus.filter((p) => p.hasAgent).length,
    };
  }, [nodes, lgas]);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, onOk?: () => void) =>
    start(async () => {
      setError("");
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Something went wrong");
      else onOk?.();
    });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          ["LGAs", totals.lgas],
          ["Wards", totals.wards],
          ["Polling units", totals.pus],
          ["Registered voters", totals.registered],
          ["PUs with an agent", totals.covered],
        ].map(([label, v]) => (
          <div key={label} className="rounded-xl border border-el-border bg-el-surface px-4 py-3">
            <div className="text-xs text-el-muted">{label}</div>
            <div className="num mt-0.5 text-lg font-bold">
              {fmt(v as number)}
              {label === "PUs with an agent" && totals.pus > 0 && (
                <span className="ml-1 text-xs font-medium text-el-muted">/ {fmt(totals.pus)}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={panel === "lgas" ? "primary" : "secondary"} size="sm" onClick={() => setPanel(panel === "lgas" ? "none" : "lgas")}>
          <Plus className="size-3.5" /> Add LGAs
        </Button>
        <Button variant={panel === "import" ? "primary" : "secondary"} size="sm" onClick={() => setPanel(panel === "import" ? "none" : "import")}>
          <Upload className="size-3.5" /> Import wards &amp; polling units (CSV)
        </Button>
      </div>

      {panel === "lgas" && (
        <Card title="Add LGAs">
          <div className="space-y-4 p-5">
            <LgaPicker value={newLgas} onChange={setNewLgas} locked={lgas.map((l) => ({ state: l.state, name: l.name }))} />
            <Button
              disabled={!newLgas.length || pending}
              onClick={() => run(() => addLgas(electionId, newLgas), () => { setNewLgas([]); setPanel("none"); })}
            >
              {pending && <Loader2 className="size-4 animate-spin" />} Add {newLgas.length || ""} LGA{newLgas.length === 1 ? "" : "s"}
            </Button>
          </div>
        </Card>
      )}

      {panel === "import" && <LocationImport electionId={electionId} onDone={() => setPanel("none")} />}

      {error && (
        <p role="alert" className="flex items-center justify-between rounded-lg border border-el-danger/30 bg-el-danger/5 px-4 py-2.5 text-sm text-el-danger">
          {error}
          <button onClick={() => setError("")} aria-label="Dismiss"><X className="size-4" /></button>
        </p>
      )}

      <Card>
        {lgas.length === 0 ? (
          <EmptyState title="No LGAs yet" body="Add the LGAs you're covering, then their wards and polling units." />
        ) : (
          <ul className="divide-y divide-el-border">
            {lgas.map((lga) => {
              const t = lgaTotals.get(lga.id) ?? { wards: 0, pus: 0, registered: 0, covered: 0 };
              const open = openLga === lga.id;
              const wards = (wardsByLga.get(lga.id) ?? []).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
              return (
                <li key={lga.id}>
                  <div className="flex items-center gap-2 px-3 py-1 sm:px-4">
                    <button onClick={() => setOpenLga(open ? null : lga.id)} className="flex min-w-0 flex-1 items-center gap-3 py-2.5 text-left">
                      <ChevronRight className={cx("size-4 shrink-0 text-el-muted transition", open && "rotate-90")} />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{lga.name}</span>
                        <span className="text-xs text-el-muted">{lga.state}</span>
                      </span>
                      <span className="num ml-auto hidden gap-5 text-xs text-el-muted sm:flex">
                        <span>{fmt(t.wards)} wards</span>
                        <span>{fmt(t.pus)} PUs</span>
                        <span>{fmt(t.registered)} registered</span>
                        <Coverage covered={t.covered} total={t.pus} />
                      </span>
                    </button>
                    {t.wards === 0 && (
                      <IconBtn label={`Remove ${lga.name}`} onClick={() => run(() => deleteLocation(electionId, lga.id))}>
                        <Trash2 className="size-4" />
                      </IconBtn>
                    )}
                  </div>

                  {open && (
                    <div className="border-t border-el-border bg-el-surface-2 px-3 py-3 sm:px-6">
                      <AddRow
                        placeholder="New ward name, e.g. Ward 04 / Ogbunike"
                        withCode
                        pending={pending}
                        onAdd={(v) => run(() => addWard(electionId, lga.id, v))}
                        cta="Add ward"
                      />
                      {wards.length === 0 && <p className="py-4 text-center text-sm text-el-muted">No wards yet.</p>}
                      <ul className="mt-3 space-y-2">
                        {wards.map((ward) => {
                          const wt = wardTotals.get(ward.id) ?? { wards: 0, pus: 0, registered: 0, covered: 0 };
                          const wOpen = openWard === ward.id;
                          const pus = (pusByWard.get(ward.id) ?? []).sort((a, b) => (a.code || a.name).localeCompare(b.code || b.name, undefined, { numeric: true }));
                          return (
                            <li key={ward.id} className="overflow-hidden rounded-lg border border-el-border bg-el-surface">
                              <div className="flex items-center gap-2 px-3">
                                <button onClick={() => setOpenWard(wOpen ? null : ward.id)} className="flex min-w-0 flex-1 items-center gap-3 py-2.5 text-left text-sm">
                                  <ChevronRight className={cx("size-4 shrink-0 text-el-muted transition", wOpen && "rotate-90")} />
                                  <span className="truncate font-medium">
                                    {ward.name}
                                    {ward.code && <span className="ml-1.5 text-xs text-el-muted">{ward.code}</span>}
                                  </span>
                                  <span className="num ml-auto flex shrink-0 gap-4 text-xs text-el-muted">
                                    <span>{fmt(wt.pus)} PUs</span>
                                    <span className="hidden sm:inline">{fmt(wt.registered)} registered</span>
                                    <Coverage covered={wt.covered} total={wt.pus} />
                                  </span>
                                </button>
                                {wt.pus === 0 && (
                                  <IconBtn label={`Remove ${ward.name}`} onClick={() => run(() => deleteLocation(electionId, ward.id))}>
                                    <Trash2 className="size-4" />
                                  </IconBtn>
                                )}
                              </div>
                              {wOpen && (
                                <div className="border-t border-el-border">
                                  <table className="w-full text-sm">
                                    <thead className="bg-el-surface-2 text-left text-xs text-el-muted">
                                      <tr>
                                        <th className="px-3 py-2 font-medium">Code</th>
                                        <th className="px-3 py-2 font-medium">Polling unit</th>
                                        <th className="px-3 py-2 text-right font-medium">Registered</th>
                                        <th className="hidden px-3 py-2 font-medium sm:table-cell">Agent</th>
                                        <th className="w-20" />
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-el-border">
                                      {pus.map((pu) => (
                                        <PuRow key={pu.id} pu={pu} electionId={electionId} run={run} />
                                      ))}
                                    </tbody>
                                  </table>
                                  <div className="border-t border-el-border p-3">
                                    <AddRow
                                      placeholder="Polling unit name"
                                      withCode
                                      withVoters
                                      pending={pending}
                                      onAdd={(v) => run(() => addPollingUnit(electionId, ward.id, v))}
                                      cta="Add polling unit"
                                    />
                                  </div>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Coverage({ covered, total }: { covered: number; total: number }) {
  if (!total) return <span>No agents</span>;
  const full = covered === total;
  return (
    <span className={full ? "text-el-ok" : covered === 0 ? "" : "text-el-warn"}>
      {fmt(covered)}/{fmt(total)} agents
    </span>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="grid size-8 shrink-0 place-items-center rounded-md text-el-muted hover:bg-el-surface-2 hover:text-el-danger">
      {children}
    </button>
  );
}

function AddRow({
  placeholder,
  withCode,
  withVoters,
  pending,
  onAdd,
  cta,
}: {
  placeholder: string;
  withCode?: boolean;
  withVoters?: boolean;
  pending: boolean;
  onAdd: (v: { name: string; code: string; registeredVoters: number }) => void;
  cta: string;
}) {
  const [v, setV] = useState({ name: "", code: "", registeredVoters: "" });
  return (
    <form
      className="flex flex-wrap gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!v.name.trim()) return;
        onAdd({ name: v.name, code: v.code, registeredVoters: Number(v.registeredVoters) || 0 });
        setV({ name: "", code: "", registeredVoters: "" });
      }}
    >
      {withCode && <Input value={v.code} onChange={(e) => setV({ ...v, code: e.target.value })} placeholder="Code" className="w-28" />}
      <Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder={placeholder} className="min-w-48 flex-1" />
      {withVoters && (
        <Input
          value={v.registeredVoters}
          onChange={(e) => setV({ ...v, registeredVoters: e.target.value.replace(/\D/g, "") })}
          placeholder="Registered voters"
          inputMode="numeric"
          className="w-40"
        />
      )}
      <Button type="submit" variant="secondary" disabled={pending || !v.name.trim()}>
        <Plus className="size-4" /> {cta}
      </Button>
    </form>
  );
}

function PuRow({
  pu,
  electionId,
  run,
}: {
  pu: LocNode;
  electionId: string;
  run: (fn: () => Promise<{ ok: boolean; error?: string }>, onOk?: () => void) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState({ name: pu.name, code: pu.code, registeredVoters: String(pu.registeredVoters) });

  if (editing) {
    return (
      <tr className="bg-el-brand/5">
        <td className="px-2 py-1.5"><Input value={v.code} onChange={(e) => setV({ ...v, code: e.target.value })} className="h-8" /></td>
        <td className="px-2 py-1.5"><Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} className="h-8" /></td>
        <td className="px-2 py-1.5">
          <Input value={v.registeredVoters} onChange={(e) => setV({ ...v, registeredVoters: e.target.value.replace(/\D/g, "") })} inputMode="numeric" className="h-8 text-right" />
        </td>
        <td className="hidden sm:table-cell" />
        <td className="px-2 py-1.5">
          <div className="flex justify-end gap-1">
            <button className="grid size-8 place-items-center rounded-md text-el-ok hover:bg-el-surface-2" aria-label="Save" onClick={() => run(() => updateLocation(electionId, pu.id, v), () => setEditing(false))}>
              <Check className="size-4" />
            </button>
            <button className="grid size-8 place-items-center rounded-md text-el-muted hover:bg-el-surface-2" aria-label="Cancel" onClick={() => setEditing(false)}>
              <X className="size-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }
  return (
    <tr>
      <td className="num px-3 py-2 text-el-muted">{pu.code || "—"}</td>
      <td className="px-3 py-2">{pu.name}</td>
      <td className="num px-3 py-2 text-right">{fmt(pu.registeredVoters)}</td>
      <td className="hidden px-3 py-2 text-xs sm:table-cell">
        {pu.hasAgent ? <span className="text-el-ok">Assigned</span> : <span className="text-el-muted">None</span>}
      </td>
      <td className="px-2 py-1">
        <div className="flex justify-end gap-1">
          <button className="grid size-8 place-items-center rounded-md text-el-muted hover:bg-el-surface-2 hover:text-el-text" aria-label={`Edit ${pu.name}`} onClick={() => setEditing(true)}>
            <Pencil className="size-3.5" />
          </button>
          {!pu.hasAgent && (
            <button className="grid size-8 place-items-center rounded-md text-el-muted hover:bg-el-surface-2 hover:text-el-danger" aria-label={`Remove ${pu.name}`} onClick={() => run(() => deleteLocation(electionId, pu.id))}>
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
