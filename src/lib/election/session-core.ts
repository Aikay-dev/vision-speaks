import { SignJWT, jwtVerify } from "jose";

/** Cookie + token helpers with no Next.js request APIs, so proxy.ts can use them too. */

export const SESSION_COOKIE = "vs_election";

export type Session = {
  role: "admin" | "agent";
  tenantId: string;
  /** Admin: login username. Agent: agent document id. */
  sub: string;
  name: string;
  /** Agent only: the election the agent belongs to. */
  electionId?: string;
};

export const SESSION_TTL = { admin: 60 * 60 * 12, agent: 60 * 60 * 24 } as const;

function secret() {
  const s = process.env.ELECTION_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("ELECTION_SESSION_SECRET must be set (32+ characters)");
  }
  return new TextEncoder().encode(s);
}

export async function signSession(session: Session) {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL[session.role]}s`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.role !== "admin" && payload.role !== "agent") return null;
    return {
      role: payload.role,
      tenantId: String(payload.tenantId),
      sub: String(payload.sub),
      name: String(payload.name),
      electionId: payload.electionId ? String(payload.electionId) : undefined,
    };
  } catch {
    return null;
  }
}
