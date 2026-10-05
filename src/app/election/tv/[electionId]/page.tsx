import { requireAdmin } from "@/lib/election/session";
import { getTenantElectionOr404 } from "@/lib/election/scoped";
import { toPublicTenant } from "@/lib/election/tenants";
import TvBoard from "@/components/election/dashboard/TvBoard";

export const metadata = { title: "Live board" };

/** Full-screen live results for a TV or projector. Sign in as the coordinator on the TV's browser, then open this page. */
export default async function TvPage({ params }: { params: Promise<{ electionId: string }> }) {
  const { electionId } = await params;
  const { session, tenant } = await requireAdmin();
  const election = await getTenantElectionOr404(session.tenantId, electionId);
  return (
    <div className="el-root min-h-dvh" data-theme="dark" style={{ ["--el-brand" as string]: tenant.brandColor }}>
      <TvBoard electionId={electionId} electionName={election.name} tenant={toPublicTenant(tenant)} />
    </div>
  );
}
