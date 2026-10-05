import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/election/session";
import { getTenantElectionOr404, toObjectId } from "@/lib/election/scoped";
import { Agent, Location, Party, Submission } from "@/lib/election/models";
import SubmissionEditor from "@/components/election/SubmissionEditor";

export const metadata = { title: "Result sheet" };

export default async function SubmissionPage({ params }: { params: Promise<{ electionId: string; submissionId: string }> }) {
  const { electionId, submissionId } = await params;
  const { session } = await requireAdmin();
  const election = await getTenantElectionOr404(session.tenantId, electionId);
  const base = { tenantId: session.tenantId, electionId: election._id };

  const sub = await Submission.findOne({ ...base, _id: toObjectId(submissionId) }).lean();
  if (!sub) notFound();

  const [parties, locs, agent] = await Promise.all([
    Party.find(base).sort({ order: 1 }).lean(),
    Location.find({ ...base, _id: { $in: [sub.pollingUnitId, sub.wardId, sub.lgaId] } }).lean(),
    Agent.findOne({ ...base, _id: sub.agentId }, { name: 1, phone: 1, username: 1 }).lean(),
  ]);
  const loc = (id: unknown) => locs.find((l) => String(l._id) === String(id));
  const pu = loc(sub.pollingUnitId);
  const votes = new Map(sub.scores.map((s) => [String(s.partyId), s.votes]));

  return (
    <div>
      <Link href={`/election/admin/${electionId}/submissions`} className="text-sm text-el-muted hover:text-el-text">
        ← Submissions
      </Link>
      <SubmissionEditor
        electionId={electionId}
        submission={{
          id: String(sub._id),
          status: sub.status,
          flags: sub.flags,
          comment: sub.comment ?? "",
          images: sub.images.map((i) => ({ url: i.url, thumbnailUrl: i.thumbnailUrl ?? "" })),
          registeredVoters: sub.registeredVoters ?? 0,
          accreditedVoters: sub.accreditedVoters ?? 0,
          rejectedVotes: sub.rejectedVotes ?? 0,
          submittedAt: new Date(sub.submittedAt).toISOString(),
          updatedAt: new Date(sub.updatedAt).toISOString(),
          geo: sub.geo?.lat != null ? { lat: sub.geo.lat, lng: sub.geo.lng!, accuracy: sub.geo.accuracy ?? 0 } : null,
          history: sub.history.map((h) => ({
            at: new Date(h.at).toISOString(),
            by: h.by?.name ?? "",
            role: h.by?.role ?? "",
            action: h.action,
            reason: h.reason ?? "",
            changes: (h.changes ?? []).map((c) => ({ field: c.field, from: String(c.from), to: String(c.to) })),
          })),
        }}
        scores={parties.map((p) => ({
          partyId: String(p._id),
          code: p.code,
          name: p.name,
          candidateName: p.candidateName ?? "",
          color: p.color,
          logo: p.logo ?? "",
          votes: votes.get(String(p._id)) ?? 0,
        }))}
        place={{
          pu: pu ? (pu.code ? `${pu.name} (${pu.code})` : pu.name) : "—",
          ward: loc(sub.wardId)?.name ?? "—",
          lga: loc(sub.lgaId)?.name ?? "—",
          state: pu?.state ?? "",
        }}
        agent={agent ? { name: agent.name, phone: agent.phone ?? "", username: agent.username } : null}
      />
    </div>
  );
}
