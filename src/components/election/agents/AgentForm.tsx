"use client";

import { useState, useTransition } from "react";
import { Loader2, X } from "lucide-react";
import { createAgent, updateAgent } from "@/app/election/admin/actions";
import { Button, Card, Field, Input, Select } from "../ui";
import type { AgentRow, Opt, PuOption } from "./AgentsManager";
import type { Credentials } from "./CredentialsDialog";

function suggestUsername(prefix: string, pu?: PuOption) {
  if (!pu) return "";
  const s = (pu.code || pu.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24);
  return `${prefix}-${s}`;
}

export default function AgentForm({
  electionId,
  tenantPrefix,
  lgas,
  wards,
  pus,
  editing,
  onClose,
  onCreated,
}: {
  electionId: string;
  tenantPrefix: string;
  lgas: Opt[];
  wards: Opt[];
  pus: PuOption[];
  editing: AgentRow | null;
  onClose: () => void;
  onCreated: (c: Credentials) => void;
}) {
  const [form, setForm] = useState({
    name: editing?.name ?? "",
    phone: editing?.phone ?? "",
    lgaId: editing?.lgaId ?? "",
    wardId: editing?.wardId ?? "",
    pollingUnitId: editing?.pollingUnitId ?? "",
    username: editing?.username ?? "",
  });
  const [usernameTouched, setUsernameTouched] = useState(Boolean(editing));
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const wardOpts = wards.filter((w) => w.lgaId === form.lgaId);
  // Free PUs only, plus the agent's current PU when editing.
  const puOpts = pus.filter((p) => p.wardId === form.wardId && (!p.taken || p.id === editing?.pollingUnitId));

  function pickPu(id: string) {
    const pu = pus.find((p) => p.id === id);
    setForm((f) => ({ ...f, pollingUnitId: id, username: usernameTouched ? f.username : suggestUsername(tenantPrefix, pu) }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    start(async () => {
      if (editing) {
        const res = await updateAgent(electionId, editing.id, { name: form.name, phone: form.phone, pollingUnitId: form.pollingUnitId });
        if (!res.ok) return setError(res.error);
        onClose();
      } else {
        const res = await createAgent(electionId, { name: form.name, phone: form.phone, username: form.username, pollingUnitId: form.pollingUnitId });
        if (!res.ok) return setError(res.error);
        const pu = pus.find((p) => p.id === form.pollingUnitId);
        onCreated({ name: form.name, phone: form.phone, pu: pu ? (pu.code ? `${pu.name} (${pu.code})` : pu.name) : "", username: res.username, password: res.password });
      }
    });
  }

  return (
    <Card
      className="mb-5"
      title={editing ? `Edit ${editing.name}` : "Add a field agent"}
      action={<button onClick={onClose} aria-label="Close"><X className="size-4 text-el-muted" /></button>}
    >
      <form onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-2">
        <Field label="Full name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} autoFocus />
        </Field>
        <Field label="Phone (optional)" hint="Used for the WhatsApp share button.">
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" placeholder="0803 000 0000" />
        </Field>
        <Field label="LGA">
          <Select value={form.lgaId} onChange={(e) => setForm({ ...form, lgaId: e.target.value, wardId: "", pollingUnitId: "" })} required>
            <option value="">Choose LGA…</option>
            {lgas.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </Select>
        </Field>
        <Field label="Ward">
          <Select value={form.wardId} onChange={(e) => setForm({ ...form, wardId: e.target.value, pollingUnitId: "" })} disabled={!form.lgaId} required>
            <option value="">{form.lgaId && !wardOpts.length ? "No wards in this LGA yet" : "Choose ward…"}</option>
            {wardOpts.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </Select>
        </Field>
        <Field label="Polling unit" hint={form.wardId && !puOpts.length ? "Every polling unit in this ward already has an agent." : "Only polling units without an agent are listed."}>
          <Select value={form.pollingUnitId} onChange={(e) => pickPu(e.target.value)} disabled={!form.wardId} required>
            <option value="">Choose polling unit…</option>
            {puOpts.map((p) => <option key={p.id} value={p.id}>{p.code ? `${p.code} · ${p.name}` : p.name}</option>)}
          </Select>
        </Field>
        <Field label="Username" hint={editing ? "Usernames can't be changed." : "Pre-filled from the polling unit. You can change it."}>
          <Input
            value={form.username}
            onChange={(e) => { setUsernameTouched(true); setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, "") }); }}
            disabled={Boolean(editing)}
            required
            className="font-mono"
          />
        </Field>
        {error && <p role="alert" className="text-sm text-el-danger sm:col-span-2">{error}</p>}
        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {editing ? "Save changes" : "Create agent & show password"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
