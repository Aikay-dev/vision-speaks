import "server-only";
import type { Types } from "mongoose";
import { Agent, Location, Party, Submission } from "./models";

export type PartyTotal = {
  id: string;
  code: string;
  name: string;
  candidateName: string;
  color: string;
  logo: string;
  votes: number;
  share: number;
};

export type AreaRow = {
  id: string;
  name: string;
  level: "lga" | "ward" | "pu";
  totalUnits: number;
  reportedUnits: number;
  registeredVoters: number;
  accreditedVoters: number;
  totalValidVotes: number;
  leader: { code: string; color: string; votes: number } | null;
  margin: number;
  submissionId?: string;
  status?: string;
};

export type LiveStats = {
  updatedAt: string;
  scope: { lgaId?: string; wardId?: string; lgaName?: string; wardName?: string };
  summary: {
    totalUnits: number;
    reportedUnits: number;
    totalValidVotes: number;
    rejectedVotes: number;
    accreditedVoters: number;
    registeredVotersReported: number;
    registeredVotersAll: number;
    flagged: number;
    unverified: number;
    verified: number;
    withComments: number;
  };
  parties: PartyTotal[];
  areas: AreaRow[];
  timeline: { t: string; count: number }[];
  feed: {
    id: string;
    puName: string;
    lgaName: string;
    wardName: string;
    agentName: string;
    status: string;
    flags: string[];
    hasComment: boolean;
    comment: string;
    winner: { code: string; color: string } | null;
    totalValidVotes: number;
    at: string;
  }[];
  agents: { total: number; loggedIn: number; submitted: number };
};

type Base = { tenantId: string; electionId: Types.ObjectId };

/**
 * One call computes everything the dashboard and drill-down need for a scope:
 * whole election, one LGA, or one ward.
 */
export async function getLiveStats(
  base: Base,
  opts: { lgaId?: Types.ObjectId | null; wardId?: Types.ObjectId | null; verifiedOnly?: boolean },
): Promise<LiveStats> {
  const scopeFilter: Record<string, unknown> = { ...base };
  if (opts.wardId) scopeFilter.wardId = opts.wardId;
  else if (opts.lgaId) scopeFilter.lgaId = opts.lgaId;

  const subFilter: Record<string, unknown> = { ...scopeFilter };
  if (opts.verifiedOnly) subFilter.status = "verified";

  // The level below the current scope: election → LGAs, LGA → wards, ward → PUs.
  const childLevel: AreaRow["level"] = opts.wardId ? "pu" : opts.lgaId ? "ward" : "lga";
  const childKey = childLevel === "lga" ? "lgaId" : childLevel === "ward" ? "wardId" : "pollingUnitId";

  const childLocFilter: Record<string, unknown> = { ...base, level: childLevel };
  if (opts.wardId) childLocFilter.wardId = opts.wardId;
  else if (opts.lgaId) childLocFilter.lgaId = opts.lgaId;

  const puFilter: Record<string, unknown> = { ...base, level: "pu" };
  if (opts.wardId) puFilter.wardId = opts.wardId;
  else if (opts.lgaId) puFilter.lgaId = opts.lgaId;

  const [parties, children, puAgg, scopeNames, agg, feedDocs, agentStats] = await Promise.all([
    Party.find(base).sort({ order: 1 }).lean(),
    Location.find(childLocFilter).sort({ name: 1 }).lean(),
    // PU counts + registered voters grouped by the child level.
    Location.aggregate<{ _id: Types.ObjectId; units: number; registered: number }>([
      { $match: puFilter },
      {
        $group: {
          _id: childLevel === "pu" ? "$_id" : `$${childKey}`,
          units: { $sum: 1 },
          registered: { $sum: "$registeredVoters" },
        },
      },
    ]),
    Location.find({ ...base, _id: { $in: [opts.lgaId, opts.wardId].filter((x): x is Types.ObjectId => Boolean(x)) } }, { name: 1, level: 1 }).lean(),
    Submission.aggregate([
      { $match: subFilter },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                reported: { $sum: 1 },
                valid: { $sum: "$totalValidVotes" },
                rejected: { $sum: "$rejectedVotes" },
                accredited: { $sum: "$accreditedVoters" },
                registered: { $sum: "$registeredVoters" },
                flagged: { $sum: { $cond: [{ $eq: ["$status", "flagged"] }, 1, 0] } },
                unverified: { $sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] } },
                verified: { $sum: { $cond: [{ $eq: ["$status", "verified"] }, 1, 0] } },
                withComments: { $sum: { $cond: [{ $gt: [{ $strLenCP: { $ifNull: ["$comment", ""] } }, 0] }, 1, 0] } },
              },
            },
          ],
          byParty: [
            { $unwind: "$scores" },
            { $group: { _id: "$scores.partyId", votes: { $sum: "$scores.votes" } } },
          ],
          byChildParty: [
            { $unwind: "$scores" },
            {
              $group: {
                _id: { area: `$${childKey}`, party: "$scores.partyId" },
                votes: { $sum: "$scores.votes" },
              },
            },
          ],
          byChild: [
            {
              $group: {
                _id: `$${childKey}`,
                reported: { $sum: 1 },
                valid: { $sum: "$totalValidVotes" },
                accredited: { $sum: "$accreditedVoters" },
                submissionId: { $first: "$_id" },
                status: { $first: "$status" },
              },
            },
          ],
          timeline: [
            {
              $group: {
                _id: { $dateTrunc: { date: "$submittedAt", unit: "minute", binSize: 15 } },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]),
    Submission.find(scopeFilter, {
      pollingUnitId: 1, lgaId: 1, wardId: 1, agentId: 1, status: 1, flags: 1,
      comment: 1, scores: 1, totalValidVotes: 1, updatedAt: 1,
    })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean(),
    Promise.all([
      Agent.countDocuments({ ...scopeFilter, active: true }),
      Agent.countDocuments({ ...scopeFilter, active: true, lastLoginAt: { $exists: true } }),
    ]),
  ]);

  const facet = agg[0] ?? {};
  const totals = facet.totals?.[0] ?? {};
  const partyMap = new Map(parties.map((p) => [String(p._id), p]));
  const voteMap = new Map<string, number>(
    (facet.byParty ?? []).map((r: { _id: Types.ObjectId; votes: number }) => [String(r._id), r.votes]),
  );
  const totalValid = totals.valid ?? 0;

  const partyTotals: PartyTotal[] = parties
    .map((p) => {
      const votes = voteMap.get(String(p._id)) ?? 0;
      return {
        id: String(p._id),
        code: p.code,
        name: p.name,
        candidateName: p.candidateName ?? "",
        color: p.color,
        logo: p.logo ?? "",
        votes,
        share: totalValid ? votes / totalValid : 0,
      };
    })
    .sort((a, b) => b.votes - a.votes || 0);

  // Per-area party standings → leader + margin.
  const areaParty = new Map<string, { party: string; votes: number }[]>();
  for (const r of facet.byChildParty ?? []) {
    const key = String(r._id.area);
    const list = areaParty.get(key) ?? [];
    list.push({ party: String(r._id.party), votes: r.votes });
    areaParty.set(key, list);
  }
  const areaAgg = new Map<string, { reported: number; valid: number; accredited: number; submissionId: Types.ObjectId; status: string }>(
    (facet.byChild ?? []).map((r: { _id: Types.ObjectId; reported: number; valid: number; accredited: number; submissionId: Types.ObjectId; status: string }) => [String(r._id), r]),
  );
  const puMap = new Map(puAgg.map((r) => [String(r._id), r]));

  const areas: AreaRow[] = children.map((loc) => {
    const id = String(loc._id);
    const standings = (areaParty.get(id) ?? []).sort((a, b) => b.votes - a.votes);
    const top = standings[0];
    const topParty = top && top.votes > 0 ? partyMap.get(top.party) : undefined;
    const a = areaAgg.get(id);
    const units = puMap.get(id);
    return {
      id,
      name: loc.code ? `${loc.name} (${loc.code})` : loc.name,
      level: childLevel,
      totalUnits: childLevel === "pu" ? 1 : units?.units ?? 0,
      reportedUnits: a?.reported ?? 0,
      registeredVoters: childLevel === "pu" ? loc.registeredVoters ?? 0 : units?.registered ?? 0,
      accreditedVoters: a?.accredited ?? 0,
      totalValidVotes: a?.valid ?? 0,
      leader: topParty ? { code: topParty.code, color: topParty.color, votes: top.votes } : null,
      margin: top ? top.votes - (standings[1]?.votes ?? 0) : 0,
      submissionId: childLevel === "pu" && a ? String(a.submissionId) : undefined,
      status: childLevel === "pu" ? a?.status : undefined,
    };
  });

  // Feed: resolve names in one round trip each.
  const locIds = new Set<string>();
  feedDocs.forEach((d) => [d.pollingUnitId, d.lgaId, d.wardId].forEach((x) => locIds.add(String(x))));
  const [feedLocs, feedAgents] = await Promise.all([
    Location.find({ ...base, _id: { $in: [...locIds] } }, { name: 1 }).lean(),
    Agent.find({ ...base, _id: { $in: feedDocs.map((d) => d.agentId) } }, { name: 1 }).lean(),
  ]);
  const locName = new Map(feedLocs.map((l) => [String(l._id), l.name]));
  const agentName = new Map(feedAgents.map((a) => [String(a._id), a.name]));

  const feed = feedDocs.map((d) => {
    const best = [...(d.scores ?? [])].sort((a, b) => b.votes - a.votes)[0];
    const wp = best && best.votes > 0 ? partyMap.get(String(best.partyId)) : undefined;
    return {
      id: String(d._id),
      puName: locName.get(String(d.pollingUnitId)) ?? "—",
      lgaName: locName.get(String(d.lgaId)) ?? "—",
      wardName: locName.get(String(d.wardId)) ?? "—",
      agentName: agentName.get(String(d.agentId)) ?? "—",
      status: d.status ?? "submitted",
      flags: d.flags ?? [],
      hasComment: Boolean(d.comment),
      comment: d.comment ?? "",
      winner: wp ? { code: wp.code, color: wp.color } : null,
      totalValidVotes: d.totalValidVotes ?? 0,
      at: new Date(d.updatedAt as unknown as string).toISOString(),
    };
  });

  const totalUnits = puAgg.reduce((s, r) => s + r.units, 0);
  const registeredAll = puAgg.reduce((s, r) => s + r.registered, 0);
  const names = new Map(scopeNames.map((l) => [String(l._id), l.name]));

  return {
    updatedAt: new Date().toISOString(),
    scope: {
      lgaId: opts.lgaId ? String(opts.lgaId) : undefined,
      wardId: opts.wardId ? String(opts.wardId) : undefined,
      lgaName: opts.lgaId ? names.get(String(opts.lgaId)) : undefined,
      wardName: opts.wardId ? names.get(String(opts.wardId)) : undefined,
    },
    summary: {
      totalUnits,
      reportedUnits: totals.reported ?? 0,
      totalValidVotes: totalValid,
      rejectedVotes: totals.rejected ?? 0,
      accreditedVoters: totals.accredited ?? 0,
      registeredVotersReported: totals.registered ?? 0,
      registeredVotersAll: registeredAll,
      flagged: totals.flagged ?? 0,
      unverified: totals.unverified ?? 0,
      verified: totals.verified ?? 0,
      withComments: totals.withComments ?? 0,
    },
    parties: partyTotals,
    areas,
    timeline: (facet.timeline ?? []).map((r: { _id: Date; count: number }) => ({
      t: new Date(r._id).toISOString(),
      count: r.count,
    })),
    feed,
    agents: { total: agentStats[0], loggedIn: agentStats[1], submitted: totals.reported ?? 0 },
  };
}
