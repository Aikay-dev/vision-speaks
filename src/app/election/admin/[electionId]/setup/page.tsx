import Link from "next/link";
import { requireAdmin } from "@/lib/election/session";
import { getTenantElectionOr404 } from "@/lib/election/scoped";
import { Agent, Location, Party } from "@/lib/election/models";
import { cx } from "@/components/election/ui";
import DetailsForm from "@/components/election/setup/DetailsForm";
import PartiesForm from "@/components/election/setup/PartiesForm";
import LocationsManager, { type LocNode } from "@/components/election/setup/LocationsManager";

export const metadata = { title: "Setup" };

const TABS = [
  { id: "locations", label: "Locations" },
  { id: "parties", label: "Parties" },
  { id: "details", label: "Details" },
];

export default async function SetupPage({
  params,
  searchParams,
}: {
  params: Promise<{ electionId: string }>;
  searchParams: Promise<{ tab?: string; welcome?: string }>;
}) {
  const { electionId } = await params;
  const { tab = "locations", welcome } = await searchParams;
  const { session } = await requireAdmin();
  const election = await getTenantElectionOr404(session.tenantId, electionId);
  const base = { tenantId: session.tenantId, electionId: election._id };

  return (
    <div>
      {welcome && (
        <div className="mb-5 rounded-xl border border-el-brand/30 bg-el-brand/5 px-5 py-4 text-sm">
          <p className="font-semibold">Election monitoring created.</p>
          <p className="mt-1 text-el-muted">
            Next: add the wards and polling units for each LGA (with registered voters), then create agent accounts on the
            Agents page. Click <span className="font-medium text-el-text">Go live</span> when you&apos;re ready for agents to submit.
          </p>
        </div>
      )}

      <div className="mb-6 flex gap-1 border-b border-el-border">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`?tab=${t.id}`}
            scroll={false}
            className={cx(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition",
              tab === t.id ? "border-el-brand text-el-text" : "border-transparent text-el-muted hover:text-el-text",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "details" && (
        <DetailsForm
          electionId={electionId}
          initial={{
            name: election.name,
            type: election.type,
            date: election.date ? new Date(election.date).toISOString().slice(0, 10) : "",
            description: election.description ?? "",
          }}
        />
      )}

      {tab === "parties" && (
        <PartiesForm
          electionId={electionId}
          initial={(await Party.find(base).sort({ order: 1 }).lean()).map((p) => ({
            code: p.code,
            name: p.name,
            candidateName: p.candidateName ?? "",
            color: p.color,
            logo: p.logo ?? "",
          }))}
        />
      )}

      {tab === "locations" && <LocationsTab base={base} electionId={electionId} />}
    </div>
  );
}

async function LocationsTab({ base, electionId }: { base: { tenantId: string; electionId: import("mongoose").Types.ObjectId }; electionId: string }) {
  const [locs, agents] = await Promise.all([
    Location.find(base).sort({ name: 1 }).lean(),
    Agent.find(base, { pollingUnitId: 1 }).lean(),
  ]);
  const withAgent = new Set(agents.map((a) => String(a.pollingUnitId)));
  const nodes: LocNode[] = locs.map((l) => ({
    id: String(l._id),
    level: l.level,
    name: l.name,
    code: l.code ?? "",
    state: l.state,
    lgaId: l.lgaId ? String(l.lgaId) : undefined,
    wardId: l.wardId ? String(l.wardId) : undefined,
    registeredVoters: l.registeredVoters ?? 0,
    hasAgent: withAgent.has(String(l._id)),
  }));
  return <LocationsManager electionId={electionId} nodes={nodes} />;
}
