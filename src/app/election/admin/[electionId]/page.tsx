import { requireAdmin } from "@/lib/election/session";
import { getTenantElectionOr404 } from "@/lib/election/scoped";
import LiveDashboard from "@/components/election/dashboard/LiveDashboard";

export const metadata = { title: "Overview" };

export default async function OverviewPage({ params }: { params: Promise<{ electionId: string }> }) {
  const { electionId } = await params;
  const { session } = await requireAdmin();
  const election = await getTenantElectionOr404(session.tenantId, electionId);
  return <LiveDashboard electionId={electionId} status={election.status} />;
}
