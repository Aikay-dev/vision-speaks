"use client";

import { useState, useTransition } from "react";
import { Loader2, Lock, Play, RotateCcw } from "lucide-react";
import { setElectionStatus } from "@/app/election/admin/actions";
import { Button } from "./ui";

const COPY = {
  live: {
    label: "Go live",
    icon: Play,
    confirm: "Agents will be able to submit results from now on.",
  },
  closed: {
    label: "Close election",
    icon: Lock,
    confirm: "Agents won't be able to submit or edit results any more. You can still correct and verify sheets.",
  },
  reopen: {
    label: "Reopen",
    icon: RotateCcw,
    confirm: "Agents will be able to submit and edit unverified results again.",
  },
} as const;

export default function ElectionStatusControl({ electionId, status }: { electionId: string; status: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const action = status === "setup" ? "live" : status === "live" ? "closed" : "reopen";
  const copy = COPY[action];

  function run() {
    start(async () => {
      const res = await setElectionStatus(electionId, action === "reopen" ? "live" : action);
      if (!res.ok) setError(res.error);
      setConfirming(false);
    });
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-el-border bg-el-surface p-3 text-sm sm:max-w-md">
        <p className="text-el-muted">{copy.confirm}</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={run} disabled={pending} variant={action === "closed" ? "danger" : "primary"}>
            {pending && <Loader2 className="size-3.5 animate-spin" />} Yes, {copy.label.toLowerCase()}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-el-danger">{error}</span>}
      <Button size="sm" variant={action === "live" ? "primary" : "secondary"} onClick={() => setConfirming(true)}>
        <copy.icon className="size-3.5" /> {copy.label}
      </Button>
    </div>
  );
}
