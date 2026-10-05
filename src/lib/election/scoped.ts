import "server-only";
import { isValidObjectId, Types } from "mongoose";
import { notFound } from "next/navigation";
import { connectDB } from "./db";
import { Election } from "./models";

export function toObjectId(id: string | undefined | null) {
  if (!id || !isValidObjectId(id)) return null;
  return new Types.ObjectId(id);
}

/**
 * Loads an election only if it belongs to the tenant. This is the gate every
 * election-scoped page and action goes through — tenantId always comes from
 * the session, never from the client.
 */
export async function findTenantElection(tenantId: string, electionId: string) {
  const _id = toObjectId(electionId);
  if (!_id) return null;
  await connectDB();
  return Election.findOne({ _id, tenantId }).lean();
}

/** Page variant: 404s instead of returning null. */
export async function getTenantElectionOr404(tenantId: string, electionId: string) {
  const election = await findTenantElection(tenantId, electionId);
  if (!election) notFound();
  return election;
}

/** Action variant: throws. Returns the election and a ready-made base filter. */
export async function scopeElection(tenantId: string, electionId: string) {
  const election = await findTenantElection(tenantId, electionId);
  if (!election) throw new Error("Election not found");
  return { election, base: { tenantId, electionId: election._id } };
}
