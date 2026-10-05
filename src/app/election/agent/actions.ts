"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectDB } from "@/lib/election/db";
import { Agent, Election, Location, Party, Submission } from "@/lib/election/models";
import { assertAgent } from "@/lib/election/session";
import { computeFlags, computeTotals } from "@/lib/election/flags";
import { getBackendClient } from "@/lib/edgestore-server";

const input = z.object({
  clientSubmissionId: z.string().min(8).max(64),
  scores: z.array(z.object({ partyId: z.string(), votes: z.coerce.number().int().min(0).max(100000) })).min(1),
  accreditedVoters: z.coerce.number().int().min(0).max(100000),
  rejectedVotes: z.coerce.number().int().min(0).max(100000),
  images: z
    .array(z.object({ url: z.string().url(), thumbnailUrl: z.string().nullable().optional(), size: z.number().optional() }))
    .min(1, "Add a photo of the result sheet")
    .max(4),
  comment: z.string().trim().max(1000).default(""),
  geo: z.object({ lat: z.number(), lng: z.number(), accuracy: z.number() }).nullable().optional(),
});

export type SubmitResult = { ok: true; status: string } | { ok: false; error: string };

const isEdgeStoreUrl = (u: string) => {
  try {
    const host = new URL(u).hostname;
    // Newer EdgeStore projects serve files from <project>.esfiles.dev; older ones from files.edgestore.dev.
    return ["edgestore.dev", "esfiles.dev"].some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
};

export async function submitResult(raw: z.input<typeof input>): Promise<SubmitResult> {
  try {
    const session = await assertAgent();
    const data = input.parse(raw);
    await connectDB();

    const agent = await Agent.findOne({ _id: session.sub, tenantId: session.tenantId, electionId: session.electionId }).lean();
    if (!agent || !agent.active) return { ok: false, error: "Your account is not active. Contact your coordinator." };
    const base = { tenantId: agent.tenantId, electionId: agent.electionId };

    const [election, pu, parties, existing] = await Promise.all([
      Election.findOne({ _id: agent.electionId, tenantId: agent.tenantId }).lean(),
      Location.findOne({ ...base, _id: agent.pollingUnitId, level: "pu" }).lean(),
      Party.find(base).lean(),
      Submission.findOne({ ...base, pollingUnitId: agent.pollingUnitId }),
    ]);
    if (!election || !pu) return { ok: false, error: "Your polling unit could not be found. Contact your coordinator." };
    if (election.status === "setup") return { ok: false, error: "Result submission hasn't opened yet. Your coordinator will open it on election day." };
    if (election.status === "closed") return { ok: false, error: "Result submission has closed for this election." };
    if (existing?.status === "verified") return { ok: false, error: "Your coordinator has verified this result, so it can no longer be changed." };

    // Every party on the ballot must have a score, and nothing else.
    const partyIds = new Set(parties.map((p) => String(p._id)));
    const given = new Map(data.scores.map((s) => [s.partyId, s.votes]));
    if (given.size !== partyIds.size || [...given.keys()].some((id) => !partyIds.has(id))) {
      return { ok: false, error: "The party list has changed. Refresh the page and enter the scores again." };
    }
    const badImage = data.images.find((i) => !isEdgeStoreUrl(i.url));
    if (badImage) {
      console.warn("[election] submit rejected, photo URL not on an EdgeStore host:", badImage.url.slice(0, 120));
      return { ok: false, error: "Invalid photo. Please upload it again." };
    }

    const votes = parties.map((p) => given.get(String(p._id)) ?? 0);
    const totals = computeTotals({ votes, rejectedVotes: data.rejectedVotes });
    const flags = computeFlags({
      votes,
      registeredVoters: pu.registeredVoters ?? 0,
      accreditedVoters: data.accreditedVoters,
      rejectedVotes: data.rejectedVotes,
      imageCount: data.images.length,
    });
    const status: "flagged" | "submitted" = flags.length ? "flagged" : "submitted";

    const fields = {
      scores: parties.map((p) => ({ partyId: p._id, votes: given.get(String(p._id)) ?? 0 })),
      registeredVoters: pu.registeredVoters ?? 0,
      accreditedVoters: data.accreditedVoters,
      rejectedVotes: data.rejectedVotes,
      ...totals,
      images: data.images.map((i) => ({ url: i.url, thumbnailUrl: i.thumbnailUrl ?? "", size: i.size ?? 0 })),
      comment: data.comment,
      geo: data.geo ?? undefined,
      status,
      flags,
      agentId: agent._id,
    };
    const entry = {
      at: new Date(),
      by: { role: "agent", id: String(agent._id), name: agent.name },
      action: existing ? "resubmitted" : "submitted",
      changes: [],
      reason: "",
      clientSubmissionId: data.clientSubmissionId,
    };

    const newUrls = data.images.map((i) => i.url).filter((u) => !existing?.images.some((e) => e.url === u));

    if (existing) {
      // A retried request (same client id) shouldn't add a second history entry.
      const isRetry = existing.history.at(-1)?.clientSubmissionId === data.clientSubmissionId;
      existing.set(fields);
      if (!isRetry) existing.history.push(entry);
      await existing.save();
    } else {
      try {
        await Submission.create({
          ...base,
          pollingUnitId: pu._id,
          wardId: pu.wardId,
          lgaId: pu.lgaId,
          ...fields,
          history: [entry],
          submittedAt: new Date(),
        });
      } catch (e) {
        // Two near-simultaneous first submits: the unique index catches the second.
        if ((e as { code?: number }).code === 11000) return submitResult(raw);
        throw e;
      }
    }

    // Uploads start as temporary; keep them now that the result is saved.
    if (newUrls.length) {
      try {
        await getBackendClient().resultSheets.confirmMany({ refs: newUrls.map((url) => ({ url })) });
      } catch (e) {
        console.error("[election] confirming result-sheet uploads failed", e);
      }
    }

    revalidatePath("/election/agent");
    return { ok: true, status };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0]?.message ?? "Check your entries" };
    console.error("[election] submitResult", e);
    return { ok: false, error: e instanceof Error && e.message === "Not authorised" ? "Your session has expired. Sign in again." : "Couldn't save. Check your connection and try again." };
  }
}
