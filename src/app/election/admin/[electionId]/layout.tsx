import Link from "next/link";
import { requireAdmin } from "@/lib/election/session";
import { getTenantElectionOr404 } from "@/lib/election/scoped";
import { Submission } from "@/lib/election/models";
import { ELECTION_TYPE_LABELS } from "@/lib/election/constants";
import ElectionNav from "@/components/election/ElectionNav";
import ElectionStatusControl from "@/components/election/ElectionStatusControl";
import { StatusPill } from "@/components/election/ui";

export default async function ElectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ electionId: string }>;
}) {
  const { electionId } = await params;
  const { session } = await requireAdmin();
  const election = await getTenantElectionOr404(session.tenantId, electionId);
  const flagged = await Submission.countDocuments({ tenantId: session.tenantId, electionId: election._id, status: "flagged" });

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
      <div className="flex flex-col gap-3 border-b border-el-border py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <nav className="text-xs text-el-muted">
            <Link href="/election/admin" className="hover:text-el-text">My Election Monitorings</Link>
            <span className="px-1.5">›</span>
            <span>{ELECTION_TYPE_LABELS[election.type]}</span>
          </nav>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">{election.name}</h1>
            <StatusPill status={election.status} />
          </div>
        </div>
        <ElectionStatusControl electionId={electionId} status={election.status} />
      </div>

      <div className="grid gap-6 pb-24 pt-6 lg:grid-cols-[200px_1fr] lg:pb-6">
        <ElectionNav electionId={electionId} flagged={flagged} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
