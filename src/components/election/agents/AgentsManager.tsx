"use client";

import { useMemo, useState, useTransition } from "react";
import { KeyRound, Loader2, MoreHorizontal, Pencil, Plus, Power, Search, Trash2, Upload, X } from "lucide-react";
import { deleteAgent, resetAgentPassword, setAgentActive } from "@/app/election/admin/actions";
import { Button, Card, cx, EmptyState, fmt, Input, PageHeader, Select, StatusPill, timeAgo } from "../ui";
import AgentForm from "./AgentForm";
import AgentImport from "./AgentImport";
import CredentialsDialog, { type Credentials } from "./CredentialsDialog";

export type AgentRow = {
  id: string;
  name: string;
  phone: string;
  username: string;
  active: boolean;
  lastLoginAt: string | null;
  pollingUnitId: string;
  puName: string;
  wardId: string;
  wardName: string;
  lgaId: string;
  lgaName: string;
  submission: string | null;
};
export type PuOption = { id: string; name: string; code: string; wardId: string; lgaId: string; taken: boolean };
export type Opt = { id: string; name: string; lgaId?: string };

export default function AgentsManager({
  electionId,
  tenantPrefix,
  agents,
  lgas,
  wards,
  pus,
}: {
  electionId: string;
  tenantPrefix: string;
  agents: AgentRow[];
  lgas: Opt[];
  wards: Opt[];
  pus: PuOption[];
}) {
  const [panel, setPanel] = useState<"none" | "add" | "import" | "coverage">("none");
  const [editing, setEditing] = useState<AgentRow | null>(null);
  const [creds, setCreds] = useState<Credentials[] | null>(null);
  const [q, setQ] = useState("");
  const [lga, setLga] = useState("");
  const [status, setStatus] = useState("");
  const [menu, setMenu] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const stats = {
    total: agents.filter((a) => a.active).length,
    loggedIn: agents.filter((a) => a.active && a.lastLoginAt).length,
    submitted: agents.filter((a) => a.submission).length,
    freePus: pus.filter((p) => !p.taken).length,
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return agents.filter((a) => {
      if (lga && a.lgaId !== lga) return false;
      if (status === "never" && a.lastLoginAt) return false;
      if (status === "waiting" && (!a.lastLoginAt || a.submission)) return false;
      if (status === "submitted" && !a.submission) return false;
      if (status === "inactive" && a.active) return false;
      if (!s) return true;
      return [a.name, a.username, a.phone, a.puName, a.wardName].some((x) => x.toLowerCase().includes(s));
    });
  }, [agents, q, lga, status]);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      setError("");
      setMenu(null);
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Something went wrong");
    });

  const coverage = useMemo(
    () =>
      wards
        .map((w) => {
          const inWard = pus.filter((p) => p.wardId === w.id);
          return { ...w, lgaName: lgas.find((l) => l.id === w.lgaId)?.name ?? "", total: inWard.length, covered: inWard.filter((p) => p.taken).length };
        })
        .filter((w) => w.total > 0)
        .sort((a, b) => a.covered / a.total - b.covered / b.total),
    [wards, pus, lgas],
  );

  return (
    <div>
      <PageHeader
        title="Field agents"
        subtitle="One agent per polling unit. Agents sign in on their phone at the same portal you use."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setPanel(panel === "coverage" ? "none" : "coverage")}>Ward coverage</Button>
            <Button variant="secondary" onClick={() => setPanel(panel === "import" ? "none" : "import")}>
              <Upload className="size-4" /> Import CSV
            </Button>
            <Button onClick={() => { setEditing(null); setPanel(panel === "add" ? "none" : "add"); }}>
              <Plus className="size-4" /> Add agent
            </Button>
          </div>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Active agents", stats.total],
          ["Have signed in", stats.loggedIn],
          ["Submitted a result", stats.submitted],
          ["PUs without an agent", stats.freePus],
        ].map(([l, v]) => (
          <div key={l} className="rounded-xl border border-el-border bg-el-surface px-4 py-3">
            <div className="text-xs text-el-muted">{l}</div>
            <div className={cx("num mt-0.5 text-lg font-bold", l === "PUs without an agent" && Number(v) > 0 && "text-el-warn")}>{fmt(v as number)}</div>
          </div>
        ))}
      </div>

      {(panel === "add" || editing) && (
        <AgentForm
          electionId={electionId}
          tenantPrefix={tenantPrefix}
          lgas={lgas}
          wards={wards}
          pus={pus}
          editing={editing}
          onClose={() => { setPanel("none"); setEditing(null); }}
          onCreated={(c) => { setCreds([c]); setPanel("none"); }}
        />
      )}

      {panel === "import" && (
        <AgentImport electionId={electionId} onCreated={(list) => { setCreds(list); setPanel("none"); }} onClose={() => setPanel("none")} />
      )}

      {panel === "coverage" && (
        <Card title="Agent coverage by ward" className="mb-5" action={<button onClick={() => setPanel("none")} aria-label="Close"><X className="size-4 text-el-muted" /></button>}>
          {coverage.length === 0 ? (
            <EmptyState title="No polling units yet" body="Add wards and polling units on the Setup page first." />
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-el-surface-2 text-left text-xs text-el-muted">
                  <tr><th className="px-4 py-2 font-medium">Ward</th><th className="px-4 py-2 font-medium">LGA</th><th className="px-4 py-2 text-right font-medium">Covered</th><th className="w-40 px-4 py-2" /></tr>
                </thead>
                <tbody className="divide-y divide-el-border">
                  {coverage.map((w) => (
                    <tr key={w.id}>
                      <td className="px-4 py-2 font-medium">{w.name}</td>
                      <td className="px-4 py-2 text-el-muted">{w.lgaName}</td>
                      <td className="num px-4 py-2 text-right">{w.covered}/{w.total}</td>
                      <td className="px-4 py-2">
                        <div className="h-1.5 overflow-hidden rounded-full bg-el-surface-2">
                          <div className={cx("h-full rounded-full", w.covered === w.total ? "bg-el-ok" : "bg-el-warn")} style={{ width: `${(w.covered / w.total) * 100}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {error && (
        <p role="alert" className="mb-4 flex items-center justify-between rounded-lg border border-el-danger/30 bg-el-danger/5 px-4 py-2.5 text-sm text-el-danger">
          {error}
          <button onClick={() => setError("")} aria-label="Dismiss"><X className="size-4" /></button>
        </p>
      )}

      <Card>
        <div className="flex flex-col gap-2 border-b border-el-border p-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-el-muted" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, username, phone, polling unit…" className="pl-9" />
          </div>
          <Select value={lga} onChange={(e) => setLga(e.target.value)} className="sm:w-48" aria-label="Filter by LGA">
            <option value="">All LGAs</option>
            {lgas.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-48" aria-label="Filter by status">
            <option value="">All agents</option>
            <option value="never">Never signed in</option>
            <option value="waiting">Signed in, no result yet</option>
            <option value="submitted">Submitted</option>
            <option value="inactive">Deactivated</option>
          </Select>
        </div>

        {agents.length === 0 ? (
          <EmptyState
            title="No agents yet"
            body={pus.length ? "Add agents one at a time, or import a CSV of name, phone and polling-unit code." : "Add polling units on the Setup page first. Each agent is assigned to one."}
          />
        ) : filtered.length === 0 ? (
          <EmptyState title="No agents match these filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-el-surface-2 text-left text-xs text-el-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Agent</th>
                  <th className="px-4 py-2.5 font-medium">Polling unit</th>
                  <th className="hidden px-4 py-2.5 font-medium md:table-cell">Username</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-el-border">
                {filtered.map((a) => (
                  <tr key={a.id} className={cx(!a.active && "opacity-55")}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-el-muted">{a.phone || "No phone"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{a.puName}</div>
                      <div className="text-xs text-el-muted">{a.wardName} · {a.lgaName}</div>
                    </td>
                    <td className="hidden px-4 py-3 font-mono text-xs md:table-cell">{a.username}</td>
                    <td className="px-4 py-3">
                      {!a.active ? (
                        <span className="text-xs text-el-muted">Deactivated</span>
                      ) : a.submission ? (
                        <StatusPill status={a.submission} />
                      ) : a.lastLoginAt ? (
                        <span className="text-xs text-el-muted">Signed in {timeAgo(a.lastLoginAt)}</span>
                      ) : (
                        <span className="text-xs text-el-warn">Never signed in</span>
                      )}
                    </td>
                    <td className="relative px-2 py-3">
                      <button onClick={() => setMenu(menu === a.id ? null : a.id)} className="grid size-8 place-items-center rounded-md text-el-muted hover:bg-el-surface-2" aria-label={`Actions for ${a.name}`}>
                        {pending && menu === a.id ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
                      </button>
                      {menu === a.id && (
                        <div className="absolute right-2 top-11 z-20 w-52 overflow-hidden rounded-lg border border-el-border bg-el-surface py-1 text-sm shadow-xl">
                          <MenuItem icon={Pencil} onClick={() => { setMenu(null); setEditing(a); }}>Edit / reassign</MenuItem>
                          <MenuItem
                            icon={KeyRound}
                            onClick={() =>
                              start(async () => {
                                setMenu(null);
                                const res = await resetAgentPassword(electionId, a.id);
                                if (!res.ok) return setError(res.error);
                                setCreds([{ name: a.name, phone: a.phone, pu: a.puName, username: res.username, password: res.password }]);
                              })
                            }
                          >
                            Reset password
                          </MenuItem>
                          <MenuItem icon={Power} onClick={() => run(() => setAgentActive(electionId, a.id, !a.active))}>
                            {a.active ? "Deactivate" : "Reactivate"}
                          </MenuItem>
                          {!a.submission && (
                            <MenuItem icon={Trash2} danger onClick={() => run(() => deleteAgent(electionId, a.id))}>Delete</MenuItem>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {creds && <CredentialsDialog list={creds} onClose={() => setCreds(null)} />}
    </div>
  );
}

function MenuItem({ icon: Icon, children, onClick, danger }: { icon: typeof Pencil; children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={cx("flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-el-surface-2", danger && "text-el-danger")}>
      <Icon className="size-4" /> {children}
    </button>
  );
}
