import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAgent } from "@/lib/election/session";
import { connectDB } from "@/lib/election/db";
import { Agent, Election, Location, Party, Submission } from "@/lib/election/models";
import AgentSubmitFlow from "@/components/election/agent/AgentSubmitFlow";
import AgentProviders from "@/components/election/agent/AgentProviders";

export const metadata = { title: "Submit result" };

export default async function AgentSubmitPage() {
  const { session } = await requireAgent();
  await connectDB();
  const agent = await Agent.findOne({ _id: session.sub, tenantId: session.tenantId }).lean();
  if (!agent) redirect("/election");
  const base = { tenantId: agent.tenantId, electionId: agent.electionId };

  const [election, pu, parties, sub] = await Promise.all([
    Election.findOne({ _id: agent.electionId, tenantId: agent.tenantId }).lean(),
    Location.findOne({ ...base, _id: agent.pollingUnitId }).lean(),
    Party.find(base).sort({ order: 1 }).lean(),
    Submission.findOne({ ...base, pollingUnitId: agent.pollingUnitId }).lean(),
  ]);
  if (!election || election.status !== "live" || sub?.status === "verified" || !pu) redirect("/election/agent");

  const votes = new Map(sub?.scores.map((s) => [String(s.partyId), s.votes]));

  return (
    <div>
      <Link href="/election/agent" className="text-sm text-el-muted">← Back</Link>
      <AgentProviders>
      <AgentSubmitFlow
        agentId={String(agent._id)}
        electionId={String(agent.electionId)}
        pollingUnitId={String(pu._id)}
        puName={pu.code ? `${pu.name} (${pu.code})` : pu.name}
        registeredVoters={pu.registeredVoters ?? 0}
        parties={parties.map((p) => ({ id: String(p._id), code: p.code, name: p.name, candidateName: p.candidateName ?? "", color: p.color, logo: p.logo ?? "" }))}
        existing={
          sub
            ? {
                updatedAt: new Date(sub.updatedAt).toISOString(),
                votes: Object.fromEntries(parties.map((p) => [String(p._id), String(votes.get(String(p._id)) ?? 0)])),
                accredited: String(sub.accreditedVoters ?? 0),
                rejected: String(sub.rejectedVotes ?? 0),
                comment: sub.comment ?? "",
                images: sub.images.map((i) => ({ url: i.url, thumbnailUrl: i.thumbnailUrl ?? "", size: i.size ?? 0 })),
              }
            : null
        }
      />
      </AgentProviders>
    </div>
  );
}
