"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Flag, ImageOff, Loader2, MapPin, MessageSquare, RotateCw, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { correctSubmission, setSubmissionStatus } from "@/app/election/admin/actions";
import { computeFlags, computeTotals, explainFlag, type FlagCode } from "@/lib/election/flags";
import { PartyLogo } from "./PartyEditor";
import { Button, Card, cx, Field, fmt, Input, StatusPill, Textarea, timeAgo } from "./ui";

type Score = { partyId: string; code: string; name: string; candidateName: string; color: string; logo: string; votes: number };
type History = { at: string; by: string; role: string; action: string; reason: string; changes: { field: string; from: string; to: string }[] };
type Sub = {
  id: string;
  status: string;
  flags: string[];
  comment: string;
  images: { url: string; thumbnailUrl: string }[];
  registeredVoters: number;
  accreditedVoters: number;
  rejectedVotes: number;
  submittedAt: string;
  updatedAt: string;
  geo: { lat: number; lng: number; accuracy: number } | null;
  history: History[];
};

const ACTION_LABEL: Record<string, string> = {
  submitted: "Submitted",
  resubmitted: "Edited by agent",
  corrected: "Corrected",
  verified: "Verified",
  flagged: "Flagged",
  unverified: "Verification removed",
};

export default function SubmissionEditor({
  electionId,
  submission: sub,
  scores,
  place,
  agent,
}: {
  electionId: string;
  submission: Sub;
  scores: Score[];
  place: { pu: string; ward: string; lga: string; state: string };
  agent: { name: string; phone: string; username: string } | null;
}) {
  const initial = {
    votes: Object.fromEntries(scores.map((s) => [s.partyId, String(s.votes)])),
    accredited: String(sub.accreditedVoters),
    rejected: String(sub.rejectedVotes),
  };
  const [form, setForm] = useState(initial);
  const [reason, setReason] = useState("");
  const [flagReason, setFlagReason] = useState("");
  const [showFlag, setShowFlag] = useState(false);
  const [img, setImg] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const num = (s: string) => Number(s) || 0;
  const figures = {
    votes: scores.map((s) => num(form.votes[s.partyId])),
    registeredVoters: sub.registeredVoters,
    accreditedVoters: num(form.accredited),
    rejectedVotes: num(form.rejected),
    imageCount: sub.images.length,
  };
  const totals = computeTotals(figures);
  const flags = computeFlags(figures);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const lastFlag = [...sub.history].reverse().find((h) => h.action === "flagged");

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, okText: string, after?: () => void) =>
    start(async () => {
      const res = await fn();
      setMsg(res.ok ? { ok: true, text: okText } : { ok: false, text: res.error ?? "Failed" });
      if (res.ok) after?.();
    });

  return (
    <div className="mt-3">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{place.pu}</h1>
            <StatusPill status={sub.status} />
          </div>
          <p className="mt-1 text-sm text-el-muted">
            {place.ward} · {place.lga} · {place.state}
            {agent && <> · Agent: <span className="text-el-text">{agent.name}</span>{agent.phone && ` (${agent.phone})`}</>}
          </p>
        </div>
        <p className="text-xs text-el-muted">
          Submitted {timeAgo(sub.submittedAt)} · last change {timeAgo(sub.updatedAt)}
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Photo viewer */}
        <Card className="overflow-hidden xl:sticky xl:top-24 xl:self-start">
          {sub.images.length === 0 ? (
            <div className="grid h-80 place-items-center text-el-muted">
              <span className="flex flex-col items-center gap-2 text-sm"><ImageOff className="size-8" /> No photo attached</span>
            </div>
          ) : (
            <>
              <div className="relative h-[60vh] min-h-80 overflow-auto bg-el-ink">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sub.images[img].url}
                  alt={`Result sheet photo ${img + 1}`}
                  className="mx-auto origin-top transition-transform duration-200"
                  style={{ transform: `scale(${zoom}) rotate(${rotate}deg)`, maxWidth: zoom === 1 ? "100%" : "none", maxHeight: zoom === 1 && rotate % 180 === 0 ? "100%" : "none" }}
                />
              </div>
              <div className="flex items-center gap-1 border-t border-el-border px-3 py-2">
                <ToolBtn label="Zoom out" onClick={() => setZoom((z) => Math.max(1, z - 0.5))}><ZoomOut className="size-4" /></ToolBtn>
                <span className="num w-10 text-center text-xs text-el-muted">{Math.round(zoom * 100)}%</span>
                <ToolBtn label="Zoom in" onClick={() => setZoom((z) => Math.min(4, z + 0.5))}><ZoomIn className="size-4" /></ToolBtn>
                <ToolBtn label="Rotate" onClick={() => setRotate((r) => (r + 90) % 360)}><RotateCw className="size-4" /></ToolBtn>
                <a href={sub.images[img].url} target="_blank" rel="noreferrer" className="ml-1 text-xs font-medium text-el-brand hover:underline">Open full size</a>
                {sub.images.length > 1 && (
                  <div className="ml-auto flex gap-1.5">
                    {sub.images.map((im, i) => (
                      <button key={im.url} onClick={() => { setImg(i); setZoom(1); setRotate(0); }} className={cx("size-10 overflow-hidden rounded border-2", i === img ? "border-el-brand" : "border-transparent opacity-60")} aria-label={`Photo ${i + 1}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={im.thumbnailUrl || im.url} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </Card>

        <div className="space-y-5">
          {sub.comment && (
            <div className="rounded-xl border border-el-brand/30 bg-el-brand/5 px-5 py-4">
              <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-el-brand">
                <MessageSquare className="size-3.5" /> Agent&apos;s comment
              </p>
              <p className="whitespace-pre-wrap text-sm">{sub.comment}</p>
            </div>
          )}

          {sub.status === "flagged" && lastFlag?.reason && (
            <p className="rounded-lg border border-el-warn/30 bg-el-warn/5 px-4 py-2.5 text-sm">
              <span className="font-semibold text-el-warn">Flagged by {lastFlag.by}:</span> {lastFlag.reason}
            </p>
          )}

          {flags.length > 0 && (
            <ul className="space-y-1.5">
              {flags.map((f) => (
                <li key={f} className="flex gap-2 rounded-lg border border-el-warn/30 bg-el-warn/5 px-4 py-2.5 text-sm">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-el-warn" />
                  {explainFlag(f as FlagCode, figures)}
                </li>
              ))}
            </ul>
          )}

          <Card title="Figures on the sheet" action={dirty && <span className="text-xs font-medium text-el-warn">Unsaved changes</span>}>
            <ul className="divide-y divide-el-border">
              {scores.map((s) => {
                const changed = form.votes[s.partyId] !== initial.votes[s.partyId];
                return (
                  <li key={s.partyId} className="flex items-center gap-3 px-5 py-2">
                    <PartyLogo party={s} size={28} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">{s.code}</span>
                      <span className="block truncate text-xs text-el-muted">{s.candidateName || s.name}</span>
                    </span>
                    <Input
                      value={form.votes[s.partyId]}
                      onChange={(e) => setForm({ ...form, votes: { ...form.votes, [s.partyId]: e.target.value.replace(/\D/g, "") } })}
                      inputMode="numeric"
                      aria-label={`${s.code} votes`}
                      className={cx("num w-28 text-right font-semibold", changed && "border-el-warn ring-2 ring-el-warn/20")}
                    />
                  </li>
                );
              })}
            </ul>
            <div className="grid grid-cols-2 gap-x-5 gap-y-3 border-t border-el-border bg-el-surface-2 px-5 py-4 text-sm sm:grid-cols-3">
              <div>
                <div className="text-xs text-el-muted">Registered (set by you)</div>
                <div className="num mt-1 h-10 content-center font-semibold">{fmt(sub.registeredVoters)}</div>
              </div>
              <Field label="Accredited">
                <Input value={form.accredited} onChange={(e) => setForm({ ...form, accredited: e.target.value.replace(/\D/g, "") })} inputMode="numeric" className="num text-right" />
              </Field>
              <Field label="Rejected">
                <Input value={form.rejected} onChange={(e) => setForm({ ...form, rejected: e.target.value.replace(/\D/g, "") })} inputMode="numeric" className="num text-right" />
              </Field>
              <div>
                <div className="text-xs text-el-muted">Total valid votes</div>
                <div className="num mt-1 text-lg font-bold">{fmt(totals.totalValidVotes)}</div>
              </div>
              <div>
                <div className="text-xs text-el-muted">Total votes cast</div>
                <div className="num mt-1 text-lg font-bold">{fmt(totals.totalVotesCast)}</div>
              </div>
            </div>
            {dirty && (
              <div className="space-y-3 border-t border-el-border px-5 py-4">
                <Field label="Reason for correction" hint="Saved in the history, e.g. “APC figure misread: sheet shows 102”.">
                  <Input value={reason} onChange={(e) => setReason(e.target.value)} />
                </Field>
                <div className="flex gap-2">
                  <Button
                    disabled={pending || reason.trim().length < 3}
                    onClick={() =>
                      act(
                        () =>
                          correctSubmission(electionId, sub.id, {
                            scores: scores.map((s) => ({ partyId: s.partyId, votes: num(form.votes[s.partyId]) })),
                            accreditedVoters: num(form.accredited),
                            rejectedVotes: num(form.rejected),
                            reason,
                          }),
                        "Correction saved.",
                        () => setReason(""),
                      )
                    }
                  >
                    {pending && <Loader2 className="size-4 animate-spin" />} Save correction
                  </Button>
                  <Button variant="ghost" onClick={() => { setForm(initial); setReason(""); }}>Discard</Button>
                </div>
              </div>
            )}
          </Card>

          {msg && <p className={cx("text-sm", msg.ok ? "text-el-ok" : "text-el-danger")}>{msg.text}</p>}

          {!dirty && (
            <Card>
              <div className="flex flex-wrap gap-2 p-4">
                {sub.status !== "verified" ? (
                  <Button onClick={() => act(() => setSubmissionStatus(electionId, sub.id, "verified"), "Verified. The agent can no longer edit this sheet.")} disabled={pending}>
                    <CheckCircle2 className="size-4" /> Mark verified
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={() => act(() => setSubmissionStatus(electionId, sub.id, "submitted", "Sent back for checking"), "Verification removed. The agent can edit again.")} disabled={pending}>
                    <Undo2 className="size-4" /> Un-verify
                  </Button>
                )}
                {sub.status !== "flagged" && (
                  <Button variant="secondary" onClick={() => setShowFlag((v) => !v)}>
                    <Flag className="size-4" /> Flag for the agent
                  </Button>
                )}
              </div>
              {showFlag && (
                <div className="space-y-3 border-t border-el-border p-4">
                  <Field label="What should the agent check?" hint="The agent sees this on their phone.">
                    <Textarea value={flagReason} onChange={(e) => setFlagReason(e.target.value)} className="min-h-20" />
                  </Field>
                  <Button
                    variant="danger"
                    disabled={pending || flagReason.trim().length < 3}
                    onClick={() => act(() => setSubmissionStatus(electionId, sub.id, "flagged", flagReason), "Flagged.", () => { setShowFlag(false); setFlagReason(""); })}
                  >
                    Flag submission
                  </Button>
                </div>
              )}
            </Card>
          )}

          {sub.geo && (
            <a
              href={`https://www.google.com/maps?q=${sub.geo.lat},${sub.geo.lng}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs text-el-muted hover:text-el-text"
            >
              <MapPin className="size-3.5" /> Submitted from {sub.geo.lat.toFixed(5)}, {sub.geo.lng.toFixed(5)} (±{Math.round(sub.geo.accuracy)}m), view on map
            </a>
          )}

          <Card title="History">
            <ol className="space-y-4 p-5">
              {[...sub.history].reverse().map((h, i) => (
                <li key={i} className="relative pl-5 text-sm">
                  <span className={cx("absolute left-0 top-1.5 size-2 rounded-full", h.role === "admin" ? "bg-el-brand" : "bg-el-muted")} />
                  <p>
                    <span className="font-semibold">{ACTION_LABEL[h.action] ?? h.action}</span>
                    <span className="text-el-muted"> by {h.by} · {new Date(h.at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</span>
                  </p>
                  {h.changes.length > 0 && (
                    <p className="num mt-0.5 text-xs text-el-muted">
                      {h.changes.map((c) => `${c.field} ${c.from} → ${c.to}`).join(", ")}
                    </p>
                  )}
                  {h.reason && <p className="mt-0.5 text-xs italic text-el-muted">&ldquo;{h.reason}&rdquo;</p>}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ToolBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="grid size-8 place-items-center rounded-md text-el-muted hover:bg-el-surface-2 hover:text-el-text">
      {children}
    </button>
  );
}
