import { requireAdmin } from "@/lib/election/session";
import { getTenantElectionOr404 } from "@/lib/election/scoped";
import { Agent, Location, Submission } from "@/lib/election/models";
import AgentsManager, { type AgentRow, type PuOption } from "@/components/election/agents/AgentsManager";

export const metadata = { title: "Agents" };

export default async function AgentsPage({ params }: { params: Promise<{ electionId: string }> }) {
  const { electionId } = await params;
  const { session, tenant } = await requireAdmin();
  const election = await getTenantElectionOr404(session.tenantId, electionId);
  const base = { tenantId: session.tenantId, electionId: election._id };

  const [agents, locs, subs] = await Promise.all([
    Agent.find(base, { passwordHash: 0 }).sort({ createdAt: -1 }).lean(),
    Location.find(base).sort({ name: 1 }).lean(),
    Submission.find(base, { agentId: 1, status: 1 }).lean(),
  ]);
  const name = new Map(locs.map((l) => [String(l._id), l.code ? `${l.name} (${l.code})` : l.name]));
  const subByAgent = new Map(subs.map((s) => [String(s.agentId), s.status]));
  const assigned = new Set(agents.map((a) => String(a.pollingUnitId)));

  const rows: AgentRow[] = agents.map((a) => ({
    id: String(a._id),
    name: a.name,
    phone: a.phone ?? "",
    username: a.username,
    active: a.active,
    lastLoginAt: a.lastLoginAt ? new Date(a.lastLoginAt).toISOString() : null,
    pollingUnitId: String(a.pollingUnitId),
    puName: name.get(String(a.pollingUnitId)) ?? "—",
    wardId: String(a.wardId),
    wardName: name.get(String(a.wardId)) ?? "—",
    lgaId: String(a.lgaId),
    lgaName: name.get(String(a.lgaId)) ?? "—",
    submission: subByAgent.get(String(a._id)) ?? null,
  }));

  const pus: PuOption[] = locs
    .filter((l) => l.level === "pu")
    .map((l) => ({
      id: String(l._id),
      name: l.name,
      code: l.code ?? "",
      wardId: String(l.wardId),
      lgaId: String(l.lgaId),
      taken: assigned.has(String(l._id)),
    }));

  return (
    <AgentsManager
      electionId={electionId}
      tenantPrefix={tenant.id}
      agents={rows}
      lgas={locs.filter((l) => l.level === "lga").map((l) => ({ id: String(l._id), name: l.name }))}
      wards={locs.filter((l) => l.level === "ward").map((l) => ({ id: String(l._id), name: l.name, lgaId: String(l.lgaId) }))}
      pus={pus}
    />
  );
}
