import { NextResponse } from "next/server";
import { getSession } from "@/lib/election/session";
import { findTenantElection } from "@/lib/election/scoped";
import { Agent, Location, Party, Submission } from "@/lib/election/models";

export const dynamic = "force-dynamic";

const esc = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** One row per polling unit (reported or not), one column per party. */
export async function GET(_req: Request, { params }: { params: Promise<{ electionId: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const { electionId } = await params;
  const election = await findTenantElection(session.tenantId, electionId);
  if (!election) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const base = { tenantId: session.tenantId, electionId: election._id };

  const [parties, locs, subs, agents] = await Promise.all([
    Party.find(base).sort({ order: 1 }).lean(),
    Location.find(base).lean(),
    Submission.find(base).lean(),
    Agent.find(base, { name: 1, phone: 1, pollingUnitId: 1 }).lean(),
  ]);
  const name = new Map(locs.map((l) => [String(l._id), l]));
  const subByPu = new Map(subs.map((s) => [String(s.pollingUnitId), s]));
  const agentByPu = new Map(agents.map((a) => [String(a.pollingUnitId), a]));

  const header = [
    "state", "lga", "ward", "pu_code", "polling_unit", "agent", "agent_phone", "status", "flags",
    "registered", "accredited", "rejected", ...parties.map((p) => p.code), "total_valid", "total_cast",
    "comment", "photo_urls", "submitted_at",
  ];
  const rows = locs
    .filter((l) => l.level === "pu")
    .sort((a, b) =>
      [a.state, name.get(String(a.lgaId))?.name, name.get(String(a.wardId))?.name, a.code || a.name].join("|")
        .localeCompare([b.state, name.get(String(b.lgaId))?.name, name.get(String(b.wardId))?.name, b.code || b.name].join("|"), undefined, { numeric: true }),
    )
    .map((pu) => {
      const s = subByPu.get(String(pu._id));
      const a = agentByPu.get(String(pu._id));
      const votes = new Map(s?.scores.map((x) => [String(x.partyId), x.votes]));
      return [
        pu.state, name.get(String(pu.lgaId))?.name, name.get(String(pu.wardId))?.name, pu.code, pu.name,
        a?.name, a?.phone, s?.status ?? "not_reported", s?.flags.join(" "),
        pu.registeredVoters, s?.accreditedVoters, s?.rejectedVotes,
        ...parties.map((p) => (s ? votes.get(String(p._id)) ?? 0 : "")),
        s?.totalValidVotes, s?.totalVotesCast, s?.comment, s?.images.map((i) => i.url).join(" "),
        s ? new Date(s.submittedAt).toISOString() : "",
      ].map(esc).join(",");
    });

  const filename = `${election.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-results-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "")}.csv`;
  return new NextResponse("﻿" + [header.join(","), ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
