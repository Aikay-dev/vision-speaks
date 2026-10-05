import Link from "next/link";
import { Suspense } from "react";
import { MessageSquare, ImageOff } from "lucide-react";
import { requireAdmin } from "@/lib/election/session";
import { getTenantElectionOr404, toObjectId } from "@/lib/election/scoped";
import { Agent, Location, Party, Submission } from "@/lib/election/models";
import { FLAG_LABELS, type FlagCode } from "@/lib/election/flags";
import { Card, cx, EmptyState, fmt, PageHeader, PartyChip, StatusPill, timeAgo } from "@/components/election/ui";
import AutoRefresh from "@/components/election/AutoRefresh";
import SubmissionFilters from "@/components/election/SubmissionFilters";

export const metadata = { title: "Submissions" };

const PAGE_SIZE = 50;

export default async function SubmissionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ electionId: string }>;
  searchParams: Promise<{ status?: string; lga?: string; q?: string; comments?: string; page?: string }>;
}) {
  const { electionId } = await params;
  const sp = await searchParams;
  const { session } = await requireAdmin();
  const election = await getTenantElectionOr404(session.tenantId, electionId);
  const base = { tenantId: session.tenantId, electionId: election._id };

  const filter: Record<string, unknown> = { ...base };
  if (sp.status && ["submitted", "flagged", "verified"].includes(sp.status)) filter.status = sp.status;
  if (sp.lga && toObjectId(sp.lga)) filter.lgaId = toObjectId(sp.lga);
  if (sp.comments === "1") filter.comment = { $nin: ["", null] };

  const [lgas, parties] = await Promise.all([
    Location.find({ ...base, level: "lga" }, { name: 1 }).sort({ name: 1 }).lean(),
    Party.find(base).lean(),
  ]);

  // Search matches polling-unit name/code or agent name/username.
  if (sp.q?.trim()) {
    const rx = new RegExp(sp.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const [pus, agents] = await Promise.all([
      Location.find({ ...base, level: "pu", $or: [{ name: rx }, { code: rx }] }, { _id: 1 }).limit(500).lean(),
      Agent.find({ ...base, $or: [{ name: rx }, { username: rx }] }, { _id: 1 }).limit(500).lean(),
    ]);
    filter.$or = [{ pollingUnitId: { $in: pus.map((p) => p._id) } }, { agentId: { $in: agents.map((a) => a._id) } }];
  }

  const page = Math.max(1, Number(sp.page) || 1);
  const [subs, total, counts] = await Promise.all([
    Submission.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
    Submission.countDocuments(filter),
    Submission.aggregate<{ _id: string; n: number }>([{ $match: base }, { $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]);
  const count = (s: string) => counts.find((c) => c._id === s)?.n ?? 0;

  const locIds = subs.flatMap((s) => [s.pollingUnitId, s.wardId, s.lgaId]);
  const [locs, agents] = await Promise.all([
    Location.find({ ...base, _id: { $in: locIds } }, { name: 1, code: 1 }).lean(),
    Agent.find({ ...base, _id: { $in: subs.map((s) => s.agentId) } }, { name: 1 }).lean(),
  ]);
  const loc = new Map(locs.map((l) => [String(l._id), l]));
  const agentName = new Map(agents.map((a) => [String(a._id), a.name]));
  const party = new Map(parties.map((p) => [String(p._id), p]));

  const qs = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `?${next}`;
  };

  return (
    <div>
      <AutoRefresh seconds={15} />
      <PageHeader title="Submissions" subtitle="Check each result sheet against its photo, correct it if needed, then verify it." />

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          [undefined, "All", count("submitted") + count("flagged") + count("verified")],
          ["flagged", "Flagged", count("flagged")],
          ["submitted", "Unverified", count("submitted")],
          ["verified", "Verified", count("verified")],
        ].map(([s, label, n]) => (
          <Link
            key={String(label)}
            href={qs({ status: s as string | undefined, page: undefined })}
            className={cx(
              "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
              sp.status === s ? "border-el-brand bg-el-brand text-white" : "border-el-border bg-el-surface text-el-muted hover:text-el-text",
            )}
          >
            {label as string}
            <span className="num text-xs opacity-80">{fmt(n as number)}</span>
          </Link>
        ))}
      </div>

      <Card>
        <Suspense>
          <SubmissionFilters lgas={lgas.map((l) => ({ id: String(l._id), name: l.name }))} />
        </Suspense>
        {subs.length === 0 ? (
          <EmptyState title={total === 0 && !sp.status && !sp.q ? "No submissions yet" : "Nothing matches"} body="Results appear here as agents submit them." />
        ) : (
          <ul className="divide-y divide-el-border">
            {subs.map((s) => {
              const pu = loc.get(String(s.pollingUnitId));
              const best = [...s.scores].sort((a, b) => b.votes - a.votes)[0];
              const lead = best && best.votes > 0 ? party.get(String(best.partyId)) : undefined;
              const thumb = s.images[0]?.thumbnailUrl || s.images[0]?.url;
              return (
                <li key={String(s._id)}>
                  <Link href={`/election/admin/${electionId}/submissions/${s._id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-el-surface-2">
                    <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-el-border bg-el-surface-2">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <ImageOff className="size-5 text-el-muted" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-medium">{pu?.name ?? "—"}</span>
                        {pu?.code && <span className="hidden text-xs text-el-muted sm:inline">{pu.code}</span>}
                        {s.comment && <MessageSquare className="size-3.5 shrink-0 text-el-brand" aria-label="Has comment" />}
                      </span>
                      <span className="block truncate text-xs text-el-muted">
                        {loc.get(String(s.wardId))?.name} · {loc.get(String(s.lgaId))?.name} · {agentName.get(String(s.agentId))}
                      </span>
                      {s.flags.length > 0 && (
                        <span className="mt-1 block truncate text-xs text-el-warn">
                          {s.flags.map((f) => FLAG_LABELS[f as FlagCode] ?? f).join(" · ")}
                        </span>
                      )}
                    </span>
                    <span className="hidden w-28 text-right sm:block">
                      {lead && <PartyChip code={lead.code} color={lead.color} />}
                      <span className="num block text-xs text-el-muted">{fmt(s.totalValidVotes)} valid</span>
                    </span>
                    <span className="flex w-24 shrink-0 flex-col items-end gap-1">
                      <StatusPill status={s.status} />
                      <span className="text-[11px] text-el-muted">{timeAgo(s.updatedAt)}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-el-border px-4 py-3 text-sm">
            <span className="text-el-muted">
              {fmt((page - 1) * PAGE_SIZE + 1)}–{fmt(Math.min(page * PAGE_SIZE, total))} of {fmt(total)}
            </span>
            <span className="flex gap-2">
              {page > 1 && <Link href={qs({ page: String(page - 1) })} className="font-medium text-el-brand">← Previous</Link>}
              {page * PAGE_SIZE < total && <Link href={qs({ page: String(page + 1) })} className="font-medium text-el-brand">Next →</Link>}
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}
