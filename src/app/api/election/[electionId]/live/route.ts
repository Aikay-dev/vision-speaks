import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/election/session";
import { findTenantElection, toObjectId } from "@/lib/election/scoped";
import { getLiveStats } from "@/lib/election/stats";

export const dynamic = "force-dynamic";

/** Polled by the dashboard and results pages (SWR, every 10s). */
export async function GET(req: NextRequest, { params }: { params: Promise<{ electionId: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { electionId } = await params;
  const election = await findTenantElection(session.tenantId, electionId);
  if (!election) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sp = req.nextUrl.searchParams;
  const stats = await getLiveStats(
    { tenantId: session.tenantId, electionId: election._id },
    {
      lgaId: toObjectId(sp.get("lga")),
      wardId: toObjectId(sp.get("ward")),
      verifiedOnly: sp.get("verified") === "1",
    },
  );
  return NextResponse.json(stats, { headers: { "Cache-Control": "no-store" } });
}
