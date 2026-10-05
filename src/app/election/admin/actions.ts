"use server";

import { revalidatePath } from "next/cache";
import type { Types } from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/election/db";
import { ELECTION_STATUSES, ELECTION_TYPES, Agent, Election, Location, Party, Submission } from "@/lib/election/models";
import { assertAdmin } from "@/lib/election/session";
import { scopeElection, toObjectId } from "@/lib/election/scoped";
import { getTenant, isReservedUsername } from "@/lib/election/tenants";
import { computeFlags, computeTotals } from "@/lib/election/flags";
import { generatePassword, hashPassword, slugify, USERNAME_RE } from "@/lib/election/credentials";
import NIGERIA from "@/data/nigeria-states-lgas.json";

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

function fail(error: unknown): { ok: false; error: string } {
  if (error instanceof z.ZodError) return { ok: false, error: error.issues[0]?.message ?? "Invalid input" };
  if (typeof error === "object" && error && "code" in error && (error as { code: number }).code === 11000) {
    const key = Object.keys((error as { keyPattern?: object }).keyPattern ?? {})[0];
    if (key === "username") return { ok: false, error: "That username is already taken." };
    if (key === "pollingUnitId") return { ok: false, error: "That polling unit already has an agent." };
    return { ok: false, error: "That entry already exists." };
  }
  return { ok: false, error: error instanceof Error ? error.message : "Something went wrong" };
}

function refresh(electionId: string) {
  revalidatePath(`/election/admin/${electionId}`, "layout");
}

const validLga = (state: string, lga: string) =>
  NIGERIA.find((s) => s.name === state)?.lgas.includes(lga) ?? false;

/* ───────────────────────── Elections ───────────────────────── */

const partyInput = z.object({
  code: z.string().trim().min(1).max(10).transform((s) => s.toUpperCase()),
  name: z.string().trim().min(1).max(80),
  candidateName: z.string().trim().max(80).default(""),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Party colour must be a hex value like #16A34A"),
  logo: z.string().max(200).default(""),
});

const createElectionInput = z.object({
  name: z.string().trim().min(3, "Give the election monitoring a name").max(100),
  type: z.enum(ELECTION_TYPES),
  date: z.string().optional(),
  description: z.string().trim().max(500).default(""),
  lgas: z.array(z.object({ state: z.string(), name: z.string() })).min(1, "Pick at least one LGA"),
  parties: z.array(partyInput).min(2, "Pick at least two parties"),
});

export async function createElection(input: z.input<typeof createElectionInput>): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await assertAdmin();
    const data = createElectionInput.parse(input);
    for (const l of data.lgas) if (!validLga(l.state, l.name)) throw new Error(`Unknown LGA: ${l.name}, ${l.state}`);
    await connectDB();

    const election = await Election.create({
      tenantId: session.tenantId,
      name: data.name,
      type: data.type,
      date: data.date ? new Date(data.date) : undefined,
      description: data.description,
      states: [...new Set(data.lgas.map((l) => l.state))],
    });
    const base = { tenantId: session.tenantId, electionId: election._id };
    await Promise.all([
      Location.insertMany(data.lgas.map((l) => ({ ...base, level: "lga", name: l.name, state: l.state }))),
      Party.insertMany(data.parties.map((p, i) => ({ ...base, ...p, order: i }))),
    ]);
    revalidatePath("/election/admin");
    return { ok: true, id: String(election._id) };
  } catch (e) {
    return fail(e);
  }
}

const detailsInput = z.object({
  name: z.string().trim().min(3).max(100),
  type: z.enum(ELECTION_TYPES),
  date: z.string().optional(),
  description: z.string().trim().max(500).default(""),
});

export async function updateElectionDetails(electionId: string, input: z.input<typeof detailsInput>): Promise<ActionResult> {
  try {
    const session = await assertAdmin();
    const data = detailsInput.parse(input);
    const { base } = await scopeElection(session.tenantId, electionId);
    await Election.updateOne(
      { _id: base.electionId, tenantId: base.tenantId },
      { $set: { ...data, date: data.date ? new Date(data.date) : null } },
    );
    refresh(electionId);
    revalidatePath("/election/admin");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function setElectionStatus(electionId: string, status: (typeof ELECTION_STATUSES)[number]): Promise<ActionResult> {
  try {
    const session = await assertAdmin();
    z.enum(ELECTION_STATUSES).parse(status);
    const { base } = await scopeElection(session.tenantId, electionId);
    await Election.updateOne({ _id: base.electionId, tenantId: base.tenantId }, { $set: { status } });
    refresh(electionId);
    revalidatePath("/election/admin");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteElection(electionId: string, confirmName: string): Promise<ActionResult> {
  try {
    const session = await assertAdmin();
    const { election, base } = await scopeElection(session.tenantId, electionId);
    if (confirmName.trim() !== election.name) throw new Error("The name you typed doesn't match.");
    await Promise.all([
      Submission.deleteMany(base),
      Agent.deleteMany(base),
      Location.deleteMany(base),
      Party.deleteMany(base),
    ]);
    await Election.deleteOne({ _id: base.electionId, tenantId: base.tenantId });
    revalidatePath("/election/admin");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/* ───────────────────────── Parties ───────────────────────── */

export async function saveParties(electionId: string, input: z.input<typeof partyInput>[]): Promise<ActionResult> {
  try {
    const session = await assertAdmin();
    const parties = z.array(partyInput).min(2, "Keep at least two parties").parse(input);
    const codes = parties.map((p) => p.code);
    if (new Set(codes).size !== codes.length) throw new Error("Each party code can only appear once.");
    const { base } = await scopeElection(session.tenantId, electionId);

    const existing = await Party.find(base).lean();
    const removed = existing.filter((p) => !codes.includes(p.code));
    if (removed.length) {
      const used = await Submission.exists({ ...base, "scores.partyId": { $in: removed.map((p) => p._id) } });
      if (used) throw new Error("A removed party already has votes recorded. It can't be removed now.");
      await Party.deleteMany({ ...base, _id: { $in: removed.map((p) => p._id) } });
    }
    await Party.bulkWrite(
      parties.map((p, i) => ({
        updateOne: {
          filter: { ...base, code: p.code },
          update: { $set: { ...p, order: i }, $setOnInsert: base },
          upsert: true,
        },
      })),
    );
    refresh(electionId);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/* ───────────────────────── Locations ───────────────────────── */

export async function addLgas(electionId: string, lgas: { state: string; name: string }[]): Promise<ActionResult<{ added: number }>> {
  try {
    const session = await assertAdmin();
    const { base } = await scopeElection(session.tenantId, electionId);
    const existing = await Location.find({ ...base, level: "lga" }, { name: 1, state: 1 }).lean();
    const have = new Set(existing.map((l) => `${l.state}|${l.name}`));
    const fresh = lgas.filter((l) => validLga(l.state, l.name) && !have.has(`${l.state}|${l.name}`));
    if (fresh.length) {
      await Location.insertMany(fresh.map((l) => ({ ...base, level: "lga", name: l.name, state: l.state })));
      await Election.updateOne({ _id: base.electionId }, { $addToSet: { states: { $each: fresh.map((l) => l.state) } } });
    }
    refresh(electionId);
    return { ok: true, added: fresh.length };
  } catch (e) {
    return fail(e);
  }
}

const nameInput = z.string().trim().min(1, "Name is required").max(100);
const codeInput = z.string().trim().max(30).default("");
const votersInput = z.coerce.number().int().min(0).max(100000).default(0);

export async function addWard(electionId: string, lgaId: string, input: { name: string; code?: string }): Promise<ActionResult> {
  try {
    const session = await assertAdmin();
    const { base } = await scopeElection(session.tenantId, electionId);
    const lga = await Location.findOne({ ...base, _id: toObjectId(lgaId), level: "lga" }).lean();
    if (!lga) throw new Error("LGA not found");
    await Location.create({
      ...base,
      level: "ward",
      name: nameInput.parse(input.name),
      code: codeInput.parse(input.code),
      state: lga.state,
      lgaId: lga._id,
    });
    refresh(electionId);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function addPollingUnit(
  electionId: string,
  wardId: string,
  input: { name: string; code?: string; registeredVoters?: number | string },
): Promise<ActionResult> {
  try {
    const session = await assertAdmin();
    const { base } = await scopeElection(session.tenantId, electionId);
    const ward = await Location.findOne({ ...base, _id: toObjectId(wardId), level: "ward" }).lean();
    if (!ward) throw new Error("Ward not found");
    await Location.create({
      ...base,
      level: "pu",
      name: nameInput.parse(input.name),
      code: codeInput.parse(input.code),
      registeredVoters: votersInput.parse(input.registeredVoters ?? 0),
      state: ward.state,
      lgaId: ward.lgaId,
      wardId: ward._id,
    });
    refresh(electionId);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateLocation(
  electionId: string,
  id: string,
  input: { name?: string; code?: string; registeredVoters?: number | string },
): Promise<ActionResult> {
  try {
    const session = await assertAdmin();
    const { base } = await scopeElection(session.tenantId, electionId);
    const loc = await Location.findOne({ ...base, _id: toObjectId(id) }).lean();
    if (!loc) throw new Error("Location not found");
    const set: Record<string, unknown> = {};
    if (input.name !== undefined && loc.level !== "lga") set.name = nameInput.parse(input.name);
    if (input.code !== undefined) set.code = codeInput.parse(input.code);
    if (input.registeredVoters !== undefined && loc.level === "pu") set.registeredVoters = votersInput.parse(input.registeredVoters);
    await Location.updateOne({ _id: loc._id }, { $set: set });
    refresh(electionId);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteLocation(electionId: string, id: string): Promise<ActionResult> {
  try {
    const session = await assertAdmin();
    const { base } = await scopeElection(session.tenantId, electionId);
    const loc = await Location.findOne({ ...base, _id: toObjectId(id) }).lean();
    if (!loc) throw new Error("Location not found");
    const childKey = loc.level === "lga" ? "lgaId" : loc.level === "ward" ? "wardId" : "pollingUnitId";
    if (loc.level !== "pu" && (await Location.exists({ ...base, [childKey]: loc._id }))) {
      throw new Error(`Remove the ${loc.level === "lga" ? "wards" : "polling units"} inside it first.`);
    }
    if (await Agent.exists({ ...base, [childKey]: loc._id })) throw new Error("An agent is assigned here. Remove the agent first.");
    if (await Submission.exists({ ...base, [childKey]: loc._id })) throw new Error("Results have already been submitted here.");
    await Location.deleteOne({ _id: loc._id });
    refresh(electionId);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

const importRow = z.object({
  state: z.string().trim().min(1),
  lga: z.string().trim().min(1),
  ward: z.string().trim().min(1),
  ward_code: z.string().trim().optional().default(""),
  pu_code: z.string().trim().optional().default(""),
  pu_name: z.string().trim().min(1),
  registered_voters: z.coerce.number().int().min(0).optional().default(0),
});

/** CSV import: creates missing LGAs/wards, then PUs. Skips PUs that already exist (same ward + name/code). */
export async function importLocations(
  electionId: string,
  rows: Record<string, string>[],
): Promise<ActionResult<{ created: { lgas: number; wards: number; pus: number }; skipped: number; errors: string[] }>> {
  try {
    const session = await assertAdmin();
    if (rows.length > 20000) throw new Error("Import at most 20,000 rows at a time.");
    const { base } = await scopeElection(session.tenantId, electionId);
    const errors: string[] = [];
    const created = { lgas: 0, wards: 0, pus: 0 };
    let skipped = 0;

    const all = await Location.find(base).lean();
    const lgaKey = new Map(all.filter((l) => l.level === "lga").map((l) => [`${l.state}|${l.name}`.toLowerCase(), l._id]));
    const wardKey = new Map(all.filter((l) => l.level === "ward").map((l) => [`${l.lgaId}|${l.name}`.toLowerCase(), l._id]));
    const puKey = new Set(all.filter((l) => l.level === "pu").map((l) => `${l.wardId}|${(l.code || l.name)}`.toLowerCase()));
    const pus: object[] = [];

    for (const [i, raw] of rows.entries()) {
      const parsed = importRow.safeParse(raw);
      if (!parsed.success) {
        errors.push(`Row ${i + 2}: ${parsed.error.issues[0]?.path.join(".")} ${parsed.error.issues[0]?.message}`);
        continue;
      }
      const r = parsed.data;
      const state = NIGERIA.find((s) => s.name.toLowerCase() === r.state.toLowerCase());
      const lgaName = state?.lgas.find((l) => l.toLowerCase() === r.lga.toLowerCase());
      if (!state || !lgaName) {
        errors.push(`Row ${i + 2}: "${r.lga}, ${r.state}" isn't a recognised LGA/state`);
        continue;
      }
      let lgaId = lgaKey.get(`${state.name}|${lgaName}`.toLowerCase());
      if (!lgaId) {
        const doc = await Location.create({ ...base, level: "lga", name: lgaName, state: state.name });
        lgaId = doc._id;
        lgaKey.set(`${state.name}|${lgaName}`.toLowerCase(), lgaId);
        await Election.updateOne({ _id: base.electionId }, { $addToSet: { states: state.name } });
        created.lgas++;
      }
      let wardId = wardKey.get(`${lgaId}|${r.ward}`.toLowerCase());
      if (!wardId) {
        const doc = await Location.create({ ...base, level: "ward", name: r.ward, code: r.ward_code, state: state.name, lgaId });
        wardId = doc._id;
        wardKey.set(`${lgaId}|${r.ward}`.toLowerCase(), wardId);
        created.wards++;
      }
      const k = `${wardId}|${r.pu_code || r.pu_name}`.toLowerCase();
      if (puKey.has(k)) {
        skipped++;
        continue;
      }
      puKey.add(k);
      pus.push({ ...base, level: "pu", name: r.pu_name, code: r.pu_code, registeredVoters: r.registered_voters, state: state.name, lgaId, wardId });
    }
    if (pus.length) await Location.insertMany(pus);
    created.pus = pus.length;
    refresh(electionId);
    return { ok: true, created, skipped, errors: errors.slice(0, 50) };
  } catch (e) {
    return fail(e);
  }
}

/* ───────────────────────── Agents ───────────────────────── */

const agentInput = z.object({
  name: z.string().trim().min(2, "Enter the agent's name").max(80),
  phone: z.string().trim().max(20).default(""),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(USERNAME_RE, "Username: 3–40 characters, letters, numbers, dots, dashes"),
  pollingUnitId: z.string().min(1, "Choose a polling unit"),
});

async function loadPu(base: { tenantId: string; electionId: Types.ObjectId }, puId: string) {
  const pu = await Location.findOne({ ...base, _id: toObjectId(puId), level: "pu" }).lean();
  if (!pu) throw new Error("Polling unit not found");
  return pu;
}

export async function createAgent(
  electionId: string,
  input: z.input<typeof agentInput>,
): Promise<ActionResult<{ username: string; password: string }>> {
  try {
    const session = await assertAdmin();
    const data = agentInput.parse(input);
    if (isReservedUsername(data.username)) throw new Error("That username is already taken.");
    const { base } = await scopeElection(session.tenantId, electionId);
    const pu = await loadPu(base, data.pollingUnitId);
    const password = generatePassword();
    await Agent.create({
      ...base,
      name: data.name,
      phone: data.phone,
      username: data.username,
      passwordHash: await hashPassword(password),
      pollingUnitId: pu._id,
      wardId: pu.wardId,
      lgaId: pu.lgaId,
    });
    refresh(electionId);
    return { ok: true, username: data.username, password };
  } catch (e) {
    return fail(e);
  }
}

export async function updateAgent(
  electionId: string,
  agentId: string,
  input: { name: string; phone: string; pollingUnitId: string },
): Promise<ActionResult> {
  try {
    const session = await assertAdmin();
    const { base } = await scopeElection(session.tenantId, electionId);
    const agent = await Agent.findOne({ ...base, _id: toObjectId(agentId) }).lean();
    if (!agent) throw new Error("Agent not found");
    const set: Record<string, unknown> = {
      name: z.string().trim().min(2).max(80).parse(input.name),
      phone: z.string().trim().max(20).parse(input.phone ?? ""),
    };
    if (input.pollingUnitId && input.pollingUnitId !== String(agent.pollingUnitId)) {
      if (await Submission.exists({ ...base, agentId: agent._id })) {
        throw new Error("This agent has already submitted a result, so their polling unit can't change.");
      }
      const pu = await loadPu(base, input.pollingUnitId);
      Object.assign(set, { pollingUnitId: pu._id, wardId: pu.wardId, lgaId: pu.lgaId });
    }
    await Agent.updateOne({ _id: agent._id }, { $set: set });
    refresh(electionId);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function resetAgentPassword(electionId: string, agentId: string): Promise<ActionResult<{ username: string; password: string }>> {
  try {
    const session = await assertAdmin();
    const { base } = await scopeElection(session.tenantId, electionId);
    const agent = await Agent.findOne({ ...base, _id: toObjectId(agentId) }).lean();
    if (!agent) throw new Error("Agent not found");
    const password = generatePassword();
    await Agent.updateOne({ _id: agent._id }, { $set: { passwordHash: await hashPassword(password) } });
    return { ok: true, username: agent.username, password };
  } catch (e) {
    return fail(e);
  }
}

export async function setAgentActive(electionId: string, agentId: string, active: boolean): Promise<ActionResult> {
  try {
    const session = await assertAdmin();
    const { base } = await scopeElection(session.tenantId, electionId);
    await Agent.updateOne({ ...base, _id: toObjectId(agentId) }, { $set: { active } });
    refresh(electionId);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteAgent(electionId: string, agentId: string): Promise<ActionResult> {
  try {
    const session = await assertAdmin();
    const { base } = await scopeElection(session.tenantId, electionId);
    const id = toObjectId(agentId);
    if (await Submission.exists({ ...base, agentId: id })) {
      throw new Error("This agent has submitted a result. Deactivate them instead, so the record stays intact.");
    }
    await Agent.deleteOne({ ...base, _id: id });
    refresh(electionId);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** CSV columns: name, phone, pu_code. Usernames are generated from the tenant prefix + PU code. */
export async function importAgents(
  electionId: string,
  rows: Record<string, string>[],
): Promise<ActionResult<{ credentials: { name: string; phone: string; pu: string; username: string; password: string }[]; errors: string[] }>> {
  try {
    const session = await assertAdmin();
    if (rows.length > 5000) throw new Error("Import at most 5,000 agents at a time.");
    const tenant = getTenant(session.tenantId)!;
    const { base } = await scopeElection(session.tenantId, electionId);
    const pus = await Location.find({ ...base, level: "pu" }).lean();
    const byCode = new Map(pus.filter((p) => p.code).map((p) => [p.code.toLowerCase(), p]));
    const taken = new Set((await Agent.find(base, { pollingUnitId: 1 }).lean()).map((a) => String(a.pollingUnitId)));
    const credentials = [];
    const errors: string[] = [];

    for (const [i, r] of rows.entries()) {
      const name = (r.name ?? "").trim();
      const pu = byCode.get((r.pu_code ?? "").trim().toLowerCase());
      if (name.length < 2) { errors.push(`Row ${i + 2}: missing name`); continue; }
      if (!pu) { errors.push(`Row ${i + 2}: polling unit code "${r.pu_code}" not found`); continue; }
      if (taken.has(String(pu._id))) { errors.push(`Row ${i + 2}: ${pu.name} already has an agent`); continue; }

      let username = `${tenant.id}-${slugify(pu.code || pu.name)}`;
      for (let n = 2; (await Agent.exists({ username })) || isReservedUsername(username); n++) {
        username = `${tenant.id}-${slugify(pu.code || pu.name)}-${n}`;
      }
      const password = generatePassword();
      try {
        await Agent.create({
          ...base, name, phone: (r.phone ?? "").trim(), username,
          passwordHash: await hashPassword(password),
          pollingUnitId: pu._id, wardId: pu.wardId, lgaId: pu.lgaId,
        });
        taken.add(String(pu._id));
        credentials.push({ name, phone: (r.phone ?? "").trim(), pu: pu.code ? `${pu.name} (${pu.code})` : pu.name, username, password });
      } catch (e) {
        errors.push(`Row ${i + 2}: ${fail(e).error}`);
      }
    }
    refresh(electionId);
    return { ok: true, credentials, errors: errors.slice(0, 50) };
  } catch (e) {
    return fail(e);
  }
}

/* ───────────────────────── Submissions ───────────────────────── */

const correctionInput = z.object({
  scores: z.array(z.object({ partyId: z.string(), votes: z.coerce.number().int().min(0).max(100000) })),
  accreditedVoters: z.coerce.number().int().min(0).max(100000),
  rejectedVotes: z.coerce.number().int().min(0).max(100000),
  reason: z.string().trim().min(3, "Give a reason for the correction").max(300),
});

export async function correctSubmission(
  electionId: string,
  submissionId: string,
  input: z.input<typeof correctionInput>,
): Promise<ActionResult> {
  try {
    const session = await assertAdmin();
    const data = correctionInput.parse(input);
    const { base } = await scopeElection(session.tenantId, electionId);
    const sub = await Submission.findOne({ ...base, _id: toObjectId(submissionId) });
    if (!sub) throw new Error("Submission not found");
    const parties = await Party.find(base).lean();
    const partyIds = new Set(parties.map((p) => String(p._id)));
    const code = new Map(parties.map((p) => [String(p._id), p.code]));
    if (data.scores.some((s) => !partyIds.has(s.partyId))) throw new Error("Unknown party in scores");

    const changes: { field: string; from: unknown; to: unknown }[] = [];
    const before = new Map(sub.scores.map((s) => [String(s.partyId), s.votes]));
    for (const s of data.scores) {
      const prev = before.get(s.partyId) ?? 0;
      if (prev !== s.votes) changes.push({ field: code.get(s.partyId) ?? s.partyId, from: prev, to: s.votes });
    }
    if (sub.accreditedVoters !== data.accreditedVoters) changes.push({ field: "Accredited voters", from: sub.accreditedVoters, to: data.accreditedVoters });
    if (sub.rejectedVotes !== data.rejectedVotes) changes.push({ field: "Rejected votes", from: sub.rejectedVotes, to: data.rejectedVotes });
    if (!changes.length) throw new Error("Nothing changed.");

    const votes = data.scores.map((s) => s.votes);
    const totals = computeTotals({ votes, rejectedVotes: data.rejectedVotes });
    sub.set({
      scores: data.scores.map((s) => ({ partyId: toObjectId(s.partyId), votes: s.votes })),
      accreditedVoters: data.accreditedVoters,
      rejectedVotes: data.rejectedVotes,
      ...totals,
      flags: computeFlags({ votes, registeredVoters: sub.registeredVoters ?? 0, accreditedVoters: data.accreditedVoters, rejectedVotes: data.rejectedVotes, imageCount: sub.images.length }),
    });
    sub.history.push({ at: new Date(), by: { role: "admin", id: session.sub, name: session.name }, action: "corrected", changes, reason: data.reason });
    await sub.save();
    refresh(electionId);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function setSubmissionStatus(
  electionId: string,
  submissionId: string,
  status: "verified" | "flagged" | "submitted",
  reason = "",
): Promise<ActionResult> {
  try {
    const session = await assertAdmin();
    z.enum(["verified", "flagged", "submitted"]).parse(status);
    if (status === "flagged" && reason.trim().length < 3) throw new Error("Say why you're flagging it, so the agent knows what to check.");
    const { base } = await scopeElection(session.tenantId, electionId);
    const sub = await Submission.findOne({ ...base, _id: toObjectId(submissionId) });
    if (!sub) throw new Error("Submission not found");
    const action = status === "verified" ? "verified" : status === "flagged" ? "flagged" : "unverified";
    sub.status = status;
    sub.history.push({ at: new Date(), by: { role: "admin", id: session.sub, name: session.name }, action, changes: [], reason: reason.trim() });
    await sub.save();
    refresh(electionId);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
