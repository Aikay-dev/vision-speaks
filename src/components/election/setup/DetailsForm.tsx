"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { deleteElection, updateElectionDetails } from "@/app/election/admin/actions";
import { ELECTION_TYPE_LABELS } from "@/lib/election/constants";
import { Button, Card, Field, Input, Select, Textarea } from "../ui";

type Details = { name: string; type: string; date: string; description: string };

export default function DetailsForm({ electionId, initial }: { electionId: string; initial: Details }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const [confirmName, setConfirmName] = useState("");
  const [deleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState("");

  return (
    <div className="max-w-2xl space-y-6">
      <Card title="Election details">
        <form
          className="space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const res = await updateElectionDetails(electionId, { ...form, type: form.type as never });
              setMsg(res.ok ? { ok: true, text: "Saved." } : { ok: false, text: res.error });
            });
          }}
        >
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={3} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {Object.entries(ELECTION_TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </Select>
            </Field>
            <Field label="Date">
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
          </div>
          <Field label="Notes">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />} Save changes
            </Button>
            {msg && <span className={msg.ok ? "text-sm text-el-ok" : "text-sm text-el-danger"}>{msg.text}</span>}
          </div>
        </form>
      </Card>

      <Card title={<span className="text-el-danger">Delete this election monitoring</span>}>
        <div className="space-y-3 p-5 text-sm">
          <p className="text-el-muted">
            This permanently deletes all of its locations, agents and submitted results. It can&apos;t be undone. Type{" "}
            <span className="font-semibold text-el-text">{initial.name}</span> to confirm.
          </p>
          <Input value={confirmName} onChange={(e) => setConfirmName(e.target.value)} placeholder={initial.name} />
          {deleteError && <p className="text-el-danger">{deleteError}</p>}
          <Button
            variant="danger"
            disabled={confirmName !== initial.name || deleting}
            onClick={() =>
              startDelete(async () => {
                const res = await deleteElection(electionId, confirmName);
                if (!res.ok) return setDeleteError(res.error);
                router.push("/election/admin");
              })
            }
          >
            {deleting && <Loader2 className="size-4 animate-spin" />} Delete permanently
          </Button>
        </div>
      </Card>
    </div>
  );
}
