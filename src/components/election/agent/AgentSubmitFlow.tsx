"use client";

import imageCompression from "browser-image-compression";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera, CheckCircle2, ChevronLeft, ImagePlus, Loader2, MapPin, RefreshCw, X } from "lucide-react";
import { useEdgeStore } from "@/lib/edgestore";
import { submitResult } from "@/app/election/agent/actions";
import { computeFlags, computeTotals, explainFlag } from "@/lib/election/flags";
import { PartyLogo } from "../PartyEditor";
import { Button, cx, fmt, Textarea } from "../ui";

type Party = { id: string; code: string; name: string; candidateName: string; color: string; logo: string };
type Photo = { url: string; thumbnailUrl: string; size: number };
type Draft = {
  clientSubmissionId: string;
  step: number;
  photos: Photo[];
  votes: Record<string, string>;
  accredited: string;
  rejected: string;
  comment: string;
  basedOn: string | null;
};

const STEPS = ["Photo", "Scores", "Review"];
const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

export default function AgentSubmitFlow({
  agentId,
  electionId,
  pollingUnitId,
  puName,
  registeredVoters,
  parties,
  existing,
}: {
  agentId: string;
  electionId: string;
  pollingUnitId: string;
  puName: string;
  registeredVoters: number;
  parties: Party[];
  existing: null | { updatedAt: string; votes: Record<string, string>; accredited: string; rejected: string; comment: string; images: Photo[] };
}) {
  const router = useRouter();
  const { edgestore } = useEdgeStore();
  const storageKey = `vs_el_draft_${agentId}`;

  const fresh = (): Draft => ({
    clientSubmissionId: newId(),
    step: 0,
    photos: existing?.images ?? [],
    votes: existing?.votes ?? Object.fromEntries(parties.map((p) => [p.id, ""])),
    accredited: existing?.accredited ?? "",
    rejected: existing?.rejected ?? "",
    comment: existing?.comment ?? "",
    basedOn: existing?.updatedAt ?? null,
  });

  const [draft, setDraft] = useState<Draft>(fresh);
  const [restored, setRestored] = useState(false);
  const [upload, setUpload] = useState<{ progress: number; preview: string } | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [geo, setGeo] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Restore an unfinished draft (lost signal, closed browser, phone died...).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const d = JSON.parse(saved) as Draft;
        // Ignore a draft made against an older version of the server record, or for a changed party list.
        const samePartySet = parties.every((p) => p.id in d.votes) && Object.keys(d.votes).length === parties.length;
        if (samePartySet && d.basedOn === (existing?.updatedAt ?? null)) {
          setDraft(d);
          setRestored(true);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {}
  }, [draft, storageKey]);

  // Location is optional context for the coordinator. Ask once, never block.
  useEffect(() => {
    if (draft.step !== 2 || geo || !("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setGeo({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 },
    );
  }, [draft.step, geo]);

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const num = (s: string) => Number(s) || 0;
  const figures = {
    votes: parties.map((p) => num(draft.votes[p.id])),
    registeredVoters,
    accreditedVoters: num(draft.accredited),
    rejectedVotes: num(draft.rejected),
    imageCount: draft.photos.length,
  };
  const totals = computeTotals(figures);
  const warnings = computeFlags(figures).filter((f) => f !== "no_image");
  const scoresFilled = parties.every((p) => draft.votes[p.id] !== "") && draft.accredited !== "" && draft.rejected !== "";

  async function onFile(file: File) {
    setUploadError("");
    const preview = URL.createObjectURL(file);
    setUpload({ progress: 0, preview });
    try {
      // Phone photos are often 3–6 MB; ~600 KB is plenty to read the sheet and uploads far faster.
      const compressed = await imageCompression(file, { maxSizeMB: 0.6, maxWidthOrHeight: 2200, useWebWorker: true, initialQuality: 0.85 });
      const res = await edgestore.resultSheets.upload({
        file: new File([compressed], file.name.replace(/\.\w+$/, "") + ".jpg", { type: compressed.type || "image/jpeg" }),
        input: { electionId, pollingUnitId },
        options: { temporary: true },
        onProgressChange: (progress) => setUpload({ progress, preview }),
      });
      setDraft((d) => ({ ...d, photos: [...d.photos, { url: res.url, thumbnailUrl: res.thumbnailUrl ?? "", size: res.size }] }));
    } catch (e) {
      console.error(e);
      setUploadError("The photo didn't upload. Check your signal and try again.");
    } finally {
      setUpload(null);
      URL.revokeObjectURL(preview);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError("");
    const res = await submitResult({
      clientSubmissionId: draft.clientSubmissionId,
      scores: parties.map((p) => ({ partyId: p.id, votes: num(draft.votes[p.id]) })),
      accreditedVoters: num(draft.accredited),
      rejectedVotes: num(draft.rejected),
      images: draft.photos,
      comment: draft.comment,
      geo,
    }).catch(() => ({ ok: false as const, error: "No connection. Your entries are saved on this phone, so try again when you have signal." }));
    setSubmitting(false);
    if (!res.ok) return setSubmitError(res.error);
    try { localStorage.removeItem(storageKey); } catch {}
    setDone(res.status);
  }

  if (done) {
    return (
      <div className="mt-6 rounded-2xl border border-el-border bg-el-surface p-6 text-center">
        <CheckCircle2 className="mx-auto size-14 text-el-ok" />
        <h2 className="mt-3 text-xl font-bold">Result submitted</h2>
        <p className="mt-2 text-sm text-el-muted">
          {done === "flagged"
            ? "It has been sent to your coordinator with a note to check the figures that don't add up."
            : "Your coordinator can see it now. You can still edit it until they verify it."}
        </p>
        <Button size="lg" className="mt-6 w-full" onClick={() => { router.push("/election/agent"); router.refresh(); }}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <h1 className="text-xl font-bold leading-snug">{existing ? "Edit result" : "Submit result"}</h1>
      <p className="text-sm text-el-muted">{puName}</p>

      <ol className="my-5 grid grid-cols-3 gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s}>
            <div className={cx("h-1.5 rounded-full", i <= draft.step ? "bg-el-brand" : "bg-el-border")} />
            <p className={cx("mt-1.5 text-xs font-medium", i === draft.step ? "text-el-text" : "text-el-muted")}>{i + 1}. {s}</p>
          </li>
        ))}
      </ol>

      {restored && (
        <p className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-el-border bg-el-surface px-4 py-2.5 text-sm">
          <span>Your unfinished entry was restored.</span>
          <button className="inline-flex items-center gap-1 text-xs font-semibold text-el-brand" onClick={() => { setDraft(fresh()); setRestored(false); }}>
            <RefreshCw className="size-3.5" /> Start over
          </button>
        </p>
      )}

      {/* Step 1: photo */}
      {draft.step === 0 && (
        <section className="space-y-4">
          <p className="text-[15px]">Take a clear photo of the <span className="font-semibold">result sheet (EC8A)</span>. Lay it flat, in good light, with all the numbers visible.</p>

          <div className="grid grid-cols-2 gap-3">
            {draft.photos.map((p, i) => (
              <div key={p.url} className="relative aspect-[3/4] overflow-hidden rounded-xl border border-el-border bg-el-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumbnailUrl || p.url} alt={`Result sheet photo ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  onClick={() => set({ photos: draft.photos.filter((_, j) => j !== i) })}
                  className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-black/60 text-white"
                  aria-label="Remove photo"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
            {upload && (
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-el-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={upload.preview} alt="" className="h-full w-full object-cover opacity-50" />
                <div className="absolute inset-x-3 bottom-3">
                  <div className="h-2 overflow-hidden rounded-full bg-white/70">
                    <div className="h-full bg-el-brand transition-all" style={{ width: `${upload.progress}%` }} />
                  </div>
                  <p className="num mt-1 text-center text-xs font-semibold text-el-text">Uploading {Math.round(upload.progress)}%</p>
                </div>
              </div>
            )}
          </div>

          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="sr-only" id="sheet-photo" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          {draft.photos.length < 4 && !upload && (
            <label
              htmlFor="sheet-photo"
              className={cx(
                "flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed font-semibold",
                draft.photos.length ? "h-14 border-el-border text-el-muted" : "h-40 flex-col border-el-brand/40 bg-el-brand/5 text-el-brand",
              )}
            >
              {draft.photos.length ? <ImagePlus className="size-5" /> : <Camera className="size-10" />}
              {draft.photos.length ? "Add another photo" : "Take photo"}
            </label>
          )}
          {uploadError && <p role="alert" className="rounded-xl bg-el-danger/5 px-4 py-3 text-sm text-el-danger">{uploadError}</p>}

          <Button size="lg" className="w-full" disabled={!draft.photos.length || Boolean(upload)} onClick={() => set({ step: 1 })}>
            Next: enter scores
          </Button>
        </section>
      )}

      {/* Step 2: scores */}
      {draft.step === 1 && (
        <section className="space-y-4">
          <p className="text-[15px]">Type the votes for each party exactly as written on the sheet.</p>
          <ul className="overflow-hidden rounded-2xl border border-el-border bg-el-surface">
            {parties.map((p, i) => (
              <li key={p.id} className={cx("flex items-center gap-3 px-4 py-2.5", i > 0 && "border-t border-el-border")}>
                <PartyLogo party={p} size={36} />
                <label htmlFor={`v-${p.id}`} className="min-w-0 flex-1">
                  <span className="block text-base font-bold">{p.code}</span>
                  {p.candidateName && <span className="block truncate text-xs text-el-muted">{p.candidateName}</span>}
                </label>
                <NumberBox id={`v-${p.id}`} value={draft.votes[p.id]} onChange={(v) => set({ votes: { ...draft.votes, [p.id]: v } })} />
              </li>
            ))}
          </ul>

          <div className="overflow-hidden rounded-2xl border border-el-border bg-el-surface">
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-el-muted">Registered voters</span>
              <span className="num font-bold">{fmt(registeredVoters)}</span>
            </div>
            <div className="flex items-center gap-3 border-t border-el-border px-4 py-2.5">
              <label htmlFor="acc" className="flex-1 text-base font-semibold">Accredited voters</label>
              <NumberBox id="acc" value={draft.accredited} onChange={(v) => set({ accredited: v })} />
            </div>
            <div className="flex items-center gap-3 border-t border-el-border px-4 py-2.5">
              <label htmlFor="rej" className="flex-1 text-base font-semibold">Rejected votes</label>
              <NumberBox id="rej" value={draft.rejected} onChange={(v) => set({ rejected: v })} />
            </div>
          </div>

          <div className="sticky bottom-3 flex items-center justify-between rounded-2xl bg-el-ink px-5 py-3 text-white shadow-lg">
            <span className="text-sm text-white/70">Total valid votes</span>
            <span className="num text-xl font-bold">{fmt(totals.totalValidVotes)}</span>
          </div>

          <div className="flex gap-3">
            <Button size="lg" variant="secondary" onClick={() => set({ step: 0 })} aria-label="Back"><ChevronLeft className="size-5" /></Button>
            <Button size="lg" className="flex-1" disabled={!scoresFilled} onClick={() => set({ step: 2 })}>
              Next: review
            </Button>
          </div>
          {!scoresFilled && <p className="text-center text-xs text-el-muted">Fill in every box. Type 0 where a party got no votes.</p>}
        </section>
      )}

      {/* Step 3: review */}
      {draft.step === 2 && (
        <section className="space-y-4">
          {warnings.length > 0 && (
            <div className="space-y-2 rounded-2xl border border-el-warn/40 bg-el-warn/10 p-4">
              <p className="flex items-center gap-2 font-semibold"><AlertTriangle className="size-5 text-el-warn" /> Please double-check</p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {warnings.map((w) => <li key={w}>{explainFlag(w, figures)}</li>)}
              </ul>
              <p className="text-xs text-el-muted">If the sheet really says this, you can still submit. Your coordinator will review it.</p>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-el-border bg-el-surface">
            <ul>
              {parties.map((p, i) => (
                <li key={p.id} className={cx("flex items-center gap-3 px-4 py-2.5", i > 0 && "border-t border-el-border")}>
                  <PartyLogo party={p} size={26} />
                  <span className="flex-1 font-semibold">{p.code}</span>
                  <span className="num text-lg font-bold">{fmt(num(draft.votes[p.id]))}</span>
                </li>
              ))}
            </ul>
            <dl className="grid grid-cols-2 gap-px border-t border-el-border bg-el-border text-sm">
              {[
                ["Accredited", figures.accreditedVoters],
                ["Rejected", figures.rejectedVotes],
                ["Total valid", totals.totalValidVotes],
                ["Total cast", totals.totalVotesCast],
              ].map(([l, v]) => (
                <div key={l as string} className="bg-el-surface-2 px-4 py-2.5">
                  <dt className="text-xs text-el-muted">{l}</dt>
                  <dd className="num text-base font-bold">{fmt(v as number)}</dd>
                </div>
              ))}
            </dl>
            <p className="border-t border-el-border px-4 py-2.5 text-xs text-el-muted">{draft.photos.length} photo{draft.photos.length === 1 ? "" : "s"} attached</p>
          </div>

          <label className="block">
            <span className="text-[15px] font-semibold">Anything happen at your polling unit?</span>
            <span className="ml-1 text-sm text-el-muted">(optional)</span>
            <Textarea
              value={draft.comment}
              onChange={(e) => set({ comment: e.target.value })}
              placeholder="e.g. BVAS stopped working for 2 hours, voting was disrupted, the sheet was signed late…"
              className="mt-2 min-h-28 text-base"
              maxLength={1000}
            />
          </label>

          {geo && (
            <p className="flex items-center gap-1.5 text-xs text-el-muted"><MapPin className="size-3.5" /> Your location will be attached for your coordinator.</p>
          )}

          {submitError && <p role="alert" className="rounded-xl bg-el-danger/5 px-4 py-3 text-sm text-el-danger">{submitError}</p>}

          <div className="flex gap-3">
            <Button size="lg" variant="secondary" onClick={() => set({ step: 1 })} disabled={submitting} aria-label="Back"><ChevronLeft className="size-5" /></Button>
            <Button size="lg" className="flex-1 text-lg" onClick={submit} disabled={submitting}>
              {submitting && <Loader2 className="size-5 animate-spin" />}
              {submitting ? "Submitting…" : existing ? "Save changes" : "Submit result"}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

function NumberBox({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      placeholder="0"
      className="num h-14 w-28 scroll-mb-28 rounded-xl border border-el-border bg-el-surface-2 px-3 text-right text-2xl font-bold placeholder:text-el-muted/40 focus:border-el-brand focus:bg-el-surface focus:outline-none focus:ring-2 focus:ring-el-brand/30"
    />
  );
}
