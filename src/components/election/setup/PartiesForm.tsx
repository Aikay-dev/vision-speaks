"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { saveParties } from "@/app/election/admin/actions";
import PartyEditor, { type PartyRow } from "../PartyEditor";
import { Button, Card } from "../ui";

export default function PartiesForm({ electionId, initial }: { electionId: string; initial: PartyRow[] }) {
  const [rows, setRows] = useState(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(rows) !== JSON.stringify(initial);

  return (
    <Card
      title="Parties on the ballot"
      action={
        <div className="flex items-center gap-3">
          {msg && <span className={msg.ok ? "text-xs text-el-ok" : "text-xs text-el-danger"}>{msg.text}</span>}
          <Button
            size="sm"
            disabled={!dirty || pending}
            onClick={() =>
              start(async () => {
                const res = await saveParties(electionId, rows);
                setMsg(res.ok ? { ok: true, text: "Saved." } : { ok: false, text: res.error });
              })
            }
          >
            {pending && <Loader2 className="size-3.5 animate-spin" />} Save parties
          </Button>
        </div>
      }
    >
      <div className="p-5">
        <p className="mb-5 text-sm text-el-muted">
          The order here is the order agents see on their form. Match it to the result sheet (EC8A).
        </p>
        <PartyEditor value={rows} onChange={(r) => { setRows(r); setMsg(null); }} />
      </div>
    </Card>
  );
}
