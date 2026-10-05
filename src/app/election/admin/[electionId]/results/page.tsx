import { Suspense } from "react";
import { requireAdmin } from "@/lib/election/session";
import { getTenantElectionOr404 } from "@/lib/election/scoped";
import ResultsExplorer from "@/components/election/dashboard/ResultsExplorer";

export const metadata = { title: "Results" };

export default async function ResultsPage({ params }: { params: Promise<{ electionId: string }> }) {
  const { electionId } = await params;
  const { session } = await requireAdmin();
  await getTenantElectionOr404(session.tenantId, electionId);
  return (
    <Suspense>
      <ResultsExplorer electionId={electionId} />
    </Suspense>
  );
}
